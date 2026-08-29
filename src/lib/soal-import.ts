/* ═══════════════════════════════════════════
   SOAL IMPORT — Auto-detect file format
   Supports: .docx (mammoth), .txt, .csv
   Auto-detects: Pilihan Ganda vs Uraian
   ═══════════════════════════════════════════ */

import mammoth from "mammoth";

export interface ParsedSoal {
  question: string;
  options: string[];    // A, B, C, D, E (empty for uraian)
  answer: string;       // jawaban benar (opsional)
  type: "Pilihan Ganda" | "Uraian";
  difficulty: "Mudah" | "Sedang" | "Sulit";
}

/* ── Detect file type from extension ── */
function getFileType(file: File): "docx" | "txt" | "csv" | "unknown" {
  const name = file.name.toLowerCase();
  if (name.endsWith(".docx")) return "docx";
  if (name.endsWith(".txt") || name.endsWith(".text")) return "txt";
  if (name.endsWith(".csv") || name.endsWith(".tsv")) return "csv";
  return "unknown";
}

/* ── Detect if a block is Pilihan Ganda ── */
function detectType(block: string): "Pilihan Ganda" | "Uraian" {
  // Check for A. B. C. D. pattern
  const hasOptions = /\n\s*[A-Ea-e][\.\)]\s+/.test(block);
  // Check for numbered options: (1) (2) or 1. 2.
  const hasNumberedOptions = /\n\s*\(?[1-5]\)?[\.\)]\s+/.test(block);
  return hasOptions || hasNumberedOptions ? "Pilihan Ganda" : "Uraian";
}

/* ── Parse options from a question block ── */
function parseOptions(block: string): string[] {
  const options: string[] = [];

  // Pattern: "A. ..." or "A) ..."
  const letterPattern = block.match(
    /\n\s*([A-E])[\.\)]\s+(.+?)(?=\n\s*[A-E][\.\)]|\n\n|$)/gs
  );
  if (letterPattern && letterPattern.length >= 2) {
    for (const m of letterPattern) {
      const text = m.replace(/^\n\s*[A-E][\.\)]\s+/, "").trim();
      if (text) options.push(text);
    }
    return options;
  }

  // Pattern: "(1) ..." or "1. ..."
  const numPattern = block.match(
    /\n\s*\(?([1-5])\)?[\.\)]\s+(.+?)(?=\n\s*\(?[1-5]\)?[\.\)]|\n\n|$)/gs
  );
  if (numPattern && numPattern.length >= 2) {
    for (const m of numPattern) {
      const text = m.replace(/^\n\s*\(?[1-5]\)?[\.\)]\s+/, "").trim();
      if (text) options.push(text);
    }
  }

  return options;
}

/* ── Extract question text (everything before first option) ── */
function extractQuestion(block: string): string {
  // Remove leading number like "1." or "1)"
  let q = block.replace(/^\s*\d+[\.\)]\s*/, "").trim();

  // Cut at first option
  const optIdx = q.search(/\n\s*[A-Ea-e][\.\)]\s+/);
  if (optIdx > 0) q = q.slice(0, optIdx).trim();

  // Also cut at numbered options
  const numIdx = q.search(/\n\s*\(?[1-5]\)?[\.\)]\s+/);
  if (numIdx > 0 && (optIdx < 0 || numIdx < optIdx)) {
    q = q.slice(0, numIdx).trim();
  }

  return q;
}

/* ── Split raw text into question blocks ── */
function splitIntoQuestions(text: string): string[] {
  // Normalize line endings
  const normalized = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  // Split by numbered patterns: "1.", "1)", "1.", etc. at start of line
  const blocks = normalized
    .split(/\n\s*(?=\d+[\.\)]\s+)/)
    .map((b) => b.trim())
    .filter((b) => b.length > 5); // minimum viable question

  // If no numbered pattern found, split by double newlines
  if (blocks.length <= 1) {
    return normalized
      .split(/\n\s*\n/)
      .map((b) => b.trim())
      .filter((b) => b.length > 10);
  }

  return blocks;
}

/* ── Auto-detect difficulty heuristics ── */
function detectDifficulty(question: string, options: string[]): "Mudah" | "Sedang" | "Sulit" {
  const len = question.length;
  const optCount = options.length;

  // Very short + many options → likely easy
  if (len < 50 && optCount >= 4) return "Mudah";

  // Long question with complex words → harder
  const complexWords = /analisis|evaluasi|bandingkan|jelaskan|uraikan|kritik|sintesis|komparasi/i;
  if (complexWords.test(question) || len > 200) return "Sulit";

  // Medium length
  if (len > 100 || optCount < 4) return "Sedang";

  return "Sedang";
}

