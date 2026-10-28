"use client";

import React, { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import { useAuth } from "@/context/AuthContext";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";
import {
  FolderGit2,
  AlertTriangle,
  Clock,
  ArrowRight,
  PlusCircle,
  CheckCircle2,
  RefreshCw,
  Building2,
  GraduationCap,
  Palmtree,
  FileText,
  ChevronRight,
  Send,
  Phone,
} from "lucide-react";
import NewApplicationModal from "@/components/modals/NewApplicationModal";

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAppModalOpen, setIsAppModalOpen] = useState(false);

  const fetchDashboardData = async () => {
    if (!user?.agencyId) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/dashboard?agencyId=${user.agencyId}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user?.agencyId]);

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-slate-50/50 dark:bg-slate-950/50 pb-16">
      <Header
        onOpenNewApplicationModal={() => setIsAppModalOpen(true)}
      />

      <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto space-y-6">
        {/* Bandeau d'accueil simple et professionnel */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 p-6 text-white shadow-xl shadow-blue-900/10">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur-md mb-2">
              <Building2 className="h-3.5 w-3.5 text-blue-200" />
              <span>{user?.agencyName}</span>
              <span className="text-blue-300">•</span>
              <span>Devise : {user?.agencyCurrency || "FCFA"}</span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight">
              Bonjour, {user?.firstName} 👋
            </h1>
            <p className="text-blue-100 text-xs md:text-sm mt-1 max-w-xl">
              Suivi quotidien des dossiers d&apos;études et visas touristiques de votre agence.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsAppModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-white text-blue-900 hover:bg-blue-50 px-4 py-2.5 text-xs font-bold shadow-md transition"
            >
              <PlusCircle className="h-4 w-4 text-blue-600" />
              Nouveau Dossier
            </button>
          </div>
        </div>

        {/* Chargement */}
        {loading && !data && (
          <div className="flex items-center justify-center p-12 text-slate-400">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            Chargement des indicateurs...
          </div>
        )}

        {data && (
          <>
            {/* 5 Indicateurs Clés Réels */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 md:gap-4">
              {/* 1. Total Dossiers Actifs */}
              <Link
                href="/applications"
                className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm hover:border-blue-400 transition dark:border-slate-800 dark:bg-slate-900 block"
              >
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-xs font-medium">Dossiers Actifs</span>
                  <div className="rounded-lg bg-blue-50 p-2 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                    <FolderGit2 className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-slate-900 dark:text-white">
                    {data.stats.activeApplications}
                  </span>
                  <span className="text-[11px] text-slate-500">en cours</span>
                </div>
              </Link>

              {/* 2. Dossiers Études */}
              <Link
                href="/applications?type=STUDIES"
                className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm hover:border-blue-400 transition dark:border-slate-800 dark:bg-slate-900 block"
              >
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-xs font-medium">Études à l&apos;étranger</span>
                  <div className="rounded-lg bg-blue-50 p-2 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                    <GraduationCap className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {data.stats.studiesCount}
                  </span>
                  <span className="text-[11px] text-slate-500">candidats</span>
                </div>
              </Link>

              {/* 3. Dossiers Tourisme */}
              <Link
                href="/applications?type=TOURISM"
                className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm hover:border-emerald-400 transition dark:border-slate-800 dark:bg-slate-900 block"
              >
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-xs font-medium">Visa Visiteur / Tourisme</span>
                  <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                    <Palmtree className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    {data.stats.tourismCount}
                  </span>
                  <span className="text-[11px] text-slate-500">voyageurs</span>
                </div>
              </Link>

              {/* 4. En attente de documents */}
              <Link
                href="/applications?status=BLOCKED"
                className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm hover:border-amber-400 transition dark:border-slate-800 dark:bg-slate-900 block"
              >
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-xs font-medium">Pièces manquantes</span>
                  <div className="rounded-lg bg-amber-50 p-2 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
                    <FileText className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                    {data.stats.pendingDocsCount}
                  </span>
                  <span className="text-[11px] text-slate-500">à compléter</span>
                </div>
              </Link>

              {/* 5. Soumis / En attente de réponse */}
              <Link
                href="/applications?status=IN_PROGRESS"
                className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm hover:border-purple-400 transition dark:border-slate-800 dark:bg-slate-900 block"
              >
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-xs font-medium">Soumis / En attente</span>
                  <div className="rounded-lg bg-purple-50 p-2 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400">
                    <Send className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {data.stats.submittedOrWaitingCount}
                  </span>
                  <span className="text-[11px] text-slate-500">en traitement</span>
                </div>
              </Link>
            </div>

            {/* Section Priorité : Actions à effectuer aujourd'hui ou en retard */}
            <div className="rounded-2xl border border-amber-200/80 bg-white p-6 shadow-sm dark:border-amber-900/40 dark:bg-slate-900">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-amber-100 dark:border-amber-900/30">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                      Actions à effectuer aujourd&apos;hui ou en retard
                    </h2>
                    <p className="text-[11px] text-slate-500">
                      Rappels planifiés pour ne jamais perdre le fil d&apos;un dossier
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                  {data.overdueOrTodayActions?.length || 0} action(s)
                </span>
              </div>

              {data.overdueOrTodayActions && data.overdueOrTodayActions.length > 0 ? (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {data.overdueOrTodayActions.map((app: any) => (
                    <div
                      key={app.id}
                      className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 px-2 rounded-xl transition"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900 dark:text-white">
                            {app.client?.firstName} {app.client?.lastName}
                          </span>
                          <span className="font-mono text-[11px] text-slate-400">
                            ({app.dossierNumber})
                          </span>
                          <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full dark:bg-rose-950/40 dark:text-rose-300">
                            Échéance : {formatDate(app.nextActionDate)}
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 font-medium">
                          👉 {app.nextAction}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-center">
                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {app.client?.phone}
                        </span>
                        <Link
                          href={`/applications/${app.id}`}
                          className="inline-flex items-center gap-1 rounded-lg bg-amber-600 px-3 py-1 text-xs font-semibold text-white hover:bg-amber-700 transition"
                        >
                          <span>Traiter</span>
                          <ChevronRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 py-3 text-center">
                  ✅ Aucune action en retard pour le moment. Tout est à jour !
                </p>
              )}
            </div>

            {/* Section : Derniers dossiers modifiés */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                    Derniers dossiers modifiés
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    Accès rapide aux dossiers récemment mis à jour par votre équipe
                  </p>
                </div>
                <Link
                  href="/applications"
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  Voir tous les dossiers <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {data.recentApplications?.map((app: any) => (
                  <div
                    key={app.id}
                    className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 px-2 rounded-xl transition"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/applications/${app.id}`}
                          className="font-bold text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 font-mono"
                        >
                          {app.dossierNumber}
                        </Link>
                        <span className="font-bold text-xs text-slate-900 dark:text-white">
                          {app.client?.firstName} {app.client?.lastName}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.2 text-[10px] font-bold ${
                            app.type === "TOURISM"
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                              : "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                          }`}
                        >
                          {app.type === "TOURISM" ? "Tourisme" : "Études"}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {app.country === "FRANCE" ? "🇫🇷 France" : app.country === "CANADA" ? "🇨🇦 Canada" : app.country} • {app.targetInstitution || app.targetProgram || "Non spécifié"}
                      </p>
                    </div>

                    <Link
                      href={`/applications/${app.id}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-slate-900 dark:text-slate-300 self-end sm:self-center"
                    >
                      Ouvrir <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </main>

      {/* Modal d'ouverture d'un nouveau dossier */}
      <NewApplicationModal
        isOpen={isAppModalOpen}
        onClose={() => setIsAppModalOpen(false)}
        onSuccess={() => fetchDashboardData()}
      />
    </div>
  );
}
