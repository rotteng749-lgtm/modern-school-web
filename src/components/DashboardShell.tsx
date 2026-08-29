import { type ReactNode, useState, useEffect } from "react";
import { Link, useLocation } from "react-router";
import {
  LayoutDashboard,
  ClipboardCheck,
  FileQuestion,
  Trophy,
  UserCircle,
  LogOut,
  GraduationCap,
  Users,
  Sparkles,
  Megaphone,
  Images,
  BarChart3,
  Inbox,
  Settings,
  Database,
  BookOpen,
} from "lucide-react";
import { YmhLogo } from "@/components/YmhLogo";
import { SCHOOL_LOGO_PRESETS } from "@/components/SchoolLogos";
import { getMainLogo } from "@/lib/logo-storage";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useLocalAuth } from "@/hooks/use-local-auth";
import { cn } from "@/lib/utils";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";

type Role = "admin" | "guru" | "siswa" | "orangtua";

interface NavItem {
  label: string;
  icon: typeof LayoutDashboard;
  href: string;
  roles: Role[];
}

/* All navigation items with role visibility */
const NAV_ITEMS: NavItem[] = [
  // ── All roles ──
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard", roles: ["admin", "guru", "siswa", "orangtua"] },
  { label: "Ujian / CBT", icon: ClipboardCheck, href: "/ujian", roles: ["admin", "guru", "siswa", "orangtua"] },
  { label: "Absensi", icon: FileQuestion, href: "/absensi", roles: ["admin", "guru", "siswa", "orangtua"] },
  { label: "Pengumuman", icon: Megaphone, href: "/pengumuman", roles: ["admin", "guru", "siswa", "orangtua"] },
  { label: "Gallery", icon: Images, href: "/gallery", roles: ["admin", "guru", "siswa", "orangtua"] },
  { label: "Profil", icon: UserCircle, href: "/profil", roles: ["admin", "guru", "siswa", "orangtua"] },
  // ── Admin + Guru ──
  { label: "Bank Soal", icon: Trophy, href: "/bank-soal", roles: ["admin", "guru"] },
  // ── Admin only ──
  { label: "Guru", icon: Users, href: "/guru", roles: ["admin"] },
  { label: "Murid", icon: GraduationCap, href: "/murid", roles: ["admin"] },
  { label: "Mapel", icon: BookOpen, href: "/mapel", roles: ["admin"] },
  { label: "Analytics", icon: BarChart3, href: "/analytics", roles: ["admin"] },
  { label: "Inbox", icon: Inbox, href: "/inbox", roles: ["admin"] },
  { label: "Database", icon: Database, href: "/database", roles: ["admin"] },
  { label: "Pengaturan", icon: Settings, href: "/pengaturan", roles: ["admin"] },
  { label: "Studio Elaina", icon: Sparkles, href: "/studio-elaina", roles: ["admin"] },
];

export function DashboardShell({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { user, signOut } = useLocalAuth();
  const [logo, setLogo] = useState<string | null>(getMainLogo());
  const [logoPreset, setLogoPreset] = useState<string | null>(() => localStorage.getItem("msw-logo-preset"));

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (typeof detail === "string" && detail.startsWith("preset:")) {
        const presetId = detail.replace("preset:", "");
        setLogoPreset(presetId);
        setLogo(null);
      } else {
        setLogo(detail);
        if (detail) setLogoPreset(null);
      }
    };
    window.addEventListener("logo-changed", handler);
    return () => window.removeEventListener("logo-changed", handler);
  }, []);

  const LogoDisplay = logoPreset
    ? SCHOOL_LOGO_PRESETS.find((p) => p.id === logoPreset)?.component
    : null;

  return (
    <SidebarProvider defaultOpen>
      <Sidebar>
        {/* Brand */}
        <SidebarHeader>
          <Link to="/dashboard" className="flex items-center gap-2.5 px-2 py-1">
            {logo ? (
              <img src={logo} alt="Logo" className="size-9 rounded-lg object-contain" />
            ) : LogoDisplay ? (
              <LogoDisplay className="size-9" />
            ) : (
              <YmhLogo size={36} />
            )}
            <div className="flex flex-col leading-none">
              <span className="text-sm font-bold tracking-tight">YMH</span>
              <span className="text-[9px] text-muted-foreground">Batur Gading</span>
            </div>
          </Link>
        </SidebarHeader>

        <SidebarSeparator />

        {/* Navigation */}
        <SidebarContent>
          <SidebarMenu>
            {NAV_ITEMS.filter((item) => item.roles.includes(user?.role ?? "admin")).map((item) => {
              const active = location.pathname === item.href;
              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={active}
                    tooltip={item.label}
                  >
                    <Link to={item.href}>
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarContent>

        {/* Footer */}
        <SidebarSeparator />
        <SidebarFooter>
          <div className="flex items-center gap-2 px-2 py-1.5">
            <div className="flex size-8 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
              {user?.name?.charAt(0)?.toUpperCase() ?? "U"}
            </div>
            <div className="flex-1 truncate">
              <p className="text-sm font-medium truncate">{user?.name ?? "User"}</p>
              <p className="text-xs text-muted-foreground truncate capitalize">{user?.role ?? "admin"}</p>
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={async () => {
                await signOut();
                window.location.href = "/";
              }}
              aria-label="Sign out"
            >
              <LogOut className="size-4 text-muted-foreground" />
            </Button>
          </div>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background/80 backdrop-blur-md px-4">
          <SidebarTrigger className="md:hidden" />
          <div className="flex-1" />
          <ThemeToggle />
        </header>

        {/* Page content */}
        <div className="flex-1 p-4 md:p-6 lg:p-8">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
