// src/services/pdf.js
import { jsPDF } from "jspdf";
import { formatDateTime } from "../utils/formatDate";

/**
 * Generate and download a PDF transcript.
 *
 * @param {{ userName: string, displayLanguage: string, lines: string[] }} options
 */
export const downloadPDF = ({ userName, displayLanguage, lines }) => {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const PAGE_WIDTH  = 210;   // A4 width in mm
  const MARGIN      = 18;
  const CONTENT_W   = PAGE_WIDTH - MARGIN * 2;
  const LINE_H      = 7;     // line height in mm

  let y = MARGIN;

  // ── Helper: check page overflow ─────────────────────────────────────────
  const checkPageBreak = (needed = LINE_H) => {
    if (y + needed > 285) {
      doc.addPage();
      y = MARGIN;
    }
  };

  // ── Title ────────────────────────────────────────────────────────────────
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(60, 60, 120);
  doc.text("AI Translation Room — Session Transcript", MARGIN, y);
  y += 8;

  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text("Session Transcript", MARGIN, y);
  y += 10;

  // ── Divider ──────────────────────────────────────────────────────────────
  doc.setDrawColor(200, 200, 220);
  doc.setLineWidth(0.5);
  doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
  y += 7;

  // ── Meta info ────────────────────────────────────────────────────────────
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);

  const metaLines = [
    `User       : ${userName || "Unknown"}`,
    `Date/Time  : ${formatDateTime(new Date())}`,
    `Language   : ${displayLanguage || "English"}`,
    `Lines      : ${lines.length}`,
  ];

  metaLines.forEach((line) => {
    doc.text(line, MARGIN, y);
    y += LINE_H - 1;
  });

  y += 4;

  // ── Second divider ───────────────────────────────────────────────────────
  doc.setDrawColor(200, 200, 220);
  doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
  y += 8;

  // ── Transcript lines ─────────────────────────────────────────────────────
  doc.setFontSize(10);

  lines.forEach((line) => {
    const isAlert = line.startsWith("⚠");

    // Set colour per line type
    if (isAlert) {
      doc.setTextColor(180, 50, 50);
      doc.setFont("helvetica", "bold");
    } else {
      doc.setTextColor(40, 40, 40);
      doc.setFont("helvetica", "normal");
    }

    // Wrap long lines to content width
    const wrapped = doc.splitTextToSize(line, CONTENT_W);
    const blockH  = wrapped.length * LINE_H;

    checkPageBreak(blockH);
    doc.text(wrapped, MARGIN, y);
    y += blockH + 2;
  });

  // ── Footer on every page ─────────────────────────────────────────────────
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
