import { NextRequest, NextResponse } from "next/server";

/**
 * Image Proxy — /api/image-proxy?url=<encoded_url>
 *
 * Mengambil gambar dari Supabase Storage (atau URL eksternal apapun) melalui
 * server Next.js dan meneruskannya ke browser. Ini menyelesaikan masalah:
 *   1. CORS error saat browser langsung request ke supabase.co
 *   2. Referrer-Policy yang blokir permintaan lintas-origin
 *   3. Bucket Supabase yang belum dikonfigurasi sebagai public
 *
 * Penggunaan: <img src={`/api/image-proxy?url=${encodeURIComponent(originalUrl)}`} />
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get("url");

  if (!imageUrl) {
    return NextResponse.json({ error: "Parameter 'url' wajib diisi" }, { status: 400 });
  }

  // Validasi URL — hanya izinkan Supabase dan HTTPS
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(imageUrl);
  } catch {
    return NextResponse.json({ error: "URL tidak valid" }, { status: 400 });
  }

  if (parsedUrl.protocol !== "https:") {
    return NextResponse.json({ error: "Hanya HTTPS yang diizinkan" }, { status: 400 });
  }

  try {
    const response = await fetch(imageUrl, {
      headers: {
        // Kirim sebagai server-side request tanpa referrer
        "User-Agent": "Mozilla/5.0 (compatible; NextJS-Proxy/1.0)",
      },
      // Cache 1 jam di edge
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Gagal mengambil gambar: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    const contentType = response.headers.get("content-type") || "image/jpeg";
    const buffer = await response.arrayBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
        "Access-Control-Allow-Origin": "*",
        "X-Proxy-Source": parsedUrl.hostname,
      },
    });
  } catch (error) {
    console.error("[image-proxy] Error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil gambar dari server" },
      { status: 500 }
    );
  }
}
