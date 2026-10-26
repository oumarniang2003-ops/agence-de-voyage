"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { X, FolderPlus, AlertCircle } from "lucide-react";

interface NewApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  preselectedClientId?: string;
}

export default function NewApplicationModal({
  isOpen,
  onClose,
  onSuccess,
  preselectedClientId,
}: NewApplicationModalProps) {
  const { user, availableUsers } = useAuth();
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingClients, setFetchingClients] = useState(true);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    clientId: preselectedClientId || "",
    counselorId: user?.id || "",
    country: "FRANCE",
    targetInstitution: "",
    targetProgram: "",
    intake: "Rentrée Septembre 2026",
    totalServiceFee: "450000",
  });

  // Load clients of the agency
  useEffect(() => {
    async function loadAgencyClients() {
      if (!user?.agencyId) return;
      try {
        setFetchingClients(true);
        const res = await fetch(`/api/clients?agencyId=${user.agencyId}`);
        if (res.ok) {
          const list = await res.json();
          setClients(list);
          if (!formData.clientId && list.length > 0) {
            setFormData((prev) => ({ ...prev, clientId: list[0].id }));
          }
        }
      } catch (err) {
        console.error("Error loading clients:", err);
      } finally {
        setFetchingClients(false);
      }
    }
    loadAgencyClients();
  }, [user?.agencyId]);

  const agencyCounselors = availableUsers.filter(
    (u) => u.agencyId === user?.agencyId && (u.role === "COUNSELOR" || u.role === "ADMIN")
  );

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.clientId || !formData.country) {
      setError("Veuillez sélectionner un client et un pays de procédure.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          agencyId: user?.agencyId,
          currency: user?.agencyCurrency || "EUR",
          createdById: user?.id,
          createdByName: `${user?.firstName} ${user?.lastName}`,
        }),
      });

      if (res.ok) {
        onSuccess();
      } else {
        const data = await res.json();
        setError(data.error || "Erreur lors de la création du dossier.");
      }
    } catch (err) {
      setError("Une erreur réseau est survenue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 my-8">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
              <FolderPlus className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Ouvrir un Nouveau Dossier
              </h2>
              <p className="text-xs text-slate-500">
                Initialise automatiquement le workflow officiel et la checklist documentaire
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Client / Candidat *
            </label>
            {fetchingClients ? (
              <p className="text-xs text-slate-400">Chargement des clients...</p>
            ) : clients.length === 0 ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                Aucun client enregistré pour le moment. Veuillez créer un client d&apos;abord.
              </div>
            ) : (
              <select
                required
                value={formData.clientId}
                onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.firstName} {c.lastName} ({c.referenceCode}) - {c.targetCountry}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Procédure & Destination *
              </label>
              <select
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="FRANCE">🇫🇷 France : Campus France & VLS-TS (11 étapes)</option>
                <option value="CANADA">🇨🇦 Canada : IRCC & CAQ Québec (11 étapes)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Conseiller en charge
              </label>
              <select
                value={formData.counselorId}
                onChange={(e) => setFormData({ ...formData, counselorId: e.target.value })}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                {agencyCounselors.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.firstName} {c.lastName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Établissement visé
              </label>
              <input
                type="text"
                placeholder="ex: Université Paris-Saclay, Laval..."
                value={formData.targetInstitution}
                onChange={(e) => setFormData({ ...formData, targetInstitution: e.target.value })}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Programme ou Formation visée
              </label>
              <input
                type="text"
                placeholder="ex: Master Informatique, Baccalauréat Génie..."
                value={formData.targetProgram}
                onChange={(e) => setFormData({ ...formData, targetProgram: e.target.value })}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Rentrée visée
              </label>
              <input
                type="text"
                placeholder="ex: Septembre 2026, Automne 2026..."
                value={formData.intake}
                onChange={(e) => setFormData({ ...formData, intake: e.target.value })}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Frais d&apos;accompagnement ({user?.agencyCurrency || "EUR"})
              </label>
              <input
                type="number"
                placeholder="ex: 450000"
                value={formData.totalServiceFee}
                onChange={(e) => setFormData({ ...formData, totalServiceFee: e.target.value })}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          <div className="rounded-xl bg-blue-50/70 p-3 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 text-[11px] text-blue-800 dark:text-blue-300">
            ℹ️ Dès l&apos;ouverture du dossier, toutes les étapes officielles de la procédure ainsi que la liste des pièces justificatives correspondantes seront automatiquement générées.
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading || clients.length === 0}
              className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-semibold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? "Création en cours..." : "Ouvrir le dossier"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
