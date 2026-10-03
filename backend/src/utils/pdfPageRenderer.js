import path from "path";
import { fileURLToPath } from "url";
import { createCanvas } from "@napi-rs/canvas";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resolve standard font and CMap directories bundled with pdfjs-dist
const PDFJS_DIST_PATH = path.resolve(__dirname, "../../node_modules/pdfjs-dist");
const STANDARD_FONTS_PATH = path.join(PDFJS_DIST_PATH, "standard_fonts") + path.sep;
const CMAPS_PATH = path.join(PDFJS_DIST_PATH, "cmaps") + path.sep;

/**
 * Renders a specific page of a PDF buffer into a high-clarity JPEG image
 * @param {Buffer} pdfBuffer - Raw binary PDF buffer
 * @param {number} pageNumber - 1-based page index
 * @param {number} scale - Rendering scale factor (2.0 for sharp, high-res text)
 * @returns {Promise<{ imageBuffer: Buffer, totalPages: number }>}
 */
export async function renderPdfPageToJpeg(pdfBuffer, pageNumber = 1, scale = 2.0) {
  const data = new Uint8Array(pdfBuffer);

  // Supply CMap and standard font resources so all letters, math symbols, and glyphs render correctly
  const loadingTask = pdfjsLib.getDocument({
    data,
    cMapUrl: CMAPS_PATH,
    cMapPacked: true,
    standardFontDataUrl: STANDARD_FONTS_PATH,
    useSystemFonts: true,
    isEvalSupported: false,
  });

  const doc = await loadingTask.promise;
  const totalPages = doc.numPages;

  const validPage = Math.max(1, Math.min(pageNumber, totalPages));
  const page = await doc.getPage(validPage);

  const viewport = page.getViewport({ scale });
  const canvas = createCanvas(Math.floor(viewport.width), Math.floor(viewport.height));
  const context = canvas.getContext("2d");

  // Solid white background
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);

  await page.render({
    canvasContext: context,
    viewport,
  }).promise;

  // Encode as high-quality JPEG
  const imageBuffer = canvas.toBuffer("image/jpeg", 90);
  return { imageBuffer, totalPages };
}
