/* ═══════════════════════════════════════════
   SOAL IMPORT — Auto-detect file format
   Supports: .docx (mammoth), .txt, .csv
   Handles: A-E options, answer key tables, essay, pembahasan
   ═══════════════════════════════════════════ */

import mammoth from "mammoth";

export interface ParsedSoal {
  question: string;
  options: string[];    // A-E (empty for uraian)
  answer: string;       // jawaban benar
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
   MAIN PARSER
   ═══════════════════════════════════════════ */

function parseTextContent(text: string): ParsedSoal[] {
  const normalized = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  // Step 1: Extract ALL answer keys from entire text (multiple sources)
  const answerKey = extractAllAnswerKeys(normalized);

  // Step 2: Split into sections
  const pgSection = extractSection(normalized, "BAGIAN I", "BAGIAN II");
  const essaySection = extractSection(normalized, "BAGIAN II", "BAGIAN III");

  const questions: ParsedSoal[] = [];

  // Step 3: Parse PG questions (A-E)
  if (pgSection) {
    const pgBlocks = splitQuestions(pgSection);
    for (const block of pgBlocks) {
      const q = parsePGBlock(block);
      if (q) {
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
    const essayBlocks = splitQuestions(essaySection);
    for (const block of essayBlocks) {
      const q = parseEssayBlock(block);
      if (q) {
        // Also check if pembahasan has answer for essay
        const num = extractQuestionNumber(block);
        if (num && answerKey[`essay_${num}`]) {
          q.answer = answerKey[`essay_${num}`];
        }
        questions.push(q);
      }
    }
  }

  // Fallback: no section headers found, parse generically
  if (questions.length === 0) {
    return parseGenericText(normalized, answerKey);
  }

  return questions;
}

/* ═══════════════════════════════════════════
   ANSWER KEY EXTRACTION — Multiple strategies
   ═══════════════════════════════════════════ */

function extractAllAnswerKeys(text: string): Record<string, string> {
  const key: Record<string, string> = {};

  // Strategy 1: Table format — "1 B" or "1\tB" or "1. B" (multi-column)
  extractTableKeys(text, key);

  // Strategy 2: "Soal N [Kunci: X]" format from pembahasan
  extractPembahasanKeys(text, key);

  // Strategy 3: "N. X" or "N) X" format
  extractSimpleKeys(text, key);

  // Strategy 4: Answer key labeled "Jawaban:" or "Kunci:" per question
  extractInlineKeys(text, key);

  return key;
}

/** Strategy 1: Multi-column table — "1 B 6 C 11 A" */
function extractTableKeys(text: string, key: Record<string, string>) {
  const lines = text.split("\n");
  let inKeySection = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Detect start of answer key section
    if (/KUNCI\s+JAWABAN|KUNCI\s+JAWAB|JAWABAN\s+BENAR/i.test(trimmed)) {
      inKeySection = true;
      continue;
    }

    // Detect end of answer key section
    if (/PEMBAHASAN|PEMBAHASAN\s+DETIL|BAGIAN\s+III\s*:/i.test(trimmed) && inKeySection) {
      inKeySection = false;
      continue;
    }

    if (!inKeySection) continue;

    // Skip headers like "No\tKunci" or "No. Kunci"
    if (/^No[\s.:]/i.test(trimmed)) continue;
    if (/^Kunci[\s.:]/i.test(trimmed)) continue;
    if (trimmed.length < 3) continue;

    // Match multi-column: "1 B 6 C 11 A" or "1\tB\t6\tC"
    const matches = trimmed.matchAll(/(\d+)\s*[.\s:\-–—]+\s*([A-Ea-e])/gi);
    for (const m of matches) {
      const num = m[1];
      const letter = m[2].toUpperCase();
      // Only store PG answers (1-100 range), skip if already set by more reliable source
      if (parseInt(num) <= 200 && !key[num]) {
        key[num] = letter;
      }
    }
  }
}

/** Strategy 2: "Soal 1 [Kunci: B]:" from pembahasan */
function extractPembahasanKeys(text: string, key: Record<string, string>) {
  // Pattern: "Soal 1 [Kunci: B]:" or "Soal 1 [Kunci:B]"
  const soalKunci = text.matchAll(/Soal\s+(\d+)\s*\[Kunci:\s*([A-Ea-e])\]/gi);
  for (const m of soalKunci) {
    const num = m[1];
    const letter = m[2].toUpperCase();
    if (!key[num]) {
      key[num] = letter;
    }
  }

  // Also: "Soal Isian N:" — mark as essay
  const soalIsian = text.matchAll(/Soal\s+Isian\s+(\d+)/gi);
  for (const m of soalIsian) {
    key[`essay_${m[1]}`] = "essay";
  }
}

/** Strategy 3: Simple "N. X" or "N) X" format */
function extractSimpleKeys(text: string, key: Record<string, string>) {
  // Look for patterns like "1. B" or "1) B" that appear in lines
  const matches = text.matchAll(/(?:^|\s)(\d{1,3})\s*[.)]\s*([A-Ea-e])\b/gm);
  for (const m of matches) {
    const num = m[1];
    const letter = m[2].toUpperCase();
    if (parseInt(num) <= 200 && !key[num]) {
      key[num] = letter;
    }
  }
}

/** Strategy 4: "Jawaban: A" or "Kunci: B" inline */
function extractInlineKeys(text: string, key: Record<string, string>) {
  const matches = text.matchAll(/(?:Jawaban|Kunci|Answer)\s*[:=]\s*([A-Ea-e])\b/gi);
  let idx = 1;
  for (const m of matches) {
    const letter = m[1].toUpperCase();
    if (!key[String(idx)]) {
      key[String(idx)] = letter;
    }
    idx++;
  }
}

/* ═══════════════════════════════════════════
   SECTION & QUESTION PARSING
   ═══════════════════════════════════════════ */

/** Extract section between two headers */
function extractSection(text: string, startPattern: string, endPattern: string): string | null {
  const startIdx = text.indexOf(startPattern);
  if (startIdx === -1) return null;

  const afterStart = text.slice(startIdx);
  const endIdx = afterStart.indexOf(endPattern);

  if (endIdx === -1) return afterStart;
  return afterStart.slice(0, endIdx);
}

/** Split section into individual question blocks */
function splitQuestions(section: string): string[] {
  return section
    .split(/\n\s*(?=\d+[\.)]\s+)/)
    .map((b) => b.trim())
    .filter((b) => b.length > 10 && /\d+[\.]/.test(b));
}