/* ═══════════════════════════════════════════
   MAIN PARSERS
   ═══════════════════════════════════════════ */

/* ── Parse .docx ── */
async function parseDocx(file: File): Promise<ParsedSoal[]> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return parseTextContent(result.value);
}

/* ── Parse .txt ── */
async function parseTxt(file: File): Promise<ParsedSoal[]> {
  const text = await file.text();
  return parseTextContent(text);
}

/* ── Parse .csv ── */
async function parseCsv(file: File): Promise<ParsedSoal[]> {
  const text = await file.text();
  const lines = text.split("\n").map((l) => l.trim()).filter((l) => l.length > 0);

  if (lines.length === 0) return [];

  // Auto-detect delimiter: comma, semicolon, or tab
  const firstLine = lines[0];
  const delimiter =
    firstLine.split("\t").length > firstLine.split(",").length
      ? "\t"
      : firstLine.split(";").length > firstLine.split(",").length
        ? ";"
        : ",";

  // Check if first line is a header
  const header = lines[0].toLowerCase();
  const hasHeader =
    header.includes("soal") ||
    header.includes("question") ||
    header.includes("pertanyaan") ||
    header.includes("mata pelajaran") ||
    header.includes("subject") ||
    header.includes("jenis");

  const dataLines = hasHeader ? lines.slice(1) : lines;
  const questions: ParsedSoal[] = [];

  for (const line of dataLines) {
    // Parse CSV with potential quoted fields
    const fields = parseCsvLine(line, delimiter);
    if (fields.length < 1) continue;

    const questionText = fields[0]?.trim();
    if (!questionText || questionText.length < 5) continue;

    // Check if there are option columns (B, C, D, E)
    const optionFields = fields.slice(1, 6).filter((f) => f && f.trim().length > 0);
    const isPilihanGanda = optionFields.length >= 2;

    const options = isPilihanGanda
      ? optionFields.map((f) => f.trim())
      : [];

    // Check if there's an answer column
    const answer = isPilihanGanda && fields.length > 6 ? fields[6]?.trim() : "";

    questions.push({
      question: questionText,
      options,
      answer: answer || "",
      type: isPilihanGanda ? "Pilihan Ganda" : "Uraian",
      difficulty: detectDifficulty(questionText, options),
    });
  }

  return questions;
}

/* ── Parse a single CSV line respecting quotes ── */
function parseCsvLine(line: string, delimiter: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];

    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === delimiter && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

/* ── Generic text content parser (shared by docx + txt) ── */
function parseTextContent(text: string): ParsedSoal[] {
  const blocks = splitIntoQuestions(text);
  const questions: ParsedSoal[] = [];

  for (const block of blocks) {
    const question = extractQuestion(block);
    if (question.length < 5) continue;

    const type = detectType(block);
    const options = type === "Pilihan Ganda" ? parseOptions(block) : [];

    questions.push({
      question,
      options,
      answer: "",
      type,
      difficulty: detectDifficulty(question, options),
    });
  }

  return questions;
}

/* ═══════════════════════════════════════════
   PUBLIC API
   ═══════════════════════════════════════════ */

export interface ImportResult {
  format: string;
  detectedType: string;
  questions: ParsedSoal[];
}

/**
 * Auto-detect file format and parse questions.
 * Returns the detected format, type, and parsed questions.
 */
export async function importSoal(file: File): Promise<ImportResult> {
  const fileType = getFileType(file);

  let questions: ParsedSoal[] = [];
  let format = "";

  switch (fileType) {
    case "docx":
      format = "Microsoft Word (.docx)";
      questions = await parseDocx(file);
      break;
    case "txt":
      format = "Teks Plain (.txt)";
      questions = await parseTxt(file);
      break;
    case "csv":
      format = "CSV (.csv)";
      questions = await parseCsv(file);
      break;
    default:
      // Try as text
      format = "Teks (auto)";
      try {
        const text = await file.text();
        questions = parseTextContent(text);
      } catch {
        throw new Error(
          `Format file tidak dikenali (${file.name}). Gunakan .docx, .txt, atau .csv.`
        );
      }
  }

  // Detect dominant question type
  const pgCount = questions.filter((q) => q.type === "Pilihan Ganda").length;
  const urCount = questions.filter((q) => q.type === "Uraian").length;
  const detectedType =
    pgCount > urCount
      ? "Pilihan Ganda"
      : urCount > pgCount
        ? "Uraian"
        : "Campuran";

  return { format, detectedType, questions };
}
