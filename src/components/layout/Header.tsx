"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { CurrentUserSession } from "@/lib/types";
import {
  Building2,
  UserCheck,
  Moon,
  Sun,
  Shield,
  Briefcase,
  User,
  ChevronDown,
  PlusCircle,
  LogOut,
} from "lucide-react";

interface HeaderProps {
  onOpenNewClientModal?: () => void;
  onOpenNewApplicationModal?: () => void;
}

/**
 * Détermine le nom d'affichage à présenter dans l'interface :
 * - Jamais d'identifiant technique ou de préfixe d'email.
 * - Le nom complet (Prénom + Nom) s'il est renseigné.
 * - Par défaut : "Mon compte".
 */
function getUserDisplayName(user: CurrentUserSession | null): string {
  if (!user) return "Mon compte";

  const firstName = (user.firstName || "").trim();
  const lastName = (user.lastName || "").trim();

  // Si l'utilisateur a un prénom et un nom distincts
  if (firstName && lastName) {
    return `${firstName} ${lastName}`;
  }

  const single = firstName || lastName;
  if (!single) return "Mon compte";

  // Détection d'un nom technique / dérivé d'email (ex: "Oumarniang2003", email, ou contient des chiffres)
  const emailPrefix = (user.email || "").split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "");
  const normalized = single.toLowerCase().replace(/[^a-z0-9]/g, "");

  if (
    normalized === emailPrefix ||
    /\d{2,}/.test(single) ||
    single.toLowerCase() === "utilisateur"
  ) {
    return "Mon compte";
  }

  return single;
}

/**
 * Génère les initiales ou une icône élégante pour l'avatar.
 * Évite rigoureusement tout affichage de "undefined".
 */
function renderUserAvatar(user: CurrentUserSession | null): React.ReactNode {
  if (!user) return <User className="h-3.5 w-3.5" />;

  const f = (user.firstName || "").trim();
  const l = (user.lastName || "").trim();

  if (f && l && f.length > 0 && l.length > 0) {
    return `${f.charAt(0).toUpperCase()}${l.charAt(0).toUpperCase()}`;
  }

  // Si pas de nom de famille distinct, afficher une icône utilisateur sobre
  return <User className="h-3.5 w-3.5" />;
}

export default function Header({
  onOpenNewClientModal,
  onOpenNewApplicationModal,
}: HeaderProps) {
  const { user, logout } = useAuth();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Fermeture au clic extérieur
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDarkMode = () => {
    const nextMode = !isDarkMode;
    setIsDarkMode(nextMode);
    if (nextMode) {
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
          color: "bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border-purple-200 dark:border-purple-800",
          icon: Shield,
        };
      case "COUNSELOR":
        return {
          label: "Conseiller Visa",
          color: "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border-blue-200 dark:border-blue-800",
          icon: Briefcase,
        };
      case "ASSISTANT":
        return {
          label: "Assistant Agence",
          color: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
          icon: UserCheck,
        };
      default:
        return {
          label: "Agent",
          color: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700",
          icon: User,
        };
    }
  };

  const roleInfo = getRoleBadge(user?.role || "COUNSELOR");
  const RoleIcon = roleInfo.icon;
  const displayName = getUserDisplayName(user);

  // Devise sécurisée : ne jamais afficher "undefined" ou null
  const currency =
    user?.agencyCurrency &&
    user.agencyCurrency !== "undefined" &&
    user.agencyCurrency.trim() !== ""
      ? user.agencyCurrency
      : "FCFA";

  // Nom de l'agence sécurisé
  const agencyName = user?.agencyName || "VisaTrack";

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 md:px-6 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 transition-colors">
      {/* Côté gauche : Informations de l'Agence */}
      <div className="flex items-center gap-3 min-w-0 flex-1 mr-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-sm shadow-blue-500/20">
          <Building2 className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <h2 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm leading-tight truncate max-w-[150px] sm:max-w-xs md:max-w-md">
              {agencyName}
            </h2>
            <span className="rounded-md bg-blue-50 px-1.5 py-0.5 text-[10px] font-bold text-blue-600 dark:bg-blue-950 dark:text-blue-400 shrink-0">
              {currency}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 truncate hidden sm:block">
            Espace Agence Sécurisé & Isolé
          </p>
        </div>
      </div>

      {/* Côté droit : Alignement uniforme et soigné des actions */}
      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
        {/* Bouton Nouveau Dossier */}
        {onOpenNewApplicationModal && (
          <button
            onClick={onOpenNewApplicationModal}
            className="h-9 px-3 sm:px-3.5 inline-flex items-center gap-1.5 rounded-xl bg-blue-600 text-xs font-bold text-white shadow-sm hover:bg-blue-700 shadow-blue-500/20 transition shrink-0"
          >
            <PlusCircle className="h-4 w-4" />
            <span className="hidden xs:inline sm:inline">Nouveau Dossier</span>
          </button>
        )}

        {/* Bouton Bascule Mode Clair / Sombre */}
        <button
          onClick={toggleDarkMode}
          title={isDarkMode ? "Passer en mode clair" : "Passer en mode sombre"}
          className="h-9 w-9 flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 transition shrink-0"
        >
          {isDarkMode ? <Sun className="h-4 w-4 text-amber-500" /> : <Moon className="h-4 w-4 text-slate-600" />}
        </button>

        {/* Menu du compte / Profil */}
        <div className="relative shrink-0" ref={dropdownRef}>
          <button
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            className="h-9 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-2 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800/80 transition"
          >
            {/* Avatar circulaire ou carré arrondi avec initiales ou icône (JAMAIS "undefined") */}
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 font-bold text-[11px] dark:bg-blue-950 dark:text-blue-400">
              {renderUserAvatar(user)}
            </div>

            {/* Nom d'affichage propre ("Mon compte" ou vrai nom) */}
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-tight truncate max-w-[130px]">
                {displayName}
              </p>
            </div>

            <ChevronDown className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          </button>

          {/* Menu déroulant du compte */}
          {userDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl border border-slate-200 bg-white p-2.5 shadow-xl dark:border-slate-800 dark:bg-slate-900 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {displayName}
                  </p>
                  <span
                    className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[9px] font-semibold border ${roleInfo.color} shrink-0`}
                  >
                    <RoleIcon className="h-2.5 w-2.5" />
                    {roleInfo.label}
                  </span>
                </div>
                {user?.email && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {user.email}
                  </p>
                )}
                <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1 truncate">
                  <Building2 className="h-3 w-3 shrink-0" />
                  <span className="truncate">{agencyName}</span>
                </p>
              </div>

              <button
                onClick={() => {
                  setUserDropdownOpen(false);
                  logout();
                }}
                className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/30 transition"
              >
                <LogOut className="h-3.5 w-3.5" />
                Se déconnecter
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
