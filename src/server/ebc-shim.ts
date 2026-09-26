/* ═══════════════════════════════════════════
   EBC SHIM — adapter sisi server untuk `index.php?x=…`
   ═══════════════════════════════════════════
   Kenapa file ini perlu ada
   ─────────────────────────
   Deployment Convex di Freebuff TIDAK menyajikan
   custom HTTP route (`/index.php` membalas 404).
   Yang tersedia hanya endpoint fungsi bawaan:

       POST https://<deployment>.convex.cloud/api/action

   File ini menerjemahkan kontrak EBC ke endpoint
   tersebut, lalu mengembalikan bentuk PERSIS yang
   dibaca client:

       { "status": true|false, "message": "...", "data": { ... } }

   Bonus: karena shim ini parse lalu serialize ulang,
   angka bulat yang tadinya keluar sebagai `1.0` dari
   Convex otomatis menjadi `1` — penting untuk client
   native yang parse ke tipe Int.

   ═══════════════════════════════════════════
   CARA PAKAI
   ═══════════════════════════════════════════
   1. Deploy file ini sebagai Cloudflare Worker
      (atau salin logic-nya ke platform lain).

   2. Set environment variable:

        CONVEX_URL  = https://<deployment>.convex.cloud
        EBC_API_KEY = <opsional> kunci fallback untuk
                      pengujian internal. Kalau tidak di-set,
                      X-API-KEY dari client yang dipakai.

   3. Arahkan BASE_URL di APK ke domain shim:

        https://<shim-domain>/index.php

   Catatan keamanan: kunci API milik kita sendiri dan
   divalidasi di sisi Convex. Shim hanya meneruskan
   X-API-KEY apa adanya — tidak pernah membocorkannya.
   ═══════════════════════════════════════════ */

export interface ShimEnv {
  /** https://<deployment>.convex.cloud */
  CONVEX_URL: string;
  /** Kunci fallback, opsional. Default: pakai X-API-KEY dari client. */
  EBC_API_KEY?: string;
}

interface ConvexActionResponse {
  status?: "success" | "error";
  errorMessage?: string;
  value?: {
    status: boolean;
    message: string;
    data: unknown;
    httpStatus: number;
  };
}

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store",
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: CORS_HEADERS });
}

function fail(message: string, status = 400): Response {
  return json({ status: false, message, data: {} }, status);
}

function readHeader(req: Request, name: string): string {
  return req.headers.get(name) ?? "";
}

/** Kumpulkan parameter dari query string atau body form/JSON. */
async function collectParams(req: Request): Promise<Record<string, string>> {
  const url = new URL(req.url);
  const params: Record<string, string> = {};
  url.searchParams.forEach((value, key) => {
    params[key] = value;
  });

  if (req.method !== "POST") return params;

  const contentType = readHeader(req, "content-type");
  try {
    if (contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      form.forEach((value, key) => {
        if (typeof value === "string") params[key] = value;
      });
    } else {
      const body = (await req.json()) as Record<string, unknown>;
      for (const [k, v] of Object.entries(body)) {
        if (typeof v === "string") params[k] = v;
      }
    }
  } catch {
    // Body tidak terbaca — biarkan; parameter query string tetap dipakai
  }
  return params;
}

