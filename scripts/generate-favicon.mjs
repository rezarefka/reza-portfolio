/**
 * generate-favicon.mjs
 * Prebuild script — dijalankan sebelum `next build`
 * Sync favicon dari Supabase CMS ke src/app/favicon.ico
 * Sehingga Google crawler selalu dapat favicon terbaru saat crawl /favicon.ico
 */

import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// ── Load .env.local untuk dev lokal ────────────────────────────────────────
if (existsSync(join(ROOT, '.env.local'))) {
  const raw = readFileSync(join(ROOT, '.env.local'), 'utf-8');
  for (const line of raw.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
    if (key && !process.env[key]) process.env[key] = val;
  }
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const FALLBACK_URL =
  'https://baxvcjsensttnkupambu.supabase.co/storage/v1/object/public/avatars/1780364547823-7vnrjoqh2vu.png';

const FAVICON_PATH = join(ROOT, 'src', 'app', 'favicon.ico');

async function run() {
  console.log('[favicon-prebuild] 🔄 Syncing favicon from CMS...');

  let iconUrl = FALLBACK_URL;

  // ── 1. Ambil URL favicon dari Supabase ────────────────────────────────────
  if (SUPABASE_URL && SUPABASE_KEY) {
    try {
      const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
      const { data: settings, error } = await supabase
        .from('settings')
        .select('favicon, avatar')
        .single();

      if (error) throw error;
      if (settings?.favicon) {
        iconUrl = settings.favicon;
        console.log('[favicon-prebuild] ✅ Got favicon URL from CMS');
      } else if (settings?.avatar) {
        iconUrl = settings.avatar;
        console.log('[favicon-prebuild] ⚠️  No favicon set, using avatar as fallback');
      }
    } catch (err) {
      console.warn('[favicon-prebuild] ⚠️  Supabase query failed:', err.message);
      console.warn('[favicon-prebuild]    Using fallback URL');
    }
  } else {
    console.warn('[favicon-prebuild] ⚠️  SUPABASE env vars not found, using fallback');
  }

  // ── 2. Download & proses gambar ───────────────────────────────────────────
  try {
    console.log('[favicon-prebuild] ⬇️  Downloading:', iconUrl);
    const res = await fetch(iconUrl, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
    const buf = Buffer.from(await res.arrayBuffer());

    const meta = await sharp(buf).metadata();
    const hasAlpha = meta.channels === 4 || meta.hasAlpha === true;

    // Output PNG 256×256 — browser & Google crawler menerima PNG sebagai favicon
    const out = await sharp(buf)
      .flatten(hasAlpha ? { background: { r: 255, g: 255, b: 255 } } : false)
      .resize(256, 256, { fit: 'contain', background: { r: 255, g: 255, b: 255 } })
      .png({ compressionLevel: 9 })
      .toBuffer();

    writeFileSync(FAVICON_PATH, out);
    console.log(`[favicon-prebuild] ✅ favicon.ico updated (${(out.length / 1024).toFixed(1)} KB)`);
  } catch (err) {
    console.error('[favicon-prebuild] ❌ Failed to update favicon:', err.message);
    console.error('[favicon-prebuild]    Build will continue with existing favicon.ico');
    // Non-fatal — build tetap lanjut
  }
}

run();
