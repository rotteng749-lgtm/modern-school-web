import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { GenericDatabaseReader } from "convex/server";
import type { DataModel } from "./_generated/dataModel";

/* ═══════════════════════════════════════════
   EBC — admin/CRUD untuk layer HTTP
   ───────────────────────────────────────────
   Semua fungsi WAJIB diberi `apiKey`. Tanpa itu
   siapa pun yang tahu URL deployment bisa menulis
   ke database. API key disimpan guru di perangkatnya
   (localStorage) dan dikirim saat publish.

   Catatan: `ensureBootstrap` sengaja tidak butuh key
   karena harus bisa jalan saat database masih kosong —
   setelah itu semua fungsi lain terkunci.
   ═══════════════════════════════════════════ */

/** Cukup tipe db-nya saja — berlaku untuk query maupun mutation ctx. */
async function requireKey(ctx: { db: GenericDatabaseReader<DataModel> }, apiKey: string) {
  if (!apiKey) throw new Error("API key wajib diisi.");
  const row = await ctx.db
    .query("apiKeys")
    .withIndex("by_key", (q) => q.eq("key", apiKey))
    .unique();
  if (!row) throw new Error("API key tidak valid.");
  if (row.active === false) throw new Error("API key sudah dinonaktifkan.");
  return row;
}

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function randomCode(len: number): string {
  let out = "";
  for (let i = 0; i < len; i++) {
    out += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  }
  return out;
}

function randomKey(): string {
  return `ymh_${randomCode(8).toLowerCase()}_${randomCode(12).toLowerCase()}`;
}

/* ═══════════════════════════════════════════
   Bootstrap — sekali jalan, lalu terkunci
   ═══════════════════════════════════════════ */
export const ensureBootstrap = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("schools").collect();
    if (existing.length > 0) {
      return { created: false, reason: "Database sudah terisi." };
    }

    const code = "YMH";
    const key = randomKey();

    await ctx.db.insert("schools", {
      code,
      name: "Yayasan Mambaul Hasan",
      username: "ymh",
      packageName: "com.ymh.ebc",
      examName: "Ujian CBT",
      academicYear: "2025/2026",
      institutionType: "MI / Pesantren",
      city: "Batur Gading",
      province: "Jawa Timur",
      isPro: true,
      proType: "school",
      proExpiresAt: "2026-12-31",
      createdAt: Date.now(),
    });

    await ctx.db.insert("apiKeys", {
      key,
      schoolCode: code,
      label: "Kunci default",
      active: true,
      createdAt: Date.now(),
    });

    await ctx.db.insert("schoolClasses", {
      schoolCode: code,
      code: "MI6",
      name: "MI Kelas 6",
      sortOrder: 1,
    });

    return { created: true, schoolCode: code, apiKey: key };
  },
});

/* ═══════════════════════════════════════════
   Sekolah
   ═══════════════════════════════════════════ */
export const listSchools = query({
  args: { apiKey: v.string() },
  handler: async (ctx, args) => {
    await requireKey(ctx, args.apiKey);
    const schools = await ctx.db.query("schools").collect();
    const counts = await ctx.db.query("ebcExams").collect();
    return schools.map((s) => ({
      ...s,
      examCount: counts.filter((e) => e.schoolCode === s.code).length,
    }));
  },
});

const schoolValidator = v.object({
  code: v.string(),
  name: v.string(),
  username: v.string(),
  packageName: v.optional(v.string()),
  examName: v.optional(v.string()),
  academicYear: v.optional(v.string()),
  institutionType: v.optional(v.string()),
  city: v.optional(v.string()),
  province: v.optional(v.string()),
  logoUrl: v.optional(v.string()),
  backgroundUrl: v.optional(v.string()),
  splashUrl: v.optional(v.string()),
  splashTextColor: v.optional(v.string()),
  isPro: v.optional(v.boolean()),
  proType: v.optional(v.string()),
  proExpiresAt: v.optional(v.string()),
  msg: v.optional(v.string()),
});

