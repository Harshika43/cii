"use client";
import { DIM } from "@/constants/dimensions";
import { PROFILES } from "@/constants/profiles";
import type { Profile } from "@/constants/profiles";

interface Props { dims: number[]; profile: Profile }

export function Panel5Rings({ dims, profile }: Props) {
  const cx = 130, cy = 130;
  const rings = DIM.short.map((name, i) => ({ name, score:dims[i], color:DIM.colors[i], r:38+i*16 }));
  const cii   = Math.round(dims.reduce((s, d, i) => s + d * DIM.weights[i], 0));

  return (
    <div style={{ display:"flex", height:"100%" }}>
      <div style={{ flex:"0 0 54%", display:"flex", alignItems:"center", justifyContent:"center", padding:"6px 0 6px 6px" }}>
        <svg width={260} height={260} viewBox="0 0 260 260">
          {rings.map(({ r, color, score }, i) => {
            const circ   = 2 * Math.PI * r;
            const filled = circ * (score / 100);
            const gap    = circ - filled;
            return (
              <g key={i}>
                <circle cx={cx} cy={cy} r={r} fill="none" stroke={`${color}20`} strokeWidth={10}/>
                <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={8}
                  strokeLinecap="round" strokeDasharray={`${filled} ${gap}`}
                  transform={`rotate(-90 ${cx} ${cy})`} opacity={.85}/>
              </g>
            );
          })}
          <text x={cx} y={cy-12} textAnchor="middle" fontFamily="Playfair Display,serif" fontSize={12} fontWeight={700} fill={profile.color}>CII</text>
          <text x={cx} y={cy+15} textAnchor="middle" fontFamily="Playfair Display,serif" fontSize={26} fontWeight={800} fill={profile.color}>{cii}</text>
        </svg>
      </div>
      <div style={{ flex:1, display:"flex", flexDirection:"column", justifyContent:"center", padding:"10px 8px 10px 4px", borderLeft:`1px solid rgba(194,212,232,0.4)`, gap:6 }}>
        <div style={{ fontSize:11, color:"#6b8aaa", letterSpacing:"0.12em", fontWeight:600, marginBottom:2 }}>EACH RING = ONE DIMENSION</div>
        {rings.map((d, i) => (
          <div key={i} style={{ display:"flex", alignItems:"center", gap:6, marginBottom:3 }}>
            <div style={{ width:10, height:10, borderRadius:"50%", background:d.color, flexShrink:0 }}/>
            <span style={{ fontSize:12, color:"#2d4a6e", flex:1 }}>{d.name}</span>
            <div style={{ width:35, height:4, background:`${d.color}20`, borderRadius:2, overflow:"hidden" }}>
              <div style={{ width:`${d.score}%`, height:"100%", background:d.color }}/>
            </div>
            <span style={{ fontSize:12.5, fontWeight:800, color:d.color, width:24, textAlign:"right" }}>{d.score}</span>
          </div>
        ))}
        <div style={{ borderTop:"1px dashed rgba(194,212,232,1)", paddingTop:6, marginTop:1 }}>
          {PROFILES.map(p => (
            <div key={p.name} style={{ display:"flex", alignItems:"center", gap:3, marginBottom:2, opacity:profile.name===p.name?1:.28 }}>
              <div style={{ width:6, height:6, borderRadius:"50%", background:p.color, flexShrink:0 }}/>
              <span style={{ fontSize:10, color:profile.name===p.name?p.color:"#6b8aaa", fontWeight:profile.name===p.name?700:500 }}>{p.range} · {p.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
