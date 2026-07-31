import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { eq, and } from "@/db";
import { cookies } from "next/headers";
import { getSessionUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 401 });
    }

    const { projectId } = await req.json();
    if (!projectId) {
      return NextResponse.json({ status: "error", message: "Project ID is required" }, { status: 400 });
    }

    // Verify project belongs to the user
    const project = await db.query.projects.findFirst({
      where: and(eq(projects.id, projectId), eq(projects.userId, user.id)),
    });

    if (!project) {
      return NextResponse.json({ status: "error", message: "Project not found or unauthorized" }, { status: 404 });
    }

    const cookieStore = await cookies();
    cookieStore.set("projectId", project.id, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return NextResponse.json({ status: "success", projectId: project.id });
  } catch (error: any) {
    console.error("POST /api/projects/switch error:", error);
    return NextResponse.json({ status: "error", message: "Internal server error" }, { status: 500 });
  }
}
