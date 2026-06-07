/**
 * mediaCompressor.ts
 * Kompresi client-side untuk gambar, video, dan file lainnya
 * - Gambar: Canvas API → WebP/JPEG (target < 800KB)
 * - Video: MediaRecorder re-encode (target bitrate rendah)
 * - PDF/lainnya: pass-through dengan size warning
 */

export interface CompressionResult {
  file: File;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number; // 0–1, makin kecil makin baik
  wasCompressed: boolean;
  method: string;
}

export interface CompressionOptions {
  /** Target max ukuran gambar dalam bytes. Default: 800KB */
  imageMaxBytes?: number;
  /** Kualitas gambar 0–1. Default: 0.82 */
  imageQuality?: number;
  /** Max lebar/tinggi gambar px. Default: 2560 */
  imageMaxDimension?: number;
  /** Output format gambar. Default: "image/webp" dengan fallback jpeg */
  imageFormat?: "image/webp" | "image/jpeg" | "image/png";
  /** Target bitrate video dalam bps. Default: 800_000 (800kbps) */
  videoBitrate?: number;
  /** Callback progress 0-100 */
  onProgress?: (pct: number) => void;
}

/** Deteksi tipe file */
function detectCategory(file: File): "image" | "video" | "pdf" | "other" {
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("video/")) return "video";
  if (file.type === "application/pdf" || file.name.endsWith(".pdf")) return "pdf";
  return "other";
}

/** Resize + compress gambar via Canvas */
async function compressImage(
  file: File,
  opts: Required<Pick<CompressionOptions, "imageMaxBytes" | "imageQuality" | "imageMaxDimension" | "imageFormat">> & { onProgress: (n: number) => void }
): Promise<CompressionResult> {
  const originalSize = file.size;
  opts.onProgress(10);

  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      opts.onProgress(30);

      const canvas = document.createElement("canvas");
      let { width, height } = img;

      // Resize jika melebihi batas
      if (width > opts.imageMaxDimension || height > opts.imageMaxDimension) {
        const scale = opts.imageMaxDimension / Math.max(width, height);
        width = Math.round(width * scale);
        height = Math.round(height * scale);
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, width, height);
      opts.onProgress(60);

      // Coba WebP dulu, fallback ke JPEG
      const tryFormat = (format: string, quality: number): Promise<Blob | null> =>
        new Promise((res) => canvas.toBlob((b) => res(b), format, quality));

      const runCompression = async () => {
        let blob: Blob | null = null;
        let usedFormat = opts.imageFormat;

        // Iterasi kualitas sampai ukuran memenuhi target
        let quality = opts.imageQuality;
        for (let attempt = 0; attempt < 6; attempt++) {
          blob = await tryFormat(usedFormat, quality);
          if (!blob) break;
          if (blob.size <= opts.imageMaxBytes || quality <= 0.35) break;
          quality -= 0.12;
          opts.onProgress(60 + attempt * 5);
        }

        // Fallback ke JPEG kalau WebP tidak didukung atau blob null
        if (!blob || blob.size === 0) {
          usedFormat = "image/jpeg";
          blob = await tryFormat(usedFormat, opts.imageQuality);
        }

        if (!blob) {
          return resolve({
            file,
            originalSize,
            compressedSize: originalSize,
            compressionRatio: 1,
            wasCompressed: false,
            method: "pass-through (canvas error)",
          });
        }

        opts.onProgress(95);

        const ext = usedFormat === "image/webp" ? "webp" : usedFormat === "image/png" ? "png" : "jpg";
        const baseName = file.name.replace(/\.[^.]+$/, "");
        const compressed = new File([blob], `${baseName}.${ext}`, { type: usedFormat });

        // Kalau hasil kompresi malah lebih besar, pakai aslinya
        if (compressed.size >= originalSize * 0.95) {
          return resolve({
            file,
            originalSize,
            compressedSize: originalSize,
            compressionRatio: 1,
            wasCompressed: false,
            method: "pass-through (sudah optimal)",
          });
        }

        opts.onProgress(100);
        resolve({
          file: compressed,
          originalSize,
          compressedSize: compressed.size,
          compressionRatio: compressed.size / originalSize,
          wasCompressed: true,
          method: `canvas → ${ext.toUpperCase()} (${Math.round(quality * 100)}% quality, ${width}×${height}px)`,
        });
      };

      runCompression().catch(reject);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({
        file,
        originalSize,
        compressedSize: originalSize,
        compressionRatio: 1,
        wasCompressed: false,
        method: "pass-through (image load error)",
      });
    };

    img.src = url;
  });
}

