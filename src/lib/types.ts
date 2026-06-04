export type Language = "id" | "en";

export type ProjectCategory =
  | "Web App"
  | "Mobile App"
  | "Data Visualization"
  | "Creativity";

export interface Project {
  id: string;
  title_id: string;
  title_en: string;
  slug: string;
  category: ProjectCategory;
  thumbnail: string | null;
  gallery: string[];
  description_id: string;
  description_en: string;
  content_id: string;
  content_en: string;
  attachment: string | null;
  live_demo_url: string | null;
  featured: boolean;
  published: boolean;
  tools: string[];
  created_at: string;
  updated_at: string;
}

export interface Certificate {
  id: string;
  title_id: string;
  title_en: string;
  issuer: string;
  description_id: string;
  description_en: string;
  issue_date: string;
  thumbnail: string | null;
  pdf: string | null;
  created_at: string;
  updated_at: string;
}

export interface Blog {
  id: string;
  title_id: string;
  title_en: string;
  slug: string;
  content_id: string;
  content_en: string;
  description_id: string;
  description_en: string;
  thumbnail: string | null;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface Media {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  bucket: string;
  path: string;
  created_at: string;
}

export interface SiteSettings {
  id: string;
  website_name: string;
  tagline_id: string;
  tagline_en: string;
  hero_name: string;
  hero_headline_id: string;
  hero_headline_en: string;
  hero_motto_id: string;
  hero_motto_en: string;
  hero_description_id: string;
  hero_description_en: string;
  hero_cta_text_id: string;
  hero_cta_text_en: string;
  hero_cta_link: string;
  logo: string | null;
  favicon: string | null;
  footer_text_id: string;
  footer_text_en: string;
  avatar: string | null;
  social_github: string;
  social_linkedin: string;
  social_instagram: string;
  social_twitter: string;
  social_email: string;
  calendar_link: string;
  stats_projects: number;
  stats_certificates: number;
  stats_monthly_visitors: number;
  stats_total_visitors: number;
  updated_at: string;
}

export interface VisitorAnalytics {
  id: string;
  visitor_id: string;
  page: string;
  referrer: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface ProjectView {
  id: string;
  project_id: string;
  visitor_id: string;
  created_at: string;
}

export interface BlogView {
  id: string;
  blog_id: string;
  visitor_id: string;
  created_at: string;
}

export interface AdminUser {
  id: string;
  email: string;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

// ─── About CMS Types ──────────────────────────────────────────────────────────
export interface AboutEducation {
  id: string;
  university_name: string;
  faculty: string;
  major: string;
  degree: string;
  year_start: string;
  year_end: string;
  gpa: string | null;
  field_of_study: string | null;
  thesis_title: string | null;
  thesis_goal: string | null;
  logo: string | null;
  description_id: string;
  description_en: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface AboutExperience {
  id: string;
  company: string;
  role_id: string;
  role_en: string;
  timeframe: string;
  description_id: string;
  description_en: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface AboutSkill {
  id: string;
  title_id: string;
  title_en: string;
  description_id: string;
  description_en: string;
  icon: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface AboutOrganization {
  id: string;
  name: string;
  role_id: string;
  role_en: string;
  year: string;
  description_id: string;
  description_en: string;
  logo: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}
