"use client";

import React, { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import { useAuth } from "@/context/AuthContext";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import {
  Users,
  Search,
  PlusCircle,
  Phone,
  Mail,
  GraduationCap,
  FolderGit2,
  ChevronRight,
  UserCheck,
  Tag,
  ArrowRight,
} from "lucide-react";
import NewClientModal from "@/components/modals/NewClientModal";
import NewApplicationModal from "@/components/modals/NewApplicationModal";

export default function ClientsPage() {
  const { user } = useAuth();
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [countryFilter, setCountryFilter] = useState("ALL");
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [selectedClientForApp, setSelectedClientForApp] = useState<string | null>(null);

  const fetchClients = async () => {
    if (!user?.agencyId) return;
    try {
      setLoading(true);
      const params = new URLSearchParams({ agencyId: user.agencyId });
      if (countryFilter !== "ALL") params.append("country", countryFilter);
      if (search.trim()) params.append("search", search.trim());

      const res = await fetch(`/api/clients?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setClients(data);
      }
    } catch (err) {
      console.error("Error fetching clients:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [user?.agencyId, countryFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchClients();
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-slate-50/50 dark:bg-slate-950/50">
      <Header onOpenNewClientModal={() => setIsClientModalOpen(true)} />

      <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Répertoire des Clients (Candidats)
              </h1>
              <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                {clients.length} candidats
              </span>
            </div>
            <p className="text-xs md:text-sm text-slate-500 mt-1">
              Fiches complètes, parcours académiques, coordonnées WhatsApp et dossiers associés.
            </p>
          </div>

          <button
            onClick={() => setIsClientModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 shadow-blue-500/20 transition self-start sm:self-auto"
          >
            <PlusCircle className="h-4 w-4" />
            Nouveau Candidat
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800 text-xs font-semibold">
            <button
              onClick={() => setCountryFilter("ALL")}
              className={`rounded-lg px-3 py-1.5 transition ${
                countryFilter === "ALL"
                  ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white"
                  : "text-slate-600 dark:text-slate-400"
              }`}
            >
              Tous
            </button>
            <button
              onClick={() => setCountryFilter("FRANCE")}
              className={`rounded-lg px-3 py-1.5 flex items-center gap-1 transition ${
                countryFilter === "FRANCE"
                  ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white"
                  : "text-slate-600 dark:text-slate-400"
              }`}
            >
              <span>🇫🇷</span> France
            </button>
            <button
              onClick={() => setCountryFilter("CANADA")}
              className={`rounded-lg px-3 py-1.5 flex items-center gap-1 transition ${
                countryFilter === "CANADA"
                  ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white"
                  : "text-slate-600 dark:text-slate-400"
              }`}
            >
              <span>🇨🇦</span> Canada
            </button>
          </div>

          <form onSubmit={handleSearch} className="relative sm:w-72">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher par nom, email, tél..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </form>
        </div>

        {/* Clients Grid */}
        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-400 dark:border-slate-800 dark:bg-slate-900">
            Chargement des candidats...
          </div>
        ) : clients.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
            <Users className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-xs text-slate-500">Aucun client trouvé.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clients.map((client) => {
              let tags: string[] = [];
              try {
                if (client.tags) tags = JSON.parse(client.tags);
              } catch {}

              return (
                <div
                  key={client.id}
                  className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm hover:shadow-md transition dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <span className="font-mono text-[10px] text-blue-600 font-bold bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded">
                          {client.referenceCode}
                        </span>
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white mt-1">
                          {client.firstName} {client.lastName}
                        </h3>
                      </div>
                      <span className="text-xl">
                        {client.targetCountry === "FRANCE" ? "🇫🇷" : "🇨🇦"}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 mt-2">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">
                          {client.currentEducationLevel || "Niveau non précisé"} • {client.fieldOfStudy || "Filière à définir"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span>{client.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{client.email}</span>
                      </div>
                    </div>

                    {/* Tags */}
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {tags.map((tag, i) => (
                          <span
                            key={i}
                            className="rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] text-slate-600 dark:text-slate-400"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Associated Applications & Quick Action */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">
                        {client.applications?.length || 0} dossier(s)
                      </span>

                      {client.applications && client.applications.length > 0 ? (
                        <Link
                          href={`/applications/${client.applications[0].id}`}
                          className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:underline"
                        >
                          Voir dossier
                          <ChevronRight className="h-3 w-3" />
                        </Link>
                      ) : (
                        <button
                          onClick={() => setSelectedClientForApp(client.id)}
                          className="text-xs font-semibold text-blue-600 hover:underline"
                        >
                          + Ouvrir dossier
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Modals */}
      {isClientModalOpen && (
        <NewClientModal
          isOpen={isClientModalOpen}
          onClose={() => setIsClientModalOpen(false)}
          onSuccess={() => {
            setIsClientModalOpen(false);
            fetchClients();
          }}
        />
      )}

      {selectedClientForApp && (
        <NewApplicationModal
          isOpen={!!selectedClientForApp}
          preselectedClientId={selectedClientForApp}
          onClose={() => setSelectedClientForApp(null)}
          onSuccess={() => {
            setSelectedClientForApp(null);
            fetchClients();
          }}
        />
      )}
    </div>
  );
}
