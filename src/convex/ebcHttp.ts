import { v } from "convex/values";
import { action } from "./_generated/server";
import { dispatchEbcRequest } from "./ebcDispatch";

/* ═══════════════════════════════════════════
   EBC — transport action
   ───────────────────────────────────────────
   Deployment Freebuff ini TIDAK menyajikan custom
   HTTP route ( `/index.php` balas 404, begitu juga
   route bawaan Convex Auth). Yang tersedia hanya
   endpoint fungsi bawaan Convex:

       POST https://<deployment>.convex.cloud/api/action

   Jadi kontrak yang sama diekspos lewat action ini
   dengan payload:

       { "path": "ebcHttp:handle",
         "args": { "x": "config", "code": "YMH", "apiKey": "..." },
         "format": "json" }

   Logikanya identik dengan http.ts (satu fungsi:
   dispatchEbcRequest) — jadi begitu deployment
   menyajarkan HTTP route, keduanya konsisten.
   ═══════════════════════════════════════════ */

export const handle = action({
  args: {
    x: v.string(),
    code: v.optional(v.string()),
    username: v.optional(v.string()),
    slug: v.optional(v.string()),
    reset_code: v.optional(v.string()),
    apiKey: v.optional(v.string()),
    deviceId: v.optional(v.string()),
    platform: v.optional(v.string()),
    appVersion: v.optional(v.string()),
    installSource: v.optional(v.string()),
    packageName: v.optional(v.string()),
    signature: v.optional(v.string()),
    token: v.optional(v.string()),
    schoolUsername: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const res = await dispatchEbcRequest(ctx, args);
    return { status: res.status, message: res.message, data: res.data, httpStatus: res.httpStatus };
  },
});
