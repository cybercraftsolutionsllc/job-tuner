'use server'

import { clerkClient } from "@clerk/nextjs/server";
import { auth } from "@clerk/nextjs/server";

// Security check helper
async function checkAdmin() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  
  // For MVP, you can hardcode your user ID here or check a specific role
  // Replace 'user_2...' with your actual Clerk User ID found in Clerk Dashboard
  // const ADMIN_IDS = ["user_2..."]; 
  // if (!ADMIN_IDS.includes(userId)) throw new Error("Forbidden");
  
  return true;
}

export async function toggleProStatus(targetUserId: string, currentStatus: boolean) {
  await checkAdmin();
  const client = await clerkClient();
  
  await client.users.updateUserMetadata(targetUserId, {
    privateMetadata: {
      plan: currentStatus ? "free" : "pro"
    }
  });
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
}