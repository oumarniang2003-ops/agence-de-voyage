"use client";

import React, { useState } from "react";
import Header from "@/components/layout/Header";
import { useAuth } from "@/context/AuthContext";
import {
  Building2,
  GraduationCap,
  Palmtree,
  FileCheck2,
  ListTodo,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";

export default function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"types" | "documents" | "agency">("types");

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-slate-50/50 dark:bg-slate-950/50 pb-16">
      <Header />

      <main className="flex-1 p-4 md:p-8 max-w-5xl w-full mx-auto space-y-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Paramètres & Procédures de l&apos;Agence
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Visualisation des types de dossiers pris en charge, des pièces attendues et des coordonnées agence.
          </p>
        </div>

        {/* Onglets de configuration simples */}
        <div className="flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800 text-xs font-semibold w-fit">
          <button
            onClick={() => setActiveTab("types")}
            className={`rounded-lg px-4 py-2 transition ${
              activeTab === "types"
                ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white"
                : "text-slate-600 dark:text-slate-400"
            }`}
          >
            Types de dossiers & Statuts
          </button>
          <button
            onClick={() => setActiveTab("documents")}
            className={`rounded-lg px-4 py-2 transition ${
              activeTab === "documents"
                ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white"
                : "text-slate-600 dark:text-slate-400"
            }`}
          >
            Listes des documents attendus
          </button>
          <button
            onClick={() => setActiveTab("agency")}
            className={`rounded-lg px-4 py-2 transition ${
              activeTab === "agency"
                ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white"
                : "text-slate-600 dark:text-slate-400"
            }`}
          >
            Informations de l&apos;Agence
          </button>
        </div>

        {/* ONGLET 1 : TYPES DE DOSSIERS ET STATUTS */}
        {activeTab === "types" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Type 1 : Études */}
              <div className="rounded-2xl border border-blue-200 bg-white p-5 shadow-sm dark:border-blue-900/60 dark:bg-slate-900">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-300">
                    <GraduationCap className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      1. Études à l&apos;étranger
                    </h3>
                    <span className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold">
                      Actif • Procédures académiques
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mt-2">
                  Destiné aux candidats poursuivant des formations universitaires ou collégiales. Intègre la collecte des relevés de notes, attestations de virement irrévocable (AVI/CPG) et préparation aux entretiens consulaires.
                </p>
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500">
                  Destinations préconfigurées : 🇫🇷 Campus France & VLS-TS • 🇨🇦 DLI, CAQ & Permis IRCC
                </div>
              </div>

              {/* Type 2 : Tourisme */}
              <div className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm dark:border-emerald-900/60 dark:bg-slate-900">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300">
                    <Palmtree className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      2. Visa Visiteur / Tourisme
                    </h3>
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                      Actif • Séjours temporaires
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mt-2">
                  Destiné aux voyages touristiques, vacances et visites familiales. Met l&apos;accent sur les preuves d&apos;attaches socio-professionnelles au pays d&apos;origine, les justificatifs de ressources et l&apos;hébergement.
                </p>
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500">
                  Destinations préconfigurées : 🇫🇷 Visa Court Séjour Schengen • 🇨🇦 Visa Visiteur IRCC (VRT)
                </div>
              </div>
            </div>

            {/* Statuts standards du suivi */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                Cycle des statuts de suivi
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Chaque dossier progresse selon des jalons clairs et modifiables en 1 clic :
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs font-semibold">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 dark:border-slate-800 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300">
                  1. Nouveau dossier
                </div>
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-2.5 dark:border-amber-900/40 dark:bg-amber-950/20 text-amber-800 dark:text-amber-200">
                  2. Documents à compléter
                </div>
                <div className="rounded-xl border border-blue-200 bg-blue-50 p-2.5 dark:border-blue-900/40 dark:bg-blue-950/20 text-blue-800 dark:text-blue-200">
                  3. Dossier en préparation
                </div>
                <div className="rounded-xl border border-purple-200 bg-purple-50 p-2.5 dark:border-purple-900/40 dark:bg-purple-950/20 text-purple-800 dark:text-purple-200">
                  4. Dossier soumis
                </div>
                <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-2.5 dark:border-indigo-900/40 dark:bg-indigo-950/20 text-indigo-800 dark:text-indigo-200">
                  5. En attente de réponse
                </div>
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-2.5 dark:border-emerald-900/40 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-200">
                  6. Visa accordé / Admis 🎉
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ONGLET 2 : LISTE DES DOCUMENTS ATTENDUS */}
        {activeTab === "documents" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pièces Études */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center gap-2 mb-3">
                <GraduationCap className="h-5 w-5 text-blue-600" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Dossier d&apos;Études (Exemples configurés)
                </h3>
              </div>
              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
                <li className="flex items-center gap-2">✓ Passeport valide (minimum 1 an)</li>
                <li className="flex items-center gap-2">✓ Photo d&apos;identité récente (norme OACI)</li>
                <li className="flex items-center gap-2">✓ Relevés de notes et Diplôme du Baccalauréat</li>
                <li className="flex items-center gap-2">✓ Relevés des années universitaires</li>
                <li className="flex items-center gap-2">✓ Curriculum Vitae (CV) actualisé</li>
                <li className="flex items-center gap-2">✓ Lettre d&apos;acceptation ou LOA établissement</li>
                <li className="flex items-center gap-2">✓ Justificatif financier (AVI / CPG ou Garant)</li>
              </ul>
              <p className="text-[11px] text-slate-400 mt-4 italic">
                Note : Chaque dossier peut recevoir des documents supplémentaires libres selon les spécificités du consulat.
              </p>
            </div>

            {/* Pièces Tourisme */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center gap-2 mb-3">
                <Palmtree className="h-5 w-5 text-emerald-600" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Visa Visiteur / Tourisme (Exemples configurés)
                </h3>
              </div>
              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
                <li className="flex items-center gap-2">✓ Passeport valide (minimum 6 mois après retour)</li>
                <li className="flex items-center gap-2">✓ Photo d&apos;identité récente</li>
                <li className="flex items-center gap-2">✓ Justificatif d&apos;hébergement (Hôtel ou Attestation d&apos;accueil)</li>
                <li className="flex items-center gap-2">✓ Réservation de billet d&apos;avion aller-retour</li>
                <li className="flex items-center gap-2">✓ Relevés bancaires certifiés récents (3 à 6 mois)</li>
                <li className="flex items-center gap-2">✓ Justificatif d&apos;emploi ou registre de commerce (attaches)</li>
                <li className="flex items-center gap-2">✓ Assurance voyage médicale</li>
              </ul>
              <p className="text-[11px] text-slate-400 mt-4 italic">
                Note : Modulable directement sur la fiche du voyageur en 1 clic.
              </p>
            </div>
          </div>
        )}

        {/* ONGLET 3 : INFORMATIONS DE L'AGENCE */}
        {activeTab === "agency" && (
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 max-w-2xl space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600/10 text-blue-600">
                <Building2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  {user?.agencyName}
                </h3>
                <span className="text-xs text-slate-500 font-mono">
                  Tenant : {user?.agencySlug}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
              <div>
                <span className="text-slate-500">Devise utilisée :</span>
                <p className="font-bold text-slate-800 dark:text-slate-200">{user?.agencyCurrency || "FCFA"}</p>
              </div>
              <div>
                <span className="text-slate-500">Utilisateur connecté :</span>
                <p className="font-bold text-slate-800 dark:text-slate-200">{user?.firstName} {user?.lastName} ({user?.role})</p>
              </div>
              <div>
                <span className="text-slate-500">Isolation des données :</span>
                <p className="font-semibold text-emerald-600 flex items-center gap-1 mt-0.5">
                  <ShieldCheck className="h-4 w-4" /> Activée (cloisonnement strict)
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
