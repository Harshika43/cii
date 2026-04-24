import { sb } from "@/lib/supabase/raw";
import { genId } from "@/lib/utils/helpers";

export async function dbCreateSession(userId: string, orgId?: string | null) {
  const sessionId = genId();
  return await sb.insert("cii_sessions", {
    id:         sessionId,
    user_id:    userId,
    org_id:     orgId ?? null,
    started_at: new Date().toISOString(),
    status:     "in_progress",
  });
}
