const SUPABASE_URL      = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function dbCreateOrg(orgData: {
  name: string;
  industry: string;
  adminEmail: string;
  adminPassword: string;
}) {
  const res = await fetch("/api/organizations", {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(orgData),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? "Failed to create org");
  return json;
}

export async function dbGetOrgByInvite(code: string) {
  const res = await fetch(
    `/api/organizations?invite_code=${encodeURIComponent(code)}`
  );
  if (!res.ok) return null;
  return res.json();
}

export async function dbLoginOrg(email: string, password: string) {
  const res = await fetch(
    `/api/organizations?admin_email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
  );
  if (res.status === 404) throw new Error("No organization found. Please create one first.");
  if (res.status === 401) throw new Error("Incorrect password. Please try again.");
  if (!res.ok) throw new Error("Login failed. Please try again.");
  return res.json();
}