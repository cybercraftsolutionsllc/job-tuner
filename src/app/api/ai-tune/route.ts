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

    // If not Pro and out of credits, block
    if (!isPro && credits <= 0) {
      return NextResponse.json({ 
        error: "OUT_OF_CREDITS", 
        message: "You have used all your free AI credits." 
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
        
        Requirements:
        - Start each bullet with a strong action verb (e.g., "Drive", "Architect", "Collaborate").
        - Cover a mix of strategic planning, execution, and collaboration duties.
        - Return ONLY the bullet points formatted with "• ". Do not include introductory text.
      `;
    } else {
      userPrompt = `
        Completely rewrite and optimize the following Job Description for the role of "${title}".
        
        Original Text:
        "${currentText}"

        Task:
        Produce a full, polished Job Description.

        Structure:
        1. **About the Role**: A compelling 2-3 sentence hook explaining why this role matters.
        2. **What You'll Do**: 5-7 bullet points of responsibilities.
        3. **What You Bring**: 5-7 bullet points of qualifications (skills/experience).
        4. **Benefits & Perks**: A standard placeholder section for benefits.

        Constraints:
        - Remove any biased or toxic language from the original text.
        - Ensure the tone is consistent and professional.
        - Aim for approx 400-500 words.
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