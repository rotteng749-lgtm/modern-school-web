import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/* ═══════════════════════════════════════════
   EBC — Exam Browser Client (backend)
   ───────────────────────────────────────────
   Kanal data lintas perangkat. Guru publish
   ujian + soal dari perangkatnya, siswa scan
   QR di HP lalu connect ke sesi yang sama.

   Catatan keamanan penting:
   • Kunci jawaban TIDAK pernah dikirim ke
     client sebelum submit (bandingkan versi
     localStorage yang bisa dibaca siswa).
   • Nilai dihitung ulang di server dari
     answers yang dikirim — client tidak bisa
     mengirim skor sendiri.
   ═══════════════════════════════════════════ */

/** Alfabet tanpa I, O, 0, 1 supaya mudah dibaca guru dari layar. */
const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const CODE_LEN = 6;
const SESSION_TTL_MS = 8 * 60 * 60 * 1000; // 8 jam
const MAX_CANDIDATES = 500;
const USERNAME_RE = /^[a-z0-9._-]{3,32}$/;

function makeCode(): string {
  let out = "";
  for (let i = 0; i < CODE_LEN; i++) {
    out += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  }
  return out;
}

function normalizeCode(raw: string): string {
  return raw.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
}

function normalizeUsername(raw: string): string {
  return raw.trim().toLowerCase();
}

const questionValidator = v.object({
  localId: v.string(),
  question: v.string(),
  options: v.array(v.string()),
  answer: v.string(),
  subject: v.string(),
  className: v.string(),
  type: v.string(),
  difficulty: v.string(),
  createdAt: v.string(),
});

const examValidator = v.object({
  localId: v.string(),
  name: v.string(),
  className: v.string(),
  subject: v.string(),
  date: v.string(),
  startTime: v.string(),
  endTime: v.string(),
  totalStudents: v.number(),
  questionIds: v.array(v.string()),
});

/* ── Publish: kirim akun murid ke server ──
   Diperlukan karena akun dibuat di perangkat guru, sedangkan EBC
   dijalankan di HP siswa yang localStorage-nya kosong. Tanpa ini,
   login di HP selalu gagal untuk akun yang dibuat di laptop guru. */
export const publishRoster = mutation({
  args: {
    students: v.array(
      v.object({
        username: v.string(),
        name: v.string(),
        password: v.string(),
        className: v.optional(v.string()),
      }),
    ),
  },
  handler: async (ctx, args) => {
    let upserted = 0;
    for (const s of args.students) {
      const username = normalizeUsername(s.username);
      if (!USERNAME_RE.test(username)) continue;
      const existing = await ctx.db
        .query("ebcStudents")
        .withIndex("by_username", (q) => q.eq("username", username))
        .unique();
      const payload = {
        username,
        name: s.name,
        password: s.password,
        className: s.className,
        active: true,
        publishedAt: Date.now(),
      };
      if (existing) {
        await ctx.db.patch(existing._id, payload);
      } else {
        await ctx.db.insert("ebcStudents", payload);
      }
      upserted++;
    }
    return { ok: true, students: upserted };
  },
});

/** Verifikasi akun murid di server (dipakai EBC saat localStorage HP kosong). */
export const verifyStudent = query({
  args: { username: v.string(), password: v.string() },
  handler: async (ctx, args) => {
    const username = normalizeUsername(args.username);
    if (!USERNAME_RE.test(username)) return null;
    const student = await ctx.db
      .query("ebcStudents")
      .withIndex("by_username", (q) => q.eq("username", username))
      .unique();
    if (!student || !student.active) return null;
    if (student.password !== args.password) return null;
    return { username: student.username, name: student.name, className: student.className };
  },
});

