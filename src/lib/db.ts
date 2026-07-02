import { createPublicClient as createClient } from "./supabase/public";
import type { Project, Certificate, Blog, SiteSettings, Media, GalleryItem, AboutIntro } from "./types";

// ─── SETTINGS ────────────────────────────────────────────────────────────────
export async function getSettings(): Promise<SiteSettings | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("settings")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(1)
    .single();
  return data;
}

// ─── PROJECTS ─────────────────────────────────────────────────────────────────

function normalizeGallery(raw: unknown): GalleryItem[] {
  if (!Array.isArray(raw)) return [];
  const result: GalleryItem[] = [];
  raw.forEach((item, idx) => {
    if (typeof item === "string" && item) {
      result.push({ url: item, caption: "", sort_order: idx });
    } else if (item && typeof item === "object" && "url" in item) {
      const obj = item as Record<string, unknown>;
      const url = String(obj.url ?? "");
      if (!url) return;
      result.push({
        url,
        caption: String(obj.caption ?? ""),
        sort_order: typeof obj.sort_order === "number" ? obj.sort_order : idx,
      });
    }
  });
  return result.sort((a, b) => a.sort_order - b.sort_order);
}

function normalizeProject(p: unknown): Project {
  const proj = p as Record<string, unknown>;
  const tools = proj.tools ?? proj["tools_"];
  const gallery = proj.gallery ?? proj["gallery_"];
  return {
    ...proj,
    tools: Array.isArray(tools) ? tools : [],
    gallery: normalizeGallery(gallery),
  } as Project;
}

export async function getPublishedProjects(): Promise<Project[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("projects")
    .select("*")
    .eq("published", true)
    .order("created_at", { ascending: false });
  return (data || []).map(normalizeProject);
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .single();
  // PGRST116 = "no rows found" → project genuinely doesn't exist, show 404.
  // Any other error (network blip, Supabase outage, egress limit, timeout, etc.)
  // is rethrown so the route's error.tsx boundary can show a friendly
  // "try again" screen instead of crashing into a raw 500 page.
  if (error && error.code !== "PGRST116") {
    throw new Error(`getProjectBySlug failed: ${error.message}`);
  }
  return data ? normalizeProject(data) : null;
}

export async function getFeaturedProjects(): Promise<Project[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("projects")
    .select("*")
    .eq("published", true)
    .eq("featured", true)
    .order("created_at", { ascending: false });
  return (data || []).map(normalizeProject);
}

// ─── CERTIFICATES ──────────────────────────────────────────────────────────────
export async function getCertificates(): Promise<Certificate[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("certificates")
    .select("*")
    .order("issue_date", { ascending: false });
  return data || [];
}

export async function getCertificateBySlug(id: string): Promise<Certificate | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("certificates")
    .select("*")
    .eq("id", id)
    .single();
  return data;
}

// ─── BLOGS ────────────────────────────────────────────────────────────────────
export async function getPublishedBlogs(): Promise<Blog[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("blogs")
    .select("*")
    .eq("published", true)
    .order("created_at", { ascending: false });
  return data || [];
}

export async function getBlogBySlug(slug: string): Promise<Blog | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("blogs")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .single();
  return data;
}

// ─── MEDIA ────────────────────────────────────────────────────────────────────
export async function getMediaList(): Promise<Media[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("media")
    .select("*")
    .order("created_at", { ascending: false });
  return data || [];
}

// ─── ANALYTICS ────────────────────────────────────────────────────────────────
export async function getTopViewedProjects(limit = 5) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("project_views")
    .select("project_id, projects(title_id, title_en, slug)")
    .limit(100);

  if (!data) return [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const counts: Record<string, { count: number; project: { title_id: string; title_en: string; slug: string } }> = {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (data as any[]).forEach((row: any) => {
    if (!counts[row.project_id]) {
      const proj = Array.isArray(row.projects) ? row.projects[0] : row.projects;
      counts[row.project_id] = {
        count: 0,
        project: proj || { title_id: "", title_en: "", slug: "" },
      };
    }
    counts[row.project_id].count++;
  });

  return Object.entries(counts)
    .map(([id, v]) => ({ project_id: id, count: v.count, project: v.project }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export async function getTopViewedBlogs(limit = 5) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("blog_views")
    .select("blog_id, blogs(title_id, title_en, slug)")
    .limit(100);

  if (!data) return [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const counts: Record<string, { count: number; blog: { title_id: string; title_en: string; slug: string } }> = {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (data as any[]).forEach((row: any) => {
    if (!counts[row.blog_id]) {
      const b = Array.isArray(row.blogs) ? row.blogs[0] : row.blogs;
      counts[row.blog_id] = {
        count: 0,
        blog: b || { title_id: "", title_en: "", slug: "" },
      };
    }
    counts[row.blog_id].count++;
  });

  return Object.entries(counts)
    .map(([id, v]) => ({ blog_id: id, count: v.count, blog: v.blog }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export async function getVisitorStats() {
  const supabase = await createClient();

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const [{ count: today }, { count: month }, { count: total }] = await Promise.all([
    supabase.from("visitor_analytics").select("*", { count: "exact", head: true }).gte("created_at", todayStart),
    supabase.from("visitor_analytics").select("*", { count: "exact", head: true }).gte("created_at", monthStart),
    supabase.from("visitor_analytics").select("*", { count: "exact", head: true }),
  ]);

  return {
    today: today || 0,
    month: month || 0,
    total: total || 0,
  };
}

export async function getPublishedProjectsCount(): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("projects")
    .select("*", { count: "exact", head: true })
    .eq("published", true);
  return count ?? 0;
}

export async function getPublishedBlogsCount(): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("blogs")
    .select("*", { count: "exact", head: true })
    .eq("published", true);
  return count ?? 0;
}

// ─── SUPABASE STORAGE URL ─────────────────────────────────────────────────────
export function getStorageUrl(bucket: string, path: string): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`;
}

// ─── ABOUT CMS ────────────────────────────────────────────────────────────────
export async function getAboutEducation() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("about_education")
    .select("*")
    .order("sort_order", { ascending: true });
  return data || [];
}

export async function getAboutExperiences() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("about_experiences")
    .select("*")
    .order("sort_order", { ascending: true });
  return data || [];
}

export async function getAboutSkills() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("about_skills")
    .select("*")
    .order("sort_order", { ascending: true });
  return data || [];
}

export async function getAboutOrganizations() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("about_organizations")
    .select("*")
    .order("sort_order", { ascending: true });
  return data || [];
}

export async function getAboutIntro(): Promise<AboutIntro | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("about_intro")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(1)
    .single();
  return data ?? null;
}
