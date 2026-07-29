import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { dialogueRequests } from "@/db/schema";
import { eq, and } from "@/db";
import { cookies } from "next/headers";
import { getSessionUser } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const cookieStore = await cookies();
    const projectId = cookieStore.get("projectId")?.value;

    if (!projectId) {
      return NextResponse.json({ status: "error", message: "No active project" }, { status: 400 });
    }

    const log = await db.query.dialogueRequests.findFirst({
      where: and(eq(dialogueRequests.id, id), eq(dialogueRequests.projectId, projectId)),
      with: {
        npcProfile: true,
        paymentReceipts: true,
      },
    });

    if (!log) {
      return NextResponse.json({ status: "error", message: "Log entry not found" }, { status: 404 });
    }

    return NextResponse.json({
      status: "success",
      log: {
        id: log.id,
        npc: {
          id: log.npcProfile?.id,
          name: log.npcProfile?.name,
          tone: log.npcProfile?.tone,
        },
        status: log.status,
        cost: log.cost,
        rawRequest: log.rawRequest,
        rawResponse: log.rawResponse,
        createdAt: log.createdAt,
        updatedAt: log.updatedAt,
        receipt: log.paymentReceipts[0] ? {
          id: log.paymentReceipts[0].id,
          transactionHash: log.paymentReceipts[0].transactionHash,
          paymentStatus: log.paymentReceipts[0].paymentStatus,
          signature: log.paymentReceipts[0].signature,
          payload: log.paymentReceipts[0].payload,
          createdAt: log.paymentReceipts[0].createdAt,
        } : null,
      },
    });

  } catch (error: any) {
    console.error("GET /api/logs/[id] error:", error);
    return NextResponse.json({ status: "error", message: "Internal server error" }, { status: 500 });
  }
}
