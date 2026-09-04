import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLocalAuth } from "@/hooks/use-local-auth";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  ArrowRight,
  Loader2,
  User,
  Lock,
  ShieldAlert,
} from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { YmhLogo } from "@/components/YmhLogo";
import {
  getLoginLock,
  recordLoginFail,
  resetLoginFails,
  MAX_USERNAME_LEN,
  MAX_PASSWORD_LEN,
} from "@/lib/security";

interface AuthProps {
  redirectAfterAuth?: string;
}

function resolveRedirect(returnTo: string | null, fallback = "/dashboard") {
  if (returnTo?.startsWith("/") && !returnTo.startsWith("//")) return returnTo;
  return fallback;
}

function Auth({ redirectAfterAuth }: AuthProps = {}) {
  const { user, isLoading: authLoading, signIn } = useLocalAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = resolveRedirect(searchParams.get("returnTo"), redirectAfterAuth);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lockSecs, setLockSecs] = useState(0);

  useEffect(() => {
    if (!authLoading && user) navigate(redirect);
  }, [authLoading, user, navigate, redirect]);

  // Brute-force lock countdown
  useEffect(() => {
    const check = () => {
      const { locked, remainingMs } = getLoginLock();
      setLockSecs(locked ? Math.ceil(remainingMs / 1000) : 0);
    };
    check();
    const id = setInterval(check, 1000);
    return () => clearInterval(id);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockSecs > 0) return;
    setIsLoading(true);
    setError(null);

    // Normalize input before auth (trim + lowercase) and enforce max length
    const uname = username.trim().toLowerCase().slice(0, MAX_USERNAME_LEN);
    const pw = password.slice(0, MAX_PASSWORD_LEN);

    // Simulate brief network delay
    await new Promise((r) => setTimeout(r, 300));

    const result = await signIn(uname, pw);
    if (result.success) {
      resetLoginFails();
      navigate(redirect);
    } else {
      const { locked, remainingMs } = recordLoginFail();
      if (locked) {
        setLockSecs(Math.ceil(remainingMs / 1000));
        setError("Terlalu banyak percobaan gagal. Coba lagi beberapa saat lagi.");
      } else {
        setError(result.error ?? "Login gagal.");
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top bar */}
      <nav className="sticky top-0 z-50 flex h-14 items-center justify-between border-b bg-background/70 backdrop-blur-xl px-4">
        <span className="text-sm font-semibold text-muted-foreground">YMH — Yayasan Mambaul Hasan</span>
        <ThemeToggle />
      </nav>

      <div className="flex-1 flex items-center justify-center px-4">
        <Card className="w-full max-w-sm pb-0 border shadow-md obsidian-sheen">
          <CardHeader className="text-center">
            <div className="flex justify-center">
              <div className="mb-3 mt-2 cursor-pointer" onClick={() => navigate("/")}>
                <YmhLogo size={60} />
              </div>
            </div>
            <CardTitle className="text-xl">Masuk</CardTitle>
            <CardDescription>
              Gunakan username dan password untuk mengakses panel
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="username" className="text-xs font-medium">
                    Username
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="username"
                      placeholder="Masukkan username"
                      className="pl-9"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.slice(0, MAX_USERNAME_LEN))}
                      disabled={isLoading || lockSecs > 0}
                      autoComplete="username"
                      autoCapitalize="none"
                      spellCheck={false}
                      maxLength={MAX_USERNAME_LEN}
                      required
                      autoFocus
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-xs font-medium">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Masukkan password"
                      className="pl-9"
                      value={password}
                      onChange={(e) => setPassword(e.target.value.slice(0, MAX_PASSWORD_LEN))}
                      disabled={isLoading || lockSecs > 0}
                      autoComplete="current-password"
                      maxLength={MAX_PASSWORD_LEN}
                      required
                    />
                  </div>
                </div>
              </div>

              {lockSecs > 0 && (
                <p className="mt-3 flex items-center justify-center gap-1.5 text-sm text-red-500 text-center">
                  <ShieldAlert className="h-4 w-4 shrink-0" />
                  Terkunci sementara — coba lagi dalam {lockSecs} detik
                </p>
              )}
              {error && !lockSecs && (
                <p className="mt-3 text-sm text-red-500 text-center">{error}</p>
              )}

              <Button
                type="submit"
                className="w-full mt-4"
                disabled={isLoading || !username.trim() || !password || lockSecs > 0}
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <>
                    Masuk
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </CardContent>
          </form>

          <div className="py-4 px-6 text-xs text-center text-muted-foreground bg-muted border-t rounded-b-lg">
            Yayasan Mambaul Hasan · Batur Gading, Probolinggo
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function AuthPage(props: AuthProps) {
  return (
    <Suspense>
      <Auth {...props} />
    </Suspense>
  );
}