export const saveSchool = mutation({
  args: { apiKey: v.string(), school: schoolValidator },
  handler: async (ctx, args) => {
    await requireKey(ctx, args.apiKey);
    const code = args.school.code.trim().toUpperCase();
    if (!code) throw new Error("Kode sekolah wajib diisi.");
    const username = args.school.username.trim().toLowerCase();
    if (!username) throw new Error("Username sekolah wajib diisi.");

    // Username harus unik
    const clash = await ctx.db
      .query("schools")
      .withIndex("by_username", (q) => q.eq("username", username))
      .unique();
    if (clash && clash.code !== code) {
      throw new Error(`Username '${username}' sudah dipakai sekolah lain.`);
    }

    const existing = await ctx.db
      .query("schools")
      .withIndex("by_code", (q) => q.eq("code", code))
      .unique();
    const payload = { ...args.school, code, username };
    if (existing) {
      await ctx.db.patch(existing._id, payload);
      return { ok: true, created: false, schoolCode: code };
    }
    await ctx.db.insert("schools", { ...payload, createdAt: Date.now() });
    return { ok: true, created: true, schoolCode: code };
  },
});

export const deleteSchool = mutation({
  args: { apiKey: v.string(), schoolCode: v.string() },
  handler: async (ctx, args) => {
    const key = await requireKey(ctx, args.apiKey);
    if (key.schoolCode && key.schoolCode !== args.schoolCode) {
      throw new Error("API key ini tidak boleh untuk sekolah tersebut.");
    }
    const school = await ctx.db
      .query("schools")
      .withIndex("by_code", (q) => q.eq("code", args.schoolCode))
      .unique();
    if (!school) throw new Error("Sekolah tidak ditemukan.");
    await ctx.db.delete(school._id);
    return { ok: true };
  },
});

/* ═══════════════════════════════════════════
   Kelas
   ═══════════════════════════════════════════ */
export const listClasses = query({
  args: { apiKey: v.string(), schoolCode: v.string() },
  handler: async (ctx, args) => {
    await requireKey(ctx, args.apiKey);
    const rows = await ctx.db
      .query("schoolClasses")
      .withIndex("by_school", (q) => q.eq("schoolCode", args.schoolCode))
      .collect();
    return rows.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  },
});

export const saveClass = mutation({
  args: {
    apiKey: v.string(),
    schoolCode: v.string(),
    id: v.optional(v.id("schoolClasses")),
    code: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    sortOrder: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireKey(ctx, args.apiKey);
    if (args.id) {
      const row = await ctx.db.get(args.id);
      if (!row) throw new Error("Kelas tidak ditemukan.");
      await ctx.db.patch(args.id, {
        code: args.code,
        name: args.name,
        description: args.description,
        sortOrder: args.sortOrder,
      });
      return { ok: true };
    }
    const id = await ctx.db.insert("schoolClasses", {
      schoolCode: args.schoolCode,
      code: args.code,
      name: args.name,
      description: args.description,
      sortOrder: args.sortOrder ?? 0,
    });
    return { ok: true, id };
  },
});

export const deleteClass = mutation({
  args: { apiKey: v.string(), id: v.id("schoolClasses") },
  handler: async (ctx, args) => {
    await requireKey(ctx, args.apiKey);
    const row = await ctx.db.get(args.id);
    if (row) await ctx.db.delete(args.id);
    return { ok: true };
  },
});

/* ═══════════════════════════════════════════
   Konten: pengumuman / kalender / menu / halaman
   ═══════════════════════════════════════════ */

export const saveAnnouncement = mutation({
  args: {
    apiKey: v.string(),
    schoolCode: v.string(),
    id: v.optional(v.id("announcements")),
    title: v.string(),
    content: v.string(),
    imageUrl: v.optional(v.string()),
    isSlider: v.optional(v.boolean()),
    sortOrder: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireKey(ctx, args.apiKey);
    const payload = {
      title: args.title,
      content: args.content,
      imageUrl: args.imageUrl,
      isSlider: args.isSlider ?? false,
      sortOrder: args.sortOrder ?? 0,
    };
    if (args.id) {
      await ctx.db.patch(args.id, payload);
      return { ok: true };
    }
    const id = await ctx.db.insert("announcements", {
      ...payload,
      schoolCode: args.schoolCode,
      createdAt: Date.now(),
    });
    return { ok: true, id };
  },
});

