import { NextRequest, NextResponse } from "next/server";

/**
 * PDF Proxy — /api/pdf-proxy?url=<encoded_url>
 *
 * Mengambil file PDF dari Supabase Storage melalui server Next.js dan
 * meneruskannya ke browser TANPA header restrictif seperti:
 *   - X-Frame-Options: DENY
 *   - Content-Security-Policy: frame-ancestors 'none'
 *
 * Header tersebut menyebabkan iframe PDF diblokir browser dengan pesan
 * "This content is blocked. Contact the site owner to fix the issue."
 *
 * Penggunaan: <iframe src={`/api/pdf-proxy?url=${encodeURIComponent(pdfUrl)}`} />
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const pdfUrl = searchParams.get("url");

  if (!pdfUrl) {
    return NextResponse.json({ error: "Parameter 'url' wajib diisi" }, { status: 400 });
  }

  // Validasi URL
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(pdfUrl);
  } catch {
    return NextResponse.json({ error: "URL tidak valid" }, { status: 400 });
  }

  if (parsedUrl.protocol !== "https:") {
    return NextResponse.json({ error: "Hanya HTTPS yang diizinkan" }, { status: 400 });
  }

  // Hanya izinkan domain Supabase atau domain yang terpercaya
  const allowedHosts = [
    ".supabase.co",
    ".supabase.in",
    "supabase.co",
  ];
  const isAllowed = allowedHosts.some((h) => parsedUrl.hostname.endsWith(h));
  if (!isAllowed) {
    return NextResponse.json(
      { error: "Domain tidak diizinkan untuk proxy PDF" },
      { status: 403 }
    );
  }

  try {
    const response = await fetch(pdfUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; NextJS-PDF-Proxy/1.0)",
      },
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Gagal mengambil PDF: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    const buffer = await response.arrayBuffer();

    // Return PDF dengan header yang MENGIZINKAN embed di iframe
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        // Izinkan embed dari origin yang sama (same-origin)
        "X-Frame-Options": "SAMEORIGIN",
        // Hapus CSP yang memblokir frame-ancestors
        "Content-Security-Policy": "frame-ancestors 'self'",
        "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
        "Access-Control-Allow-Origin": "*",
        "X-Proxy-Source": parsedUrl.hostname,
      },
    });
  } catch (error) {
    console.error("[pdf-proxy] Error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil PDF dari server" },
      { status: 500 }
    );
  }
}
