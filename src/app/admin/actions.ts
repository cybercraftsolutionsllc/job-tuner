'use server'

import { clerkClient } from "@clerk/nextjs/server";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

// --- CONFIGURATION ---
// 1. Look at your VS Code terminal when you click an admin button.
// 2. Copy the "Current User ID" logged there and paste it into this array.
const ADMIN_USER_IDS = [
  "ususer_36FJn8KEujWD2PbD6360WxqF5i5", // Replace with your actual ID
];

async function checkAdmin() {
  const { userId } = await auth();
  
  if (!userId) {
    console.error("Admin Check Failed: No user logged in.");
    throw new Error("Unauthorized: Please sign in.");
  }

  // DEBUG LOGGING: This will print to your terminal where `npm run dev` is running
  console.log(`Admin Access Attempt - Current User ID: ${userId}`);
  console.log(`Allowed Admin IDs: ${JSON.stringify(ADMIN_USER_IDS)}`);

  if (!ADMIN_USER_IDS.includes(userId)) {
    console.error(`ACCESS DENIED for user: ${userId}`);
    throw new Error("Forbidden: You do not have admin privileges.");
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