/* ── Publish: kirim ujian + soal ke server ── */
export const publishExam = mutation({
  args: {
    exam: examValidator,
    questions: v.array(questionValidator),
    publishedBy: v.string(),
  },
  handler: async (ctx, args) => {
    const payload = {
      ...args.exam,
      publishedBy: args.publishedBy,
      publishedAt: Date.now(),
      active: true,
    };

    const existing = await ctx.db
      .query("ebcExams")
      .withIndex("by_localId", (q) => q.eq("localId", args.exam.localId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, payload);
    } else {
      await ctx.db.insert("ebcExams", payload);
    }

    // Upsert soal satu per satu (index by localId, stabil antar publish)
    for (const question of args.questions) {
      const existingQ = await ctx.db
        .query("ebcQuestions")
        .withIndex("by_localId", (q) => q.eq("localId", question.localId))
        .unique();
      if (existingQ) {
        await ctx.db.patch(existingQ._id, question);
      } else {
        await ctx.db.insert("ebcQuestions", question);
      }
    }

    return { ok: true, questions: args.questions.length };
  },
});

/* ── Buat (atau ambil) sesi ujian + kode QR ── */
export const createSession = mutation({
  args: {
    examLocalId: v.string(),
    createdBy: v.string(),
  },
  handler: async (ctx, args) => {
    const exam = await ctx.db
      .query("ebcExams")
      .withIndex("by_localId", (q) => q.eq("localId", args.examLocalId))
      .unique();
    if (!exam) throw new Error("Ujian belum dipublish ke server.");
    if (exam.questionIds.length === 0) throw new Error("Ujian ini belum punya soal.");

    const expiresAt = Date.now() + SESSION_TTL_MS;

    // Satu sesi aktif per ujian — memindai QR dua kali tidak menghasilkan sesi ganda
    const existingActive = await ctx.db
      .query("ebcSessions")
      .withIndex("by_exam", (q) => q.eq("examLocalId", args.examLocalId))
      .filter((q) => q.eq(q.field("active"), true))
      .first();
    if (existingActive) {
      await ctx.db.patch(existingActive._id, { expiresAt });
      return { code: existingActive.code, reused: true, expiresAt };
    }

    let code = makeCode();
    for (let attempt = 0; attempt < 6; attempt++) {
      const clash = await ctx.db
        .query("ebcSessions")
        .withIndex("by_code", (q) => q.eq("code", code))
        .unique();
      if (!clash) break;
      code = makeCode();
    }

    await ctx.db.insert("ebcSessions", {
      code,
      examLocalId: exam.localId,
      examName: exam.name,
      subject: exam.subject,
      className: exam.className,
      startTime: exam.startTime,
      endTime: exam.endTime,
      date: exam.date,
      questionIds: exam.questionIds,
      createdBy: args.createdBy,
      createdAt: Date.now(),
      expiresAt,
      active: true,
    });

    return { code, reused: false, expiresAt };
  },
});

export const closeSession = mutation({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    const code = normalizeCode(args.code);
    const session = await ctx.db
      .query("ebcSessions")
      .withIndex("by_code", (q) => q.eq("code", code))
      .unique();
    if (!session) throw new Error("Sesi tidak ditemukan.");
    await ctx.db.patch(session._id, { active: false });
    return { ok: true };
  },
});

/* ── Data untuk client: TANPA kunci jawaban ── */
export const sessionForClient = query({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    const code = normalizeCode(args.code);
    if (!code) return null;

    const session = await ctx.db
      .query("ebcSessions")
      .withIndex("by_code", (q) => q.eq("code", code))
      .unique();
    if (!session) return null;

    if (!session.active) return { status: "closed" as const, code };
    if (session.expiresAt < Date.now()) return { status: "expired" as const, code };

    const questions = (
      await Promise.all(
        session.questionIds.map(async (qid) => {
          const q = await ctx.db
            .query("ebcQuestions")
            .withIndex("by_localId", (ix) => ix.eq("localId", qid))
            .unique();
          if (!q) return null;
          // Sengaja TIDAK mengirim `answer` ke client.
          return { id: q.localId, question: q.question, options: q.options, type: q.type };
        }),
      )
    ).filter((q): q is NonNullable<typeof q> => q !== null);

    return {
      status: "open" as const,
      code: session.code,
      exam: {
        localId: session.examLocalId,
        name: session.examName,
        subject: session.subject,
        className: session.className,
        date: session.date,
        startTime: session.startTime,
        endTime: session.endTime,
      },
      questions,
      totalQuestions: questions.length,
      expiresAt: session.expiresAt,
    };
  },
});

