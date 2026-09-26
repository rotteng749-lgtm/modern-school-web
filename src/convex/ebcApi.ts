import { v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";
import type { GenericQueryCtx, GenericMutationCtx } from "convex/server";
import type { DataModel } from "./_generated/dataModel";
import { hashPassword, safeEqual } from "./password";

/* ═══════════════════════════════════════════
   EBC HTTP API — data layer
   ───────────────────────────────────────────
   Semua fungsi di sini `internal*` supaya TIDAK
   bisa dipanggil langsung dari browser. Satu-satunya
   jalan masuk adalah src/convex/http.ts yang sudah
   memvalidasi X-API-KEY.

   Kontrak respons (baku, semua endpoint):
     { "status": true|false, "message": "...", "data": { ... } }

   PENTING: base URL + API key di sini milik kita
   sendiri. Jangan pernah memakai key EBC asli.
   ═══════════════════════════════════════════ */

/* ── Validasi API key ── */
export const authenticateApiKey = internalQuery({
  args: { key: v.string() },
  handler: async (ctx, args) => {
    if (!args.key) return { ok: false, schoolCode: null };
    const row = await ctx.db
      .query("apiKeys")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .unique();
    if (!row) return { ok: false, schoolCode: null };
    if (row.active === false) return { ok: false, schoolCode: null };
    return { ok: true, schoolCode: row.schoolCode ?? null };
  },
});

/* ── Helpers pemetaan ke bentuk kontrak ── */

function stableId(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) % 100000 + 1;
}

type SchoolDoc = {
  _id: unknown;
  code: string;
  name: string;
  username: string;
  packageName?: string;
  examName?: string;
  academicYear?: string;
  institutionType?: string;
  city?: string;
  province?: string;
  logoUrl?: string;
  backgroundUrl?: string;
  splashUrl?: string;
  splashTextColor?: string;
  isPro?: boolean;
  proType?: string;
  proExpiresAt?: string;
  msg?: string;
};

function toSchoolInfo(s: SchoolDoc, activeExams: number) {
  const expires = s.proExpiresAt ? new Date(s.proExpiresAt).getTime() : NaN;
  const proDaysLeft = Number.isFinite(expires)
    ? Math.max(0, Math.ceil((expires - Date.now()) / 86_400_000))
    : 0;
  return {
    id: stableId(s.code),
    code: s.code,
    name: s.name,
    username: s.username,
    package_name: s.packageName ?? "",
    exam_name: s.examName ?? s.name,
    academic_year: s.academicYear ?? "",
    institution_type: s.institutionType ?? "",
    city: s.city ?? "",
    province: s.province ?? "",
    logo_url: s.logoUrl ?? "",
    background_url: s.backgroundUrl ?? "",
    splash_url: s.splashUrl ?? "",
    splash_text_color: s.splashTextColor ?? "#FFFFFF",
    is_pro: s.isPro ?? false,
    pro_type: s.proType ?? "",
    pro_days_left: proDaysLeft,
    pro_expires_at: s.proExpiresAt ?? "",
    msg: s.msg ?? "",
    active_exams: activeExams,
  };
}

type ExamDoc = {
  _id: unknown;
  name: string;
  subject: string;
  className: string;
  date: string;
  startTime: string;
  endTime: string;
  schoolCode?: string;
  classId?: number;
  cbtUrl?: string;
  url?: string;
  schoolName?: string;
  logoUrl?: string;
  customUa?: string;
  timerEnabled?: boolean;
  timerMinutes?: number;
  tokenInEnabled?: boolean;
  tokenIn?: string;
  tokenOut?: string;
  linkOut?: string;
  welcomeMsg?: string;
  clearCacheEnabled?: boolean;
  screenshotEnabled?: boolean;
  pinScreenEnabled?: boolean;
  copyPasteEnabled?: boolean;
  timeRestrictionEnabled?: boolean;
  txtColor?: string;
  btnColor?: string;
  active: boolean;
};

