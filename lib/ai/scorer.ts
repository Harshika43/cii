import type { AIData } from "@/types/assessment";

export async function scoreWithAI(
  openAnswers: string[],
  dims: number[],
  allAnswers: Record<string, unknown>
): Promise<AIData> {
  const clamp = (v: number) => Math.max(0, Math.min(100, Math.round(Number(v) || 40)));

  try {
    const res = await fetch("/api/score", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ openAnswers, dims, allAnswers }),
    });

    if (!res.ok) {
      const errText = await res.text();
      if (res.status === 429 || res.status === 500 || errText.includes("quota") || errText.includes("exhausted")) {
        throw new Error("AI_QUOTA_EXHAUSTED");
      }
      throw new Error(`API ${res.status}`);
    }

    const parsed = await res.json();
    if (parsed.error) throw new Error(parsed.error);

    return {
      ...parsed,
      _divScores: [clamp(parsed.div_q1 ?? 40), clamp(parsed.div_q2 ?? 40)],
    };
  } catch (e) {
    console.warn("[scoreWithAI] Fallback to local scoring:", (e as Error).message);

    const mockDivScores = [
      clamp(openAnswers[0]?.split("\n").filter(l => l.trim().length > 2).length * 12 + 30),
      clamp(openAnswers[1]?.split("\n").filter(l => l.trim().length > 2).length * 12 + 30),
    ];

    return {
      narrative:    "AI analysis temporarily unavailable. Scores computed using local algorithms.",
      key_insight:  "Your responses show creative potential. Complete more assessments to unlock AI-powered feedback.",
      strengths:    "Based on your answers, you demonstrate strong associative thinking and practical problem-solving.",
      blind_spots:  "Consider exploring more unconventional ideas to expand your creative range.",
      improvements: [
        { dim: 0, action: "Practice listing 20 uses for everyday objects daily." },
        { dim: 2, action: "Try 'Yes, and...' exercises to build on wild ideas." },
        { dim: 4, action: "Set a weekly goal to share one unconventional idea." },
      ],
      _divScores: mockDivScores,
      _fallback:  true,
    };
  }
}
