import { db, eq } from "@/db";
import { users } from "@/db/schema";
import { cookies } from "next/headers";


export async function getSessionUser() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;
  
  if (!userId) {
    return null;
  }

  try {
    let user = await db.query.users.findFirst({
      where: eq(users.id, userId),
      with: {
        projects: true,
      },
    });

    // If using mock DB and session user was evicted from serverless memory, restore it dynamically
    const { isRealDb } = await import("@/db");
    if (!user && !isRealDb) {
      console.log(`Evicted mock user ${userId} detected, restoring dynamically...`);
      const { users: usersTable, projects: projectsTable } = await import("@/db/schema");
      
      const [newUser] = await db.insert(usersTable).values({
        id: userId,
        email: "developer@hackathon.com",
        passwordHash: "password",
      }).returning();

      const [newProj] = await db.insert(projectsTable).values({
        name: "My First Game Project",
        userId: newUser.id,
      }).returning();

      user = {
        ...newUser,
        projects: [newProj],
      };
    }

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
