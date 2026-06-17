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
        disallow: [
          "/reza-control/",
          "/api/",
        ],
      },
    ],
    sitemap: "https://rezarefka.web.id/sitemap.xml",
  };
}
