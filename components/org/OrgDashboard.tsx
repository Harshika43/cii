"use client";
import { useRef, useState, useEffect } from "react";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from "recharts";
import { useOrganization } from "@/hooks/useOrganization";
import { generateOrgPDFReport } from "@/lib/pdf/generateReport";
import { C }                    from "@/constants/theme";
import { DIM, AVG_BENCHMARK }   from "@/constants/dimensions";
import { PROFILES, getProfile } from "@/constants/profiles";

interface Props {
  orgId:             string | null | undefined;
  orgName:           string;
  orgInviteCode:     string;
  currentUserResult: unknown;
  onBack?:           () => void;
}

type DrillDown = { type: string; title: string } | null;

/* ── small helpers ─────────────────────────────────────────────────────────── */
function OrgPanel({
  title, children, style = {}, onClick,
}: {
  title: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        background: "#ffffff",
        border: "1.5px solid #dbe8f5",
        borderRadius: 8,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 2px 16px rgba(13,43,82,0.08)",
        cursor: onClick ? "pointer" : "default",
        ...style,
      }}
    >
      <div style={{
        background: "linear-gradient(135deg,#0D2B52 0%,#1A6FC4 100%)",
        color: "#fff",
        fontSize: "0.56rem",
        fontWeight: 700,
        letterSpacing: "0.16em",
        textAlign: "center",
        padding: "6px 10px",
        textTransform: "uppercase",
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
      }}>
        <div style={{ width: 4, height: 4, borderRadius: "50%", background: "rgba(74,159,224,0.8)" }} />
        {title}
        {onClick && <span style={{ opacity: .6, fontSize: "0.52rem", marginLeft: 2 }}>↗</span>}
        <div style={{ width: 4, height: 4, borderRadius: "50%", background: "rgba(74,159,224,0.8)" }} />
      </div>
      <div style={{ flex: 1, minHeight: 0, overflow: "hidden" }}>{children}</div>
    </div>
  );
}

