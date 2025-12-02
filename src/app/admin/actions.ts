'use server'

import { clerkClient } from "@clerk/nextjs/server";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

// --- CONFIGURATION ---
const ADMIN_USER_IDS = [
  "user_36FJn8KEujWD2PbD6360WxqF5i5", 
];

async function checkAdmin() {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error("Unauthorized: Please sign in.");
  }

  // DEBUG LOGGING
  console.log(`[Admin Action] User: ${userId}`);

  if (!ADMIN_USER_IDS.includes(userId)) {
    // STRICTLY THROW ERROR - NO JSX HERE
    throw new Error(`Forbidden: User ${userId} is not an admin.`);
  }
  
  return true;
}

export async function toggleProStatus(targetUserId: string, isPro: boolean) {
  await checkAdmin();
  const client = await clerkClient();
  
  await client.users.updateUserMetadata(targetUserId, {
    privateMetadata: {
      plan: isPro ? "free" : "pro"
    }
  });

  revalidatePath("/admin");
}

export async function addCredits(targetUserId: string, amount: number) {
  await checkAdmin();
  const client = await clerkClient();
  
  const user = await client.users.getUser(targetUserId);
  const current = Number(user.privateMetadata.credits || 0);
  
  await client.users.updateUserMetadata(targetUserId, {
    privateMetadata: {
      credits: current + amount
    }
  });

  revalidatePath("/admin");
}