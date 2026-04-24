"use client";
import { useState } from "react";
import { LiveBackground } from "@/components/ui/LiveBackground";
import { TopBrandBar }    from "@/components/ui/TopBrandBar";
import { SECS }           from "@/constants/sections";
import { C }              from "@/constants/theme";

const SEC_ICONS = ["💡","🧠","🔭","⚙️","🚀"];

interface Props {
  onIndividual:  () => void;
  onOrgAdmin:    () => void;
  onOrgEmployee: () => void;
}

export function LandingScreen({ onIndividual, onOrgAdmin, onOrgEmployee }: Props) {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div style={{
      minHeight:"100dvh", width:"100vw", position:"relative",
      display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center",
      padding:"4vh 20px", overflowY:"auto", overflowX:"hidden",
    }}>
      <LiveBackground/>
      <TopBrandBar/>

      <div style={{
        maxWidth:"min(560px,92vw)", width:"100%",
        position:"relative", zIndex:1,
        paddingTop:"clamp(60px,10vh,80px)",
        paddingBottom:"clamp(24px,4vh,40px)",
      }} className="fu">

        {/* Hero */}
        <div style={{ textAlign:"center", marginBottom:"1.6vh" }}>
          <div style={{
            display:"inline-flex", alignItems:"center", gap:8,
            background:"rgba(26,111,196,0.1)", border:"1px solid rgba(26,111,196,0.25)",
            borderRadius:24, padding:"6px 16px", marginBottom:"1.2rem",
          }}>
            <div style={{ width:6,height:6,borderRadius:"50%",background:"#1A6FC4",animation:"pulse 2s infinite" }}/>
            <span style={{ fontSize:"0.58rem",fontWeight:700,letterSpacing:"0.22em",color:"#1A6FC4" }}>
              PSYCHOMETRIC ASSESSMENT
            </span>
          </div>

          <h1 style={{
            fontFamily:"'Playfair Display',serif",
            fontSize:"clamp(2.6rem,7vw,4.4rem)",
            fontWeight:800, color:C.ink,
            lineHeight:.9, letterSpacing:"-0.02em", marginBottom:"0.8rem",
          }}>
            Creative<br/>Innovation<br/>
            <span style={{
              fontStyle:"italic",
              background:"linear-gradient(135deg,#1A6FC4 0%,#4A9FE0 50%,#0D2B52 100%)",
              WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text",
            }}>Index</span>
          </h1>

          <p style={{ fontSize:"0.84rem", color:C.inkM, lineHeight:1.8, maxWidth:400, margin:"0 auto 1.4rem" }}>
            A multi-method psychometric assessment measuring creative and innovative potential — powered by AI analysis.
          </p>
        </div>

        {/* Stats */}
        <div style={{ display:"flex", gap:8, marginBottom:"1.4rem" }}>
          {[["25","Questions"],["5","Dimensions"],["~12","Minutes"]].map(([n,l]) => (
            <div key={l} className="glass-card" style={{ borderRadius:14, padding:"0.9rem 1rem", textAlign:"center", flex:1 }}>
              <div style={{
                fontFamily:"'Playfair Display',serif", fontSize:"clamp(1.3rem,3vw,1.6rem)", fontWeight:800,
                background:"linear-gradient(135deg,#1A6FC4,#0D2B52)",
                WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text", lineHeight:1,
              }}>{n}</div>
              <div style={{ fontSize:"0.55rem", color:C.inkL, letterSpacing:"0.18em", marginTop:4, fontWeight:700 }}>{l}</div>
            </div>
          ))}
        </div>

        {/* Section list */}
        <div style={{ display:"flex", flexDirection:"column", gap:6, marginBottom:"1.6rem" }}>
          {SECS.map((s, idx) => (
            <div key={s.id} className="glass-card" style={{
              display:"flex", alignItems:"center", gap:12,
              borderLeft:`3px solid ${s.color}`, borderRadius:"0 12px 12px 0",
              padding:"0.7rem 1rem",
            }}>
              <span style={{ fontSize:"1.1rem", flexShrink:0 }}>{SEC_ICONS[idx]}</span>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:"0.58rem", fontWeight:800, letterSpacing:"0.2em", color:s.color, marginBottom:1 }}>{s.title}</div>
                <div style={{ fontSize:"0.63rem", color:C.inkL, marginTop:1, lineHeight:1.4 }}>{s.sub}</div>
              </div>
              <div style={{
                fontSize:"0.52rem", fontWeight:700, color:s.color,
                background:`${s.color}12`, borderRadius:8, padding:"2px 7px",
                border:`1px solid ${s.color}30`,
              }}>5 QS</div>
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          <button onClick={onIndividual} className="btn-primary" style={{
            width:"100%", padding:"1.1rem 1.4rem", borderRadius:16, fontSize:"0.9rem",
            display:"flex", alignItems:"center", justifyContent:"space-between",
          }}>
            <div style={{ textAlign:"left" }}>
              <div style={{ fontSize:"0.55rem", letterSpacing:"0.22em", color:"rgba(74,159,224,0.9)", fontWeight:700, marginBottom:4 }}>
                INDIVIDUAL ASSESSMENT
              </div>
              <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"1rem", fontWeight:800 }}>Take the CII Test</div>
            </div>
            <div style={{
              width:36, height:36, borderRadius:"50%",
              background:"rgba(255,255,255,0.15)",
              display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.1rem",
            }}>→</div>
          </button>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            {[
              { emoji:"🏢", label:"ORG ADMIN",  labelColor:C.s1, title:"Create or Access Org", desc:"Sign up & get invite code, or sign in to your dashboard", onClick:onOrgAdmin },
              { emoji:"🔗", label:"EMPLOYEE",   labelColor:C.s3, title:"Join Org Assessment",  desc:"Enter your invite code to participate",                   onClick:onOrgEmployee },
            ].map((btn, i) => (
              <button key={i} onClick={btn.onClick}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                className="glass-card"
                style={{
                  borderRadius:14, padding:"0.9rem", textAlign:"left", cursor:"pointer",
                  border:`1.5px solid ${hovered===i ? btn.labelColor+"50" : "rgba(255,255,255,0.55)"}`,
                  transform:hovered===i?"translateY(-2px)":"none",
                  transition:"all .22s cubic-bezier(.22,1,.36,1)",
                }}>
                <div style={{ fontSize:"1.2rem", marginBottom:4 }}>{btn.emoji}</div>
                <div style={{ fontSize:"0.52rem", letterSpacing:"0.18em", color:btn.labelColor, fontWeight:800, marginBottom:3 }}>{btn.label}</div>
                <div style={{ fontSize:"0.75rem", fontWeight:800, color:C.ink, marginBottom:3 }}>{btn.title}</div>
                <div style={{ fontSize:"0.57rem", color:C.inkL, lineHeight:1.5 }}>{btn.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <p style={{ textAlign:"center", fontSize:"0.58rem", color:C.inkL, marginTop:16, letterSpacing:"0.12em" }}>
          AI-EVALUATED · MULTI-DIMENSIONAL · ~12 MINUTES
        </p>
      </div>
    </div>
  );
}
