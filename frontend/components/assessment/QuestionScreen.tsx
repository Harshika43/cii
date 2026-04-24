"use client";
import { SECS } from "@/constants/sections";
import { Qs }   from "@/constants/questions";
import { C }    from "@/constants/theme";
import { LiveBackground } from "@/components/ui/LiveBackground";
import type { Answers } from "@/types/assessment";

const TYPE_LABEL: Record<string,string> = {
  open:     "OPEN-ENDED · AI SCORED",
  rat:      "REMOTE ASSOCIATES TEST",
  likert:   "SELF-ASSESSMENT",
  mcq:      "BEHAVIORAL",
  scenario: "SCENARIO CHALLENGE",
};

interface Props {
  q: typeof Qs[number];
  qi: number;
  total: number;
  answers: Answers;
  setAnswer: (v: string | number) => void;
  onNext: () => void;
  onBack: () => void;
  canGo: boolean;
}

export function QuestionScreen({ q, qi, total, answers, setAnswer, onNext, onBack, canGo }: Props) {
  const sec       = SECS.find(s => s.id === q.s)!;
  const typeLabel = TYPE_LABEL[q.type];
  const secQs     = Qs.filter(x => x.s === q.s);
  const posInSec  = secQs.findIndex(x => x.id === q.id) + 1;
  const autoTypes = ["likert","mcq","rat","scenario"];

  const handleSelect = (val: string | number) => {
    setAnswer(val);
    if (autoTypes.includes(q.type)) setTimeout(() => onNext(), 320);
  };

  return (
    <div className="q-screen-root" style={{
      minHeight:"100dvh", width:"100vw",
      display:"flex", flexDirection:"column", position:"relative",
    }}>
      <LiveBackground/>

      {/* Top progress bar */}
      <div style={{ height:4, background:C.inkXL, flexShrink:0, position:"sticky", top:0, zIndex:20 }}>
        <div className="progress-glow" style={{
          height:"100%", width:`${(qi+1)/total*100}%`,
          background:`linear-gradient(to right,${sec.color}80,${sec.color})`,
          transition:"width .4s ease",
        }}/>
      </div>

      {/* Header bar */}
      <div style={{
        padding:"0.55rem 1.2rem",
        display:"flex", justifyContent:"space-between", alignItems:"center",
        borderBottom:`1px solid rgba(26,111,196,0.1)`,
        background:"rgba(240,245,251,0.95)", backdropFilter:"blur(12px)",
        flexShrink:0, position:"sticky", top:4, zIndex:10,
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:8, height:8, borderRadius:"50%", background:sec.color, boxShadow:`0 0 6px ${sec.color}80` }}/>
          <span style={{ fontSize:"0.6rem", fontWeight:800, letterSpacing:"0.18em", color:sec.color }}>{sec.short}</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <span style={{ fontSize:"0.65rem", color:C.inkL, fontWeight:600 }}>{posInSec}/{secQs.length}</span>
          <div style={{ background:`${sec.color}12`, border:`1px solid ${sec.color}25`, borderRadius:8, padding:"2px 9px" }}>
            <span style={{ fontSize:"0.72rem", fontWeight:800, color:sec.color }}>{qi+1}<span style={{ color:C.inkL, fontWeight:500 }}>/{total}</span></span>
          </div>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="q-content-scroll" style={{
        flex:1, overflowY:"auto",
        padding:"clamp(20px,3vh,48px) clamp(20px,5vw,60px)",
        display:"flex", justifyContent:"center", alignItems:"center",
        position:"relative", zIndex:1,
      }}>
        <div style={{ width:"100%", maxWidth:"min(860px,92vw)" }} key={q.id} className="fu">

          {/* Illustration banner */}
          <div className="glass-card q-illus-banner" style={{
            width:"100%", height:"clamp(80px,11vh,110px)",
            borderRadius:16, overflow:"hidden",
            marginBottom:"clamp(16px,2.5vh,28px)",
            border:`1.5px solid ${sec.color}22`,
          }}>
            {q.type === "scenario" ? (
              <div style={{
                height:"100%", display:"flex", alignItems:"center", justifyContent:"center", gap:16,
                background:`linear-gradient(135deg,${sec.color}10,${sec.color}18)`,
              }}>
                <div style={{
                  width:52, height:52, borderRadius:"50%",
                  background:`${sec.color}18`, border:`1.5px solid ${sec.color}35`,
                  display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.8rem",
                }}>{(q as any).scene}</div>
                <div>
                  <div style={{ fontSize:"0.58rem", letterSpacing:"0.25em", color:sec.color, fontWeight:800, marginBottom:2 }}>{(q as any).sceneLabel}</div>
                  <div style={{ fontSize:"0.75rem", color:C.inkM, lineHeight:1.4 }}>Scenario Challenge</div>
                </div>
              </div>
            ) : (
              <div style={{
                height:"100%", display:"flex", alignItems:"center",
                padding:"0 1.4rem", gap:"1rem",
                background:`linear-gradient(135deg,${sec.color}06,${sec.color}12)`,
              }}>
                <div style={{ width:"clamp(50px,7vw,76px)", flexShrink:0 }}>{(q as any).illus}</div>
                <div style={{ borderLeft:`2px solid ${sec.color}25`, paddingLeft:"0.9rem" }}>
                  <div style={{
                    display:"inline-flex", alignItems:"center", gap:5,
                    background:`${sec.color}12`, borderRadius:8, padding:"2px 9px", marginBottom:4,
                  }}>
                    <span style={{ fontSize:"0.52rem", letterSpacing:"0.22em", color:sec.color, fontWeight:800 }}>{typeLabel}</span>
                  </div>
                  <div style={{ fontSize:"0.72rem", color:C.inkM, lineHeight:1.45 }}>
                    {q.type === "open" ? "Evaluated by AI for originality & depth"
                     : q.type === "rat" ? "Find the single hidden connection"
                     : "Respond honestly — no right or wrong"}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Q label */}
          <div style={{
            display:"inline-flex", alignItems:"center", gap:6,
            background:`${sec.color}10`, border:`1px solid ${sec.color}25`,
            borderRadius:8, padding:"2px 10px", marginBottom:"0.6rem",
          }}>
            <div style={{ width:5, height:5, borderRadius:"50%", background:sec.color }}/>
            <span style={{ fontSize:"0.58rem", letterSpacing:"0.22em", color:sec.color, fontWeight:800 }}>
              Q{qi+1} · {typeLabel}
            </span>
          </div>

          {/* Question text */}
          <h2 style={{
            fontFamily:"'Playfair Display',serif",
            fontSize:"clamp(1.2rem,2.6vw,1.85rem)",
            fontWeight:700, color:C.ink, lineHeight:1.5,
            marginBottom:"clamp(16px,2.5vh,30px)",
          }}>{q.text}</h2>

          {/* RAT word chips */}
          {q.type === "rat" && (
            <div style={{ display:"flex", gap:8, marginBottom:"1.2rem", flexWrap:"wrap" }}>
              {(q as any).words.map((w: string) => (
                <div key={w} style={{
                  background:"rgba(255,255,255,0.8)",
                  border:`2px solid ${sec.color}50`,
                  borderRadius:12, padding:"0.55rem 1.1rem",
                  fontSize:"clamp(0.9rem,2vw,1.2rem)",
                  fontWeight:800, color:sec.color, letterSpacing:"0.1em",
                }}>{w}</div>
              ))}
            </div>
          )}

          {/* Open hint */}
          {q.type === "open" && (q as any).hint && (
            <div style={{
              background:`${sec.color}08`, borderLeft:`3px solid ${sec.color}`,
              borderRadius:"0 12px 12px 0", padding:"0.65rem 1rem",
              marginBottom:"0.9rem", fontSize:"0.8rem", color:sec.color,
              lineHeight:1.65, fontStyle:"italic",
            }}>💡 {(q as any).hint}</div>
          )}

          {/* Open textarea */}
          {q.type === "open" && (
            <>
              <textarea
                value={(answers[q.id] as string) || ""}
                onChange={e => setAnswer(e.target.value)}
                placeholder={(q as any).ph} rows={8}
                style={{
                  width:"100%", background:"rgba(255,255,255,0.85)",
                  border:`1.5px solid rgba(26,111,196,0.2)`,
                  borderRadius:14, padding:"1.1rem 1.2rem",
                  color:C.ink, fontSize:"clamp(0.92rem,1.6vw,1.08rem)",
                  lineHeight:1.9, resize:"vertical", minHeight:160,
                  backdropFilter:"blur(8px)", transition:"all .2s",
                }}
                onFocus={e => { e.target.style.borderColor=sec.color; e.target.style.boxShadow=`0 0 0 3px ${sec.color}18`; }}
                onBlur={e  => { e.target.style.borderColor="rgba(26,111,196,0.2)"; e.target.style.boxShadow="none"; }}
              />
              <div style={{ fontSize:"0.7rem", color:C.inkL, marginTop:6, display:"flex", justifyContent:"space-between" }}>
                <span style={{ fontStyle:"italic" }}>More specific & unexpected = higher score</span>
                <span style={{ fontWeight:700, color:sec.color, background:`${sec.color}10`, borderRadius:6, padding:"1px 8px" }}>
                  {((answers[q.id] as string) || "").split("\n").filter(l => l.trim().length > 2).length} ideas
                </span>
              </div>
            </>
          )}

          {/* MCQ / RAT / Scenario options */}
          {(q.type === "rat" || q.type === "mcq" || q.type === "scenario") && (
            <div style={{ display:"flex", flexDirection:"column", gap:"0.55rem" }}>
              {(q as any).options.map((opt: string, i: number) => {
                const val = q.type === "rat" ? opt : i;
                const sel = answers[q.id] === val;
                return (
                  <button key={i} onClick={() => handleSelect(val)} style={{
                    background:  sel ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.6)",
                    border:      `1.5px solid ${sel ? sec.color : "rgba(26,111,196,0.15)"}`,
                    borderRadius:14, padding:"1rem 1.1rem",
                    color:       sel ? C.ink : C.inkM,
                    fontSize:    "clamp(0.88rem,1.5vw,1rem)",
                    textAlign:   "left", cursor:"pointer",
                    fontWeight:  sel ? 600 : 400, lineHeight:1.6,
                    display:"flex", alignItems:"flex-start", gap:11,
                    boxShadow:   sel ? `0 4px 16px ${sec.color}25` : "0 1px 4px rgba(13,43,82,0.06)",
                    transition:"all .15s cubic-bezier(.22,1,.36,1)",
                    width:"100%",
                  }}>
                    <span style={{
                      flexShrink:0, width:28, height:28, borderRadius:8,
                      background:sel ? sec.color : `${sec.color}12`,
                      display:"flex", alignItems:"center", justifyContent:"center",
                      fontSize:"0.68rem", fontWeight:800,
                      color:sel ? "#fff" : sec.color,
                    }}>{String.fromCharCode(65+i)}</span>
                    {opt}
                  </button>
                );
              })}
            </div>
          )}

          {/* Likert scale */}
          {q.type === "likert" && (
            <div>
              <div style={{ display:"flex", gap:"0.55rem", marginBottom:"0.6rem" }}>
                {[1,2,3,4,5].map(v => {
                  const sel = answers[q.id] === v;
                  const colors = ["#E8162B","#F07C1A","#6b8aaa",`${sec.color}90`,sec.color];
                  return (
                    <button key={v} onClick={() => handleSelect(v)} style={{
                      flex:1, height:"clamp(60px,8vh,80px)",
                      background:  sel ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.55)",
                      border:      `1.5px solid ${sel ? colors[v-1] : "rgba(26,111,196,0.15)"}`,
                      borderRadius:14, color:sel ? colors[v-1] : C.inkL,
                      fontSize:"clamp(1rem,2.5vw,1.3rem)", fontWeight:700, cursor:"pointer",
                      display:"flex", alignItems:"center", justifyContent:"center",
                      flexDirection:"column", gap:4,
                      boxShadow:sel ? `0 4px 16px ${colors[v-1]}30` : "0 1px 4px rgba(13,43,82,0.05)",
                      transition:"all .15s cubic-bezier(.22,1,.36,1)",
                    }}>
                      {v}
                      {sel && <div style={{ width:5, height:5, borderRadius:"50%", background:colors[v-1] }}/>}
                    </button>
                  );
                })}
              </div>
              <div style={{ display:"flex", justifyContent:"space-between" }}>
                <span style={{ fontSize:"0.68rem", color:C.inkL, fontStyle:"italic" }}>Strongly Disagree</span>
                <span style={{ fontSize:"0.68rem", color:C.inkL, fontStyle:"italic" }}>Strongly Agree</span>
              </div>
            </div>
          )}

          <div style={{ height:16 }}/>
        </div>
      </div>

      {/* Bottom nav bar */}
      <div className="q-bottom-nav" style={{
        padding:"0.65rem 1.2rem",
        borderTop:`1px solid rgba(26,111,196,0.1)`,
        background:"rgba(240,245,251,0.96)", backdropFilter:"blur(12px)",
        display:"flex", justifyContent:"space-between", alignItems:"center",
        flexShrink:0, zIndex:20,
        boxShadow:"0 -4px 20px rgba(13,43,82,0.06)",
      }}>
        <button onClick={onBack} disabled={qi===0} style={{
          background: qi===0 ? "transparent" : "rgba(13,43,82,0.06)",
          border:`1.5px solid ${qi===0 ? C.inkXL : "rgba(26,111,196,0.2)"}`,
          borderRadius:10, padding:"0.5rem 0.9rem",
          color:qi===0?C.inkXL:C.inkM, cursor:qi===0?"default":"pointer",
          fontSize:"0.78rem", fontWeight:600,
        }}>← Back</button>

        {/* Section dots */}
        <div style={{ display:"flex", gap:5, alignItems:"center" }}>
          {SECS.map(s => {
            const sQs   = Qs.filter(x => x.s === s.id);
            const active = sQs.some(x => x.id === q.id);
            const done   = sQs.every(x => answers[x.id] !== undefined && answers[x.id] !== null && answers[x.id] !== "");
            return (
              <div key={s.id} style={{
                width:active?20:8, height:4, borderRadius:2,
                background: done
                  ? `linear-gradient(to right,${s.color}80,${s.color})`
                  : active ? s.color : C.inkXL,
                boxShadow:active?`0 0 6px ${s.color}60`:"none",
                transition:"all .3s ease",
              }}/>
            );
          })}
        </div>

        <button onClick={onNext} disabled={!canGo} style={{
          background: canGo ? `linear-gradient(135deg,${sec.color},${sec.color}cc)` : C.inkXL,
          border:"none", borderRadius:10,
          padding:"0.5rem 1.1rem", color:"#fff",
          cursor:canGo?"pointer":"default",
          fontSize:"0.78rem", fontWeight:700,
          opacity:canGo?1:0.5,
          boxShadow:canGo?`0 3px 12px ${sec.color}40`:"none",
        }}>
          {qi===total-1?"Analyze →":"Next →"}
        </button>
      </div>
    </div>
  );
}
