import { anyApi } from "convex/server";

/* ═══════════════════════════════════════════
   EBC — dispatcher kontrak (dipakai 2 transport)
   ───────────────────────────────────────────
   Logika kontrak hanya ditulis SATU kali di sini,
   lalu dipakai oleh:
     • http.ts        → GET/POST /index.php?x=…
     • ebcHttp.ts     → action (fallback kalau
                        deployment tidak menyajarkan
                        custom HTTP route)

   Kontrak respons:
     { "status": true|false, "message": "...", "data": { ... } }
   ═══════════════════════════════════════════ */

export interface EbcParams {
  x: string;
  code?: string;
  username?: string;
  slug?: string;
  reset_code?: string;
  apiKey?: string;
  deviceId?: string;
  platform?: string;
  appVersion?: string;
  installSource?: string;
  packageName?: string;
  signature?: string;
  token?: string;
  schoolUsername?: string;
}

export interface EbcResponse {
  status: boolean;
  message: string;
  data: unknown;
  httpStatus: number;
}

/**
 * Hanya butuh runQuery/runMutation. Dicatat longgar (`any`) karena ctx
 * httpActionGeneric bertipe GenericDataModel sedangkan ctx action
 * bertipe DataModel — keduanya sah, dan referensi fungsi di sini memang
 * lewat `anyApi` supaya tidak bergantung pada hasil codegen.
 */
export interface EbcRunCtx {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  runQuery(reference: any, args?: Record<string, unknown>): Promise<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  runMutation(reference: any, args?: Record<string, unknown>): Promise<any>;
}

const ok = (data: unknown, message = "OK"): EbcResponse => ({
  status: true,
  message,
  data: data ?? {},
  httpStatus: 200,
});

const err = (message: string, httpStatus = 400): EbcResponse => ({
  status: false,
  message,
  data: {},
  httpStatus,
});

/** API key boleh datang dari header (HTTP) atau argumen (action). */
export async function dispatchEbcRequest(
  ctx: EbcRunCtx,
  params: EbcParams,
): Promise<EbcResponse> {
  const ebcApi = anyApi.ebcApi;
  const action = (params.x ?? "").trim();
  const code = (params.code ?? "").trim();
  const username = (params.username ?? "").trim();
  const slug = (params.slug ?? "").trim();
  const resetCode = (params.reset_code ?? "").trim();

  /* 1) Validasi API key */
  if (!params.apiKey) return err("X-API-KEY wajib diisi.", 401);
  const auth = await ctx.runQuery(ebcApi.authenticateApiKey, { key: params.apiKey });
  if (!auth?.ok) return err("API key tidak valid.", 401);

  /* 2) Dispatch sesuai aksi */
  switch (action) {
    case "config": {
      if (code) {
        const data = await ctx.runQuery(ebcApi.configByCode, { code });
        if (!data) return err("Kode sekolah tidak ditemukan.", 404);
        return ok(data);
      }
      if (username) {
        const data = await ctx.runQuery(ebcApi.configByUsername, { username });
        if (!data) return err("Username sekolah tidak ditemukan.", 404);
        return ok(data);
      }
      return err("Parameter 'code' atau 'username' wajib diisi.");
    }

    case "exams": {
      if (!code) return err("Parameter 'code' wajib diisi.");
      const data = await ctx.runQuery(ebcApi.examsForSchoolCode, { code });
      if (data === null) return err("Kode sekolah tidak ditemukan.", 404);
      return ok(data);
    }

    case "announcements": {
      if (!code) return err("Parameter 'code' wajib diisi.");
      const data = await ctx.runQuery(ebcApi.announcementsForSchool, { code });
      return ok({ announcements: data });
    }

    case "calendar": {
      if (!code) return err("Parameter 'code' wajib diisi.");
      const data = await ctx.runQuery(ebcApi.calendarForSchool, { code });
      return ok({ calendar: data });
    }

    case "menus": {
      if (!code) return err("Parameter 'code' wajib diisi.");
      const data = await ctx.runQuery(ebcApi.menusForSchool, { code });
      return ok({ menus: data });
    }

    case "page": {
      if (!code) return err("Parameter 'code' wajib diisi.");
      if (!slug) return err("Parameter 'slug' wajib diisi.");
      const data = await ctx.runQuery(ebcApi.pageBySlug, { code, slug });
      if (!data) return err("Halaman tidak ditemukan.", 404);
      return ok(data);
    }

    case "register_device": {
      const deviceId = params.deviceId ?? "";
      if (!code) return err("Field 'code' wajib diisi.");
      if (!deviceId) return err("X-Device-ID wajib diisi.");
      try {
        const result = await ctx.runMutation(ebcApi.registerDevice, {
          schoolCode: code,
          deviceId,
          username: params.schoolUsername || username || undefined,
          platform: params.platform,
          appVersion: params.appVersion,
          installSource: params.installSource,
          packageName: params.packageName,
          signature: params.signature,
          token: params.token,
        });
        return ok(
          { device_id: deviceId, first_seen: result.firstSeen, updated: result.updated },
          result.updated ? "Device diperbarui" : "Device terdaftar",
        );
      } catch (e) {
        return err(e instanceof Error ? e.message : "Gagal mendaftarkan device.", 500);
      }
    }

    case "verify_violation_reset": {
      if (!code) return err("Parameter 'code' wajib diisi.");
      if (!resetCode) return err("Parameter 'reset_code' wajib diisi.");
      const result = await ctx.runMutation(ebcApi.verifyViolationReset, {
        schoolCode: code,
        resetCode,
      });
      if (!result.ok) return err(result.reason);
      return ok({ reset_code: result.resetCode }, result.reason);
    }

    default:
      return err(`Aksi '${action || "(kosong)"}' tidak dikenal.`, 404);
  }
}
