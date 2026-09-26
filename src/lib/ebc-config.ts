/* ═══════════════════════════════════════════
   Format config lokal EBC (bagian 4 kontrak)
   ───────────────────────────────────────────
   Inilah yang dibaca client ketika siswa scan QR
   atau membuka file .cbt. Isinya JSON dengan
   nama field PERSIS seperti di kontrak — jangan
   diubah, karena client memvalidasi nama fieldnya.
   ═══════════════════════════════════════════ */

export interface EbcLocalConfig {
  url: string;
  logo: string;
  nama_ujian: string;
  nama_sekolah: string;
  custom_ua_status: boolean;
  custom_ua: string;
  timer_status: boolean;
  timer: number;
  start_time: string;
  end_time: string;
  msg_status: boolean;
  msg: string;
  token_masuk_status: boolean;
  token_masuk: string;
  token_keluar_status: boolean;
  token_keluar: string;
  link_keluar_status: boolean;
  link_keluar: string;
  allow_copy_paste: boolean;
  allow_screenshoot: boolean;
  clear_cache: boolean;
  safe_config: boolean;
}

/** Default paling aman: timer + kunci layar aktif, copy/paste & screenshot mati. */
export const DEFAULT_CBT_CONFIG: EbcLocalConfig = {
  url: "",
  logo: "",
  nama_ujian: "",
  nama_sekolah: "",
  custom_ua_status: false,
  custom_ua: "",
  timer_status: true,
  timer: 60,
  start_time: "07:00",
  end_time: "09:00",
  msg_status: true,
  msg: "Kerjakan dengan teliti. Keluar dari aplikasi akan tercatat.",
  token_masuk_status: false,
  token_masuk: "",
  token_keluar_status: false,
  token_keluar: "",
  link_keluar_status: false,
  link_keluar: "",
  allow_copy_paste: false,
  allow_screenshoot: false,
  clear_cache: true,
  safe_config: false,
};

type ExamItemLike = {
  url?: string;
  cbtUrl?: string;
  logoUrl?: string;
  schoolName?: string;
  examName?: string;
  customUa?: string;
  timerEnabled?: boolean;
  timerMinutes?: number;
  startTime?: string;
  endTime?: string;
  welcomeMsg?: string;
  tokenInEnabled?: boolean;
  tokenIn?: string;
  tokenOut?: string;
  linkOut?: string;
  copyPasteEnabled?: boolean;
  screenshotEnabled?: boolean;
  clearCacheEnabled?: boolean;
};

type SchoolInfoLike = { name?: string; logo_url?: string };

/** Susun config dari ExamItem (hasil endpoint x=exams) + branding sekolah. */
export function configFromExamItem(
  exam: ExamItemLike,
  school?: SchoolInfoLike | null,
): EbcLocalConfig {
  return {
    ...DEFAULT_CBT_CONFIG,
    url: exam.url || exam.cbtUrl || "",
    logo: exam.logoUrl || school?.logo_url || "",
    nama_ujian: exam.examName ?? "",
    nama_sekolah: exam.schoolName || school?.name || "",
    custom_ua_status: !!exam.customUa,
    custom_ua: exam.customUa ?? "",
    timer_status: exam.timerEnabled ?? true,
    timer: exam.timerMinutes ?? 60,
    start_time: exam.startTime || "07:00",
    end_time: exam.endTime || "09:00",
    msg_status: !!exam.welcomeMsg,
    msg: exam.welcomeMsg ?? "",
    token_masuk_status: !!exam.tokenInEnabled,
    token_masuk: exam.tokenIn ?? "",
    token_keluar_status: !!exam.tokenOut,
    token_keluar: exam.tokenOut ?? "",
    link_keluar_status: !!exam.linkOut,
    link_keluar: exam.linkOut ?? "",
    allow_copy_paste: exam.copyPasteEnabled ?? false,
    allow_screenshoot: exam.screenshotEnabled ?? false,
    clear_cache: exam.clearCacheEnabled ?? true,
  };
}

/** Isi QR = config JSON (client mem-parse sendiri). */
export function configPayloadJson(config: EbcLocalConfig): string {
  return JSON.stringify(config);
}

/** Unduh sebagai file .cbt (JSON polos, ekstensi .cbt). */
export function downloadCbtFile(config: EbcLocalConfig, filename = "ujian.cbt"): void {
  const blob = new Blob([JSON.stringify(config, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".cbt") ? filename : `${filename}.cbt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  // Beri waktu browser memulai unduhan sebelum blob dicabut
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Validasi ringan sebelum config dikirim atau di-encode jadi QR. */
export function validateCbtConfig(config: EbcLocalConfig): string[] {
  const errors: string[] = [];
  if (!config.url) errors.push("URL ujian wajib diisi.");
  else if (!/^https?:\/\//i.test(config.url)) {
    errors.push("URL ujian harus diawali http:// atau https://");
  }
  if (!config.nama_ujian) errors.push("Nama ujian wajib diisi.");
  if (!config.nama_sekolah) errors.push("Nama sekolah wajib diisi.");
  if (config.timer_status && config.timer <= 0) {
    errors.push("Timer harus lebih dari 0 menit.");
  }
  if (config.token_masuk_status && !config.token_masuk) {
    errors.push("Token masuk aktif tapi kode tokennya kosong.");
  }
  if (config.link_keluar_status && !config.link_keluar) {
    errors.push("Link keluar aktif tapi URL-nya kosong.");
  }
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(config.start_time)) {
    errors.push("Jam mulai harus format 24 jam (HH:MM).");
  }
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(config.end_time)) {
    errors.push("Jam selesai harus format 24 jam (HH:MM).");
  }
  return errors;
}
