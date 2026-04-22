import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await req.json();
    const { name, industry, adminEmail, adminPassword } = body;

    if (!name || !industry || !adminEmail || !adminPassword) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check if email already exists
    const { data: existing } = await supabase
      .from("cii_organizations")
      .select("id")
      .eq("admin_email", adminEmail.toLowerCase().trim())
      .single();

    if (existing) {
      return NextResponse.json({ error: "This email is already registered. Please sign in instead." }, { status: 409 });
    }

    const inviteCode = Math.random().toString(36).slice(2, 8).toUpperCase();

    const { data, error } = await supabase
      .from("cii_organizations")
      .insert({
        name:           name.trim(),
        industry,
        admin_email:    adminEmail.toLowerCase().trim(),
        admin_password: adminPassword,
        invite_code:    inviteCode,
        created_at:     new Date().toISOString(),
      })
      .select("id, name, industry, invite_code, admin_email, created_at")
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(req.url);
    const invite   = searchParams.get("invite_code");
    const email    = searchParams.get("admin_email");
    const password = searchParams.get("password");

    if (invite) {
      const { data, error } = await supabase
        .from("cii_organizations")
        .select("id, name, industry, invite_code, created_at")
        .eq("invite_code", invite.toUpperCase())
        .single();
      if (error) return NextResponse.json(null);
      return NextResponse.json(data);
    }

    if (email && password) {
      const { data, error } = await supabase
        .from("cii_organizations")
        .select("*")
        .eq("admin_email", email.toLowerCase())
        .single();
      if (error || !data) {
        return NextResponse.json({ error: "No organization found with this email" }, { status: 404 });
      }
      if (data.admin_password !== password) {
        return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
      }
      const { admin_password: _, ...safeOrg } = data;
      return NextResponse.json(safeOrg);
    }

    if (email) {
      const { data, error } = await supabase
        .from("cii_organizations")
        .select("id, name, industry, invite_code, created_at")
        .eq("admin_email", email.toLowerCase())
        .single();
      if (error) return NextResponse.json(null);
      return NextResponse.json(data);
    }

    return NextResponse.json({ error: "Missing query param" }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}