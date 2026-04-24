"use client";
import { useEffect, useRef, useState } from "react";
import { DashPanel }      from "./DashPanel";
import { Panel1Score }    from "./panels/Panel1Score";
import { Panel2Lines }    from "./panels/Panel2Lines";
import { Panel3Analysis } from "./panels/Panel3Analysis";
import { Panel4Radar }    from "./panels/Panel4Radar";
import { Panel5Rings }    from "./panels/Panel5Rings";
import { OrgDashboard }   from "@/components/org/OrgDashboard";
import { getProfile, PROFILES } from "@/constants/profiles";
import { C }              from "@/constants/theme";
import { dbSaveDashboardExport } from "@/lib/db/exports";
import type { AssessmentResults, AIData } from "@/types/assessment";
import type { UserInfo }  from "@/types/user";
import type { OrgContext } from "@/types/organization";

async function loadHtml2Canvas(): Promise<typeof window.html2canvas> {
  if ((window as any).html2canvas) return (window as any).html2canvas;
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src     = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
    s.onload  = () => resolve((window as any).html2canvas);
    s.onerror = () => reject(new Error("html2canvas failed to load"));
    document.head.appendChild(s);
  });
}

async function captureDashboard(el: HTMLElement) {
  const h2c = await loadHtml2Canvas();
  const prevOF = document.body.style.overflow;
  document.body.style.overflow = "visible";
  document.documentElement.style.overflow = "visible";
  try {
    return await h2c(el, {
      scale:2, useCORS:true, allowTaint:true, backgroundColor:"#edeae4",
      width:el.offsetWidth, height:el.offsetHeight,
      windowWidth:el.offsetWidth, windowHeight:el.offsetHeight, logging:false,
      onclone:(clonedDoc: Document) => {
        clonedDoc.querySelectorAll("*").forEach((n: Element) => {
          (n as HTMLElement).style.animation  = "none";
          (n as HTMLElement).style.transition = "none";
        });
        clonedDoc.body.style.overflow             = "visible";
        clonedDoc.documentElement.style.overflow  = "visible";
      },
    });
  } finally {
    document.body.style.overflow            = prevOF;
    document.documentElement.style.overflow = "";
  }
}

interface Props {
  results:    AssessmentResults;
  aiData:     AIData | null;
  userInfo:   UserInfo | null;
  userId:     string | null;
  sessionId:  string | null;
  onRetake?:  () => void;
  onBack?:    () => void;
  orgContext: OrgContext | null;
}

