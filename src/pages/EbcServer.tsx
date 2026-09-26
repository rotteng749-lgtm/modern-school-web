import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { useMutation, useQuery } from "convex/react";
import type { GenericId } from "convex/values";
import QRCode from "qrcode";
import {
  ArrowLeft,
  KeyRound,
  Server,
  School,
  Layers,
  MonitorSmartphone,
  Megaphone,
  RotateCcw,
  QrCode,
  Download,
  Plus,
  Trash2,
  Check,
  Copy,
  Loader2,
  ShieldCheck,
  Plug,
  Terminal,
  BookMarked,
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import { DashboardShell } from "@/components/DashboardShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card3D } from "@/components/Card3D";
import { toast } from "sonner";
import {
  configFromExamItem,
  configPayloadJson,
  downloadCbtFile,
  validateCbtConfig,
  type EbcLocalConfig,
} from "@/lib/ebc-config";

/* ═══════════════════════════════════════════
   EBC Server — konsol admin untuk layer HTTP
   ═══════════════════════════════════════════ */

const API_KEY_STORE = "msw-ebc-api-key";
const SCHOOL_STORE = "msw-ebc-school-code";

const CONVEX_URL = import.meta.env.VITE_CONVEX_URL || "";
const BASE_URL = CONVEX_URL ? `${CONVEX_URL.replace(/\/+$/, "")}/index.php` : "(VITE_CONVEX_URL belum di-set)";

export default function EbcServer() {
  const [apiKey, setApiKey] = useState<string>("");
  const [keyInput, setKeyInput] = useState<string>("");
  const [schoolCode, setSchoolCode] = useState<string>("");

  useEffect(() => {
    setApiKey(localStorage.getItem(API_KEY_STORE) ?? "");
    setKeyInput(localStorage.getItem(API_KEY_STORE) ?? "");
    setSchoolCode(localStorage.getItem(SCHOOL_STORE) ?? "");
  }, []);

  const bootstrap = useMutation(api.ebcAdmin.ensureBootstrap);
  const listSchools = useQuery(api.ebcAdmin.listSchools, apiKey ? { apiKey } : "skip");

  // Simpan sekolah pertama sebagai default
  useEffect(() => {
    if (!schoolCode && listSchools && listSchools.length > 0) {
      setSchoolCode(listSchools[0].code);
    }
  }, [listSchools, schoolCode]);

  useEffect(() => {
    if (schoolCode) localStorage.setItem(SCHOOL_STORE, schoolCode);
  }, [schoolCode]);

  const saveKey = () => {
    const k = keyInput.trim();
    if (!k) {
      toast.error("API key kosong.");
      return;
    }
    localStorage.setItem(API_KEY_STORE, k);
    setApiKey(k);
    toast.success("API key disimpan di perangkat ini.");
  };

  const clearKey = () => {
    localStorage.removeItem(API_KEY_STORE);
    setApiKey("");
    setKeyInput("");
  };

  /* ── Belum ada key: jalankan bootstrap sekali ── */
  if (!apiKey) {
    return (
      <DashboardShell>
        <div className="mx-auto max-w-2xl space-y-5">
          <BackLink />
          <Card3D intensity={3} className="p-6 obsidian-sheen">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <Server className="size-5 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-bold">Server EBC belum disiapkan</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Server ini butuh satu sekolah + satu API key sebelum endpoint HTTP bisa dipakai.
                  Proses ini cukup sekali.
                </p>
              </div>
            </div>

            <Button
              className="mt-5 w-full"
              onClick={async () => {
                try {
                  const res = await bootstrap({});
                  if (res.created && "apiKey" in res && res.apiKey) {
                    setKeyInput(res.apiKey);
                    localStorage.setItem(API_KEY_STORE, res.apiKey);
                    setApiKey(res.apiKey);
                    toast.success(`Sekolah '${res.schoolCode}' dibuat. API key sudah disimpan.`);
                  } else {
                    toast.info(res.reason ?? "Database sudah terisi.");
                  }
                } catch (err) {
                  toast.error(err instanceof Error ? err.message : "Gagal menyiapkan server.");
                }
              }}
            >
              <Plug className="size-4" /> Siapkan Server Sekarang
            </Button>

            <div className="mt-6 border-t pt-5">
              <Label className="text-xs">Atau pakai API key yang sudah ada</Label>
              <div className="mt-2 flex gap-2">
                <Input
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  placeholder="ymh_xxxxxxxxxxxx_yyyyyyyyyyyy"
                  className="font-mono text-xs"
                />
                <Button variant="outline" onClick={saveKey}>
                  Pakai
                </Button>
              </div>
            </div>
          </Card3D>
        </div>
      </DashboardShell>
    );
  }

  /* ── Sudah punya key ── */
  return (
    <DashboardShell>
      <div className="space-y-5">
        <BackLink />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-xl font-bold tracking-tight">
              <Server className="size-5 text-primary" /> EBC Server
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Kontrak HTTP untuk Exam Browser Client — <code className="text-xs">index.php?x=…</code>
            </p>
          </div>
          {listSchools && listSchools.length > 0 && (
            <div className="space-y-1.5">
              <Label className="text-xs">Sekolah aktif</Label>
              <select
                value={schoolCode}
                onChange={(e) => setSchoolCode(e.target.value)}
                className="h-9 rounded-md border bg-background px-2 text-sm"
              >
                {listSchools.map((s) => (
                  <option key={s.code} value={s.code}>
                    {s.name} ({s.code})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <ConnectionPanel apiKey={apiKey} onClear={clearKey} />

        <Tabs defaultValue="sekolah">
          <TabsList className="flex-wrap">
            <TabsTrigger value="sekolah"><School className="size-3.5" /> Sekolah</TabsTrigger>
            <TabsTrigger value="kelas"><Layers className="size-3.5" /> Kelas</TabsTrigger>
            <TabsTrigger value="ujian"><MonitorSmartphone className="size-3.5" /> Ujian Kiosk</TabsTrigger>
            <TabsTrigger value="konten"><Megaphone className="size-3.5" /> Konten</TabsTrigger>
            <TabsTrigger value="device"><Plug className="size-3.5" /> Device</TabsTrigger>
            <TabsTrigger value="reset"><ShieldCheck className="size-3.5" /> Reset</TabsTrigger>
            <TabsTrigger value="key"><KeyRound className="size-3.5" /> API Key</TabsTrigger>
            <TabsTrigger value="qr"><QrCode className="size-3.5" /> QR / .cbt</TabsTrigger>
            <TabsTrigger value="api"><Terminal className="size-3.5" /> API</TabsTrigger>
          </TabsList>

          <TabsContent value="sekolah"><SchoolsTab apiKey={apiKey} /></TabsContent>
          <TabsContent value="kelas"><ClassesTab apiKey={apiKey} schoolCode={schoolCode} /></TabsContent>
          <TabsContent value="ujian"><ExamsTab apiKey={apiKey} schoolCode={schoolCode} /></TabsContent>
          <TabsContent value="konten"><ContentTab apiKey={apiKey} schoolCode={schoolCode} /></TabsContent>
          <TabsContent value="device"><DevicesTab apiKey={apiKey} schoolCode={schoolCode} /></TabsContent>
          <TabsContent value="reset"><ResetTab apiKey={apiKey} schoolCode={schoolCode} /></TabsContent>
          <TabsContent value="key"><ApiKeyTab apiKey={apiKey} schoolCode={schoolCode} /></TabsContent>
          <TabsContent value="qr"><QrTab /></TabsContent>
          <TabsContent value="api">
            <ApiDocsTab apiKey={apiKey} schoolCode={schoolCode} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardShell>
  );
}

function BackLink() {
  return (
    <Link to="/dashboard" className="inline-flex">
      <Button variant="ghost" size="sm" className="-ml-2">
        <ArrowLeft className="size-4" /> Dashboard
      </Button>
    </Link>
  );
}

/* ═══════════════════════════════════════════
   Panel koneksi + endpoint reference
   ═══════════════════════════════════════════ */
function ConnectionPanel({ apiKey, onClear }: { apiKey: string; onClear: () => void }) {
  const [probe, setProbe] = useState<{ ok: boolean; message: string; ms: number } | null>(null);
  const [testing, setTesting] = useState(false);

  const test = async () => {
    setTesting(true);
    const t0 = performance.now();
    try {
      const res = await fetch(`${BASE_URL}?x=config&code=YMH`, {
        headers: { "X-API-KEY": apiKey, "X-Device-ID": "console-test", "X-App-Version": "1.0" },
      });
      const body = (await res.json()) as { status: boolean; message: string };
      setProbe({ ok: !!body.status, message: body.message, ms: Math.round(performance.now() - t0) });
    } catch (err) {
      setProbe({ ok: false, message: err instanceof Error ? err.message : "Gagal", ms: 0 });
    }
    setTesting(false);
  };

  const endpoints = [
    "config", "exams", "announcements", "calendar", "menus", "page",
    "register_device", "verify_violation_reset",
  ];

  return (
    <Card3D intensity={2} className="p-5 obsidian-sheen">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-muted-foreground">BASE_URL untuk APK</p>
          <div className="mt-1 flex items-center gap-2">
            <code className="min-w-0 flex-1 truncate rounded-md border bg-muted px-2 py-1.5 text-[11px]">
              {BASE_URL}
            </code>
            <Button
              variant="outline"
              size="icon-sm"
              aria-label="Salin base URL"
              onClick={() => {
                navigator.clipboard.writeText(BASE_URL);
                toast.success("Disalin.");
              }}
            >
              <Copy className="size-4" />
            </Button>
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">
            Endpoint: {endpoints.map((e) => `x=${e}`).join(" · ")}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button variant="outline" size="sm" onClick={test} disabled={testing}>
            {testing ? <Loader2 className="size-3.5 animate-spin" /> : <Plug className="size-3.5" />}
            Uji Koneksi
          </Button>
          <Button variant="ghost" size="sm" onClick={onClear}>Lepas key</Button>
        </div>
      </div>

      {probe && (
        <div
          className={`mt-3 flex items-center gap-2 rounded-lg border p-2.5 text-xs ${
            probe.ok
              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
              : "border-red-500/40 bg-red-500/10 text-red-400"
          }`}
        >
          {probe.ok ? <Check className="size-4" /> : <AlertDot />}
          <span>{probe.message}</span>
          <span className="ml-auto font-mono text-[10px] opacity-70">{probe.ms}ms</span>
        </div>
      )}
    </Card3D>
  );
}

function AlertDot() {
  return <span className="size-2 shrink-0 rounded-full bg-current" />;
}

/* ═══════════════════════════════════════════
   Sekolah
   ═══════════════════════════════════════════ */
type SchoolRow = {
  _id: string;
  code: string;
  name: string;
  username: string;
  packageName?: string;
  academicYear?: string;
  institutionType?: string;
  city?: string;
  province?: string;
  logoUrl?: string;
  isPro?: boolean;
  proType?: string;
  proExpiresAt?: string;
  msg?: string;
  examCount?: number;
};

function SchoolsTab({ apiKey }: { apiKey: string }) {
  const schools = useQuery(api.ebcAdmin.listSchools, { apiKey });
  const saveSchool = useMutation(api.ebcAdmin.saveSchool);
  const [form, setForm] = useState<Partial<SchoolRow>>({});

  const submit = async () => {
    if (!form.code || !form.name || !form.username) {
      toast.error("Kode, nama, dan username wajib diisi.");
      return;
    }
    try {
      await saveSchool({
        apiKey,
        school: {
          code: form.code,
          name: form.name,
          username: form.username,
          packageName: form.packageName,
          academicYear: form.academicYear,
          institutionType: form.institutionType,
          city: form.city,
          province: form.province,
          logoUrl: form.logoUrl,
          isPro: form.isPro,
          proType: form.proType,
          proExpiresAt: form.proExpiresAt,
          msg: form.msg,
        },
      });
      toast.success("Sekolah disimpan.");
      setForm({});
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menyimpan.");
    }
  };

  return (
    <div className="space-y-4">
      <Card3D intensity={2} className="p-5 obsidian-sheen">
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Daftar Sekolah
        </h2>
        {!schools ? (
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        ) : schools.length === 0 ? (
          <p className="text-sm text-muted-foreground">Belum ada sekolah.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs text-muted-foreground">
                  <th className="p-2 font-medium">Kode</th>
                  <th className="p-2 font-medium">Nama</th>
                  <th className="p-2 font-medium">Username</th>
                  <th className="p-2 font-medium">Ujian</th>
                  <th className="p-2 font-medium">PRO</th>
                  <th className="p-2 font-medium" />
                </tr>
              </thead>
              <tbody>
                {schools.map((s) => (
                  <tr key={s._id} className="border-b last:border-0">
                    <td className="p-2 font-mono text-xs">{s.code}</td>
                    <td className="p-2">{s.name}</td>
                    <td className="p-2 font-mono text-xs">{s.username}</td>
                    <td className="p-2 text-xs">{s.examCount ?? 0}</td>
                    <td className="p-2 text-xs">
                      {s.isPro ? `s/d ${s.proExpiresAt ?? "-"}` : "tidak"}
                    </td>
                    <td className="p-2 text-right">
                      <Button variant="ghost" size="sm" onClick={() => setForm(s)}>
                        Edit
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card3D>

      <Card3D intensity={2} className="p-5 obsidian-sheen">
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {form._id ? "Ubah Sekolah" : "Tambah Sekolah"}
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Kode sekolah (school_code)">
            <Input
              value={form.code ?? ""}
              onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
              placeholder="YMH"
              className="font-mono"
            />
          </Field>
          <Field label="Nama sekolah">
            <Input value={form.name ?? ""} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <Field label="Username sekolah">
            <Input
              value={form.username ?? ""}
              onChange={(e) => setForm({ ...form, username: e.target.value.toLowerCase() })}
              placeholder="ymh"
              className="font-mono"
            />
          </Field>
          <Field label="Package name">
            <Input value={form.packageName ?? ""} onChange={(e) => setForm({ ...form, packageName: e.target.value })} placeholder="com.ymh.ebc" className="font-mono" />
          </Field>
          <Field label="Tahun ajaran">
            <Input value={form.academicYear ?? ""} onChange={(e) => setForm({ ...form, academicYear: e.target.value })} placeholder="2025/2026" />
          </Field>
          <Field label="Jenis institusi">
            <Input value={form.institutionType ?? ""} onChange={(e) => setForm({ ...form, institutionType: e.target.value })} placeholder="MI / Pesantren" />
          </Field>
          <Field label="Kota">
            <Input value={form.city ?? ""} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          </Field>
          <Field label="Provinsi">
            <Input value={form.province ?? ""} onChange={(e) => setForm({ ...form, province: e.target.value })} />
          </Field>
          <Field label="URL logo">
            <Input value={form.logoUrl ?? ""} onChange={(e) => setForm({ ...form, logoUrl: e.target.value })} placeholder="https://…" />
          </Field>
          <Field label="PRO berakhir (YYYY-MM-DD)">
            <Input value={form.proExpiresAt ?? ""} onChange={(e) => setForm({ ...form, proExpiresAt: e.target.value })} placeholder="2026-12-31" />
          </Field>
          <Field label="Jenis lisensi">
            <Input value={form.proType ?? ""} onChange={(e) => setForm({ ...form, proType: e.target.value })} placeholder="school" />
          </Field>
        </div>

        <div className="mt-3 flex items-center gap-3">
          <Switch
            checked={!!form.isPro}
            onCheckedChange={(c) => setForm({ ...form, isPro: c })}
            id="is-pro"
          />
          <Label htmlFor="is-pro" className="text-sm">Lisensi PRO aktif</Label>
        </div>

        <div className="mt-3">
          <Field label="Pesan banner (msg)">
            <Textarea rows={2} value={form.msg ?? ""} onChange={(e) => setForm({ ...form, msg: e.target.value })} />
          </Field>
        </div>

        <div className="mt-4 flex gap-2">
          <Button onClick={submit}>
            <Check className="size-4" /> Simpan Sekolah
          </Button>
          {form._id && (
            <Button variant="ghost" onClick={() => setForm({})}>Batal</Button>
          )}
        </div>
      </Card3D>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Kelas
   ═══════════════════════════════════════════ */
function ClassesTab({ apiKey, schoolCode }: { apiKey: string; schoolCode: string }) {
  const classes = useQuery(api.ebcAdmin.listClasses, schoolCode ? { apiKey, schoolCode } : "skip");
  const saveClass = useMutation(api.ebcAdmin.saveClass);
  const deleteClass = useMutation(api.ebcAdmin.deleteClass);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [order, setOrder] = useState(0);

  return (
    <Card3D intensity={2} className="p-5 obsidian-sheen">
      <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Kelas — {schoolCode || "pilih sekolah"}
      </h2>

      <div className="flex flex-wrap items-end gap-2">
        <Field label="Kode" className="w-28">
          <Input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="MI6" className="font-mono" />
        </Field>
        <Field label="Nama kelas" className="min-w-40 flex-1">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="MI Kelas 6" />
        </Field>
        <Field label="Urutan" className="w-20">
          <Input type="number" value={order} onChange={(e) => setOrder(Number(e.target.value))} />
        </Field>
        <Button
          onClick={async () => {
            if (!code || !name || !schoolCode) {
              toast.error("Kode, nama, dan sekolah wajib diisi.");
              return;
            }
            await saveClass({ apiKey, schoolCode, code, name, sortOrder: order });
            setCode(""); setName(""); setOrder(0);
            toast.success("Kelas ditambahkan.");
          }}
        >
          <Plus className="size-4" /> Tambah
        </Button>
      </div>

      <div className="mt-5 space-y-2">
        {(classes ?? []).map((c) => (
          <div key={c._id} className="flex items-center justify-between rounded-lg border p-3 text-sm">
            <div>
              <span className="font-mono text-xs text-muted-foreground">{c.code}</span>{" "}
              <span className="font-medium">{c.name}</span>
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => deleteClass({ apiKey, id: c._id })}
              aria-label="Hapus kelas"
            >
              <Trash2 className="size-4 text-red-500" />
            </Button>
          </div>
        ))}
        {classes && classes.length === 0 && (
          <p className="text-sm text-muted-foreground">Belum ada kelas.</p>
        )}
      </div>
    </Card3D>
  );
}

/* ═══════════════════════════════════════════
   Ujian — editor kiosk
   ═══════════════════════════════════════════ */
type KioskForm = {
  examLocalId: string;
  schoolCode?: string;
  classId?: number;
  url?: string;
  cbtUrl?: string;
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
  startTime?: string;
  endTime?: string;
  txtColor?: string;
  btnColor?: string;
};

function ExamsTab({ apiKey, schoolCode }: { apiKey: string; schoolCode: string }) {
  const exams = useQuery(api.ebcAdmin.listServerExams, apiKey ? { apiKey } : "skip");
  const save = useMutation(api.ebcAdmin.saveExamKiosk);
  const [form, setForm] = useState<KioskForm | null>(null);

  return (
    <div className="space-y-4">
      <Card3D intensity={2} className="p-5 obsidian-sheen">
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Ujian di server
        </h2>
        {!exams ? (
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        ) : exams.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Belum ada ujian dipublish. Publish dulu dari halaman Sesi EBC.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs text-muted-foreground">
                  <th className="p-2 font-medium">Ujian</th>
                  <th className="p-2 font-medium">Kelas</th>
                  <th className="p-2 font-medium">Sekolah</th>
                  <th className="p-2 font-medium">Kiosk</th>
                  <th className="p-2 font-medium" />
                </tr>
              </thead>
              <tbody>
                {exams.map((e) => (
                  <tr key={e._id} className="border-b last:border-0">
                    <td className="p-2">{e.name}</td>
                    <td className="p-2 text-xs">{e.className}</td>
                    <td className="p-2 font-mono text-xs">{e.schoolCode ?? "-"}</td>
                    <td className="p-2 text-xs">
                      {e.screenshotEnabled ? "ss" : "—"} {e.copyPasteEnabled ? "cp" : "—"}
                    </td>
                    <td className="p-2 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setForm({
                            examLocalId: e.localId,
                            schoolCode,
                            classId: e.classId,
                            url: e.url,
                            cbtUrl: e.cbtUrl,
                            schoolName: e.schoolName,
                            logoUrl: e.logoUrl,
                            customUa: e.customUa,
                            timerEnabled: e.timerEnabled,
                            timerMinutes: e.timerMinutes,
                            tokenInEnabled: e.tokenInEnabled,
                            tokenIn: e.tokenIn,
                            tokenOut: e.tokenOut,
                            linkOut: e.linkOut,
                            welcomeMsg: e.welcomeMsg,
                            clearCacheEnabled: e.clearCacheEnabled,
                            screenshotEnabled: e.screenshotEnabled,
                            pinScreenEnabled: e.pinScreenEnabled,
                            copyPasteEnabled: e.copyPasteEnabled,
                            timeRestrictionEnabled: e.timeRestrictionEnabled,
                            startTime: e.startTime,
                            endTime: e.endTime,
                            txtColor: e.txtColor,
                            btnColor: e.btnColor,
                          })
                        }
                      >
                        Atur Kiosk
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card3D>

      {form && (
        <Card3D intensity={2} className="space-y-4 p-5 obsidian-sheen">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Konfigurasi Kiosk
          </h2>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="CBT URL (dibuka WebView)">
              <Input value={form.url ?? ""} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://…" />
            </Field>
            <Field label="URL asal (cbtUrl)">
              <Input value={form.cbtUrl ?? ""} onChange={(e) => setForm({ ...form, cbtUrl: e.target.value })} placeholder="https://…" />
            </Field>
            <Field label="classId (angka)">
              <Input type="number" value={form.classId ?? 0} onChange={(e) => setForm({ ...form, classId: Number(e.target.value) })} />
            </Field>
            <Field label="Nama sekolah (ExamItem)">
              <Input value={form.schoolName ?? ""} onChange={(e) => setForm({ ...form, schoolName: e.target.value })} />
            </Field>
            <Field label="URL logo">
              <Input value={form.logoUrl ?? ""} onChange={(e) => setForm({ ...form, logoUrl: e.target.value })} />
            </Field>
            <Field label="Custom User-Agent">
              <Input value={form.customUa ?? ""} onChange={(e) => setForm({ ...form, customUa: e.target.value })} className="text-xs" />
            </Field>
            <Field label="Timer (menit)">
              <Input type="number" value={form.timerMinutes ?? 60} onChange={(e) => setForm({ ...form, timerMinutes: Number(e.target.value) })} />
            </Field>
            <Field label="Jam mulai (24 jam)">
              <Input value={form.startTime ?? "07:00"} onChange={(e) => setForm({ ...form, startTime: e.target.value })} placeholder="07:00" className="font-mono" />
            </Field>
            <Field label="Jam selesai (24 jam)">
              <Input value={form.endTime ?? "09:00"} onChange={(e) => setForm({ ...form, endTime: e.target.value })} placeholder="09:00" className="font-mono" />
            </Field>
            <Field label="Token masuk">
              <Input value={form.tokenIn ?? ""} onChange={(e) => setForm({ ...form, tokenIn: e.target.value.toUpperCase() })} className="font-mono" />
            </Field>
            <Field label="Token keluar">
              <Input value={form.tokenOut ?? ""} onChange={(e) => setForm({ ...form, tokenOut: e.target.value.toUpperCase() })} className="font-mono" />
            </Field>
            <Field label="Link pemicu auto-exit">
              <Input value={form.linkOut ?? ""} onChange={(e) => setForm({ ...form, linkOut: e.target.value })} placeholder="https://…" />
            </Field>
            <Field label="Warna teks">
              <Input value={form.txtColor ?? "#FFFFFF"} onChange={(e) => setForm({ ...form, txtColor: e.target.value })} className="font-mono" />
            </Field>
            <Field label="Warna tombol">
              <Input value={form.btnColor ?? "#1E88E5"} onChange={(e) => setForm({ ...form, btnColor: e.target.value })} className="font-mono" />
            </Field>
          </div>

          <div className="grid gap-2.5 sm:grid-cols-2">
            <ToggleRow label="Timer aktif" checked={!!form.timerEnabled} onChange={(c) => setForm({ ...form, timerEnabled: c })} />
            <ToggleRow label="Token masuk aktif" checked={!!form.tokenInEnabled} onChange={(c) => setForm({ ...form, tokenInEnabled: c })} />
            <ToggleRow label="Kunci layar (pin screen)" checked={form.pinScreenEnabled !== false} onChange={(c) => setForm({ ...form, pinScreenEnabled: c })} />
            <ToggleRow label="Boleh screenshot" checked={!!form.screenshotEnabled} onChange={(c) => setForm({ ...form, screenshotEnabled: c })} hint="Sebaiknya tetap mati" />
            <ToggleRow label="Boleh copy/paste" checked={!!form.copyPasteEnabled} onChange={(c) => setForm({ ...form, copyPasteEnabled: c })} hint="Sebaiknya tetap mati" />
            <ToggleRow label="Batasi waktu" checked={form.timeRestrictionEnabled !== false} onChange={(c) => setForm({ ...form, timeRestrictionEnabled: c })} />
            <ToggleRow label="Bersihkan cache" checked={form.clearCacheEnabled !== false} onChange={(c) => setForm({ ...form, clearCacheEnabled: c })} />
          </div>

          <div>
            <Field label="Pesan sambutan">
              <Textarea rows={2} value={form.welcomeMsg ?? ""} onChange={(e) => setForm({ ...form, welcomeMsg: e.target.value })} />
            </Field>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={async () => {
                try {
                  await save({ apiKey, ...form });
                  toast.success("Konfigurasi kiosk disimpan.");
                  setForm(null);
                } catch (err) {
                  toast.error(err instanceof Error ? err.message : "Gagal menyimpan.");
                }
              }}
            >
              <Check className="size-4" /> Simpan
            </Button>
            <Button variant="ghost" onClick={() => setForm(null)}>Batal</Button>
          </div>
        </Card3D>
      )}
    </div>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
  hint,
}: {
  label: string;
  checked: boolean;
  onChange: (c: boolean) => void;
  hint?: string;
}) {
  const id = label.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="flex items-center justify-between rounded-lg border p-3">
      <div>
        <Label htmlFor={id} className="text-sm">{label}</Label>
        {hint && <p className="text-[10px] text-muted-foreground">{hint}</p>}
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

/* ═══════════════════════════════════════════
   Konten: pengumuman / kalender / menu / halaman
   ═══════════════════════════════════════════ */
function ContentTab({ apiKey, schoolCode }: { apiKey: string; schoolCode: string }) {
  const [kind, setKind] = useState<"announcements" | "calendarEvents" | "customMenus" | "pages">("announcements");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [startDate, setStartDate] = useState("");
  const [isSlider, setIsSlider] = useState(false);
  const [url, setUrl] = useState("");
  const [slug, setSlug] = useState("");

  const saveAnnouncement = useMutation(api.ebcAdmin.saveAnnouncement);
  const saveCalendar = useMutation(api.ebcAdmin.saveCalendarEvent);
  const saveMenu = useMutation(api.ebcAdmin.saveMenu);
  const savePage = useMutation(api.ebcAdmin.savePage);

  const add = async () => {
    if (!schoolCode) { toast.error("Pilih sekolah dulu."); return; }
    if (!title) { toast.error("Judul wajib diisi."); return; }
    try {
      if (kind === "announcements") {
        await saveAnnouncement({ apiKey, schoolCode, title, content: body, isSlider });
      } else if (kind === "calendarEvents") {
        await saveCalendar({ apiKey, schoolCode, title, startDate: startDate || new Date().toISOString().slice(0, 10), description: body });
      } else if (kind === "customMenus") {
        await saveMenu({ apiKey, schoolCode, title, url, slug });
      } else {
        await savePage({ apiKey, schoolCode, title, slug: slug || title.toLowerCase().replace(/\s+/g, "-"), content: body });
      }
      setTitle(""); setBody(""); setUrl(""); setSlug(""); setIsSlider(false);
      toast.success("Tersimpan.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menyimpan.");
    }
  };

  return (
    <Card3D intensity={2} className="p-5 obsidian-sheen">
      <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Konten Sekolah — {schoolCode || "pilih sekolah"}
      </h2>

      <div className="flex flex-wrap gap-2">
        {([
          ["announcements", "Pengumuman"],
          ["calendarEvents", "Kalender"],
          ["customMenus", "Menu"],
          ["pages", "Halaman"],
        ] as const).map(([k, label]) => (
          <Button key={k} variant={kind === k ? "default" : "outline"} size="sm" onClick={() => setKind(k)}>
            {label}
          </Button>
        ))}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Field label="Judul">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} />
        </Field>
        {kind === "calendarEvents" && (
          <Field label="Tanggal mulai">
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </Field>
        )}
        {(kind === "customMenus" || kind === "pages") && (
          <Field label="Slug">
            <Input value={slug} onChange={(e) => setSlug(e.target.value.toLowerCase())} placeholder="tentang-sekolah" className="font-mono" />
          </Field>
        )}
        {kind === "customMenus" && (
          <Field label="URL">
            <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…" />
          </Field>
        )}
        {kind !== "customMenus" && (
          <Field label="Isi" className="sm:col-span-2">
            <Textarea rows={3} value={body} onChange={(e) => setBody(e.target.value)} />
          </Field>
        )}
      </div>

      {kind === "announcements" && (
        <div className="mt-3 flex items-center gap-3">
          <Switch id="is-slider" checked={isSlider} onCheckedChange={setIsSlider} />
          <Label htmlFor="is-slider" className="text-sm">Tampilkan sebagai slider</Label>
        </div>
      )}

      <Button className="mt-4" onClick={add}>
        <Plus className="size-4" /> Simpan {kind}
      </Button>

      <ContentList apiKey={apiKey} schoolCode={schoolCode} kind={kind} />
    </Card3D>
  );
}

function ContentList({
  apiKey,
  schoolCode,
  kind,
}: {
  apiKey: string;
  schoolCode: string;
  kind: "announcements" | "calendarEvents" | "customMenus" | "pages";
}) {
  const delAnnouncement = useMutation(api.ebcAdmin.deleteAnnouncement);
  const delCalendar = useMutation(api.ebcAdmin.deleteCalendarEvent);
  const delMenu = useMutation(api.ebcAdmin.deleteMenu);
  const delPage = useMutation(api.ebcAdmin.deletePage);

  const data = useQuery(
    api.ebcAdmin.listContentForSchool,
    schoolCode ? { apiKey, schoolCode, kind } : "skip",
  );

  const onDelete = (id: string) => {
    if (kind === "announcements") delAnnouncement({ apiKey, id: id as GenericId<"announcements"> });
    else if (kind === "calendarEvents") delCalendar({ apiKey, id: id as GenericId<"calendarEvents"> });
    else if (kind === "customMenus") delMenu({ apiKey, id: id as GenericId<"customMenus"> });
    else delPage({ apiKey, id: id as GenericId<"pages"> });
  };

  const rows = data ?? [];

  return (
    <div className="mt-5 space-y-2">
      {rows.length === 0 && <p className="text-sm text-muted-foreground">Belum ada data.</p>}
      {rows.map((r) => (
        <div key={r._id} className="flex items-center justify-between rounded-lg border p-3 text-sm">
          <span className="min-w-0 truncate">
            {r.title}
            {r.slug && (
              <span className="ml-2 font-mono text-[11px] text-muted-foreground">/{r.slug}</span>
            )}
          </span>
          <Button variant="ghost" size="icon-sm" onClick={() => onDelete(r._id)} aria-label="Hapus">
            <Trash2 className="size-4 text-red-500" />
          </Button>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════
   Device
   ═══════════════════════════════════════════ */
function DevicesTab({ apiKey, schoolCode }: { apiKey: string; schoolCode: string }) {
  const devices = useQuery(api.ebcAdmin.listDevices, schoolCode ? { apiKey, schoolCode } : "skip");
  const remove = useMutation(api.ebcAdmin.deleteDevice);

  return (
    <Card3D intensity={2} className="p-5 obsidian-sheen">
      <h2 className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Device Terdaftar
      </h2>
      <p className="mb-4 text-[11px] text-muted-foreground">
        Device mendaftarkan diri lewat <code>POST index.php?x=register_device</code>. Header
        X-Device-ID, X-App-Signature, dan X-Install-Source dicatat untuk deteksi clone/tamper.
      </p>

      {!devices ? (
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      ) : devices.length === 0 ? (
        <p className="text-sm text-muted-foreground">Belum ada device.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs text-muted-foreground">
                <th className="p-2 font-medium">Device</th>
                <th className="p-2 font-medium">User</th>
                <th className="p-2 font-medium">Versi</th>
                <th className="p-2 font-medium">Sumber</th>
                <th className="p-2 font-medium">Terakhir seen</th>
                <th className="p-2 font-medium" />
              </tr>
            </thead>
            <tbody>
              {devices.map((d) => (
                <tr key={d._id} className="border-b last:border-0">
                  <td className="p-2">
                    <div className="flex items-center gap-1.5 font-mono text-[11px]">
                      <span className={`size-2 rounded-full ${d.online ? "bg-emerald-500" : "bg-muted-foreground/40"}`} />
                      {d.deviceId.slice(0, 12)}…
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      {d.packageName || "-"} · {d.platform || "-"}
                    </div>
                  </td>
                  <td className="p-2 text-xs">{d.username || "-"}</td>
                  <td className="p-2 text-xs">{d.appVersion || "-"}</td>
                  <td className="p-2 text-xs">{d.installSource || "-"}</td>
                  <td className="p-2 font-mono text-[11px] text-muted-foreground">
                    {new Date(d.lastSeen).toLocaleString("id-ID", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false })}
                  </td>
                  <td className="p-2 text-right">
                    <Button variant="ghost" size="icon-sm" onClick={() => remove({ apiKey, deviceId: d.deviceId })} aria-label="Hapus device">
                      <Trash2 className="size-4 text-red-500" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card3D>
  );
}

/* ═══════════════════════════════════════════
   Kode reset pelanggaran
   ═══════════════════════════════════════════ */
function ResetTab({ apiKey, schoolCode }: { apiKey: string; schoolCode: string }) {
  const codes = useQuery(api.ebcAdmin.listResetCodes, schoolCode ? { apiKey, schoolCode } : "skip");
  const generate = useMutation(api.ebcAdmin.generateResetCode);
  const [last, setLast] = useState<string | null>(null);

  return (
    <Card3D intensity={2} className="p-5 obsidian-sheen">
      <h2 className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Kode Reset Pelanggaran
      </h2>
      <p className="mb-4 text-[11px] text-muted-foreground">
        Siswa memakai kode ini lewat <code>GET index.php?x=verify_violation_reset</code> untuk
        membuka kunci setelah pelanggaran. Kode hanya berlaku sekali dan punya masa berlaku.
      </p>

      <Button
        onClick={async () => {
          const res = await generate({ apiKey, schoolCode, createdBy: "guru", ttlMinutes: 30 });
          setLast(res.resetCode);
          toast.success(`Kode dibuat: ${res.resetCode}`);
        }}
      >
        <RotateCcw className="size-4" /> Generate Kode (30 menit)
      </Button>

      {last && (
        <div className="mt-4 rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-4 text-center">
          <p className="text-2xl font-mono font-bold tracking-[0.3em]">{last}</p>
        </div>
      )}

      <div className="mt-5 space-y-2">
        {(codes ?? []).map((c) => (
          <div key={c._id} className="flex items-center justify-between rounded-lg border p-3 text-sm">
            <span className="font-mono tracking-widest">{c.resetCode}</span>
            <Badge variant={c.used ? "secondary" : c.expired ? "secondary" : "default"}>
              {c.used ? "terpakai" : c.expired ? "kedaluwarsa" : "aktif"}
            </Badge>
          </div>
        ))}
        {codes && codes.length === 0 && <p className="text-sm text-muted-foreground">Belum ada kode.</p>}
      </div>
    </Card3D>
  );
}

/* ═══════════════════════════════════════════
   API key
   ═══════════════════════════════════════════ */
function ApiKeyTab({ apiKey, schoolCode }: { apiKey: string; schoolCode: string }) {
  const keys = useQuery(api.ebcAdmin.listApiKeys, { apiKey });
  const rotate = useMutation(api.ebcAdmin.rotateApiKey);
  const revoke = useMutation(api.ebcAdmin.revokeApiKey);

  return (
    <Card3D intensity={2} className="p-5 obsidian-sheen">
      <h2 className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        API Key
      </h2>
      <p className="mb-4 text-[11px] text-muted-foreground">
        Header <code>X-API-KEY</code> wajib cocok dengan salah satu kunci aktif. Kunci dibuat
        di sini milik kita sendiri — jangan memakai kunci APK pihak lain.
      </p>

      <Button
        variant="outline"
        onClick={async () => {
          const res = await rotate({ apiKey, schoolCode });
          toast.success("Kunci baru dibuat. Simpan di perangkat yang butuh.");
        }}
      >
        <KeyRound className="size-4" /> Rotasi Kunci
      </Button>

      <div className="mt-5 space-y-2">
        {(keys ?? []).map((k) => (
          <div key={k._id} className="flex items-center justify-between gap-2 rounded-lg border p-3">
            <code className="min-w-0 flex-1 truncate text-[11px]">{k.key}</code>
            <Badge variant={k.active === false ? "secondary" : "default"}>
              {k.active === false ? "nonaktif" : "aktif"}
            </Badge>
            {k.active !== false && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => revoke({ apiKey, targetKey: k.key })}
                disabled={k.key === apiKey}
              >
                Cabut
              </Button>
            )}
          </div>
        ))}
      </div>
    </Card3D>
  );
}

/* ═══════════════════════════════════════════
   Generator config QR / .cbt
   ═══════════════════════════════════════════ */
function QrTab() {
  const [config, setConfig] = useState<EbcLocalConfig>(() => ({
    ...configFromExamItem(
      { examName: "Ujian Akhir Semester", schoolName: "Yayasan Mambaul Hasan", timerEnabled: true, timerMinutes: 90 },
      { name: "Yayasan Mambaul Hasan" },
    ),
  }));
  const [qr, setQr] = useState<string | null>(null);

  const set = <K extends keyof EbcLocalConfig>(key: K, value: EbcLocalConfig[K]) =>
    setConfig((c) => ({ ...c, [key]: value }));

  const buildQr = async () => {
    const errors = validateCbtConfig(config);
    if (errors.length > 0) {
      errors.forEach((e) => toast.error(e));
      return;
    }
    // QR versi panjang butuh error-correction rendah supaya muat
    const url = await QRCode.toDataURL(configPayloadJson(config), {
      errorCorrectionLevel: "L",
      margin: 1,
    });
    setQr(url);
    toast.success("QR dibuat. Siswa bisa langsung memindainya.");
  };

  const size = useMemo(() => JSON.stringify(config).length, [config]);

  return (
    <div className="space-y-4">
      <Card3D intensity={2} className="space-y-4 p-5 obsidian-sheen">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Config Lokal (format .cbt)
        </h2>
        <p className="text-[11px] text-muted-foreground">
          Persis mengikuti kontrak bagian 4. Nama field tidak boleh diubah — client memvalidasinya.
          Ukuran payload: <span className="font-mono">{size} byte</span>
          {size > 2800 && <span className="ml-1 text-amber-500">(risiko besar, QR muat maks ±2953 byte)</span>}
        </p>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="url"><Input value={config.url} onChange={(e) => set("url", e.target.value)} placeholder="https://…" /></Field>
          <Field label="nama_ujian"><Input value={config.nama_ujian} onChange={(e) => set("nama_ujian", e.target.value)} /></Field>
          <Field label="nama_sekolah"><Input value={config.nama_sekolah} onChange={(e) => set("nama_sekolah", e.target.value)} /></Field>
          <Field label="logo (URL)"><Input value={config.logo} onChange={(e) => set("logo", e.target.value)} /></Field>
          <Field label="timer (menit)"><Input type="number" value={config.timer} onChange={(e) => set("timer", Number(e.target.value))} /></Field>
          <Field label="start_time"><Input value={config.start_time} onChange={(e) => set("start_time", e.target.value)} className="font-mono" placeholder="07:00" /></Field>
          <Field label="end_time"><Input value={config.end_time} onChange={(e) => set("end_time", e.target.value)} className="font-mono" placeholder="09:00" /></Field>
          <Field label="token_masuk"><Input value={config.token_masuk} onChange={(e) => set("token_masuk", e.target.value.toUpperCase())} className="font-mono" /></Field>
          <Field label="token_keluar"><Input value={config.token_keluar} onChange={(e) => set("token_keluar", e.target.value.toUpperCase())} className="font-mono" /></Field>
          <Field label="link_keluar"><Input value={config.link_keluar} onChange={(e) => set("link_keluar", e.target.value)} placeholder="https://…" /></Field>
        </div>

        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          <ToggleRow label="custom_ua_status" checked={config.custom_ua_status} onChange={(c) => set("custom_ua_status", c)} />
          <ToggleRow label="timer_status" checked={config.timer_status} onChange={(c) => set("timer_status", c)} />
          <ToggleRow label="msg_status" checked={config.msg_status} onChange={(c) => set("msg_status", c)} />
          <ToggleRow label="token_masuk_status" checked={config.token_masuk_status} onChange={(c) => set("token_masuk_status", c)} />
          <ToggleRow label="token_keluar_status" checked={config.token_keluar_status} onChange={(c) => set("token_keluar_status", c)} />
          <ToggleRow label="link_keluar_status" checked={config.link_keluar_status} onChange={(c) => set("link_keluar_status", c)} />
          <ToggleRow label="allow_copy_paste" checked={config.allow_copy_paste} onChange={(c) => set("allow_copy_paste", c)} hint="Sebaiknya false" />
          <ToggleRow label="allow_screenshoot" checked={config.allow_screenshoot} onChange={(c) => set("allow_screenshoot", c)} hint="Sebaiknya false" />
          <ToggleRow label="clear_cache" checked={config.clear_cache} onChange={(c) => set("clear_cache", c)} />
          <ToggleRow label="safe_config" checked={config.safe_config} onChange={(c) => set("safe_config", c)} />
        </div>

        <Field label="custom_ua">
          <Input value={config.custom_ua} onChange={(e) => set("custom_ua", e.target.value)} className="text-xs" />
        </Field>
        <Field label="msg">
          <Textarea rows={2} value={config.msg} onChange={(e) => set("msg", e.target.value)} />
        </Field>

        <div className="flex flex-wrap gap-2">
          <Button onClick={buildQr}><QrCode className="size-4" /> Buat QR</Button>
          <Button variant="outline" onClick={() => downloadCbtFile(config, "ujian.cbt")}>
            <Download className="size-4" /> Unduh .cbt
          </Button>
        </div>
      </Card3D>

      {qr && (
        <Card3D intensity={3} className="p-5 obsidian-sheen">
          <div className="flex flex-col items-center gap-3">
            <img src={qr} alt="QR config EBC" className="h-72 w-72 rounded-xl border-4 border-white bg-white p-2" />
            <p className="text-xs text-muted-foreground">
              Siswa scan QR ini dari wizard CreateConfig / Scan QR di EBC.
            </p>
          </div>
        </Card3D>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════
   Dokumentasi API + live request tester
   ═══════════════════════════════════════════ */
interface EndpointMeta {
  key: string;
  desc: string;
  method: "GET" | "POST";
  params: { name: string; hint: string; required: boolean }[];
}

const ENDPOINTS: EndpointMeta[] = [
  {
    key: "config",
    desc: "Konfigurasi sekolah: identitas, fitur aplikasi, slider, kalender, menu.",
    method: "GET",
    params: [
      { name: "code", hint: "school_code", required: true },
      { name: "username", hint: "alternatif school_code", required: false },
    ],
  },
  {
    key: "exams",
    desc: "Daftar ujian beserta seluruh toggle kiosk (token, pin layar, screenshot, dll).",
    method: "GET",
    params: [{ name: "code", hint: "school_code", required: true }],
  },
  {
    key: "announcements",
    desc: "Pengumuman sekolah.",
    method: "GET",
    params: [{ name: "code", hint: "school_code", required: true }],
  },
  {
    key: "calendar",
    desc: "Agenda / kalender sekolah.",
    method: "GET",
    params: [{ name: "code", hint: "school_code", required: true }],
  },
  {
    key: "menus",
    desc: "Menu kustom yang ditampilkan di client.",
    method: "GET",
    params: [{ name: "code", hint: "school_code", required: true }],
  },
  {
    key: "page",
    desc: "Halaman statis (konten HTML) berdasarkan slug.",
    method: "GET",
    params: [
      { name: "code", hint: "school_code", required: true },
      { name: "slug", hint: "mis. profil", required: true },
    ],
  },
  {
    key: "register_device",
    desc: "Registrasi/update device. POST form-urlencoded.",
    method: "POST",
    params: [
      { name: "code", hint: "school_code", required: true },
      { name: "username", hint: "akun siswa", required: false },
      { name: "token", hint: "FCM token", required: false },
      { name: "platform", hint: "android", required: false },
      { name: "app_version", hint: "4.1", required: false },
    ],
  },
  {
    key: "verify_violation_reset",
    desc: "Tukar kode reset pelanggaran. Sekali pakai + ada masa berlaku.",
    method: "GET",
    params: [
      { name: "code", hint: "school_code", required: true },
      { name: "reset_code", hint: "kode dari guru", required: true },
    ],
  },
];

const DEVICE_HEADERS = [
  ["X-API-KEY", "WAJIB. Kunci API (milik kita sendiri)."],
  ["X-Device-ID", "SharedPreferences device_id — unik per install."],
  ["X-Package-Name", "package APK saat ini."],
  ["X-App-Signature", "SHA-256 signing certificate APK."],
  ["X-App-Version", "versionName, mis. 4.1"],
  ["X-Install-Source", "playstore / sideload"],
  ["X-School-Username", "username sekolah kalau sudah login"],
];

function ApiDocsTab({ apiKey, schoolCode }: { apiKey: string; schoolCode: string }) {
  const [active, setActive] = useState<EndpointMeta>(ENDPOINTS[0]);
  const [values, setValues] = useState<Record<string, string>>({});
  const [response, setResponse] = useState<string | null>(null);
  const [httpNote, setHttpNote] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const select = (ep: EndpointMeta) => {
    setActive(ep);
    setValues(
      Object.fromEntries(ep.params.map((p) => [p.name, p.name === "code" ? schoolCode : ""])),
    );
    setResponse(null);
    setHttpNote(null);
  };

  const indexUrl = `${BASE_URL}?x=${active.key}${
    values.code ? `&code=${encodeURIComponent(values.code)}` : ""
  }${values.slug ? `&slug=${encodeURIComponent(values.slug)}` : ""}${
    values.reset_code ? `&reset_code=${encodeURIComponent(values.reset_code)}` : ""
  }`;

  const send = async () => {
    setBusy(true);
    setResponse(null);
    setHttpNote(null);
    try {
      // 1) Coba rute index.php yang dipakai APK
      if (CONVEX_URL) {
        try {
          const res = await fetch(indexUrl, {
            method: active.method,
            headers: {
              "X-API-KEY": apiKey,
              "X-Device-ID": "console-tester",
              "X-App-Version": "4.1",
            },
          });
          if (res.ok) {
            setResponse(await res.text());
            setBusy(false);
            return;
          }
          setHttpNote(`Rute index.php membalas HTTP ${res.status} — deployment ini tidak menyajikan custom HTTP route.`);
        } catch {
          setHttpNote("index.php tidak bisa dijangkau.");
        }
      }

      // 2) Fallback: kontrak yang sama lewat action Convex
      const payload: Record<string, string> = { x: active.key, apiKey, code: values.code ?? "" };
      if (values.username) payload.username = values.username;
      if (values.slug) payload.slug = values.slug;
      if (values.reset_code) payload.reset_code = values.reset_code;
      if (active.key === "register_device") {
        payload.deviceId = values.deviceId || "console-tester";
        payload.platform = values.platform || "android";
        payload.appVersion = values.app_version || "4.1";
        payload.token = values.token || "";
        payload.schoolUsername = values.username || "";
      }

      const res = await fetch(`${CONVEX_URL}/api/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: "ebcHttp:handle", args: payload, format: "json" }),
      });
      const text = await res.text();
      try {
        const parsed = JSON.parse(text) as { value?: unknown };
        setResponse(JSON.stringify(parsed.value ?? parsed, null, 2));
      } catch {
        setResponse(text);
      }
    } catch (err) {
      setResponse(JSON.stringify({ error: err instanceof Error ? err.message : "Gagal" }, null, 2));
    }
    setBusy(false);
  };

  return (
    <div className="space-y-4">
      {/* Ringkasan kontrak */}
      <Card3D intensity={2} className="p-5 obsidian-sheen">
        <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <BookMarked className="size-4" /> Kontrak
        </h2>
        <div className="mt-3 space-y-2 text-xs">
          <p>
            <strong>BASE_URL</strong>{" "}
            <code className="rounded bg-muted px-1 py-0.5">{BASE_URL}</code>
          </p>
          <p>
            <strong>Endpoint</strong> <code className="rounded bg-muted px-1 py-0.5">/index.php?x=&lt;aksi&gt;</code>
          </p>
          <p>
            <strong>Format respons</strong> (semua endpoint)
          </p>
          <pre className="overflow-x-auto rounded-md border bg-muted p-2.5 text-[11px]">
{`{
  "status": true,
  "message": "OK",
  "data": { ... }
}`}
          </pre>
          <p className="text-muted-foreground">
            Kalau <code>status:false</code>, client menampilkan <code>message</code> ke siswa.
          </p>
        </div>

        <h3 className="mt-5 text-xs font-semibold">Header yang dikirim client</h3>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="p-2 font-medium">Header</th>
                <th className="p-2 font-medium">Keterangan</th>
              </tr>
            </thead>
            <tbody>
              {DEVICE_HEADERS.map(([h, d]) => (
                <tr key={h} className="border-b last:border-0">
                  <td className="p-2 font-mono">{h}</td>
                  <td className="p-2 text-muted-foreground">{d}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card3D>

      {/* Tester */}
      <Card3D intensity={2} className="p-5 obsidian-sheen">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Tester — coba langsung
        </h2>

        <div className="flex flex-wrap gap-1.5">
          {ENDPOINTS.map((ep) => (
            <Button
              key={ep.key}
              size="sm"
              variant={active.key === ep.key ? "default" : "outline"}
              onClick={() => select(ep)}
            >
              {ep.method} {ep.key}
            </Button>
          ))}
        </div>

        <p className="mt-3 text-xs text-muted-foreground">{active.desc}</p>

        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {active.params.map((p) => (
            <Field key={p.name} label={`${p.name}${p.required ? " *" : ""}`}>
              <Input
                value={values[p.name] ?? ""}
                onChange={(e) => setValues({ ...values, [p.name]: e.target.value })}
                placeholder={p.hint}
                className="font-mono text-xs"
              />
            </Field>
          ))}
          {active.key === "register_device" && (
            <Field label="X-Device-ID">
              <Input
                value={values.deviceId ?? ""}
                onChange={(e) => setValues({ ...values, deviceId: e.target.value })}
                placeholder="dev-andro-001"
                className="font-mono text-xs"
              />
            </Field>
          )}
        </div>

        <div className="mt-3">
          <Label className="text-xs">URL yang dipanggil APK</Label>
          <code className="mt-1 block overflow-x-auto rounded-md border bg-muted p-2 text-[11px]">
            {indexUrl}
          </code>
        </div>

        <Button className="mt-4" onClick={send} disabled={busy}>
          {busy ? <Loader2 className="size-4 animate-spin" /> : <Terminal className="size-4" />}
          Kirim Request
        </Button>

        {httpNote && (
          <p className="mt-3 flex items-start gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-400">
            <span className="mt-0.5 size-2 shrink-0 rounded-full bg-current" />
            {httpNote} Hasil di bawah diambil lewat endpoint action Convex — logikanya sama persis.
          </p>
        )}

        {response && (
          <div className="mt-3">
            <Label className="text-xs">Respons</Label>
            <pre className="mt-1 max-h-96 overflow-auto rounded-md border bg-muted p-3 text-[11px] leading-relaxed">
              {response}
            </pre>
          </div>
        )}
      </Card3D>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Field helper
   ═══════════════════════════════════════════ */
function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`space-y-1.5 ${className ?? ""}`}>
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}
