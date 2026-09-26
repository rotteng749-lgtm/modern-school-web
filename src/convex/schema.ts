import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

// default user roles. can add / remove based on the project as needed
export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  MEMBER: "member",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.USER),
  v.literal(ROLES.MEMBER),
);
export type Role = Infer<typeof roleValidator>;

const schema = defineSchema(
  {
    // default auth tables using convex auth.
    ...authTables, // do not remove or modify

    // the users table is the default users table that is brought in by the authTables
    users: defineTable({
      name: v.optional(v.string()), // name of the user. do not remove
      image: v.optional(v.string()), // image of the user. do not remove
      email: v.optional(v.string()), // email of the user. do not remove
      emailVerificationTime: v.optional(v.number()), // email verification time. do not remove
      isAnonymous: v.optional(v.boolean()), // is the user anonymous. do not remove

      role: v.optional(roleValidator), // role of the user. do not remove
    }).index("email", ["email"]), // index for the email. do not remove or modify

    /* ═══════════════════════════════════════════
       EBC — Exam Browser Client
       Kanal data lintas perangkat: guru publish
       ujian + soal ke Convex dari HP/laptop
       guru, siswa scan QR di HP dan langsung
      connects ke sesi yang sama.
       ═══════════════════════════════════════════ */

    /** Akun murid yang dipublish, supaya EBC di HP bisa login.
        `passwordHash` + `passwordSalt` (PBKDF2-SHA256) adalah sumber
        kebenaran. `password` plaintext hanya untuk migrasi row lama dan
        akan dihapus begitu republish dilakukan. */
    ebcStudents: defineTable({
      username: v.string(),
      name: v.string(),
      password: v.optional(v.string()),
      passwordHash: v.optional(v.string()),
      passwordSalt: v.optional(v.string()),
      className: v.optional(v.string()),
      active: v.boolean(),
      publishedAt: v.number(),
    })
      .index("by_username", ["username"])
      .index("by_class", ["className"]),

    /** Ujian yang sudah dipublish ke Convex (mirror dari msw-ujian). */
    ebcExams: defineTable({
      localId: v.string(), // id dari msw-ujian
      name: v.string(),
      className: v.string(),
      subject: v.string(),
      date: v.string(),
      startTime: v.string(),
      endTime: v.string(),
      totalStudents: v.number(),
      questionIds: v.array(v.string()),

      /* ── Field kiosk ExamItem (kontrak API EBC bagian 3.3) ── */
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
      txtColor: v.optional(v.string()),
      btnColor: v.optional(v.string()),

      publishedBy: v.string(),
      publishedAt: v.number(),
      active: v.boolean(),
    }).index("by_localId", ["localId"]).index("by_school", ["schoolCode"]),

    /** Bank soal yang ikut dipublish (mirror dari msw-bank-soal). */
    ebcQuestions: defineTable({
      localId: v.string(),
      question: v.string(),
      options: v.array(v.string()),
      answer: v.string(),
      subject: v.string(),
      className: v.string(),
      type: v.string(),
      difficulty: v.string(),
      createdAt: v.string(),
    }).index("by_localId", ["localId"]),

    /** Sesi ujian — kode pendek yang di-encode jadi QR. */
    ebcSessions: defineTable({
      code: v.string(),
      examLocalId: v.string(),
      examName: v.string(),
      subject: v.string(),
      className: v.string(),
      startTime: v.string(),
      endTime: v.string(),
      date: v.string(),
      questionIds: v.array(v.string()),
      createdBy: v.string(),
      createdAt: v.number(),
      expiresAt: v.number(),
      active: v.boolean(),
    })
      .index("by_code", ["code"])
      .index("by_exam", ["examLocalId"]),

    /** Peserta yang sudah join sesi (live). */
    ebcCandidates: defineTable({
      sessionCode: v.string(),
      examLocalId: v.string(),
      username: v.string(),
      name: v.string(),
      className: v.optional(v.string()),
      joinedAt: v.number(),
      lastSeen: v.number(),
      status: v.string(), // "menunggu" | "berjalan" | "selesai"
      currentQuestion: v.number(),
      totalQuestions: v.number(),
      answered: v.number(),
      violationCount: v.number(),
    })
      .index("by_session", ["sessionCode"])
      .index("by_session_username", ["sessionCode", "username"]),

    /** Hasil ujian — di-score ulang di server, bukan dari client. */
    ebcResults: defineTable({
      sessionCode: v.string(),
      examLocalId: v.string(),
      username: v.string(),
      name: v.string(),
      score: v.number(),
      total: v.number(),
      correct: v.number(),
      wrong: v.number(),
      unanswered: v.number(),
      answers: v.any(),
      submittedAt: v.number(),
      violationCount: v.number(),
    }).index("by_session", ["sessionCode"]),

    /** Log proctoring yang dikirim client ke server. */
    ebcViolations: defineTable({
      sessionCode: v.string(),
      examLocalId: v.string(),
      username: v.string(),
      name: v.string(),
      type: v.string(),
      detail: v.string(),
      durationMs: v.optional(v.number()),
      at: v.number(),
    }).index("by_session", ["sessionCode"]),

    /* ═══════════════════════════════════════════
       EBC HTTP API — layer kompatibilitas
       ═══════════════════════════════════════════
       Kontrak: <BASE_URL>/index.php?x=<aksi>
       Semua respons dibungkus { status, message, data }.
       */

    /** Sekolah — diidentifikasi lewat `code` (school_code) di semua endpoint. */
    schools: defineTable({
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
      createdAt: v.number(),
    })
      .index("by_code", ["code"])
      .index("by_username", ["username"]),

    schoolClasses: defineTable({
      schoolCode: v.string(),
      code: v.string(),
      name: v.string(),
      description: v.optional(v.string()),
      sortOrder: v.optional(v.number()),
    }).index("by_school", ["schoolCode"]),

    announcements: defineTable({
      schoolCode: v.string(),
      title: v.string(),
      content: v.string(),
      imageUrl: v.optional(v.string()),
      isSlider: v.optional(v.boolean()),
      sortOrder: v.optional(v.number()),
      createdAt: v.number(),
    }).index("by_school", ["schoolCode"]),

    calendarEvents: defineTable({
      schoolCode: v.string(),
      title: v.string(),
      startDate: v.string(),
      endDate: v.optional(v.string()),
      type: v.optional(v.string()),
      description: v.optional(v.string()),
      categoryName: v.optional(v.string()),
      categoryColor: v.optional(v.string()),
      categoryIcon: v.optional(v.string()),
    }).index("by_school", ["schoolCode"]),

    customMenus: defineTable({
      schoolCode: v.string(),
      title: v.string(),
      type: v.optional(v.string()),
      slug: v.optional(v.string()),
      url: v.optional(v.string()),
      iconType: v.optional(v.string()),
      iconValue: v.optional(v.string()),
      buttonColor: v.optional(v.string()),
      textColor: v.optional(v.string()),
      sortOrder: v.optional(v.number()),
    }).index("by_school", ["schoolCode"]),

    pages: defineTable({
      schoolCode: v.string(),
      slug: v.string(),
      title: v.string(),
      content: v.string(),
      updatedAt: v.optional(v.string()),
      buttonColor: v.optional(v.string()),
      iconType: v.optional(v.string()),
      iconValue: v.optional(v.string()),
      textColor: v.optional(v.string()),
      sortOrder: v.optional(v.number()),
    }).index("by_school", ["schoolCode"]),

    /** Device yang register lewat endpoint register_device. */
    devices: defineTable({
      deviceId: v.string(),
      schoolCode: v.string(),
      username: v.optional(v.string()),
      platform: v.optional(v.string()),
      appVersion: v.optional(v.string()),
      installSource: v.optional(v.string()),
      packageName: v.optional(v.string()),
      signature: v.optional(v.string()),
      token: v.optional(v.string()),
      firstSeen: v.number(),
      lastSeen: v.number(),
    })
      .index("by_device_id", ["deviceId"])
      .index("by_school", ["schoolCode"]),

    /** Kode reset pelanggaran yang digenerate guru. */
    violationResets: defineTable({
      schoolCode: v.string(),
      resetCode: v.string(),
      used: v.optional(v.boolean()),
      expiresAt: v.number(),
      createdBy: v.optional(v.string()),
      createdAt: v.number(),
    }).index("by_code_reset", ["schoolCode", "resetCode"]),

    /** API key milik kita sendiri — JANGAN memakai key EBC asli. */
    apiKeys: defineTable({
      key: v.string(),
      schoolCode: v.optional(v.string()),
      label: v.optional(v.string()),
      active: v.optional(v.boolean()),
      createdAt: v.number(),
    }).index("by_key", ["key"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;