/** Parse a single PG block (A-E options) */
function parsePGBlock(block: string): ParsedSoal | null {
  // Remove leading number
  let text = block.replace(/^\s*\d+[\.)]\s*/, "").trim();

  // Extract options: A. ... through E. ...
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
  const options: string[] = [];
  for (let i = 0; i < optionPositions.length; i++) {
    const start = optionPositions[i].start + optionPositions[i].letter.length + 2;
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

/** Extract question number from block */
function extractQuestionNumber(block: string): string | null {
  const m = block.match(/^\s*(\d+)[\.]/);
  return m ? m[1] : null;
}

/** Parse a single essay block */
function parseEssayBlock(block: string): ParsedSoal | null {
  let text = block.replace(/^\s*\d+[\.)]\s*/, "").trim();

  // Remove "Jawab:" and following dots/underscores
  text = text.replace(/Jawab:\s*[.\s_]*/g, "").trim();

  // Cut at next "Soal Isian" marker
  const endIdx = text.search(/\nSoal\s+Isian\s+\d/);
  if (endIdx > 0) text = text.slice(0, endIdx).trim();

  // Remove dot/underscore patterns (blank lines for writing)
  text = text.replace(/[._]{5,}/g, "").replace(/\n\s*\n/g, "\n").trim();

  if (text.length < 5) return null;

  return {
    question: text,
    options: [],
    answer: "",
    type: "Uraian",
    difficulty: detectDifficulty(text, []),
  };
}

/** Generic fallback parser — no section headers */
function parseGenericText(text: string, answerKey: Record<string, string>): ParsedSoal[] {
  const blocks = text
    .split(/\n\s*(?=\d+[\.)]\s+)/)
    .map((b) => b.trim())
    .filter((b) => b.length > 10);

  const questions: ParsedSoal[] = [];

  for (const block of blocks) {
    const pgMatch = block.match(/\n\s*([A-E])\.\s+/g);
    if (pgMatch && pgMatch.length >= 2) {
      const q = parsePGBlock(block);
      if (q) {
        const num = extractQuestionNumber(block);
        if (num && answerKey[num]) {
          q.answer = answerKey[num];
        }
        questions.push(q);
      }
    } else {
      let t = block.replace(/^\s*\d+[\.)]\s*/, "").trim();
      t = t.replace(/Jawab:\s*[.\s_]*/g, "").trim();
      t = t.replace(/[._]{5,}/g, "").trim();
      if (t.length >= 5) {
        const num = extractQuestionNumber(block);
        questions.push({
          question: t,
          options: [],
          answer: "",
          type: "Uraian",
          difficulty: detectDifficulty(t, []),
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

async function parseDocx(file: File): Promise<ParsedSoal[]> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return parseTextContent(result.value);
}

async function parseTxt(file: File): Promise<ParsedSoal[]> {
  const text = await file.text();
  return parseTextContent(text);
}

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
