import { NextResponse } from "next/server";
import OpenAI from "openai";
import { auth, currentUser, clerkClient } from "@clerk/nextjs/server";

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

    if (!isPro && credits <= 0) {
      return NextResponse.json({ 
        error: "OUT_OF_CREDITS", 
        message: "You have used all 5 free credits. Upgrade to continue." 
      }, { status: 403 });
    }

    const { title, currentText, type } = await req.json();
    
    const systemPrompt = `
      You are a Senior Technical Recruiter and DE&I Expert at a Fortune 500 tech company.
      Your goal is to write job descriptions that are engaging, inclusive, and optimized for search rankings (SEO).
      
      Your Style Guide:
      - Tone: Professional, welcoming, and excitement-inducing.
      - Perspective: Use "You" (candidate-focused) more than "We" (company-focused).
      - Inclusivity: Strictly avoid gendered language (e.g., "salesman", "guys") and toxic phrases (e.g., "rockstar", "hustle", "thick skin").
      - Formatting: Use clear headers and bullet points for readability.
    `;

    let userPrompt = "";

    if (type === "expand") {
      userPrompt = `
        I need a "Key Responsibilities" section for the role of "${title}".
        The current draft text (for context) is: "${currentText.substring(0, 300)}...".

        Task:
        Generate 6-8 highly specific, professional bullet points describing what this person will actually do.
        Return ONLY the bullet points formatted with "• ".
      `;
    } else {
      userPrompt = `
        Completely rewrite and optimize the following Job Description for the role of "${title}".
        Original Text: "${currentText}"

        Task:
        Produce a full, polished Job Description (approx 400-500 words).
        Structure: About the Role, What You'll Do, What You Bring, Benefits.
      `;
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7,
    });
    
    const result = completion.choices[0].message.content;

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