/* ── Peserta join sesi ── */
export const joinSession = mutation({
  args: {
    code: v.string(),
    username: v.string(),
    name: v.string(),
    className: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const code = normalizeCode(args.code);
    const session = await ctx.db
      .query("ebcSessions")
      .withIndex("by_code", (q) => q.eq("code", code))
      .unique();
    if (!session) throw new Error("Kode sesi tidak ditemukan.");
    if (!session.active) throw new Error("Sesi sudah ditutup guru.");
    if (session.expiresAt < Date.now()) throw new Error("Sesi sudah kedaluwarsa.");

    const username = normalizeUsername(args.username);
    if (!USERNAME_RE.test(username)) throw new Error("Username tidak valid.");

    const existing = await ctx.db
      .query("ebcCandidates")
      .withIndex("by_session_username", (q) => q.eq("sessionCode", code).eq("username", username))
      .unique();
    if (existing) {
      // Scan ulang / reload: lanjutkan, jangan buat peserta ganda
      await ctx.db.patch(existing._id, { lastSeen: Date.now(), name: args.name });
      return { ok: true, resumed: true };
    }

    const roster = await ctx.db
      .query("ebcCandidates")
      .withIndex("by_session", (q) => q.eq("sessionCode", code))
      .collect();
    if (roster.length >= MAX_CANDIDATES) throw new Error("Sesi sudah penuh.");

    await ctx.db.insert("ebcCandidates", {
      sessionCode: code,
      examLocalId: session.examLocalId,
      username,
      name: args.name,
      className: args.className,
      joinedAt: Date.now(),
      lastSeen: Date.now(),
      status: "berjalan",
      currentQuestion: 0,
      totalQuestions: session.questionIds.length,
      answered: 0,
      violationCount: 0,
    });

    return { ok: true, resumed: false };
  },
});

/* ── Heartbeat: progres peserta agar guru bisa pantau live ── */
export const heartbeat = mutation({
  args: {
    code: v.string(),
    username: v.string(),
    currentQuestion: v.number(),
    answered: v.number(),
    totalQuestions: v.number(),
  },
  handler: async (ctx, args) => {
    const code = normalizeCode(args.code);
    const username = normalizeUsername(args.username);
    const candidate = await ctx.db
      .query("ebcCandidates")
      .withIndex("by_session_username", (q) => q.eq("sessionCode", code).eq("username", username))
      .unique();
    if (!candidate) return { ok: false };
    await ctx.db.patch(candidate._id, {
      lastSeen: Date.now(),
      currentQuestion: args.currentQuestion,
      answered: args.answered,
      totalQuestions: args.totalQuestions,
    });
    return { ok: true };
  },
});

/* ── Kirim pelanggaran proctoring ke server ── */
export const reportViolation = mutation({
  args: {
    code: v.string(),
    username: v.string(),
    name: v.string(),
    type: v.string(),
    detail: v.string(),
    durationMs: v.optional(v.number()),
    at: v.number(),
  },
  handler: async (ctx, args) => {
    const code = normalizeCode(args.code);
    const username = normalizeUsername(args.username);
    await ctx.db.insert("ebcViolations", {
      sessionCode: code,
      examLocalId: "",
      username,
      name: args.name,
      type: args.type,
      detail: args.detail.slice(0, 300),
      durationMs: args.durationMs,
      at: args.at,
    });
    const candidate = await ctx.db
      .query("ebcCandidates")
      .withIndex("by_session_username", (q) => q.eq("sessionCode", code).eq("username", username))
      .unique();
    if (candidate) {
      await ctx.db.patch(candidate._id, { violationCount: (candidate.violationCount ?? 0) + 1 });
    }
    return { ok: true };
  },
});

