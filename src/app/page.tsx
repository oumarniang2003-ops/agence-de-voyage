"use client";

import React, { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import { useAuth } from "@/context/AuthContext";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";
import Link from "next/link";
import {
  Users,
  FolderGit2,
  AlertTriangle,
  Award,
  Wallet,
  Clock,
  ArrowRight,
  PlusCircle,
  FileText,
  Search,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Building2,
  ExternalLink,
} from "lucide-react";
import NewClientModal from "@/components/modals/NewClientModal";
import NewApplicationModal from "@/components/modals/NewApplicationModal";

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
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
    <div className="flex-1 flex flex-col min-w-0 bg-slate-50/50 dark:bg-slate-950/50">
      <Header
        onOpenNewClientModal={() => setIsClientModalOpen(true)}
        onOpenNewApplicationModal={() => setIsAppModalOpen(true)}
      />

      <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto space-y-6">
        {/* Welcome & Agency Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 p-6 text-white shadow-xl shadow-blue-900/10">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur-md mb-2">
              <Building2 className="h-3.5 w-3.5 text-blue-200" />
              <span>{user?.agencyName}</span>
              <span className="text-blue-300">•</span>
              <span>Devise : {user?.agencyCurrency}</span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight">
              Bonjour, {user?.firstName} {user?.lastName} 👋
            </h1>
            <p className="text-blue-100 text-xs md:text-sm mt-1 max-w-xl">
              Suivi opérationnel des dossiers Campus France (Pastel) et Canada (Permis d’études & CAQ).
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsClientModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2.5 text-xs font-semibold backdrop-blur-md transition"
            >
              <PlusCircle className="h-4 w-4" />
              Nouveau Client
            </button>
            <button
              onClick={() => setIsAppModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-white text-blue-900 hover:bg-blue-50 px-4 py-2.5 text-xs font-bold shadow-md transition"
            >
              <PlusCircle className="h-4 w-4 text-blue-600" />
              Nouveau Dossier
            </button>
          </div>
        </div>

        {/* Loading state */}
        {loading && !data && (
          <div className="flex items-center justify-center p-12 text-slate-400">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            Chargement des indicateurs...
          </div>
        )}

        {data && (
          <>
            {/* KPI Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 md:gap-4">
              <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                  <span className="text-xs font-medium">Clients Suivis</span>
                  <div className="rounded-lg bg-blue-50 p-2 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                    <Users className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-slate-900 dark:text-white">
                    {data.stats.totalClients}
                  </span>
                  <span className="text-[11px] text-slate-500">candidats</span>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                  <span className="text-xs font-medium">Dossiers en cours</span>
                  <div className="rounded-lg bg-amber-50 p-2 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
                    <FolderGit2 className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-slate-900 dark:text-white">
                    {data.stats.inProgressApplications}
                  </span>
                  <span className="text-[11px] text-slate-500">sur {data.stats.totalApplications}</span>
                </div>
              </div>

              <div className="rounded-2xl border border-rose-200 bg-rose-50/40 p-4 shadow-sm dark:border-rose-900/40 dark:bg-rose-950/20">
                <div className="flex items-center justify-between text-rose-600 dark:text-rose-400">
                  <span className="text-xs font-bold">Bloqués / Alertes</span>
                  <div className="rounded-lg bg-rose-100 p-2 text-rose-600 dark:bg-rose-900/50 dark:text-rose-400">
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-rose-700 dark:text-rose-300">
                    {data.stats.blockedApplications}
                  </span>
                  <span className="text-[11px] text-rose-600 dark:text-rose-400 font-medium">nécessitent action</span>
                </div>
              </div>

              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-4 shadow-sm dark:border-emerald-900/40 dark:bg-emerald-950/20">
                <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
                  <span className="text-xs font-bold">Visas Obtenus</span>
                  <div className="rounded-lg bg-emerald-100 p-2 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400">
                    <Award className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                    {data.stats.visasGranted}
                  </span>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">succès validés</span>
                </div>
              </div>

              <div className="col-span-2 lg:col-span-1 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                  <span className="text-xs font-medium">Recettes Encaissées</span>
                  <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                    <Wallet className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-2">
                  <span className="text-xl font-bold text-slate-900 dark:text-white">
                    {formatCurrency(data.stats.totalRevenue, user?.agencyCurrency)}
                  </span>
                </div>
              </div>
            </div>

            {/* Alert Applications Section (Important !) */}
            {data.alertApplications.length > 0 && (
              <div className="rounded-2xl border border-rose-200 bg-white p-5 shadow-sm dark:border-rose-900/50 dark:bg-slate-900">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-semibold text-sm">
                    <AlertTriangle className="h-4 w-4" />
                    <span>Dossiers nécessitant une intervention ({data.alertApplications.length})</span>
                  </div>
                  <span className="text-xs text-slate-400">
                    Seuil d&apos;alerte : &gt; {data.agency.alertThresholdDays} jours sans activité ou statut bloqué
                  </span>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800 mt-2">
                  {data.alertApplications.map((app: any) => (
                    <div key={app.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-base">{app.country === "FRANCE" ? "🇫🇷" : "🇨🇦"}</span>
                          <span className="font-semibold text-sm text-slate-900 dark:text-white">
                            {app.client.firstName} {app.client.lastName}
                          </span>
                          <span className="rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[11px] font-mono text-slate-600 dark:text-slate-300">
                            {app.dossierNumber}
                          </span>
                          <span className="rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 px-2 py-0.5 text-[10px] font-bold">
                            {app.status === "BLOCKED" ? "Bloqué" : "Inactif"}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {app.targetProgram} • {app.targetInstitution || "Établissement à définir"} • Conseiller : {app.counselor ? `${app.counselor.firstName} ${app.counselor.lastName}` : "Non assigné"}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Dernière activité : {formatDate(app.lastActivityAt)}
                        </span>
                        <Link
                          href={`/applications/${app.id}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-3 py-1.5 rounded-lg transition"
                        >
                          Ouvrir dossier
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Split Grid: Country procedures breakdown & Activity Feed */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left 1 col: Country Breakdown & Shortcuts */}
              <div className="space-y-4">
                <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <h3 className="font-semibold text-slate-900 dark:text-white text-sm mb-4">
                    Répartition par Destination
                  </h3>

                  <div className="space-y-3">
                    {/* France */}
                    <div className="rounded-xl border border-slate-100 p-3.5 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="text-2xl">🇫🇷</span>
                          <div>
                            <p className="font-semibold text-sm text-slate-900 dark:text-white">France</p>
                            <p className="text-xs text-slate-500">Campus France / Pastel</p>
                          </div>
                        </div>
                        <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                          {data.stats.franceApps}
                        </span>
                      </div>
                      <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                        <span className="text-slate-500">11 étapes configurées</span>
                        <Link
                          href="/applications?country=FRANCE"
                          className="text-blue-600 hover:underline font-medium inline-flex items-center gap-0.5"
                        >
                          Voir dossiers &rarr;
                        </Link>
                      </div>
                    </div>

                    {/* Canada */}
                    <div className="rounded-xl border border-slate-100 p-3.5 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="text-2xl">🇨🇦</span>
                          <div>
                            <p className="font-semibold text-sm text-slate-900 dark:text-white">Canada</p>
                            <p className="text-xs text-slate-500">IRCC, EED & CAQ</p>
                          </div>
                        </div>
                        <span className="text-lg font-bold text-red-600 dark:text-red-400">
                          {data.stats.canadaApps}
                        </span>
                      </div>
                      <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                        <span className="text-slate-500">11 étapes configurées</span>
                        <Link
                          href="/applications?country=CANADA"
                          className="text-red-600 hover:underline font-medium inline-flex items-center gap-0.5"
                        >
                          Voir dossiers &rarr;
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Team Tasks */}
                <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-slate-900 dark:text-white text-sm">
                      Tâches & Relances Récentes
                    </h3>
                    <span className="rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 px-2 py-0.5 text-[10px] font-bold">
                      {data.pendingTasks.length} en attente
                    </span>
                  </div>

                  <div className="space-y-2">
                    {data.pendingTasks.length === 0 ? (
                      <p className="text-xs text-slate-400 py-3 text-center">Aucune tâche en attente</p>
                    ) : (
                      data.pendingTasks.map((t: any) => (
                        <div
                          key={t.id}
                          className="flex items-start gap-2.5 rounded-lg border border-slate-100 p-2.5 dark:border-slate-800 text-xs"
                        >
                          <div className="mt-0.5 h-2 w-2 rounded-full bg-blue-600" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-slate-800 dark:text-slate-200 truncate">{t.title}</p>
                            <p className="text-[11px] text-slate-400">
                              Assigné à : {t.assignedToName || "Équipe"} • {formatDate(t.dueDate)}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Right 2 cols: Activity Timeline (Audit Trail) */}
              <div className="lg:col-span-2 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white text-sm">
                      Fil d&apos;Activité & Journal d&apos;Audit
                    </h3>
                    <p className="text-xs text-slate-400">
                      Historique transparent : qui a fait quoi dans votre agence
                    </p>
                  </div>
                  <button
                    onClick={fetchDashboardData}
                    className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
                    title="Actualiser"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                </div>

                <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                  {data.recentActivities.length === 0 ? (
                    <p className="text-xs text-slate-400 py-4">Aucune activité enregistrée pour le moment.</p>
                  ) : (
                    data.recentActivities.map((act: any) => (
                      <div key={act.id} className="relative group">
                        <div className="absolute -left-6 top-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-blue-600 dark:border-slate-900 ring-4 ring-blue-50 dark:ring-blue-950/40" />
                        <div>
                          <p className="text-xs font-semibold text-slate-900 dark:text-white">
                            {act.userName}
                            <span className="ml-2 font-normal text-slate-400 text-[11px]">
                              {formatDateTime(act.createdAt)}
                            </span>
                          </p>
                          <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                            {act.description}
                          </p>
                          {act.applicationId && (
                            <Link
                              href={`/applications/${act.applicationId}`}
                              className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:underline mt-1"
                            >
                              Voir le dossier associé &rarr;
                            </Link>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Modals */}
      {isClientModalOpen && (
        <NewClientModal
          isOpen={isClientModalOpen}
          onClose={() => setIsClientModalOpen(false)}
          onSuccess={() => {
            setIsClientModalOpen(false);
            fetchDashboardData();
          }}
        />
      )}

      {isAppModalOpen && (
        <NewApplicationModal
          isOpen={isAppModalOpen}
          onClose={() => setIsAppModalOpen(false)}
          onSuccess={() => {
            setIsAppModalOpen(false);
            fetchDashboardData();
          }}
        />
      )}
    </div>
  );
}
