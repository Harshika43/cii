"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function ResetOrgPasswordForm() {
  const searchParams  = useSearchParams();
  const token         = searchParams.get("token") || "";
  const email         = searchParams.get("email") || "";
  const [password,    setPassword]  = useState("");
  const [password2,   setPassword2] = useState("");
  const [message,     setMessage]   = useState("");
  const [loading,     setLoading]   = useState(false);
  const [success,     setSuccess]   = useState(false);

  const handleUpdate = async () => {
    if (password !== password2) { setMessage("Passwords do not match"); return; }
    if (password.length < 6)    { setMessage("Min. 6 characters"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/organizations/reset-password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, email, newPassword: password }),
      });
      const json = await res.json();
      if (!res.ok) { setMessage(json.error || "Failed to reset password"); return; }
      setSuccess(true);
    } catch {
      setMessage("Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  if (!token || !email) return (
    <div style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", background: "#edeae4", padding: 24 }}>
      <div style={{ maxWidth: 400, width: "100%", background: "#fff", borderRadius: 16, padding: 32, textAlign: "center" }}>
        <div style={{ fontSize: "2rem", marginBottom: 16 }}>⚠️</div>
        <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.4rem", fontWeight: 800, color: "#0A1628" }}>Invalid Reset Link</h2>
        <p style={{ fontSize: "0.8rem", color: "#6b8aaa", marginTop: 8 }}>This link is invalid or has expired.</p>
        <a href="/" style={{ display: "block", marginTop: 20, fontSize: "0.75rem", color: "#1A6FC4", textDecoration: "none", fontWeight: 600 }}>← Back to login</a>
      </div>
    </div>
  );

  if (success) return (
    <div style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", background: "#edeae4", padding: 24 }}>
      <div style={{ maxWidth: 400, width: "100%", background: "#fff", borderRadius: 16, padding: 32, textAlign: "center" }}>
        <div style={{ fontSize: "2rem", marginBottom: 16 }}>✅</div>
        <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.4rem", fontWeight: 800, color: "#0A1628" }}>Password Updated!</h2>
        <p style={{ fontSize: "0.8rem", color: "#6b8aaa", marginTop: 8, lineHeight: 1.6 }}>Your password has been reset. You can now sign in with your new password.</p>
        <a href="/" style={{ display: "block", marginTop: 20, background: "linear-gradient(135deg,#1A6FC4,#0D2B52)", color: "#fff", padding: "12px", borderRadius: 10, textDecoration: "none", fontWeight: 700, fontSize: "0.88rem" }}>← Back to Login</a>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", background: "#edeae4", padding: 24 }}>
      <div style={{ maxWidth: 400, width: "100%", background: "#fff", borderRadius: 16, padding: 32, boxShadow: "0 4px 24px rgba(13,43,82,0.1)" }}>
        <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.6rem", fontWeight: 800, color: "#0A1628", marginBottom: 6 }}>Reset Password</h2>
        <p style={{ fontSize: "0.8rem", color: "#6b8aaa", lineHeight: 1.6, marginBottom: 24 }}>Enter your new admin password below.</p>

        <label style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.2em", color: "#2D4A6E", marginBottom: 6, display: "block", textTransform: "uppercase" }}>New Password</label>
        <input
          type="password"
          value={password}
          onChange={e => { setPassword(e.target.value); setMessage(""); }}
          placeholder="Min. 6 characters"
          style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1.5px solid #c2d4e8", marginBottom: 12, fontSize: "0.9rem", boxSizing: "border-box" }}
        />

        <label style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.2em", color: "#2D4A6E", marginBottom: 6, display: "block", textTransform: "uppercase" }}>Confirm Password</label>
        <input
          type="password"
          value={password2}
          onChange={e => { setPassword2(e.target.value); setMessage(""); }}
          placeholder="Repeat password"
          onKeyDown={e => e.key === "Enter" && handleUpdate()}
          style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1.5px solid #c2d4e8", marginBottom: 16, fontSize: "0.9rem", boxSizing: "border-box" }}
        />

        {message && (
          <div style={{ background: "rgba(232,22,43,0.06)", border: "1px solid rgba(232,22,43,0.2)", borderRadius: 8, padding: "10px 14px", fontSize: "0.72rem", color: "#E8162B", marginBottom: 16 }}>
            {message}
          </div>
        )}

        <button
          onClick={handleUpdate}
          disabled={loading}
          style={{ width: "100%", padding: "12px", background: "linear-gradient(135deg,#1A6FC4,#0D2B52)", color: "#fff", border: "none", borderRadius: 10, fontSize: "0.88rem", fontWeight: 700, cursor: loading ? "default" : "pointer", opacity: loading ? 0.7 : 1 }}
        >
          {loading ? "Updating…" : "Update Password →"}
        </button>

        <a href="/" style={{ display: "block", textAlign: "center", marginTop: 16, fontSize: "0.75rem", color: "#1A6FC4", textDecoration: "none", fontWeight: 600 }}>← Back to login</a>
      </div>
    </div>
  );
}

export default function ResetOrgPasswordPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", background: "#edeae4" }}>Loading…</div>}>
      <ResetOrgPasswordForm />
    </Suspense>
  );
}