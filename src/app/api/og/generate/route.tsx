import { ImageResponse } from "next/og";
import { person } from "@/resources";

export const runtime = "nodejs";

export async function GET(request: Request) {
  let url = new URL(request.url);
  let title = url.searchParams.get("title") || "Portfolio";
  let subtitle = url.searchParams.get("subtitle") || person.role;

  async function loadGoogleFont(font: string, weight: string = "400") {
    const url = `https://fonts.googleapis.com/css2?family=${font}:wght@${weight}`;
    const css = await (await fetch(url)).text();
    const resource = css.match(/src: url\((.+)\) format\('(opentype|truetype)'\)/);
    if (resource) {
      const response = await fetch(resource[1]);
      if (response.status == 200) return await response.arrayBuffer();
    }
    throw new Error("failed to load font data");
  }

  const [fontRegular, fontBold] = await Promise.all([
    loadGoogleFont("Geist", "400"),
    loadGoogleFont("Geist", "700"),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          background: "#0a0a0a",
          position: "relative",
        }}
      >
        {/* Grid dots pattern */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "radial-gradient(circle, rgba(0,188,212,0.12) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
            display: "flex",
          }}
        />
        {/* Gradient glow top-right */}
        <div
          style={{
            position: "absolute",
            top: "-100px",
            right: "-100px",
            width: "500px",
            height: "500px",
            background: "radial-gradient(circle, rgba(0,188,212,0.15) 0%, transparent 70%)",
            display: "flex",
          }}
        />
        {/* Top border accent */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "3px",
            background: "linear-gradient(90deg, #00bcd4, #0097a7, transparent)",
            display: "flex",
          }}
        />

        {/* Main content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "72px 80px",
            width: "100%",
            height: "100%",
            position: "relative",
          }}
        >
          {/* Top: domain badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: "rgba(0,188,212,0.1)",
                border: "1px solid rgba(0,188,212,0.3)",
                borderRadius: "999px",
                padding: "8px 20px",
              }}
            >
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: "#00bcd4",
                  display: "flex",
                }}
              />
              <span style={{ color: "#00bcd4", fontSize: "20px", fontFamily: "Geist" }}>
                rezarefka.web.id
              </span>
            </div>
          </div>

          {/* Middle: title */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <span
              style={{
                fontSize: title.length > 40 ? "52px" : "64px",
                lineHeight: "1.15",
                letterSpacing: "-0.03em",
                color: "#ffffff",
                fontFamily: "Geist",
                fontWeight: 700,
                maxWidth: "800px",
              }}
            >
              {title}
            </span>
            {subtitle && (
              <span
                style={{
                  fontSize: "24px",
                  color: "rgba(255,255,255,0.5)",
                  fontFamily: "Geist",
                  fontWeight: 400,
                }}
              >
                {subtitle}
              </span>
            )}
          </div>

          {/* Bottom: person info */}
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <img
              src={person.avatar}
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                objectFit: "cover",
                border: "2px solid rgba(0,188,212,0.5)",
              }}
            />
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <span
                style={{
                  fontSize: "22px",
                  color: "#ffffff",
                  fontFamily: "Geist",
                  fontWeight: 700,
                }}
              >
                {person.name}
              </span>
              <span
                style={{
                  fontSize: "16px",
                  color: "rgba(255,255,255,0.45)",
                  fontFamily: "Geist",
                }}
              >
                {person.role}
              </span>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: "Geist", data: fontRegular, style: "normal", weight: 400 },
        { name: "Geist", data: fontBold, style: "normal", weight: 700 },
      ],
    },
  );
}