/** ExamItem — bagian 3.3 kontrak. Semua toggle kiosk ikut. */
function toExamItem(e: ExamDoc, school: SchoolDoc, classId: number) {
  return {
    id: stableId(String(e._id)),
    examName: e.name,
    cbtUrl: e.cbtUrl ?? "",
    url: e.url ?? e.cbtUrl ?? "",
    schoolName: e.schoolName ?? school.name,
    logoUrl: e.logoUrl ?? school.logoUrl ?? "",
    customUa: e.customUa ?? "",
    timerEnabled: e.timerEnabled ?? true,
    timerMinutes: e.timerMinutes ?? 60,
    tokenInEnabled: e.tokenInEnabled ?? false,
    tokenIn: e.tokenIn ?? "",
    tokenOut: e.tokenOut ?? "",
    linkOut: e.linkOut ?? "",
    welcomeMsg: e.welcomeMsg ?? "",
    classId,
    className: e.className,
    clearCacheEnabled: e.clearCacheEnabled ?? true,
    // Default AMAN: blokir screenshot & copy/paste
    screenshotEnabled: e.screenshotEnabled ?? false,
    pinScreenEnabled: e.pinScreenEnabled ?? true,
    copyPasteEnabled: e.copyPasteEnabled ?? false,
    timeRestrictionEnabled: e.timeRestrictionEnabled ?? true,
    startTime: e.startTime,
    endTime: e.endTime,
    txtColor: e.txtColor ?? "#FFFFFF",
    btnColor: e.btnColor ?? "#1E88E5",
  };
}

type Db = GenericQueryCtx<DataModel>["db"] | GenericMutationCtx<DataModel>["db"];

async function findSchoolByCode(db: Db, code: string) {
  return db
    .query("schools")
    .withIndex("by_code", (q) => q.eq("code", code))
    .unique();
}

async function findSchoolByUsername(db: Db, username: string) {
  return db
    .query("schools")
    .withIndex("by_username", (q) => q.eq("username", username))
    .unique();
}

async function examsForSchool(db: Db, schoolCode: string): Promise<ExamDoc[]> {
  const all = await db.query("ebcExams").collect();
  // Ujian lama belum punya schoolCode — tetap ditampilkan agar tidak "hilang"
  return all.filter((e) => !e.schoolCode || e.schoolCode === schoolCode) as unknown as ExamDoc[];
}

async function classIdFor(db: Db, schoolCode: string, className: string): Promise<number> {
  const classes = await db
    .query("schoolClasses")
    .withIndex("by_school", (q) => q.eq("schoolCode", schoolCode))
    .collect();
  const sorted = classes.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  const idx = sorted.findIndex((c) => c.name === className);
  return idx >= 0 ? idx + 1 : 0;
}

/* ═══════════════════════════════════════════
   config  (code= atau username=)
   ═══════════════════════════════════════════ */
async function buildConfigData(db: Db, school: SchoolDoc) {
  const exams = await examsForSchool(db, school.code);
  const activeExams = exams.filter((e) => e.active).length;

  const allAnnouncements = await db
    .query("announcements")
    .withIndex("by_school", (q) => q.eq("schoolCode", school.code))
    .collect();
  const sortedAnn = [...allAnnouncements].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

  const calendar = await db
    .query("calendarEvents")
    .withIndex("by_school", (q) => q.eq("schoolCode", school.code))
    .collect();

  const menus = await db
    .query("customMenus")
    .withIndex("by_school", (q) => q.eq("schoolCode", school.code))
    .collect();
  const sortedMenus = [...menus].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

  return {
    school: toSchoolInfo(school, activeExams),
    app_features: {
      show_input_url: true,
      show_scan_qr: true,
      show_input_file_config: true,
      show_create_config: true,
    },
    sliders: sortedAnn
      .filter((a) => a.isSlider)
      .map((a, i) => ({
        id: i + 1,
        title: a.title,
        image_url: a.imageUrl ?? "",
        content: a.content,
        sortOrder: a.sortOrder ?? i + 1,
      })),
    upcoming_calendar: calendar.map((c, i) => ({
      id: i + 1,
      title: c.title,
      startDate: c.startDate,
      endDate: c.endDate ?? "",
      type: c.type ?? "",
      description: c.description ?? "",
      categoryName: c.categoryName ?? "",
      categoryColor: c.categoryColor ?? "",
      categoryIcon: c.categoryIcon ?? "",
    })),
    menus: sortedMenus.map((m, i) => ({
      id: i + 1,
      title: m.title,
      type: m.type ?? "",
      slug: m.slug ?? "",
      url: m.url ?? "",
      iconType: m.iconType ?? "",
      iconValue: m.iconValue ?? "",
      buttonColor: m.buttonColor ?? "",
      textColor: m.textColor ?? "",
      sortOrder: m.sortOrder ?? i + 1,
    })),
    app_downloads: { playstore_url: "", appstore_url: "" },
  };
}

