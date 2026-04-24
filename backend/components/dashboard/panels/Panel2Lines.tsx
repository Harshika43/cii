"use client";
import { useState } from "react";
import { DIM } from "@/constants/dimensions";
import { C }   from "@/constants/theme";

interface Props { dims: number[] }

export function Panel2Lines({ dims }: Props) {
  const [hover, setHover] = useState<number | null>(null);
  const xLabels = ["Q1","Q2","Q3","Q4","Q5","Final"];
  const nX = xLabels.length;
  const seeds = [[.55,.72,.48,.81,.63,1],[.80,.55,.90,.62,.75,1],[.45,.78,.60,.88,.70,1],[.70,.50,.85,.58,.90,1],[.60,.82,.52,.74,.88,1],[.50,.68,.78,.55,.82,1]];
  const lines = dims.map((d, i) => ({
    color:    DIM.colors[i],
    abbr:     DIM.abbr[i],
    fullName: DIM.short[i],
    score:    d,
    pts:      seeds[i].map(s => Math.round(Math.min(100, Math.max(4, d * s)))),
  }));
  const avgPts = [47,52,49,53,50,50];
  const VW=320,VH=170,PL=28,PR=12,PT=10,PB=28,CW=VW-PL-PR,CH=VH-PT-PB;
  const xPos = (xi: number) => PL + (xi / (nX - 1)) * CW;
  const yPos = (v: number)  => PT + CH - (v / 100) * CH;
  const toPath = (pts: number[]) => pts.map((v, xi) => `${xi===0?"M":"L"}${xPos(xi).toFixed(1)},${yPos(v).toFixed(1)}`).join(" ");
  const yTicks = [0,20,40,60,80,100];

  return (
    <div style={{ height:"100%", display:"flex", flexDirection:"column", padding:"6px 8px 4px" }}>
      <div style={{ flex:1, minHeight:0, display:"flex", alignItems:"stretch" }}>
        <svg viewBox={`0 0 ${VW} ${VH}`} preserveAspectRatio="xMidYMid meet" style={{ width:"100%", height:"100%", display:"block" }}>
          {yTicks.map(t => (
            <g key={t}>
              <line x1={PL} y1={yPos(t)} x2={VW-PR} y2={yPos(t)} stroke={t===0?"#c8c4be":`${C.inkXL}70`} strokeWidth={t===0?.8:.5} strokeDasharray={t===0?"none":"3 3"}/>
              <text x={PL-4} y={yPos(t)+3.5} textAnchor="end" fontSize={10} fill={C.inkL} fontFamily="DM Sans,sans-serif">{t}%</text>
            </g>
          ))}
          {xLabels.map((l, xi) => (
            <g key={xi}>
              <line x1={xPos(xi)} y1={PT} x2={xPos(xi)} y2={PT+CH} stroke={`${C.inkXL}40`} strokeWidth={.4}/>
              <text x={xPos(xi)} y={VH-PT+5} textAnchor="middle" fontSize={10} fill={C.inkL} fontFamily="DM Sans,sans-serif">{l}</text>
            </g>
          ))}
          <path d={toPath(avgPts)} fill="none" stroke={C.inkXL} strokeWidth={1} strokeDasharray="5 4" opacity={.8}/>
          {[...Array(6).keys()]
            .sort((a,b) => (hover===b?1:0)-(hover===a?1:0))
            .map(i => {
              const ln = lines[i];
              const isHov = hover === i;
              const faded = hover !== null && !isHov;
              return (
                <g key={i} style={{ cursor:"pointer" }}
                  onMouseEnter={() => setHover(i)}
                  onMouseLeave={() => setHover(null)}>
                  <path d={toPath(ln.pts)} fill="none" stroke="transparent" strokeWidth={10}/>
                  <path d={toPath(ln.pts)} fill="none" stroke={ln.color}
                    strokeWidth={isHov?2.2:1.3} opacity={faded?.18:1} strokeLinejoin="round"/>
                  {ln.pts.map((v, xi) => (
                    <circle key={xi} cx={xPos(xi)} cy={yPos(v)}
                      r={isHov?3.2:xi===nX-1?2.5:1.6}
                      fill={ln.color} opacity={faded?.18:1}
                      stroke={isHov||xi===nX-1?C.white:"none"}
                      strokeWidth={isHov||xi===nX-1?1.2:0}/>
                  ))}
                </g>
              );
            })}
          {hover !== null && (() => {
            const ln = lines[hover];
            return (
              <g>
                <rect x={PL} y={PT} width={72} height={22} rx={4} fill={C.white} stroke={ln.color} strokeWidth={.8} opacity={.97}/>
                <text x={PL+36} y={PT+8} textAnchor="middle" fontSize={9.5} fontWeight="700" fill={ln.color} fontFamily="DM Sans,sans-serif">{ln.fullName}</text>
                <text x={PL+36} y={PT+16} textAnchor="middle" fontSize={9.5} fill={C.inkM} fontFamily="DM Sans,sans-serif">Score: {ln.score}/100</text>
              </g>
            );
          })()}
        </svg>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"2px 8px", borderTop:`1px solid ${C.inkXL}40`, paddingTop:4, flexShrink:0 }}>
        {lines.map((ln, i) => (
          <div key={i} style={{ display:"flex", alignItems:"center", gap:4, cursor:"pointer", opacity:hover!==null&&hover!==i?.3:1, transition:"opacity .18s" }}
            onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
            <svg width={18} height={7}>
              <line x1="0" y1="3.5" x2="18" y2="3.5" stroke={ln.color} strokeWidth={1.8}/>
              <circle cx="9" cy="3.5" r="2.2" fill={ln.color}/>
            </svg>
            <span style={{ fontSize:9.5, color:C.inkM, flex:1, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{ln.fullName}</span>
            <span style={{ fontSize:10, fontWeight:700, color:ln.color, flexShrink:0 }}>{ln.score}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
