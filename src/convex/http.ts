import { anyApi, httpActionGeneric, httpRouter } from "convex/server";
import { auth } from "./auth";
import { dispatchEbcRequest } from "./ebcDispatch";

/* ═══════════════════════════════════════════
   EBC HTTP API — transport `index.php`
   ───────────────────────────────────────────
   Meniru kontrak server EBC:

     <BASE_URL>/index.php?x=<aksi>&...

   Semua respons dibungkus:
     { "status": true|false, "message": "...", "data": { ... } }

   Endpoint (kontrak asli yang dipanggil APK):
     GET  x=config                 (&code= | &username=)
     GET  x=exams                  (&code=)
     GET  x=announcements          (&code=)
     GET  x=calendar               (&code=)
     GET  x=menus                  (&code=)
     GET  x=page                   (&slug=&code=)
     POST x=register_device        (form-urlencoded)
     GET  x=verify_violation_reset (&code=&reset_code=)

   Wajib: header X-API-KEY valid (kunci milik kita
   sendiri, BUKAN kunci EBC asli).

   CATATAN PENTING: deployment Freebuff saat ini
   tidak menyajikan custom HTTP route sama sekali —
   `/index.php` membalas 404. Karena itu kontrak yang
   sama juga diekspos lewat action `ebcHttp:handle`.
   Lihat src/convex/ebcHttp.ts. Logika keduanya
   shared lewat dispatchEbcRequest.
   ═══════════════════════════════════════════ */

const http = httpRouter();

/* Convex Auth registering its routes in a try/catch.
   auth.config.ts reads process.env.CONVEX_SITE_URL — if that env var is
   empty, the auth module throws at import time, and since this file
   imports it, ALL routes in this file (including the EBC ones)
   fail to register and the whole file 404s. Isolating it with
   try/catch makes the EBC routes register even if auth is unavailable. */
try {
  auth.addHttpRoutes(http);
} catch (err) {
  console.error("Gagal mendaftarkan route Convex Auth (EBC route tetap aktif):", err);
}

const CORS_HEADERS: Record<string, string> = {
  "Content-Type": "application/json; charset=utf-8",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Cache-Control": "no-store",
};

function toResponse(res: { status: boolean; message: string; data: unknown; httpStatus: number }): Response {
  return new Response(JSON.stringify({ status: res.status, message: res.message, data: res.data }), {
    status: res.status ? 200 : res.httpStatus,
    headers: CORS_HEADERS,
  });
}

/** Header device yang diwahidai APK. */
function deviceHeaders(req: Request) {
  return {
    deviceId: req.headers.get("X-Device-ID") ?? "",
    packageName: req.headers.get("X-Package-Name") ?? "",
    signature: req.headers.get("X-App-Signature") ?? "",
    appVersion: req.headers.get("X-App-Version") ?? "",
    installSource: req.headers.get("X-Install-Source") ?? "",
    schoolUsername: req.headers.get("X-School-Username") ?? "",
  };
}

function paramsFromQuery(req: Request) {
  const url = new URL(req.url);
  const headers = deviceHeaders(req);
  return {
    x: url.searchParams.get("x") ?? "",
    code: url.searchParams.get("code") ?? "",
    username: url.searchParams.get("username") ?? "",
    slug: url.searchParams.get("slug") ?? "",
    reset_code: url.searchParams.get("reset_code") ?? "",
    apiKey: req.headers.get("X-API-KEY") ?? "",
    deviceId: headers.deviceId,
    packageName: headers.packageName,
    signature: headers.signature,
    appVersion: headers.appVersion,
    installSource: headers.installSource,
    schoolUsername: headers.schoolUsername,
  };
}

/* ═══════════════════════════════════════════
   GET /index.php
   ═══════════════════════════════════════════ */
http.route({
  path: "/index.php",
  method: "GET",
  handler: httpActionGeneric(async (ctx, request) => {
    return toResponse(await dispatchEbcRequest(ctx, paramsFromQuery(request)));
  }),
});

/* ═══════════════════════════════════════════
   POST /index.php?x=register_device  (form-urlencoded)
   ═══════════════════════════════════════════ */
http.route({
  path: "/index.php",
  method: "POST",
  handler: httpActionGeneric(async (ctx, request) => {
    const url = new URL(request.url);
    const action = (url.searchParams.get("x") ?? "").trim();
    if (action !== "register_device") {
      return toResponse({
        status: false,
        message: "Endpoint ini hanya menerima POST untuk 'register_device'.",
        data: {},
        httpStatus: 405,
      });
    }

    let form: FormData;
    try {
      form = await request.formData();
    } catch {
      return toResponse({
        status: false,
        message: "Body harus berupa form-urlencoded.",
        data: {},
        httpStatus: 400,
      });
    }
    const get = (k: string) => {
      const v = form.get(k);
      return typeof v === "string" ? v.trim() : "";
    };

    const headers = deviceHeaders(request);
    return toResponse(
      await dispatchEbcRequest(ctx, {
        x: action,
        code: get("code"),
        username: get("username"),
        apiKey: request.headers.get("X-API-KEY") ?? "",
        deviceId: headers.deviceId || get("device_id"),
        platform: get("platform") || "android",
        appVersion: get("app_version") || headers.appVersion,
        installSource: headers.installSource,
        packageName: headers.packageName,
        signature: headers.signature,
        token: get("token"),
        schoolUsername: headers.schoolUsername,
      }),
    );
  }),
});

/* Preflight CORS */
http.route({
  path: "/index.php",
  method: "OPTIONS",
  handler: httpActionGeneric(async () => new Response(null, { status: 204, headers: CORS_HEADERS })),
});

/* Health check — dipakai EbcServer untuk memastikan route hidup */
http.route({
  path: "/ebc-health",
  method: "GET",
  handler: httpActionGeneric(async () =>
    new Response(JSON.stringify({ status: true, message: "EBC HTTP layer aktif", data: {} }), {
      status: 200,
      headers: CORS_HEADERS,
    }),
  ),
});

void anyApi;

export default http;
