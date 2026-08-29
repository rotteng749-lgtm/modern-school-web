/* ═══════════════════════════════════════════
   DOCX IMPORT — Parse .docx for student data
   Extracts names + NISNs, generates credentials
   ═══════════════════════════════════════════ */

import mammoth from "mammoth";

export interface ParsedStudent {
  name: string;
  nisn: string;
  username: string;
  password: string;
}

/** Generate username from name: lowercase, no spaces, remove special chars */
function generateUsername(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, "")
    .slice(0, 15);
}

/** Generate random password: 8 chars, mixed case + numbers */
function generatePassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let pass = "";
  for (let i = 0; i < 8; i++) {
    pass += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pass;
}

/**
 * Parse a .docx file and extract student data.
 *
 * Expected format in the document:
 * - Each line has a name and optionally a NISN
 * - Patterns detected:
 *   1. "Nama Lengkap - NISN" (dash separated)
 *   2. "Nama Lengkap NISN" (space separated, NISN is numeric 8-10 digits)
 *   3. Table rows (mammoth converts tables to paragraphs)
 *   4. Just names (NISN auto-generated)
 */
export async function parseDocx(file: File): Promise<ParsedStudent[]> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  const text = result.value;

  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const students: ParsedStudent[] = [];
  let autoNisn = 1000000001; // starting auto NISN

  for (const line of lines) {
    // Skip header-like lines
    if (/^(no|nomor|nama|nisn|student|siswa|data|daftar|tabel|table)/i.test(line)) continue;
    if (/^[-=]+$/.test(line)) continue; // separator lines

    let name = "";
    let nisn = "";

    // Pattern 1: "Name - NISN" or "Name | NISN"
    const dashMatch = line.match(/^(.+?)\s*[-|]\s*(\d{6,12})\s*$/);
    if (dashMatch) {
      name = dashMatch[1].trim();
      nisn = dashMatch[2];
    } else {
      // Pattern 2: "Name NISN" (NISN at end, 8-12 digits)
      const spaceMatch = line.match(/^(.+?)\s+(\d{8,12})\s*$/);
      if (spaceMatch) {
        name = spaceMatch[1].trim();
        nisn = spaceMatch[2];
      } else {
        // Pattern 3: Just a name (no NISN)
        name = line.replace(/^\d+[\.\)\s]+/, "").trim(); // remove leading numbers like "1. "
        nisn = String(autoNisn++);
      }
    }

    // Validate name (at least 2 chars, not just numbers)
    if (name.length >= 2 && !/^\d+$/.test(name)) {
      students.push({
        name,
        nisn,
        username: generateUsername(name),
        password: generatePassword(),
      });
    }
  }

  return students;
}
