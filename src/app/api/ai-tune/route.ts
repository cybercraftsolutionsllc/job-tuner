import { NextResponse } from "next/server";
import OpenAI from "openai";
import { auth, currentUser, clerkClient } from "@clerk/nextjs/server";
import { TONE_PROFILES, ToneKey, AI_CONFIG } from "@/utils/constants";

export async function POST(req: Request) {
  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized. Please Sign In." }, { status: 401 });
    }

    const user = await currentUser();
    const client = await clerkClient();
    
    // --- RESET LOGIC ---
    // Check if 30 days have passed since last reset
    const lastReset = user?.privateMetadata?.lastResetDate ? new Date(user.privateMetadata.lastResetDate as string) : new Date(0);
    const now = new Date();
    const daysSinceReset = (now.getTime() - lastReset.getTime()) / (1000 * 3600 * 24);

    let currentCredits = Number(user?.privateMetadata?.credits ?? 10); // Default to 10
    
    // If > 30 days, reset free tier users to 10 credits (if they have less than 10)
    // We don't want to wipe purchased credits, so complex logic might be needed for real apps.
    // For this MVP: We just ensure they have at least 10 every month.
    if (daysSinceReset > 30) {
      if (currentCredits < 10) {
        currentCredits = 10;
        await client.users.updateUserMetadata(userId, {
          privateMetadata: {
            credits: 10,
            lastResetDate: now.toISOString()
          }
        });
      }
    }

    const isPro = user?.privateMetadata?.plan === "pro";

    if (!isPro && currentCredits <= 0) {
      return NextResponse.json({ 
        error: "OUT_OF_CREDITS", 
        message: "You have used all your free credits. Upgrade to continue." 
      }, { status: 403 });
    }

    const { title, currentText, type, tone } = await req.json();
    
    // Pro users get GPT-4o, Free get 3.5
    const model = isPro ? "gpt-4o" : "gpt-3.5-turbo";

    const toneKey = (tone && TONE_PROFILES[tone as ToneKey]) ? (tone as ToneKey) : 'professional';
    const selectedTonePrompt = TONE_PROFILES[toneKey].prompt;

    const systemPrompt = `
      You are an expert Senior Technical Recruiter.
      ${selectedTonePrompt}
      
      Your Goal: Transform the input into a high-converting, bias-free Job Description.
      
      Rules:
      1. Use "You" (candidate focus) vs "We" (company focus) at a 4:1 ratio.
      2. No "Ninja/Rockstar" terms. Use "Specialist/Lead".
      3. Use bold headers (**Header**) for structure.
      4. Keep it concise but persuasive.
    `;

    let userPrompt = "";

    if (type === "expand") {
      userPrompt = `
        Role: ${title}
        Draft: "${currentText.substring(0, 300)}..."
        
        Task: Create 6 strong "Key Responsibilities" bullet points.
        Format: Bullet points only.
      `;
    } else {
      userPrompt = `
        Rewrite this JD for a "${title}".
        
        Original:
        "${currentText}"

        Structure:
        1. **The Opportunity** (Hook)
        2. **What You'll Do** (Bullets)
        3. **What You Need** (Bullets)
        4. **Benefits** (List)
      `;
    }

    const completion = await openai.chat.completions.create({
      model: model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7,
    });
    
    const result = completion.choices[0].message.content;

    if (!isPro) {
      await client.users.updateUserMetadata(userId, {
        privateMetadata: {
          credits: currentCredits - 1
        }
      });
      return NextResponse.json({ result, remainingCredits: currentCredits - 1, isPro: false });
    }

    return NextResponse.json({ result, remainingCredits: currentCredits, isPro: true });

  } catch (error) {
    console.error("AI Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}