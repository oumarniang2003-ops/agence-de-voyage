"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { X, FolderPlus, AlertCircle, AlertTriangle, GraduationCap, Palmtree, UserCheck, Calendar } from "lucide-react";

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
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

  // Mode de sélection client : existant ou nouveau client direct
  const [clientMode, setClientMode] = useState<"existing" | "new">(
    preselectedClientId ? "existing" : "new"
  );

  const [formData, setFormData] = useState({
    type: "STUDIES" as "STUDIES" | "TOURISM",
    clientId: preselectedClientId || "",
    clientFirstName: "",
    clientLastName: "",
    clientPhone: "",
    clientEmail: "",
    country: "FRANCE",
    targetInstitution: "", // Établissement (études) ou Motif du séjour (tourisme)
    targetProgram: "", // Formation (études) ou Durée prévue (tourisme)
    intake: "", // Rentrée (études) ou Période envisagée (tourisme)
    counselorId: user?.id || "",
    totalServiceFee: "450000",
    initialStatus: "IN_PROGRESS",
    initialNotes: "",
    nextAction: "",
    nextActionDate: "",
    confirmDuplicate: false,
  });

  // Charger la liste des clients pour le mode client existant
  useEffect(() => {
    async function loadAgencyClients() {
      if (!user?.agencyId) return;
      try {
        setFetchingClients(true);
        const res = await fetch(`/api/clients?agencyId=${user.agencyId}`);
        if (res.ok) {
          const list = await res.json();
          setClients(list);
          if (preselectedClientId) {
            setFormData((prev) => ({ ...prev, clientId: preselectedClientId }));
          } else if (list.length > 0 && clientMode === "existing") {
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
  }, [user?.agencyId, preselectedClientId]);

  const agencyCounselors = availableUsers.filter(
    (u) => u.agencyId === user?.agencyId && (u.role === "COUNSELOR" || u.role === "ADMIN")
  );

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent, forceConfirm = false) => {
    e.preventDefault();
    setError("");
    setDuplicateWarning(null);

    if (clientMode === "existing" && !formData.clientId) {
      setError("Veuillez sélectionner un client existant.");
      return;
    }

    if (clientMode === "new") {
      if (!formData.clientLastName.trim() || !formData.clientPhone.trim()) {
        setError("Veuillez renseigner au moins le nom et le numéro de téléphone du client.");
        return;
      }
    }

    if (!formData.country) {
      setError("Veuillez sélectionner un pays de destination.");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        ...formData,
        confirmDuplicate: forceConfirm || formData.confirmDuplicate,
        agencyId: user?.agencyId,
        currency: user?.agencyCurrency || "FCFA",
      };

      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.status === 409 && data.isDuplicate) {
        setDuplicateWarning(data.warning);
        return;
      }

      if (res.ok) {
        onSuccess();
        onClose();
      } else {
        setError(data.error || "Erreur lors de la création du dossier.");
      }
    } catch (err) {
      setError("Une erreur réseau est survenue. Vérifiez votre connexion.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
              <FolderPlus className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Ouvrir un Nouveau Dossier
              </h2>
              <p className="text-xs text-slate-500">
                Choix du type de démarche, destination et initialisation du dossier
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

        {/* Choix du Type de Dossier (Études vs Tourisme) */}
        <div className="mt-4">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
            1. Type de dossier *
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: "STUDIES" })}
              className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition ${
                formData.type === "STUDIES"
                  ? "border-blue-600 bg-blue-50/60 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 ring-2 ring-blue-500/20"
                  : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300"
              }`}
            >
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                  formData.type === "STUDIES"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                }`}
              >
                <GraduationCap className="h-5 w-5" />
              </div>
              <div>
                <span className="block text-xs font-bold">Études à l&apos;étranger</span>
                <span className="block text-[11px] text-slate-500">
                  Campus France, DLI / CAQ Canada
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: "TOURISM" })}
              className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition ${
                formData.type === "TOURISM"
                  ? "border-emerald-600 bg-emerald-50/60 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-500/20"
                  : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300"
              }`}
            >
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                  formData.type === "TOURISM"
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                }`}
              >
                <Palmtree className="h-5 w-5" />
              </div>
              <div>
                <span className="block text-xs font-bold">Visa Visiteur / Tourisme</span>
                <span className="block text-[11px] text-slate-500">
                  Court séjour, vacances, visite familiale
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Message d'erreur */}
        {error && (
          <div className="mt-3 flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Avertissement de doublon avec validation immédiate */}
        {duplicateWarning && (
          <div className="mt-3 rounded-xl bg-amber-50 p-3.5 text-xs text-amber-900 dark:bg-amber-950/40 dark:text-amber-200 border border-amber-200 dark:border-amber-900 space-y-2">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
              <span>{duplicateWarning}</span>
            </div>
            <div className="flex items-center gap-2 pt-1 justify-end">
              <button
                type="button"
                onClick={() => setDuplicateWarning(null)}
                className="rounded-lg px-2.5 py-1 text-xs border border-amber-300 dark:border-amber-700 hover:bg-amber-100 dark:hover:bg-amber-900/50"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={(e) => handleSubmit(e, true)}
                className="rounded-lg bg-amber-600 text-white font-semibold px-3 py-1 text-xs hover:bg-amber-700"
              >
                Confirmer quand même
              </button>
            </div>
          </div>
        )}

        <form onSubmit={(e) => handleSubmit(e, false)} className="mt-4 space-y-3.5">
          {/* Section Client */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                2. Client / Demandeur *
              </label>
              <div className="flex rounded-lg bg-slate-100 p-0.5 dark:bg-slate-800 text-[11px] font-medium">
                <button
                  type="button"
                  onClick={() => setClientMode("new")}
                  className={`rounded-md px-2.5 py-0.5 transition ${
                    clientMode === "new"
                      ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white font-bold"
                      : "text-slate-500"
                  }`}
                >
                  Nouveau client
                </button>
                <button
                  type="button"
                  onClick={() => setClientMode("existing")}
                  className={`rounded-md px-2.5 py-0.5 transition ${
                    clientMode === "existing"
                      ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white font-bold"
                      : "text-slate-500"
                  }`}
                >
                  Client existant
                </button>
              </div>
            </div>

            {clientMode === "new" ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 bg-slate-50/70 p-3 rounded-xl border border-slate-200/80 dark:bg-slate-800/40 dark:border-slate-800">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Prénom
                  </label>
                  <input
                    type="text"
                    placeholder="ex: Mamadou"
                    value={formData.clientFirstName}
                    onChange={(e) => setFormData({ ...formData, clientFirstName: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Nom de famille *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ex: Ndiaye"
                    value={formData.clientLastName}
                    onChange={(e) => setFormData({ ...formData, clientLastName: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Téléphone *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="ex: 77 123 45 67"
                    value={formData.clientPhone}
                    onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>
            ) : (
              <div>
                {fetchingClients ? (
                  <p className="text-xs text-slate-400">Chargement des clients...</p>
                ) : clients.length === 0 ? (
                  <p className="text-xs text-amber-600">Aucun client existant. Choisissez &quot;Nouveau client&quot;.</p>
                ) : (
                  <select
                    value={formData.clientId}
                    onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.firstName} {c.lastName} ({c.phone})
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}
          </div>

          {/* Destination & Détails du projet */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Pays de destination *
              </label>
              <select
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="FRANCE">🇫🇷 France</option>
                <option value="CANADA">🇨🇦 Canada</option>
                <option value="ESPAGNE">🇪🇸 Espagne / Espace Schengen</option>
                <option value="USA">🇺🇸 États-Unis</option>
                <option value="AUTRE">🌍 Autre pays</option>
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

            {/* Champs adaptés au type de démarche */}
            {formData.type === "STUDIES" ? (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Établissement ou Université visée
                  </label>
                  <input
                    type="text"
                    placeholder="ex: Sorbonne, Université Laval..."
                    value={formData.targetInstitution}
                    onChange={(e) => setFormData({ ...formData, targetInstitution: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Formation / Programme visé
                  </label>
                  <input
                    type="text"
                    placeholder="ex: Licence 3 Informatique, Master Droit..."
                    value={formData.targetProgram}
                    onChange={(e) => setFormData({ ...formData, targetProgram: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Motif du séjour
                  </label>
                  <input
                    type="text"
                    placeholder="ex: Visite familiale chez un parent, Vacances..."
                    value={formData.targetInstitution}
                    onChange={(e) => setFormData({ ...formData, targetInstitution: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Durée envisagée
                  </label>
                  <input
                    type="text"
                    placeholder="ex: 2 semaines, 1 mois..."
                    value={formData.targetProgram}
                    onChange={(e) => setFormData({ ...formData, targetProgram: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Période ou date prévue
              </label>
              <input
                type="text"
                placeholder={formData.type === "STUDIES" ? "ex: Septembre 2026" : "ex: Été 2026"}
                value={formData.intake}
                onChange={(e) => setFormData({ ...formData, intake: e.target.value })}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Frais d&apos;agence ({user?.agencyCurrency || "FCFA"})
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

          {/* Prochaine action & date de rappel */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-amber-50/50 p-3 rounded-xl border border-amber-100 dark:bg-amber-950/20 dark:border-amber-900/40">
            <div>
              <label className="block text-[11px] font-bold text-amber-900 dark:text-amber-200 mb-1">
                Prochaine action à effectuer
              </label>
              <input
                type="text"
                placeholder="ex: Réclamer relevé bancaire, Appeler client..."
                value={formData.nextAction}
                onChange={(e) => setFormData({ ...formData, nextAction: e.target.value })}
                className="w-full rounded-lg border border-amber-200 dark:border-amber-800 bg-white dark:bg-slate-800 px-2.5 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-amber-900 dark:text-amber-200 mb-1">
                Date prévue pour cette action
              </label>
              <input
                type="date"
                value={formData.nextActionDate}
                onChange={(e) => setFormData({ ...formData, nextActionDate: e.target.value })}
                className="w-full rounded-lg border border-amber-200 dark:border-amber-800 bg-white dark:bg-slate-800 px-2.5 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Notes utiles */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Notes utiles sur le dossier
            </label>
            <textarea
              rows={2}
              placeholder="ex: Client recommandé par M. Sow. Dossier urgent..."
              value={formData.initialNotes}
              onChange={(e) => setFormData({ ...formData, initialNotes: e.target.value })}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          {/* Actions */}
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
              disabled={loading}
              className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? "Création en cours..." : "Ouvrir le dossier"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
