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
  PlusCircle,
  ChevronRight,
  GraduationCap,
  Palmtree,
  Calendar,
  AlertTriangle,
  FileCheck2,
  Clock,
  Phone,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import NewApplicationModal from "@/components/modals/NewApplicationModal";

export default function ApplicationsPage() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"table" | "kanban">("table");
  const [typeFilter, setTypeFilter] = useState<string>("ALL"); // "ALL", "STUDIES", "TOURISM"
  const [countryFilter, setCountryFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isNewAppModalOpen, setIsNewAppModalOpen] = useState(false);

  const fetchApplications = async () => {
    if (!user?.agencyId) return;
    try {
      setLoading(true);
      const params = new URLSearchParams({ agencyId: user.agencyId });
      if (typeFilter !== "ALL") params.append("type", typeFilter);
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
  }, [user?.agencyId, typeFilter, countryFilter, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchApplications();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "IN_PROGRESS":
        return { label: "En cours", bg: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300" };
      case "BLOCKED":
        return { label: "Bloqué / Action requise", bg: "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300" };
      case "ACCEPTED":
        return { label: "Admis / Accordé", bg: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300" };
      case "VISA_GRANTED":
        return { label: "Visa Accordé 🎉", bg: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" };
      case "VISA_REFUSED":
        return { label: "Visa Refusé", bg: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300" };
      case "CLOSED":
        return { label: "Dossier Clôturé", bg: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400" };
      default:
        return { label: status, bg: "bg-slate-100 text-slate-700" };
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-slate-50/50 dark:bg-slate-950/50">
      <Header onOpenNewApplicationModal={() => setIsNewAppModalOpen(true)} />

      <main className="flex-1 p-4 md:p-8 max-w-[1600px] w-full mx-auto space-y-6">
        {/* Top bar: Titre + Bouton d'ouverture rapide */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Mes dossiers
            </h1>
            <p className="text-xs md:text-sm text-slate-500 mt-1">
              Gestion centralisée des démarches d&apos;études et visas touristiques de l&apos;agence.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Bascule Vue Tableau / Vue Kanban */}
            <div className="flex rounded-xl bg-slate-200/80 p-1 dark:bg-slate-800 text-xs font-semibold">
              <button
                onClick={() => setViewMode("table")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition ${
                  viewMode === "table"
                    ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white"
                    : "text-slate-600 dark:text-slate-400"
                }`}
              >
                <TableIcon className="h-4 w-4" />
                Liste
              </button>
              <button
                onClick={() => setViewMode("kanban")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition ${
                  viewMode === "kanban"
                    ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white"
                    : "text-slate-600 dark:text-slate-400"
                }`}
              >
                <Kanban className="h-4 w-4" />
                Tableau Visuel
              </button>
            </div>

            <button
              onClick={() => setIsNewAppModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition"
            >
              <PlusCircle className="h-4 w-4" />
              Nouveau Dossier
            </button>
          </div>
        </div>

        {/* Barre de Filtres & Recherche rapide */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5 rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Filtre Type de dossier (Tous / Études / Tourisme) */}
            <div className="flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800 text-xs font-semibold">
              <button
                onClick={() => setTypeFilter("ALL")}
                className={`rounded-lg px-3 py-1.5 transition ${
                  typeFilter === "ALL"
                    ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white"
                    : "text-slate-600 dark:text-slate-400"
                }`}
              >
                Tous les types ({applications.length})
              </button>
              <button
                onClick={() => setTypeFilter("STUDIES")}
                className={`rounded-lg px-3 py-1.5 flex items-center gap-1.5 transition ${
                  typeFilter === "STUDIES"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400"
                }`}
              >
                <GraduationCap className="h-3.5 w-3.5" />
                Études
              </button>
              <button
                onClick={() => setTypeFilter("TOURISM")}
                className={`rounded-lg px-3 py-1.5 flex items-center gap-1.5 transition ${
                  typeFilter === "TOURISM"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400"
                }`}
              >
                <Palmtree className="h-3.5 w-3.5" />
                Tourisme
              </button>
            </div>

            {/* Filtre Destination */}
            <select
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="ALL">Toutes destinations</option>
              <option value="FRANCE">🇫🇷 France</option>
              <option value="CANADA">🇨🇦 Canada</option>
              <option value="ESPAGNE">🇪🇸 Espagne / Schengen</option>
              <option value="USA">🇺🇸 USA</option>
            </select>

            {/* Filtre Statut */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="ALL">Tous les statuts</option>
              <option value="IN_PROGRESS">En cours</option>
              <option value="BLOCKED">Bloqué / Action requise</option>
              <option value="ACCEPTED">Admis / Accordé</option>
              <option value="VISA_GRANTED">Visa Accordé</option>
              <option value="VISA_REFUSED">Visa Refusé</option>
              <option value="CLOSED">Clôturé</option>
            </select>
          </div>

          {/* Recherche rapide par nom, dossier ou téléphone */}
          <form onSubmit={handleSearchSubmit} className="relative sm:w-80">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher nom, téléphone, N° dossier..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </form>
        </div>

        {/* État de chargement */}
        {loading && (
          <div className="flex items-center justify-center p-12 text-slate-400">
            Chargement des dossiers...
          </div>
        )}

        {/* Liste vide */}
        {!loading && applications.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
            <FolderGit2 className="mx-auto h-10 w-10 text-slate-400" />
            <h3 className="mt-3 text-sm font-bold text-slate-900 dark:text-white">
              Aucun dossier trouvé
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Aucun dossier ne correspond à vos critères de recherche.
            </p>
            <button
              onClick={() => setIsNewAppModalOpen(true)}
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-blue-700"
            >
              <PlusCircle className="h-4 w-4" />
              Créer un premier dossier
            </button>
          </div>
        )}

        {/* VUE 1 : TABLEAU / LISTE STRUCTURÉE (Recommandée pour rapidité) */}
        {!loading && applications.length > 0 && viewMode === "table" && (
          <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider dark:bg-slate-800/50 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Dossier</th>
                    <th className="py-3 px-4">Client / Contact</th>
                    <th className="py-3 px-4">Type & Destination</th>
                    <th className="py-3 px-4">Statut & Étape</th>
                    <th className="py-3 px-4">Prochaine action</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {applications.map((app) => {
                    const statusBadge = getStatusBadge(app.status);
                    const isTourism = app.type === "TOURISM";
                    const isOverdue =
                      app.nextActionDate && new Date(app.nextActionDate) < new Date();

                    return (
                      <tr
                        key={app.id}
                        className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition group"
                      >
                        {/* Numéro de dossier */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <Link
                            href={`/applications/${app.id}`}
                            className="font-bold font-mono text-blue-600 hover:text-blue-700 dark:text-blue-400"
                          >
                            {app.dossierNumber}
                          </Link>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            Créé le {formatDate(app.createdAt)}
                          </div>
                        </td>

                        {/* Client */}
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900 dark:text-white">
                            {app.client?.firstName} {app.client?.lastName}
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                            <Phone className="h-3 w-3 text-slate-400" />
                            <span>{app.client?.phone || "Sans téléphone"}</span>
                          </div>
                        </td>

                        {/* Type & Pays */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                isTourism
                                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
                                  : "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300"
                              }`}
                            >
                              {isTourism ? (
                                <Palmtree className="h-3 w-3" />
                              ) : (
                                <GraduationCap className="h-3 w-3" />
                              )}
                              {isTourism ? "Tourisme" : "Études"}
                            </span>
                            <span className="font-semibold text-slate-800 dark:text-slate-200">
                              {app.country === "FRANCE"
                                ? "🇫🇷 France"
                                : app.country === "CANADA"
                                ? "🇨🇦 Canada"
                                : app.country}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5 truncate max-w-xs">
                            {app.targetInstitution || app.targetProgram || "Non précisé"}
                          </div>
                        </td>

                        {/* Statut & Progression */}
                        <td className="py-3 px-4">
                          <span
                            className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold ${statusBadge.bg}`}
                          >
                            {statusBadge.label}
                          </span>
                          <div className="flex items-center gap-2 mt-1.5">
                            <div className="w-20 bg-slate-100 rounded-full h-1.5 dark:bg-slate-800 overflow-hidden">
                              <div
                                className="bg-blue-600 h-1.5 rounded-full"
                                style={{ width: `${app.progressPercentage || 0}%` }}
                              />
                            </div>
                            <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">
                              {app.progressPercentage || 0}%
                            </span>
                          </div>
                        </td>

                        {/* Prochaine Action */}
                        <td className="py-3 px-4">
                          {app.nextAction ? (
                            <div className="max-w-xs">
                              <div className="font-medium text-slate-900 dark:text-white truncate">
                                {app.nextAction}
                              </div>
                              {app.nextActionDate && (
                                <div
                                  className={`flex items-center gap-1 text-[11px] font-semibold mt-0.5 ${
                                    isOverdue
                                      ? "text-rose-600 dark:text-rose-400"
                                      : "text-slate-500"
                                  }`}
                                >
                                  {isOverdue && <AlertTriangle className="h-3 w-3" />}
                                  <span>
                                    {isOverdue ? "En retard : " : "Pour le : "}
                                    {formatDate(app.nextActionDate)}
                                  </span>
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-400 text-[11px] italic">
                              Aucune action enregistrée
                            </span>
                          )}
                        </td>

                        {/* Action Ouvrir */}
                        <td className="py-3 px-4 text-right">
                          <Link
                            href={`/applications/${app.id}`}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition"
                          >
                            <span>Ouvrir</span>
                            <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
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

        {/* VUE 2 : KANBAN VISUEL */}
        {!loading && applications.length > 0 && viewMode === "kanban" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {["IN_PROGRESS", "BLOCKED", "ACCEPTED", "VISA_GRANTED"].map((statusKey) => {
              const statusApps = applications.filter((a) => a.status === statusKey);
              const badge = getStatusBadge(statusKey);

              return (
                <div
                  key={statusKey}
                  className="rounded-2xl border border-slate-200/80 bg-slate-100/50 p-4 dark:border-slate-800 dark:bg-slate-900/50 space-y-3"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {badge.label}
                    </span>
                    <span className="rounded-full bg-white dark:bg-slate-800 px-2 py-0.5 text-xs font-bold text-slate-600 dark:text-slate-400 shadow-sm">
                      {statusApps.length}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {statusApps.map((app) => (
                      <Link
                        key={app.id}
                        href={`/applications/${app.id}`}
                        className="block rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm hover:border-blue-400 hover:shadow-md transition dark:border-slate-800 dark:bg-slate-800"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[11px] font-bold text-blue-600 dark:text-blue-400">
                            {app.dossierNumber}
                          </span>
                          <span
                            className={`rounded-full px-1.5 py-0.2 text-[9px] font-bold ${
                              app.type === "TOURISM"
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                                : "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                            }`}
                          >
                            {app.type === "TOURISM" ? "Tourisme" : "Études"}
                          </span>
                        </div>

                        <h4 className="font-bold text-xs text-slate-900 dark:text-white mt-1">
                          {app.client?.firstName} {app.client?.lastName}
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                          {app.targetInstitution || app.country}
                        </p>

                        {app.nextAction && (
                          <div className="mt-2 rounded-lg bg-amber-50 p-2 text-[10px] text-amber-900 dark:bg-amber-950/40 dark:text-amber-300">
                            <span className="font-bold">À faire :</span> {app.nextAction}
                          </div>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Modal d'ouverture d'un nouveau dossier */}
      <NewApplicationModal
        isOpen={isNewAppModalOpen}
        onClose={() => setIsNewAppModalOpen(false)}
        onSuccess={() => fetchApplications()}
      />
    </div>
  );
}
