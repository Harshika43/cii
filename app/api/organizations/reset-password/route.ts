import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

// POST — request password reset (send email)
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

    const supabase = await createClient();

    // Check org exists
    const { data: org } = await supabase
      .from("cii_organizations")
      .select("id, name, admin_email")
      .eq("admin_email", email.toLowerCase().trim())
      .single();

    if (!org) {
      return NextResponse.json({ ok: true }); // Don't reveal if email exists
    }

    // Generate reset token
    const token = crypto.randomUUID();
    const expires = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

    // Save token to DB
    await supabase
      .from("cii_organizations")
      .update({ reset_token: token, reset_token_expires_at: expires })
      .eq("id", org.id);

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const resetLink = `${siteUrl}/reset-org-password?token=${token}&email=${encodeURIComponent(email)}`;

    // Send email
    await transporter.sendMail({
      from: `"CII Platform" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Reset your CII Admin Password",
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;background:#f8f5f0;">
          <div style="background:linear-gradient(135deg,#0D2B52,#1A6FC4);padding:24px;border-radius:12px;text-align:center;margin-bottom:24px;">
            <h1 style="color:#fff;font-size:22px;margin:0;font-family:Georgia,serif;">Creative Innovation Index</h1>
          </div>
          <h2 style="color:#0A1628;font-size:20px;">Reset your password</h2>
          <p style="color:#2D4A6E;line-height:1.7;font-size:15px;">
            We received a request to reset the admin password for <strong>${org.name}</strong>.
            Click the button below to set a new password.
          </p>
          <a href="${resetLink}" style="display:block;background:linear-gradient(135deg,#1A6FC4,#0D2B52);color:#fff;text-align:center;padding:14px;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px;margin:24px 0;">
            Reset Password →
          </a>
          <p style="color:#6b8aaa;font-size:12px;line-height:1.6;">
            This link expires in 1 hour. If you didn't request this, ignore this email.
          </p>
          <p style="color:#6b8aaa;font-size:11px;text-align:center;margin-top:20px;">Creative Innovation Index · Infopace</p>
        </div>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[reset-password POST]", err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

// PATCH — update password with token
export async function PATCH(req: NextRequest) {
  try {
    const { token, email, newPassword } = await req.json();
    if (!token || !email || !newPassword) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const supabase = await createClient();

    // Verify token
    const { data: org } = await supabase
      .from("cii_organizations")
      .select("id, reset_token, reset_token_expires_at")
      .eq("admin_email", email.toLowerCase())
      .eq("reset_token", token)
      .single();

    if (!org) {
      return NextResponse.json({ error: "Invalid or expired reset link" }, { status: 400 });
    }

    // Check expiry
    if (new Date(org.reset_token_expires_at) < new Date()) {
      return NextResponse.json({ error: "Reset link has expired. Please request a new one." }, { status: 400 });
    }

    // Update password and clear token
    const { error } = await supabase
      .from("cii_organizations")
      .update({
        admin_password: newPassword,
        reset_token: null,
        reset_token_expires_at: null,
      })
      .eq("id", org.id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}