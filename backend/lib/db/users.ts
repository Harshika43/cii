import { sb } from "@/lib/supabase/raw";
import type { UserInfo } from "@/types/user";

export async function dbUpsertUser(userInfo: UserInfo, authUserId?: string | null) {
  const payload: Record<string, unknown> = {
    email:        userInfo.email.toLowerCase().trim(),
    full_name:    userInfo.name.trim(),
    phone:        userInfo.phone.trim(),
    designation:  userInfo.designation,
    organization: userInfo.organization.trim(),
    address:      userInfo.address.trim(),
    updated_at:   new Date().toISOString(),
  };
  if (authUserId) payload.auth_user_id = authUserId;
  return await sb.upsert("cii_users", payload, "email");
}