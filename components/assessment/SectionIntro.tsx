"use client";
import { SECS } from "@/constants/sections";
import { LiveBackground } from "@/components/ui/LiveBackground";
import { C } from "@/constants/theme";
import type { Section } from "@/constants/sections";

const SEC_ICONS = ["💡","🧠","🔭","⚙️","🚀"];

function DecorSVG({ sec }: { sec: Section }) {
  return (
    <svg viewBox="0 0 320 140" fill="none" style={{width:"100%",height:"100%",display:"block"}}>
      <rect width="320" height="140" fill={`${sec.color}08`}/>
      {[0,1,2,3,4].map(i=>(
        <line key={`v${i}`} x1={64*i} y1="0" x2={64*i} y2="140"
          stroke={sec.color} strokeWidth=".5" opacity=".15"/>
      ))}
      {[0,1,2].map(i=>(
        <line key={`h${i}`} x1="0" y1={46*i+4} x2="320" y2={46*i+4}
          stroke={sec.color} strokeWidth=".5" opacity=".12"/>
      ))}
      <circle cx="160" cy="70" r="44" fill={sec.color} fillOpacity=".07"
        stroke={sec.color} strokeWidth="1.5" strokeOpacity=".3"/>
      <circle cx="160" cy="70" r="28" fill={sec.color} fillOpacity=".1"
        stroke={sec.color} strokeWidth="1" strokeOpacity=".4"/>
      <circle cx="160" cy="70" r="12" fill={sec.color} fillOpacity=".2"/>
      {[0,60,120,180,240,300].map((deg,i) => {
        const rad = deg * Math.PI / 180;
        const x = 160 + Math.cos(rad) * 44;
        const y = 70  + Math.sin(rad) * 44;
        return <circle key={i} cx={x} cy={y} r={i%2===0?3:2}
          fill={sec.color} opacity={i%2===0?.45:.25}/>;
      })}
    </svg>
  );
}

interface Props { sec: Section; onGo: () => void; }

export function SectionIntro({ sec, onGo }: Props) {
  const secIdx = sec.id - 1;
  return (
    <div style={{
      minHeight:"100dvh", width:"100vw", position:"relative",
      display:"flex", alignItems:"center", justifyContent:"center",
      padding:"4vh 24px", overflowY:"auto", overflowX:"hidden",
    }}>
      <LiveBackground/>
      <div style={{ maxWidth:"min(520px,92vw)", width:"100%", textAlign:"center", position:"relative", zIndex:1 }} className="fu">
        {/* Banner */}
        <div className="glass-card" style={{
          width:"100%", height:"clamp(110px,16vh,150px)",
          borderRadius:18, overflow:"hidden", marginBottom:"2.5vh",
          border:`1.5px solid ${sec.color}28`,
          boxShadow:`0 8px 32px ${sec.color}18`,
        }}>
          <DecorSVG sec={sec}/>
        </div>

        {/* Badge */}
        <div style={{
          display:"inline-flex",alignItems:"center",gap:8,
          background:`${sec.color}10`,border:`1px solid ${sec.color}30`,
          borderRadius:24,padding:"5px 16px",marginBottom:"0.9rem",
        }}>
          <span style={{fontSize:"0.9rem"}}>{SEC_ICONS[secIdx]}</span>
          <span style={{fontSize:"0.58rem",fontWeight:800,letterSpacing:"0.28em",color:sec.color}}>
            SECTION {sec.id} OF 5
          </span>
        </div>

        <h2 style={{
          fontFamily:"'Playfair Display',serif",
          fontSize:"clamp(1.6rem,4vw,2.6rem)",
          fontWeight:800,color:C.ink,lineHeight:1.1,marginBottom:"0.7rem",
        }}>{sec.title}</h2>

        <p style={{
          fontSize:"0.85rem",color:C.inkM,
          lineHeight:1.8,maxWidth:360,margin:"0 auto 2.5vh",
        }}>{sec.sub}</p>

        {/* Progress dots */}
        <div style={{ display:"flex",justifyContent:"center",gap:6,marginBottom:"2.5vh" }}>
          {SECS.map(s => (
            <div key={s.id} style={{
              height:4, width:s.id===sec.id?28:8, borderRadius:2,
              background: s.id < sec.id
                ? `linear-gradient(to right,${s.color}80,${s.color})`
                : s.id===sec.id
                ? `linear-gradient(to right,${sec.color},${sec.color}cc)`
                : C.inkXL,
              transition:"all .3s ease",
              boxShadow:s.id===sec.id?`0 0 6px ${sec.color}60`:"none",
            }}/>
          ))}
        </div>

        <button onClick={onGo} style={{
          background:`linear-gradient(135deg,${sec.color} 0%,${sec.color}cc 100%)`,
          color:"#fff",border:"none",borderRadius:14,
          padding:"0.9rem 2.8rem",fontSize:"0.9rem",
          fontWeight:700,cursor:"pointer",letterSpacing:"0.08em",
          boxShadow:`0 6px 24px ${sec.color}40`,
          transition:"all .25s cubic-bezier(.22,1,.36,1)",
        }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = "none"; }}>
          START SECTION →
        </button>
      </div>
    </div>
  );
}
