import { type ReactNode } from "react";
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
} from "lucide-react";
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

const NAV_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { label: "Ujian / CBT", icon: ClipboardCheck, href: "/ujian" },
  { label: "Absensi", icon: FileQuestion, href: "/absensi" },
  { label: "Guru", icon: Users, href: "/guru" },
  { label: "Murid", icon: GraduationCap, href: "/murid" },
  { label: "Bank Soal", icon: Trophy, href: "/bank-soal" },
  { label: "Pengumuman", icon: Megaphone, href: "/pengumuman" },
  { label: "Gallery", icon: Images, href: "/gallery" },
  { label: "Analytics", icon: BarChart3, href: "/analytics" },
  { label: "Inbox", icon: Inbox, href: "/inbox" },
  { label: "Pengaturan", icon: Settings, href: "/pengaturan" },
  { label: "Studio Elaina", icon: Sparkles, href: "/studio-elaina" },
  { label: "Profil", icon: UserCircle, href: "/profil" },
] as const;

export function DashboardShell({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { user, signOut } = useLocalAuth();

  return (
    <SidebarProvider defaultOpen>
      <Sidebar>
        {/* Brand */}
        <SidebarHeader>
          <Link to="/dashboard" className="flex items-center gap-2.5 px-2 py-1">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <GraduationCap className="size-5" />
            </div>
            <span className="text-lg font-bold tracking-tight">MSW</span>
          </Link>
        </SidebarHeader>

        <SidebarSeparator />

        {/* Navigation */}
        <SidebarContent>
          <SidebarMenu>
            {NAV_ITEMS.map((item) => {
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
