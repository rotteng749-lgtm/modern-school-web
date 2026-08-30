import { useState, useEffect, useCallback, createContext, useContext, type ReactNode } from "react";

/* ═══════════════════════════════════════════
   LOCAL AUTH — username/password (localStorage)
   Default admin: admin / admin123
   ═══════════════════════════════════════════ */

export type Role = "admin" | "guru" | "siswa" | "orangtua";

export interface LocalUser {
  username: string;
  name: string;
  role: Role;
  avatar?: string;
  /** For orangtua role: linked child's murid ID */
  childId?: string;
}

const STORAGE_KEY = "msw-auth";

const DEFAULT_USERS: Record<string, { password: string; user: LocalUser }> = {
  admin: {
    password: "admin123",
    user: { username: "admin", name: "Administrator", role: "admin" },
  },
  guru: {
    password: "guru123",
    user: { username: "guru", name: "Guru Demo", role: "guru" },
  },
  siswa: {
    password: "siswa123",
    user: { username: "siswa", name: "Siswa Demo", role: "siswa" },
  },
  ortu: {
    password: "ortu123",
    user: { username: "ortu", name: "Orang Tua Demo", role: "orangtua", childId: "1" },
  },
};

function getUsers(): Record<string, { password: string; user: LocalUser }> {
  try {
    const raw = localStorage.getItem("msw-users");
    if (raw) {
      const stored = JSON.parse(raw);
      // Merge defaults into stored so defaults always exist
      return { ...DEFAULT_USERS, ...stored };
    }
  } catch { /* ignore */ }
  return { ...DEFAULT_USERS };
}

function saveUsers(users: Record<string, { password: string; user: LocalUser }>) {
  localStorage.setItem("msw-users", JSON.stringify(users));
}

interface AuthCtx {
  user: LocalUser | null;
  isLoading: boolean;
  signIn: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => void;
  addUser: (username: string, password: string, name: string, role: Role, childId?: string) => boolean;
  updateUser: (oldUsername: string, newUsername: string, password: string, name: string, role: Role, childId?: string) => boolean;
  deleteUser: (username: string) => void;
}

const Ctx = createContext<AuthCtx | null>(null);

export function LocalAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<LocalUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch { /* ignore */ }
    setIsLoading(false);
  }, []);

  const signIn = useCallback(async (username: string, password: string) => {
    const users = getUsers();
    const entry = users[username];
    if (!entry || entry.password !== password) {
      return { success: false, error: "Username atau password salah." };
    }
    setUser(entry.user);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entry.user));
    return { success: true };
  }, []);

  const signOut = useCallback(() => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const addUser = useCallback((username: string, password: string, name: string, role: Role, childId?: string) => {
    const users = getUsers();
    if (users[username]) return false;
    users[username] = { password, user: { username, name, role, childId } };
    saveUsers(users);
    return true;
  }, []);

  const updateUser = useCallback((oldUsername: string, newUsername: string, password: string, name: string, role: Role, childId?: string) => {
    const users = getUsers();
    // Remove old key if username changed
    if (oldUsername !== newUsername && users[oldUsername]) {
      delete users[oldUsername];
    }
    users[newUsername] = { password, user: { username: newUsername, name, role, childId } };
    saveUsers(users);
    return true;
  }, []);

  const deleteUser = useCallback((username: string) => {
    const users = getUsers();
    delete users[username];
    saveUsers(users);
  }, []);

  return (
    <Ctx.Provider value={{ user, isLoading, signIn, signOut, addUser, updateUser, deleteUser }}>
      {children}
    </Ctx.Provider>
  );
}

export function useLocalAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useLocalAuth must be used within LocalAuthProvider");
  return ctx;
}

/** Helper: sync a single person (murid/guru) to auth store */
export function syncUserToAuth(
  auth: AuthCtx,
  username: string,
  password: string,
  name: string,
  role: Role,
  prevUsername?: string,
  childId?: string,
) {
  if (!username || !password) return;
  if (prevUsername && prevUsername !== username) {
    auth.deleteUser(prevUsername);
  }
  if (prevUsername && prevUsername === username) {
    auth.updateUser(username, username, password, name, role, childId);
  } else {
    auth.addUser(username, password, name, role, childId);
  }
}