/** Teruskan ke action Convex dan kembalikan bentuk kontrak. */
export async function handleEbcRequest(req: Request, env: ShimEnv): Promise<Response> {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (!env.CONVEX_URL) {
    return fail("Variable lingkungan CONVEX_URL belum di-set.", 500);
  }

  // Endpoint kesehatan — dipakai cek shim hidup
  const url = new URL(req.url);
  if (url.searchParams.get("x") === "health" || url.pathname.endsWith("/health")) {
    return json({ status: true, message: "EBC shim aktif", data: { convex: env.CONVEX_URL } });
  }

  const params = await collectParams(req);
  const action = (params.x ?? "").trim();
  if (!action) {
    return fail("Parameter 'x' wajib diisi.");
  }

  const args = {
    x: action,
    code: params.code ?? "",
    username: params.username ?? "",
    slug: params.slug ?? "",
    reset_code: params.reset_code ?? "",
    // Kunci dari client; fallback ke env hanya untuk pengujian internal
    apiKey: readHeader(req, "X-API-KEY") || env.EBC_API_KEY || "",
    deviceId: readHeader(req, "X-Device-ID") || params.device_id || "",
    platform: params.platform || "android",
    appVersion: readHeader(req, "X-App-Version") || params.app_version || "",
    installSource: readHeader(req, "X-Install-Source") || "",
    packageName: readHeader(req, "X-Package-Name") || "",
    signature: readHeader(req, "X-App-Signature") || "",
    token: params.token ?? "",
    schoolUsername: readHeader(req, "X-School-Username") || "",
  };

  let raw: ConvexActionResponse;
  try {
    const upstream = await fetch(`${env.CONVEX_URL.replace(/\/+$/, "")}/api/action`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: "ebcHttp:handle", args, format: "json" }),
    });
    raw = (await upstream.json()) as ConvexActionResponse;
  } catch {
    return fail("Server EBC tidak bisa dihubungi.", 502);
  }

  if (raw.status === "error") {
    return fail(raw.errorMessage ?? "Kesalahan di server EBC.", 500);
  }
  if (!raw.value) {
    return fail("Respons server EBC tidak dikenali.", 502);
  }

  // Bentuk kontrak — persis yang dibaca client
  return json(
    { status: raw.value.status, message: raw.value.message, data: raw.value.data },
    raw.value.status ? 200 : raw.value.httpStatus,
  );
}

/* ═══════════════════════════════════════════
   ADAPTER 1 — Cloudflare Worker
   ═══════════════════════════════════════════
   Simpan sebagai worker.ts, lalu:

     npx wrangler deploy worker.ts

   wrangler.toml:
     name = "ymh-ebc-shim"
     main = "worker.ts"
     compatibility_date = "2025-01-01"

   Untuk route /index.php, tambahkan route Worker:

     [[routes]]
     pattern = "<domain-anda>/*"
     zone = "<domain-anda>"
   ═══════════════════════════════════════════ */
export default {
  async fetch(request: Request, env: ShimEnv): Promise<Response> {
    return handleEbcRequest(request, env);
  },
};

/* ═══════════════════════════════════════════
   ADAPTER 2 — Node / Express / Hono
   ═══════════════════════════════════════════
   Pakai `toNodeHandler` kalau frameworkmu butuh
   gaya Node (req, res) alih-alih Web standard:

     import { toNodeHandler } from "./ebc-shim";

     app.all("/index.php", toNodeHandler(process.env));
   ═══════════════════════════════════════════ */
export function toNodeHandler(env: ShimEnv) {
  return async (req: {
    method?: string;
    url?: string;
    headers: Record<string, string | string[] | undefined>;
  }, res: {
    status: (code: number) => {
      set: (v: string) => void;
      end: (body?: string) => void;
    };
    setHeader: (k: string, v: string) => void;
    end: (body?: string) => void;
  }): Promise<void> => {
    const host = req.headers.host ?? "localhost";
    const method = req.method ?? "GET";
    const path = req.url ?? "/index.php";
    const rawBody =
      method === "POST"
        ? await new Promise<string>((resolve) => {
            let data = "";
            (req as unknown as { on: (e: string, cb: (c: unknown) => void) => void }).on("data", (chunk) => {
              data += String(chunk);
            });
            (req as unknown as { on: (e: string, cb: (c: unknown) => void) => void }).on("end", () => resolve(data));
          })
        : "";

    const request = new Request(`http://${host}${path}`, {
      method,
      headers: req.headers as Record<string, string>,
      body: method === "POST" ? rawBody : undefined,
    });

    const response = await handleEbcRequest(request, env);
    res.status(response.status);
    response.headers.forEach((value, key) => res.setHeader(key, value));
    res.end(await response.text());
  };
}
