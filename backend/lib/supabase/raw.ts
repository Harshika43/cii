/**
 * Raw Supabase REST API helper (for client-side use without SSR cookies)
 * Matches the original sb helper in index.js
 */
const SUPABASE_URL      = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const BASE_HEADERS = {
  "Content-Type": "application/json",
  "apikey": SUPABASE_ANON_KEY,
  "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
};

async function sbRequest(method: string, path: string, body?: unknown, extraHeaders: Record<string, string> = {}) {
  const url = `${SUPABASE_URL}${path}`;
  const opts: RequestInit = { method, headers: { ...BASE_HEADERS, ...extraHeaders } };
  if (body !== null && body !== undefined) opts.body = JSON.stringify(body);
  const res = await fetch(url, opts);
  const text = await res.text();
  let json: unknown = null;
  try { json = JSON.parse(text); } catch { json = text; }
  if (!res.ok) {
    console.error(`[Supabase ${method} ${path}] HTTP ${res.status}:`, json);
    return { data: null, error: json };
  }
  return { data: json as unknown, error: null };
}

export const sb = {
  async insert(table: string, payload: unknown) {
    const isArray = Array.isArray(payload);
    const { data, error } = await sbRequest("POST", `/rest/v1/${table}`, payload, { "Prefer": "return=representation" });
    if (error) throw new Error(typeof error === "string" ? error : JSON.stringify(error));
    if (isArray) return data as unknown[];
    return Array.isArray(data) ? (data as unknown[])[0] : data;
  },

  async upsert(table: string, payload: unknown, onConflict = "id") {
    const { data, error } = await sbRequest(
      "POST",
      `/rest/v1/${table}?on_conflict=${onConflict}`,
      payload,
      { "Prefer": "resolution=merge-duplicates,return=representation" }
    );
    if (error) throw new Error(typeof error === "string" ? error : JSON.stringify(error));
    return Array.isArray(data) ? (data as unknown[])[0] : data;
  },

  async patch(table: string, filter: string, payload: unknown) {
    const { data, error } = await sbRequest("PATCH", `/rest/v1/${table}?${filter}`, payload, { "Prefer": "return=minimal" });
    if (error) throw new Error(typeof error === "string" ? error : JSON.stringify(error));
    return data;
  },

  async select(table: string, filter = "") {
    const { data, error } = await sbRequest("GET", `/rest/v1/${table}${filter ? `?${filter}` : ""}`, undefined);
    if (error) throw new Error(typeof error === "string" ? error : JSON.stringify(error));
    return data as unknown[];
  },

  async uploadFile(bucket: string, path: string, blob: Blob, contentType = "image/png") {
    const url = `${SUPABASE_URL}/storage/v1/object/${bucket}/${path}`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": contentType,
        "x-upsert": "true",
      },
      body: blob,
    });
    const text = await res.text();
    if (!res.ok) { console.error("[Supabase Storage upload] Error:", text); throw new Error(text); }
    return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;
  },
};
