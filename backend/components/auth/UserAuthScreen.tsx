"use client";
import { useState } from "react";
import { LiveBackground } from "@/components/ui/LiveBackground";
import { FieldError }     from "@/components/ui/FieldError";
import { C }              from "@/constants/theme";
import { createClient }   from "@/lib/supabase/client";
import { isValidEmail }   from "@/lib/utils/validation";

const labelStyle: React.CSSProperties = {
  fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.2em",
  color: C.inkM, marginBottom: 6, display: "block", textTransform: "uppercase",
};

function inputStyle(focused: boolean, err: boolean): React.CSSProperties {
  return {
    width: "100%", background: focused ? C.white : "rgba(255,255,255,0.85)",
    border: `1.5px solid ${err ? C.s2 : focused ? C.s1 : C.inkXL}`,
    borderRadius: 10, padding: "12px 14px", color: C.ink, fontSize: "0.9rem",
    lineHeight: 1.5, transition: "all .2s",
    boxShadow: focused ? `0 0 0 3px ${C.s1}20` : "0 1px 3px rgba(13,43,82,0.05)",
  };
}

interface Props {
  mode:       "individual" | "employee";
  onNewUser:  (authUserId: string, email: string) => void; // new user → go fill details
  onReturning:(authUserId: string, email: string) => void; // existing → go to history
  onBack:     () => void;
}

