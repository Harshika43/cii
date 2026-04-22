import { sb } from "@/lib/supabase/raw";

const SUPABASE_URL      = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function dbSaveDashboardExport(
  sessionId: string,
  userId: string,
  canvas: HTMLCanvasElement,
  userName = "unknown"
) {
  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(b => (b ? resolve(b) : reject(new Error("toBlob returned null"))), "image/png")
  );
  const cleanName = (userName || "unknown").trim().toLowerCase().replace(/[^a-z0-9]/g, "_");
  const filename  = `dashboard_${cleanName}_${new Date().toISOString().slice(0, 10)}.png`;
  const uploadRes = await fetch(`${SUPABASE_URL}/storage/v1/object/cii-exports/${filename}`, {
    method: "POST",
    headers: {
      "apikey": SUPABASE_ANON_KEY,
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": "image/png",
      "x-upsert": "true",
    },
    body: blob,
  });
  if (!uploadRes.ok) throw new Error(`Storage upload failed (${uploadRes.status})`);
  const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/cii-exports/${filename}`;
  try {
    await sb.insert("cii_dashboard_exports", {
      session_id:  sessionId,
      user_id:     userId,
      file_url:    publicUrl,
      exported_at: new Date().toISOString(),
    });
  } catch (e: unknown) {
    console.warn("[Dashboard] Export record insert failed:", (e as Error).message);
  }
  return publicUrl;
}
