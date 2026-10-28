"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderGit2,
  Settings,
  GraduationCap,
  Palmtree,
  PlaneTakeoff,
  ShieldCheck,
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
      label: "Mes dossiers",
      href: "/applications",
      icon: FolderGit2,
    },
    {
      label: "Paramètres",
      href: "/settings",
      icon: Settings,
    },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 h-screen sticky top-0 transition-colors">
      {/* Brand */}
      <div className="flex h-16 items-center gap-2.5 px-6 border-b border-slate-200 dark:border-slate-800">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/30">
          <PlaneTakeoff className="h-5 w-5" />
        </div>
        <div>
          <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            VisaTrack
          </span>
          <span className="block text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
            Études & Tourisme
          </span>
        </div>
      </div>

      {/* Nav list */}
      <div className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
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
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? "text-white" : "text-slate-500"}`} />
              {item.label}
            </Link>
          );
        })}

        {/* Accès direct aux types de dossiers */}
        <div className="pt-6 px-3 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
          <span>Catégories</span>
        </div>

        <Link
          href="/applications?type=STUDIES"
          className="flex items-center justify-between rounded-xl px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition"
        >
          <span className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-blue-600" />
            Études à l&apos;étranger
          </span>
        </Link>

        <Link
          href="/applications?type=TOURISM"
          className="flex items-center justify-between rounded-xl px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition"
        >
          <span className="flex items-center gap-2">
            <Palmtree className="h-4 w-4 text-emerald-600" />
            Visa Visiteur / Tourisme
          </span>
        </Link>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800">
        <div className="rounded-xl bg-slate-50 p-3.5 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold text-xs mb-1">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            Espace Agence Sécurisé
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            Gestion simplifiée des dossiers d&apos;études et visas touristiques.
          </p>
        </div>
      </div>
    </aside>
  );
}
