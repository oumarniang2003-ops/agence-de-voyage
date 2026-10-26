"use client";

import React, { useState } from "react";
import Header from "@/components/layout/Header";
import { useAuth } from "@/context/AuthContext";
import {
  Settings,
  Building2,
  Users,
  ShieldCheck,
  BellRing,
  GitFork,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

export default function SettingsPage() {
  const { user, availableUsers } = useAuth();
  const [activeTab, setActiveTab] = useState<"agency" | "workflows" | "team">("agency");

  const agencyUsers = availableUsers.filter((u) => u.agencyId === user?.agencyId);

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-slate-50/50 dark:bg-slate-950/50">
      <Header />

      <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto space-y-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Paramètres & Configuration de l&apos;Agence
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Gérez votre espace agence isolé, les collaborateurs, les devises et les modèles de procédure.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800 text-xs font-semibold w-fit">
          <button
            onClick={() => setActiveTab("agency")}
            className={`rounded-lg px-4 py-2 transition ${
              activeTab === "agency"
                ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white"
                : "text-slate-600 dark:text-slate-400"
            }`}
          >
            Agence & Alertes
          </button>
          <button
            onClick={() => setActiveTab("workflows")}
            className={`rounded-lg px-4 py-2 transition ${
              activeTab === "workflows"
                ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white"
                : "text-slate-600 dark:text-slate-400"
            }`}
          >
            Modèles de Procédures (France / Canada)
          </button>
          <button
            onClick={() => setActiveTab("team")}
            className={`rounded-lg px-4 py-2 transition ${
              activeTab === "team"
                ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white"
                : "text-slate-600 dark:text-slate-400"
            }`}
          >
            Collaborateurs & Rôles ({agencyUsers.length})
          </button>
        </div>

        {activeTab === "agency" && (
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6 max-w-3xl">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600/10 text-blue-600">
                <Building2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {user?.agencyName}
                </h3>
                <p className="text-xs text-slate-500">
                  Identifiant Tenant : <span className="font-mono">{user?.agencySlug}</span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nom de l&apos;Agence
                </label>
                <input
                  type="text"
                  disabled
                  value={user?.agencyName || ""}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-700 dark:text-slate-300"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Devise de facturation
                </label>
                <input
                  type="text"
                  disabled
                  value={user?.agencyCurrency || "FCFA"}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-700 dark:text-slate-300 font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Seuil d&apos;alerte d&apos;inactivité
                </label>
                <input
                  type="text"
                  disabled
                  value="7 jours d'inactivité déclenche une alerte de blocage"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-700 dark:text-slate-300"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Isolation des données (Multi-Tenant)
                </label>
                <div className="flex items-center gap-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 p-2 text-emerald-800 dark:text-emerald-300 font-semibold">
                  <ShieldCheck className="h-4 w-4" />
                  Isolation stricte par agency_id activée
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "workflows" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* France */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">🇫🇷</span>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Workflow France : Campus France & VLS-TS
                </h3>
              </div>
              <p className="text-xs text-slate-500 mb-4">
                11 étapes configurées pour guider les candidats de la création du compte Pastel jusqu&apos;à l&apos;obtention du visa long séjour.
              </p>

              <ol className="relative border-l border-slate-200 dark:border-slate-800 ml-3 space-y-3 text-xs">
                {[
                  "Ouverture & Bilan d’orientation",
                  "Création compte Études en France (Pastel)",
                  "Choix des formations & vœux",
                  "Collecte et validation des pièces",
                  "Soumission & Paiement frais Campus France",
                  "Préparation à l’entretien Campus France",
                  "Passage de l’entretien Campus France",
                  "Réponses & Admissions établissements",
                  "Constitution dossier financier (AVI)",
                  "Demande de Visa (France-Visas & TLS/VFS)",
                  "Décision consulaire & Préparation départ",
                ].map((step, idx) => (
                  <li key={idx} className="ml-4">
                    <span className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full border-2 border-white bg-blue-600 dark:border-slate-900" />
                    <span className="font-semibold text-slate-900 dark:text-white">
                      Étape {idx + 1} :
                    </span>{" "}
                    <span className="text-slate-600 dark:text-slate-400">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Canada */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">🇨🇦</span>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Workflow Canada : Admission EED, CAQ & Permis IRCC
                </h3>
              </div>
              <p className="text-xs text-slate-500 mb-4">
                11 étapes configurées pour les admissions collèges/universités désignés (DLI), le CAQ pour le Québec et le permis fédéral.
              </p>

              <ol className="relative border-l border-slate-200 dark:border-slate-800 ml-3 space-y-3 text-xs">
                {[
                  "Évaluation d’admissibilité & Profil",
                  "Choix programme & Établissement (DLI/EED)",
                  "Dépôt admission & Obtention lettre d’acceptation (LOA)",
                  "Paiement acompte de scolarité",
                  "Demande de CAQ (si province de Québec)",
                  "Montage du dossier financier (CPG / Relevés bancaires)",
                  "Soumission Permis d’études (Portail IRCC)",
                  "Collecte des données biométriques (CRDV)",
                  "Visite médicale préalable ou requise",
                  "Décision IRCC (Lettre d’introduction)",
                  "Acheminement passeport & Briefing de départ",
                ].map((step, idx) => (
                  <li key={idx} className="ml-4">
                    <span className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full border-2 border-white bg-red-600 dark:border-slate-900" />
                    <span className="font-semibold text-slate-900 dark:text-white">
                      Étape {idx + 1} :
                    </span>{" "}
                    <span className="text-slate-600 dark:text-slate-400">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        )}

        {activeTab === "team" && (
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Équipe de l&apos;Agence
            </h3>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {agencyUsers.map((m) => (
                <div key={m.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {m.firstName} {m.lastName}
                    </span>
                    <span className="text-slate-400 ml-2 font-mono">{m.email}</span>
                  </div>
                  <span className="rounded-full bg-blue-50 dark:bg-blue-950 px-2.5 py-1 font-semibold text-blue-700 dark:text-blue-300">
                    {m.role}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
