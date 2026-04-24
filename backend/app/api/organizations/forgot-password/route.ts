import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { transporter } from "@/lib/utils/mailer";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: "Email is required" }, { status: 400 });

    const supabase = await createClient();

    const { data: org, error } = await supabase
      .from("cii_organizations")
      .select("id, name, admin_email")
      .eq("admin_email", email.toLowerCase().trim())
      .single();

    // Always return success even if email not found (security best practice)
    if (error || !org) return NextResponse.json({ success: true });

    // Generate token + 1 hour expiry
    const token   = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 1000 * 60 * 60).toISOString();

   const siteUrl = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "");
    const resetUrl = `${siteUrl}/reset-password?token=${token}`;
    
    await transporter.sendMail({
      from: `"Admin Portal" <${process.env.SMTP_EMAIL}>`,
      to: org.admin_email,
      subject: "Reset your admin password",
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
          <h2 style="color:#0D2B52">Password Reset Request</h2>
          <p>Hi <strong>${org.name}</strong> Admin,</p>
          <p>You requested a password reset. Click the button below — it expires in <strong>1 hour</strong>.</p>
          <a href="${resetUrl}" style="
            display:inline-block;margin:16px 0;padding:12px 28px;
            background:#2563eb;color:white;border-radius:8px;
            text-decoration:none;font-weight:bold;font-size:15px;
          ">Reset Password</a>
          <p style="color:#888;font-size:13px">If you didn't request this, ignore this email.</p>
          <p style="color:#bbb;font-size:11px">Link: ${resetUrl}</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
