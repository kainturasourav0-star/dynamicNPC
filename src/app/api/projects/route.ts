import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { eq } from "@/db";
import { cookies } from "next/headers";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 401 });
    }

    const userProjects = await db.query.projects.findMany({
      where: eq(projects.userId, user.id),
      orderBy: projects.createdAt,
    });

    return NextResponse.json({ status: "success", projects: userProjects });
  } catch (error: any) {
    console.error("GET /api/projects error:", error);
    return NextResponse.json({ status: "error", message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 401 });
    }

    const { name } = await req.json();
    if (!name) {
      return NextResponse.json({ status: "error", message: "Project name is required" }, { status: 400 });
    }

    const [newProj] = await db.insert(projects).values({
      name,
      userId: user.id,
    }).returning();

    // Automatically set the newly created project as the active project in cookies
    const cookieStore = await cookies();
    cookieStore.set("projectId", newProj.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return NextResponse.json({ status: "success", project: newProj });
  } catch (error: any) {
    console.error("POST /api/projects error:", error);
    return NextResponse.json({ status: "error", message: "Internal server error" }, { status: 500 });
  }
}
