import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { apiKeys, npcProfiles, dialogueRequests, paymentReceipts, conversationHistory } from "@/db/schema";
import { eq, and } from "@/db";
import crypto from "crypto";
import { createX402Challenge, verifySignatureAndSettle, X402Challenge } from "@/lib/x402";
import { generateDialogue } from "@/lib/llm";

// Helper to hash incoming API key
function hashApiKey(key: string): string {
  return crypto.createHash("sha256").update(key).digest("hex");
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { status: "error", errorCode: "UNAUTHORIZED", message: "Missing or invalid API key" },
        { status: 401 }
      );
    }

    const apiKeyRaw = authHeader.substring(7);
    const keyHash = hashApiKey(apiKeyRaw);

    // 1. Resolve project from API key
    const activeKey = await db.query.apiKeys.findFirst({
      where: and(eq(apiKeys.keyHash, keyHash), eq(apiKeys.isActive, true)),
      with: {
        project: true,
      },
    });

    if (!activeKey) {
      return NextResponse.json(
        { status: "error", errorCode: "UNAUTHORIZED", message: "API key is invalid or inactive" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { npcId, context, playerState, requestId, signature, transactionHash } = body;

    // --- PHASE 2: Settle Phase (Retry / Payment Verification) ---
    if (requestId && signature) {
      // Find existing dialogue request
      const dialogueReq = await db.query.dialogueRequests.findFirst({
        where: eq(dialogueRequests.id, requestId),
        with: {
          npcProfile: true,
        },
      });

      if (!dialogueReq) {
        return NextResponse.json(
          { status: "error", errorCode: "NOT_FOUND", message: "Dialogue request not found" },
          { status: 404 }
        );
      }

      if (dialogueReq.status === "PAID_COMPLETED") {
        return NextResponse.json(
          { status: "error", errorCode: "ALREADY_PAID", message: "This dialogue request has already been settled" },
          { status: 400 }
        );
      }

      // Reconstruct challenge to verify signature
      const challengePayload = dialogueReq.rawRequest as unknown as { challenge: X402Challenge };
      if (!challengePayload?.challenge) {
        return NextResponse.json(
          { status: "error", errorCode: "INVALID_CHALLENGE", message: "Invalid challenge data stored" },
          { status: 400 }
        );
      }

      try {
        // Verify signature and settle payment
        const settlement = await verifySignatureAndSettle(challengePayload.challenge, signature, transactionHash);

        // Store payment receipt
        const [receipt] = await db.insert(paymentReceipts).values({
          requestId: dialogueReq.id,
          transactionHash: settlement.transactionHash,
          paymentStatus: settlement.status,
          signature,
          payload: {
            amount: settlement.amount,
            token: settlement.token,
            payerAddress: settlement.payerAddress,
          },
        }).returning();

        // Call Gemini to generate dynamic NPC dialogue
        const npc = dialogueReq.npcProfile;
        const playerAddress = settlement.payerAddress;

        // Fetch conversation history
        let historyRecord = await db.query.conversationHistory.findFirst({
          where: and(
            eq(conversationHistory.npcId, npc.id),
            eq(conversationHistory.playerAddress, playerAddress)
          ),
        });

        const historyMessages = historyRecord ? (historyRecord.messages as any[]) : [];

        const dialogueOptions = await generateDialogue({
          npcName: npc.name,
          backstory: npc.backstory,
          tone: npc.tone,
          style: npc.style || undefined,
          safetyRules: npc.safetyRules || undefined,
          context: (dialogueReq.rawRequest as any).context || "",
          playerState: (dialogueReq.rawRequest as any).playerState || {},
          history: historyMessages.map(m => ({ role: m.role, text: m.text })),
        });

        // Append player context and NPC first response to history
        const newMessages = [
          ...historyMessages,
          { role: "user", text: (dialogueReq.rawRequest as any).context || "" },
          { role: "model", text: dialogueOptions[0]?.text || "" }
        ];

        // Store or update conversation history
        if (historyRecord) {
          await db.update(conversationHistory)
            .set({
              messages: newMessages,
              updatedAt: new Date(),
            })
            .where(eq(conversationHistory.id, historyRecord.id));
        } else {
          await db.insert(conversationHistory).values({
            projectId: dialogueReq.projectId,
            npcId: npc.id,
            playerAddress,
            messages: newMessages,
          });
        }

        // Update dialogue request status and response
        await db.update(dialogueRequests)
          .set({
            status: "PAID_COMPLETED",
            rawResponse: { dialogue: dialogueOptions },
            updatedAt: new Date(),
          })
          .where(eq(dialogueRequests.id, dialogueReq.id));

        return NextResponse.json({
          status: "success",
          dialogue: dialogueOptions,
          receipt: {
            id: receipt.id,
            transactionHash: receipt.transactionHash,
            amount: settlement.amount,
            token: settlement.token,
            payerAddress: settlement.payerAddress,
            createdAt: receipt.createdAt,
          },
        });
      } catch (err: any) {
        // Mark as failed
        await db.update(dialogueRequests)
          .set({
            status: "FAILED",
            updatedAt: new Date(),
          })
          .where(eq(dialogueRequests.id, dialogueReq.id));

        return NextResponse.json(
          { status: "error", errorCode: "PAYMENT_FAILED", message: err.message || "Payment settlement failed" },
          { status: 400 }
        );
      }
    }

    // --- PHASE 1: Challenge Phase (Initial Request) ---
    if (!npcId || !context) {
      return NextResponse.json(
        { status: "error", errorCode: "BAD_REQUEST", message: "Missing npcId or context parameter" },
        { status: 400 }
      );
    }

    // Verify NPC profile belongs to this project
    const npc = await db.query.npcProfiles.findFirst({
      where: and(eq(npcProfiles.id, npcId), eq(npcProfiles.projectId, activeKey.projectId), eq(npcProfiles.isDeleted, false)),
    });

    if (!npc) {
      return NextResponse.json(
        { status: "error", errorCode: "NOT_FOUND", message: "NPC profile not found for this project" },
        { status: 404 }
      );
    }

    // Create a new dialogue request entry
    const cost = "0.0100"; // default flat cost per call
    const [newRequest] = await db.insert(dialogueRequests).values({
      projectId: activeKey.projectId,
      npcId: npc.id,
      status: "CHALLENGE_ISSUED",
      cost,
      rawRequest: { context, playerState: playerState || {} },
    }).returning();

    // Generate x402 challenge
    const challenge = createX402Challenge(newRequest.id, cost);

    // Save challenge inside dialogue request payload
    await db.update(dialogueRequests)
      .set({
        rawRequest: { context, playerState: playerState || {}, challenge },
      })
      .where(eq(dialogueRequests.id, newRequest.id));

    // Return the payment challenge with HTTP 402 or status parameter
    return NextResponse.json(
      {
        status: "payment_required",
        requestId: newRequest.id,
        challenge,
      },
      { status: 402 } // Payment Required
    );

  } catch (error: any) {
    console.error("Dialogue API handler error:", error);
    return NextResponse.json(
      { status: "error", errorCode: "INTERNAL_ERROR", message: "Internal server error" },
      { status: 500 }
    );
  }
}
