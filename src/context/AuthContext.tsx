"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { CurrentUserSession, Role } from "@/lib/types";

interface AuthContextType {
  user: CurrentUserSession | null;
  loading: boolean;
  logout: () => Promise<void>;
  /** Équipe de l'agence de l'utilisateur connecté (conseillers, assistants…) */
  availableUsers: CurrentUserSession[];
  canEditSettings: boolean;
  canManageUsers: boolean;
  canValidateDocuments: boolean;
  canManageApplications: boolean;
  canAddPayments: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<CurrentUserSession | null>(null);
  const [availableUsers, setAvailableUsers] = useState<CurrentUserSession[]>([]);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === "/login";

  useEffect(() => {
    if (isLoginPage) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.status === 401) {
          if (!cancelled) {
            setUser(null);
            router.replace("/login");
          }
          return;
        }
        if (res.ok) {
          const me = await res.json();
          if (!cancelled) setUser(me);
          const teamRes = await fetch("/api/team");
          if (teamRes.ok && !cancelled) setAvailableUsers(await teamRes.json());
        }
      } catch (err) {
        console.error("Failed to load session", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [isLoginPage, router]);

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setAvailableUsers([]);
    router.replace("/login");
    router.refresh();
  }, [router]);

  const role: Role = user?.role || "COUNSELOR";
  const canEditSettings = role === "ADMIN";
  const canManageUsers = role === "ADMIN";
  const canValidateDocuments = role === "ADMIN" || role === "COUNSELOR";
  const canManageApplications = role === "ADMIN" || role === "COUNSELOR";
  const canAddPayments = role === "ADMIN" || role === "ASSISTANT";

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        logout,
        availableUsers,
        canEditSettings,
        canManageUsers,
        canValidateDocuments,
        canManageApplications,
        canAddPayments,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
