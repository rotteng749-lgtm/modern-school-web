import { useLocalAuth } from "@/hooks/use-local-auth";
import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";
import { Navigate } from "react-router";

/* ═══════════════════════════════════════════
   REQUIRE ROLE — Route-level role guard
   Wrap routes that should only be accessible
   to specific roles (e.g. admin-only pages).
   ═══════════════════════════════════════════ */

import type { Role } from "@/hooks/use-local-auth";

interface RequireRoleProps {
  children: ReactNode;
  /** Roles allowed to access this route. If omitted, any authenticated user can access. */
  allowedRoles?: ("admin" | "guru" | "siswa" | "orangtua")[];
  /** Where to redirect if unauthorized. Defaults to /dashboard. */
  redirectTo?: string;
}

export function RequireRole({
  children,
  allowedRoles,
  redirectTo = "/dashboard",
}: RequireRoleProps) {
  const { user, isLoading } = useLocalAuth();

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </main>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
}
