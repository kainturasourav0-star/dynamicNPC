import { NextRequest, NextResponse } from "next/server";
import { db, eq } from "@/db";
import { users, projects } from "@/db/schema";
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

    // 1. Check if user already exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existingUser) {
      return NextResponse.json(
        { status: "error", message: "User with this email already exists" },
        { status: 400 }
      );
    }

    // 2. Register user
    const [newUser] = await db.insert(users).values({
      email,
      passwordHash: password, // For hackathon demo, password stored simply or hashed
    }).returning();

    // Create a default project for new user
    const [newProj] = await db.insert(projects).values({
      name: "My First Game Project",
      userId: newUser.id,
    }).returning();

    // Set cookie for automatic log-in
    const cookieStore = await cookies();
    cookieStore.set("userId", newUser.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });

    cookieStore.set("projectId", newProj.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return NextResponse.json({
      status: "success",
      user: {
        id: newUser.id,
        email: newUser.email,
        projectId: newProj.id,
      },
    });

  } catch (error: any) {
    console.error("Signup API error:", error);
    return NextResponse.json(
      { status: "error", message: "Internal server error" },
      { status: 500 }
    );
  }
}
