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
        PERINGATAN: password disimpan apa adanya — sama seperti msw-users
        di localStorage. Wajib diganti auth server sebelum dipakai nyata. */
    ebcStudents: defineTable({
      username: v.string(),
      name: v.string(),
      password: v.string(),
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
      publishedBy: v.string(),
      publishedAt: v.number(),
      active: v.boolean(),
    }).index("by_localId", ["localId"]),

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
  },
  {
    schemaValidation: false,
  },
);

export default schema;
