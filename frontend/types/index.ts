export type UserRole = "user" | "admin";
export type ApplicationStatus = "saved" | "applied" | "interview" | "offer" | "rejected";
export type ProcessingStatus = "pending" | "processing" | "completed" | "failed";

export interface User {
  id: number;
  email: string;
  username: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

export interface Resume {
  id: number;
  user_id: number;
  filename: string;
  is_primary: boolean;
  created_at: string;
  content_text?: string;
}

export interface Application {
  id: number;
  user_id: number;
  company_name: string;
  job_title: string;
  job_url?: string;
  status: ApplicationStatus;
  applied_date?: string;
  notes?: string;
  resume_id?: number;
  created_at: string;
  updated_at: string;
  job_description?: string;
}

export interface AIResult {
  id: number;
  application_id: number;
  processing_status: ProcessingStatus;
  match_score?: number;
  jd_analysis?: {
    required_skills: string[];
    nice_to_have_skills: string[];
    seniority_level: string;
    employment_type: string;
    company_culture: string[];
    key_responsibilities: string[];
    summary: string;
  };
  match_breakdown?: {
    match_score: number;
    matched_skills: string[];
    missing_required_skills: string[];
    missing_nice_to_have: string[];
    strengths: string[];
    score_explanation: string;
  };
  skill_gaps?: {
    gaps: {
      skill: string;
      importance: string;
      learning_resource: string;
      estimated_time: string;
    }[];
  };
  cover_letter?: string;
  created_at: string;
  updated_at: string;
}

export interface AnalyticsSummary {
  total_applications: number;
  by_status: { status: string; count: number }[];
  average_match_score: number;
  total_ai_analyses: number;
}

export interface AdminUser {
  id: number;
  email: string;
  username: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  total_applications: number;
}

export interface AdminStats {
  total_users: number;
  active_users: number;
  total_applications: number;
  total_ai_analyses: number;
}

export interface AdminLog {
  id: number;
  admin_id: number;
  action: string;
  target_user_id?: number;
  metadata_?: Record<string, any>;
  created_at: string;
}