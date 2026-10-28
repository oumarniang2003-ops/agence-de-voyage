"use client";

import React, { useState, useEffect, useRef } from "react";
import Header from "@/components/layout/Header";
import { useAuth } from "@/context/AuthContext";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileCheck2,
  FileText,
  MessageSquare,
  ListTodo,
  Wallet,
  History,
  UploadCloud,
  Check,
  X,
  FileUp,
  User,
  GraduationCap,
  Palmtree,
  Building,
  Phone,
  Mail,
  Calendar,
  AlertCircle,
  ExternalLink,
  Download,
  Trash2,
  RefreshCw,
  PlusCircle,
  Edit3,
} from "lucide-react";

export default function ApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, canValidateDocuments } = useAuth();
  const id = params?.id as string;

  const [app, setApp] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "steps" | "documents" | "activity" | "notes" | "tasks" | "finances"
  >("documents");

  // Step editing state
  const [editingStepId, setEditingStepId] = useState<string | null>(null);
  const [stepComment, setStepComment] = useState("");

  // Statut global modal / editing
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [newGlobalStatus, setNewGlobalStatus] = useState("");
  const [statusNoteText, setStatusNoteText] = useState("");

  // Prochaine action modal
  const [nextActionModalOpen, setNextActionModalOpen] = useState(false);
  const [nextActionText, setNextActionText] = useState("");
  const [nextActionDateVal, setNextActionDateVal] = useState("");

  // Document verification modal state
  const [verifyingDoc, setVerifyingDoc] = useState<any | null>(null);
  const [verificationComment, setVerificationComment] = useState("");
  const [verificationStatus, setVerificationStatus] = useState("VALIDATED");

  // Document upload modal state (avec vrai fichier !)
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadTargetDoc, setUploadTargetDoc] = useState<any | null>(null); // null si nouveau doc libre
  const [docCustomName, setDocCustomName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileBase64, setFileBase64] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Document delete confirm modal
  const [docToDelete, setDocToDelete] = useState<any | null>(null);

  // New Note state
  const [noteContent, setNoteContent] = useState("");
  const [notePinned, setNotePinned] = useState(false);
  const [submittingNote, setSubmittingNote] = useState(false);

  // File input ref
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const fetchApplicationDetails = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/applications/${id}`);
      if (res.ok) {
        const data = await res.json();
        setApp(data);
        setNewGlobalStatus(data.status);
        setNextActionText(data.nextAction || "");
        setNextActionDateVal(
          data.nextActionDate ? new Date(data.nextActionDate).toISOString().split("T")[0] : ""
        );
      }
    } catch (err) {
      console.error("Error fetching application details:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicationDetails();
  }, [id]);

  // Gestion de la sélection du fichier réel et conversion en base64
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      alert("Le fichier est trop volumineux. La taille maximale recommandée est de 15 Mo.");
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setFileBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Téléversement d'un document (existant ou nouveau document libre)
  const handleConfirmUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !fileBase64 || !user) {
      alert("Veuillez sélectionner un fichier sur votre ordinateur.");
      return;
    }

    const docName = uploadTargetDoc
      ? uploadTargetDoc.requirementName || uploadTargetDoc.name
      : docCustomName.trim() || selectedFile.name;

    try {
      setUploading(true);
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agencyId: app.agencyId,
          applicationId: app.id,
          requirementName: uploadTargetDoc ? uploadTargetDoc.requirementName : null,
          name: docName,
          originalFilename: selectedFile.name,
          fileData: fileBase64,
          fileSize: selectedFile.size,
          mimeType: selectedFile.type || "application/pdf",
        }),
      });

      if (res.ok) {
        setUploadModalOpen(false);
        setUploadTargetDoc(null);
        setSelectedFile(null);
        setFileBase64(null);
        setDocCustomName("");
        fetchApplicationDetails();
      } else {
        alert("Erreur lors de l'envoi du document.");
      }
    } catch (err) {
      alert("Une erreur réseau est survenue.");
    } finally {
      setUploading(false);
    }
  };

  // Suppression d'un document après confirmation
  const handleConfirmDeleteDoc = async () => {
    if (!docToDelete) return;
    try {
      const res = await fetch(`/api/documents/${docToDelete.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setDocToDelete(null);
        fetchApplicationDetails();
      } else {
        alert("Erreur lors de la suppression de la pièce.");
      }
    } catch (err) {
      alert("Une erreur réseau est survenue.");
    }
  };

  // Contrôle / Validation de la conformité d'un document
  const handleVerifyDocument = async () => {
    if (!verifyingDoc || !user) return;
    try {
      const res = await fetch(`/api/documents/${verifyingDoc.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: verificationStatus,
          verificationComment,
        }),
      });
      if (res.ok) {
        setVerifyingDoc(null);
        setVerificationComment("");
        fetchApplicationDetails();
      }
    } catch (err) {
      console.error("Error verifying document:", err);
    }
  };

  // Mise à jour de la prochaine action
  const handleSaveNextAction = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/applications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nextAction: nextActionText,
          nextActionDate: nextActionDateVal || null,
        }),
      });
      if (res.ok) {
        setNextActionModalOpen(false);
        fetchApplicationDetails();
      }
    } catch (err) {
      alert("Erreur lors de la mise à jour de la prochaine action.");
    }
  };

  // Mise à jour du statut global avec note explicative
  const handleSaveGlobalStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/applications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationStatus: newGlobalStatus,
          statusNote: statusNoteText,
        }),
      });
      if (res.ok) {
        setStatusModalOpen(false);
        setStatusNoteText("");
        fetchApplicationDetails();
      }
    } catch (err) {
      alert("Erreur lors de la mise à jour du statut.");
    }
  };

  // Mise à jour d'une étape du workflow
  const handleUpdateStepStatus = async (stepId: string, newStatus: string, comment?: string) => {
    try {
      const res = await fetch(`/api/applications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stepId,
          stepStatus: newStatus,
          stepComments: comment,
        }),
      });
      if (res.ok) {
        setEditingStepId(null);
        setStepComment("");
        fetchApplicationDetails();
      }
    } catch (err) {
      console.error("Error updating step:", err);
    }
  };

  // Ajout d'une note interne
  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim() || !user) return;
    try {
      setSubmittingNote(true);
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agencyId: app.agencyId,
          applicationId: app.id,
          authorId: user.id,
          authorName: `${user.firstName} ${user.lastName}`,
          content: noteContent,
          isPinned: notePinned,
        }),
      });
      if (res.ok) {
        setNoteContent("");
        setNotePinned(false);
        fetchApplicationDetails();
      }
    } catch (err) {
      console.error("Error adding note:", err);
    } finally {
      setSubmittingNote(false);
    }
  };

  const getDocStatusBadge = (status: string) => {
    switch (status) {
      case "VALIDATED":
        return { label: "Validé conforme", bg: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" };
      case "IN_REVIEW":
        return { label: "En examen", bg: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300" };
      case "UPLOADED":
        return { label: "Reçu / À vérifier", bg: "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300" };
      case "REJECTED":
        return { label: "À corriger", bg: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300" };
      case "MISSING":
      default:
        return { label: "Reste à fournir", bg: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300" };
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "IN_PROGRESS":
        return "Dossier en préparation";
      case "BLOCKED":
        return "Bloqué / Action requise";
      case "ACCEPTED":
        return "Dossier accepté / Admis";
      case "VISA_GRANTED":
        return "Visa Accordé 🎉";
      case "VISA_REFUSED":
        return "Dossier refusé";
      case "CLOSED":
        return "Dossier clôturé";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50 dark:bg-slate-950">
        <Header />
        <div className="flex-1 flex items-center justify-center p-12 text-slate-400">
          Chargement du dossier...
        </div>
      </div>
    );
  }

  if (!app) {
    return (
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50 dark:bg-slate-950">
        <Header />
        <div className="p-12 text-center text-slate-500">Dossier introuvable.</div>
      </div>
    );
  }

  const isTourism = app.type === "TOURISM";
  const receivedDocsCount = app.documents.filter((d: any) => d.status !== "MISSING").length;
  const missingDocsCount = app.documents.length - receivedDocsCount;

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-slate-50/50 dark:bg-slate-950/50 pb-16">
      <Header />

      <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto space-y-6">
        {/* Navigation retour */}
        <div className="flex items-center justify-between">
          <Link
            href="/applications"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour à Mes dossiers
          </Link>
          <div className="text-xs text-slate-500 font-mono">
            {app.dossierNumber}
          </div>
        </div>

        {/* Fiche d'en-tête du dossier */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {/* Badge Type de dossier */}
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                    isTourism
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                      : "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                  }`}
                >
                  {isTourism ? <Palmtree className="h-3.5 w-3.5" /> : <GraduationCap className="h-3.5 w-3.5" />}
                  {isTourism ? "Visa Visiteur / Tourisme" : "Études à l'étranger"}
                </span>

                <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {app.country === "FRANCE" ? "🇫🇷 France" : app.country === "CANADA" ? "🇨🇦 Canada" : app.country}
                </span>

                {/* Badge Statut avec bouton de modification */}
                <button
                  onClick={() => setStatusModalOpen(true)}
                  className="inline-flex items-center gap-1 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 px-3 py-1 text-xs font-bold text-slate-800 dark:text-slate-200 transition"
                >
                  <span>Statut : {getStatusLabel(app.status)}</span>
                  <Edit3 className="h-3 w-3 text-slate-400" />
                </button>
              </div>

              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                {app.client?.firstName} {app.client?.lastName}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-2">
                <span className="flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5 text-slate-400" />
                  {app.client?.phone || "Sans téléphone"}
                </span>
                {app.client?.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5 text-slate-400" />
                    {app.client.email}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <User className="h-3.5 w-3.5 text-slate-400" />
                  Conseiller : {app.counselor ? `${app.counselor.firstName} ${app.counselor.lastName}` : "Non assigné"}
                </span>
              </div>
            </div>

            {/* Progression & Actions */}
            <div className="flex flex-col sm:items-end gap-2">
              <div className="text-right">
                <div className="text-xs font-semibold text-slate-500">Progression globale</div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {app.progressPercentage || 0}%
                </div>
              </div>
              <div className="w-36 bg-slate-100 rounded-full h-2 dark:bg-slate-800 overflow-hidden">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${app.progressPercentage || 0}%` }}
                />
              </div>
            </div>
          </div>

          {/* Bloc Prochaine action (Très visible pour ne jamais oublier un dossier) */}
          <div className="rounded-xl bg-amber-50/80 p-4 border border-amber-200/80 dark:bg-amber-950/20 dark:border-amber-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-600 text-white shadow-sm">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-200">
                    Prochaine action à effectuer
                  </h4>
                  {app.nextActionDate && (
                    <span className="rounded bg-amber-200/60 dark:bg-amber-900/60 px-2 py-0.5 text-[11px] font-bold text-amber-900 dark:text-amber-100">
                      Échéance : {formatDate(app.nextActionDate)}
                    </span>
                  )}
                </div>
                <p className="text-xs text-amber-950 dark:text-amber-100 font-medium mt-0.5">
                  {app.nextAction || "Aucune prochaine action définie pour ce dossier."}
                </p>
              </div>
            </div>

            <button
              onClick={() => setNextActionModalOpen(true)}
              className="self-end sm:self-center inline-flex items-center gap-1.5 rounded-xl bg-white border border-amber-300 dark:bg-slate-800 dark:border-amber-800 px-3 py-1.5 text-xs font-semibold text-amber-900 dark:text-amber-200 hover:bg-amber-100/50 transition"
            >
              <Edit3 className="h-3.5 w-3.5" />
              {app.nextAction ? "Modifier l'action" : "Définir une action"}
            </button>
          </div>
        </div>

        {/* Onglets de la fiche */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab("documents")}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 transition whitespace-nowrap ${
              activeTab === "documents"
                ? "border-blue-600 text-blue-600 dark:text-blue-400"
                : "border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400"
            }`}
          >
            <FileText className="h-4 w-4" />
            Espace Documents ({receivedDocsCount}/{app.documents.length} reçus)
          </button>

          <button
            onClick={() => setActiveTab("steps")}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 transition whitespace-nowrap ${
              activeTab === "steps"
                ? "border-blue-600 text-blue-600 dark:text-blue-400"
                : "border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400"
            }`}
          >
            <CheckCircle2 className="h-4 w-4" />
            Étapes & Avancement ({app.steps.length} étapes)
          </button>

          <button
            onClick={() => setActiveTab("notes")}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 transition whitespace-nowrap ${
              activeTab === "notes"
                ? "border-blue-600 text-blue-600 dark:text-blue-400"
                : "border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400"
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            Notes d&apos;équipe ({app.notes?.length || 0})
          </button>

          <button
            onClick={() => setActiveTab("activity")}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 transition whitespace-nowrap ${
              activeTab === "activity"
                ? "border-blue-600 text-blue-600 dark:text-blue-400"
                : "border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400"
            }`}
          >
            <History className="h-4 w-4" />
            Historique d&apos;audit
          </button>
        </div>

        {/* CONTENU ONGLET 1 : ESPACE DOCUMENTS (VRAI STOCKAGE SÉCURISÉ) */}
        {activeTab === "documents" && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Documents du dossier ({app.documents.length} pièces)
                  </h2>
                  <p className="text-xs text-slate-500">
                    {receivedDocsCount} documents reçus • {missingDocsCount} restant à fournir
                  </p>
                </div>

                {/* Bouton pour ajouter une pièce libre hors checklist */}
                <button
                  onClick={() => {
                    setUploadTargetDoc(null);
                    setDocCustomName("");
                    setSelectedFile(null);
                    setFileBase64(null);
                    setUploadModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-bold text-white shadow hover:bg-blue-700 transition"
                >
                  <PlusCircle className="h-4 w-4" />
                  Ajouter un document
                </button>
              </div>

              {/* Liste des pièces */}
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {app.documents.map((doc: any) => {
                  const badge = getDocStatusBadge(doc.status);
                  const hasFile = doc.status !== "MISSING";

                  return (
                    <div
                      key={doc.id}
                      className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-3"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                            hasFile
                              ? "bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400"
                              : "bg-slate-100 text-slate-400 dark:bg-slate-800"
                          }`}
                        >
                          <FileText className="h-5 w-5" />
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-xs md:text-sm text-slate-900 dark:text-white">
                              {doc.requirementName || doc.name}
                            </h4>
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${badge.bg}`}>
                              {badge.label}
                            </span>
                            {doc.version > 1 && (
                              <span className="rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.2 text-[10px] font-mono text-slate-500">
                                v{doc.version}
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-slate-500 mt-0.5">
                            {hasFile ? (
                              <>
                                Fichier : <span className="font-mono text-slate-700 dark:text-slate-300">{doc.originalFilename || doc.name}</span>
                                {doc.fileSize && ` • ${(doc.fileSize / 1024 / 1024).toFixed(2)} Mo`}
                                {doc.updatedAt && ` • Modifié le ${formatDate(doc.updatedAt)}`}
                              </>
                            ) : (
                              <span className="text-amber-600 dark:text-amber-400">
                                En attente de transmission par le client
                              </span>
                            )}
                          </p>

                          {doc.verificationComment && (
                            <div className="mt-1.5 text-xs text-slate-600 dark:text-slate-300 italic">
                              « {doc.verificationComment} »
                              {doc.verifiedByUser && (
                                <span className="not-italic text-[11px] text-slate-400 ml-1">
                                  — Vérifié par {doc.verifiedByUser.firstName} {doc.verifiedByUser.lastName}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Boutons d'action sur le document */}
                      <div className="flex flex-wrap items-center gap-2 self-end md:self-center">
                        {/* 1. Ouvrir / Télécharger le document si présent */}
                        {hasFile && (
                          <a
                            href={`/api/documents/${doc.id}/download`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 transition"
                          >
                            <Download className="h-3.5 w-3.5 text-slate-500" />
                            Ouvrir / Télécharger
                          </a>
                        )}

                        {/* 2. Téléverser ou Remplacer */}
                        <button
                          onClick={() => {
                            setUploadTargetDoc(doc);
                            setDocCustomName(doc.name);
                            setSelectedFile(null);
                            setFileBase64(null);
                            setUploadModalOpen(true);
                          }}
                          className="inline-flex items-center gap-1 rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition"
                        >
                          <UploadCloud className="h-3.5 w-3.5" />
                          {hasFile ? "Remplacer" : "Téléverser"}
                        </button>

                        {/* 3. Contrôler / Valider */}
                        {canValidateDocuments && hasFile && (
                          <button
                            onClick={() => {
                              setVerifyingDoc(doc);
                              setVerificationStatus(doc.status === "VALIDATED" ? "VALIDATED" : "VALIDATED");
                              setVerificationComment(doc.verificationComment || "");
                            }}
                            className="inline-flex items-center gap-1 rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 shadow-sm transition"
                          >
                            <FileCheck2 className="h-3.5 w-3.5" />
                            Contrôler
                          </button>
                        )}

                        {/* 4. Supprimer */}
                        {canValidateDocuments && hasFile && (
                          <button
                            onClick={() => setDocToDelete(doc)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                            title="Supprimer la pièce"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* CONTENU ONGLET 2 : WORKFLOW DES ÉTAPES */}
        {activeTab === "steps" && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                Workflow des étapes ({app.steps.length} jalons)
              </h2>
              <p className="text-xs text-slate-500 mb-6">
                Chaque étape validée fait progresser l&apos;avancement global du dossier.
              </p>

              <div className="space-y-3.5">
                {app.steps.map((step: any, idx: number) => {
                  const isCompleted = step.status === "COMPLETED";
                  const isBlocked = step.status === "BLOCKED";
                  const isInProgress = step.status === "IN_PROGRESS";

                  return (
                    <div
                      key={step.id}
                      className={`rounded-2xl border p-4 transition ${
                        isCompleted
                          ? "border-emerald-200 bg-emerald-50/20 dark:border-emerald-900/40"
                          : isBlocked
                          ? "border-rose-300 bg-rose-50/20 dark:border-rose-900"
                          : isInProgress
                          ? "border-blue-400 bg-blue-50/30 dark:border-blue-900/60 shadow-sm"
                          : "border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                              isCompleted
                                ? "bg-emerald-600 text-white"
                                : isInProgress
                                ? "bg-blue-600 text-white"
                                : isBlocked
                                ? "bg-rose-600 text-white"
                                : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                            }`}
                          >
                            {isCompleted ? <Check className="h-4 w-4" /> : idx + 1}
                          </div>

                          <div>
                            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                              {step.stepTitle}
                            </h3>
                            {step.stepDescription && (
                              <p className="text-xs text-slate-500 mt-0.5">{step.stepDescription}</p>
                            )}
                            {step.comments && (
                              <div className="mt-2 rounded-xl bg-slate-50 p-2 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                💬 {step.comments}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Actions d'étape */}
                        <div className="flex items-center gap-2 self-end sm:self-center">
                          {editingStepId === step.id ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                placeholder="Note d'étape..."
                                value={stepComment}
                                onChange={(e) => setStepComment(e.target.value)}
                                className="rounded-lg border border-slate-300 px-2 py-1 text-xs"
                              />
                              <button
                                onClick={() => handleUpdateStepStatus(step.id, "COMPLETED", stepComment)}
                                className="rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white"
                              >
                                Terminer
                              </button>
                              <button
                                onClick={() => handleUpdateStepStatus(step.id, "BLOCKED", stepComment)}
                                className="rounded-lg bg-rose-600 px-2.5 py-1 text-xs font-semibold text-white"
                              >
                                Bloquer
                              </button>
                              <button
                                onClick={() => setEditingStepId(null)}
                                className="rounded-lg border px-2 py-1 text-xs"
                              >
                                X
                              </button>
                            </div>
                          ) : (
                            <>
                              {!isCompleted && (
                                <button
                                  onClick={() => handleUpdateStepStatus(step.id, "COMPLETED")}
                                  className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 shadow-sm transition"
                                >
                                  <Check className="h-3.5 w-3.5" />
                                  Valider
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  setEditingStepId(step.id);
                                  setStepComment(step.comments || "");
                                }}
                                className="rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                              >
                                Modifier
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* CONTENU ONGLET 3 : NOTES D'ÉQUIPE */}
        {activeTab === "notes" && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-base font-bold text-slate-900 dark:text-white mb-3">
                Ajouter une note de suivi
              </h2>
              <form onSubmit={handleAddNote} className="space-y-3">
                <textarea
                  rows={3}
                  required
                  placeholder="Écrivez un compte rendu d'échange, un retour d'ambassade..."
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notePinned}
                      onChange={(e) => setNotePinned(e.target.checked)}
                      className="rounded"
                    />
                    Épingler en haut
                  </label>
                  <button
                    type="submit"
                    disabled={submittingNote || !noteContent.trim()}
                    className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    Enregistrer la note
                  </button>
                </div>
              </form>
            </div>

            {/* Liste des notes */}
            <div className="space-y-3">
              {app.notes?.map((n: any) => (
                <div
                  key={n.id}
                  className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                    <span className="font-bold text-slate-800 dark:text-slate-200">{n.authorName}</span>
                    <span>{formatDateTime(n.createdAt)}</span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{n.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CONTENU ONGLET 4 : HISTORIQUE D'AUDIT */}
        {activeTab === "activity" && (
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">
              Traçabilité des actions
            </h2>
            <div className="space-y-3">
              {app.activityLogs?.map((log: any) => (
                <div key={log.id} className="text-xs flex items-start gap-2 border-l-2 border-blue-500 pl-3 py-1">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white">{log.userName} : </span>
                    <span className="text-slate-600 dark:text-slate-300">{log.description}</span>
                    <div className="text-[10px] text-slate-400 mt-0.5">{formatDateTime(log.createdAt)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* MODAL TÉLÉVERSEMENT DE DOCUMENT (VRAI SÉLECTEUR DE FICHIER) */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              {uploadTargetDoc ? `Remplacer / Téléverser : ${uploadTargetDoc.requirementName || uploadTargetDoc.name}` : "Ajouter une nouvelle pièce justificative"}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Sélectionnez un document PDF, JPG ou PNG sur votre appareil.
            </p>

            <form onSubmit={handleConfirmUpload} className="space-y-4">
              {!uploadTargetDoc && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Intitulé de la pièce *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ex: Contrat de travail, Titre foncier, Lettre..."
                    value={docCustomName}
                    onChange={(e) => setDocCustomName(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Fichier à joindre *
                </label>
                <input
                  type="file"
                  required
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white file:mr-3 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
                />
                {selectedFile && (
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">
                    ✓ Fichier sélectionné : {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} Mo)
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setUploadModalOpen(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={uploading || !selectedFile}
                  className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {uploading ? "Envoi en cours..." : "Confirmer l'ajout"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CONTRÔLE DE PIÈCE */}
      {verifyingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              Contrôler la pièce : {verifyingDoc.name}
            </h3>
            <div className="space-y-3.5 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Décision de conformité
                </label>
                <select
                  value={verificationStatus}
                  onChange={(e) => setVerificationStatus(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white"
                >
                  <option value="VALIDATED">✅ Pièce Conforme & Validée</option>
                  <option value="REJECTED">❌ Rejetée (Document illisible, incomplet ou expiré)</option>
                  <option value="IN_REVIEW">🔍 Examen en cours (Vérification auprès de l&apos;organisme)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Commentaire explicatif pour l&apos;équipe et le client
                </label>
                <textarea
                  rows={3}
                  placeholder="ex: Relevé bancaire bien certifié par l'agence..."
                  value={verificationComment}
                  onChange={(e) => setVerificationComment(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setVerifyingDoc(null)}
                className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-medium text-slate-700"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleVerifyDocument}
                className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-semibold text-white hover:bg-blue-700"
              >
                Enregistrer la décision
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL MODIFIER LE STATUT DU DOSSIER */}
      {statusModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              Changer le statut du dossier
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Indiquez la nouvelle situation et une note expliquant cette évolution.
            </p>

            <form onSubmit={handleSaveGlobalStatus} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nouveau statut
                </label>
                <select
                  value={newGlobalStatus}
                  onChange={(e) => setNewGlobalStatus(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white"
                >
                  <option value="IN_PROGRESS">Dossier en préparation / En cours</option>
                  <option value="BLOCKED">Documents à compléter / Bloqué</option>
                  <option value="ACCEPTED">Dossier accepté / Admis établissement</option>
                  <option value="VISA_GRANTED">Visa Accordé 🎉</option>
                  <option value="VISA_REFUSED">Dossier refusé</option>
                  <option value="CLOSED">Dossier clôturé</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Note d&apos;évolution (optionnelle)
                </label>
                <textarea
                  rows={2}
                  placeholder="ex: Réception de la notification officielle ce matin..."
                  value={statusNoteText}
                  onChange={(e) => setStatusNoteText(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setStatusModalOpen(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-medium text-slate-700"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                >
                  Mettre à jour le statut
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL MODIFIER PROCHAINE ACTION */}
      {nextActionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              Définir la prochaine action
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Planifiez la tâche à venir pour ne pas oublier de relancer ou vérifier le dossier.
            </p>

            <form onSubmit={handleSaveNextAction} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Action à effectuer
                </label>
                <input
                  type="text"
                  required
                  placeholder="ex: Relancer client pour relevé bancaire, Déposer dossier..."
                  value={nextActionText}
                  onChange={(e) => setNextActionText(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Date prévue pour l&apos;action
                </label>
                <input
                  type="date"
                  value={nextActionDateVal}
                  onChange={(e) => setNextActionDateVal(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setNextActionModalOpen(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-medium text-slate-700"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-amber-600 px-5 py-2 text-xs font-semibold text-white hover:bg-amber-700"
                >
                  Enregistrer l&apos;action
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CONFIRMATION SUPPRESSION PIÈCE */}
      {docToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
              Confirmer la suppression
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Êtes-vous certain de vouloir supprimer le fichier &quot;{docToDelete.name}&quot; ? Cette action est irréversible.
            </p>
            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setDocToDelete(null)}
                className="rounded-xl border border-slate-300 px-3.5 py-1.5 text-xs font-medium text-slate-700"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteDoc}
                className="rounded-xl bg-rose-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-rose-700"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
