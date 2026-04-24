"use client";
import { useEffect, useState } from "react";
import { getProfile }    from "@/constants/profiles";
import { DIM }           from "@/constants/dimensions";
import { C }             from "@/constants/theme";
import { createClient }  from "@/lib/supabase/client";

interface ResultRow {
  id: string;
  cii_score: number;
  profile_name: string;
  dim_divergent: number;
  dim_assoc: number;
  dim_risk: number;
  dim_vision: number;
  dim_behavior: number;
  dim_innovation: number;
  ai_narrative: string | null;
  ai_key_insight: string | null;
  ai_strengths: string | null;
  ai_blind_spots: string | null;
  ai_persona_type: string | null;
  completed_at: string;
  department: string | null;
  employee_name: string | null;
}

interface Props {
  authUserId:   string;
  email:        string;
  onRetake:     () => void;
  onBack:       () => void;
  onViewResult: (result: ResultRow) => void;
}

export function UserHistoryDashboard({ authUserId, email, onRetake, onBack, onViewResult }: Props) {
  const [results,  setResults]  = useState<ResultRow[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [selected, setSelected] = useState<ResultRow | null>(null);

  useEffect(() => {
    const load = async () => {
        setLoading(true);
        try {
        const supabase = createClient();

        // Get user record
        const { data: users } = await supabase
            .from("cii_users")
            .select("id")
            .eq("email", email.toLowerCase())
            .limit(1);

        const user = users?.[0];
        if (!user?.id) { setLoading(false); return; }

        // Get all results for this user
        const { data: rows } = await supabase
            .from("cii_results")
            .select("*")
            .eq("user_id", user.id)
            .order("completed_at", { ascending: false });

        const results = (rows || []) as ResultRow[];
        setResults(results);
        if (results.length > 0) setSelected(results[0]);
        } catch (e) {
        console.error("[UserHistory] load error:", e);
        }
        setLoading(false);
    };
    load();
    }, [authUserId, email]);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    onBack();
  };

  const latest = results[0];
  const profile = latest ? getProfile(latest.cii_score) : null;

  if (loading) return (
    <div style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", background: "#edeae4" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.4rem", fontWeight: 800, color: C.gold, marginBottom: 8 }}>Loading…</div>
        <div style={{ fontSize: "0.8rem", color: C.inkM }}>Fetching your results</div>
      </div>
    </div>
  );

  if (results.length === 0) return (
    <div style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", background: "#edeae4", padding: 24 }}>
      <div style={{ textAlign: "center", maxWidth: 400 }}>
        <div style={{ fontSize: "3rem", marginBottom: 16 }}>📋</div>
        <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.8rem", fontWeight: 800, color: C.ink, marginBottom: 12 }}>No results yet</h2>
        <p style={{ fontSize: "0.82rem", color: C.inkM, lineHeight: 1.8, marginBottom: 24 }}>
          You haven't completed the CII assessment yet. Take it now to see your creative innovation profile.
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <button onClick={onRetake} className="btn-primary" style={{ padding: "0.85rem 1.6rem", borderRadius: 12, border: "none", fontSize: "0.85rem", fontWeight: 700, cursor: "pointer" }}>
            Take Assessment →
          </button>
          <button onClick={handleSignOut} style={{ padding: "0.85rem 1.6rem", borderRadius: 12, border: `1.5px solid ${C.inkXL}`, background: "transparent", fontSize: "0.85rem", fontWeight: 600, cursor: "pointer", color: C.inkM }}>
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );

  const dims = selected ? [
    selected.dim_divergent, selected.dim_assoc, selected.dim_risk,
    selected.dim_vision, selected.dim_behavior, selected.dim_innovation,
  ] : [];

  const selectedProfile = selected ? getProfile(selected.cii_score) : null;

  return (
    <div style={{ minHeight: "100dvh", background: "#edeae4", padding: "clamp(12px,3vw,24px)", display: "flex", flexDirection: "column", gap: 12 }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
        <div>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(1rem,2.5vw,1.4rem)", fontWeight: 800, color: C.ink, lineHeight: 1.2 }}>
            Your CII Dashboard
          </h1>
          <p style={{ fontSize: "0.65rem", color: C.inkL, marginTop: 3 }}>{email} · {results.length} assessment{results.length !== 1 ? "s" : ""} completed</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={onRetake} className="btn-primary" style={{ padding: "6px 14px", borderRadius: 8, border: "none", fontSize: "0.65rem", fontWeight: 700, cursor: "pointer" }}>
            + Retake Test
          </button>
          <button onClick={handleSignOut} style={{ padding: "6px 14px", borderRadius: 8, border: `1.5px solid ${C.inkXL}`, background: "transparent", fontSize: "0.65rem", fontWeight: 600, cursor: "pointer", color: C.inkM }}>
            Sign Out
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,2fr)", gap: 12, flex: 1 }}>

        {/* Left — history list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ fontSize: "0.55rem", fontWeight: 700, color: C.inkL, letterSpacing: "0.16em" }}>ASSESSMENT HISTORY</div>
          {results.map((r, i) => {
            const p = getProfile(r.cii_score);
            const isSelected = selected?.id === r.id;
            return (
              <div
                key={r.id}
                onClick={() => setSelected(r)}
                style={{
                  background: isSelected ? C.white : "rgba(255,255,255,0.6)",
                  border: `1.5px solid ${isSelected ? p.color + "50" : C.inkXL + "50"}`,
                  borderRadius: 12, padding: "12px 14px", cursor: "pointer",
                  transition: "all .2s",
                  boxShadow: isSelected ? `0 4px 20px ${p.color}15` : "none",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontSize: "0.55rem", color: C.inkL, marginBottom: 3 }}>
                      {i === 0 ? "🏆 Latest · " : ""}{new Date(r.completed_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </div>
                    <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.6rem", fontWeight: 800, color: p.color, lineHeight: 1 }}>{r.cii_score}</div>
                    <div style={{ fontSize: "0.6rem", color: p.color, fontWeight: 700, marginTop: 2 }}>{r.profile_name}</div>
                  </div>
                  <div style={{ background: `${p.color}15`, border: `1px solid ${p.color}30`, borderRadius: 6, padding: "2px 7px", fontSize: "0.52rem", fontWeight: 700, color: p.color }}>
                    {p.tag}
                  </div>
                </div>
                {/* Mini dim bars */}
                <div style={{ display: "flex", gap: 2, marginTop: 8 }}>
                  {[r.dim_divergent, r.dim_assoc, r.dim_risk, r.dim_vision, r.dim_behavior, r.dim_innovation].map((d, idx) => (
                    <div key={idx} style={{ flex: 1, height: 4, background: `${DIM.colors[idx]}20`, borderRadius: 2, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${d}%`, background: DIM.colors[idx], borderRadius: 2 }} />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right — selected result detail */}
        {selected && selectedProfile && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>

            {/* Score card */}
            <div style={{ background: C.white, borderRadius: 14, padding: "16px 20px", border: `1.5px solid ${selectedProfile.color}30`, boxShadow: `0 4px 24px ${selectedProfile.color}10` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
                <div>
                  <div style={{ fontSize: "0.52rem", color: C.inkL, fontWeight: 700, letterSpacing: "0.16em", marginBottom: 4 }}>CII SCORE</div>
                  <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "3.5rem", fontWeight: 800, color: selectedProfile.color, lineHeight: 1 }}>{selected.cii_score}</div>
                  <div style={{ fontSize: "0.75rem", fontWeight: 700, color: selectedProfile.color, marginTop: 4 }}>{selected.profile_name}</div>
                  <div style={{ fontSize: "0.65rem", color: C.inkM, marginTop: 2 }}>{selectedProfile.desc}</div>
                </div>
                <div style={{ background: `${selectedProfile.color}12`, border: `1.5px solid ${selectedProfile.color}30`, borderRadius: 20, padding: "4px 14px" }}>
                  <span style={{ fontSize: "0.6rem", fontWeight: 700, color: selectedProfile.color }}>{selectedProfile.tag}</span>
                </div>
              </div>
                <button
                    onClick={() => onViewResult(selected)}
                    className="btn-primary"
                    style={{ width: "100%", padding: "10px", borderRadius: 10, border: "none", fontSize: "0.78rem", fontWeight: 700, cursor: "pointer", marginTop: 10 }}
                    >
                    View Full Dashboard →
                </button>
              {selected.ai_persona_type && (
                <div style={{ marginTop: 10, background: `${selectedProfile.color}08`, borderRadius: 8, padding: "8px 12px", fontSize: "0.7rem", color: C.inkM }}>
                  🎭 <strong style={{ color: selectedProfile.color }}>{selected.ai_persona_type}</strong>
                </div>
              )}
            </div>

            {/* Dimension bars */}
            <div style={{ background: C.white, borderRadius: 14, padding: "14px 18px", border: `1.5px solid ${C.inkXL}40` }}>
              <div style={{ fontSize: "0.55rem", fontWeight: 700, color: C.inkL, letterSpacing: "0.16em", marginBottom: 10 }}>DIMENSION BREAKDOWN</div>
              {dims.map((d, i) => (
                <div key={i} style={{ marginBottom: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                    <span style={{ fontSize: "0.62rem", fontWeight: 600, color: C.inkM }}>{DIM.short[i]}</span>
                    <span style={{ fontFamily: "'Playfair Display',serif", fontSize: "0.95rem", fontWeight: 800, color: DIM.colors[i] }}>{d}</span>
                  </div>
                  <div style={{ height: 8, background: `${DIM.colors[i]}15`, borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${d}%`, background: DIM.colors[i], borderRadius: 4 }} />
                  </div>
                </div>
              ))}
            </div>

            {/* AI insights */}
            {(selected.ai_narrative || selected.ai_key_insight) && (
              <div style={{ background: C.white, borderRadius: 14, padding: "14px 18px", border: `1.5px solid ${C.inkXL}40` }}>
                <div style={{ fontSize: "0.55rem", fontWeight: 700, color: C.inkL, letterSpacing: "0.16em", marginBottom: 10 }}>AI INSIGHTS</div>
                {selected.ai_key_insight && (
                  <div style={{ background: `${selectedProfile.color}08`, border: `1px solid ${selectedProfile.color}25`, borderRadius: 8, padding: "10px 12px", marginBottom: 8, fontSize: "0.72rem", color: C.ink, lineHeight: 1.7, fontStyle: "italic" }}>
                    💡 {selected.ai_key_insight}
                  </div>
                )}
                {selected.ai_narrative && (
                  <p style={{ fontSize: "0.72rem", color: C.inkM, lineHeight: 1.8, margin: "0 0 8px" }}>{selected.ai_narrative}</p>
                )}
                {selected.ai_strengths && (
                  <div style={{ marginBottom: 6 }}>
                    <div style={{ fontSize: "0.55rem", fontWeight: 700, color: C.s3, marginBottom: 3 }}>✅ STRENGTHS</div>
                    <p style={{ fontSize: "0.7rem", color: C.inkM, lineHeight: 1.7, margin: 0 }}>{selected.ai_strengths}</p>
                  </div>
                )}
                {selected.ai_blind_spots && (
                  <div>
                    <div style={{ fontSize: "0.55rem", fontWeight: 700, color: C.s4, marginBottom: 3 }}>⚠ BLIND SPOTS</div>
                    <p style={{ fontSize: "0.7rem", color: C.inkM, lineHeight: 1.7, margin: 0 }}>{selected.ai_blind_spots}</p>
                  </div>
                )}
              </div>
            )}

            {/* Score trend if multiple results */}
            {results.length > 1 && (
              <div style={{ background: C.white, borderRadius: 14, padding: "14px 18px", border: `1.5px solid ${C.inkXL}40` }}>
                <div style={{ fontSize: "0.55rem", fontWeight: 700, color: C.inkL, letterSpacing: "0.16em", marginBottom: 10 }}>SCORE TREND</div>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 60 }}>
                  {[...results].reverse().map((r, i) => {
                    const p = getProfile(r.cii_score);
                    const h = Math.max((r.cii_score / 100) * 52, 6);
                    return (
                      <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                        <span style={{ fontSize: "0.5rem", fontWeight: 700, color: p.color }}>{r.cii_score}</span>
                        <div style={{ width: "100%", background: selected.id === r.id ? p.color : `${p.color}50`, borderRadius: "3px 3px 0 0", height: `${h}px`, transition: "height .5s ease" }} />
                        <span style={{ fontSize: "0.42rem", color: C.inkL }}>{new Date(r.completed_at).toLocaleDateString("en-IN", { month: "short", year: "2-digit" })}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}