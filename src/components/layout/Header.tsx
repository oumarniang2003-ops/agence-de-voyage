"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Building2,
  UserCheck,
  Moon,
  Sun,
  Shield,
  Briefcase,
  User,
  ChevronDown,
  Check,
  PlusCircle,
} from "lucide-react";

interface HeaderProps {
  onOpenNewClientModal?: () => void;
  onOpenNewApplicationModal?: () => void;
}

export default function Header({
  onOpenNewClientModal,
  onOpenNewApplicationModal,
}: HeaderProps) {
  const { user, availableUsers, switchUser } = useAuth();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "ADMIN":
        return {
          label: "Directeur / Admin",
          color: "bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border-purple-200 dark:border-purple-800",
          icon: Shield,
        };
      case "COUNSELOR":
        return {
          label: "Conseiller Visa",
          color: "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border-blue-200 dark:border-blue-800",
          icon: Briefcase,
        };
      case "ASSISTANT":
        return {
          label: "Assistant / Saisie",
          color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
          icon: UserCheck,
        };
      default:
        return {
          label: role,
          color: "bg-gray-100 text-gray-700",
          icon: User,
        };
    }
  };

  const roleInfo = getRoleBadge(user?.role || "COUNSELOR");
  const RoleIcon = roleInfo.icon;

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-gray-200 bg-white/80 px-4 md:px-6 backdrop-blur-md dark:border-gray-800 dark:bg-gray-900/80 transition-colors">
      {/* Left side: Agency info */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20">
          <Building2 className="h-5 w-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-gray-900 dark:text-white text-sm md:text-base leading-tight">
              {user?.agencyName || "Chargement..."}
            </h2>
            <span className="rounded-md bg-blue-50 px-1.5 py-0.5 text-[10px] font-semibold text-blue-600 dark:bg-blue-950 dark:text-blue-400">
              {user?.agencyCurrency || "EUR"}
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Espace Agence Sécurisé & Isolé
          </p>
        </div>
      </div>

      {/* Right side: Actions, Theme, Role switcher */}
      <div className="flex items-center gap-2 md:gap-3">
        {onOpenNewClientModal && (
          <button
            onClick={onOpenNewClientModal}
            className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 transition"
          >
            <PlusCircle className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
            Nouveau Client
          </button>
        )}

        {onOpenNewApplicationModal && (
          <button
            onClick={onOpenNewApplicationModal}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-blue-700 shadow-blue-500/20 transition"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            Nouveau Dossier
          </button>
        )}

        {/* Dark Mode toggle */}
        <button
          onClick={toggleDarkMode}
          title="Basculer le mode clair/sombre"
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition"
        >
          {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        {/* User / Tenant quick switcher */}
        <div className="relative">
          <button
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50/80 p-1.5 pr-2.5 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-800/80 dark:hover:bg-gray-800 transition"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600/10 text-blue-600 font-semibold text-xs dark:bg-blue-500/20 dark:text-blue-400">
              {user ? `${user.firstName[0]}${user.lastName[0]}` : "U"}
            </div>
            <div className="hidden text-left md:block">
              <p className="text-xs font-medium text-gray-900 dark:text-gray-100 leading-tight">
                {user ? `${user.firstName} ${user.lastName}` : "Utilisateur"}
              </p>
              <div className="flex items-center gap-1">
                <span
                  className={`inline-flex items-center gap-1 rounded px-1.5 py-0.2 text-[9px] font-medium border ${roleInfo.color}`}
                >
                  <RoleIcon className="h-2.5 w-2.5" />
                  {roleInfo.label}
                </span>
              </div>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
          </button>

          {/* Switcher dropdown */}
          {userDropdownOpen && (
            <div className="absolute right-0 mt-2 w-72 rounded-2xl border border-gray-200 bg-white p-2 shadow-2xl dark:border-gray-800 dark:bg-gray-900 z-50">
              <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-800">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Changer de rôle / agence (Démo)
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Testez l’isolation multi-tenants et les permissions par profil en un clic.
                </p>
              </div>

              <div className="max-h-72 overflow-y-auto py-1">
                {availableUsers.map((u) => {
                  const isCurrent = user?.id === u.id;
                  const uRole = getRoleBadge(u.role);
                  const URoleIcon = uRole.icon;

                  return (
                    <button
                      key={u.id}
                      onClick={() => {
                        switchUser(u);
                        setUserDropdownOpen(false);
                      }}
                      className={`flex w-full items-start justify-between rounded-xl p-2.5 text-left text-xs transition ${
                        isCurrent
                          ? "bg-blue-50/80 text-blue-900 dark:bg-blue-950/40 dark:text-blue-100"
                          : "hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      <div>
                        <div className="font-semibold flex items-center gap-1.5">
                          {u.firstName} {u.lastName}
                          {isCurrent && <Check className="h-3.5 w-3.5 text-blue-600" />}
                        </div>
                        <div className="text-[11px] text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                          <Building2 className="h-3 w-3" />
                          {u.agencyName}
                        </div>
                        <span
                          className={`inline-flex items-center gap-1 mt-1 rounded px-1.5 py-0.2 text-[9px] font-medium border ${uRole.color}`}
                        >
                          <URoleIcon className="h-2.5 w-2.5" />
                          {uRole.label}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
