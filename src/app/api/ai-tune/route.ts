import { NextResponse } from "next/server";
import OpenAI from "openai";
import { auth, currentUser, clerkClient } from "@clerk/nextjs/server";

// REMOVE the global initialization here
// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY }); <--- DELETE THIS

export async function POST(req: Request) {
  try {
    // 1. Initialize OpenAI INSIDE the request (Safe for builds)
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // 2. Check Authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized. Please Sign In." }, { status: 401 });
    }

    // ... (Rest of the code stays exactly the same) ...
    // Copy the rest of your logic from the previous step below:
    
    const user = await currentUser();
    const currentCredits = user?.privateMetadata?.credits;
    const credits = currentCredits === undefined ? 3 : Number(currentCredits);

    if (credits <= 0) {
      return NextResponse.json({ 
        error: "OUT_OF_CREDITS", 
        message: "You have used all your free AI credits." 
      }, { status: 403 });
    }

    const { title, currentText, type } = await req.json();
    let systemPrompt = "You are an expert HR Recruiter and Copywriter.";
    let userPrompt = "";

    if (type === "expand") {
      userPrompt = `
        I have a job description for the role of "${title}". 
        The current text is: "${currentText}".
        Generate 5-7 highly specific, professional "Key Responsibilities" bullet points.
        Return ONLY the bullet points.
      `;
    } else {
      userPrompt = `
        Rewrite the following job description to be inclusive, professional, and exciting. 
        Fix grammar and improve the "You vs We" ratio.
        Original Text: "${currentText}"
      `;
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }],
    });
    
    const result = completion.choices[0].message.content;

    const client = await clerkClient();
    await client.users.updateUserMetadata(userId, {
      privateMetadata: {
        credits: credits - 1
      }
    });

    return NextResponse.json({ result, remainingCredits: credits - 1 });

  } catch (error) {
    console.error("AI Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}