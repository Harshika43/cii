import { getProfile } from "@/constants/profiles";
import { DIM, AVG_BENCHMARK } from "@/constants/dimensions";
import { sb } from "@/lib/supabase/raw";
import type { ResultRow } from "@/types/results";
import type { DeptStats } from "@/types/organization";

declare global {
  interface Window {
    jspdf?: { jsPDF: new (opts: object) => jsPDFInstance };
  }
}

interface jsPDFInstance {
  rect(x:number,y:number,w:number,h:number,style:string):void;
  roundedRect(x:number,y:number,w:number,h:number,rx:number,ry:number,style:string):void;
  circle(x:number,y:number,r:number,style:string):void;
  line(x1:number,y1:number,x2:number,y2:number):void;
  text(text:string,x:number,y:number,opts?:object):void;
  setFont(font:string,style:string):void;
  setFontSize(size:number):void;
  setTextColor(...args:number[]):void;
  setFillColor(...args:number[]):void;
  setDrawColor(...args:number[]):void;
  setLineWidth(w:number):void;
  setGState?(state:object):void;
  GState?(opts:object):object;
  splitTextToSize(text:string,maxWidth:number):string[];
  getTextWidth(text:string):number;
  addPage():void;
  save(filename:string):void;
  output(type:string):Blob;
  internal:{ getNumberOfPages():number };
  setPage(n:number):void;
}

async function loadJsPDF(): Promise<typeof window.jspdf> {
  if (window.jspdf) return window.jspdf;
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
    s.onload  = () => resolve(window.jspdf);
    s.onerror = () => reject(new Error("jsPDF failed to load"));
    document.head.appendChild(s);
  });
}