export function IndividualResults({ results, aiData, userInfo, userId, sessionId, onRetake, onBack, orgContext }: Props) {
  const { dims, cii } = results;
  const profile = getProfile(cii);
  const [downloading, setDownloading] = useState(false);
  const [isMobile,    setIsMobile]    = useState(false);
  const [activeView,  setActiveView]  = useState<"individual"|"org">("individual");
  const dashRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check(); window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (!sessionId || !userId || !dashRef.current) return;
    const timer = setTimeout(async () => {
      try {
        const canvas = await captureDashboard(dashRef.current!);
        await dbSaveDashboardExport(sessionId, userId, canvas, userInfo?.name);
      } catch (e) { console.error("[Results] Export error:", e); }
    }, 1500);
    return () => clearTimeout(timer);
  }, [sessionId, userId, userInfo]);

  const handleDownload = async () => {
    if (downloading || !dashRef.current) return;
    setDownloading(true);
    try {
      const canvas = await captureDashboard(dashRef.current);
      const link   = document.createElement("a");
      link.download = `CII-Results-${userInfo?.name?.split(" ")[0] || "Report"}.png`;
      link.href     = canvas.toDataURL("image/png");
      link.click();
    } catch (e) { console.error("[Download]", e); }
    setDownloading(false);
  };

  return (
    <div style={{ minHeight:"100dvh", width:"100vw", background:"#edeae4", display:"flex", flexDirection:"column" }}>
      {orgContext?.isAdmin && (
        <div style={{ background:"#edeae4", padding:"8px 12px 0", display:"flex", gap:4, flexShrink:0 }}>
          <button className={`org-tab ${activeView==="individual"?"active":""}`} onClick={()=>setActiveView("individual")}>
            <span style={{ fontSize:"0.7rem" }}>👤</span> My Results
          </button>
          <button className={`org-tab ${activeView==="org"?"active":""}`} onClick={()=>setActiveView("org")}>
            <span style={{ fontSize:"0.7rem" }}>🏢</span> {orgContext.org.name} Dashboard
          </button>
        </div>
      )}

      {activeView === "org" && orgContext?.isAdmin ? (
        <OrgDashboard
          orgId={orgContext.org.id}
          orgName={orgContext.org.name}
          orgInviteCode={orgContext.org.invite_code}
          currentUserResult={{ dims, cii, profile, department:orgContext.department }}
          onBack={() => setActiveView("individual")}
        />
      ) : (
        <div ref={dashRef} className="fi results-root" style={{
          minHeight: orgContext ? "calc(100dvh - 48px)" : "100dvh",
          width:"100%", background:"#edeae4",
          padding: isMobile ? "8px" : "2px 8px 2px",
          gap: isMobile ? 8 : 4,
          overflowY: isMobile ? "auto" : "hidden",
          display:"flex", flexDirection:"column", flex:1,
        }}>
          {/* Header */}
          <div style={{
            display:"flex", justifyContent:"space-between", alignItems:"flex-start",
            flexShrink:0, gap:8,
            background:"linear-gradient(135deg,#0D2B52,#1A6FC4)",
            borderRadius:8, padding:"8px 12px",
            boxShadow:"0 4px 16px rgba(13,43,82,0.18)",
          }}>
            <div style={{ flex:1, minWidth:0 }}>
              <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(0.85rem,1.5vw,1.15rem)", fontWeight:800, color:"#fff", lineHeight:1.2 }}>
                Creative Innovation Index
                {userInfo?.name && <span style={{ color:"rgba(74,159,224,0.9)" }}> — {userInfo.name}</span>}
              </h1>
              <p style={{ fontSize:"clamp(0.52rem,0.85vw,0.7rem)", color:"rgba(194,212,232,0.8)", marginTop:3, lineHeight:1.5 }}>
                {userInfo?.designation && userInfo?.organization ? `${userInfo.designation} · ${userInfo.organization} · ` : ""}
                Multi-dimensional psychometric assessment · AI-evaluated
              </p>
            </div>
            <div style={{ display:"flex", gap:6, alignItems:"center", flexShrink:0 }}>
              <button onClick={handleDownload} disabled={downloading} style={{
                background:"rgba(255,255,255,0.15)", border:"1px solid rgba(255,255,255,0.25)",
                borderRadius:7, padding:"5px 11px", color:"#fff", fontSize:"0.58rem",
                cursor:downloading?"default":"pointer", fontWeight:700, letterSpacing:"0.08em",
                whiteSpace:"nowrap",
              }}>{downloading ? "⏳" : "⬇ PNG"}</button>
              {onBack && (
                <button onClick={onBack} style={{
                  background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.18)",
                  borderRadius:7, padding:"5px 11px", color:"rgba(255,255,255,0.8)",
                  fontSize:"0.58rem", cursor:"pointer", fontWeight:600, whiteSpace:"nowrap",
                }}>← BACK</button>
              )}
              {onRetake && (
                <button onClick={onRetake} style={{
                  background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.18)",
                  borderRadius:7, padding:"5px 11px", color:"rgba(255,255,255,0.8)",
                  fontSize:"0.58rem", cursor:"pointer", fontWeight:600, whiteSpace:"nowrap",
                }}>↩ RETAKE</button>
              )}
            </div>
          </div>

          {/* Row 1 */}
          <div className="results-grid-top" style={{
            display:"grid",
            gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr",
            gap: isMobile ? 8 : "clamp(4px,0.8vw,10px)",
            flex: isMobile ? "none" : "0 0 auto",
            height: isMobile ? "auto" : "calc(48vh - 40px)",
          }}>
            <DashPanel title="CII Score — Gauge & Strengths"><Panel1Score cii={cii} profile={profile} dims={dims} aiData={aiData}/></DashPanel>
            <DashPanel title="Dimension Score Lines"><Panel2Lines dims={dims}/></DashPanel>
            <DashPanel title="Analysis"><Panel3Analysis aiData={aiData} dims={dims} profile={profile}/></DashPanel>
          </div>

          {/* Row 2 */}
          <div className="results-grid-bottom" style={{
            display:"grid",
            gridTemplateColumns: isMobile ? "1fr" : "1.5fr 1fr",
            gap: isMobile ? 8 : "clamp(4px,0.8vw,10px)",
            flex: isMobile ? "none" : "0 0 auto",
            height: isMobile ? "auto" : "calc(54vh - 40px)",
          }}>
            <DashPanel title="Creative Profile Radar · Improvement Actions"><Panel4Radar dims={dims} cii={cii} profile={profile}/></DashPanel>
            <DashPanel title="Dimension Progress Rings"><Panel5Rings dims={dims} profile={profile}/></DashPanel>
          </div>

          {/* Footer */}
          <div style={{
            display:"flex", justifyContent:"space-between", alignItems:"center",
            flexShrink:0, flexWrap:"wrap", gap:6,
            background:"rgba(13,43,82,0.06)", borderRadius:6, padding:"5px 10px",
            border:"1px solid rgba(26,111,196,0.12)",
          }}>
            <p style={{ fontSize:"0.52rem", color:C.inkL, fontStyle:"italic", display:"flex", alignItems:"center", gap:4 }}>
              <span style={{ color:"#1A6FC4", fontWeight:700 }}>✦</span>
              Scores are AI-evaluated · Infopace CII Assessment
            </p>
            <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
              {PROFILES.map(p => (
                <div key={p.name} style={{ display:"flex", alignItems:"center", gap:3, opacity:profile.name===p.name?1:.3, transition:"opacity .2s" }}>
                  <div style={{ width:6, height:6, borderRadius:"50%", background:p.color, boxShadow:profile.name===p.name?`0 0 4px ${p.color}`:"" }}/>
                  <span style={{ fontSize:"0.48rem", color:p.color, fontWeight:profile.name===p.name?700:400 }}>{p.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
