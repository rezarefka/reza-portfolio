import { MetadataRoute } from "next";

const baseURL = process.env.NEXT_PUBLIC_BASE_URL || "https://rezarefka.web.id";

export default function robots(): MetadataRoute.Robots {
  // Kalau diakses dari domain selain domain utama (misal vercel.app), block semua
  if (baseURL !== "https://rezarefka.web.id") {
    return {
      rules: [{ userAgent: "*", disallow: "/" }],
    };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Block yang memang private — sub-pages lain boleh di-crawl
        // tapi di-noindex via meta tag & X-Robots-Tag header
        // (Google harus bisa crawl untuk melihat noindex tag dan de-index yang sudah masuk)
        disallow: [
          "/reza-control/",
          "/api/",
        ],
      },
    ],
    sitemap: "https://rezarefka.web.id/sitemap.xml",
  };
}
