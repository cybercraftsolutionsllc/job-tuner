import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import Stripe from "stripe";

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2024-04-10" as any, // Use latest or your specific version
});

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get("Stripe-Signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );
  } catch (error) {
    return NextResponse.json({ error: "Webhook Error" }, { status: 400 });
  }

  // Handle the event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    
    // We assume you pass the Clerk User ID as client_reference_id when creating the session
    // Or in metadata: { userId: "..." }
    const userId = session.client_reference_id || session.metadata?.userId;

    if (userId) {
      const client = await clerkClient();
      
      // Fetch current credits to increment
      const user = await client.users.getUser(userId);
      const currentCredits = Number(user.privateMetadata.credits || 0);
      
      // Determine what was bought based on price ID or mode
      // For this example, we assume any successful payment adds 100 credits
      const creditsToAdd = 100; 

      await client.users.updateUserMetadata(userId, {
        privateMetadata: {
          credits: currentCredits + creditsToAdd,
        },
      });
    }
  }

  return NextResponse.json({ received: true });
}