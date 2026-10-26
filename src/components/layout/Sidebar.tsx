"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderGit2,
  Users,
  FileCheck2,
  Settings,
  Compass,
  PlaneTakeoff,
  Sparkles,
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    {
      label: "Tableau de bord",
      href: "/",
      icon: LayoutDashboard,
    },
    {
      label: "Dossiers & Workflows",
      href: "/applications",
      icon: FolderGit2,
    },
    {
      label: "Clients (Candidats)",
      href: "/clients",
      icon: Users,
    },
    {
      label: "Documents & Contrôle",
      href: "/documents",
      icon: FileCheck2,
    },
    {
      label: "Paramètres Agence",
      href: "/settings",
      icon: Settings,
    },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 h-screen sticky top-0 transition-colors">
      {/* Brand */}
      <div className="flex h-16 items-center gap-2.5 px-6 border-b border-gray-200 dark:border-gray-800">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/30">
          <PlaneTakeoff className="h-5 w-5" />
        </div>
        <div>
          <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            VisaTrack
          </span>
          <span className="block text-[10px] text-gray-400 font-medium uppercase tracking-wider">
            SaaS Études Supérieures
          </span>
        </div>
      </div>

      {/* Nav list */}
      <div className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
          Menu Principal
        </div>

        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
                isActive
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? "text-white" : "text-gray-500"}`} />
              {item.label}
            </Link>
          );
        })}

        {/* Procedures Shortcuts */}
        <div className="pt-6 px-3 pb-2 text-[11px] font-semibold text-gray-400 uppercase tracking-wider flex items-center justify-between">
          <span>Procédures Actives</span>
          <Sparkles className="h-3 w-3 text-amber-500" />
        </div>

        <Link
          href="/applications?country=FRANCE"
          className="flex items-center justify-between rounded-xl px-3.5 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition"
        >
          <span className="flex items-center gap-2">
            <span className="text-base">🇫🇷</span> France (Campus France)
          </span>
          <span className="rounded-full bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
            11 étapes
          </span>
        </Link>

        <Link
          href="/applications?country=CANADA"
          className="flex items-center justify-between rounded-xl px-3.5 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition"
        >
          <span className="flex items-center gap-2">
            <span className="text-base">🇨🇦</span> Canada (IRCC & CAQ)
          </span>
          <span className="rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-700 dark:bg-red-950 dark:text-red-300">
            11 étapes
          </span>
        </Link>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <div className="rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50/50 p-3.5 dark:from-blue-950/30 dark:to-indigo-950/20 border border-blue-100/60 dark:border-blue-900/40">
          <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 font-semibold text-xs mb-1">
            <Compass className="h-4 w-4" />
            Gestion Interne & Suivi
          </div>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
            Outil d’aide à la gestion pour agences. Ne se connecte pas aux plateformes officielles.
          </p>
        </div>
      </div>
    </aside>
  );
}