export function UserAuthScreen({ mode, onNewUser, onReturning, onBack }: Props) {
  const [tab,      setTab]      = useState<"signin" | "signup">("signup");
  const [focused,  setFocused]  = useState<string | null>(null);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [errors,   setErrors]   = useState<Record<string, string>>({});

  const [email,     setEmail]     = useState("");
  const [password,  setPassword]  = useState("");
  const [password2, setPassword2] = useState("");

  const supabase = createClient();

  const modeLabel = mode === "individual" ? "Individual" : "Employee";
  const modeIcon  = mode === "individual" ? "🧠" : "🔗";

  const validate = () => {
    const e: Record<string, string> = {};
    if (!isValidEmail(email))   e.email    = "Valid email required";
    if (password.length < 6)    e.password = "Min. 6 characters";
    if (tab === "signup" && password !== password2) e.password2 = "Passwords do not match";
    return e;
  };

  const handleSignUp = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true); setError("");
    try {
      const { data, error: err } = await supabase.auth.signUp({ email, password });
      if (err) throw err;
      if (data.user) onNewUser(data.user.id, email);
    } catch (err: any) {
      const msg = err?.message || "";
      if (msg.includes("already registered")) {
        setError("This email is already registered. Please sign in instead.");
      } else {
        setError(msg || "Signup failed. Please try again.");
      }
    }
    setLoading(false);
  };

  const handleSignIn = async () => {
    const e: Record<string, string> = {};
    if (!isValidEmail(email))  e.email    = "Valid email required";
    if (!password)             e.password = "Password required";
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true); setError("");
    try {
      const { data, error: err } = await supabase.auth.signInWithPassword({ email, password });
      if (err) throw err;
      if (data.user) onReturning(data.user.id, email);
    } catch (err: any) {
      const msg = err?.message || "";
      if (msg.includes("Invalid login")) {
        setError("Incorrect email or password.");
      } else {
        setError(msg || "Sign in failed. Please try again.");
      }
    }
    setLoading(false);
  };

  const handleSubmit = () => tab === "signup" ? handleSignUp() : handleSignIn();

  return (
    <div style={{
      minHeight: "100dvh", width: "100vw", position: "relative",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: "4vh 20px", overflow: "hidden",
    }}>
      <LiveBackground />
      <div style={{ maxWidth: "min(440px,92vw)", width: "100%", position: "relative", zIndex: 1 }} className="fu">

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "2vh" }}>
          <button onClick={onBack} style={{ background: "rgba(13,43,82,0.07)", border: "1px solid rgba(26,111,196,0.2)", borderRadius: 8, color: C.inkM, fontSize: "0.75rem", cursor: "pointer", marginBottom: "1rem", padding: "6px 14px", fontWeight: 600 }}>← Back</button>
          <div style={{ fontSize: "2rem", marginBottom: 8 }}>{modeIcon}</div>
          <div style={{ fontSize: "0.58rem", letterSpacing: "0.32em", color: C.s1, fontWeight: 700, marginBottom: 6 }}>{modeLabel.toUpperCase()} PORTAL</div>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(1.4rem,4vw,1.9rem)", fontWeight: 800, color: C.ink, lineHeight: 1.1 }}>
            {tab === "signup" ? "Create your account" : "Welcome back"}
          </h2>
          <p style={{ fontSize: "0.75rem", color: C.inkM, marginTop: 6, lineHeight: 1.6 }}>
            {tab === "signup"
              ? "Create an account to take the assessment and view your results anytime."
              : "Sign in to view your results and history."}
          </p>
        </div>

        {/* Tab toggle */}
        <div style={{ display: "flex", background: "rgba(13,43,82,0.06)", borderRadius: 12, padding: 4, marginBottom: "1.4rem" }}>
          {(["signup", "signin"] as const).map(t => (
            <button key={t} onClick={() => { setTab(t); setError(""); setErrors({}); }}
              style={{ flex: 1, padding: "9px", borderRadius: 9, border: "none", fontSize: "0.72rem", fontWeight: 700, cursor: "pointer", transition: "all .2s", background: tab === t ? C.white : "transparent", color: tab === t ? C.navy : C.inkM, boxShadow: tab === t ? "0 1px 8px rgba(13,43,82,0.12)" : "none" }}>
              {t === "signup" ? "Create Account" : "Sign In"}
            </button>
          ))}
        </div>

        <div className="glass-card" style={{ borderRadius: 20, padding: "clamp(1.2rem,4vw,1.8rem)", display: "flex", flexDirection: "column", gap: 14 }}>

          {/* Email */}
          <div>
            <label style={labelStyle}>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: "" })); setError(""); }}
              onFocus={() => setFocused("email")}
              onBlur={() => setFocused(null)}
              placeholder="you@example.com"
              style={inputStyle(focused === "email", !!errors.email)}
            />
            <FieldError msg={errors.email} />
          </div>

          {/* Password */}
          <div>
            <label style={labelStyle}>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: "" })); setError(""); }}
              onFocus={() => setFocused("password")}
              onBlur={() => setFocused(null)}
              placeholder="Min. 6 characters"
              onKeyDown={e => e.key === "Enter" && !password2 && handleSubmit()}
              style={inputStyle(focused === "password", !!errors.password)}
            />
            <FieldError msg={errors.password} />
          </div>

          {/* Confirm password (signup only) */}
          {tab === "signup" && (
            <div>
              <label style={labelStyle}>Confirm Password</label>
              <input
                type="password"
                value={password2}
                onChange={e => { setPassword2(e.target.value); setErrors(p => ({ ...p, password2: "" })); }}
                onFocus={() => setFocused("password2")}
                onBlur={() => setFocused(null)}
                placeholder="Repeat password"
                onKeyDown={e => e.key === "Enter" && handleSubmit()}
                style={inputStyle(focused === "password2", !!errors.password2)}
              />
              <FieldError msg={errors.password2} />
            </div>
          )}

          {/* Global error */}
          {error && (
            <div style={{ background: "rgba(232,22,43,0.06)", border: "1px solid rgba(232,22,43,0.2)", borderRadius: 8, padding: "10px 14px", fontSize: "0.72rem", color: C.s2, lineHeight: 1.5 }}>
              {error}
            </div>
          )}

          {tab === "signin" && (
            <div style={{ textAlign: "right", marginTop: "-4px" }}>
              <a href="/forgot-password" style={{ fontSize: "0.75rem", color: C.s1, textDecoration: "none", fontWeight: 600 }}>
                Forgot password?
              </a>
            </div>
          )}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="btn-primary"
            style={{ width: "100%", padding: "1rem", borderRadius: 12, border: "none", fontSize: "0.88rem", fontWeight: 700, cursor: loading ? "default" : "pointer", opacity: loading ? 0.7 : 1, marginTop: 2 }}
          >
            {loading
              ? (tab === "signup" ? "Creating Account…" : "Signing In…")
              : (tab === "signup" ? "Create Account →" : "Sign In →")}
          </button>

        </div>

        <p style={{ textAlign: "center", fontSize: "0.6rem", color: C.inkL, marginTop: 14, lineHeight: 1.6 }}>
          Your account is secured · Passwords are encrypted
        </p>
      </div>
    </div>
  );
}