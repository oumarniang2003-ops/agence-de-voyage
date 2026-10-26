"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { CurrentUserSession, Role } from "@/lib/types";

interface AuthContextType {
  user: CurrentUserSession | null;
  loading: boolean;
  switchUser: (user: CurrentUserSession) => void;
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

  // Fetch available demo users from API
  useEffect(() => {
    async function loadUsers() {
      try {
        const res = await fetch("/api/auth/demo-users");
        if (res.ok) {
          const data = await res.json();
          setAvailableUsers(data);
          
          // Check localStorage for saved session or fallback to default
          const savedUserId = localStorage.getItem("visatrack_active_user");
          const found = data.find((u: CurrentUserSession) => u.id === savedUserId);
          if (found) {
            setUser(found);
          } else if (data.length > 0) {
            setUser(data[0]);
            localStorage.setItem("visatrack_active_user", data[0].id);
          }
        }
      } catch (err) {
        console.error("Failed to load demo users", err);
      } finally {
        setLoading(false);
      }
    }
    loadUsers();
  }, []);

  const switchUser = (newUser: CurrentUserSession) => {
    setUser(newUser);
    localStorage.setItem("visatrack_active_user", newUser.id);
  };

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
        switchUser,
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
