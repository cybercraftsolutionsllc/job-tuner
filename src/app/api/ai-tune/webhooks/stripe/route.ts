import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2024-04-10" as any, 
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

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    
    // Assumes Stripe Payment Link was configured with `client_reference_id` or metadata
    const userId = session.client_reference_id || session.metadata?.userId;

    if (userId) {
      const client = await clerkClient();
      
      const user = await client.users.getUser(userId);
      const currentCredits = Number(user.privateMetadata.credits || 0);
      
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