"use client";
import { DIM, AVG_BENCHMARK } from "@/constants/dimensions";
import { C }                   from "@/constants/theme";
import type { AIData }         from "@/types/assessment";
import type { Profile }        from "@/constants/profiles";

interface Props {
  aiData:  AIData | null;
  dims:    number[];
  profile: Profile;
}

export function Panel3Analysis({ aiData, dims, profile }: Props) {
  const sorted = dims.map((d, i) => ({ i, d })).sort((a, b) => b.d - a.d);
  const top    = sorted[0];
  const low    = sorted[sorted.length - 1];

  return (
    <div style={{
      height:"100%", padding:"9px 11px",
      display:"flex", flexDirection:"column", gap:5,
      overflowY:"auto", background:"#fafcff",
    }} className="no-scroll">

      {aiData?.persona_type && (
        <div style={{ display:"flex", justifyContent:"flex-end", flexShrink:0 }}>
          <div style={{
            background:`linear-gradient(135deg,${profile.color}15,${profile.color}08)`,
            border:`1px solid ${profile.color}30`, borderRadius:10, padding:"2px 10px",
          }}>
            <span style={{ fontSize:9.5, fontWeight:700, color:profile.color, fontStyle:"italic" }}>{aiData.persona_type}</span>
          </div>
        </div>
      )}

      {aiData ? (
        <>
          {aiData.key_insight && (
            <div style={{
              background:`linear-gradient(120deg,rgba(26,111,196,0.1),rgba(26,111,196,0.04))`,
              border:`1px solid rgba(26,111,196,0.3)`,
              borderRadius:8, padding:"6px 9px", flexShrink:0,
              borderLeft:`3px solid #1A6FC4`,
            }}>
              <div style={{ fontSize:8.5, color:"#1A6FC4", fontWeight:700, letterSpacing:"0.18em", marginBottom:3 }}>✦ KEY INSIGHT</div>
              <p style={{ fontSize:10.5, color:"#0a1628", lineHeight:1.65, fontStyle:"italic", margin:0 }}>{aiData.key_insight}</p>
            </div>
          )}

          <div style={{
            flexShrink:0, background:"rgba(240,245,251,0.8)",
            border:`1px solid #dbe8f5`, borderRadius:8, padding:"6px 9px",
          }}>
            <div style={{ fontSize:8.5, color:"#6b8aaa", fontWeight:700, letterSpacing:"0.16em", marginBottom:4 }}>COGNITIVE PROFILE</div>
            <p style={{ fontSize:10, color:"#0a1628", lineHeight:1.78, margin:0 }}>{aiData.narrative}</p>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:5, flexShrink:0 }}>
            <div style={{
              background:"rgba(13,158,110,0.07)", border:`1px solid rgba(13,158,110,0.25)`,
              borderRadius:8, padding:"5px 8px", borderLeft:`3px solid #0D9E6E`,
            }}>
              <div style={{ display:"flex", alignItems:"center", gap:3, marginBottom:3 }}>
                <span style={{ fontSize:10, color:"#0D9E6E" }}>✓</span>
                <span style={{ fontSize:8.5, color:"#0D9E6E", fontWeight:700, letterSpacing:"0.12em" }}>STRENGTH</span>
              </div>
              <p style={{ fontSize:9.5, color:"#2d4a6e", lineHeight:1.5, margin:0 }}>{aiData.strengths}</p>
            </div>
            <div style={{
              background:"rgba(232,22,43,0.06)", border:`1px solid rgba(232,22,43,0.2)`,
              borderRadius:8, padding:"5px 8px", borderLeft:`3px solid #E8162B`,
            }}>
              <div style={{ display:"flex", alignItems:"center", gap:3, marginBottom:3 }}>
                <span style={{ fontSize:10, color:"#E8162B" }}>→</span>
                <span style={{ fontSize:8.5, color:"#E8162B", fontWeight:700, letterSpacing:"0.12em" }}>BLIND SPOT</span>
              </div>
              <p style={{ fontSize:9.5, color:"#2d4a6e", lineHeight:1.5, margin:0 }}>{aiData.blind_spots}</p>
            </div>
          </div>

          {aiData.improvements && aiData.improvements.length > 0 && (
            <div style={{ flexShrink:0 }}>
              <div style={{ fontSize:8.5, color:"#6b8aaa", fontWeight:700, letterSpacing:"0.16em", marginBottom:4 }}>🎯 AI-RECOMMENDED ACTIONS</div>
              <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
                {aiData.improvements.slice(0, 3).map((imp, idx) => {
                  const di    = imp.dim ?? idx;
                  const color = DIM.colors[di] || "#1A6FC4";
                  return (
                    <div key={idx} style={{
                      display:"flex", gap:6, alignItems:"center",
                      background:`${color}08`, border:`1px solid ${color}22`,
                      borderRadius:7, padding:"5px 8px", borderLeft:`3px solid ${color}`,
                    }}>
                      <div style={{
                        width:16, height:16, borderRadius:"50%",
                        background:`linear-gradient(135deg,${color},${color}cc)`,
                        display:"flex", alignItems:"center", justifyContent:"center",
                        fontSize:9, fontWeight:800, color:"#fff", flexShrink:0,
                        boxShadow:`0 2px 6px ${color}40`,
                      }}>{idx+1}</div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:8.5, color, fontWeight:700, marginBottom:1 }}>{DIM.short[di]}</div>
                        <p style={{ fontSize:9.5, color:"#2d4a6e", lineHeight:1.4, margin:0 }}>{imp.action}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:5, flexShrink:0 }}>
            {[
              { label:"↑ STRONGEST", item:top, bg:"rgba(13,158,110,0.07)", border:"rgba(13,158,110,0.25)" },
              { label:"↓ GROWTH",    item:low, bg:"rgba(26,111,196,0.07)", border:"rgba(26,111,196,0.2)"  },
            ].map(({ label, item, bg, border }) => (
              <div key={label} style={{ background:bg, border:`1px solid ${border}`, borderRadius:8, padding:"14px 16px" }}>
                <div style={{ fontSize:10, color:DIM.colors[item.i], fontWeight:700, letterSpacing:"0.12em", marginBottom:3 }}>{label}</div>
                <div style={{ fontFamily:"Playfair Display,serif", fontSize:32, fontWeight:800, color:DIM.colors[item.i], lineHeight:1, marginBottom:3 }}>{item.d}</div>
                <div style={{ fontSize:11, fontWeight:700, color:"#0a1628", marginBottom:2 }}>{DIM.short[item.i]}</div>
                <div style={{ fontSize:10, color:"#6b8aaa", lineHeight:1.35 }}>{DIM.descs[item.i]}</div>
              </div>
            ))}
          </div>
          <div style={{ flexShrink:0, background:"rgba(240,245,251,0.8)", border:`1px solid #dbe8f5`, borderRadius:8, padding:"10px 12px" }}>
            <div style={{ fontSize:8.5, color:"#6b8aaa", fontWeight:700, letterSpacing:"0.14em", marginBottom:8 }}>DIMENSION SPREAD · vs population average</div>
            {dims.map((d, i) => {
              const avg  = AVG_BENCHMARK[i];
              const diff = d - avg;
              return (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                  <span style={{ fontSize:9, color:"#6b8aaa", width:28, flexShrink:0, textAlign:"right" }}>{DIM.abbr[i]}</span>
                  <div style={{ flex:1, position:"relative", height:10, background:`${DIM.colors[i]}12`, borderRadius:5, overflow:"hidden" }}>
                    <div style={{ position:"absolute", top:0, bottom:0, left:0, width:`${d}%`, background:`linear-gradient(to right,${DIM.colors[i]}70,${DIM.colors[i]})`, borderRadius:4 }}/>
                    <div style={{ position:"absolute", top:0, bottom:0, left:`${avg}%`, width:2, background:"#2d4a6e", opacity:0.4 }}/>
                  </div>
                  <span style={{ fontSize:9.5, fontWeight:800, color:DIM.colors[i], width:22, textAlign:"right", flexShrink:0 }}>{d}</span>
                  <span style={{ fontSize:8.5, fontWeight:700, color:diff>=0?"#0D9E6E":"#E8162B", width:24, flexShrink:0 }}>
                    {diff>=0?`+${diff}`:`${diff}`}
                  </span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
