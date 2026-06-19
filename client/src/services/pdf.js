// src/services/pdf.js
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { formatDateTime } from "../utils/formatDate";

// ── Constants ────────────────────────────────────────────────────────────────
const PAGE_WIDTH  = 210;            // A4 width mm
const MARGIN      = 18;
const CONTENT_W   = PAGE_WIDTH - MARGIN * 2;   // 174 mm
const LINE_H      = 7;             // native text line height mm

const SCALE       = 2;             // html2canvas render scale for crisp output
// Convert mm → px at 96 DPI: px = mm * 96 / 25.4
const PX_PER_MM   = 96 / 25.4;
const PX_WIDTH    = Math.round(CONTENT_W * PX_PER_MM);  // ≈ 657 px

// Languages that need html2canvas capture (jsPDF can't shape these scripts)
const INDIC_LANGUAGES = new Set(["Tamil", "Hindi", "Telugu", "Kannada", "Malayalam"]);

// Map displayLanguage → { lazyLoad, fontFamily }
const FONT_CONFIG = {
  Tamil:     { load: () => import("../assets/fonts/NotoSansTamil-base64"),      family: "NotoSansTamilWeb" },
  Hindi:     { load: () => import("../assets/fonts/NotoSansDevanagari-base64"), family: "NotoSansDevanagariWeb" },
  Telugu:    { load: () => import("../assets/fonts/NotoSansTelugu-base64"),     family: "NotoSansTeluguWeb" },
  Kannada:   { load: () => import("../assets/fonts/NotoSansKannada-base64"),    family: "NotoSansKannadaWeb" },
  Malayalam: { load: () => import("../assets/fonts/NotoSansMalayalam-base64"),  family: "NotoSansMalayalamWeb" },
};

// ── Helper: register font via FontFace API ───────────────────────────────────
// Must await before calling html2canvas, otherwise captures blank/fallback font.
const registerWebFont = async (fontFamily, fontBase64) => {
  // Avoid double-registration if downloadPDF is called multiple times
  if ([...document.fonts].some((f) => f.family === fontFamily)) return;

  const face = new FontFace(
    fontFamily,
    `url(data:font/ttf;base64,${fontBase64})`
  );
  document.fonts.add(face);
  await face.load();         // Wait for the font bytes to be decoded by the browser
  await document.fonts.ready; // Belt-and-suspenders: wait for ALL pending fonts
};

// ── Helper: render one transcript line off-screen and capture as PNG ─────────
// Returns { imgData: string, heightMm: number }
const captureLineAsImage = async (text, fontFamily, isAlert) => {
  const div = document.createElement("div");

  // position: absolute with a far-left offset — NOT display:none
  // (html2canvas cannot capture display:none elements)
  div.style.position   = "absolute";
  div.style.left       = "-9999px";
  div.style.top        = "0";
  div.style.width      = `${PX_WIDTH}px`;
  // Extra bottom padding baked into the box — gives descenders / matras /
  // loops on Tamil, Telugu, Malayalam, Devanagari letters breathing room so
  // they never get visually clipped against the next captured line.
  div.style.padding    = "2px 0 6px 0";
  div.style.margin     = "0";
  div.style.boxSizing  = "border-box";
  div.style.fontFamily = `"${fontFamily}", sans-serif`;
  div.style.fontSize   = "14px";       // ~10pt at 96 dpi, matches jsPDF size 10
  div.style.lineHeight = "1.5";
  div.style.whiteSpace = "pre-wrap";
  div.style.wordBreak  = "break-word";
  div.style.color      = isAlert ? "rgb(180,50,50)" : "rgb(40,40,40)";
  div.style.fontWeight = isAlert ? "bold" : "normal";
  div.style.background = "#ffffff";

  div.textContent = text;
  document.body.appendChild(div);

  // Let the browser finish layout (and any font swap) before measuring/capturing.
  // Without this wait, the height we measure can be taken mid-reflow.
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

  // Measure the ACTUAL rendered height directly from the DOM.
  // Previously heightMm was derived from canvas.height / SCALE, which can
  // round/mismatch against the real layout height — that mismatch is what
  // caused the next line's image to overlap this one. Measuring the DOM
  // rect directly is exact.
  const cssHeightPx = div.getBoundingClientRect().height;

  let canvas;
  try {
    canvas = await html2canvas(div, {
      scale:           SCALE,
      useCORS:         false,
      backgroundColor: "#ffffff",
      logging:         false,
      width:           PX_WIDTH,
      height:          Math.ceil(cssHeightPx),
      windowHeight:    Math.ceil(cssHeightPx),
    });
  } finally {
    document.body.removeChild(div);
  }

  const imgData  = canvas.toDataURL("image/png");
  const heightMm = cssHeightPx / PX_PER_MM;

  return { imgData, heightMm };
};

