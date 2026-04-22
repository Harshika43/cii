import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { genId } from "@/lib/utils/helpers";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { userId, orgId } = await req.json();
    const sessionId = genId();

    const { data, error } = await supabase
      .from("cii_sessions")
      .insert({
        id:         sessionId,
        user_id:    userId,
        org_id:     orgId ?? null,
        started_at: new Date().toISOString(),
        status:     "in_progress",
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
