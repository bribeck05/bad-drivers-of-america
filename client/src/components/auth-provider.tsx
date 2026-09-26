import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

interface AuthUser {
  id: number;
  username: string;
  displayName: string;
  createdAt: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  signup: (username: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  login: async () => {},
  signup: async () => {},
  logout: async () => {},
});

// In-memory token storage (persists during session, not across refreshes)
let authToken: string | null = null;

export function getAuthToken(): string | null {
  return authToken;
}

function setAuthToken(token: string | null) {
  authToken = token;
}

// Token-aware fetch helper
async function authFetch(method: string, url: string, data?: unknown): Promise<Response> {
  const token = getAuthToken();
  const headers: Record<string, string> = {};
  if (data) headers["Content-Type"] = "application/json";
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
  });

  if (!res.ok) {
    const err = await res.text().catch(() => res.statusText);
    throw new Error(err || res.statusText);
  }
  return res;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check auth state on mount
  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      setIsLoading(false);
      return;
    }
    authFetch("GET", "/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) setUser(data);
        else setAuthToken(null);
      })
      .catch(() => {
        setAuthToken(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const res = await authFetch("POST", "/api/auth/login", { username, password });
    const data = await res.json();
    setAuthToken(data.token);
    setUser(data);
  }, []);

  const signup = useCallback(async (username: string, password: string, displayName: string) => {
    const res = await authFetch("POST", "/api/auth/signup", { username, password, displayName });
    const data = await res.json();
    setAuthToken(data.token);
    setUser(data);
  }, []);

  const logout = useCallback(async () => {
    try {
      await authFetch("POST", "/api/auth/logout");
    } catch {}
    setAuthToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated: !!user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export { authFetch };
