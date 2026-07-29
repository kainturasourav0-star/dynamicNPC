import { db } from "@/db";
import { users } from "@/db/schema";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";

export async function getSessionUser() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;
  
  if (!userId) {
    return null;
  }

  try {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
      with: {
        projects: true,
      },
    });
    return user || null;
  } catch (error) {
    console.error("Error fetching session user:", error);
    return null;
  }
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("userId");
  cookieStore.delete("projectId");
}
