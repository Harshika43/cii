"use client";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from "recharts";
import { DIM, AVG_BENCHMARK } from "@/constants/dimensions";
import { C }                   from "@/constants/theme";
import type { Profile }        from "@/constants/profiles";

const DIM_TIPS = [
  ["Write 30 uses for a pen daily","Try SCAMPER on a product you use","10-min 'random word + problem' sprints"],
  ["Read one unrelated-field article/week","Connect 3 random nouns in one sentence","Keep a 'pattern journal'"],
  ["Take one small professional risk/week","Practice 'Yes, and…' in your next meeting","Defend a view you disagree with for 5 min"],
  ["Write a 3-year vision letter in present tense","Set one goal with purely intrinsic motivation","Map the world if your best idea fully succeeded"],
  ["Ship one small creative output every 7 days","Redesign one broken process in your life","Track creative output daily"],
  ["Study one famous company pivot","Ask 'What if opposite were true?' on projects","Spend 20 min on a problem that feels unsolvable"],
];

interface Props { dims: number[]; cii: number; profile: Profile }

export function Panel4Radar({ dims, cii, profile }: Props) {
  const radarData = DIM.names.map((n, i) => ({ subject:DIM.abbr[i], score:dims[i], avg:AVG_BENCHMARK[i], fullMark:100 }));
  const sorted    = [...dims.map((d, i) => ({ i, d }))].sort((a, b) => b.d - a.d);
  const top2      = sorted.slice(0, 2);
  const low1      = sorted[sorted.length - 1];
  const low3      = sorted.slice(-3);
  const aboveAvg  = dims.filter((d, i) => d > AVG_BENCHMARK[i]).length;

  const shapeType = (() => {
    const t = top2.map(x => x.i);
    if (t.includes(0) && t.includes(1)) return { label:"Idea Generator", desc:"Strong at producing and connecting novel ideas rapidly." };
    if (t.includes(2) && t.includes(3)) return { label:"Bold Visionary", desc:"High risk tolerance combined with strong future-thinking." };
    if (t.includes(4) && t.includes(5)) return { label:"Creative Executor", desc:"Translates creative thinking into real-world action." };
    return { label:"Balanced Creator", desc:"Relatively even creative profile across all dimensions." };
  })();

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const subj  = payload[0]?.payload?.subject;
    const idx   = DIM.abbr.indexOf(subj);
    const your  = payload.find((p: any) => p.dataKey === "score")?.value;
    const avgV  = payload.find((p: any) => p.dataKey === "avg")?.value;
    const diff  = your - avgV;
    return (
      <div style={{ background:C.white, border:`1px solid ${C.inkXL}`, borderRadius:7, padding:"6px 9px", fontSize:10.5, boxShadow:"0 3px 10px rgba(0,0,0,0.1)" }}>
        <div style={{ fontWeight:700, color:idx>=0?DIM.colors[idx]:C.ink }}>{idx>=0?DIM.short[idx]:subj}</div>
        <div style={{ color:C.inkL }}>You: <b style={{ color:idx>=0?DIM.colors[idx]:C.ink }}>{your}</b> · Avg: <b>{avgV}</b> · <b style={{ color:diff>=0?C.s3:C.s4 }}>{diff>=0?"+":""}{diff}</b></div>
      </div>
    );
  };

  return (
    <div style={{ display:"flex", height:"100%" }}>
      {/* Left segment */}
      <div style={{ width:280, flexShrink:0, display:"flex", flexDirection:"column", padding:"8px 12px", borderRight:`1px solid ${C.inkXL}50`, overflowY:"auto", gap:0 }} className="no-scroll">
        <div style={{ marginBottom:8 }}>
          <div style={{ fontSize:9, color:C.inkL, marginBottom:1, letterSpacing:"0.12em", fontWeight:600 }}>OVERALL CII SCORE</div>
          <div style={{ display:"flex", alignItems:"baseline", gap:4 }}>
            <div style={{ fontFamily:"Playfair Display,serif", fontSize:40, fontWeight:800, color:profile.color, lineHeight:1 }}>{cii}</div>
            <div style={{ fontSize:9.5, color:C.inkL }}>/100</div>
          </div>
          <div style={{ display:"flex", gap:3, marginTop:4, flexWrap:"wrap" }}>
            <div style={{ background:`${profile.color}15`, border:`1px solid ${profile.color}35`, borderRadius:9, padding:"1px 7px" }}>
              <span style={{ fontSize:9, fontWeight:700, color:profile.color }}>{profile.tag}</span>
            </div>
            <div style={{ background:`${C.s3}15`, border:`1px solid ${C.s3}30`, borderRadius:9, padding:"1px 7px" }}>
              <span style={{ fontSize:9, color:C.s3, fontWeight:600 }}>{aboveAvg}/6 above avg</span>
            </div>
          </div>
        </div>
        <div style={{ background:`${profile.color}08`, border:`1px solid ${profile.color}25`, borderRadius:7, padding:"7px 9px", marginBottom:9 }}>
          <div style={{ fontSize:9, color:profile.color, fontWeight:700, letterSpacing:"0.1em", marginBottom:2 }}>◈ CREATIVE SHAPE</div>
          <div style={{ fontSize:12, fontWeight:700, color:C.ink, marginBottom:2 }}>{shapeType.label}</div>
          <p style={{ fontSize:9.5, color:C.inkM, lineHeight:1.5, margin:0 }}>{shapeType.desc}</p>
        </div>
        <div style={{ borderTop:`1px dashed ${C.inkXL}`, paddingTop:7, marginBottom:8 }}>
          <div style={{ fontSize:9, color:C.inkL, marginBottom:5, letterSpacing:"0.12em", fontWeight:600 }}>ALL DIMENSIONS</div>
          {dims.map((d, i) => (
            <div key={i} style={{ display:"flex", alignItems:"center", gap:5, marginBottom:5 }}>
              <div style={{ width:5, height:5, borderRadius:"50%", background:DIM.colors[i], flexShrink:0 }}/>
              <span style={{ fontSize:9, color:C.inkM, width:28, flexShrink:0 }}>{DIM.abbr[i]}</span>
              <div style={{ flex:1, height:3, background:`${DIM.colors[i]}18`, borderRadius:1, overflow:"hidden" }}>
                <div style={{ width:`${d}%`, height:"100%", background:DIM.colors[i] }}/>
              </div>
              <span style={{ fontSize:9, fontWeight:700, color:DIM.colors[i], width:18, textAlign:"right", flexShrink:0 }}>{d}</span>
              <span style={{ fontSize:8.5, color:d>AVG_BENCHMARK[i]?C.s3:C.s4, width:18, textAlign:"right", flexShrink:0, fontWeight:600 }}>
                {d>AVG_BENCHMARK[i]?"+":""}{d-AVG_BENCHMARK[i]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Radar */}
      <div style={{ flex:"0 0 36%", display:"flex", flexDirection:"column", borderRight:`1px solid ${C.inkXL}30` }}>
        <div style={{ flex:1, minHeight:0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData} margin={{ top:16, right:28, bottom:12, left:28 }}>
              <PolarGrid stroke={`${C.inkXL}80`} strokeDasharray="3 3"/>
              <PolarAngleAxis dataKey="subject" tick={{ fill:C.inkL, fontSize:10 }}/>
              <Radar name="Pop. Avg" dataKey="avg" stroke={C.inkXL} fill={C.inkXL} fillOpacity={.2} strokeWidth={1.2} strokeDasharray="4 3"/>
              <Radar name="Your Score" dataKey="score" stroke={profile.color} fill={profile.color} fillOpacity={.18} strokeWidth={2.2}/>
              <Tooltip content={<CustomTooltip/>}/>
            </RadarChart>
          </ResponsiveContainer>
        </div>
        <div style={{ display:"flex", justifyContent:"center", gap:14, padding:"4px 10px 6px", borderTop:`1px solid ${C.inkXL}30`, flexShrink:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:4 }}><div style={{ width:14, height:2, background:profile.color }}/><span style={{ fontSize:9.5, color:C.inkM }}>You</span></div>
          <div style={{ display:"flex", alignItems:"center", gap:4 }}><svg width={14} height={4}><line x1="0" y1="2" x2="14" y2="2" stroke={C.inkXL} strokeWidth={1.2} strokeDasharray="3 2"/></svg><span style={{ fontSize:9.5, color:C.inkM }}>Avg</span></div>
        </div>
      </div>

      {/* Growth areas */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", padding:"6px 8px", gap:5, overflowY:"auto" }} className="no-scroll">
        <div style={{ fontSize:8.5, color:C.inkL, fontWeight:700, letterSpacing:"0.14em", flexShrink:0, marginBottom:2 }}>🎯 GROWTH AREAS — PRACTICE ACTIONS</div>
        {low3.map(({ i, d }) => {
          const color = DIM.colors[i];
          const tips  = DIM_TIPS[i];
          const diff  = AVG_BENCHMARK[i] - d;
          return (
            <div key={i} style={{ flex:1, border:`1.5px solid ${color}35`, borderRadius:9, overflow:"hidden", display:"flex", background:C.white, minHeight:0 }}>
              <div style={{ width:80, flexShrink:0, background:`linear-gradient(160deg,${color}18,${color}06)`, borderRight:`1px solid ${color}25`, padding:"7px 7px", display:"flex", flexDirection:"column", justifyContent:"center", gap:3 }}>
                <div style={{ fontSize:22, fontWeight:800, color, lineHeight:1 }}>{d}<span style={{ fontSize:8.5, color:C.inkL }}>/100</span></div>
                <div style={{ fontSize:9, fontWeight:700, color:diff>0?C.s4:C.s3, lineHeight:1.2 }}>{diff>0?`↓ ${diff} below avg`:`↑ ${-diff} above avg`}</div>
                <div style={{ fontSize:9, fontWeight:700, color }}>{DIM.short[i]}</div>
              </div>
              <div style={{ flex:1, padding:"7px 9px", display:"flex", flexDirection:"column", justifyContent:"center", gap:5 }}>
                <div style={{ fontSize:8, color:C.inkL, fontWeight:700, letterSpacing:"0.12em" }}>PRACTICE ACTIONS</div>
                {tips.slice(0, 2).map((tip, ti) => (
                  <div key={ti} style={{ display:"flex", gap:6, alignItems:"flex-start" }}>
                    <div style={{ width:14, height:14, borderRadius:"50%", background:color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:9, fontWeight:800, color:"#fff", flexShrink:0, marginTop:1 }}>{ti+1}</div>
                    <p style={{ fontSize:9.5, color:C.ink, lineHeight:1.4, margin:0 }}>{tip}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
