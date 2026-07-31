import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { npcProfiles } from "@/db/schema";
import { eq, and } from "@/db";
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
      return NextResponse.json({ status: "error", message: "No active project selected" }, { status: 400 });
    }

    const npcs = await db.query.npcProfiles.findMany({
      where: and(eq(npcProfiles.projectId, projectId), eq(npcProfiles.isDeleted, false)),
      orderBy: npcProfiles.createdAt,
    });

    return NextResponse.json({ status: "success", npcs });
  } catch (error: any) {
    console.error("GET /api/npcs error:", error);
    return NextResponse.json({ status: "error", message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 401 });
    }

    const cookieStore = await cookies();
    const projectId = cookieStore.get("projectId")?.value;

    if (!projectId) {
      return NextResponse.json({ status: "error", message: "No active project selected" }, { status: 400 });
    }

    const { name, backstory, tone, style, safetyRules, cost } = await req.json();

    if (!name || !backstory) {
      return NextResponse.json({ status: "error", message: "Name and Backstory are required" }, { status: 400 });
    }

    // Validate cost value
    let finalCost = "0.0100";
    if (cost !== undefined && cost !== null) {
      const parsedCost = parseFloat(cost);
      if (!isNaN(parsedCost) && parsedCost >= 0) {
        finalCost = parsedCost.toFixed(4);
      }
    }

    const [npc] = await db.insert(npcProfiles).values({
      projectId,
      name,
      backstory,
      tone: tone || "Neutral",
      style: style || "",
      safetyRules: safetyRules || "",
      cost: finalCost,
    }).returning();

    return NextResponse.json({ status: "success", npc });
  } catch (error: any) {
    console.error("POST /api/npcs error:", error);
    return NextResponse.json({ status: "error", message: "Internal server error" }, { status: 500 });
  }
}
