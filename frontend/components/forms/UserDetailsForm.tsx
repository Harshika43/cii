"use client";
import { useState } from "react";
import { LiveBackground } from "@/components/ui/LiveBackground";
import { FieldError } from "@/components/ui/FieldError";
import { C } from "@/constants/theme";
import { DESIGNATIONS } from "@/constants/industries";
import { isValidEmail, isValidIndianPhone } from "@/lib/utils/validation";
import type { UserInfo } from "@/types/user";
import type { OrgContext } from "@/types/organization";

const labelStyle: React.CSSProperties = {
  fontSize:"0.62rem", fontWeight:700, letterSpacing:"0.2em",
  color:C.inkM, marginBottom:6, display:"block", textTransform:"uppercase",
};

function inputStyle(focused: boolean, hasError: boolean): React.CSSProperties {
  return {
    width:"100%",
    background: focused ? C.white : "rgba(255,255,255,0.85)",
    border:`1.5px solid ${hasError ? C.s2 : focused ? C.gold : C.inkXL}`,
    borderRadius:10, padding:"12px 14px", color:C.ink, fontSize:"0.9rem",
    lineHeight:1.5, transition:"all .2s",
    boxShadow: focused ? `0 0 0 3px ${C.gold}20, 0 2px 8px rgba(13,43,82,0.08)` : "0 1px 3px rgba(13,43,82,0.05)",
  };
}

interface Props {
  onSubmit: (info: UserInfo) => void;
  orgContext?: OrgContext | null;
  prefillEmail?: string;
}

