import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://rezarefka.web.id";

  // Hanya homepage yang diprioritaskan di Google Search
  // Halaman lain di-noindex via metadata robots
  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
  ];
}
