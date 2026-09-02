import { db, eq } from "@/db";
import { users, projects } from "@/db/schema";
import { auth, currentUser } from "@clerk/nextjs/server";

export async function getSessionUser() {
  try {
    let email: string | null = null;
    try {
      const { userId } = await auth();
      if (userId) {
        const clerkUser = await currentUser();
        email = clerkUser?.emailAddresses[0]?.emailAddress || null;
      }
    } catch {
      // Clerk session not found or running in dev fallback mode
    }

    // Default to developer account for dev / preview fallback
    const targetEmail = email || "developer@npc402.dev";

    let user = await db.query.users.findFirst({
      where: eq(users.email, targetEmail),
      with: {
        projects: true,
      },
    });

    if (!user) {
      console.log(`[Auth] Initializing developer profile for ${targetEmail}...`);
      const [newUser] = await db.insert(users).values({
        email: targetEmail,
        passwordHash: "clerk_managed",
      }).returning();

      const [newProj] = await db.insert(projects).values({
        name: "Cyberpunk Realm RPG",
        userId: newUser.id,
      }).returning();

      user = {
        ...newUser,
        projects: [newProj],
      };
    }

    return user;
  } catch (error) {
    console.error("Error fetching session user:", error);
    return null;
  }
}

export async function logout() {
  // Client handles Clerk sign-out
}

