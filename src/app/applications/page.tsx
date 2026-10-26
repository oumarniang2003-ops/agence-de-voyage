"use client";

import React, { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import { useAuth } from "@/context/AuthContext";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import {
  FolderGit2,
  Kanban,
  Table as TableIcon,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  Clock,
  PlusCircle,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";
import NewApplicationModal from "@/components/modals/NewApplicationModal";

export default function ApplicationsPage() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"kanban" | "table">("kanban");
  const [countryFilter, setCountryFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isNewAppModalOpen, setIsNewAppModalOpen] = useState(false);

  // France & Canada steps definition for Kanban columns
  const franceSteps = [
    { index: 0, title: "1. Bilan & Ouverture" },
    { index: 1, title: "2. Compte Pastel" },
    { index: 2, title: "3. Choix des vœux" },
    { index: 3, title: "4. Collecte pièces" },
    { index: 4, title: "5. Frais Campus France" },
    { index: 5, title: "6. Préparation oral" },
    { index: 6, title: "7. Entretien CF" },
    { index: 7, title: "8. Réponses & Choix" },
    { index: 8, title: "9. Dossier financier (AVI)" },
    { index: 9, title: "10. Dépôt Visa (TLS/VFS)" },
    { index: 10, title: "11. Visa & Départ" },
  ];

  const canadaSteps = [
    { index: 0, title: "1. Évaluation profil" },
    { index: 1, title: "2. Choix DLI/EED" },
    { index: 2, title: "3. Lettre LOA" },
    { index: 3, title: "4. Acompte scolarité" },
    { index: 4, title: "5. Demande CAQ" },
    { index: 5, title: "6. Preuves de fonds (CPG)" },
    { index: 6, title: "7. Permis IRCC" },
    { index: 7, title: "8. Biométrie CRDV" },
    { index: 8, title: "9. Visite médicale" },
    { index: 9, title: "10. Décision IRCC" },
    { index: 10, title: "11. Passeport & Briefing" },
  ];

  const fetchApplications = async () => {
    if (!user?.agencyId) return;
    try {
      setLoading(true);
      const params = new URLSearchParams({ agencyId: user.agencyId });
      if (countryFilter !== "ALL") params.append("country", countryFilter);
      if (statusFilter !== "ALL") params.append("status", statusFilter);
      if (searchQuery.trim()) params.append("search", searchQuery.trim());

      const res = await fetch(`/api/applications?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setApplications(data);
      }
    } catch (err) {
      console.error("Error fetching applications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [user?.agencyId, countryFilter, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchApplications();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "IN_PROGRESS":
        return { label: "En cours", bg: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300" };
      case "BLOCKED":
        return { label: "Bloqué / Retard", bg: "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300" };
      case "ACCEPTED":
        return { label: "Admis école", bg: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300" };
      case "VISA_GRANTED":
        return { label: "Visa Accordé 🎉", bg: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" };
      case "VISA_REFUSED":
        return { label: "Visa Refusé", bg: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300" };
      default:
        return { label: status, bg: "bg-slate-100 text-slate-700" };
    }
  };

  const activeSteps = countryFilter === "CANADA" ? canadaSteps : franceSteps;

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-slate-50/50 dark:bg-slate-950/50">
      <Header onOpenNewApplicationModal={() => setIsNewAppModalOpen(true)} />

      <main className="flex-1 p-4 md:p-8 max-w-[1600px] w-full mx-auto space-y-6">
        {/* Top bar: Title + View Switcher + New button */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Dossiers & Workflows de Procédure
              </h1>
              <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                {applications.length} dossiers
              </span>
            </div>
            <p className="text-xs md:text-sm text-slate-500 mt-1">
              Suivi interactif de A à Z : progression en %, alertes de blocage et collaboration d&apos;équipe.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* View Mode Switcher */}
            <div className="flex rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
              <button
                onClick={() => setViewMode("kanban")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  viewMode === "kanban"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                }`}
              >
                <Kanban className="h-3.5 w-3.5" />
                Vue Kanban
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  viewMode === "table"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                }`}
              >
                <TableIcon className="h-3.5 w-3.5" />
                Vue Tableau
              </button>
            </div>

            <button
              onClick={() => setIsNewAppModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 shadow-blue-500/20 transition"
            >
              <PlusCircle className="h-4 w-4" />
              Nouveau Dossier
            </button>
          </div>
        </div>

        {/* Filters & Search toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-wrap items-center gap-2">
            {/* Country filter tabs */}
            <div className="flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800 text-xs font-semibold">
              <button
                onClick={() => setCountryFilter("ALL")}
                className={`rounded-lg px-3 py-1.5 transition ${
                  countryFilter === "ALL"
                    ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white"
                    : "text-slate-600 dark:text-slate-400"
                }`}
              >
                Toutes ({applications.length})
              </button>
              <button
                onClick={() => setCountryFilter("FRANCE")}
                className={`rounded-lg px-3 py-1.5 flex items-center gap-1.5 transition ${
                  countryFilter === "FRANCE"
                    ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white"
                    : "text-slate-600 dark:text-slate-400"
                }`}
              >
                <span>🇫🇷</span> France (Campus France)
              </button>
              <button
                onClick={() => setCountryFilter("CANADA")}
                className={`rounded-lg px-3 py-1.5 flex items-center gap-1.5 transition ${
                  countryFilter === "CANADA"
                    ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white"
                    : "text-slate-600 dark:text-slate-400"
                }`}
              >
                <span>🇨🇦</span> Canada (IRCC / CAQ)
              </button>
            </div>

            {/* Status filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="ALL">Tous les statuts</option>
              <option value="IN_PROGRESS">En cours</option>
              <option value="BLOCKED">Bloqué / Attention</option>
              <option value="VISA_GRANTED">Visa Accordé</option>
              <option value="VISA_REFUSED">Visa Refusé</option>
            </select>
          </div>

          {/* Search form */}
          <form onSubmit={handleSearchSubmit} className="relative sm:w-72">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher candidat, dossier..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </form>
        </div>

        {/* Content View */}
        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-400 dark:border-slate-800 dark:bg-slate-900">
            Chargement des dossiers...
          </div>
        ) : applications.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
            <FolderGit2 className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Aucun dossier trouvé pour ces critères
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Modifiez vos filtres ou créez votre premier dossier d&apos;orientation pour cette agence.
            </p>
            <button
              onClick={() => setIsNewAppModalOpen(true)}
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition"
            >
              <PlusCircle className="h-4 w-4" />
              Ouvrir un dossier
            </button>
          </div>
        ) : viewMode === "kanban" ? (
          /* KANBAN VIEW */
          <div className="overflow-x-auto pb-4">
            <div className="flex gap-4 min-w-[1200px]">
              {activeSteps.map((col) => {
                const colApps = applications.filter(
                  (app) => app.currentStepIndex === col.index
                );

                return (
                  <div
                    key={col.index}
                    className="flex-1 min-w-[260px] max-w-[300px] flex flex-col rounded-2xl border border-slate-200/80 bg-slate-100/60 dark:border-slate-800 dark:bg-slate-900/60 p-3"
                  >
                    {/* Column Header */}
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200/60 dark:border-slate-800">
                      <span className="font-semibold text-xs text-slate-800 dark:text-slate-200 truncate" title={col.title}>
                        {col.title}
                      </span>
                      <span className="rounded-full bg-slate-200 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:text-slate-300">
                        {colApps.length}
                      </span>
                    </div>

                    {/* Column Cards */}
                    <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[70vh]">
                      {colApps.length === 0 ? (
                        <div className="py-6 text-center text-[11px] text-slate-400">
                          Aucun dossier à cette étape
                        </div>
                      ) : (
                        colApps.map((app) => {
                          const status = getStatusBadge(app.status);
                          const isBlocked = app.status === "BLOCKED";

                          return (
                            <Link
                              key={app.id}
                              href={`/applications/${app.id}`}
                              className={`block rounded-xl border bg-white p-3.5 shadow-sm transition hover:shadow-md hover:border-blue-400 dark:bg-slate-900 ${
                                isBlocked
                                  ? "border-rose-300 dark:border-rose-900/80 bg-rose-50/20"
                                  : "border-slate-200 dark:border-slate-800"
                              }`}
                            >
                              <div className="flex items-center justify-between gap-1 mb-1.5">
                                <span className="font-mono text-[10px] text-slate-500 font-semibold">
                                  {app.dossierNumber}
                                </span>
                                <span className="text-sm">
                                  {app.country === "FRANCE" ? "🇫🇷" : "🇨🇦"}
                                </span>
                              </div>

                              <p className="font-bold text-xs text-slate-900 dark:text-white truncate">
                                {app.client.firstName} {app.client.lastName}
                              </p>

                              <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                                {app.targetProgram || "Formation à définir"}
                              </p>

                              <p className="text-[10px] text-slate-400 truncate mt-0.5">
                                {app.targetInstitution || "Établissement à définir"}
                              </p>

                              {/* Progress bar */}
                              <div className="mt-3">
                                <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                                  <span>Progression</span>
                                  <span className="font-bold text-slate-700 dark:text-slate-300">
                                    {app.progressPercentage}%
                                  </span>
                                </div>
                                <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                  <div
                                    className={`h-full rounded-full transition-all duration-500 ${
                                      app.progressPercentage === 100
                                        ? "bg-emerald-500"
                                        : isBlocked
                                        ? "bg-rose-500"
                                        : "bg-blue-600"
                                    }`}
                                    style={{ width: `${app.progressPercentage}%` }}
                                  />
                                </div>
                              </div>

                              <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                                <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${status.bg}`}>
                                  {status.label}
                                </span>
                                <span className="text-[10px] text-slate-400">
                                  {formatDate(app.updatedAt)}
                                </span>
                              </div>
                            </Link>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* TABLE VIEW */
          <div className="rounded-2xl border border-slate-200/80 bg-white overflow-hidden shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider dark:border-slate-800 dark:bg-slate-800/50">
                    <th className="px-4 py-3">Dossier</th>
                    <th className="px-4 py-3">Candidat</th>
                    <th className="px-4 py-3">Pays</th>
                    <th className="px-4 py-3">Étape Actuelle</th>
                    <th className="px-4 py-3">Progression</th>
                    <th className="px-4 py-3">Statut</th>
                    <th className="px-4 py-3">Conseiller</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {applications.map((app) => {
                    const status = getStatusBadge(app.status);
                    const currentStep = app.steps.find(
                      (s: any) => s.orderIndex === app.currentStepIndex
                    );

                    return (
                      <tr
                        key={app.id}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition"
                      >
                        <td className="px-4 py-3 font-mono font-semibold text-slate-900 dark:text-white">
                          {app.dossierNumber}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-900 dark:text-white">
                            {app.client.firstName} {app.client.lastName}
                          </div>
                          <div className="text-[11px] text-slate-400">{app.client.phone}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1.5 font-medium">
                            <span className="text-base">{app.country === "FRANCE" ? "🇫🇷" : "🇨🇦"}</span>
                            {app.country === "FRANCE" ? "France" : "Canada"}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300">
                          {currentStep ? currentStep.stepTitle : `Étape ${app.currentStepIndex + 1}`}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-16 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                              <div
                                className="h-full bg-blue-600 rounded-full"
                                style={{ width: `${app.progressPercentage}%` }}
                              />
                            </div>
                            <span className="font-semibold text-slate-700 dark:text-slate-300">
                              {app.progressPercentage}%
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${status.bg}`}>
                            {status.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                          {app.counselor ? `${app.counselor.firstName} ${app.counselor.lastName}` : "Non assigné"}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link
                            href={`/applications/${app.id}`}
                            className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-300 transition"
                          >
                            Ouvrir
                            <ChevronRight className="h-3 w-3" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* New Application Modal */}
      {isNewAppModalOpen && (
        <NewApplicationModal
          isOpen={isNewAppModalOpen}
          onClose={() => setIsNewAppModalOpen(false)}
          onSuccess={() => {
            setIsNewAppModalOpen(false);
            fetchApplications();
          }}
        />
      )}
    </div>
  );
}
