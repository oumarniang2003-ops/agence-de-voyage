"use client";

import React, { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import { useAuth } from "@/context/AuthContext";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import {
  FileCheck2,
  FileText,
  Filter,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Search,
} from "lucide-react";

export default function DocumentsPage() {
  const { user, canValidateDocuments } = useAuth();
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    async function loadDocuments() {
      if (!user?.agencyId) return;
      try {
        setLoading(true);
        // We can fetch applications to extract all documents
        const res = await fetch(`/api/applications?agencyId=${user.agencyId}`);
        if (res.ok) {
          const apps = await res.json();
          const allDocs: any[] = [];
          for (const a of apps) {
            for (const d of a.documents || []) {
              allDocs.push({
                ...d,
                applicationDossierNumber: a.dossierNumber,
                clientName: `${a.client.firstName} ${a.client.lastName}`,
                country: a.country,
                appId: a.id,
              });
            }
          }
          setDocuments(allDocs);
        }
      } catch (err) {
        console.error("Error loading documents:", err);
      } finally {
        setLoading(false);
      }
    }
    loadDocuments();
  }, [user?.agencyId]);

  const filtered = documents.filter((doc) => {
    if (statusFilter === "ALL") return true;
    return doc.status === statusFilter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "VALIDATED":
        return { label: "Validé", bg: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" };
      case "IN_REVIEW":
        return { label: "En examen", bg: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300" };
      case "UPLOADED":
        return { label: "À vérifier", bg: "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300" };
      case "REJECTED":
        return { label: "À corriger / Rejeté", bg: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300" };
      case "MISSING":
      default:
        return { label: "Manquant", bg: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400" };
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-slate-50/50 dark:bg-slate-950/50">
      <Header />

      <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto space-y-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Centre de Contrôle des Pièces Justificatives
            </h1>
            <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              {filtered.length} pièces
            </span>
          </div>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Revue transversale des passeports, diplômes, relevés et attestations financières de l&apos;agence.
          </p>
        </div>

        {/* Filter Toolbar */}
        <div className="flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800 text-xs font-semibold w-fit">
          <button
            onClick={() => setStatusFilter("ALL")}
            className={`rounded-lg px-3 py-1.5 transition ${
              statusFilter === "ALL"
                ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white"
                : "text-slate-600 dark:text-slate-400"
            }`}
          >
            Toutes les pièces ({documents.length})
          </button>
          <button
            onClick={() => setStatusFilter("UPLOADED")}
            className={`rounded-lg px-3 py-1.5 transition ${
              statusFilter === "UPLOADED"
                ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white"
                : "text-slate-600 dark:text-slate-400"
            }`}
          >
            À vérifier
          </button>
          <button
            onClick={() => setStatusFilter("IN_REVIEW")}
            className={`rounded-lg px-3 py-1.5 transition ${
              statusFilter === "IN_REVIEW"
                ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white"
                : "text-slate-600 dark:text-slate-400"
            }`}
          >
            En examen
          </button>
          <button
            onClick={() => setStatusFilter("VALIDATED")}
            className={`rounded-lg px-3 py-1.5 transition ${
              statusFilter === "VALIDATED"
                ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white"
                : "text-slate-600 dark:text-slate-400"
            }`}
          >
            Conformes
          </button>
          <button
            onClick={() => setStatusFilter("REJECTED")}
            className={`rounded-lg px-3 py-1.5 transition ${
              statusFilter === "REJECTED"
                ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white"
                : "text-slate-600 dark:text-slate-400"
            }`}
          >
            Rejetées
          </button>
        </div>

        {/* Documents Table */}
        <div className="rounded-2xl border border-slate-200/80 bg-white overflow-hidden shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider dark:border-slate-800 dark:bg-slate-800/50">
                <th className="px-4 py-3">Document</th>
                <th className="px-4 py-3">Candidat</th>
                <th className="px-4 py-3">Dossier</th>
                <th className="px-4 py-3">Destination</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                    Chargement des documents...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                    Aucune pièce pour ce filtre.
                  </td>
                </tr>
              ) : (
                filtered.map((doc) => {
                  const badge = getStatusBadge(doc.status);

                  return (
                    <tr key={doc.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {doc.name}
                        </div>
                        {doc.requirementName && (
                          <div className="text-[11px] text-slate-400">Exigence : {doc.requirementName}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-800 dark:text-slate-200 font-medium">
                        {doc.clientName}
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-600 dark:text-slate-400">
                        {doc.applicationDossierNumber}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-base mr-1.5">{doc.country === "FRANCE" ? "🇫🇷" : "🇨🇦"}</span>
                        {doc.country}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${badge.bg}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/applications/${doc.appId}`}
                          className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:underline"
                        >
                          Examiner
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
