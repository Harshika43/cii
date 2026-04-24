export interface ResultRow {
  id?: string;
  session_id: string;
  user_id: string;
  org_id?: string | null;
  department?: string | null;
  employee_name?: string | null;
  employee_designation?: string | null;
  cii_score: number;
  profile_name: string;
  profile_tag: string;
  dim_divergent: number;
  dim_assoc: number;
  dim_risk: number;
  dim_vision: number;
  dim_behavior: number;
  dim_innovation: number;
  ai_narrative?: string | null;
  ai_key_insight?: string | null;
  ai_strengths?: string | null;
  ai_blind_spots?: string | null;
  ai_persona_type?: string | null;
  ai_improvements?: string | null;
  completed_at: string;
}
