import { useState, useEffect, useMemo } from "react";
import {
  BarChart3,
  Users,
  Eye,
  Globe,
  TrendingUp,
  Clock,
  MonitorSmartphone,
} from "lucide-react";
import { Card3D } from "@/components/Card3D";
import { DashboardShell } from "@/components/DashboardShell";

/* ═══════════════════════════════════════════
   ANALYTICS — Real-time traffic dashboard
   SVG chart + stats (inspired by digitalweb.site)
   ═══════════════════════════════════════════ */

const STORAGE_KEY = "msw-analytics";

interface AnalyticsData {
  totalPageviews: number;
  todayPageviews: number;
  uniqueVisitors: number;
  activeNow: number;
  hourlyTraffic: { hour: string; views: number }[];
  weeklyTraffic: { day: string; date: string; views: number }[];
  topPages: { page: string; views: number }[];
}

function getDefaultData(): AnalyticsData {
  const hourlyTraffic = Array.from({ length: 24 }, (_, i) => {
    const hour = `${String(i).padStart(2, "0")}:00`;
    let views = 0;
    if (i >= 7 && i <= 9) views = Math.floor(Math.random() * 40 + 30);
    else if (i >= 10 && i <= 14) views = Math.floor(Math.random() * 60 + 50);
    else if (i >= 15 && i <= 17) views = Math.floor(Math.random() * 50 + 40);
    else if (i >= 18 && i <= 21) views = Math.floor(Math.random() * 30 + 20);
    else views = Math.floor(Math.random() * 10 + 2);
    return { hour, views };
  });

  const days = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
  const today = new Date();
  const weeklyTraffic = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    return {
      day: days[d.getDay()],
      date: `${d.getDate()}/${d.getMonth() + 1}`,
      views: Math.floor(Math.random() * 200 + 80),
    };
  });

  return {
    totalPageviews: 3420,
    todayPageviews: 185,
    uniqueVisitors: 1240,
    activeNow: 12,
    hourlyTraffic,
    weeklyTraffic,
    topPages: [
      { page: "/dashboard", views: 423 },
      { page: "/ujian", views: 318 },
      { page: "/absensi", views: 256 },
      { page: "/bank-soal", views: 189 },
      { page: "/", views: 142 },
    ],
  };
}

function loadData(): AnalyticsData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return getDefaultData();
}

/* ── SVG Traffic Chart Component ── */
function TrafficChart({
  data,
  label,
}: {
  data: { label: string; value: number }[];
  label: string;
}) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const maxVal = Math.max(...data.map((d) => d.value), 10);
  const width = 800;
  const height = 200;
  const pad = 35;

  const points = data.map((d, i) => ({
    x: pad + (i / Math.max(data.length - 1, 1)) * (width - pad * 2),
    y: height - pad - (d.value / maxVal) * (height - pad * 2),
    ...d,
  }));

  const pathD = points.reduce((acc, pt, i, arr) => {
    if (i === 0) return `M ${pt.x},${pt.y}`;
    const prev = arr[i - 1];
    const cx = (prev.x + pt.x) / 2;
    return `${acc} C ${cx},${prev.y} ${cx},${pt.y} ${pt.x},${pt.y}`;
  }, "");

  const areaD = `${pathD} L ${points[points.length - 1].x},${height - pad} L ${points[0].x},${height - pad} Z`;

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-48">
        <defs>
          <linearGradient id={`grad-${label}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
          </linearGradient>
        </defs>
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((r, i) => {
          const y = height - pad - r * (height - pad * 2);
          return (
            <line
              key={i}
              x1={pad} y1={y} x2={width - pad} y2={y}
              stroke="hsl(var(--border))" strokeDasharray="4 4" strokeWidth={1}
            />
          );
        })}
        {/* Area */}
        <path d={areaD} fill={`url(#grad-${label})`} />
        {/* Line */}
        <path d={pathD} fill="none" stroke="hsl(var(--primary))" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
        {/* Points */}
        {points.map((pt, i) => (
          <g key={i}>
            <circle
              cx={pt.x} cy={pt.y} r={hoveredIdx === i ? 6 : 4}
              fill="hsl(var(--primary))" stroke="hsl(var(--background))" strokeWidth={2}
              className="cursor-pointer transition-all"
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
            />
            <text x={pt.x} y={height - 10} textAnchor="middle" className="fill-muted-foreground" fontSize={10} fontFamily="monospace">
              {pt.label}
            </text>
          </g>
        ))}
      </svg>
      {/* Tooltip */}
      {hoveredIdx !== null && (
        <div className="absolute bg-card border border-border px-3 py-1.5 rounded-lg shadow-lg text-xs font-medium pointer-events-none"
          style={{
            left: `${(points[hoveredIdx].x / width) * 100}%`,
            top: `${(points[hoveredIdx].y / height) * 100 - 10}%`,
            transform: "translate(-50%, -100%)",
          }}
        >
          {points[hoveredIdx].label}: <strong>{points[hoveredIdx].value}</strong> kunjungan
        </div>
      )}
    </div>
  );
}