export function UserDetailsForm({ onSubmit, orgContext, prefillEmail }: Props) {
  const [step, setStep]   = useState(0);
  const [saving, setSaving] = useState(false);
  const [consent, setConsent] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const [errors,  setErrors]  = useState<Record<string,string>>({});
  const [form, setForm] = useState<UserInfo>({
    name:"", email: prefillEmail || "", phone:"", designation:"",
    organization: orgContext?.org?.name || "", address:"",
  });
  const set = (k: keyof UserInfo, v: string) => {
    setForm(p => ({ ...p, [k]: v }));
    setErrors(p => ({ ...p, [k]: "" }));
  };

  const validateStep0 = () => {
    const e: Record<string,string> = {};
    if (!form.name.trim())          e.name  = "Name is required";
    if (!isValidEmail(form.email))  e.email = "Valid email required";
    if (!isValidIndianPhone(form.phone)) e.phone = "Enter a valid 10-digit Indian mobile";
    return e;
  };

  const validateStep1 = () => {
    const e: Record<string,string> = {};
    if (!form.designation)           e.designation   = "Please select a designation";
    if (!form.organization.trim())   e.organization  = "Organization is required";
    if (!form.address.trim())        e.address       = "Address is required";
    if (!consent)                    e.consent       = "Please provide consent to proceed";
    return e;
  };

  const handleNext = () => {
    const e = validateStep0();
    if (Object.keys(e).length) { setErrors(e); return; }
    setStep(1);
  };

  const handleSubmit = async () => {
    const e = validateStep1();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSaving(true);
    onSubmit(form);
    setSaving(false);
  };

  const IS = (k: string) => inputStyle(focused === k, !!errors[k]);

  return (
    <div style={{
      minHeight:"100dvh", width:"100vw", position:"relative",
      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
      padding:"3vh 20px", overflowY:"auto", overflowX:"hidden",
    }}>
      <LiveBackground/>
      <div style={{ maxWidth:"min(480px,92vw)", width:"100%", position:"relative", zIndex:1, paddingTop:"clamp(20px,4vh,40px)" }} className="fu">

        {/* Header */}
        <div style={{ textAlign:"center", marginBottom:"2vh" }}>
          <div style={{
            width:"3.2rem", height:"3.2rem", borderRadius:"50%",
            background:"linear-gradient(135deg,rgba(26,111,196,0.2),rgba(26,111,196,0.08))",
            border:`1.5px solid rgba(26,111,196,0.3)`,
            display:"flex", alignItems:"center", justifyContent:"center",
            margin:"0 auto 1rem", fontSize:"1.2rem",
          }}>✦</div>
          <div style={{
            display:"inline-flex",alignItems:"center",gap:6,
            background:"rgba(26,111,196,0.08)",border:"1px solid rgba(26,111,196,0.2)",
            borderRadius:20,padding:"4px 14px",marginBottom:"0.8rem",
          }}>
            <span style={{ fontSize:"0.58rem",fontWeight:700,letterSpacing:"0.2em",color:C.s1 }}>BEFORE WE BEGIN</span>
          </div>
          <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(1.4rem,3vw,2rem)", fontWeight:800, color:C.ink, marginBottom:"0.5rem" }}>
            {step === 0 ? "Tell us about yourself" : "Your professional context"}
          </h2>
        </div>

        {/* Step dots */}
        <div style={{ display:"flex", justifyContent:"center", gap:6, marginBottom:"1.8vh" }}>
          {[0,1].map(i => (
            <div key={i} style={{
              width:i===step?28:8, height:8, borderRadius:4,
              background:i<=step?"linear-gradient(to right,#1A6FC4,#4A9FE0)":C.inkXL,
              transition:"all .35s cubic-bezier(.22,1,.36,1)",
            }}/>
          ))}
        </div>

        <div className="glass-card" style={{ borderRadius:20, padding:"clamp(18px,3vh,28px)" }}>
          {step === 0 && (
            <div style={{ display:"flex", flexDirection:"column", gap:"1.1rem" }}>
              <div>
                <label style={labelStyle}>FULL NAME</label>
                <input value={form.name} onChange={e=>set("name",e.target.value)}
                  onFocus={()=>setFocused("name")} onBlur={()=>setFocused(null)}
                  placeholder="e.g. Arjun Sharma" style={IS("name")}/>
                <FieldError msg={errors.name}/>
              </div>
              <div>
                <label style={labelStyle}>EMAIL ADDRESS</label>
                <input type="email" value={form.email} onChange={e=>set("email",e.target.value)}
                  onFocus={()=>setFocused("email")} onBlur={()=>setFocused(null)}
                  placeholder="e.g. arjun@company.com" style={IS("email")}/>
                <FieldError msg={errors.email}/>
              </div>
              <div>
                <label style={labelStyle}>INDIAN MOBILE NUMBER</label>
                <div style={{ position:"relative" }}>
                  <span style={{ position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",fontSize:16,pointerEvents:"none" }}>🇮🇳</span>
                  <span style={{ position:"absolute",left:36,top:"50%",transform:"translateY(-50%)",fontSize:13,color:C.inkM,fontWeight:600,pointerEvents:"none",borderRight:`1.5px solid ${C.inkXL}`,paddingRight:8 }}>+91</span>
                  <input type="tel" value={form.phone} onChange={e=>set("phone",e.target.value.replace(/[^\d\s\-+()]/g,""))}
                    onFocus={()=>setFocused("phone")} onBlur={()=>setFocused(null)}
                    placeholder="98765 43210" maxLength={15}
                    style={{ ...IS("phone"), paddingLeft:"70px" }}/>
                </div>
                <FieldError msg={errors.phone}/>
              </div>
              <button onClick={handleNext} className="btn-primary"
                style={{ width:"100%",padding:"0.9rem",fontSize:"0.82rem",borderRadius:12,border:"none",cursor:"pointer" }}>
                CONTINUE →
              </button>
            </div>
          )}

          {step === 1 && (
            <div style={{ display:"flex", flexDirection:"column", gap:"1.1rem" }}>
              <div>
                <label style={labelStyle}>WORK DESIGNATION</label>
                <div style={{ position:"relative" }}>
                  <select value={form.designation} onChange={e=>set("designation",e.target.value)}
                    style={{ ...IS("designation"), appearance:"none", cursor:"pointer", color:form.designation?C.ink:C.inkXL, paddingRight:36 }}>
                    <option value="" disabled>Select your level</option>
                    {DESIGNATIONS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <div style={{ position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",pointerEvents:"none",color:C.gold,fontSize:12 }}>▾</div>
                </div>
                <FieldError msg={errors.designation}/>
              </div>
              <div>
                <label style={labelStyle}>ORGANIZATION / COMPANY</label>
                <input value={form.organization} onChange={e=>set("organization",e.target.value)}
                  onFocus={()=>setFocused("organization")} onBlur={()=>setFocused(null)}
                  placeholder="e.g. Infopace, Razorpay..."
                  style={IS("organization")} readOnly={!!orgContext}/>
                <FieldError msg={errors.organization}/>
              </div>
              <div>
                <label style={labelStyle}>ADDRESS</label>
                <textarea value={form.address} onChange={e=>set("address",e.target.value)}
                  onFocus={()=>setFocused("address")} onBlur={()=>setFocused(null)}
                  placeholder="e.g. 12, MG Road, Bengaluru, Karnataka 560001" rows={3}
                  style={{ ...IS("address"), resize:"none", lineHeight:1.6 }}/>
                <FieldError msg={errors.address}/>
              </div>
              {/* Consent */}
              <div>
                <label style={labelStyle}>DATA CONSENT</label>
                <div
                  onClick={() => { setConsent(v=>!v); setErrors(p=>({...p,consent:""})); }}
                  style={{
                    display:"flex", alignItems:"flex-start", gap:10,
                    background:"rgba(26,111,196,0.06)", border:`1.5px solid ${consent?"rgba(26,111,196,0.5)":"rgba(26,111,196,0.2)"}`,
                    borderRadius:10, padding:"12px 14px", cursor:"pointer",
                  }}>
                  <div style={{
                    flexShrink:0, width:20, height:20, borderRadius:5,
                    border:`2px solid ${consent?"#1A6FC4":"rgba(26,111,196,0.4)"}`,
                    background:consent?"#1A6FC4":"#fff",
                    display:"flex", alignItems:"center", justifyContent:"center",
                  }}>
                    {consent && <svg width="12" height="9" viewBox="0 0 12 9" fill="none">
                      <path d="M1.5 4.5L4.5 7.5L10.5 1.5" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                    </svg>}
                  </div>
                  <p style={{ fontSize:"0.75rem", color:C.inkM, lineHeight:1.7, margin:0 }}>
                    I consent to providing my details for this assessment.{" "}
                    <span style={{ color:C.s1, fontWeight:600 }}>Details will not be shared with third parties.</span>
                  </p>
                </div>
                <FieldError msg={errors.consent}/>
              </div>
              <div style={{ display:"flex", gap:10, marginTop:4 }}>
                <button onClick={() => setStep(0)} style={{
                  background:"rgba(13,43,82,0.06)", border:`1.5px solid rgba(26,111,196,0.2)`,
                  borderRadius:11, padding:"0.85rem 1.2rem", color:C.inkM,
                  fontSize:"0.82rem", fontWeight:600, cursor:"pointer",
                }}>← Back</button>
                <button onClick={handleSubmit} disabled={saving} className={consent?"btn-primary":""} style={{
                  flex:1, background:!consent?"rgba(26,111,196,0.25)":undefined,
                  color:"#fff", border:"none", borderRadius:11, padding:"0.85rem",
                  fontSize:"0.82rem", fontWeight:700, cursor:consent?"pointer":"not-allowed",
                  opacity:saving?0.7:1,
                }}>
                  {saving ? "SAVING..." : "START ASSESSMENT →"}
                </button>
              </div>
            </div>
          )}
        </div>
        <p style={{ textAlign:"center", fontSize:"0.6rem", color:C.inkL, marginTop:14, letterSpacing:"0.12em" }}>
          STEP {step+1} OF 2 · {step===0?"PERSONAL INFO":"PROFESSIONAL CONTEXT"}
        </p>
      </div>
    </div>
  );
}
