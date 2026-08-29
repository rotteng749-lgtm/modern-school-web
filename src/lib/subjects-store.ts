/* ═══════════════════════════════════════════
   SUBJECTS STORE — Dynamic mata pelajaran
   ═══════════════════════════════════════════ */

const STORAGE_KEY = "msw-subjects";

const DEFAULT_SUBJECTS = [
  "Al-Qur'an & Hadis",
  "Fiqih",
  "Akidah Akhlak",
  "Sejarah Kebudayaan Islam",
  "Bahasa Arab",
  "Matematika",
  "Bahasa Indonesia",
  "Bahasa Inggris",
  "IPA",
  "IPS",
  "PJOK",
  "Informatika",
  "Seni Budaya",
  "Prakarya",
];

export function getSubjects(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return [...DEFAULT_SUBJECTS];
}

export function saveSubjects(list: string[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export function addSubject(name: string): boolean {
  const list = getSubjects();
  if (list.some((s) => s.toLowerCase() === name.toLowerCase())) return false;
  list.push(name);
  saveSubjects(list);
  return true;
}

export function removeSubject(name: string): void {
  saveSubjects(getSubjects().filter((s) => s !== name));
}

export function renameSubject(oldName: string, newName: string): boolean {
  const list = getSubjects();
  if (list.some((s) => s.toLowerCase() === newName.toLowerCase() && s !== oldName)) return false;
  const idx = list.indexOf(oldName);
  if (idx >= 0) list[idx] = newName;
  saveSubjects(list);
  return true;
}

export function initSubjects(): void {
  if (!localStorage.getItem(STORAGE_KEY)) saveSubjects(DEFAULT_SUBJECTS);
}
