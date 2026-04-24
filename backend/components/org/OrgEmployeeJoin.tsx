"use client";
import { useState } from "react";
import { LiveBackground } from "@/components/ui/LiveBackground";
import { C }              from "@/constants/theme";
import { DEPARTMENTS }    from "@/constants/industries";
import { dbGetOrgByInvite } from "@/lib/db/organizations";
import type { Organization } from "@/types/organization";

const labelStyle: React.CSSProperties = {
  fontSize:"0.62rem", fontWeight:700, letterSpacing:"0.2em",
  color:C.inkM, marginBottom:6, display:"block", textTransform:"uppercase",
};

function inputStyle(focused: boolean, err: boolean): React.CSSProperties {
  return {
    width:"100%", background:focused?C.white:"rgba(255,255,255,0.85)",
    border:`1.5px solid ${err?C.s2:focused?C.s1:C.inkXL}`,
    borderRadius:10, padding:"12px 14px", color:C.ink, fontSize:"0.9rem",
    lineHeight:1.5, transition:"all .2s",
    boxShadow:focused?`0 0 0 3px ${C.s1}20`:"0 1px 3px rgba(13,43,82,0.05)",
  };
}

interface Props {
  prefillCode: string;
  onJoined:   (org: Organization, dept: string) => void;
  onBack:     () => void;
}

export function OrgEmployeeJoin({ prefillCode, onJoined, onBack }: Props) {
  const [code,    setCode]    = useState(prefillCode || "");
  const [org,     setOrg]     = useState<Organization | null>(null);
  const [dept,    setDept]    = useState("");
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  const lookupCode = async () => {
    if (!code.trim()) { setError("Enter your invite code"); return; }
    setLoading(true); setError("");
    try {
      const found = await dbGetOrgByInvite(code.trim()) as Organization | null;
      if (!found) setError("Invalid invite code. Please check with your manager.");
      else setOrg(found);
    } catch { setError("Could not verify code. Try again."); }
    setLoading(false);
  };

  const handleJoin = () => {
    if (!dept) { setError("Please select your department"); return; }
    onJoined(org!, dept);
  };

  return (
    <div style={{ minHeight:"100dvh", width:"100vw", position:"relative", display:"flex", alignItems:"center", justifyContent:"center", padding:"3vh 20px", overflow:"hidden" }}>
      <LiveBackground/>
      <div style={{ maxWidth:"min(440px,92vw)", width:"100%", position:"relative", zIndex:1 }} className="fu">
        <div style={{ textAlign:"center", marginBottom:"2vh" }}>
          <button onClick={onBack} style={{ background:"rgba(13,43,82,0.07)", border:"1px solid rgba(26,111,196,0.2)", borderRadius:8, color:C.inkM, fontSize:"0.75rem", cursor:"pointer", marginBottom:"1rem", padding:"6px 14px", fontWeight:600 }}>← Back</button>
          <div style={{ fontSize:"2rem", marginBottom:8 }}>🔗</div>
          <div style={{ fontSize:"0.58rem", letterSpacing:"0.32em", color:C.s1, fontWeight:700, marginBottom:6 }}>EMPLOYEE PORTAL</div>
          <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(1.4rem,4vw,1.9rem)", fontWeight:800, color:C.ink, lineHeight:1.1 }}>
            {!org ? "Enter Invite Code" : "Select Department"}
          </h2>
        </div>

        <div className="glass-card" style={{ borderRadius:20, padding:"clamp(1.2rem,4vw,1.8rem)", display:"flex", flexDirection:"column", gap:14 }}>
          {!org ? (
            <>
              <div>
                <label style={labelStyle}>Invite Code</label>
                <input
                  value={code}
                  onChange={e => { setCode(e.target.value.toUpperCase()); setError(""); }}
                  onFocus={() => setFocused("code")}
                  onBlur={() => setFocused(null)}
                  onKeyDown={e => e.key === "Enter" && lookupCode()}
                  placeholder="e.g. ABC123"
                  style={{ ...inputStyle(focused === "code", !!error), textTransform:"uppercase", letterSpacing:"0.2em", fontSize:"1.1rem", textAlign:"center" }}
                />
                {error && <div style={{ fontSize:"0.72rem", color:C.s2, marginTop:6 }}>{error}</div>}
              </div>
              <button onClick={lookupCode} disabled={loading} className="btn-primary" style={{ width:"100%", padding:"1rem", borderRadius:12, border:"none", fontSize:"0.88rem", fontWeight:700, cursor:loading?"default":"pointer", opacity:loading?0.7:1 }}>
                {loading ? "Verifying…" : "Verify Code →"}
              </button>
            </>
          ) : (
            <>
              <div style={{ background:`${C.s3}08`, border:`1px solid ${C.s3}25`, borderRadius:10, padding:"10px 14px", display:"flex", alignItems:"center", gap:8 }}>
                <span style={{ fontSize:"1rem" }}>🏢</span>
                <div>
                  <div style={{ fontSize:"0.55rem", color:C.s3, fontWeight:700, letterSpacing:"0.14em" }}>ORGANISATION VERIFIED</div>
                  <div style={{ fontSize:"0.78rem", fontWeight:700, color:C.ink }}>{org.name}</div>
                </div>
              </div>
              <div>
                <label style={labelStyle}>Your Department</label>
                <select
                  value={dept}
                  onChange={e => { setDept(e.target.value); setError(""); }}
                  onFocus={() => setFocused("dept")}
                  onBlur={() => setFocused(null)}
                  style={{ ...inputStyle(focused === "dept", !!error), appearance:"none" }}
                >
                  <option value="">Select department…</option>
                  {DEPARTMENTS.map((d: string) => <option key={d} value={d}>{d}</option>)}
                </select>
                {error && <div style={{ fontSize:"0.72rem", color:C.s2, marginTop:6 }}>{error}</div>}
              </div>
              <button onClick={handleJoin} className="btn-primary" style={{ width:"100%", padding:"1rem", borderRadius:12, border:"none", fontSize:"0.88rem", fontWeight:700, cursor:"pointer" }}>
                Continue →
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}