function DrillDownModal({
  title, children, onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "rgba(13,43,82,0.55)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 16,
    }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "#f8f5f0",
          borderRadius: 14,
          width: "min(860px,96vw)",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 24px 80px rgba(13,43,82,0.28)",
          overflow: "hidden",
        }}
      >
        {/* modal header */}
        <div style={{
          background: "linear-gradient(135deg,#0D2B52,#1A6FC4)",
          padding: "12px 18px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexShrink: 0,
        }}>
          <span style={{ color: "#fff", fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.14em" }}>{title}</span>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontSize: "0.7rem" }}>✕ Close</button>
        </div>
        {/* modal body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 18px" }}>
          {children}
        </div>
      </div>
    </div>
  );
}

/* ── main component ────────────────────────────────────────────────────────── */
export function OrgDashboard({ orgId, orgName, orgInviteCode, onBack }: Props) {
  const [downloading, setDownloading] = useState(false);
  const [pdfLoading,  setPdfLoading]  = useState(false);
  const [isMobile,    setIsMobile]    = useState(false);
  const [drillDown,   setDrillDown]   = useState<DrillDown>(null);
  const dashRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const {
    results, loading,
    totalEmployees, avgCII, orgProfile, avgDims,
    deptStats, profileDist,
    topPerformers, hiddenCreatives,
    aboveAvgDims, riskAversionPct, visionBehaviorGap,
  } = useOrganization(orgId);

  const handlePDFDownload = async () => {
    if (pdfLoading) return;
    setPdfLoading(true);
    try {
      await generateOrgPDFReport(orgName, orgInviteCode, results as any, avgDims, avgCII, deptStats, profileDist, orgId);
    } catch (e) { console.error("[PDF]", e); alert("PDF generation failed."); }
    setPdfLoading(false);
  };

  const handleDownload = async () => {
    if (downloading || !dashRef.current) return;
    setDownloading(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(dashRef.current);
      const link = document.createElement("a");
      link.download = `OrgCII-${orgName}-Report.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (e) { console.error("[OrgDownload]", e); }
    setDownloading(false);
  };

  /* ── loading ── */
  if (loading) return (
    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: "#edeae4", minHeight: "80vh" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.4rem", fontWeight: 800, color: C.gold, marginBottom: 8 }}>Loading…</div>
        <div style={{ fontSize: "0.8rem", color: C.inkM }}>Aggregating {orgName} results</div>
      </div>
    </div>
  );

  /* ── empty state ── */
  if (!results.length) return (
    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: "#edeae4", minHeight: "80vh", flexDirection: "column", gap: 16, padding: 24 }}>
      <div style={{ textAlign: "center", maxWidth: 400 }}>
        <div style={{ fontSize: "3rem", marginBottom: 12 }}>📭</div>
        <div style={{ fontSize: "0.6rem", letterSpacing: "0.38em", color: C.inkL, fontWeight: 700, marginBottom: 8 }}>ORG DASHBOARD — {orgName.toUpperCase()}</div>
        <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.6rem", fontWeight: 800, color: C.ink, marginBottom: 12, lineHeight: 1.2 }}>No assessments yet</h2>
        <p style={{ fontSize: "0.82rem", color: C.inkM, lineHeight: 1.8, marginBottom: 20 }}>No employees have completed the CII assessment yet. Share your invite code to get started.</p>
        <div style={{ background: C.white, border: `1.5px solid ${C.gold}40`, borderRadius: 12, padding: "1rem 1.4rem", marginBottom: 16 }}>
          <div style={{ fontSize: "0.58rem", color: C.inkL, letterSpacing: "0.2em", fontWeight: 700, marginBottom: 6 }}>YOUR INVITE CODE</div>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "2rem", fontWeight: 800, color: C.gold, letterSpacing: "0.2em" }}>{orgInviteCode || "——"}</div>
        </div>
        {onBack && <button onClick={onBack} style={{ background: C.ink, color: C.cream, border: "none", borderRadius: 10, padding: "0.75rem 1.4rem", fontSize: "0.78rem", fontWeight: 700, cursor: "pointer" }}>← Back to Home</button>}
      </div>
    </div>
  );

  /* ── dashboard ── */
  return (
    <div ref={dashRef} style={{
      flex: 1,
      background: "#edeae4",
      padding: isMobile ? "8px" : "6px 8px",
      display: "flex",
      flexDirection: "column",
      gap: isMobile ? 8 : 4,
      overflowY: isMobile ? "auto" : "hidden",
      minHeight: "100dvh",
    }}>

      {/* ── Header ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexShrink: 0, gap: 8 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(0.85rem,1.5vw,1.2rem)", fontWeight: 800, color: C.ink, lineHeight: 1.2 }}>
            Org Innovation Index<span style={{ color: C.gold, fontStyle: "italic" }}> — {orgName}</span>
          </h1>
          <p style={{ fontSize: "clamp(0.55rem,0.9vw,0.72rem)", color: C.inkL, marginTop: 3, lineHeight: 1.5 }}>
            {totalEmployees} employees · {deptStats.length} departments · Org CII: <strong style={{ color: C.gold }}>{avgCII}</strong> · {orgProfile.name} · {aboveAvgDims}/6 dims above avg
          </p>
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
          <button onClick={handleDownload} disabled={downloading} style={{ background: C.gold, border: "none", borderRadius: 5, padding: "5px 10px", color: "#fff", fontSize: "0.58rem", cursor: downloading ? "default" : "pointer", fontWeight: 600, letterSpacing: "0.06em", whiteSpace: "nowrap" }}>
            {downloading ? "⏳" : "⬇ PNG"}
          </button>
          <button onClick={handlePDFDownload} disabled={pdfLoading} style={{ background: pdfLoading ? C.inkXL : C.navy, border: "none", borderRadius: 5, padding: "5px 10px", color: "#fff", fontSize: "0.58rem", cursor: pdfLoading ? "default" : "pointer", fontWeight: 600, letterSpacing: "0.06em", whiteSpace: "nowrap" }}>
            {pdfLoading ? "⏳ PDF..." : "⬇ PDF REPORT"}
          </button>
          {onBack && <button onClick={onBack} style={{ background: "transparent", border: `1px solid ${C.inkXL}`, borderRadius: 5, padding: "5px 10px", color: C.inkM, fontSize: "0.58rem", cursor: "pointer", fontWeight: 600, whiteSpace: "nowrap" }}>← Back</button>}
        </div>
      </div>

      {/* ── ROW 1 ── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "minmax(0,0.85fr) minmax(0,1.1fr) minmax(0,0.95fr) minmax(0,0.95fr)",
        gap: isMobile ? 8 : "clamp(4px,0.8vw,8px)",
        flex: isMobile ? "none" : "0 0 auto",
        height: isMobile ? "auto" : "calc(46vh - 44px)",
      }}>

        {/* PANEL A — Org Score */}
        <OrgPanel title="Organisation CII Score" onClick={() => setDrillDown({ type: "gauge", title: "ALL EMPLOYEES — FULL ROSTER" })}>
          <div style={{ height: "100%", display: "flex", flexDirection: "column", padding: "10px 12px", gap: 6 }}>
            {/* Gauge */}
            <div style={{ display: "flex", justifyContent: "center", flexShrink: 0 }}>
              {(() => {
                const r2 = 52, cx = 82, cy = 72;
                const circ = Math.PI * r2;
                const filled = circ * (avgCII / 100);
                const gap2 = circ - filled;
                return (
                  <svg width={164} height={88} style={{ overflow: "visible" }}>
                    <defs>
                      <linearGradient id="gaugeGrad" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor={orgProfile.color} stopOpacity=".6" />
                        <stop offset="100%" stopColor={orgProfile.color} />
                      </linearGradient>
                    </defs>
                    <path d={`M ${cx - r2} ${cy} A ${r2} ${r2} 0 0 1 ${cx + r2} ${cy}`} fill="none" stroke={C.inkXL} strokeWidth={11} strokeLinecap="round" />
                    <path d={`M ${cx - r2} ${cy} A ${r2} ${r2} 0 0 1 ${cx + r2} ${cy}`} fill="none" stroke="url(#gaugeGrad)" strokeWidth={11} strokeLinecap="round" strokeDasharray={`${filled} ${gap2}`} />
                    {[0, 50, 100].map(t => {
                      const angle = Math.PI * (1 - t / 100);
                      const lx = cx + (r2 + 13) * Math.cos(angle), ly = cy - (r2 + 13) * Math.sin(angle);
                      return <text key={t} x={lx} y={ly + 3} textAnchor="middle" fontSize={7} fill={C.inkL} fontFamily="DM Sans">{t}</text>;
                    })}
                    <text x={cx} y={cy - 11} textAnchor="middle" fontFamily="Playfair Display,serif" fontSize={26} fontWeight={800} fill={orgProfile.color}>{avgCII}</text>
                    <text x={cx} y={cy + 1} textAnchor="middle" fontFamily="DM Sans,sans-serif" fontSize={6.5} fill={C.inkL} letterSpacing="1.5">ORG CII</text>
                  </svg>
                );
              })()}
            </div>
            {/* Profile badge */}
            <div style={{ textAlign: "center", flexShrink: 0, marginTop: -4 }}>
              <div style={{ display: "inline-block", background: `${orgProfile.color}18`, border: `1.5px solid ${orgProfile.color}50`, borderRadius: 20, padding: "3px 10px", marginBottom: 3 }}>
                <span style={{ fontSize: 7.5, fontWeight: 700, color: orgProfile.color, letterSpacing: "0.1em" }}>{orgProfile.tag}</span>
              </div>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 12, fontWeight: 800, color: C.ink, lineHeight: 1.2 }}>{orgProfile.name}</div>
              <div style={{ fontSize: 9, color: C.inkL, marginTop: 2, lineHeight: 1.4 }}>{orgProfile.desc}</div>
            </div>
            {/* KPI grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, marginTop: "auto" }}>
              {[
                { label: "EMPLOYEES",      val: totalEmployees,        color: C.s5,  icon: "👥" },
                { label: "DEPARTMENTS",    val: deptStats.length,      color: C.s2,  icon: "🏢" },
                { label: "DIMS ABOVE AVG", val: `${aboveAvgDims}/6`,   color: C.s3,  icon: "📈" },
                { label: "RISK FLAG",      val: `${riskAversionPct}%`, color: riskAversionPct > 40 ? C.s4 : C.s3, icon: riskAversionPct > 40 ? "⚠" : "✅" },
              ].map(m => (
                <div key={m.label} style={{ background: `${m.color}08`, border: `1px solid ${m.color}22`, borderRadius: 8, padding: "6px 7px", textAlign: "center" }}>
                  <div style={{ fontSize: 10, marginBottom: 1 }}>{m.icon}</div>
                  <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 15, fontWeight: 800, color: m.color, lineHeight: 1 }}>{m.val}</div>
                  <div style={{ fontSize: 6, fontWeight: 700, color: C.inkL, letterSpacing: "0.1em", marginTop: 2, lineHeight: 1.2 }}>{m.label}</div>
                </div>
              ))}
            </div>
          </div>
        </OrgPanel>

        {/* PANEL B — Dimension Bars */}
        <OrgPanel title="Dimension Scores vs Population Benchmark" onClick={() => setDrillDown({ type: "dims", title: "DIMENSION BREAKDOWN — ALL DEPARTMENTS" })}>
          <div style={{ padding: "10px 14px", display: "flex", flexDirection: "column", gap: 6, height: "100%", justifyContent: "center" }}>
            {avgDims.map((d, i) => {
              const avg = AVG_BENCHMARK[i]; const diff = d - avg;
              return (
                <div key={i}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: DIM.colors[i], flexShrink: 0 }} />
                      <span style={{ fontSize: "0.62rem", fontWeight: 600, color: C.inkM, lineHeight: 1 }}>{DIM.short[i]}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: "0.58rem", background: diff >= 0 ? `${C.s3}15` : `${C.s4}15`, color: diff >= 0 ? C.s3 : C.s4, fontWeight: 700, borderRadius: 5, padding: "1px 5px" }}>{diff >= 0 ? "+" : ""}{diff} vs avg</span>
                      <span style={{ fontFamily: "'Playfair Display',serif", fontSize: "1rem", fontWeight: 800, color: DIM.colors[i], minWidth: 26, textAlign: "right" }}>{d}</span>
                    </div>
                  </div>
                  <div style={{ position: "relative", height: 10, background: `${DIM.colors[i]}15`, borderRadius: 5, overflow: "hidden" }}>
                    <div style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: `${d}%`, background: `linear-gradient(to right,${DIM.colors[i]}70,${DIM.colors[i]})`, borderRadius: 5 }} />
                    <div style={{ position: "absolute", top: 0, bottom: 0, left: `${avg}%`, width: 1.5, background: C.inkM, opacity: .45 }} />
                  </div>
                </div>
              );
            })}
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4, paddingTop: 6, borderTop: `1px dashed ${C.inkXL}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                <div style={{ width: 16, height: 1.5, background: C.inkM, opacity: .45 }} />
                <span style={{ fontSize: "0.57rem", color: C.inkL }}>Population avg</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                <div style={{ width: 10, height: 8, borderRadius: 2, background: `${C.s5}30` }} />
                <span style={{ fontSize: "0.57rem", color: C.inkL }}>Org score</span>
              </div>
            </div>
          </div>
        </OrgPanel>

        {/* PANEL C — Radar */}
        <OrgPanel title="Radar — Org vs Population">
          <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
            <div style={{ flex: 1, minHeight: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={DIM.abbr.map((a, i) => ({ subject: a, org: avgDims[i], avg: AVG_BENCHMARK[i], fullMark: 100 }))} margin={{ top: 16, right: 24, bottom: 10, left: 24 }}>
                  <PolarGrid stroke={`${C.inkXL}80`} strokeDasharray="3 3" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: C.inkL, fontSize: 9, fontFamily: "'DM Sans',sans-serif" }} />
                  <Radar name="Pop. Avg" dataKey="avg" stroke={C.inkXL} fill={C.inkXL} fillOpacity={.2} strokeWidth={1} strokeDasharray="4 3" />
                  <Radar name="Org" dataKey="org" stroke={orgProfile.color} fill={orgProfile.color} fillOpacity={.2} strokeWidth={2} />
                  <Tooltip formatter={(v: any, n: string) => [v + "/100", n === "org" ? "Organisation" : n === "avg" ? "Pop. Avg" : n]} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: "flex", justifyContent: "center", gap: 12, padding: "4px 0 8px", flexShrink: 0, borderTop: `1px solid ${C.inkXL}30` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <div style={{ width: 14, height: 2.5, background: orgProfile.color, borderRadius: 1 }} />
                <span style={{ fontSize: "0.6rem", color: C.inkM, fontWeight: 600 }}>Org</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <svg width={14} height={3}><line x1="0" y1="1.5" x2="14" y2="1.5" stroke={C.inkXL} strokeWidth={1.2} strokeDasharray="3 2" /></svg>
                <span style={{ fontSize: "0.6rem", color: C.inkM, fontWeight: 600 }}>Pop. Avg</span>
              </div>
            </div>
          </div>
        </OrgPanel>

        {/* PANEL D — Profile Distribution */}
        <OrgPanel title="Profile Distribution" onClick={() => setDrillDown({ type: "profiles", title: "PROFILE DISTRIBUTION — EMPLOYEE BREAKDOWN" })}>
          <div style={{ padding: "10px 12px", display: "flex", flexDirection: "column", gap: 5, height: "100%", justifyContent: "center" }}>
            {profileDist.map((p: any) => {
              const pct = Math.round(p.count / Math.max(totalEmployees, 1) * 100);
              return (
                <div key={p.name}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: p.color, flexShrink: 0 }} />
                      <span style={{ fontSize: "0.62rem", fontWeight: 600, color: C.inkM, lineHeight: 1 }}>{p.name}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                      <span style={{ fontSize: "0.57rem", color: C.inkL, fontWeight: 500 }}>{pct}%</span>
                      <span style={{ fontFamily: "'Playfair Display',serif", fontSize: "1rem", fontWeight: 800, color: p.color, minWidth: 20, textAlign: "right" }}>{p.count}</span>
                    </div>
                  </div>
                  <div style={{ height: 8, background: `${p.color}15`, borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: p.color, borderRadius: 4, minWidth: p.count > 0 ? 4 : 0 }} />
                  </div>
                </div>
              );
            })}
            {/* Score histogram */}
            <div style={{ marginTop: 6, paddingTop: 8, borderTop: `1px dashed ${C.inkXL}` }}>
              <div style={{ fontSize: "0.52rem", color: C.inkL, fontWeight: 700, letterSpacing: "0.12em", marginBottom: 5 }}>SCORE DISTRIBUTION</div>
              {(() => {
                const buckets = [{ r: "0–39", min: 0, max: 39 }, { r: "40–54", min: 40, max: 54 }, { r: "55–69", min: 55, max: 69 }, { r: "70–84", min: 70, max: 84 }, { r: "85+", min: 85, max: 100 }];
                const counts = buckets.map(b => (results as any[]).filter(r => r.cii_score >= b.min && r.cii_score <= b.max).length);
                const mx = Math.max(...counts, 1);
                const colors = [C.inkL, C.s5, C.s2, C.s3, C.s1];
                return (
                  <div style={{ display: "flex", gap: 3, height: 44, alignItems: "flex-end" }}>
                    {buckets.map((b, i) => (
                      <div key={b.r} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                        <span style={{ fontSize: "0.48rem", fontWeight: 700, color: colors[i] }}>{counts[i]}</span>
                        <div style={{ width: "100%", background: colors[i], borderRadius: "3px 3px 0 0", minHeight: counts[i] > 0 ? 3 : 0, height: `${(counts[i] / mx) * 34}px` }} />
                        <span style={{ fontSize: "0.42rem", color: C.inkL, textAlign: "center", lineHeight: 1.1 }}>{b.r}</span>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>
        </OrgPanel>
      </div>

      {/* ── ROW 2 ── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "minmax(0,1.5fr) minmax(0,1fr) minmax(0,1fr)",
        gap: isMobile ? 8 : "clamp(4px,0.8vw,8px)",
        flex: isMobile ? "none" : "0 0 auto",
        height: isMobile ? "auto" : "calc(54vh - 44px)",
      }}>

        {/* PANEL E — Dept Heatmap */}
        <OrgPanel title="Department × Dimension Heatmap" onClick={() => setDrillDown({ type: "dept", title: "DEPARTMENT DRILL-DOWN" })}>
          <div style={{ padding: "6px 10px", height: "100%", overflowY: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.6rem" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", padding: "4px 6px", color: C.inkL, fontWeight: 700, fontSize: "0.55rem", borderBottom: `2px solid ${C.navy}`, background: "#f8f5f0", whiteSpace: "nowrap", position: "sticky", top: 0 }}>Department</th>
                  <th style={{ textAlign: "center", padding: "4px 5px", color: C.inkL, fontWeight: 700, fontSize: "0.55rem", borderBottom: `2px solid ${C.navy}`, background: "#f8f5f0", position: "sticky", top: 0 }}>n</th>
                  {DIM.abbr.map(a => <th key={a} style={{ textAlign: "center", padding: "4px 5px", color: C.inkL, fontWeight: 700, fontSize: "0.55rem", borderBottom: `2px solid ${C.navy}`, background: "#f8f5f0", position: "sticky", top: 0 }}>{a}</th>)}
                  <th style={{ textAlign: "center", padding: "4px 8px", color: C.gold, fontWeight: 700, fontSize: "0.55rem", borderBottom: `2px solid ${C.navy}`, background: "#f8f5f0", position: "sticky", top: 0 }}>CII</th>
                </tr>
              </thead>
              <tbody>
                {deptStats.map((dept: any, ri: number) => (
                  <tr key={dept.dept} style={{ background: ri % 2 === 0 ? "transparent" : `${C.ink}02` }}>
                    <td style={{ padding: "5px 6px", fontWeight: 700, color: C.ink, fontSize: "0.62rem", borderBottom: `1px solid ${C.inkXL}25`, whiteSpace: "nowrap" }}>{dept.dept}</td>
                    <td style={{ padding: "5px 6px", textAlign: "center", fontSize: "0.58rem", color: C.inkL, borderBottom: `1px solid ${C.inkXL}25` }}>{dept.count}</td>
                    {dept.avgDims.map((d: number, i: number) => {
                      const intensity = d / 100; const color = DIM.colors[i];
                      const hex = color.replace("#", "");
                      const rv = parseInt(hex.slice(0, 2), 16);
                      const gv = parseInt(hex.slice(2, 4), 16);
                      const bv = parseInt(hex.slice(4, 6), 16);
                      return (
                        <td key={i} style={{ textAlign: "center", padding: "5px 5px", borderBottom: `1px solid ${C.inkXL}25` }}>
                          <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", background: `rgba(${rv},${gv},${bv},${0.1 + intensity * 0.55})`, borderRadius: 5, padding: "2px 6px", minWidth: 28, fontSize: "0.62rem", fontWeight: 700, color: d > 65 ? "#fff" : C.ink }}>{d}</div>
                        </td>
                      );
                    })}
                    <td style={{ textAlign: "center", padding: "5px 8px", borderBottom: `1px solid ${C.inkXL}25` }}>
                      <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", background: getProfile(dept.avgCII).color, borderRadius: 6, padding: "2px 8px", fontSize: "0.62rem", fontWeight: 800, color: "#fff", minWidth: 28 }}>{dept.avgCII}</div>
                    </td>
                  </tr>
                ))}
                {/* Org avg row */}
                <tr style={{ background: `${C.navy}08`, borderTop: `2px solid ${C.navy}30` }}>
                  <td style={{ padding: "5px 6px", fontWeight: 800, color: C.navy, fontSize: "0.62rem" }}>ORG AVG</td>
                  <td style={{ padding: "5px 6px", textAlign: "center", fontSize: "0.58rem", color: C.navy, fontWeight: 700 }}>{totalEmployees}</td>
                  {avgDims.map((d, i) => (
                    <td key={i} style={{ textAlign: "center", padding: "5px 5px" }}>
                      <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", background: `${DIM.colors[i]}25`, borderRadius: 5, padding: "2px 6px", minWidth: 28, fontSize: "0.62rem", fontWeight: 800, color: DIM.colors[i] }}>{d}</div>
                    </td>
                  ))}
                  <td style={{ textAlign: "center", padding: "5px 8px" }}>
                    <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", background: orgProfile.color, borderRadius: 6, padding: "2px 8px", fontSize: "0.62rem", fontWeight: 800, color: "#fff" }}>{avgCII}</div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </OrgPanel>

        {/* PANEL F — People Intel */}
        <OrgPanel title="People Intelligence" onClick={() => setDrillDown({ type: "intel", title: "PEOPLE INTELLIGENCE — DETAILED VIEW" })}>
          <div style={{ padding: "8px 11px", height: "100%", overflowY: "auto", display: "flex", flexDirection: "column", gap: 9 }}>
            <div>
              <div style={{ fontSize: "0.55rem", color: C.gold, fontWeight: 700, letterSpacing: "0.16em", marginBottom: 6, display: "flex", alignItems: "center", gap: 5 }}>🏆 TOP PERFORMERS</div>
              {topPerformers.map((r: any, idx: number) => (
                <div key={r.id || idx} style={{ display: "flex", alignItems: "center", gap: 7, padding: "5px 0", borderBottom: idx < topPerformers.length - 1 ? `1px solid ${C.inkXL}25` : "none" }}>
                  <div style={{ width: 20, height: 20, borderRadius: "50%", background: idx === 0 ? "linear-gradient(135deg,#f0c040,#b07d3a)" : idx === 1 ? "linear-gradient(135deg,#ddd,#aaa)" : idx === 2 ? "linear-gradient(135deg,#e09060,#a05020)" : "linear-gradient(135deg,#ccc,#999)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.5rem", fontWeight: 800, color: "#fff", flexShrink: 0 }}>#{idx + 1}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "0.62rem", fontWeight: 700, color: C.ink, lineHeight: 1.2 }}>{r.employee_name || r.user_name || r.department || "—"}</div>
                    <div style={{ fontSize: "0.52rem", color: C.inkL, lineHeight: 1.2 }}>{r.department} · {getProfile(r.cii_score).name}</div>
                  </div>
                  <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.1rem", fontWeight: 800, color: getProfile(r.cii_score).color }}>{r.cii_score}</div>
                </div>
              ))}
            </div>
            <div style={{ borderTop: `1px solid ${C.inkXL}30`, paddingTop: 8 }}>
              <div style={{ fontSize: "0.55rem", color: C.inkL, fontWeight: 700, letterSpacing: "0.16em", marginBottom: 6 }}>⚑ CULTURE FLAGS</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {riskAversionPct > 40 && (
                  <div style={{ background: `${C.s4}06`, border: `1px solid ${C.s4}22`, borderRadius: 7, padding: "6px 9px" }}>
                    <div style={{ fontSize: "0.55rem", fontWeight: 700, color: C.s4, marginBottom: 1 }}>🚨 Risk Aversion — {riskAversionPct}% employees score &lt;45</div>
                    <div style={{ fontSize: "0.6rem", color: C.inkM, lineHeight: 1.5 }}>Systemic culture issue. Psychological safety initiative recommended.</div>
                  </div>
                )}
                {visionBehaviorGap > 10 && (
                  <div style={{ background: `${C.gold}08`, border: `1px solid ${C.gold}22`, borderRadius: 7, padding: "6px 9px" }}>
                    <div style={{ fontSize: "0.55rem", fontWeight: 700, color: C.gold, marginBottom: 1 }}>⚠ Vision–Behavior Gap — {visionBehaviorGap}pt spread</div>
                    <div style={{ fontSize: "0.6rem", color: C.inkM, lineHeight: 1.5 }}>Staff envision more than they execute. Execution enablers needed.</div>
                  </div>
                )}
                {aboveAvgDims >= 4 && (
                  <div style={{ background: `${C.s3}08`, border: `1px solid ${C.s3}22`, borderRadius: 7, padding: "6px 9px" }}>
                    <div style={{ fontSize: "0.55rem", fontWeight: 700, color: C.s3, marginBottom: 1 }}>✅ Strong Creative Base — {aboveAvgDims}/6 dims above avg</div>
                    <div style={{ fontSize: "0.6rem", color: C.inkM, lineHeight: 1.5 }}>Solid innovation foundation present across most dimensions.</div>
                  </div>
                )}
                {hiddenCreatives.length > 0 && (
                  <div style={{ background: `${C.s2}08`, border: `1px solid ${C.s2}22`, borderRadius: 7, padding: "6px 9px" }}>
                    <div style={{ fontSize: "0.55rem", fontWeight: 700, color: C.s2, marginBottom: 1 }}>💎 Hidden Creatives — {hiddenCreatives.length} identified</div>
                    <div style={{ fontSize: "0.6rem", color: C.inkM, lineHeight: 1.5 }}>High Vision + Divergent scores, low CII overall — environment constraints suspected.</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </OrgPanel>

        {/* PANEL G — Recommendations */}
        <OrgPanel title="AI Recommendations & Org Archetype">
          <div style={{ padding: "8px 11px", height: "100%", overflowY: "auto", display: "flex", flexDirection: "column", gap: 7 }}>
            <div style={{ background: `linear-gradient(120deg,${C.gold}12,${C.gold}05)`, border: `1.5px solid ${C.gold}35`, borderRadius: 9, padding: "8px 11px", flexShrink: 0 }}>
              <div style={{ fontSize: "0.52rem", color: C.gold, fontWeight: 700, letterSpacing: "0.14em", marginBottom: 3 }}>◈ ORG CREATIVE ARCHETYPE</div>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "0.92rem", fontWeight: 800, color: C.ink, marginBottom: 4 }}>
                {avgDims[3] > 60 && avgDims[4] < 50 ? "The Structured Dreamer" : avgDims[0] > 60 && avgDims[2] > 55 ? "The Bold Ideator" : avgDims[4] > 60 && avgDims[5] > 60 ? "The Creative Executor" : "The Adaptive Innovator"}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
                <div style={{ background: `${C.s3}08`, border: `1px solid ${C.s3}25`, borderRadius: 5, padding: "4px 7px" }}>
                  <div style={{ fontSize: "0.48rem", fontWeight: 700, color: C.s3, marginBottom: 1 }}>TOP STRENGTH</div>
                  <div style={{ fontSize: "0.65rem", fontWeight: 700, color: C.ink }}>{DIM.short[avgDims.indexOf(Math.max(...avgDims))]}</div>
                </div>
                <div style={{ background: `${C.s4}08`, border: `1px solid ${C.s4}22`, borderRadius: 5, padding: "4px 7px" }}>
                  <div style={{ fontSize: "0.48rem", fontWeight: 700, color: C.s4, marginBottom: 1 }}>GROWTH EDGE</div>
                  <div style={{ fontSize: "0.65rem", fontWeight: 700, color: C.ink }}>{DIM.short[avgDims.indexOf(Math.min(...avgDims))]}</div>
                </div>
              </div>
            </div>
            <div style={{ fontSize: "0.52rem", color: C.inkL, fontWeight: 700, letterSpacing: "0.14em", flexShrink: 0 }}>🎯 L&D INTERVENTIONS</div>
            {[
              { dim: 2, priority: "HIGH", action: "Psychological safety workshop series — reduce organisation-wide risk aversion.", impact: "↑ Risk Openness +8–12 pts" },
              { dim: 4, priority: "HIGH", action: "90-day creative habit program — daily micro-innovation challenges.", impact: "↑ Creative Behavior +10–15 pts" },
              { dim: 5, priority: "MED",  action: "Monthly cross-department hackathons with real business constraints.", impact: "↑ Innovation Thinking +6–10 pts" },
              { dim: 1, priority: "MED",  action: "Cross-domain reading program with weekly insight-sharing sessions.", impact: "↑ Remote Association +5–8 pts" },
            ].map((item, idx) => {
              const color = DIM.colors[item.dim];
              const priColor = item.priority === "HIGH" ? C.s4 : C.gold;
              return (
                <div key={idx} style={{ background: C.white, border: `1.5px solid ${color}28`, borderRadius: 8, padding: "7px 9px", display: "flex", gap: 7, flexShrink: 0 }}>
                  <div style={{ width: 2.5, borderRadius: 2, background: color, flexShrink: 0, minHeight: 36 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 2 }}>
                      <div style={{ fontSize: "0.52rem", fontWeight: 700, color, letterSpacing: "0.08em" }}>{DIM.short[item.dim]}</div>
                      <div style={{ fontSize: "0.48rem", fontWeight: 700, color: priColor, background: `${priColor}14`, borderRadius: 8, padding: "1px 6px", flexShrink: 0, marginLeft: 4 }}>{item.priority}</div>
                    </div>
                    <p style={{ fontSize: "0.62rem", color: C.ink, lineHeight: 1.45, margin: "0 0 3px" }}>{item.action}</p>
                    <div style={{ fontSize: "0.55rem", color: C.s3, fontWeight: 700 }}>{item.impact}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </OrgPanel>
      </div>

      {/* ── Footer ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0, flexWrap: "wrap", gap: 6 }}>
        <p style={{ fontSize: "0.52rem", color: C.inkL, fontStyle: "italic" }}>Org dashboard · {totalEmployees} participant{totalEmployees !== 1 ? "s" : ""} · data may include demo results</p>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          {PROFILES.map((p: any) => (
            <div key={p.name} style={{ display: "flex", alignItems: "center", gap: 3, opacity: orgProfile.name === p.name ? 1 : .3 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: p.color }} />
              <span style={{ fontSize: "0.48rem", color: p.color, fontWeight: orgProfile.name === p.name ? 700 : 400 }}>{p.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Drill Down Modal ── */}
      {drillDown && (
        <DrillDownModal title={drillDown.title} onClose={() => setDrillDown(null)}>

          {drillDown.type === "gauge" && (
            <div>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
                {[
                  { label: "Total Employees", val: totalEmployees, color: C.s5 },
                  { label: "Avg CII Score",   val: avgCII,         color: C.gold },
                  { label: "Profile",         val: orgProfile.name, color: orgProfile.color },
                  { label: "Dims Above Avg",  val: `${aboveAvgDims}/6`, color: C.s3 },
                ].map(m => (
                  <div key={m.label} style={{ flex: "1 1 140px", background: `${m.color}08`, border: `1px solid ${m.color}25`, borderRadius: 10, padding: "10px 14px", textAlign: "center" }}>
                    <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.8rem", fontWeight: 800, color: m.color }}>{m.val}</div>
                    <div style={{ fontSize: "0.6rem", color: C.inkL, fontWeight: 700, letterSpacing: "0.1em", marginTop: 3 }}>{m.label}</div>
                  </div>
                ))}
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.78rem", minWidth: 500 }}>
                  <thead>
                    <tr style={{ background: `${C.navy}10` }}>
                      {["#", "Name", "Designation", "Department", "Profile", "CII", "Div", "Risk", "Vis", "Beh", "Inn"].map(h => (
                        <th key={h} style={{ padding: "8px 10px", textAlign: "left", fontSize: "0.6rem", fontWeight: 700, color: C.inkL, borderBottom: `2px solid ${C.inkXL}`, whiteSpace: "nowrap", background: `${C.navy}08` }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[...(results as any[])].sort((a, b) => b.cii_score - a.cii_score).map((r, i) => {
                      const rp = getProfile(r.cii_score);
                      return (
                        <tr key={r.id || i} style={{ borderBottom: `1px solid ${C.inkXL}30`, background: i % 2 === 0 ? "transparent" : `${C.ink}03` }}>
                          <td style={{ padding: "8px 10px", fontSize: "0.65rem", color: C.inkL, fontWeight: 600 }}>{i + 1}</td>
                          <td style={{ padding: "8px 10px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                              <div style={{ width: 26, height: 26, borderRadius: "50%", background: `linear-gradient(135deg,${rp.color}30,${rp.color}10)`, border: `1.5px solid ${rp.color}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.55rem", fontWeight: 800, color: rp.color, flexShrink: 0 }}>
                                {(r.employee_name || r.user_name || "?").charAt(0).toUpperCase()}
                              </div>
                              <div style={{ fontWeight: 700, color: C.ink, fontSize: "0.72rem" }}>{r.employee_name || r.user_name || "—"}</div>
                            </div>
                          </td>
                          <td style={{ padding: "8px 10px", fontSize: "0.65rem", color: C.inkM }}>{r.employee_designation || "—"}</td>
                          <td style={{ padding: "8px 10px", fontSize: "0.68rem", fontWeight: 600, color: C.inkM }}>{r.department || "—"}</td>
                          <td style={{ padding: "8px 10px" }}><span style={{ background: `${rp.color}18`, color: rp.color, borderRadius: 8, padding: "3px 8px", fontSize: "0.6rem", fontWeight: 700, whiteSpace: "nowrap" }}>{r.profile_name || rp.name}</span></td>
                          <td style={{ padding: "8px 10px", fontFamily: "'Playfair Display',serif", fontSize: "1.05rem", fontWeight: 800, color: rp.color }}>{r.cii_score}</td>
                          {["dim_divergent", "dim_risk", "dim_vision", "dim_behavior", "dim_innovation"].map(k => (
                            <td key={k} style={{ padding: "8px 10px", fontSize: "0.7rem", fontWeight: 700, color: (r[k] || 0) > 65 ? C.s3 : (r[k] || 0) < 40 ? C.s4 : C.inkM, textAlign: "center" }}>{r[k] ?? "—"}</td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {drillDown.type === "dims" && (
            <div>
              <p style={{ fontSize: "0.8rem", color: C.inkM, marginBottom: 14, lineHeight: 1.7 }}>Average dimension scores across all {totalEmployees} employees vs population benchmark.</p>
              {avgDims.map((d, i) => {
                const avg = AVG_BENCHMARK[i]; const diff = d - avg;
                return (
                  <div key={i} style={{ marginBottom: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, flexWrap: "wrap", gap: 4 }}>
                      <div>
                        <span style={{ fontWeight: 700, color: DIM.colors[i], fontSize: "0.82rem" }}>{DIM.short[i]}</span>
                        <span style={{ fontSize: "0.65rem", color: C.inkL, marginLeft: 8 }}>{DIM.descs[i]}</span>
                      </div>
                      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                        <span style={{ fontSize: "0.7rem", color: C.inkL }}>Pop avg: {avg}</span>
                        <span style={{ fontSize: "0.78rem", fontWeight: 700, color: diff >= 0 ? C.s3 : C.s4 }}>{diff >= 0 ? "+" : ""}{diff}</span>
                        <span style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.1rem", fontWeight: 800, color: DIM.colors[i] }}>{d}</span>
                      </div>
                    </div>
                    <div style={{ position: "relative", height: 12, background: `${DIM.colors[i]}15`, borderRadius: 6, overflow: "hidden" }}>
                      <div style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: `${d}%`, background: `linear-gradient(to right,${DIM.colors[i]}80,${DIM.colors[i]})`, borderRadius: 6 }} />
                      <div style={{ position: "absolute", top: 0, bottom: 0, left: `${avg}%`, width: 2, background: C.inkM, opacity: .5 }} />
                    </div>
                    <div style={{ marginTop: 6, display: "flex", gap: 4, flexWrap: "wrap" }}>
                      {deptStats.map((dept: any) => (
                        <span key={dept.dept} style={{ fontSize: "0.58rem", background: `${DIM.colors[i]}12`, border: `1px solid ${DIM.colors[i]}30`, borderRadius: 6, padding: "2px 6px", color: DIM.colors[i], fontWeight: 600 }}>{dept.dept}: {dept.avgDims[i]}</span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {drillDown.type === "profiles" && (
            <div>
              <p style={{ fontSize: "0.8rem", color: C.inkM, marginBottom: 14, lineHeight: 1.7 }}>Distribution of creative profiles across all {totalEmployees} employees.</p>
              {profileDist.map((p: any) => {
                const pct = Math.round(p.count / Math.max(totalEmployees, 1) * 100);
                const emps = (results as any[]).filter(r => r.profile_name === p.name);
                return (
                  <div key={p.name} style={{ marginBottom: 16, border: `1.5px solid ${p.color}30`, borderRadius: 10, overflow: "hidden" }}>
                    <div style={{ background: `${p.color}12`, padding: "8px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 10, height: 10, borderRadius: "50%", background: p.color }} />
                        <span style={{ fontWeight: 700, color: p.color, fontSize: "0.82rem" }}>{p.name}</span>
                        <span style={{ fontSize: "0.65rem", color: C.inkL }}>{p.range}</span>
                      </div>
                      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                        <span style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.3rem", fontWeight: 800, color: p.color }}>{p.count}</span>
                        <span style={{ fontSize: "0.7rem", color: C.inkL }}>{pct}%</span>
                      </div>
                    </div>
                    {emps.length > 0 && (
                      <div style={{ padding: "8px 12px", display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {emps.map((e: any, i: number) => (
                          <span key={i} style={{ fontSize: "0.65rem", background: `${p.color}08`, border: `1px solid ${p.color}22`, borderRadius: 6, padding: "3px 8px", color: C.inkM, fontWeight: 600 }}>{e.department || "—"} · {e.cii_score}</span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {drillDown.type === "dept" && (
            <div>
              <p style={{ fontSize: "0.8rem", color: C.inkM, marginBottom: 14, lineHeight: 1.7 }}>All departments with per-employee CII breakdown.</p>
              {deptStats.map((dept: any) => (
                <div key={dept.dept} style={{ marginBottom: 14, border: `1.5px solid ${C.inkXL}`, borderRadius: 10, overflow: "hidden" }}>
                  <div style={{ background: `${C.navy}08`, padding: "8px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <span style={{ fontWeight: 700, color: C.ink, fontSize: "0.85rem" }}>{dept.dept}</span>
                      <span style={{ fontSize: "0.65rem", color: C.inkL, marginLeft: 8 }}>{dept.count} employees</span>
                    </div>
                    <div style={{ background: getProfile(dept.avgCII).color, color: "#fff", borderRadius: 7, padding: "3px 10px", fontFamily: "'Playfair Display',serif", fontSize: "1rem", fontWeight: 800 }}>{dept.avgCII}</div>
                  </div>
                  <div style={{ padding: "8px 12px" }}>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
                      {dept.avgDims.map((d: number, i: number) => (
                        <span key={i} style={{ fontSize: "0.6rem", background: `${DIM.colors[i]}12`, borderRadius: 6, padding: "2px 7px", color: DIM.colors[i], fontWeight: 700 }}>{DIM.abbr[i]}: {d}</span>
                      ))}
                    </div>
                    <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                      {(results as any[]).filter(r => r.department === dept.dept).map((r, i) => (
                        <div key={i} style={{ background: C.cream, border: `1px solid ${getProfile(r.cii_score).color}30`, borderRadius: 8, padding: "4px 10px", display: "flex", gap: 6, alignItems: "center" }}>
                          <span style={{ fontSize: "0.6rem", color: getProfile(r.cii_score).color, fontWeight: 700 }}>{r.employee_name || "—"}</span>
                          <span style={{ fontFamily: "'Playfair Display',serif", fontSize: "0.95rem", fontWeight: 800, color: getProfile(r.cii_score).color }}>{r.cii_score}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {drillDown.type === "intel" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <div style={{ fontSize: "0.62rem", fontWeight: 700, color: C.gold, letterSpacing: "0.14em", marginBottom: 8 }}>🏆 TOP PERFORMERS</div>
                {[...(results as any[])].sort((a, b) => b.cii_score - a.cii_score).slice(0, 10).map((r, i) => (
                  <div key={r.id || i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 10px", borderRadius: 8, marginBottom: 4, background: i < 3 ? `${C.gold}08` : `${C.ink}03`, border: `1px solid ${i < 3 ? C.gold : C.inkXL}25` }}>
                    <div style={{ width: 22, height: 22, borderRadius: "50%", background: i === 0 ? C.gold : i === 1 ? "#c0c0c0" : i === 2 ? "#cd7f32" : C.inkXL, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.6rem", fontWeight: 800, color: "#fff", flexShrink: 0 }}>#{i + 1}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "0.72rem", fontWeight: 700, color: C.ink }}>{r.employee_name || r.department || "—"}</div>
                      <div style={{ fontSize: "0.6rem", color: C.inkL }}>{r.profile_name || getProfile(r.cii_score).name}</div>
                    </div>
                    <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.2rem", fontWeight: 800, color: getProfile(r.cii_score).color }}>{r.cii_score}</div>
                  </div>
                ))}
              </div>
              {hiddenCreatives.length > 0 && (
                <div>
                  <div style={{ fontSize: "0.62rem", fontWeight: 700, color: C.s2, letterSpacing: "0.14em", marginBottom: 8 }}>💎 HIDDEN CREATIVES</div>
                  {hiddenCreatives.map((r: any, i: number) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 10px", borderRadius: 8, marginBottom: 4, background: `${C.s2}06`, border: `1px solid ${C.s2}22` }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: "0.72rem", fontWeight: 700, color: C.ink }}>{r.department || "—"}</div>
                        <div style={{ fontSize: "0.6rem", color: C.inkL }}>Divergent: {r.dim_divergent} · Vision: {r.dim_vision} · CII: {r.cii_score}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </DrillDownModal>
      )}
    </div>
  );
}