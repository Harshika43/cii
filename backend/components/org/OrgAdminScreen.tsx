"use client";
import { useState } from "react";
import { LiveBackground } from "@/components/ui/LiveBackground";
import { FieldError }     from "@/components/ui/FieldError";
import { C }              from "@/constants/theme";
import { INDUSTRIES }     from "@/constants/industries";
import { dbCreateOrg, dbGetOrgByInvite, dbLoginOrg } from "@/lib/db/organizations";
import { genId }          from "@/lib/utils/helpers";
import { isValidEmail }   from "@/lib/utils/validation";

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
  onCreated:  (org: unknown) => void;
  onLoggedIn: (org: unknown) => void;
  onBack:     () => void;
}

export function OrgAdminScreen({ onCreated, onLoggedIn, onBack }: Props) {
  const [mode,    setMode]    = useState<"signup"|"signin">("signup");
  const [focused, setFocused] = useState<string|null>(null);
  const [saving,  setSaving]  = useState(false);
  const [created, setCreated] = useState<any>(null);
  const [form,    setForm]    = useState({ name:"", industry:"", adminEmail:"", adminPassword:"" });
  const [errors,  setErrors]  = useState<Record<string,string>>({});
  const [loginEmail,    setLoginEmail]    = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError,    setLoginError]    = useState("");
  const [loginLoading,  setLoginLoading]  = useState(false);
  

  const setField = (k: string, v: string) => { setForm(p=>({...p,[k]:v})); setErrors(p=>({...p,[k]:""})); };

  const validateSignup = () => {
    const e: Record<string,string> = {};
    if (!form.name.trim())              e.name         = "Organization name required";
    if (!form.industry)                 e.industry     = "Please select an industry";
    if (!isValidEmail(form.adminEmail)) e.adminEmail   = "Valid email required";
    if (!form.adminPassword || form.adminPassword.length < 6) e.adminPassword = "Password must be at least 6 characters";
    return e;
  };

  const handleCreate = async () => {
    const e = validateSignup();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSaving(true);
    try {
      const org = await dbCreateOrg(form) as any;
      setCreated(org);
    } catch (err: any) {
      setErrors({ adminEmail: err?.message || "Failed to create org. Please try again." });
    }
    setSaving(false);
  };

  // ✅ Password check happens server-side — browser never sees admin_password
  const handleLogin = async () => {
    if (!loginEmail.trim())    { setLoginError("Email required"); return; }
    if (!loginPassword.trim()) { setLoginError("Password required"); return; }
    setLoginLoading(true); setLoginError("");
    try {
      const org = await dbLoginOrg(loginEmail.trim(), loginPassword);
      onLoggedIn(org);
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : "Login failed. Please try again.");
    }
    setLoginLoading(false);
  };

  

  const inviteLink = created ? `${typeof window!=="undefined"?window.location.origin:""}?invite=${created.invite_code}` : "";

  if (created) return (
    <div style={{ minHeight:"100dvh",width:"100vw",position:"relative",display:"flex",alignItems:"center",justifyContent:"center",padding:"4vh 20px",overflow:"hidden" }}>
      <LiveBackground/>
      <div style={{ maxWidth:"min(480px,92vw)",width:"100%",textAlign:"center",position:"relative",zIndex:1 }} className="fu">
        <div style={{ width:64,height:64,borderRadius:"50%",background:"rgba(13,158,110,0.1)",border:"1.5px solid rgba(13,158,110,0.4)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 1.4rem",fontSize:"1.6rem",boxShadow:"0 0 0 8px rgba(13,158,110,0.08)" }}>✓</div>
        <div style={{ fontSize:"0.58rem",letterSpacing:"0.38em",color:C.s3,fontWeight:700,marginBottom:"0.5rem" }}>ORG SESSION CREATED</div>
        <h2 style={{ fontFamily:"'Playfair Display',serif",fontSize:"1.9rem",fontWeight:800,color:C.ink,marginBottom:"0.6rem" }}>{created.name}</h2>
        <div className="glass-card" style={{ borderRadius:18,padding:"1.6rem",marginBottom:"1rem",border:`2px solid rgba(26,111,196,0.3)` }}>
          <div style={{ fontSize:"0.55rem",letterSpacing:"0.3em",color:C.inkL,marginBottom:10,fontWeight:700 }}>INVITE CODE</div>
          <div style={{ fontFamily:"'Playfair Display',serif",fontSize:"3rem",fontWeight:800,letterSpacing:"0.2em",background:"linear-gradient(135deg,#1A6FC4,#0D2B52)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text" }}>{created.invite_code}</div>
        </div>
        <div style={{ background:"rgba(26,111,196,0.06)",border:`1px solid rgba(26,111,196,0.18)`,borderRadius:12,padding:"0.9rem",marginBottom:"1.2rem" }}>
          <div style={{ fontSize:"0.58rem",color:C.inkL,marginBottom:4,fontWeight:700,letterSpacing:"0.14em" }}>SHAREABLE LINK</div>
          <div style={{ fontSize:"0.7rem",color:C.s1,wordBreak:"break-all",lineHeight:1.5 }}>{inviteLink}</div>
        </div>
        <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
          <button onClick={() => navigator.clipboard.writeText(inviteLink)} className="glass-card" style={{ width:"100%",border:`1.5px solid rgba(26,111,196,0.3)`,borderRadius:11,padding:"0.85rem",fontSize:"0.82rem",fontWeight:700,cursor:"pointer",color:C.s1 }}>📋 COPY INVITE LINK</button>
          <button onClick={() => onCreated(created)} className="btn-primary" style={{ width:"100%",padding:"0.85rem",fontSize:"0.82rem",borderRadius:11,border:"none",cursor:"pointer" }}>VIEW ORG DASHBOARD →</button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:"100dvh",width:"100vw",position:"relative",display:"flex",alignItems:"center",justifyContent:"center",padding:"3vh 20px",overflow:"hidden" }}>
      <LiveBackground/>
      <div style={{ maxWidth:"min(480px,92vw)",width:"100%",position:"relative",zIndex:1 }} className="fu">
        <div style={{ textAlign:"center",marginBottom:"2vh" }}>
          <button onClick={onBack} style={{ background:"rgba(13,43,82,0.07)",border:"1px solid rgba(26,111,196,0.2)",borderRadius:8,color:C.inkM,fontSize:"0.75rem",cursor:"pointer",marginBottom:"1rem",padding:"6px 14px",fontWeight:600 }}>← Back</button>
          <div style={{ fontSize:"0.58rem",letterSpacing:"0.4em",color:C.s1,fontWeight:700,marginBottom:"0.4rem" }}>ORGANIZATION ADMIN</div>
          <h2 style={{ fontFamily:"'Playfair Display',serif",fontSize:"clamp(1.4rem,3vw,1.9rem)",fontWeight:800,color:C.ink }}>
            {mode==="signup" ? "Create your Org Session" : "Access your Dashboard"}
          </h2>
        </div>

        {/* Toggle */}
        <div className="glass-card" style={{ borderRadius:12,padding:"4px",display:"flex",gap:4,marginBottom:"1.4rem" }}>
          {(["signup","signin"] as const).map(m => (
            <button key={m} className={`auth-mode-btn ${mode===m?"active":""}`} onClick={()=>setMode(m)} style={{ fontSize:"0.7rem" }}>
              {m==="signup" ? "✦ Create New Org" : "🔐 Admin Sign In"}
            </button>
          ))}
        </div>

        <div className="glass-card" style={{ borderRadius:18,padding:"clamp(18px,3vh,28px)" }}>
          {mode==="signup" ? (
            <div style={{ display:"flex",flexDirection:"column",gap:"1.1rem" }}>
              {[
                { key:"name",          label:"ORGANIZATION NAME", type:"text",     ph:"e.g. Infopace, Razorpay..." },
                { key:"adminEmail",    label:"ADMIN EMAIL",       type:"email",    ph:"your@company.com" },
                { key:"adminPassword", label:"ADMIN PASSWORD",    type:"password", ph:"Create a secure password" },
              ].map(f => (
                <div key={f.key}>
                  <label style={labelStyle}>{f.label}</label>
                  <input type={f.type} value={(form as any)[f.key]}
                    onChange={e=>setField(f.key,e.target.value)}
                    onFocus={()=>setFocused(f.key)} onBlur={()=>setFocused(null)}
                    placeholder={f.ph} style={inputStyle(focused===f.key,!!errors[f.key])}/>
                  <FieldError msg={errors[f.key]}/>
                </div>
              ))}
              <div>
                <label style={labelStyle}>INDUSTRY</label>
                <div style={{ position:"relative" }}>
                  <select value={form.industry} onChange={e=>setField("industry",e.target.value)}
                    style={{ ...inputStyle(focused==="industry",!!errors.industry),appearance:"none",cursor:"pointer",color:form.industry?C.ink:C.inkXL,paddingRight:36 }}>
                    <option value="" disabled>Select industry</option>
                    {INDUSTRIES.map(d=><option key={d} value={d}>{d}</option>)}
                  </select>
                  <div style={{ position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",pointerEvents:"none",color:C.s1,fontSize:12 }}>▾</div>
                </div>
                <FieldError msg={errors.industry}/>
              </div>
              <button onClick={handleCreate} disabled={saving} className="btn-primary" style={{ width:"100%",padding:"0.9rem",fontSize:"0.82rem",borderRadius:11,border:"none",cursor:saving?"default":"pointer",opacity:saving?0.7:1 }}>
                {saving ? "CREATING..." : "CREATE ORG SESSION →"}
              </button>
            </div>
          ) : (
            <div style={{ display:"flex",flexDirection:"column",gap:"1.1rem" }}>
              {[
                { label:"ADMIN EMAIL",    val:loginEmail,    set:setLoginEmail,    type:"email",    ph:"your@company.com" },
                { label:"ADMIN PASSWORD", val:loginPassword, set:setLoginPassword, type:"password", ph:"••••••••" },
              ].map((f,i) => (
                <div key={i}>
                  <label style={labelStyle}>{f.label}</label>
                  <input type={f.type} value={f.val}
                    onChange={e=>{f.set(e.target.value);setLoginError("");}}
                    placeholder={f.ph}
                    onKeyDown={e=>e.key==="Enter"&&handleLogin()}
                    style={inputStyle(true,!!loginError)}/>
                </div>
              ))}
              <FieldError msg={loginError}/>
              {/* Forgot password link */}
              <div style={{ textAlign:"right", marginTop:"-0.4rem" }}>
                <a href="/forgot-password" style={{ fontSize:"0.75rem", color:C.s1, textDecoration:"none", fontWeight:600 }}>
                  Forgot password?
                </a>
              </div>
              <button onClick={handleLogin} disabled={loginLoading} className="btn-primary" style={{ width:"100%",padding:"0.9rem",fontSize:"0.82rem",borderRadius:11,border:"none",cursor:loginLoading?"default":"pointer",opacity:loginLoading?0.7:1 }}>
                {loginLoading ? "SIGNING IN..." : "ACCESS DASHBOARD →"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
