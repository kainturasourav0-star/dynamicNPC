import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { dialogueRequests, npcProfiles, apiKeys } from "@/db/schema";
import { eq, and } from "@/db";
import { sql } from "drizzle-orm";
import { cookies } from "next/headers";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
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

    // 1. Total Requests
    const [reqCountResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(dialogueRequests)
      .where(eq(dialogueRequests.projectId, projectId));

    // 2. Successful Requests & Revenue
    const [successCountResult] = await db
      .select({
        count: sql<number>`count(*)`,
        totalCost: sql<string>`sum(${dialogueRequests.cost})`
      })
      .from(dialogueRequests)
      .where(and(eq(dialogueRequests.projectId, projectId), eq(dialogueRequests.status, "PAID_COMPLETED")));

    // 3. Active NPCs
    const [npcCountResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(npcProfiles)
      .where(and(eq(npcProfiles.projectId, projectId), eq(npcProfiles.isDeleted, false)));

    // 4. API Keys
    const [keysCountResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(apiKeys)
      .where(eq(apiKeys.projectId, projectId));

    return NextResponse.json({
      status: "success",
      stats: {
        totalRequests: reqCountResult?.count || 0,
        successRequests: successCountResult?.count || 0,
        revenue: parseFloat(successCountResult?.totalCost || "0.00").toFixed(2),
        activeNpcs: npcCountResult?.count || 0,
        apiKeysCount: keysCountResult?.count || 0,
      },
    });

  } catch (error: any) {
    console.error("GET /api/dashboard/stats error:", error);
    return NextResponse.json({ status: "error", message: "Internal server error" }, { status: 500 });
  }
}
