import type React from "react";
import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { get } from "@/services/api";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export type Role = "plinktern" | "staff";

export interface User {
  sub: string;
  username: string;
  discord_id: string;
  email?: string | null;
  name?: string | null;
  roles: Role[];
  team_name: string | null;
  availability: string[] | null;
  shirt_size: string | null;
  dietary_restrictions: string | null;
  notes: string | null;
  can_take_photos: boolean;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  isAuthLoading: boolean;
  hasRole: (role: Role) => boolean;
  hasAnyRole: (roles: Role[]) => boolean;
  login: () => void;
  logout: () => void;
  checkAuthStatus: () => Promise<void>;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsLoading] = useState(true);

  const login = useCallback(() => {
    if (!API_BASE_URL) {
      console.error("VITE_API_BASE_URL is not defined. Cannot initiate login.");
      alert(
        "Critical configuration error: API URL not set. Login is unavailable.",
      );
      return;
    }
    window.location.href = `${API_BASE_URL}/login`;
  }, []);

  const logout = useCallback(() => {
    if (!API_BASE_URL) {
      console.error(
        "VITE_API_BASE_URL is not defined. Cannot initiate logout.",
      );
      setIsAuthenticated(false);
      setUser(null);
      alert(
        "Critical configuration error: API URL not set. Logout may not complete fully.",
      );
      return;
    }
    window.location.href = `${API_BASE_URL}/logout`;
  }, []);

  const checkAuthStatus = useCallback(async () => {
    setIsLoading(true);
    if (!API_BASE_URL) {
      console.error(
        "VITE_API_BASE_URL is not defined. Cannot check auth status.",
      );
      setIsAuthenticated(false);
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const fullUser = await get<User>("/users/get_user");

      const roles = Array.isArray(fullUser.roles)
        ? (fullUser.roles.filter(Boolean) as Role[])
        : ([] as Role[]);

      setUser({ ...fullUser, roles });
      setIsAuthenticated(true);
    } catch {
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const hasRole = useCallback(
    (role: Role) => !!user?.roles?.includes(role),
    [user],
  );

  const hasAnyRole = useCallback(
    (roles: Role[]) => roles.some((r) => user?.roles?.includes(r)),
    [user],
  );

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const value = useMemo<AuthContextType>(
    () => ({
      isAuthenticated,
      user,
      isAuthLoading,
      hasRole,
      hasAnyRole,
      login,
      logout,
      checkAuthStatus,
      setUser,
    }),
    [
      isAuthenticated,
      user,
      isAuthLoading,
      hasRole,
      hasAnyRole,
      login,
      logout,
      checkAuthStatus,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error(
      "useAuth must be used within an AuthProvider. Make sure your component is wrapped by AuthProvider.",
    );
  }
  return context;
};
