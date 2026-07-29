import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { apiKeys } from "@/db/schema";
import { eq, and } from "@/db";
import { cookies } from "next/headers";
import crypto from "crypto";
import { getSessionUser } from "@/lib/auth";

// Helper to hash key
function hashApiKey(key: string): string {
  return crypto.createHash("sha256").update(key).digest("hex");
}

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

    const keys = await db.query.apiKeys.findMany({
      where: eq(apiKeys.projectId, projectId),
      orderBy: apiKeys.createdAt,
    });

    // Sanitize output - never return full hash details if not needed
    const sanitizedKeys = keys.map((k: any) => ({
      id: k.id,
      name: k.name,
      isActive: k.isActive,
      createdAt: k.createdAt,
      displayKey: "dnd_••••••••••••••••••••" + k.keyHash.substring(0, 4),
    }));

    return NextResponse.json({ status: "success", apiKeys: sanitizedKeys });
  } catch (error: any) {
    console.error("GET /api/keys error:", error);
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
      return NextResponse.json({ status: "error", message: "No active project" }, { status: 400 });
    }

    const { name } = await req.json();
    if (!name) {
      return NextResponse.json({ status: "error", message: "Key name is required" }, { status: 400 });
    }

    // Generate high-entropy API key
    const rawKey = "dnd_" + crypto.randomBytes(24).toString("hex");
    const keyHash = hashApiKey(rawKey);

    const [apiKeyRecord] = await db.insert(apiKeys).values({
      projectId,
      name,
      keyHash,
      isActive: true,
    }).returning();

    return NextResponse.json({
      status: "success",
      apiKey: {
        id: apiKeyRecord.id,
        name: apiKeyRecord.name,
        isActive: apiKeyRecord.isActive,
        createdAt: apiKeyRecord.createdAt,
        rawKey, // Returned exactly once
      }
    });

  } catch (error: any) {
    console.error("POST /api/keys error:", error);
    return NextResponse.json({ status: "error", message: "Internal server error" }, { status: 500 });
  }
}
