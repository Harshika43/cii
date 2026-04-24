"use client";
import { useState, useEffect } from "react";
import { LiveBackground } from "@/components/ui/LiveBackground";
import { C } from "@/constants/theme";

const MSGS = [
  "Evaluating ideational fluency…",
  "Measuring associative range…",
  "Calibrating originality scores…",
  "Analysing cross-domain thinking…",
  "Saving your profile to database…",
  "Composing personalised insights…",
];

export function AnalyzingScreen() {
  const [idx,  setIdx]  = useState(0);
  const [prog, setProg] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % MSGS.length), 2000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setProg(p => Math.min(p + Math.random() * 4, 94)), 300);
    return () => clearInterval(t);
  }, []);

  const orbitColors = [C.s1, C.s2, C.s3, C.s4, C.s5, C.gold];

  return (
    <div style={{
      minHeight:"100dvh", width:"100vw",
      position:"relative",
      display:"flex", alignItems:"center", justifyContent:"center",
      padding:24, overflow:"hidden",
    }}>
      <LiveBackground/>
      <div style={{ textAlign:"center", maxWidth:400, position:"relative", zIndex:1 }} className="fi">
        {/* Orbital rings */}
        <div style={{ position:"relative", width:160, height:160, margin:"0 auto 36px" }}>
          <div style={{
            position:"absolute", inset:-12, borderRadius:"50%",
            background:"radial-gradient(circle,rgba(26,111,196,0.08) 0%,transparent 70%)",
          }}/>
          {[
            {size:140,dur:"10s",color:"rgba(26,111,196,0.2)",  rev:false},
            {size:110,dur:"7s", color:"rgba(26,111,196,0.35)", rev:true},
            {size:80, dur:"5s", color:"rgba(74,159,224,0.4)",  rev:false},
          ].map((r,i) => (
            <div key={i} style={{
              position:"absolute",
              width:r.size, height:r.size,
              top:(160-r.size)/2, left:(160-r.size)/2,
              borderRadius:"50%",
              border:`1.5px solid ${r.color}`,
              animation:`spinR ${r.dur} linear infinite ${r.rev?"reverse":""}`,
            }}/>
          ))}
          {orbitColors.map((color, i) => (
            <div key={i} style={{
              position:"absolute",
              width:10, height:10, borderRadius:"50%",
              background:color,
              top:  80 + Math.sin(i * Math.PI / 3) * 62 - 5,
              left: 80 + Math.cos(i * Math.PI / 3) * 62 - 5,
              opacity:0.5,
              animation:`pulse ${1.6 + i * 0.25}s ease-in-out infinite`,
              animationDelay:`${i * 0.18}s`,
              boxShadow:`0 0 8px ${color}`,
            }}/>
          ))}
          <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <div style={{
              width:50, height:50, borderRadius:"50%",
              background:"linear-gradient(135deg,rgba(26,111,196,0.15),rgba(13,43,82,0.1))",
              border:"1.5px solid rgba(26,111,196,0.3)",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:"1.4rem",
            }}>✦</div>
          </div>
        </div>

        <div style={{
          display:"inline-flex",alignItems:"center",gap:6,
          background:"rgba(26,111,196,0.08)",
          border:"1px solid rgba(26,111,196,0.2)",
          borderRadius:20,padding:"4px 14px",marginBottom:14,
        }}>
          <div style={{width:5,height:5,borderRadius:"50%",background:C.s1,animation:"pulse 1.5s infinite"}}/>
          <span style={{fontSize:"0.58rem",fontWeight:700,letterSpacing:"0.22em",color:C.s1}}>
            AI ANALYSIS IN PROGRESS
          </span>
        </div>

        <h2 style={{
          fontFamily:"'Playfair Display',serif",
          fontSize:"1.6rem",fontWeight:800,color:C.ink,lineHeight:1.3,marginBottom:10,
        }}>
          Mapping your<br/>
          <span style={{
            background:"linear-gradient(135deg,#1A6FC4,#4A9FE0)",
            WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",
            backgroundClip:"text",fontStyle:"italic",
          }}>creative signature</span>
        </h2>

        <p style={{ fontSize:"0.82rem",color:C.inkM,lineHeight:1.8,maxWidth:300,margin:"0 auto 20px" }}>
          Claude is evaluating your open-ended responses for originality, flexibility, and depth.
        </p>

        {/* Progress bar */}
        <div style={{
          width:"100%",maxWidth:280,margin:"0 auto 14px",
          height:4,background:"rgba(26,111,196,0.12)",
          borderRadius:2,overflow:"hidden",
        }}>
          <div style={{
            height:"100%", width:`${prog}%`,
            background:"linear-gradient(to right,#1A6FC4,#4A9FE0)",
            borderRadius:2, transition:"width .3s ease",
            boxShadow:"0 0 6px rgba(26,111,196,0.5)",
          }}/>
        </div>

        <div key={idx} className="fi" style={{ fontSize:"0.82rem",color:C.s1,fontStyle:"italic",minHeight:22,fontWeight:500 }}>
          {MSGS[idx]}
        </div>
      </div>
    </div>
  );
}