export const deleteAnnouncement = mutation({
  args: { apiKey: v.string(), id: v.id("announcements") },
  handler: async (ctx, args) => {
    await requireKey(ctx, args.apiKey);
    const row = await ctx.db.get(args.id);
    if (row) await ctx.db.delete(args.id);
    return { ok: true };
  },
});

export const saveCalendarEvent = mutation({
  args: {
    apiKey: v.string(),
    schoolCode: v.string(),
    id: v.optional(v.id("calendarEvents")),
    title: v.string(),
    startDate: v.string(),
    endDate: v.optional(v.string()),
    type: v.optional(v.string()),
    description: v.optional(v.string()),
    categoryName: v.optional(v.string()),
    categoryColor: v.optional(v.string()),
    categoryIcon: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireKey(ctx, args.apiKey);
    const payload = {
      title: args.title,
      startDate: args.startDate,
      endDate: args.endDate,
      type: args.type,
      description: args.description,
      categoryName: args.categoryName,
      categoryColor: args.categoryColor,
      categoryIcon: args.categoryIcon,
    };
    if (args.id) {
      await ctx.db.patch(args.id, payload);
      return { ok: true };
    }
    const id = await ctx.db.insert("calendarEvents", {
      ...payload,
      schoolCode: args.schoolCode,
    });
    return { ok: true, id };
  },
});

export const deleteCalendarEvent = mutation({
  args: { apiKey: v.string(), id: v.id("calendarEvents") },
  handler: async (ctx, args) => {
    await requireKey(ctx, args.apiKey);
    const row = await ctx.db.get(args.id);
    if (row) await ctx.db.delete(args.id);
    return { ok: true };
  },
});

export const saveMenu = mutation({
  args: {
    apiKey: v.string(),
    schoolCode: v.string(),
    id: v.optional(v.id("customMenus")),
    title: v.string(),
    type: v.optional(v.string()),
    slug: v.optional(v.string()),
    url: v.optional(v.string()),
    iconType: v.optional(v.string()),
    iconValue: v.optional(v.string()),
    buttonColor: v.optional(v.string()),
    textColor: v.optional(v.string()),
    sortOrder: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireKey(ctx, args.apiKey);
    const payload = {
      title: args.title,
      type: args.type,
      slug: args.slug,
      url: args.url,
      iconType: args.iconType,
      iconValue: args.iconValue,
      buttonColor: args.buttonColor,
      textColor: args.textColor,
      sortOrder: args.sortOrder ?? 0,
    };
    if (args.id) {
      await ctx.db.patch(args.id, payload);
      return { ok: true };
    }
    const id = await ctx.db.insert("customMenus", { ...payload, schoolCode: args.schoolCode });
    return { ok: true, id };
  },
});

export const deleteMenu = mutation({
  args: { apiKey: v.string(), id: v.id("customMenus") },
  handler: async (ctx, args) => {
    await requireKey(ctx, args.apiKey);
    const row = await ctx.db.get(args.id);
    if (row) await ctx.db.delete(args.id);
    return { ok: true };
  },
});

export const savePage = mutation({
  args: {
    apiKey: v.string(),
    schoolCode: v.string(),
    id: v.optional(v.id("pages")),
    slug: v.string(),
    title: v.string(),
    content: v.string(),
    buttonColor: v.optional(v.string()),
    iconType: v.optional(v.string()),
    iconValue: v.optional(v.string()),
    textColor: v.optional(v.string()),
    sortOrder: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireKey(ctx, args.apiKey);
    const slug = args.slug.trim().toLowerCase();
    if (!slug) throw new Error("Slug halaman wajib diisi.");
    const payload = {
      slug,
      title: args.title,
      content: args.content,
      updatedAt: new Date().toISOString(),
      buttonColor: args.buttonColor,
      iconType: args.iconType,
      iconValue: args.iconValue,
      textColor: args.textColor,
      sortOrder: args.sortOrder ?? 0,
    };
    if (args.id) {
      await ctx.db.patch(args.id, payload);
      return { ok: true };
    }
    const id = await ctx.db.insert("pages", { ...payload, schoolCode: args.schoolCode });
    return { ok: true, id };
  },
});

