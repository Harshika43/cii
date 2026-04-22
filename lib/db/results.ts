import { sb } from "@/lib/supabase/raw";
import { getProfile } from "@/constants/profiles";
import type { AssessmentResults, AIData } from "@/types/assessment";

export async function dbSaveAnswers(sessionId: string, answers: Record<string, unknown>) {
  const rows = Object.entries(answers)
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(([question_id, answer_value]) => ({
      session_id: sessionId,
      question_id,
      answer_value: typeof answer_value === "object"
        ? JSON.stringify(answer_value)
        : String(answer_value),
      saved_at: new Date().toISOString(),
    }));
  if (rows.length === 0) return;
  for (let i = 0; i < rows.length; i += 10) {
    await sb.insert("cii_answers", rows.slice(i, i + 10));
  }
}

export async function dbSaveResults(
  sessionId: string,
  userId: string,
  results: AssessmentResults,
  aiData: AIData | null,
  orgId?: string | null,
  department?: string | null,
  userName?: string | null,
  userDesignation?: string | null,
) {
  const { dims, cii } = results;
  const profile = getProfile(cii);
  const payload = {
    session_id:           sessionId,
    user_id:              userId,
    org_id:               orgId ?? null,
    department:           department ?? null,
    employee_name:        userName ?? null,
    employee_designation: userDesignation ?? null,
    cii_score:            cii,
    profile_name:         profile.name,
    profile_tag:          profile.tag,
    dim_divergent:        dims[0],
    dim_assoc:            dims[1],
    dim_risk:             dims[2],
    dim_vision:           dims[3],
    dim_behavior:         dims[4],
    dim_innovation:       dims[5],
    ai_narrative:         aiData?.narrative ?? null,
    ai_key_insight:       aiData?.key_insight ?? null,
    ai_strengths:         aiData?.strengths ?? null,
    ai_blind_spots:       aiData?.blind_spots ?? null,
    ai_persona_type:      aiData?.persona_type ?? null,
    ai_improvements:      aiData?.improvements ? JSON.stringify(aiData.improvements) : null,
    completed_at:         new Date().toISOString(),
  };
  const row = await sb.insert("cii_results", payload);
  await sb.patch("cii_sessions", `id=eq.${sessionId}`, {
    status:       "completed",
    completed_at: new Date().toISOString(),
  });
  return row;
}

export async function dbGetOrgResults(orgId: string) {
  return await sb.select("cii_results", `org_id=eq.${orgId}&order=completed_at.desc`);
}