/** Compress video dengan MediaRecorder (re-encode) */
async function compressVideo(
  file: File,
  opts: { videoBitrate: number; onProgress: (n: number) => void }
): Promise<CompressionResult> {
  const originalSize = file.size;
  opts.onProgress(5);

  // Cek dukungan MediaRecorder
  const supportedMime = ["video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm"].find(
    (m) => MediaRecorder.isTypeSupported(m)
  );

  if (!supportedMime) {
    return {
      file,
      originalSize,
      compressedSize: originalSize,
      compressionRatio: 1,
      wasCompressed: false,
      method: "pass-through (MediaRecorder tidak didukung)",
    };
  }

  return new Promise((resolve) => {
    const video = document.createElement("video");
    const srcUrl = URL.createObjectURL(file);
    video.src = srcUrl;
    video.muted = true;
    video.playsInline = true;

    video.onloadedmetadata = () => {
      const canvas = document.createElement("canvas");

      // Resize video max 1280px
      let vw = video.videoWidth;
      let vh = video.videoHeight;
      const maxDim = 1280;
      if (vw > maxDim || vh > maxDim) {
        const scale = maxDim / Math.max(vw, vh);
        vw = Math.round(vw * scale);
        vh = Math.round(vh * scale);
      }
      canvas.width = vw;
      canvas.height = vh;
      const ctx = canvas.getContext("2d")!;

      const chunks: Blob[] = [];
      const recorder = new MediaRecorder(canvas.captureStream(30), {
        mimeType: supportedMime,
        videoBitsPerSecond: opts.videoBitrate,
      });

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        URL.revokeObjectURL(srcUrl);
        const blob = new Blob(chunks, { type: supportedMime.split(";")[0] });
        const ext = "webm";
        const baseName = file.name.replace(/\.[^.]+$/, "");
        const compressed = new File([blob], `${baseName}.${ext}`, { type: "video/webm" });

        if (compressed.size >= originalSize * 0.92) {
          return resolve({
            file,
            originalSize,
            compressedSize: originalSize,
            compressionRatio: 1,
            wasCompressed: false,
            method: "pass-through (video sudah cukup kecil)",
          });
        }

        resolve({
          file: compressed,
          originalSize,
          compressedSize: compressed.size,
          compressionRatio: compressed.size / originalSize,
          wasCompressed: true,
          method: `MediaRecorder → WebM (${Math.round(opts.videoBitrate / 1000)}kbps, ${vw}×${vh})`,
        });
      };

      let frame = 0;
      const duration = video.duration;

      const drawFrame = () => {
        if (video.paused || video.ended) {
          recorder.stop();
          return;
        }
        ctx.drawImage(video, 0, 0, vw, vh);
        frame++;
        const pct = Math.min(90, 10 + (video.currentTime / duration) * 80);
        opts.onProgress(Math.round(pct));
        requestAnimationFrame(drawFrame);
      };

      recorder.start(100);
      video.play().then(drawFrame).catch(() => {
        recorder.stop();
        URL.revokeObjectURL(srcUrl);
        resolve({
          file,
          originalSize,
          compressedSize: originalSize,
          compressionRatio: 1,
          wasCompressed: false,
          method: "pass-through (video play error)",
        });
      });
    };

    video.onerror = () => {
      URL.revokeObjectURL(srcUrl);
      resolve({
        file,
        originalSize,
        compressedSize: originalSize,
        compressionRatio: 1,
        wasCompressed: false,
        method: "pass-through (video load error)",
      });
    };
  });
}

/** Entry point utama */
export async function compressFile(
  file: File,
  options: CompressionOptions = {}
): Promise<CompressionResult> {
  const {
    imageMaxBytes = 800 * 1024,
    imageQuality = 0.82,
    imageMaxDimension = 2560,
    imageFormat = "image/webp",
    videoBitrate = 800_000,
    onProgress = () => {},
  } = options;

  const category = detectCategory(file);
  onProgress(0);

  if (category === "image") {
    return compressImage(file, {
      imageMaxBytes,
      imageQuality,
      imageMaxDimension,
      imageFormat,
      onProgress,
    });
  }

  if (category === "video") {
    // Video kecil (<5MB) tidak perlu kompresi berat
    if (file.size < 5 * 1024 * 1024) {
      onProgress(100);
      return {
        file,
        originalSize: file.size,
        compressedSize: file.size,
        compressionRatio: 1,
        wasCompressed: false,
        method: "pass-through (video < 5MB, sudah ringan)",
      };
    }
    return compressVideo(file, { videoBitrate, onProgress });
  }

  // PDF, ZIP, docx, dll → pass-through
  onProgress(100);
  return {
    file,
    originalSize: file.size,
    compressedSize: file.size,
    compressionRatio: 1,
    wasCompressed: false,
    method: "pass-through (format tidak di-kompresi)",
  };
}

/** Format ukuran file untuk tampilan */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
