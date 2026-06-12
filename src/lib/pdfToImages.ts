/**
 * pdfToImages.ts
 * Convert PDF ke array File JPG menggunakan pdfjs-dist (browser-side).
 * Setiap halaman PDF → 1 file JPG, dirender via Canvas API.
 *
 * Tidak butuh server/Ghostscript — pure browser, jalan di Vercel.
 */

export interface PdfConversionResult {
  pages: File[];         // array JPG file, urutan sesuai halaman
  pageCount: number;
  originalName: string;
}

export interface PdfConversionProgress {
  page: number;
  total: number;
  pct: number;
}

/**
 * Convert satu file PDF ke array File JPG.
 * @param file  File PDF input
 * @param scale Skala render (default 2.0 → ~150dpi, cukup tajam)
 * @param quality JPEG quality 0-1 (default 0.88)
 * @param onProgress callback progress per halaman
 */
export async function pdfToImages(
  file: File,
  {
    scale = 2.0,
    quality = 0.88,
    onProgress,
  }: {
    scale?: number;
    quality?: number;
    onProgress?: (p: PdfConversionProgress) => void;
  } = {}
): Promise<PdfConversionResult> {
  // Dynamic import agar tidak masuk bundle server
  const pdfjsLib = await import("pdfjs-dist");

  // Worker perlu di-set ke URL CDN agar tidak ada error "worker not found"
  // pdfjs-dist v6 requires workerSrc
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;

  const pageCount = pdf.numPages;
  const baseName = file.name.replace(/\.pdf$/i, "");
  const pages: File[] = [];

  for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
    onProgress?.({ page: pageNum, total: pageCount, pct: Math.round(((pageNum - 1) / pageCount) * 90) });

    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({ canvas, viewport }).promise;

    // Canvas → Blob JPG
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("Canvas toBlob gagal"))),
        "image/jpeg",
        quality
      );
    });

    const suffix = pageCount > 1 ? `-hal${pageNum}` : "";
    const jpgFile = new File([blob], `${baseName}${suffix}.jpg`, { type: "image/jpeg" });
    pages.push(jpgFile);

    // Cleanup
    canvas.width = 0;
    canvas.height = 0;
  }

  onProgress?.({ page: pageCount, total: pageCount, pct: 100 });

  return { pages, pageCount, originalName: file.name };
}