// ── Main export ──────────────────────────────────────────────────────────────
/**
 * Generate and download a PDF transcript.
 *
 * English sessions: native jsPDF text — fully selectable/searchable.
 * Indic sessions:   transcript lines rendered via html2canvas with the correct
 *                   Noto font loaded via FontFace API — NOT selectable/searchable.
 *                   Title, meta-info, and footer remain native helvetica text.
 *
 * @param {{ userName: string, displayLanguage: string, lines: string[] }} options
 */
export const downloadPDF = async ({ userName, displayLanguage, lines }) => {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const isIndic  = INDIC_LANGUAGES.has(displayLanguage);
  let fontFamily = "helvetica";

  // ── Load Indic font into browser via FontFace API (needed by html2canvas) ──
  if (isIndic) {
    const config = FONT_CONFIG[displayLanguage];
    const { default: fontBase64 } = await config.load();
    fontFamily = config.family;
    await registerWebFont(fontFamily, fontBase64);
  }

  let y = MARGIN;

  // ── Page-break helper ──────────────────────────────────────────────────────
  const checkPageBreak = (needed = LINE_H) => {
    if (y + needed > 285) {
      doc.addPage();
      y = MARGIN;
    }
  };

  // ── Title (always native helvetica) ────────────────────────────────────────
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(60, 60, 120);
  doc.text("AI Translation Room — Session Transcript", MARGIN, y);
  y += 8;

  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text("Session Transcript", MARGIN, y);
  y += 10;

  // ── Divider ────────────────────────────────────────────────────────────────
  doc.setDrawColor(200, 200, 220);
  doc.setLineWidth(0.5);
  doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
  y += 7;

  // ── Meta info (always native helvetica) ────────────────────────────────────
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);

  const metaLines = [
    `User       : ${userName || "Unknown"}`,
    `Date/Time  : ${formatDateTime(new Date())}`,
    `Language   : ${displayLanguage || "English"}`,
    `Lines      : ${lines.length}`,
  ];

  metaLines.forEach((meta) => {
    doc.text(meta, MARGIN, y);
    y += LINE_H - 1;
  });

  y += 4;

  // ── Second divider ─────────────────────────────────────────────────────────
  doc.setDrawColor(200, 200, 220);
  doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
  y += 8;

  // ── Transcript lines ───────────────────────────────────────────────────────
  doc.setFontSize(10);

  for (const line of lines) {
    const isAlert = line.startsWith("⚠");

    if (isIndic) {
      // ── Indic path: capture each line individually as a PNG image ──────────
      // Per-line capture ensures page-break logic can split cleanly between lines
      // (no risk of a single huge canvas being sliced mid-glyph at page breaks).
      const { imgData, heightMm } = await captureLineAsImage(line, fontFamily, isAlert);
      checkPageBreak(heightMm + 3.5);
      doc.addImage(imgData, "PNG", MARGIN, y, CONTENT_W, heightMm);
      y += heightMm + 3.5;
    } else {
      // ── English path: fast native jsPDF text — selectable/searchable ───────
      if (isAlert) {
        doc.setTextColor(180, 50, 50);
        doc.setFont("helvetica", "bold");
      } else {
        doc.setTextColor(40, 40, 40);
        doc.setFont("helvetica", "normal");
      }
      const wrapped = doc.splitTextToSize(line, CONTENT_W);
      const blockH  = wrapped.length * LINE_H;
      checkPageBreak(blockH);
      doc.text(wrapped, MARGIN, y);
      y += blockH + 2;
    }
  }

  // ── Footer on every page (always native helvetica) ─────────────────────────
  const pageCount = doc.getNumberOfPages();
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p);
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.setTextColor(160, 160, 160);
    doc.text(
      `AI Translation Room — Page ${p} of ${pageCount}`,
      PAGE_WIDTH / 2,
      293,
      { align: "center" }
    );
  }

  doc.save("session-transcript.pdf");
};