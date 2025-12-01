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
    const isPro = user?.privateMetadata?.plan === "pro";
    const currentCredits = user?.privateMetadata?.credits;
    
    // Default to 5 credits if not set
    const credits = currentCredits === undefined ? 5 : Number(currentCredits);

    // Hard gate: If not pro and out of credits, stop.
    if (!isPro && credits <= 0) {
      return NextResponse.json({ 
        error: "OUT_OF_CREDITS", 
        message: "You have used all your free AI credits." 
      }, { status: 403 });
    }

    const { title, currentText, type, tone } = await req.json();
    
    // Future-Proofing: Validate tone against our constants
    // If 'tone' is missing or invalid, default to 'professional'
    const toneKey = (tone && TONE_PROFILES[tone as ToneKey]) ? (tone as ToneKey) : 'professional';
    const selectedTonePrompt = TONE_PROFILES[toneKey].prompt;

    const systemPrompt = `
      You are a Senior Technical Recruiter and Copywriter at a top-tier company.
      ${selectedTonePrompt}
      
      Your Core Rules:
      1. **Candidate-Centric**: Use "You" more than "We". Sell the opportunity.
      2. **Bias-Free**: STRICTLY avoid gendered language (e.g., "salesman", "guys") and toxic phrases (e.g., "rockstar", "hustle").
      3. **Formatting**: Use Markdown headers (##) and bullet points for readability.
      4. **SEO Optimized**: Ensure the job title appears naturally in the first 2 sentences.
    `;

    let userPrompt = "";

    if (type === "expand") {
      userPrompt = `
        Context: The role is "${title}".
        Draft Text: "${currentText.substring(0, 300)}...".

        Task: Generate 6-8 high-impact "Key Responsibilities" bullet points.
        Requirement: Start every bullet with a strong action verb. Return ONLY the bullets.
      `;
    } else {
      userPrompt = `
        Rewrite this Job Description for a "${title}" role.
        
        Original Input:
        "${currentText}"

        Structure:
        1. **The Mission** (Hook the candidate instantly)
        2. **What You'll Do** (Responsibilities)
        3. **What You Bring** (Requirements)
        4. **Why Join Us** (Benefits & Culture)

        Length: 400-500 words.
      `;
    }

    const completion = await openai.chat.completions.create({
      model: AI_CONFIG.defaultModel,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: AI_CONFIG.temperature,
    });
    
    const result = completion.choices[0].message.content;

    // Only deduct credits if NOT Pro
    if (!isPro) {
      const client = await clerkClient();
      await client.users.updateUserMetadata(userId, {
        privateMetadata: {
          credits: credits - 1
        }
      });
      return NextResponse.json({ result, remainingCredits: credits - 1, isPro: false });
    }

    return NextResponse.json({ result, remainingCredits: credits, isPro: true });

  } catch (error) {
    console.error("AI Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}