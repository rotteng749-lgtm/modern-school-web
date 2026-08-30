/* ═══════════════════════════════════════════
   SOAL IMPORT — Auto-detect file format
   Supports: .docx (mammoth), .txt, .csv
   Handles: A-E options, answer key tables, essay, pembahasan
   ═══════════════════════════════════════════ */

import mammoth from "mammoth";

export interface ParsedSoal {
  question: string;
  options: string[];    // A-E (empty for uraian)
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

/* ═══════════════════════════════════════════
   PARSER — Handles complex exam documents
   with PG (A-E), essay, answer key, pembahasan
   ═══════════════════════════════════════════ */

/**
 * Main text parser — handles the "NASKAH SOAL" format
 * with sections, A-E options, answer key tables, essay, pembahasan
 */
function parseTextContent(text: string): ParsedSoal[] {
  const normalized = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  // Step 1: Extract answer key from "KUNCI JAWABAN" section
  const answerKey = extractAnswerKey(normalized);

  // Step 2: Split into sections by "BAGIAN" headers
  const pgSection = extractSection(normalized, "BAGIAN I", "BAGIAN II");
  const essaySection = extractSection(normalized, "BAGIAN II", "BAGIAN III");

  const questions: ParsedSoal[] = [];

  // Step 3: Parse PG questions (A-E)
  if (pgSection) {
    const pgBlocks = splitPGQuestions(pgSection);
    for (const block of pgBlocks) {
      const q = parsePGBlock(block);
      if (q) {
        // Match answer from key
        const num = extractQuestionNumber(block);
        if (num && answerKey[num]) {
          q.answer = answerKey[num];
        }
        questions.push(q);
      }
    }
  }

  // Step 4: Parse essay questions
  if (essaySection) {
    const essayBlocks = splitEssayQuestions(essaySection);
    for (const block of essayBlocks) {
      const q = parseEssayBlock(block);
      if (q) questions.push(q);
    }
  }

  // Fallback: if no sections found, try generic parsing
  if (questions.length === 0) {
    return parseGenericText(normalized);
  }

  return questions;
}

/* ── Extract answer key from KUNCI JAWABAN section ── */
function extractAnswerKey(text: string): Record<string, string> {
  const key: Record<string, string> = {};

  // Look for answer key patterns: "1 B", "1. B", "1\tB", "No\tKunci" tables
  // Pattern 1: "1 B" or "1. B" or "1\tB" (tab-separated)
  const lines = text.split("\n");
  let inKeySection = false;

  for (const line of lines) {
    const trimmed = line.trim();

    // Detect start of answer key section
    if (/KUNCI\s+JAWABAN|KUNCI\s+JAWAB/i.test(trimmed)) {
      inKeySection = true;
      continue;
    }

    // Detect start of pembahasan (stop collecting keys)
    if (/PEMBAHASAN|Pembahasan/i.test(trimmed) && inKeySection) {
      inKeySection = false;
      continue;
    }

    if (inKeySection) {
      // Skip header rows
      if (/^No\b|^Kunci\b|^\d+\s*$/i.test(trimmed)) continue;
      if (trimmed.length < 2) continue;

      // Pattern: "1 B" or "1\tB" or "1. B" or "1 B\t2 C" (multi-column)
      const matches = trimmed.matchAll(/(\d+)\s*[.\s:\-–—]+\s*([A-Ea-e])/gi);
      for (const m of matches) {
        const num = m[1];
        const letter = m[2].toUpperCase();
        key[num] = letter;
      }

      // Also try: just "B" on a line that follows a number
      if (Object.keys(key).length === 0 || trimmed.match(/^\d+\s+[A-E]$/)) {
        const simple = trimmed.match(/^(\d+)\s+([A-E])$/i);
        if (simple) {
          key[simple[1]] = simple[2].toUpperCase();
        }
      }
    }
  }

  return key;
}

/* ── Extract a section between two headers ── */
function extractSection(text: string, startPattern: string, endPattern: string): string | null {
  const startIdx = text.indexOf(startPattern);
  if (startIdx === -1) return null;

  const afterStart = text.slice(startIdx);
  const endIdx = afterStart.indexOf(endPattern);

  if (endIdx === -1) return afterStart;
  return afterStart.slice(0, endIdx);
}

/* ── Split PG section into individual question blocks ── */
function splitPGQuestions(section: string): string[] {
  // Split by numbered questions: "1.", "2.", etc. at start of line
  const blocks = section
    .split(/\n\s*(?=\d+[\.)]\s+)/)
    .map((b) => b.trim())
    .filter((b) => b.length > 10 && /\d+[\.]/.test(b));

  return blocks;
}

/* ── Parse a single PG block (A-E options) ── */
function parsePGBlock(block: string): ParsedSoal | null {
  // Remove leading number
  let text = block.replace(/^\s*\d+[\.]\s*/, "").trim();

  // Extract options: A. ... through E. ...
  const options: string[] = [];
  const optionRegex = /\n\s*([A-E])\.\s+/g;
  const optionPositions: { letter: string; start: number }[] = [];

  let match;
  while ((match = optionRegex.exec(text)) !== null) {
    optionPositions.push({ letter: match[1].toUpperCase(), start: match.index });
  }

  if (optionPositions.length < 2) return null;

  // Extract question text (before first option)
  const questionEnd = optionPositions[0].start;
  const question = text.slice(0, questionEnd).replace(/\n/g, " ").trim();

  // Extract each option text
  for (let i = 0; i < optionPositions.length; i++) {
    const start = optionPositions[i].start + optionPositions[i].letter.length + 2; // skip "A. "
    const end = i < optionPositions.length - 1 ? optionPositions[i + 1].start : text.length;
    const optText = text.slice(start, end).replace(/\n/g, " ").trim();
    if (optText) options.push(optText);
  }

  if (question.length < 5 || options.length < 2) return null;

  return {
    question,
    options,
    answer: "",
    type: "Pilihan Ganda",
    difficulty: detectDifficulty(question, options),
  };
}