/* ── Submit: NILAI DIHITUNG ULANG DI SERVER ── */
export const submitExam = mutation({
  args: {
    code: v.string(),
    username: v.string(),
    name: v.string(),
    answers: v.record(v.string(), v.string()),
  },
  handler: async (ctx, args) => {
    const code = normalizeCode(args.code);
    const session = await ctx.db
      .query("ebcSessions")
      .withIndex("by_code", (q) => q.eq("code", code))
      .unique();
    if (!session) throw new Error("Sesi tidak ditemukan.");

    const username = normalizeUsername(args.username);

    // Idempoten: submit ulang (koneksi putus) tidak menimpa hasil
    const already = await ctx.db
      .query("ebcResults")
      .withIndex("by_session", (q) => q.eq("sessionCode", code))
      .filter((q) => q.eq(q.field("username"), username))
      .first();
    if (already) {
      return {
        score: already.score,
        total: already.total,
        correct: already.correct,
        wrong: already.wrong,
        unanswered: already.unanswered,
        violationCount: already.violationCount,
        alreadySubmitted: true,
      };
    }

    const questions = (
      await Promise.all(
        session.questionIds.map(async (qid) =>
          ctx.db.query("ebcQuestions").withIndex("by_localId", (ix) => ix.eq("localId", qid)).unique(),
        ),
      )
    ).filter((q) => q !== null);

    let correct = 0;
    let wrong = 0;
    let unanswered = 0;
    for (const q of questions) {
      const given = (args.answers[q.localId] ?? "").trim();
      if (!given) {
        unanswered++;
      } else if (q.type === "Pilihan Ganda") {
        if (given.toLowerCase() === q.answer.trim().toLowerCase()) correct++;
        else wrong++;
      } else {
        correct++;
      }
    }

    const total = questions.length;
    const score = total > 0 ? Math.round((correct / total) * 100) : 0;
    const violations = await ctx.db
      .query("ebcViolations")
      .withIndex("by_session", (q) => q.eq("sessionCode", code))
      .filter((q) => q.eq(q.field("username"), username))
      .collect();

    await ctx.db.insert("ebcResults", {
      sessionCode: code,
      examLocalId: session.examLocalId,
      username,
      name: args.name,
      score,
      total,
      correct,
      wrong,
      unanswered,
      answers: args.answers,
      submittedAt: Date.now(),
      violationCount: violations.length,
    });

    const candidate = await ctx.db
      .query("ebcCandidates")
      .withIndex("by_session_username", (q) => q.eq("sessionCode", code).eq("username", username))
      .unique();
    if (candidate) {
      await ctx.db.patch(candidate._id, {
        status: "selesai",
        lastSeen: Date.now(),
        answered: Object.keys(args.answers).length,
      });
    }

    return {
      score,
      total,
      correct,
      wrong,
      unanswered,
      violationCount: violations.length,
      alreadySubmitted: false,
    };
  },
});

/* ── Monitor live untuk guru ── */
export const sessionMonitor = query({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    const code = normalizeCode(args.code);
    const session = await ctx.db
      .query("ebcSessions")
      .withIndex("by_code", (q) => q.eq("code", code))
      .unique();
    if (!session) return null;

    const candidates = await ctx.db
      .query("ebcCandidates")
      .withIndex("by_session", (q) => q.eq("sessionCode", code))
      .collect();
    const results = await ctx.db
      .query("ebcResults")
      .withIndex("by_session", (q) => q.eq("sessionCode", code))
      .collect();
    const violations = await ctx.db
      .query("ebcViolations")
      .withIndex("by_session", (q) => q.eq("sessionCode", code))
      .collect();

    // \"online\" = heartbeat dalam 20 detik terakhir
    const ONLINE_MS = 20_000;
    const now = Date.now();

    return {
      session: {
        code: session.code,
        examName: session.examName,
        subject: session.subject,
        className: session.className,
        date: session.date,
        startTime: session.startTime,
        endTime: session.endTime,
        active: session.active,
        expiresAt: session.expiresAt,
        createdAt: session.createdAt,
      },
      candidates: candidates
        .sort((a, b) => a.joinedAt - b.joinedAt)
        .map((c) => ({ ...c, online: now - c.lastSeen < ONLINE_MS })),
      results: results.sort((a, b) => a.submittedAt - b.submittedAt),
      violations: violations.sort((a, b) => a.at - b.at),
    };
  },
});

/* ── Daftar sesi aktif milik seorang guru ── */
export const mySessions = query({
  args: { createdBy: v.string() },
  handler: async (ctx, args) => {
    const all = await ctx.db.query("ebcSessions").collect();
    return all
      .filter((s) => s.createdBy === args.createdBy)
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 20);
  },
});
