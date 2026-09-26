/* Smoke test untuk src/server/ebc-shim.ts
   Jalankan:  bun run scripts/ebc-smoke.ts <CONVEX_URL> <API_KEY> [SCHOOL_CODE]
   Tidak ikut bundling aplikasi (di luar tsconfig include). */

import { handleEbcRequest } from "../src/server/ebc-shim";

const CONVEX_URL = process.argv[2] ?? "";
const API_KEY = process.argv[3] ?? "";
const CODE = process.argv[4] ?? "YMH";

if (!CONVEX_URL || !API_KEY) {
  console.error("Pakai: bun run scripts/ebc-smoke.ts <CONVEX_URL> <API_KEY> [SCHOOL_CODE]");
  process.exit(1);
}

const env = { CONVEX_URL, EBC_API_KEY: API_KEY };

async function call(
  label: string,
  path: string,
  init?: RequestInit,
  expectReject = false,
) {
  const req = new Request(`https://shim.test/index.php${path}`, {
    method: init?.method ?? "GET",
    headers: {
      "X-API-KEY": API_KEY,
      "X-Device-ID": "smoke-device-01",
      "X-App-Version": "4.1",
      "X-Install-Source": "sideload",
      "X-Package-Name": "com.ymh.ebc",
      "X-App-Signature": "SHA256:smoke",
      "X-School-Username": "sitinur",
      ...(init?.headers as Record<string, string> | undefined),
    },
    body: init?.body,
  });

  const res = await handleEbcRequest(req, env);
  const text = await res.text();
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    parsed = text;
  }

  const envelope = parsed as { status?: boolean; message?: string; data?: unknown };
  // expectReject=true berarti penolakan itu hasil yang BENAR
  const good = expectReject ? !envelope.status : !!envelope.status;
  const icon = good ? "OK  " : "FAIL";
  const suffix = expectReject ? " (penolakan sesuai harapan)" : "";
  console.log(`${icon} [${res.status}] ${label} → ${envelope.message ?? ""}${suffix}`);
  if (!good) process.exitCode = 1;
  return { res, parsed: envelope };
}

console.log(`\nEBC shim smoke test → ${CONVEX_URL}\n`);

// 1. health
await call("health", "?x=health");

// 2. config
const cfg = await call("config?code", `?x=config&code=${CODE}`);
const data = cfg.parsed.data as { school?: { name?: string; is_pro?: boolean; pro_days_left?: number } } | undefined;
console.log(`     sekolah: ${data?.school?.name} · pro=${data?.school?.is_pro} · sisa_hari=${data?.school?.pro_days_left}`);
console.log(`     tipe angka active_exams/pro_days_left harus integer (bukan float)`);
console.log(`     contoh JSON: ${JSON.stringify(data?.school?.pro_days_left)}`);

// 3. exams
const ex = await call("exams?code", `?x=exams&code=${CODE}`);
console.log(`     jumlah ujian: ${Array.isArray(ex.parsed.data) ? ex.parsed.data.length : "?"}`);

// 4. menus / announcements / calendar
await call("menus?code", `?x=menus&code=${CODE}`);
await call("announcements?code", `?x=announcements&code=${CODE}`);
await call("calendar?code", `?x=calendar&code=${CODE}`);

// 5. page
await call("page?slug=profil", `?x=page&code=${CODE}&slug=profil`);

// 6. register_device via POST form-urlencoded
await call("register_device (POST form)", "?x=register_device", {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: `code=${CODE}&username=sitinur&token=fcm-abc&platform=android&app_version=4.1`,
});

// 7. verify_violation_reset dengan kode ngawur → harus DITOLAK
await call("verify_violation_reset (kode ngawur)", `?x=verify_violation_reset&code=${CODE}&reset_code=ZZZZZZ`, undefined, true);

// 8. tanpa X-API-KEY → harus DITOLAK
const noKey = new Request(`https://shim.test/index.php?x=config&code=${CODE}`, { method: "GET" });
const noKeyRes = await handleEbcRequest(noKey, { CONVEX_URL });
const noKeyBody = (await noKeyRes.json()) as { status?: boolean; message?: string };
if (noKeyBody.status) process.exitCode = 1;
console.log(`${noKeyBody.status ? "FAIL" : "OK  "} [${noKeyRes.status}] tanpa X-API-KEY → ${noKeyBody.message} (penolakan sesuai harapan)`);

// 9. aksi tidak dikenal → harus DITOLAK
await call("aksi ngawur", `?x=ngawur`, undefined, true);

console.log("\nSelesai.\n");