/* ── Extract question number from block ── */
function extractQuestionNumber(block: string): string | null {
  const m = block.match(/^\s*(\d+)[\.]/);
  return m ? m[1] : null;
}

/* ── Split essay section into individual questions ── */
function splitEssayQuestions(section: string): string[] {
  return section
    .split(/\n\s*(?=\d+[\.]\s+)/)
    .map((b) => b.trim())
    .filter((b) => b.length > 10 && /\d+[\.]/.test(b));
}

/* ── Parse a single essay block ── */
function parseEssayBlock(block: string): ParsedSoal | null {
  // Remove leading number
  let text = block.replace(/^\s*\d+[\.]\s*/, "").trim();

  // Remove "Jawab:" and following dots
  text = text.replace(/Jawab:\s*\.*/g, "").trim();

  // Cut at "Soal Isian" next marker or end
  const endIdx = text.search(/\nSoal\s+Isian\s+\d/);
  if (endIdx > 0) text = text.slice(0, endIdx).trim();

  // Remove dot patterns (blank lines for writing)
  text = text.replace(/\.{10,}/g, "").replace(/\n\s*\n/g, "\n").trim();

  if (text.length < 5) return null;

  return {
    question: text,
    options: [],
    answer: "",
    type: "Uraian",
    difficulty: detectDifficulty(text, []),
  };
}

/* ── Generic fallback parser ── */
function parseGenericText(text: string): ParsedSoal[] {
  const blocks = text
    .split(/\n\s*(?=\d+[\.)]\s+)/)
    .map((b) => b.trim())
    .filter((b) => b.length > 10);

  const questions: ParsedSoal[] = [];

  for (const block of blocks) {
    // Try PG first
    const pgMatch = block.match(/\n\s*([A-E])\.\s+/g);
    if (pgMatch && pgMatch.length >= 2) {
      const q = parsePGBlock(block);
      if (q) questions.push(q);
    } else {
      // Essay
      let text = block.replace(/^\s*\d+[\.]\s*/, "").trim();
      text = text.replace(/Jawab:\s*\.*/g, "").trim();
      text = text.replace(/\.{10,}/g, "").trim();
      if (text.length >= 5) {
        questions.push({
          question: text,
          options: [],
          answer: "",
          type: "Uraian",
          difficulty: detectDifficulty(text, []),
        });
      }
    }
  }

  return questions;
}

/* ── Auto-detect difficulty ── */
function detectDifficulty(question: string, options: string[]): "Mudah" | "Sedang" | "Sulit" {
  const len = question.length;
  const complexWords = /analisis|evaluasi|bandingkan|jelaskan|uraikan|kritik|sintesis|komparasi/i;
  if (complexWords.test(question) || len > 200) return "Sulit";
  if (len < 50 && options.length >= 4) return "Mudah";
  if (len > 100) return "Sedang";
  return "Sedang";
}

/* ═══════════════════════════════════════════
   FILE PARSERS
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

  const firstLine = lines[0];
  const delimiter =
    firstLine.split("\t").length > firstLine.split(",").length
      ? "\t"
      : firstLine.split(";").length > firstLine.split(",").length
        ? ";"
        : ",";

  const header = lines[0].toLowerCase();
  const hasHeader =
    header.includes("soal") || header.includes("question") || header.includes("mata pelajaran");

  const dataLines = hasHeader ? lines.slice(1) : lines;
  const questions: ParsedSoal[] = [];

  for (const line of dataLines) {
    const fields = parseCsvLine(line, delimiter);
    if (fields.length < 1) continue;

    const questionText = fields[0]?.trim();
    if (!questionText || questionText.length < 5) continue;

    const optionFields = fields.slice(1, 6).filter((f) => f && f.trim().length > 0);
    const isPG = optionFields.length >= 2;
    const options = isPG ? optionFields.map((f) => f.trim()) : [];
    const answer = isPG && fields.length > 6 ? fields[6]?.trim() : "";

    questions.push({
      question: questionText,
      options,
      answer: answer || "",
      type: isPG ? "Pilihan Ganda" : "Uraian",
      difficulty: detectDifficulty(questionText, options),
    });
  }

  return questions;
}

function parseCsvLine(line: string, delimiter: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
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
      format = "Teks (auto)";
      try {
        const text = await file.text();
        questions = parseTextContent(text);
      } catch {
        throw new Error(`Format file tidak dikenali (${file.name}). Gunakan .docx, .txt, atau .csv.`);
      }
  }

  const pgCount = questions.filter((q) => q.type === "Pilihan Ganda").length;
  const urCount = questions.filter((q) => q.type === "Uraian").length;
  const detectedType = pgCount > urCount ? "Pilihan Ganda" : urCount > pgCount ? "Uraian" : "Campuran";

  return { format, detectedType, questions };
}
