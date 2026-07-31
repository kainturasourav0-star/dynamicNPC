import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { npcProfiles } from "@/db/schema";
import { eq, and } from "@/db";
import { cookies } from "next/headers";
import { getSessionUser } from "@/lib/auth";

export async function PATCH(
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

    const body = await req.json();
    const { name, backstory, tone, style, safetyRules, cost } = body;

    // Verify NPC profile belongs to this project
    const npc = await db.query.npcProfiles.findFirst({
      where: and(eq(npcProfiles.id, id), eq(npcProfiles.projectId, projectId), eq(npcProfiles.isDeleted, false)),
    });

    if (!npc) {
      return NextResponse.json({ status: "error", message: "NPC not found" }, { status: 404 });
    }

    // Validate cost value if provided
    let finalCost = npc.cost;
    if (cost !== undefined && cost !== null) {
      const parsedCost = parseFloat(cost);
      if (!isNaN(parsedCost) && parsedCost >= 0) {
        finalCost = parsedCost.toFixed(4);
      }
    }

    const [updatedNpc] = await db.update(npcProfiles)
      .set({
        name: name !== undefined ? name : npc.name,
        backstory: backstory !== undefined ? backstory : npc.backstory,
        tone: tone !== undefined ? tone : npc.tone,
        style: style !== undefined ? style : npc.style,
        safetyRules: safetyRules !== undefined ? safetyRules : npc.safetyRules,
        cost: finalCost,
        updatedAt: new Date(),
      })
      .where(eq(npcProfiles.id, id))
      .returning();

    return NextResponse.json({ status: "success", npc: updatedNpc });
  } catch (error: any) {
    console.error("PATCH /api/npcs/[id] error:", error);
    return NextResponse.json({ status: "error", message: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
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

    const npc = await db.query.npcProfiles.findFirst({
      where: and(eq(npcProfiles.id, id), eq(npcProfiles.projectId, projectId), eq(npcProfiles.isDeleted, false)),
    });

    if (!npc) {
      return NextResponse.json({ status: "error", message: "NPC not found" }, { status: 404 });
    }

    // Soft delete
    await db.update(npcProfiles)
      .set({ isDeleted: true, updatedAt: new Date() })
      .where(eq(npcProfiles.id, id));

    return NextResponse.json({ status: "success", message: "NPC deleted successfully" });
  } catch (error: any) {
    console.error("DELETE /api/npcs/[id] error:", error);
    return NextResponse.json({ status: "error", message: "Internal server error" }, { status: 500 });
  }
}
