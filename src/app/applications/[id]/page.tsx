"use client";

import React, { useState, useEffect } from "react";
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
  Building,
  Phone,
  Mail,
  Calendar,
  AlertCircle,
  ExternalLink,
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
  >("steps");

  // Step editing state
  const [editingStepId, setEditingStepId] = useState<string | null>(null);
  const [stepComment, setStepComment] = useState("");

  // New Note state
  const [noteContent, setNoteContent] = useState("");
  const [notePinned, setNotePinned] = useState(false);
  const [submittingNote, setSubmittingNote] = useState(false);

  // New Task state
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDueDate, setTaskDueDate] = useState("");
  const [taskPriority, setTaskPriority] = useState("MEDIUM");
  const [submittingTask, setSubmittingTask] = useState(false);

  // Document verification modal state
  const [verifyingDoc, setVerifyingDoc] = useState<any | null>(null);
  const [verificationComment, setVerificationComment] = useState("");
  const [verificationStatus, setVerificationStatus] = useState("VALIDATED");

  // Document upload modal state
  const [uploadingDoc, setUploadingDoc] = useState<any | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState("");

  const fetchApplicationDetails = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/applications/${id}`);
      if (res.ok) {
        const data = await res.json();
        setApp(data);
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

  // Step Status Update
  const handleUpdateStepStatus = async (
    stepId: string,
    newStatus: string,
    comment?: string
  ) => {
    try {
      const res = await fetch(`/api/applications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stepId,
          stepStatus: newStatus,
          stepComments: comment,
          userId: user?.id,
          userName: `${user?.firstName} ${user?.lastName}`,
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

  // Global Status Update
  const handleUpdateGlobalStatus = async (newStatus: string) => {
    try {
      const res = await fetch(`/api/applications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationStatus: newStatus,
          userId: user?.id,
          userName: `${user?.firstName} ${user?.lastName}`,
        }),
      });

      if (res.ok) {
        fetchApplicationDetails();
      }
    } catch (err) {
      console.error("Error updating global status:", err);
    }
  };

  // Submit Note
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

  // Submit Task
  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim() || !user) return;
    try {
      setSubmittingTask(true);
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agencyId: app.agencyId,
          applicationId: app.id,
          assignedToId: user.id,
          assignedToName: `${user.firstName} ${user.lastName}`,
          title: taskTitle,
          dueDate: taskDueDate || null,
          priority: taskPriority,
        }),
      });
      if (res.ok) {
        setTaskTitle("");
        setTaskDueDate("");
        fetchApplicationDetails();
      }
    } catch (err) {
      console.error("Error adding task:", err);
    } finally {
      setSubmittingTask(false);
    }
  };

  // Toggle Task Completion
  const handleToggleTask = async (taskId: string, isCompleted: boolean) => {
    try {
      await fetch("/api/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: taskId, isCompleted: !isCompleted }),
      });
      fetchApplicationDetails();
    } catch (err) {
      console.error("Error toggling task:", err);
    }
  };

  // Verify Document
  const handleVerifyDocument = async () => {
    if (!verifyingDoc || !user) return;
    try {
      const res = await fetch(`/api/documents/${verifyingDoc.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: verificationStatus,
          verificationComment,
          verifiedByUserId: user.id,
          verifiedByName: `${user.firstName} ${user.lastName}`,
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

  // Upload Document
  const handleUploadDocument = async () => {
    if (!uploadingDoc || !uploadedFileName.trim() || !user) return;
    try {
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agencyId: app.agencyId,
          applicationId: app.id,
          requirementName: uploadingDoc.requirementName || uploadingDoc.name,
          name: uploadedFileName,
          fileSize: 1540000,
          mimeType: "application/pdf",
          userId: user.id,
          userName: `${user.firstName} ${user.lastName}`,
        }),
      });
      if (res.ok) {
        setUploadingDoc(null);
        setUploadedFileName("");
        fetchApplicationDetails();
      }
    } catch (err) {
      console.error("Error uploading document:", err);
    }
  };

  const getDocStatusBadge = (status: string) => {
    switch (status) {
      case "VALIDATED":
        return { label: "Validé", bg: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" };
      case "IN_REVIEW":
        return { label: "En examen", bg: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300" };
      case "UPLOADED":
        return { label: "Reçu / À vérifier", bg: "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300" };
      case "REJECTED":
        return { label: "À corriger", bg: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300" };
      case "MISSING":
      default:
        return { label: "Manquant", bg: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400" };
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

  const isFrance = app.country === "FRANCE";
  const completedSteps = app.steps.filter((s: any) => s.status === "COMPLETED").length;
  const totalSteps = app.steps.length;

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-slate-50/50 dark:bg-slate-950/50 pb-12">
      <Header />

      <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto space-y-6">
        {/* Navigation back */}
        <div className="flex items-center justify-between">
          <Link
            href="/applications"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour aux dossiers
          </Link>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Statut général :</span>
            <select
              value={app.status}
              onChange={(e) => handleUpdateGlobalStatus(e.target.value)}
              className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-900 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="IN_PROGRESS">En cours</option>
              <option value="BLOCKED">Bloqué / Attention</option>
              <option value="ACCEPTED">Admis par établissement</option>
              <option value="VISA_GRANTED">Visa Accordé 🎉</option>
              <option value="VISA_REFUSED">Visa Refusé</option>
              <option value="CLOSED">Dossier Clôturé</option>
            </select>
          </div>
        </div>

        {/* Dossier Header Card */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20 text-2xl">
                {isFrance ? "🇫🇷" : "🇨🇦"}
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
                    {app.client.firstName} {app.client.lastName}
                  </h1>
                  <span className="rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
                    {app.dossierNumber}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                      app.status === "VISA_GRANTED"
                        ? "bg-emerald-100 text-emerald-800"
                        : app.status === "BLOCKED"
                        ? "bg-rose-100 text-rose-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {app.status === "VISA_GRANTED"
                      ? "Visa Obtenu"
                      : app.status === "BLOCKED"
                      ? "Bloqué"
                      : "En cours"}
                  </span>
                </div>

                <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 font-medium flex flex-wrap items-center gap-2">
                  <span>{app.targetProgram || "Formation à définir"}</span>
                  <span className="text-slate-300">•</span>
                  <span>{app.targetInstitution || "Établissement à définir"}</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-blue-600 font-semibold">{app.intake || "Rentrée 2026"}</span>
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-2">
                  <span className="flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5" />
                    {app.client.phone}
                  </span>
                  <span className="flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5" />
                    {app.client.email}
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="h-3.5 w-3.5" />
                    Conseiller : {app.counselor ? `${app.counselor.firstName} ${app.counselor.lastName}` : "Non assigné"}
                  </span>
                </div>
              </div>
            </div>

            {/* Overall Progress Gauge */}
            <div className="lg:w-72 rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                <span>Progression du dossier</span>
                <span className="text-base font-bold text-blue-600 dark:text-blue-400">
                  {app.progressPercentage}%
                </span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    app.progressPercentage === 100
                      ? "bg-emerald-500"
                      : app.status === "BLOCKED"
                      ? "bg-rose-500"
                      : "bg-blue-600"
                  }`}
                  style={{ width: `${app.progressPercentage}%` }}
                />
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                <span>
                  {completedSteps} sur {totalSteps} étapes complétées
                </span>
                <span className="font-medium text-slate-600 dark:text-slate-400">
                  Étape {app.currentStepIndex + 1}/{totalSteps}
                </span>
              </div>
            </div>
          </div>

          {/* Alert Banner if Blocked */}
          {app.status === "BLOCKED" && (
            <div className="mt-4 flex items-center gap-3 rounded-xl bg-rose-50 p-3 text-xs text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
              <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
              <span>
                <strong>Attention :</strong> Ce dossier est marqué comme bloqué. Vérifiez les pièces rejetées dans l&apos;onglet Documents ou les commentaires d&apos;étape pour débloquer la procédure.
              </span>
            </div>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto text-xs font-semibold gap-1">
          <button
            onClick={() => setActiveTab("steps")}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 transition whitespace-nowrap ${
              activeTab === "steps"
                ? "border-blue-600 text-blue-600 dark:text-blue-400"
                : "border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            <Clock className="h-4 w-4" />
            Workflow & Étapes ({completedSteps}/{totalSteps})
          </button>

          <button
            onClick={() => setActiveTab("documents")}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 transition whitespace-nowrap ${
              activeTab === "documents"
                ? "border-blue-600 text-blue-600 dark:text-blue-400"
                : "border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            <FileCheck2 className="h-4 w-4" />
            Documents & Checklist ({app.documents.length})
          </button>

          <button
            onClick={() => setActiveTab("activity")}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 transition whitespace-nowrap ${
              activeTab === "activity"
                ? "border-blue-600 text-blue-600 dark:text-blue-400"
                : "border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            <History className="h-4 w-4" />
            Fil d&apos;Activité (Audit)
          </button>

          <button
            onClick={() => setActiveTab("notes")}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 transition whitespace-nowrap ${
              activeTab === "notes"
                ? "border-blue-600 text-blue-600 dark:text-blue-400"
                : "border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            Notes Internes ({app.notes.length})
          </button>

          <button
            onClick={() => setActiveTab("tasks")}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 transition whitespace-nowrap ${
              activeTab === "tasks"
                ? "border-blue-600 text-blue-600 dark:text-blue-400"
                : "border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            <ListTodo className="h-4 w-4" />
            Tâches & Relances ({app.tasks.length})
          </button>

          <button
            onClick={() => setActiveTab("finances")}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 transition whitespace-nowrap ${
              activeTab === "finances"
                ? "border-blue-600 text-blue-600 dark:text-blue-400"
                : "border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            <Wallet className="h-4 w-4" />
            Finances & Règlements
          </button>
        </div>

        {/* TAB 1: STEPS / WORKFLOW */}
        {activeTab === "steps" && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Workflow Officiel : {isFrance ? "France (Campus France & Pastel)" : "Canada (IRCC, EED & CAQ)"}
                  </h2>
                  <p className="text-xs text-slate-500">
                    Modifiez le statut de chaque étape pour faire avancer la progression et tenir l&apos;équipe informée.
                  </p>
                </div>
              </div>

              {/* Steps Timeline list */}
              <div className="space-y-4">
                {app.steps.map((step: any, idx: number) => {
                  const isCurrent = idx === app.currentStepIndex;
                  const isCompleted = step.status === "COMPLETED";
                  const isBlocked = step.status === "BLOCKED";
                  const isInProgress = step.status === "IN_PROGRESS";

                  return (
                    <div
                      key={step.id}
                      className={`relative rounded-2xl border p-4.5 transition ${
                        isCurrent
                          ? "border-blue-400 bg-blue-50/20 dark:border-blue-800 dark:bg-blue-950/10 shadow-sm"
                          : isBlocked
                          ? "border-rose-300 bg-rose-50/20 dark:border-rose-900"
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
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                                {step.stepTitle}
                              </h3>
                              {isCurrent && (
                                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                                  Étape Active
                                </span>
                              )}
                              <span
                                className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                  isCompleted
                                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                                    : isInProgress
                                    ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                                    : isBlocked
                                    ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                                    : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                                }`}
                              >
                                {isCompleted
                                  ? "Terminée"
                                  : isInProgress
                                  ? "En cours"
                                  : isBlocked
                                  ? "Bloquée"
                                  : "En attente"}
                              </span>
                            </div>

                            {step.stepDescription && (
                              <p className="text-xs text-slate-500 mt-1">{step.stepDescription}</p>
                            )}

                            {step.comments && (
                              <div className="mt-2 rounded-xl bg-slate-50 p-2.5 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-100 dark:border-slate-700/60">
                                <span className="font-semibold text-slate-900 dark:text-white">Commentaire : </span>
                                {step.comments}
                              </div>
                            )}

                            {step.completedAt && (
                              <p className="text-[11px] text-slate-400 mt-1">
                                Validée le {formatDate(step.completedAt)}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Action buttons for step */}
                        <div className="flex flex-wrap items-center gap-2 self-end sm:self-center">
                          {editingStepId === step.id ? (
                            <div className="flex flex-col gap-2 w-full sm:w-auto">
                              <input
                                type="text"
                                placeholder="Ajouter une remarque..."
                                value={stepComment}
                                onChange={(e) => setStepComment(e.target.value)}
                                className="rounded-lg border border-slate-300 px-2 py-1 text-xs dark:bg-slate-800"
                              />
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => handleUpdateStepStatus(step.id, "COMPLETED", stepComment)}
                                  className="rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-emerald-700"
                                >
                                  Terminer
                                </button>
                                <button
                                  onClick={() => handleUpdateStepStatus(step.id, "IN_PROGRESS", stepComment)}
                                  className="rounded-lg bg-blue-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-blue-700"
                                >
                                  En cours
                                </button>
                                <button
                                  onClick={() => handleUpdateStepStatus(step.id, "BLOCKED", stepComment)}
                                  className="rounded-lg bg-rose-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-rose-700"
                                >
                                  Bloquer
                                </button>
                                <button
                                  onClick={() => setEditingStepId(null)}
                                  className="rounded-lg border border-slate-300 px-2 py-1 text-xs text-slate-600 hover:bg-slate-50"
                                >
                                  Annuler
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              {!isCompleted && (
                                <button
                                  onClick={() => handleUpdateStepStatus(step.id, "COMPLETED")}
                                  className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 shadow-sm transition"
                                >
                                  <Check className="h-3.5 w-3.5" />
                                  Valider l&apos;étape
                                </button>
                              )}

                              <button
                                onClick={() => {
                                  setEditingStepId(step.id);
                                  setStepComment(step.comments || "");
                                }}
                                className="rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition"
                              >
                                Modifier statut
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

        {/* TAB 2: DOCUMENTS */}
        {activeTab === "documents" && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Checklist Documentaire ({app.documents.length} pièces)
                  </h2>
                  <p className="text-xs text-slate-500">
                    Vérifiez la conformité des pièces académiques, financières et d&apos;identité exigées.
                  </p>
                </div>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {app.documents.map((doc: any) => {
                  const badge = getDocStatusBadge(doc.status);

                  return (
                    <div
                      key={doc.id}
                      className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-3"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
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
                            Fichier : <span className="font-mono text-slate-700 dark:text-slate-300">{doc.name}</span>
                            {doc.fileSize && ` • ${(doc.fileSize / 1024 / 1024).toFixed(1)} Mo`}
                            {doc.expiresAt && ` • Expire le ${formatDate(doc.expiresAt)}`}
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

                      <div className="flex items-center gap-2 self-end md:self-center">
                        <button
                          onClick={() => {
                            setUploadingDoc(doc);
                            setUploadedFileName(doc.name);
                          }}
                          className="inline-flex items-center gap-1 rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition"
                        >
                          <UploadCloud className="h-3.5 w-3.5" />
                          Téléverser
                        </button>

                        {canValidateDocuments && doc.status !== "MISSING" && (
                          <button
                            onClick={() => {
                              setVerifyingDoc(doc);
                              setVerificationStatus(doc.status === "VALIDATED" ? "VALIDATED" : "VALIDATED");
                              setVerificationComment(doc.verificationComment || "");
                            }}
                            className="inline-flex items-center gap-1 rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 shadow-sm transition"
                          >
                            <FileCheck2 className="h-3.5 w-3.5" />
                            Contrôler la pièce
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

        {/* TAB 3: ACTIVITY LOGS */}
        {activeTab === "activity" && (
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              Historique complet des actions (Audit Trail)
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              Traçabilité garantie : chaque changement d&apos;étape, téléversement ou validation de pièce est consigné.
            </p>

            <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
              {app.activityLogs.length === 0 ? (
                <p className="text-xs text-slate-400 py-4">Aucune activité enregistrée.</p>
              ) : (
                app.activityLogs.map((log: any) => (
                  <div key={log.id} className="relative">
                    <div className="absolute -left-6 top-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-blue-600 dark:border-slate-900 ring-4 ring-blue-50 dark:ring-blue-950/40" />
                    <div>
                      <p className="text-xs font-semibold text-slate-900 dark:text-white">
                        {log.userName}
                        <span className="ml-2 font-normal text-slate-400 text-[11px]">
                          {formatDateTime(log.createdAt)}
                        </span>
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                        {log.description}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 4: NOTES */}
        {activeTab === "notes" && (
          <div className="space-y-4">
            {/* New Note Form */}
            <form
              onSubmit={handleAddNote}
              className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Ajouter une note interne
              </h3>
              <textarea
                required
                rows={3}
                placeholder="Rédigez un compte-rendu d'appel, une consigne pour un collègue..."
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              <div className="mt-3 flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notePinned}
                    onChange={(e) => setNotePinned(e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                  />
                  Épingler en haut du dossier
                </label>
                <button
                  type="submit"
                  disabled={submittingNote || !noteContent.trim()}
                  className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 shadow-sm transition disabled:opacity-50"
                >
                  {submittingNote ? "Enregistrement..." : "Publier la note"}
                </button>
              </div>
            </form>

            {/* Notes List */}
            <div className="space-y-3">
              {app.notes.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-xs text-slate-400 dark:border-slate-800 dark:bg-slate-900">
                  Aucune note interne pour ce dossier.
                </div>
              ) : (
                app.notes.map((note: any) => (
                  <div
                    key={note.id}
                    className={`rounded-2xl border p-4 transition ${
                      note.isPinned
                        ? "border-amber-300 bg-amber-50/30 dark:border-amber-900 dark:bg-amber-950/20"
                        : "border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900"
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
                        <span>{note.authorName}</span>
                        {note.isPinned && (
                          <span className="rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 px-1.5 py-0.2 text-[10px]">
                            📌 Épinglée
                          </span>
                        )}
                      </div>
                      <span className="text-slate-400 text-[11px]">{formatDateTime(note.createdAt)}</span>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                      {note.content}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 5: TASKS */}
        {activeTab === "tasks" && (
          <div className="space-y-4">
            {/* New Task Form */}
            <form
              onSubmit={handleAddTask}
              className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                Créer une tâche / relance
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <input
                    type="text"
                    required
                    placeholder="ex: Relancer client pour relevé de notes du semestre 2"
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <input
                    type="date"
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>
              <div className="mt-3 flex justify-end">
                <button
                  type="submit"
                  disabled={submittingTask || !taskTitle.trim()}
                  className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 shadow-sm transition disabled:opacity-50"
                >
                  {submittingTask ? "Création..." : "Ajouter la tâche"}
                </button>
              </div>
            </form>

            {/* Task Checklist */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800">
              {app.tasks.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">Aucune tâche active pour ce dossier.</p>
              ) : (
                app.tasks.map((task: any) => (
                  <div key={task.id} className="py-3 flex items-center justify-between gap-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={task.isCompleted}
                        onChange={() => handleToggleTask(task.id, task.isCompleted)}
                        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                      />
                      <span
                        className={`text-xs font-medium ${
                          task.isCompleted
                            ? "line-through text-slate-400"
                            : "text-slate-800 dark:text-slate-200"
                        }`}
                      >
                        {task.title}
                      </span>
                    </label>

                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      {task.dueDate && <span>Échéance : {formatDate(task.dueDate)}</span>}
                      {task.assignedToName && (
                        <span className="rounded bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px]">
                          {task.assignedToName}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 6: FINANCES */}
        {activeTab === "finances" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <span className="text-xs font-semibold text-slate-500">Forfait de service</span>
                <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                  {formatCurrency(app.totalServiceFee, app.currency)}
                </p>
              </div>

              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-5 shadow-sm dark:border-emerald-900 dark:bg-emerald-950/20">
                <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">Total Encaissé</span>
                <p className="text-xl font-bold text-emerald-700 dark:text-emerald-300 mt-1">
                  {formatCurrency(
                    app.payments.reduce((acc: number, p: any) => acc + p.amount, 0),
                    app.currency
                  )}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <span className="text-xs font-semibold text-slate-500">Reste à recouvrer</span>
                <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                  {formatCurrency(
                    Math.max(
                      0,
                      app.totalServiceFee -
                        app.payments.reduce((acc: number, p: any) => acc + p.amount, 0)
                    ),
                    app.currency
                  )}
                </p>
              </div>
            </div>

            {/* Payments List */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
                Historique des Règlements
              </h3>

              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {app.payments.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4">Aucun versement enregistré pour le moment.</p>
                ) : (
                  app.payments.map((p: any) => (
                    <div key={p.id} className="py-3 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {formatCurrency(p.amount, p.currency)}
                        </span>
                        <span className="text-slate-400 ml-2">Mode : {p.paymentMethod}</span>
                        {p.receiptNumber && (
                          <span className="ml-2 font-mono text-[11px] text-blue-600 bg-blue-50 dark:bg-blue-950 px-1.5 py-0.5 rounded">
                            N° Reçu : {p.receiptNumber}
                          </span>
                        )}
                        {p.notes && <p className="text-[11px] text-slate-500 mt-0.5">{p.notes}</p>}
                      </div>
                      <span className="text-slate-400">{formatDate(p.createdAt)}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Verify Document Modal */}
      {verifyingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              Contrôler la pièce : {verifyingDoc.name}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Attribuez un statut de conformité et ajoutez une note pour le candidat et l&apos;équipe.
            </p>

            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Décision de conformité
                </label>
                <select
                  value={verificationStatus}
                  onChange={(e) => setVerificationStatus(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="VALIDATED">✅ Pièce Conforme & Validée</option>
                  <option value="REJECTED">❌ Rejetée (Document illisible, expiré ou incomplet)</option>
                  <option value="IN_REVIEW">🔍 Examen en cours (Attente confirmation établissement/banque)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Commentaire du vérificateur
                </label>
                <textarea
                  rows={3}
                  placeholder="ex: Traduction assermentée manquante, date d'expiration conforme..."
                  value={verificationComment}
                  onChange={(e) => setVerificationComment(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setVerifyingDoc(null)}
                className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
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

      {/* Upload Document Modal */}
      {uploadingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              Téléverser une pièce justificative
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Pour : {uploadingDoc.requirementName || uploadingDoc.name}
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nom du fichier téléversé
              </label>
              <input
                type="text"
                placeholder="ex: Passeport_Certifie_2026.pdf"
                value={uploadedFileName}
                onChange={(e) => setUploadedFileName(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Formats acceptés : PDF, JPG, PNG. Chiffrement et stockage sécurisé.
              </p>
            </div>

            <div className="mt-5 flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setUploadingDoc(null)}
                className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleUploadDocument}
                disabled={!uploadedFileName.trim()}
                className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                Confirmer l&apos;envoi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