/* ── Bar Chart Component ── */
function BarChart({ data }: { data: { label: string; value: number }[] }) {
  const maxVal = Math.max(...data.map((d) => d.value), 10);
  return (
    <div className="flex items-end gap-1.5 h-32">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
          <div className="relative w-full">
            <div
              className="w-full rounded-t bg-primary/70 hover:bg-primary transition-colors"
              style={{ height: `${(d.value / maxVal) * 100}%`, minHeight: d.value > 0 ? 4 : 0 }}
            />
            <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              {d.value}
            </div>
          </div>
          <span className="text-[9px] text-muted-foreground">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

export default function Analytics() {
  const [data, setData] = useState<AnalyticsData>(loadData);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  // Simulate real-time update
  useEffect(() => {
    const interval = setInterval(() => {
      setData((prev) => ({
        ...prev,
        activeNow: Math.max(1, prev.activeNow + Math.floor(Math.random() * 5 - 2)),
        todayPageviews: prev.todayPageviews + Math.floor(Math.random() * 3),
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const hourlyPoints = useMemo(
    () => data.hourlyTraffic.map((h) => ({ label: h.hour.slice(0, 2), value: h.views })),
    [data.hourlyTraffic]
  );

  const weeklyPoints = useMemo(
    () => data.weeklyTraffic.map((w) => ({ label: w.day, value: w.views })),
    [data.weeklyTraffic]
  );

  const statCards = [
    { label: "Total Pageviews", value: data.totalPageviews.toLocaleString(), icon: Eye, color: "text-primary", bg: "bg-primary/10" },
    { label: "Hari Ini", value: data.todayPageviews.toLocaleString(), icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Unique Visitors", value: data.uniqueVisitors.toLocaleString(), icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Online Sekarang", value: data.activeNow.toString(), icon: Globe, color: "text-amber-500", bg: "bg-amber-500/10" },
  ];

  return (
    <DashboardShell>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Monitoring
          </p>
          <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight">Analytics</h1>
        </div>

        {/* Stat Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => (
            <Card3D key={stat.label} intensity={3} className="p-5 obsidian-sheen">
              <div className="flex items-start justify-between">
                <div className={`flex size-10 items-center justify-center rounded-xl ${stat.bg}`}>
                  <stat.icon className={`size-5 ${stat.color}`} />
                </div>
                {stat.label === "Online Sekarang" && (
                  <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Live
                  </span>
                )}
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </Card3D>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Hourly Traffic */}
          <Card3D intensity={2} className="obsidian-sheen">
            <div className="p-5 sm:p-6">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="size-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold">Traffic Per Jam</h2>
              </div>
              <TrafficChart data={hourlyPoints} label="hourly" />
            </div>
          </Card3D>

          {/* Weekly Traffic */}
          <Card3D intensity={2} className="obsidian-sheen">
            <div className="p-5 sm:p-6">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="size-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold">Traffic Mingguan</h2>
              </div>
              <BarChart data={weeklyPoints} />
            </div>
          </Card3D>
        </div>

        {/* Top Pages */}
        <Card3D intensity={2} className="obsidian-sheen">
          <div className="p-5 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <Globe className="size-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold">Halaman Terpopuler</h2>
            </div>
            <div className="space-y-3">
              {data.topPages.map((page, i) => (
                <div key={page.page} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground font-mono w-4 text-right">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium font-mono">{page.page}</span>
                      <span className="text-xs text-muted-foreground">{page.views} views</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${(page.views / data.topPages[0].views) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card3D>

        {/* Summary Footer */}
        <Card3D intensity={2} className="obsidian-sheen">
          <div className="p-5 sm:p-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <span className="text-[10px] uppercase font-bold text-muted-foreground block">Jam Puncak</span>
              <span className="text-sm font-bold text-primary">10:00 – 14:00</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-muted-foreground block">Avg. Durasi</span>
              <span className="text-sm font-bold text-emerald-500">3 min 42 detik</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-muted-foreground block">Bounce Rate</span>
              <span className="text-sm font-bold text-purple-500">18.2%</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-muted-foreground block">Perangkat</span>
              <span className="text-sm font-bold text-amber-500">74% Mobile</span>
            </div>
          </div>
        </Card3D>
      </div>
    </DashboardShell>
  );
}
