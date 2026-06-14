import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import sharp from "sharp";

const FALLBACK_AVATAR =
  "https://baxvcjsensttnkupambu.supabase.co/storage/v1/object/public/avatars/1780364547823-7vnrjoqh2vu.png";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const size = searchParams.get("size") === "512" ? 512 : 192;

  let iconUrl = FALLBACK_AVATAR;
  try {
    const supabase = await createClient();
    const { data: settings } = await supabase
      .from("settings")
      .select("favicon, avatar")
      .single();
    if (settings?.favicon) iconUrl = settings.favicon;
    else if (settings?.avatar) iconUrl = settings.avatar;
  } catch {
    // gunakan fallback
  }

  try {
    const res = await fetch(iconUrl, { cache: "no-store" });
    if (!res.ok) throw new Error("fetch failed");
    const inputBuf = await res.arrayBuffer();

    const pngBuffer = await sharp(Buffer.from(inputBuf))
      .resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer();

    return new NextResponse(new Uint8Array(pngBuffer), {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "X-Icon-Size": `${size}`,
      },
    });
  } catch {
    const fallback = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
      "base64"
    );
    return new NextResponse(new Uint8Array(fallback), {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  }
}
