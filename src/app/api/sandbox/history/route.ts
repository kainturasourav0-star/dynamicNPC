import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { conversationHistory } from "@/db/schema";
import { eq, and, desc } from "@/db";
import { getSessionUser } from "@/lib/auth";
import { cookies } from "next/headers";

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

    // Fetch conversation history for the current project, including the associated NPC profile
    const conversations = await db.query.conversationHistory.findMany({
      where: eq(conversationHistory.projectId, projectId),
      with: {
        npcProfile: true,
      },
      orderBy: [desc(conversationHistory.updatedAt)],
    });

    return NextResponse.json({
      status: "success",
      conversations,
    });
  } catch (error: any) {
    console.error("GET /api/sandbox/history error:", error);
    return NextResponse.json({ status: "error", message: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
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
    const playerAddress = searchParams.get("playerAddress");

    if (!npcId || !playerAddress) {
      return NextResponse.json(
        { status: "error", message: "Missing npcId or playerAddress parameters" },
        { status: 400 }
      );
    }

    // Delete conversation history matching criteria
    await db.delete(conversationHistory)
      .where(and(
        eq(conversationHistory.npcId, npcId),
        eq(conversationHistory.playerAddress, playerAddress),
        eq(conversationHistory.projectId, projectId)
      ));

    return NextResponse.json({
      status: "success",
      message: "Conversation history cleared successfully"
    });
  } catch (error: any) {
    console.error("DELETE /api/sandbox/history error:", error);
    return NextResponse.json({ status: "error", message: "Internal server error" }, { status: 500 });
  }
}