export const configByCode = internalQuery({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    const school = (await findSchoolByCode(ctx.db, args.code)) as SchoolDoc | null;
    if (!school) return null;
    return buildConfigData(ctx.db, school);
  },
});

export const configByUsername = internalQuery({
  args: { username: v.string() },
  handler: async (ctx, args) => {
    const school = (await findSchoolByUsername(ctx.db, args.username)) as SchoolDoc | null;
    if (!school) return null;
    return buildConfigData(ctx.db, school);
  },
});

/* ═══════════════════════════════════════════
   exams
   ═══════════════════════════════════════════ */
export const examsForSchoolCode = internalQuery({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    const school = (await findSchoolByCode(ctx.db, args.code)) as SchoolDoc | null;
    if (!school) return null;
    const exams = (await examsForSchool(ctx.db, school.code)).filter((e) => e.active);
    const items = [];
    for (const e of exams) {
      const cid = e.classId ?? (await classIdFor(ctx.db, school.code, e.className));
      items.push(toExamItem(e, school, cid));
    }
    return items;
  },
});

/* ═══════════════════════════════════════════
   announcements / calendar / menus
   ═══════════════════════════════════════════ */
export const announcementsForSchool = internalQuery({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    const rows = await ctx.db
      .query("announcements")
      .withIndex("by_school", (q) => q.eq("schoolCode", args.code))
      .collect();
    return [...rows]
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
      .map((a, i) => ({
        id: i + 1,
        title: a.title,
        content: a.content,
        image_url: a.imageUrl ?? "",
        is_slider: a.isSlider ?? false,
        sortOrder: a.sortOrder ?? i + 1,
      }));
  },
});

export const calendarForSchool = internalQuery({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    const rows = await ctx.db
      .query("calendarEvents")
      .withIndex("by_school", (q) => q.eq("schoolCode", args.code))
      .collect();
    return rows.map((c, i) => ({
      id: i + 1,
      title: c.title,
      startDate: c.startDate,
      endDate: c.endDate ?? "",
      type: c.type ?? "",
      description: c.description ?? "",
      categoryName: c.categoryName ?? "",
      categoryColor: c.categoryColor ?? "",
      categoryIcon: c.categoryIcon ?? "",
    }));
  },
});

export const menusForSchool = internalQuery({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    const rows = await ctx.db
      .query("customMenus")
      .withIndex("by_school", (q) => q.eq("schoolCode", args.code))
      .collect();
    return [...rows]
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
      .map((m, i) => ({
        id: i + 1,
        title: m.title,
        type: m.type ?? "",
        slug: m.slug ?? "",
        url: m.url ?? "",
        iconType: m.iconType ?? "",
        iconValue: m.iconValue ?? "",
        buttonColor: m.buttonColor ?? "",
        textColor: m.textColor ?? "",
        sortOrder: m.sortOrder ?? i + 1,
      }));
  },
});

/* ═══════════════════════════════════════════
   page  (slug= & code=)
   ═══════════════════════════════════════════ */
