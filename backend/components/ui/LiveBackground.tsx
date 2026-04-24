"use client";
import { useMemo } from "react";

export function LiveBackground() {
  const particles = useMemo(() => [
    {w:14,h:14,left:"8%",   dur:18,delay:0, type:"circle"},
    {w:8, h:8, left:"18%",  dur:24,delay:3, type:"circle"},
    {w:20,h:20,left:"28%",  dur:20,delay:6, type:"hex"},
    {w:6, h:6, left:"38%",  dur:16,delay:1, type:"circle"},
    {w:16,h:16,left:"48%",  dur:22,delay:8, type:"hex"},
    {w:10,h:10,left:"58%",  dur:19,delay:4, type:"circle"},
    {w:24,h:24,left:"68%",  dur:26,delay:2, type:"hex"},
    {w:7, h:7, left:"78%",  dur:17,delay:9, type:"circle"},
    {w:18,h:18,left:"88%",  dur:21,delay:5, type:"hex"},
    {w:12,h:12,left:"94%",  dur:23,delay:7, type:"circle"},
    {w:9, h:9, left:"5%",   dur:28,delay:11,type:"hex"},
    {w:15,h:15,left:"33%",  dur:15,delay:13,type:"circle"},
    {w:22,h:22,left:"72%",  dur:25,delay:10,type:"hex"},
    {w:5, h:5, left:"52%",  dur:14,delay:14,type:"circle"},
    {w:11,h:11,left:"83%",  dur:27,delay:6, type:"hex"},
  ], []);

  return (
    <div className="live-bg">
      {/* Animated gradient mesh */}
      <div style={{
        position:"absolute", inset:0,
        background:`
          radial-gradient(ellipse 80% 60% at 20% 20%, rgba(26,111,196,0.18) 0%, transparent 60%),
          radial-gradient(ellipse 60% 80% at 80% 10%, rgba(13,43,82,0.22) 0%, transparent 55%),
          radial-gradient(ellipse 70% 50% at 50% 90%, rgba(74,159,224,0.12) 0%, transparent 60%),
          radial-gradient(ellipse 40% 40% at 90% 60%, rgba(232,22,43,0.06) 0%, transparent 50%),
          linear-gradient(160deg, #e8f1fb 0%, #f0f5fb 40%, #eaf2ff 70%, #f5f8fd 100%)
        `,
        backgroundSize:"200% 200%",
        animation:"gradShift 12s ease infinite",
      }}/>

      {/* Grid lines */}
      <svg style={{position:"absolute",inset:0,width:"100%",height:"100%",opacity:0.04}} preserveAspectRatio="none">
        {[...Array(8)].map((_,i)=>(
          <line key={`v${i}`} x1={`${i*14.28}%`} y1="0" x2={`${i*14.28}%`} y2="100%"
            stroke="#1A6FC4" strokeWidth="1"/>
        ))}
        {[...Array(6)].map((_,i)=>(
          <line key={`h${i}`} x1="0" y1={`${i*20}%`} x2="100%" y2={`${i*20}%`}
            stroke="#1A6FC4" strokeWidth="1"/>
        ))}
      </svg>

      {/* Circuit top-right */}
      <svg style={{position:"absolute",top:0,right:0,width:"min(420px,45vw)",height:"auto",opacity:0.07}}
        viewBox="0 0 400 300" fill="none">
        <circle cx="350" cy="50" r="120" stroke="#1A6FC4" strokeWidth="1.5"/>
        <circle cx="350" cy="50" r="80"  stroke="#1A6FC4" strokeWidth="1"/>
        <circle cx="350" cy="50" r="40"  stroke="#4A9FE0" strokeWidth="1.5"/>
        <line x1="350" y1="0" x2="350" y2="300" stroke="#1A6FC4" strokeWidth="0.8"/>
        <line x1="200" y1="50" x2="400" y2="50" stroke="#1A6FC4" strokeWidth="0.8"/>
        <path d="M 80 200 L 120 160 L 160 180 L 200 120 L 240 140 L 280 80"
          stroke="#4A9FE0" strokeWidth="1.2" fill="none"/>
        <circle cx="80"  cy="200" r="4" fill="#1A6FC4"/>
        <circle cx="280" cy="80"  r="4" fill="#4A9FE0"/>
      </svg>

      {/* Circuit bottom-left */}
      <svg style={{position:"absolute",bottom:0,left:0,width:"min(320px,35vw)",height:"auto",opacity:0.06}}
        viewBox="0 0 300 250" fill="none">
        <circle cx="50" cy="200" r="100" stroke="#0D2B52" strokeWidth="1.5"/>
        <circle cx="50" cy="200" r="60"  stroke="#1A6FC4" strokeWidth="1"/>
        <path d="M 80 50 L 120 90 L 180 70 L 220 110 L 280 90"
          stroke="#1A6FC4" strokeWidth="1.2" fill="none" strokeDasharray="6 4"/>
      </svg>

      {/* Floating particles */}
      {particles.map((p,i)=>(
        <div key={i}
          className={p.type === "hex" ? "hex" : "particle"}
          style={{
            width: p.w, height: p.h,
            left: p.left,
            bottom: `-${p.w}px`,
            animationDuration: `${p.dur}s`,
            animationDelay:    `${p.delay}s`,
            background: p.type === "circle"
              ? `rgba(26,111,196,${0.08 + (i % 4) * 0.04})`
              : "transparent",
            borderColor: p.type === "hex"
              ? `rgba(26,111,196,${0.1 + (i % 3) * 0.06})`
              : undefined,
          }}
        />
      ))}
    </div>
  );
}