export async function generateOrgPDFReport(
  orgName: string,
  orgInviteCode: string,
  results: ResultRow[],
  avgDims: number[],
  avgCII: number,
  deptStats: DeptStats[],
  profileDist: Array<{ name: string; color: string; count: number; range: string }>,
  orgId?: string | null,
) {
  await loadJsPDF();
  const { jsPDF } = window.jspdf!;
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const W = 210, H = 297, margin = 14, contentW = 210 - 14 * 2;
  let y = 0;

  // ── Infopace Brand Colors (PDF) ──────────────────────────────
  const navy   = [13, 43, 82];
  const gold   = [26, 111, 196];
  const ink    = [10, 22, 40];
  const inkM   = [45, 74, 110];
  const inkL   = [107, 138, 170];
  const inkXL  = [194, 212, 232];
  const white  = [255, 255, 255];
  const cream  = [240, 245, 251];
  const green  = [13, 158, 110];
  const red    = [232, 22, 43];

  const dimColors = [
    [26, 111, 196],
    [74, 159, 224],
    [107, 63, 160],
    [13, 158, 110],
    [232, 22, 43],
    [240, 124, 26],
  ];

  const profileColorMap: Record<string, number[]> = {
    "Visionary Innovator":   [26, 111, 196],
    "Creative Catalyst":     [13, 158, 110],
    "Adaptive Innovator":    [107, 63, 160],
    "Structured Thinker":    [240, 124, 26],
    "Conventional Executor": [107, 138, 170],
  };

  const orgProfile = getProfile(avgCII);

  const sRGB  = (...c: number[]) => doc.setTextColor(...c);
  const sFill = (...c: number[]) => doc.setFillColor(...c);
  const sDraw = (...c: number[]) => doc.setDrawColor(...c);

  const checkPageBreak = (need = 20) => {
    if (y + need > H - 16) { doc.addPage(); y = 0; return true; }
    return false;
  };

  const pageHeader = (title: string, subtitle = "") => {
    sFill(...navy); doc.rect(0, 0, W, 18, "F");
    sFill(...gold); doc.rect(0, 18, W, 1.5, "F");
    sRGB(...white); doc.setFont("helvetica", "bold"); doc.setFontSize(10);
    doc.text(title, margin, 12);
    if (subtitle) {
      sRGB(180, 165, 145); doc.setFont("helvetica", "normal"); doc.setFontSize(7);
      doc.text(subtitle, W - margin, 12, { align: "right" });
    }
    sFill(...navy); doc.rect(0, H - 10, W, 10, "F");
    y = 26;
  };

  // ══════════════════════════════════════════════
  // PAGE 1 — COVER
  // ══════════════════════════════════════════════
  sFill(...navy); doc.rect(0, 0, W, 80, "F");
  sFill(...gold); doc.rect(0, 78, W, 3, "F");
  sFill(...cream); doc.rect(0, 81, W, H - 81, "F");

  sRGB(...(gold as [number, number, number]));
  doc.setFont("helvetica", "bold"); doc.setFontSize(7);
  doc.text("CREATIVE INNOVATION INDEX — ORGANIZATIONAL REPORT", margin, 18);
  sRGB(...white); doc.setFontSize(30);
  doc.text("Organization", margin, 36);
  doc.text("Innovation Report", margin, 50);
  sRGB(180, 165, 145); doc.setFont("helvetica", "normal"); doc.setFontSize(9);
  doc.text(`${orgName}  ·  Invite Code: ${orgInviteCode || "—"}`, margin, 62);
  doc.text(`Generated: ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}  ·  ${results.length} Employees Assessed`, margin, 70);

  y = 96;
  sFill(...white); sDraw(...inkXL); doc.setLineWidth(0.3);
  doc.roundedRect(margin, y, contentW, 56, 4, 4, "FD");
  sFill(...(profileColorMap[orgProfile.name] || navy)); doc.rect(margin, y, 4, 56, "F");

  sRGB(...inkL); doc.setFontSize(6.5); doc.setFont("helvetica", "bold");
  doc.text("OVERALL ORGANIZATION CII SCORE", margin + 10, y + 9);
  sRGB(...(profileColorMap[orgProfile.name] || navy)); doc.setFontSize(48); doc.setFont("helvetica", "bold");
  doc.text(String(avgCII), margin + 10, y + 36);
  sRGB(...inkL); doc.setFontSize(9); doc.setFont("helvetica", "normal");
  doc.text("/100", margin + 10 + doc.getTextWidth(String(avgCII)) * 0.9 + 2, y + 36);
  sRGB(...(profileColorMap[orgProfile.name] || navy)); doc.setFontSize(11); doc.setFont("helvetica", "bold");
  doc.text(orgProfile.name, margin + 75, y + 18);
  sRGB(...inkL); doc.setFontSize(7.5); doc.setFont("helvetica", "normal");
  doc.text(`${results.length} employees assessed across ${deptStats.length} departments`, margin + 75, y + 27);
  doc.text(`${avgDims.filter((d, i) => d > AVG_BENCHMARK[i]).length}/6 dimensions above population average`, margin + 75, y + 35);
  doc.text(`Invite Code: ${orgInviteCode || "—"}`, margin + 75, y + 43);

  y += 66;
  sRGB(...inkL); doc.setFontSize(6.5); doc.setFont("helvetica", "bold");
  doc.text("DIMENSION OVERVIEW", margin, y); y += 5;
  const bw = (contentW - 5 * 2) / 6;
  DIM.short.forEach((name, i) => {
    const bx = margin + i * (bw + 2);
    const fh = Math.max(1, (avgDims[i] / 100) * 18);
    sFill(...inkXL); doc.rect(bx, y + 18 - 18, bw, 18, "F");
    sFill(...dimColors[i]); doc.rect(bx, y + 18 - fh, bw, fh, "F");
    sRGB(...dimColors[i]); doc.setFontSize(5.5); doc.setFont("helvetica", "bold");
    doc.text(DIM.abbr[i], bx + bw / 2, y + 22, { align: "center" });
    sRGB(...ink); doc.setFontSize(6.5);
    doc.text(String(avgDims[i]), bx + bw / 2, y + 28, { align: "center" });
  });
  y += 34;

  sRGB(...inkL); doc.setFontSize(6.5); doc.setFont("helvetica", "bold");
  doc.text("PROFILE DISTRIBUTION", margin, y); y += 5;
  const total = results.length || 1;
  profileDist.forEach(p => {
    const pct = Math.round((p.count / total) * 100);
    const bl  = (pct / 100) * (contentW - 52);
    sFill(...(profileColorMap[p.name] || inkXL));
    doc.rect(margin, y, Math.max(bl, p.count > 0 ? 2 : 0), 5, "F");
    sRGB(...ink); doc.setFontSize(6); doc.setFont("helvetica", "normal");
    doc.text(p.name, margin + contentW - 50, y + 4);
    sRGB(...(profileColorMap[p.name] || inkXL));
    doc.text(`${p.count} (${pct}%)`, margin + contentW - 14, y + 4, { align: "right" });
    y += 7;
  });

  sFill(...navy); doc.rect(0, H - 10, W, 10, "F");
  sRGB(107, 138, 170); doc.setFontSize(5.5); doc.setFont("helvetica", "normal");
  doc.text(`CONFIDENTIAL — FOR INTERNAL USE ONLY  ·  ${orgName}  ·  Creative Innovation Index`, W / 2, H - 4, { align: "center" });

  // ══════════════════════════════════════════════
  // PAGE 2 — DIMENSION ANALYSIS
  // ══════════════════════════════════════════════
  doc.addPage(); y = 0;
  pageHeader("DIMENSION ANALYSIS", `${orgName}  ·  ${results.length} Employees`);

  DIM.short.forEach((name, i) => {
    checkPageBreak(38);
    const d    = avgDims[i];
    const avg  = AVG_BENCHMARK[i];
    const diff = d - avg;
    const color = dimColors[i];

    sFill(...white); sDraw(...inkXL); doc.setLineWidth(0.2);
    doc.roundedRect(margin, y, contentW, 34, 2, 2, "FD");
    sFill(...color); doc.rect(margin, y, 3, 34, "F");

    sRGB(...color); doc.setFontSize(9); doc.setFont("helvetica", "bold");
    doc.text(name, margin + 7, y + 8);
    sRGB(...inkL); doc.setFontSize(6.5); doc.setFont("helvetica", "normal");
    doc.text(DIM.descs[i], margin + 7, y + 14);

    sRGB(...color); doc.setFontSize(18); doc.setFont("helvetica", "bold");
    doc.text(String(d), W - margin - 30, y + 13);
    sFill(...(diff >= 0 ? green : red));
    doc.roundedRect(W - margin - 22, y + 15, 18, 7, 2, 2, "F");
    sRGB(...white); doc.setFontSize(6); doc.setFont("helvetica", "bold");
    doc.text(`${diff >= 0 ? "+" : ""}${diff} vs avg`, W - margin - 13, y + 20, { align: "center" });

    sFill(...inkXL); doc.rect(margin + 7, y + 20, contentW - 38, 5, "F");
    sFill(...color); doc.rect(margin + 7, y + 20, (d / 100) * (contentW - 38), 5, "F");
    sFill(80, 80, 80); doc.rect(margin + 7 + (avg / 100) * (contentW - 38) - 0.5, y + 20, 1.5, 5, "F");

    y += 38;
  });

  // ══════════════════════════════════════════════
  // PAGE 3 — DEPARTMENT BREAKDOWN
  // ══════════════════════════════════════════════
  doc.addPage(); y = 0;
  pageHeader("DEPARTMENT BREAKDOWN", `${deptStats.length} Departments`);

  deptStats.forEach(dept => {
    checkPageBreak(52);
    sFill(...navy); doc.rect(margin, y, contentW, 11, "F");
    sFill(...gold); doc.rect(margin, y, 3, 11, "F");
    sRGB(...white); doc.setFontSize(9); doc.setFont("helvetica", "bold");
    doc.text(dept.dept, margin + 7, y + 7.5);
    sRGB(...(gold as [number, number, number])); doc.setFontSize(7);
    doc.text(`${dept.count} employee${dept.count !== 1 ? "s" : ""}`, margin + 65, y + 7.5);
    sRGB(...white); doc.setFontSize(10); doc.setFont("helvetica", "bold");
    doc.text(`CII: ${dept.avgCII}`, W - margin - 2, y + 7.5, { align: "right" });
    y += 14;

    const dbw = (contentW - 5 * 6) / 6;
    DIM.abbr.forEach((abbr, i) => {
      const bx  = margin + i * (dbw + 6);
      const val = dept.avgDims[i];
      const fh  = Math.max(1, (val / 100) * 14);
      sFill(220, 215, 210); doc.rect(bx, y + 14 - 14, dbw, 14, "F");
      sFill(...dimColors[i]); doc.rect(bx, y + 14 - fh, dbw, fh, "F");
      sRGB(...dimColors[i]); doc.setFontSize(5.5); doc.setFont("helvetica", "bold");
      doc.text(abbr, bx + dbw / 2, y + 17, { align: "center" });
      sRGB(...ink); doc.setFontSize(6);
      doc.text(String(val), bx + dbw / 2, y + 23, { align: "center" });
    });
    y += 28;

    sDraw(...inkXL); doc.setLineWidth(0.2);
    doc.line(margin, y, W - margin, y);
    y += 5;
  });

  // ══════════════════════════════════════════════
  // PAGE 4+ — INDIVIDUAL PROFILES
  // ══════════════════════════════════════════════
  const sorted = [...results].sort((a, b) => b.cii_score - a.cii_score);
  doc.addPage(); y = 0;
  pageHeader("INDIVIDUAL EMPLOYEE PROFILES", `All ${results.length} Participants — Sorted by CII Score`);

  sorted.forEach((r, idx) => {
    checkPageBreak(62);
    const rp     = getProfile(r.cii_score);
    const rc     = profileColorMap[rp.name] || inkXL;
    const cardH  = 56;

    sFill(...white); sDraw(...inkXL); doc.setLineWidth(0.25);
    doc.roundedRect(margin, y, contentW, cardH, 3, 3, "FD");
    sFill(...rc); doc.rect(margin, y, 4, cardH, "F");

    sFill(...(idx < 3 ? gold : inkXL));
    doc.circle(margin + 14, y + 8, 5, "F");
    sRGB(...white); doc.setFontSize(6); doc.setFont("helvetica", "bold");
    doc.text(`#${idx + 1}`, margin + 14, y + 10, { align: "center" });

    sRGB(...ink); doc.setFontSize(10); doc.setFont("helvetica", "bold");
    doc.text((r.employee_name || r.department || "—").slice(0, 28), margin + 22, y + 8);
    sRGB(...inkL); doc.setFontSize(6.5); doc.setFont("helvetica", "normal");
    doc.text(`${r.employee_designation || "—"}  ·  ${r.department || "—"}`, margin + 22, y + 14);

    sFill(...rc);
    doc.roundedRect(W - margin - 38, y + 3, 34, 8, 2, 2, "F");
    sRGB(...white); doc.setFontSize(5.5); doc.setFont("helvetica", "bold");
    doc.text(rp.name, W - margin - 21, y + 8, { align: "center" });

    sRGB(...rc); doc.setFontSize(22); doc.setFont("helvetica", "bold");
    doc.text(String(r.cii_score), W - margin - 8, y + 22, { align: "right" });
    sRGB(...inkL); doc.setFontSize(6);
    doc.text("CII", W - margin - 8, y + 27, { align: "right" });

    const dimBarW = (contentW - 60) / 6;
    const dimVals = [r.dim_divergent, r.dim_assoc, r.dim_risk, r.dim_vision, r.dim_behavior, r.dim_innovation];
    DIM.abbr.forEach((abbr, i) => {
      const bx  = margin + 7 + i * (dimBarW + 2);
      const val = dimVals[i] || 0;
      const fh  = Math.max(1, (val / 100) * 14);
      const avg = AVG_BENCHMARK[i];
      sFill(...inkXL); doc.rect(bx, y + 18, dimBarW, 14, "F");
      sFill(...dimColors[i]); doc.rect(bx, y + 18 + (14 - fh), dimBarW, fh, "F");
      sFill(80, 80, 80); doc.rect(bx, y + 18 + (14 - (avg / 100) * 14), dimBarW, 0.8, "F");
      sRGB(...dimColors[i]); doc.setFontSize(5); doc.setFont("helvetica", "bold");
      doc.text(abbr, bx + dimBarW / 2, y + 35, { align: "center" });
      sRGB(...(val >= avg ? green : red)); doc.setFontSize(5);
      doc.text(String(val), bx + dimBarW / 2, y + 40, { align: "center" });
    });

    if (r.ai_key_insight) {
      sRGB(...inkL); doc.setFontSize(5.5); doc.setFont("helvetica", "bold");
      doc.text("KEY INSIGHT:", margin + 7, y + 45);
      sRGB(...inkM); doc.setFont("helvetica", "normal");
      const lines = doc.splitTextToSize(r.ai_key_insight.slice(0, 110), contentW - 50);
      doc.text(lines.slice(0, 1), margin + 28, y + 45);
    }

    y += cardH + 5;
  });

  // ══════════════════════════════════════════════
  // FINAL PAGE — STRATEGIC RECOMMENDATIONS
  // ══════════════════════════════════════════════
  doc.addPage(); y = 0;
  pageHeader("STRATEGIC RECOMMENDATIONS", orgName);

  const riskPct   = Math.round(results.filter(r => (r.dim_risk || 0) < 45).length / Math.max(results.length, 1) * 100);
  const visGap    = avgDims[3] - avgDims[4];
  const hidden    = results.filter(r => (r.dim_divergent || 0) > 65 && (r.dim_vision || 0) > 65 && r.cii_score < 55).length;
  const archetype = avgDims[3] > 60 && avgDims[4] < 50
    ? "The Structured Dreamer"
    : avgDims[0] > 60 && avgDims[2] > 55
    ? "The Bold Ideator"
    : avgDims[4] > 60 && avgDims[5] > 60
    ? "The Creative Executor"
    : "The Adaptive Innovator";

  sFill(250, 247, 242); sDraw(...(gold as [number, number, number])); doc.setLineWidth(0.4);
  doc.roundedRect(margin, y, contentW, 22, 3, 3, "FD");
  sFill(...(gold as [number, number, number])); doc.rect(margin, y, 3, 22, "F");
  sRGB(...(gold as [number, number, number])); doc.setFontSize(6.5); doc.setFont("helvetica", "bold");
  doc.text("◈ ORGANIZATIONAL CREATIVE ARCHETYPE", margin + 7, y + 7);
  sRGB(...ink); doc.setFontSize(13); doc.setFont("helvetica", "bold");
  doc.text(archetype, margin + 7, y + 16);
  y += 27;

  const flags = [];
  if (riskPct > 40)   flags.push({ color: red,           title: `Risk Aversion: ${riskPct}% employees score <45`,    desc: "Launch a psychological safety initiative." });
  if (visGap > 10)    flags.push({ color: gold as number[], title: `Vision–Behavior Gap: ${visGap}pt spread`,            desc: "Remove blockers and build execution rituals." });
  if (hidden > 0)     flags.push({ color: [107, 63, 160],  title: `${hidden} Hidden Creative${hidden > 1 ? "s" : ""} identified`, desc: "High divergent + vision scores masked by low CII." });

  if (flags.length > 0) {
    sRGB(...inkL); doc.setFontSize(6.5); doc.setFont("helvetica", "bold");
    doc.text("CULTURE FLAGS", margin, y); y += 5;
    flags.forEach(f => {
      checkPageBreak(16);
      sFill(...white); sDraw(...(f.color as [number, number, number])); doc.setLineWidth(0.3);
      doc.roundedRect(margin, y, contentW, 13, 2, 2, "FD");
      sFill(...(f.color as [number, number, number])); doc.rect(margin, y, 3, 13, "F");
      sRGB(...(f.color as [number, number, number])); doc.setFontSize(7); doc.setFont("helvetica", "bold");
      doc.text(f.title, margin + 7, y + 6);
      sRGB(...inkM); doc.setFontSize(6.5); doc.setFont("helvetica", "normal");
      doc.text(f.desc, margin + 7, y + 11);
      y += 16;
    });
    y += 3;
  }

  const recs = [
    { priority: "HIGH", dim: 2, title: "Psychological Safety Initiative",     detail: "Structured workshops on failure culture and creative risk-taking.",   impact: "Expected uplift: Risk +8–12 pts" },
    { priority: "HIGH", dim: 4, title: "90-Day Creative Habit Program",        detail: "Daily micro-innovation challenge with peer accountability.",           impact: "Expected uplift: Behavior +10–15 pts" },
    { priority: "MED",  dim: 5, title: "Cross-Department Hackathons",          detail: "Monthly hackathons with real organizational constraints.",              impact: "Expected uplift: Innovation +6–10 pts" },
    { priority: "MED",  dim: 1, title: "Cross-Domain Reading & Sharing",       detail: "Weekly reading program across unrelated fields.",                       impact: "Expected uplift: Remote Assoc +5–8 pts" },
  ];

  sRGB(...inkL); doc.setFontSize(6.5); doc.setFont("helvetica", "bold");
  doc.text("L&D INTERVENTIONS", margin, y); y += 5;
  recs.forEach(rec => {
    checkPageBreak(30);
    const pc = rec.priority === "HIGH" ? red : gold as number[];
    const dc = dimColors[rec.dim] || navy;
    sFill(...white); sDraw(...inkXL); doc.setLineWidth(0.25);
    doc.roundedRect(margin, y, contentW, 26, 2, 2, "FD");
    sFill(...dc); doc.rect(margin, y, 3, 26, "F");
    sFill(...(pc as [number, number, number]));
    doc.roundedRect(W - margin - 16, y + 3, 12, 6, 2, 2, "F");
    sRGB(...white); doc.setFontSize(5.5); doc.setFont("helvetica", "bold");
    doc.text(rec.priority, W - margin - 10, y + 7, { align: "center" });
    sRGB(...dc); doc.setFontSize(6.5); doc.setFont("helvetica", "bold");
    doc.text(DIM.short[rec.dim], margin + 7, y + 7);
    sRGB(...ink); doc.setFontSize(8); doc.setFont("helvetica", "bold");
    doc.text(rec.title, margin + 7, y + 13);
    sRGB(...inkM); doc.setFontSize(6); doc.setFont("helvetica", "normal");
    const dLines = doc.splitTextToSize(rec.detail, contentW - 14);
    doc.text(dLines.slice(0, 2), margin + 7, y + 19);
    sRGB(...green); doc.setFontSize(5.5); doc.setFont("helvetica", "bold");
    doc.text(rec.impact, margin + 7, y + 24);
    y += 29;
  });

  // Footer on all pages
  const totalPages = doc.internal.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    sFill(...navy); doc.rect(0, H - 10, W, 10, "F");
    sRGB(107, 138, 170); doc.setFontSize(5.5); doc.setFont("helvetica", "normal");
    doc.text(
      `Page ${p} of ${totalPages}  ·  CONFIDENTIAL  ·  ${orgName}  ·  Creative Innovation Index`,
      W / 2, H - 4, { align: "center" }
    );
  }

  const filename = `CII-OrgReport-${orgName.replace(/\s+/g, "-")}-${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);

  try {
    const pdfBlob = doc.output("blob");
    await sb.uploadFile("cii-exports", filename, pdfBlob, "application/pdf");
  } catch (e) {
    console.error("[PDF] Storage upload failed:", (e as Error).message);
  }
}
