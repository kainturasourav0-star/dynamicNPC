import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, projects } from "@/db/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json(
        { status: "error", message: "Email and password are required" },
        { status: 400 }
      );
    }

    // 1. Find user
    let user = await db.query.users.findFirst({
      where: eq(users.email, email),
      with: {
        projects: true,
      },
    });

    // 2. Auto-register if not exists (Hackathon mode)
    if (!user) {
      const [newUser] = await db.insert(users).values({
        email,
        passwordHash: password, // For hackathon demo, password stored simply or hashed
      }).returning();

      // Create a default project for new user
      const [newProj] = await db.insert(projects).values({
        name: "My First Game Project",
        userId: newUser.id,
      }).returning();

      user = {
        ...newUser,
        projects: [newProj],
      };
    }

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set("userId", user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });

    if (user.projects.length > 0) {
      cookieStore.set("projectId", user.projects[0].id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });
    }

    return NextResponse.json({
      status: "success",
      user: {
        id: user.id,
        email: user.email,
        projectId: user.projects[0]?.id,
      },
    });

  } catch (error: any) {
    console.error("Login API error:", error);
    return NextResponse.json(
      { status: "error", message: "Internal server error" },
      { status: 500 }
    );
  }
}
