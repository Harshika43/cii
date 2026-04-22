"use client";
import { useState } from "react";
import { DIM } from "@/constants/dimensions";
import type { AssessmentResults, AIData } from "@/types/assessment";
import type { Profile } from "@/constants/profiles";

interface Props {
  cii:     number;
  profile: Profile;
  dims:    number[];
  aiData:  AIData | null;
}

export function Panel1Score({ cii, profile, dims, aiData }: Props) {
  const r = 68, cx = 104, cy = 90;
  const circ  = Math.PI * r;
  const filled = circ * (cii / 100);
  const gap    = circ - filled;
  const ticks  = [0, 25, 50, 75, 100];
  const sorted = dims.map((d, i) => ({ i, d })).sort((a, b) => b.d - a.d);
  const top3   = sorted.slice(0, 3);
  const strengthIcons = ["💡","🔗","🎲","🔭","⚙️","🚀"];

  return (
    <div style={{ height:"100%", display:"flex", flexDirection:"column", background:"#fafcff" }}>
      {/* Gauge */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", padding:"10px 6px 4px" }}>
        <svg width={208} height={108} style={{ overflow:"visible" }}>
          <defs>
            <linearGradient id="gaugeGrad1" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={profile.color} stopOpacity=".5"/>
              <stop offset="100%" stopColor={profile.color}/>
            </linearGradient>
          </defs>
          <path d={`M ${cx-r} ${cy} A ${r} ${r} 0 0 1 ${cx+r} ${cy}`}
            fill="none" stroke="#dbe8f5" strokeWidth={13} strokeLinecap="round"/>
          <path d={`M ${cx-r} ${cy} A ${r} ${r} 0 0 1 ${cx+r} ${cy}`}
            fill="none" stroke="url(#gaugeGrad1)" strokeWidth={13}
            strokeLinecap="round"
            strokeDasharray={`${filled} ${gap}`}
            style={{ transition:"stroke-dasharray 1.5s cubic-bezier(.22,1,.36,1)" }}/>
          {ticks.map(t => {
            const angle = Math.PI * (1 - t / 100);
            const ix = cx + (r+2)  * Math.cos(angle), iy = cy - (r+2)  * Math.sin(angle);
            const ox = cx + (r+9)  * Math.cos(angle), oy = cy - (r+9)  * Math.sin(angle);
            const lx = cx + (r+17) * Math.cos(angle), ly = cy - (r+17) * Math.sin(angle);
            return (
              <g key={t}>
                <line x1={ix} y1={iy} x2={ox} y2={oy} stroke="#c2d4e8" strokeWidth={1}/>
                <text x={lx} y={ly+3} textAnchor="middle" fontSize={9} fill="#6b8aaa" fontFamily="DM Sans,sans-serif">{t}</text>
              </g>
            );
          })}
          <text x={cx} y={cy-16} textAnchor="middle" fontFamily="Playfair Display,serif"
            fontSize={42} fontWeight={800} fill={profile.color}>{cii}</text>
          <text x={cx} y={cy-3} textAnchor="middle" fontFamily="DM Sans,sans-serif"
            fontSize={9} fill="#6b8aaa" letterSpacing="2">CII SCORE</text>
        </svg>
      </div>

      {/* Profile badge */}
      <div style={{ textAlign:"center", marginTop:-4, marginBottom:8 }}>
        <div style={{
          display:"inline-flex", alignItems:"center", gap:5,
          background:`${profile.color}12`, border:`1.5px solid ${profile.color}35`,
          borderRadius:20, padding:"3px 10px", marginBottom:4,
        }}>
          <div style={{ width:5, height:5, borderRadius:"50%", background:profile.color }}/>
          <span style={{ fontSize:10, fontWeight:700, color:profile.color, letterSpacing:"0.1em" }}>{profile.tag}</span>
        </div>
        <div style={{ fontFamily:"Playfair Display,serif", fontSize:14, fontWeight:800, color:"#0a1628", lineHeight:1.2 }}>
          {profile.name}
        </div>
      </div>

      {/* Description + top strengths */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", justifyContent:"center", padding:"0 10px 10px", gap:5 }}>
        <p style={{ fontSize:11, color:"#2d4a6e", lineHeight:1.6, marginBottom:3 }}>{profile.desc}</p>
        <div style={{ fontSize:9.5, color:"#1A6FC4", fontWeight:700, letterSpacing:"0.16em", display:"flex", alignItems:"center", gap:4, marginBottom:3 }}>
          <span style={{ color:"#F07C1A" }}>★</span> TOP STRENGTHS
        </div>
        {top3.map(({ i, d }, rank) => (
          <div key={i} style={{
            display:"flex", alignItems:"center", gap:6,
            background: rank === 0 ? `${DIM.colors[i]}10` : `${DIM.colors[i]}06`,
            border:`1px solid ${DIM.colors[i]}${rank===0?"30":"18"}`,
            borderRadius:8, padding:"5px 8px",
            borderLeft:`3px solid ${DIM.colors[i]}`,
          }}>
            <span style={{ fontSize:13, flexShrink:0 }}>{strengthIcons[i]}</span>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:10, fontWeight:700, color:DIM.colors[i] }}>{DIM.short[i]}</div>
              <div style={{ fontSize:8.5, color:"#6b8aaa", lineHeight:1.2 }}>{DIM.descs[i]}</div>
            </div>
            <div style={{ fontFamily:"Playfair Display,serif", fontSize:18, fontWeight:800, color:DIM.colors[i] }}>{d}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
