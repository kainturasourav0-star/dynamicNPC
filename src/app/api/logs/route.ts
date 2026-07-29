import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { dialogueRequests } from "@/db/schema";
import { eq, desc } from "@/db";
import { cookies } from "next/headers";
import { getSessionUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 401 });
    }

    const cookieStore = await cookies();
    const projectId = cookieStore.get("projectId")?.value;

    if (!projectId) {
      return NextResponse.json({ status: "error", message: "No active project" }, { status: 400 });
    }

    const { searchParams } = new URL(req.url);
    const npcId = searchParams.get("npcId");
    const status = searchParams.get("status");

    // Retrieve dialogue requests
    const requests = await db.query.dialogueRequests.findMany({
      where: eq(dialogueRequests.projectId, projectId),
      with: {
        npcProfile: true,
        paymentReceipts: true,
      },
      orderBy: desc(dialogueRequests.createdAt),
      limit: 100, // safety limit
    });

    // Filter in JS if needed or query-level (simplifying query logic for hackathon)
    let filtered = requests;
    if (npcId) {
      filtered = filtered.filter((r: any) => r.npcId === npcId);
    }
    if (status) {
      filtered = filtered.filter((r: any) => r.status === status);
    }

    return NextResponse.json({
      status: "success",
      logs: filtered.map((r: any) => ({
        id: r.id,
        npcName: r.npcProfile?.name || "Unknown",
        status: r.status,
        cost: r.cost,
        createdAt: r.createdAt,
        txHash: r.paymentReceipts[0]?.transactionHash || null,
      })),
    });

  } catch (error: any) {
    console.error("GET /api/logs error:", error);
    return NextResponse.json({ status: "error", message: "Internal server error" }, { status: 500 });
  }
}
