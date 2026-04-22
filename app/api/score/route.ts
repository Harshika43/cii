import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { openAnswers, dims, allAnswers } = await req.json();

    const prompt = `You are an expert psychometrician evaluating creative thinking responses.

The respondent answered two open-ended questions:

Q1 - "List every possible use for a broken umbrella":
${openAnswers[0] || "(no answer)"}

Q2 - "In how many ways could complete SILENCE be a valuable tool or resource?":
${openAnswers[1] || "(no answer)"}

Their preliminary algorithmic dimension scores are:
- Divergent Thinking: ${dims[0]}
- Remote Association: ${dims[1]}  
- Risk & Openness: ${dims[2]}
- Vision & Drive: ${dims[3]}
- Creative Behavior: ${dims[4]}
- Innovation Thinking: ${dims[5]}

Evaluate the open-ended answers and provide:
1. div_q1: Divergent thinking score for Q1 (0-100) based on quantity, originality, and range
2. div_q2: Divergent thinking score for Q2 (0-100)
3. narrative: 2-3 sentence cognitive profile (be specific to their answers)
4. key_insight: One powerful sentence about their creative signature
5. strengths: Their primary creative strength (1-2 sentences)
6. blind_spots: Their main creative blind spot (1-2 sentences)
7. persona_type: A creative persona label (e.g., "The Pattern Weaver", "The Bold Iconoclast")
8. improvements: Array of 3 objects with {dim: number (0-5), action: string} for their weakest dimensions

Respond ONLY with valid JSON, no markdown, no explanation.`;

    const model = client.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    let parsed: unknown;
    try {
      const cleaned = text.replace(/```json|```/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      throw new Error("Failed to parse AI response as JSON");
    }

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("[/api/score] Error:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Scoring failed" },
      { status: 500 }
    );
  }
}