export const deletePage = mutation({
  args: { apiKey: v.string(), id: v.id("pages") },
  handler: async (ctx, args) => {
    await requireKey(ctx, args.apiKey);
    const row = await ctx.db.get(args.id);
    if (row) await ctx.db.delete(args.id);
    return { ok: true };
  },
});

/* ═══════════════════════════════════════════
   Konten (list gabungan untuk UI)
   ═══════════════════════════════════════════ */
export const listContentForSchool = query({
  args: { apiKey: v.string(), schoolCode: v.string(), kind: v.string() },
  handler: async (ctx, args) => {
    await requireKey(ctx, args.apiKey);
    type RowType = { _id: string; title: string; slug?: string; sortOrder?: number };
    if (args.kind === "announcements") {
      const rows = await ctx.db
        .query("announcements")
        .withIndex("by_school", (q) => q.eq("schoolCode", args.schoolCode))
        .collect();
      return rows
        .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
        .map((r): RowType => ({ _id: r._id, title: r.title, sortOrder: r.sortOrder }));
    }
    if (args.kind === "calendarEvents") {
      const rows = await ctx.db
        .query("calendarEvents")
        .withIndex("by_school", (q) => q.eq("schoolCode", args.schoolCode))
        .collect();
      return rows
        .sort((a, b) => a.startDate.localeCompare(b.startDate))
        .map((r): RowType => ({ _id: r._id, title: r.title }));
    }
    if (args.kind === "customMenus") {
      const rows = await ctx.db
        .query("customMenus")
        .withIndex("by_school", (q) => q.eq("schoolCode", args.schoolCode))
        .collect();
      return rows
        .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
        .map((r): RowType => ({ _id: r._id, title: r.title, slug: r.slug, sortOrder: r.sortOrder }));
    }
    const rows = await ctx.db
      .query("pages")
      .withIndex("by_school", (q) => q.eq("schoolCode", args.schoolCode))
      .collect();
    return rows
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
      .map((r): RowType => ({ _id: r._id, title: r.title, slug: r.slug, sortOrder: r.sortOrder }));
  },
});

/* ═══════════════════════════════════════════
   Exam — field kiosk + kaitkan ke sekolah
   ═══════════════════════════════════════════ */
export const saveExamKiosk = mutation({
  args: {
    apiKey: v.string(),
    examLocalId: v.string(),
    schoolCode: v.optional(v.string()),
    classId: v.optional(v.number()),
    cbtUrl: v.optional(v.string()),
    url: v.optional(v.string()),
    schoolName: v.optional(v.string()),
    logoUrl: v.optional(v.string()),
    customUa: v.optional(v.string()),
    timerEnabled: v.optional(v.boolean()),
    timerMinutes: v.optional(v.number()),
    tokenInEnabled: v.optional(v.boolean()),
    tokenIn: v.optional(v.string()),
    tokenOut: v.optional(v.string()),
    linkOut: v.optional(v.string()),
    welcomeMsg: v.optional(v.string()),
    clearCacheEnabled: v.optional(v.boolean()),
    screenshotEnabled: v.optional(v.boolean()),
    pinScreenEnabled: v.optional(v.boolean()),
    copyPasteEnabled: v.optional(v.boolean()),
    timeRestrictionEnabled: v.optional(v.boolean()),
    startTime: v.optional(v.string()),
    endTime: v.optional(v.string()),
    txtColor: v.optional(v.string()),
    btnColor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireKey(ctx, args.apiKey);
    const exam = await ctx.db
      .query("ebcExams")
      .withIndex("by_localId", (q) => q.eq("localId", args.examLocalId))
      .unique();
    if (!exam) throw new Error("Ujian tidak ditemukan di server. Publish dulu.");

    const { apiKey: _omit, examLocalId: _omit2, ...patch } = args;
    void _omit;
    void _omit2;
    await ctx.db.patch(exam._id, patch);
    return { ok: true };
  },
});

