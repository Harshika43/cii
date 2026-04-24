"use client";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email,     setEmail]     = useState("");
  const [loading,   setLoading]   = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error,     setError]     = useState("");

  const handleSubmit = async () => {
    if (!email.trim()) { setError("Email is required"); return; }
    setLoading(true); setError("");
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || '';
      const res = await fetch(`${backendUrl}/api/organizations/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setSubmitted(true);
    } catch (err: any) {
      setError(err?.message || "Something went wrong");
    }
    setLoading(false);
  };

  if (submitted) return (
    <div style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", background: "#edeae4", padding: 24 }}>
      <div style={{ maxWidth: 400, width: "100%", background: "#fff", borderRadius: 16, padding: 32, boxShadow: "0 4px 24px rgba(13,43,82,0.1)", textAlign: "center" }}>
        <div style={{ fontSize: "3rem", marginBottom: 16 }}>📧</div>
        <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.6rem", fontWeight: 800, color: "#0A1628", marginBottom: 8 }}>Check your email</h2>
        <p style={{ fontSize: "0.8rem", color: "#6b8aaa", lineHeight: 1.7, marginBottom: 24 }}>
          If an account exists for <strong>{email}</strong>, you'll receive a reset link shortly.
        </p>
        <a href="/" style={{ fontSize: "0.75rem", color: "#1A6FC4", textDecoration: "none", fontWeight: 600 }}>← Back to login</a>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", background: "#edeae4", padding: 24 }}>
      <div style={{ maxWidth: 400, width: "100%", background: "#fff", borderRadius: 16, padding: 32, boxShadow: "0 4px 24px rgba(13,43,82,0.1)" }}>
        <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.6rem", fontWeight: 800, color: "#0A1628", marginBottom: 6 }}>Forgot Password</h2>
        <p style={{ fontSize: "0.8rem", color: "#6b8aaa", lineHeight: 1.6, marginBottom: 24 }}>
          Enter your admin email and we'll send you a reset link.
        </p>

        <label style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.2em", color: "#2D4A6E", marginBottom: 6, display: "block", textTransform: "uppercase" }}>Admin Email</label>
        <input
          type="email"
          value={email}
          onChange={e => { setEmail(e.target.value); setError(""); }}
          onKeyDown={e => e.key === "Enter" && handleSubmit()}
          placeholder="admin@company.com"
          style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1.5px solid #c2d4e8", marginBottom: 16, fontSize: "0.9rem", color: "#0A1628", outline: "none", boxSizing: "border-box" }}
        />

        {error && (
          <div style={{ background: "rgba(232,22,43,0.06)", border: "1px solid rgba(232,22,43,0.2)", borderRadius: 8, padding: "10px 14px", fontSize: "0.72rem", color: "#E8162B", marginBottom: 16 }}>
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{ width: "100%", padding: "12px", background: "linear-gradient(135deg,#1A6FC4,#0D2B52)", color: "#fff", border: "none", borderRadius: 10, fontSize: "0.88rem", fontWeight: 700, cursor: loading ? "default" : "pointer", opacity: loading ? 0.7 : 1 }}
        >
          {loading ? "Sending…" : "Send Reset Link →"}
        </button>

        <a href="/" style={{ display: "block", textAlign: "center", marginTop: 16, fontSize: "0.75rem", color: "#1A6FC4", textDecoration: "none", fontWeight: 600 }}>← Back to login</a>
      </div>
    </div>
  );
}