export const pageBySlug = internalQuery({
  args: { code: v.string(), slug: v.string() },
  handler: async (ctx, args) => {
    const school = (await findSchoolByCode(ctx.db, args.code)) as SchoolDoc | null;
    if (!school) return null;
    const rows = await ctx.db
      .query("pages")
      .withIndex("by_school", (q) => q.eq("schoolCode", args.code))
      .collect();
    const sorted = [...rows].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    const idx = sorted.findIndex((p) => p.slug === args.slug);
    if (idx < 0) return null;
    const p = sorted[idx];
    const exams = await examsForSchool(ctx.db, school.code);

    return {
      school: toSchoolInfo(school, exams.filter((e) => e.active).length),
      page: {
        id: idx + 1,
        title: p.title,
        slug: p.slug,
        content: p.content,
        updatedAt: p.updatedAt ?? "",
        buttonColor: p.buttonColor ?? "",
        iconType: p.iconType ?? "",
        iconValue: p.iconValue ?? "",
        textColor: p.textColor ?? "",
        sortOrder: p.sortOrder ?? idx + 1,
      },
    };
  },
});

/* ═══════════════════════════════════════════
   register_device  (POST form-urlencoded)
   ═══════════════════════════════════════════ */
export const registerDevice = internalMutation({
  args: {
    schoolCode: v.string(),
    deviceId: v.string(),
    username: v.optional(v.string()),
    platform: v.optional(v.string()),
    appVersion: v.optional(v.string()),
    installSource: v.optional(v.string()),
    packageName: v.optional(v.string()),
    signature: v.optional(v.string()),
    token: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (!args.deviceId) throw new Error("X-Device-ID wajib diisi.");
    const school = await findSchoolByCode(ctx.db, args.schoolCode);
    if (!school) throw new Error("Kode sekolah tidak dikenal.");

    const now = Date.now();
    const existing = await ctx.db
      .query("devices")
      .withIndex("by_device_id", (q) => q.eq("deviceId", args.deviceId))
      .unique();

    const payload = {
      deviceId: args.deviceId,
      schoolCode: args.schoolCode,
      username: args.username,
      platform: args.platform,
      appVersion: args.appVersion,
      installSource: args.installSource,
      packageName: args.packageName,
      signature: args.signature,
      token: args.token,
    };

    if (existing) {
      await ctx.db.patch(existing._id, { ...payload, lastSeen: now });
      return { registered: true, updated: true, firstSeen: existing.firstSeen };
    }

    await ctx.db.insert("devices", { ...payload, firstSeen: now, lastSeen: now });
    return { registered: true, updated: false, firstSeen: now };
  },
});

/* ═══════════════════════════════════════════
   verify_violation_reset
   ═══════════════════════════════════════════ */
export const verifyViolationReset = internalMutation({
  args: { schoolCode: v.string(), resetCode: v.string() },
  handler: async (ctx, args) => {
    const code = args.resetCode.trim().toUpperCase();
    if (!code) return { ok: false, reason: "reset_code kosong" };

    const row = await ctx.db
      .query("violationResets")
      .withIndex("by_code_reset", (q) =>
        q.eq("schoolCode", args.schoolCode).eq("resetCode", code),
      )
      .unique();
    if (!row) return { ok: false, reason: "kode tidak ditemukan" };
    if (row.used) return { ok: false, reason: "kode sudah pernah dipakai" };
    if (row.expiresAt < Date.now()) return { ok: false, reason: "kode sudah kedaluwarsa" };

    await ctx.db.patch(row._id, { used: true });
    return { ok: true, reason: "OK", resetCode: code };
  },
});

/* ═══════════════════════════════════════════
   Verifikasi akun murid (dipakai layer HTTP)
   Password dicek terhadap hash PBKDF2; fallback
   ke plaintext hanya untuk row lama.
   ═══════════════════════════════════════════ */
export const verifyStudentForApi = internalQuery({
  args: { username: v.string(), password: v.string(), schoolCode: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const username = args.username.trim().toLowerCase();
    if (!username) return null;
    const student = await ctx.db
      .query("ebcStudents")
      .withIndex("by_username", (q) => q.eq("username", username))
      .unique();
    if (!student || !student.active) return null;

    let ok = false;
    if (student.passwordHash && student.passwordSalt) {
      const computed = await hashPassword(args.password, student.passwordSalt);
      ok = safeEqual(computed, student.passwordHash);
    } else if (student.password) {
      // Baris lama yang belum di-republish
      ok = safeEqual(args.password, student.password);
    }
    if (!ok) return null;

    return {
      username: student.username,
      name: student.name,
      className: student.className ?? "",
    };
  },
});