export const listServerExams = query({
  args: { apiKey: v.string(), schoolCode: v.optional(v.string()) },
  handler: async (ctx, args) => {
    await requireKey(ctx, args.apiKey);
    const all = await ctx.db.query("ebcExams").collect();
    return all
      .filter((e) => !args.schoolCode || !e.schoolCode || e.schoolCode === args.schoolCode)
      .sort((a, b) => b.publishedAt - a.publishedAt);
  },
});

/* ═══════════════════════════════════════════
   Device
   ═══════════════════════════════════════════ */
export const listDevices = query({
  args: { apiKey: v.string(), schoolCode: v.string() },
  handler: async (ctx, args) => {
    await requireKey(ctx, args.apiKey);
    const rows = await ctx.db
      .query("devices")
      .withIndex("by_school", (q) => q.eq("schoolCode", args.schoolCode))
      .collect();
    const ONLINE_MS = 60_000;
    const now = Date.now();
    return rows
      .sort((a, b) => b.lastSeen - a.lastSeen)
      .map((d) => ({ ...d, online: now - d.lastSeen < ONLINE_MS }));
  },
});

export const deleteDevice = mutation({
  args: { apiKey: v.string(), deviceId: v.string() },
  handler: async (ctx, args) => {
    await requireKey(ctx, args.apiKey);
    const row = await ctx.db
      .query("devices")
      .withIndex("by_device_id", (q) => q.eq("deviceId", args.deviceId))
      .unique();
    if (row) await ctx.db.delete(row._id);
    return { ok: true };
  },
});

/* ═══════════════════════════════════════════
   Kode reset pelanggaran
   ═══════════════════════════════════════════ */
export const generateResetCode = mutation({
  args: {
    apiKey: v.string(),
    schoolCode: v.string(),
    createdBy: v.optional(v.string()),
    ttlMinutes: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireKey(ctx, args.apiKey);
    const resetCode = randomCode(6);
    const ttl = (args.ttlMinutes ?? 30) * 60_000;
    const id = await ctx.db.insert("violationResets", {
      schoolCode: args.schoolCode,
      resetCode,
      used: false,
      expiresAt: Date.now() + ttl,
      createdBy: args.createdBy,
      createdAt: Date.now(),
    });
    return { ok: true, id, resetCode, expiresAt: Date.now() + ttl };
  },
});

export const listResetCodes = query({
  args: { apiKey: v.string(), schoolCode: v.string() },
  handler: async (ctx, args) => {
    await requireKey(ctx, args.apiKey);
    const now = Date.now();
    const rows = await ctx.db
      .query("violationResets")
      .withIndex("by_code_reset", (q) => q.eq("schoolCode", args.schoolCode))
      .collect();
    return rows
      .sort((a, b) => b.createdAt - a.createdAt)
      .map((r) => ({ ...r, expired: r.expiresAt < now }));
  },
});

/* ═══════════════════════════════════════════
   API key
   ═══════════════════════════════════════════ */
export const rotateApiKey = mutation({
  args: { apiKey: v.string(), schoolCode: v.optional(v.string()) },
  handler: async (ctx, args) => {
    await requireKey(ctx, args.apiKey);
    const key = randomKey();
    await ctx.db.insert("apiKeys", {
      key,
      schoolCode: args.schoolCode ?? undefined,
      label: "Kunci rotasi",
      active: true,
      createdAt: Date.now(),
    });
    return { ok: true, key };
  },
});

export const revokeApiKey = mutation({
  args: { apiKey: v.string(), targetKey: v.string() },
  handler: async (ctx, args) => {
    await requireKey(ctx, args.apiKey);
    if (args.targetKey === args.apiKey) {
      throw new Error("Tidak bisa mencabut kunci yang sedang dipakai.");
    }
    const row = await ctx.db
      .query("apiKeys")
      .withIndex("by_key", (q) => q.eq("key", args.targetKey))
      .unique();
    if (!row) throw new Error("Kunci tidak ditemukan.");
    await ctx.db.patch(row._id, { active: false });
    return { ok: true };
  },
});

export const listApiKeys = query({
  args: { apiKey: v.string() },
  handler: async (ctx, args) => {
    await requireKey(ctx, args.apiKey);
    return await ctx.db.query("apiKeys").collect();
  },
});
