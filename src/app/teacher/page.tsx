"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  GraduationCap,
  Calendar,
  Users,
  HelpCircle,
  FileText,
  Video,
  CheckCircle2,
  Plus,
  ArrowRight,
  Sparkles,
  BarChart3,
  Clock,
  Lock,
  ClipboardCheck,
  Check,
  Download,
} from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import Button from "@/components/ui/Button";
import { useAuth } from "@/lib/auth-context";

export default function TeacherWorkspacePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"classes" | "assignments" | "doubts" | "materials">("classes");
  const [cohortData, setCohortData] = useState<any>(null);
  const [teacherAnalytics, setTeacherAnalytics] = useState<any>(null);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New assignment modal states
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newMaxMarks, setNewMaxMarks] = useState("100");
  const [newDueAt, setNewDueAt] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Grading modal states
  const [gradingModalSubmission, setGradingModalSubmission] = useState<any | null>(null);
  const [gradingMarks, setGradingMarks] = useState("");
  const [gradingFeedback, setGradingFeedback] = useState("");
  const [gradingSubmitting, setGradingSubmitting] = useState(false);
  const [gradingError, setGradingError] = useState<string | null>(null);

  const fetchAssignments = async () => {
    try {
      const res = await fetch("/api/assignments", {
        headers: { "x-skillnova-role": user.role },
      });
      if (res.ok) {
        const data = await res.json();
        setAssignments(data.assignments || []);
      }
    } catch {}
  };

  useEffect(() => {
    async function fetchCohort() {
      try {
        const res = await fetch("/api/teacher/cohort", {
          headers: { "x-skillnova-role": user.role },
        });
        if (res.ok) {
          const data = await res.json();
          setCohortData(data);
        }
        const analyticsRes = await fetch("/api/analytics?role=teacher", {
          headers: { "x-skillnova-role": user.role },
        });
        if (analyticsRes.ok) {
          const aData = await analyticsRes.json();
          setTeacherAnalytics(aData);
        }
        await fetchAssignments();
      } catch {} finally {
        setLoading(false);
      }
    }
    fetchCohort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.role]);

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setCreateError(null);
    try {
      const res = await fetch("/api/assignments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-skillnova-role": user.role,
        },
        body: JSON.stringify({
          title: newTitle,
          description: newDesc,
          maxMarks: newMaxMarks,
          dueAt: newDueAt,
          roomId: "ai-eng-live",
        }),
      });
      if (res.ok) {
        await fetchAssignments();
        setCreateModalOpen(false);
        setNewTitle("");
        setNewDesc("");
        setNewMaxMarks("100");
        setNewDueAt("");
      } else {
        const err = await res.json();
        setCreateError(err.error || "Failed to create assignment");
      }
    } catch (e: any) {
      setCreateError(e.message || "Failed to create assignment");
    } finally {
      setCreating(false);
    }
  };

  const handleGradeSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradingModalSubmission) return;
    setGradingSubmitting(true);
    setGradingError(null);
    try {
      const res = await fetch(`/api/assignments/${gradingModalSubmission.assignmentId}/grade`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-skillnova-role": user.role,
        },
        body: JSON.stringify({
          submissionId: gradingModalSubmission.id,
          marks: gradingMarks,
          feedback: gradingFeedback,
        }),
      });
      if (res.ok) {
        await fetchAssignments();
        setGradingModalSubmission(null);
        setGradingMarks("");
        setGradingFeedback("");
      } else {
        const err = await res.json();
        setGradingError(err.error || "Failed to submit grade");
      }
    } catch (e: any) {
      setGradingError(e.message || "Failed to grade submission");
    } finally {
      setGradingSubmitting(false);
    }
  };

  // Access Control: Block unverified students
  if (user.role === "student") {
    return (
      <AppShell breadcrumbs={[{ label: "Access Denied" }]}>
        <div className="max-w-xl mx-auto my-12 p-8 rounded-3xl bg-midnight-900 border border-purple-500/30 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 mx-auto flex items-center justify-center">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white">Faculty & Mentor Access Required</h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            Your current account (<span className="text-white font-medium">{user.name}</span>) has student privileges. To host cohort classes, resolve student doubts, or publish syllabus materials, you must sign in as an instructor or administrator.
          </p>
          <div className="pt-2">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs bg-white/10 hover:bg-white/15 text-white transition-colors"
            >
              <span>Return to Student Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </AppShell>
    );
  }

  const pendingDoubts = [
    {
      id: "td-1",
      student: "Ananya Roy (Roll: 104)",
      track: "Generative AI Systems",
      question: "How do we prevent hallucinations during multi-hop hybrid search retrieval?",
      priority: "urgent",
      time: "15m ago",
    },
    {
      id: "td-2",
      student: "Karthik Nair (Roll: 108)",
      track: "Generative AI Systems",
      question: "What is the memory trade-off between FP16 vs INT4 quantized embeddings on edge devices?",
      priority: "normal",
      time: "42m ago",
    },
  ];

  return (
    <AppShell breadcrumbs={[{ label: "Teacher Workspace" }]}>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-purple-900/30 via-indigo-900/20 to-midnight-900 border border-purple-500/20 shadow-xl">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-mono mb-2">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Faculty Portal • Dr. Aryan Mehta</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Instructor Dashboard & Classroom Manager
            </h1>
            <p className="mt-1 text-slate-300 text-sm">
              Manage your cohort tracks, host live WebRTC teaching sessions, answer student doubts, and share curated materials.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/meet"
              className="px-5 py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 shadow-glow-violet text-xs sm:text-sm flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
            >
              <Video className="w-4 h-4" />
              <span>Launch Live Class (Host)</span>
            </Link>
          </div>
        </div>

        {/* Teacher Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-midnight-900 border border-white/10">
            <p className="text-xs text-slate-400">Assigned Cohorts</p>
            <p className="text-2xl font-bold text-white mt-1">
              {teacherAnalytics?.metrics?.assignedCoursesCount !== undefined
                ? `${teacherAnalytics.metrics.assignedCoursesCount} Active`
                : "2 Active"}
            </p>
            <span className="text-[10px] text-purple-400 mt-1 block">AI & Systems</span>
          </div>

          <div className="p-5 rounded-2xl bg-midnight-900 border border-white/10">
            <p className="text-xs text-slate-400">Total Enrolled Students</p>
            <p className="text-2xl font-bold text-cyan-400 mt-1">
              {teacherAnalytics?.metrics?.totalStudents !== undefined
                ? teacherAnalytics.metrics.totalStudents
                : "—"}
            </p>
            <span className="text-[10px] text-slate-500 mt-1 block">Authorized cohort students</span>
          </div>

          <div className="p-5 rounded-2xl bg-midnight-900 border border-white/10">
            <p className="text-xs text-slate-400">Grading Queue</p>
            <p className="text-2xl font-bold text-amber-400 mt-1">
              {teacherAnalytics?.metrics?.pendingGradingQueue !== undefined
                ? `${teacherAnalytics.metrics.pendingGradingQueue} Pending`
                : cohortData?.pendingCount ? `${cohortData.pendingCount} Pending` : "0 Pending"}
            </p>
            <span className="text-[10px] text-amber-500/80 mt-1 block">
              {teacherAnalytics?.metrics?.gradedSubmissionsCount !== undefined
                ? `${teacherAnalytics.metrics.gradedSubmissionsCount} graded total`
                : "Awaiting evaluation"}
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-midnight-900 border border-white/10">
            <p className="text-xs text-slate-400">Total Submissions</p>
            <p className="text-2xl font-bold text-emerald-400 mt-1">
              {teacherAnalytics?.metrics?.totalSubmissionsReceived !== undefined
                ? teacherAnalytics.metrics.totalSubmissionsReceived
                : "0"}
            </p>
            <span className="text-[10px] text-slate-500 mt-1 block">Across all assignments</span>
          </div>
        </div>

        {/* Action Tabs */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-3 overflow-x-auto">
          {[
            { id: "classes", label: "Upcoming Cohort Sessions", icon: Calendar },
            { id: "assignments", label: `Assignments & Grading (${assignments.length})`, icon: ClipboardCheck },
            { id: "doubts", label: "Student Doubt Queue (2)", icon: HelpCircle },
            { id: "materials", label: "Shared Courseware", icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors shrink-0 ${
                  isActive
                    ? "bg-purple-600/30 text-white border border-purple-500/40"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: Cohort Sessions */}
        {activeTab === "classes" && (
          <div className="p-6 rounded-3xl bg-midnight-900 border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">
                Scheduled Teaching Sessions
              </h3>
              <Link
                href="/meet"
                className="text-xs text-cyan-400 hover:underline flex items-center gap-1"
              >
                <span>Room Manager</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 animate-pulse">
                  ACTIVE NOW
                </span>
                <h4 className="text-base font-bold text-white mt-1">
                  Generative AI: RAG Pipeline Optimization
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Room ID: ai-eng-live • 28 students connected • Whiteboard active
                </p>
              </div>

              <Link
                href="/meet/ai-eng-live"
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-500 text-midnight-950 hover:bg-emerald-400 transition-colors shrink-0"
              >
                Enter Host Console
              </Link>
            </div>
          </div>
        )}

        {/* Tab 2: Doubts Queue */}
        {activeTab === "doubts" && (
          <div className="space-y-3">
            {cohortData?.doubts && cohortData.doubts.length > 0 ? (
              cohortData.doubts.map((d: any) => (
                <div
                  key={d.id}
                  className="p-5 rounded-2xl bg-midnight-900 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-purple-400 font-semibold">{d.studentName}</span>
                      <span className="text-xs text-slate-500">• {new Date(d.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {d.priority === "urgent" && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
                          URGENT
                        </span>
                      )}
                      <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-semibold ${
                        d.status === "resolved" ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"
                      }`}>
                        {d.status}
                      </span>
                    </div>
                    <h4 className="text-sm font-semibold text-white mt-1">{d.question}</h4>
                  </div>

                  <Link
                    href={`/meet/${cohortData.activeCohort || "ai-eng-live"}`}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-cyan-500/20 text-white hover:text-cyan-300 border border-white/10 transition-colors shrink-0"
                  >
                    Answer in Classroom
                  </Link>
                </div>
              ))
            ) : (
              <div className="p-8 rounded-3xl bg-midnight-900 border border-white/10 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <h4 className="text-sm font-bold text-white">No Pending Doubts</h4>
                <p className="text-xs text-slate-400">All questions from the active cohort have been addressed.</p>
              </div>
            )}
          </div>
        )}

        {/* Tab: Assignments & Grading */}
        {activeTab === "assignments" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <ClipboardCheck className="w-5 h-5 text-cyan-400" />
                  <span>Curriculum Assignments & Student Grading</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Create coursework, review student submissions, download code attachments, and release validated marks with feedback.
                </p>
              </div>

              <Button
                variant="gradient"
                onClick={() => setCreateModalOpen(true)}
                className="text-xs px-4 py-2 font-semibold flex items-center gap-1.5 shadow-glow-violet"
              >
                <Plus className="w-4 h-4" />
                <span>Create Assignment</span>
              </Button>
            </div>

            {assignments.length > 0 ? (
              <div className="space-y-6">
                {assignments.map((asgn) => {
                  const submissions = asgn.submissions || [];
                  const gradedCount = submissions.filter((s: any) => s.status === "GRADED").length;

                  return (
                    <div
                      key={asgn.id}
                      className="p-6 rounded-2xl bg-midnight-900 border border-white/10 space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-base font-bold text-white">{asgn.title}</h4>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono">
                              Max Marks: {asgn.maxMarks}
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 mt-1">{asgn.description}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-xs text-slate-400 block font-mono">
                            Due: {new Date(asgn.dueAt).toLocaleDateString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                          </span>
                          <span className="text-[11px] text-cyan-300 font-medium">
                            {submissions.length} Submissions ({gradedCount} Graded)
                          </span>
                        </div>
                      </div>

                      {/* Submissions List */}
                      {submissions.length > 0 ? (
                        <div className="space-y-2">
                          <p className="text-xs font-semibold text-slate-400">Student Submissions:</p>
                          <div className="divide-y divide-white/5 rounded-xl border border-white/5 overflow-hidden">
                            {submissions.map((sub: any) => (
                              <div
                                key={sub.id}
                                className="p-3.5 bg-black/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                              >
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold text-white">{sub.studentName}</span>
                                    <span
                                      className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                                        sub.status === "GRADED"
                                          ? "bg-emerald-500/20 text-emerald-400"
                                          : "bg-amber-500/20 text-amber-400"
                                      }`}
                                    >
                                      {sub.status === "GRADED" ? `Graded: ${sub.marks}/${asgn.maxMarks}` : "Needs Grading"}
                                    </span>
                                  </div>

                                  {sub.content && (
                                    <p className="text-slate-300 mt-1 font-mono text-[11px] line-clamp-1 bg-midnight-950 p-1.5 rounded border border-white/5">
                                      {sub.content}
                                    </p>
                                  )}

                                  {sub.feedback && (
                                    <p className="text-emerald-400/90 text-[11px] mt-1">
                                      Feedback: {sub.feedback}
                                    </p>
                                  )}
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                  {sub.fileKey && (
                                    <a
                                      href={`/api/assignments/${asgn.id}/download?submissionId=${sub.id}`}
                                      download
                                      className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-cyan-300 flex items-center gap-1 border border-white/10 font-semibold"
                                      title="Download Submission File"
                                    >
                                      <Download className="w-3.5 h-3.5" />
                                      <span>Download</span>
                                    </a>
                                  )}

                                  <Button
                                    variant="outline"
                                    onClick={() => {
                                      setGradingModalSubmission({ ...sub, assignmentId: asgn.id, maxMarks: asgn.maxMarks });
                                      setGradingMarks(sub.marks !== null ? sub.marks.toString() : "");
                                      setGradingFeedback(sub.feedback || "");
                                      setGradingError(null);
                                    }}
                                    className="text-xs px-3 py-1.5"
                                  >
                                    {sub.status === "GRADED" ? "Update Grade" : "Grade Submission"}
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500 italic p-2 bg-midnight-950/40 rounded-xl">
                          No students have submitted this assignment yet.
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-12 rounded-3xl bg-midnight-900 border border-white/10 text-center space-y-3">
                <ClipboardCheck className="w-10 h-10 text-slate-500 mx-auto" />
                <h4 className="text-base font-bold text-white">No Assignments Created Yet</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Click &ldquo;Create Assignment&rdquo; above to assign programming tasks, projects, or lab exercises to your cohort.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Materials */}
        {activeTab === "materials" && (
          <div className="p-6 rounded-3xl bg-midnight-900 border border-white/10 space-y-4">
            <h3 className="text-base font-bold text-white">Courseware Repository</h3>
            <p className="text-xs text-slate-400">
              Files uploaded here are instantly synced to student side panels in live classes.
            </p>
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white">Production_RAG_Architecture_Guide.pdf</p>
                <p className="text-xs text-slate-500">2.4 MB • 14 Pages • Shared with AI Cohort</p>
              </div>
              <span className="text-xs text-emerald-400 font-medium">Published</span>
            </div>
          </div>
        )}

        {/* Create Assignment Modal */}
        {createModalOpen && (
          <div className="fixed inset-0 z-50 bg-midnight-950/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="w-full max-w-lg rounded-3xl bg-midnight-900 border border-purple-500/30 p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-purple-400">
                    Faculty Authoring
                  </span>
                  <h3 className="text-base font-bold text-white mt-0.5">
                    Create Course Assignment
                  </h3>
                </div>
                <button
                  onClick={() => setCreateModalOpen(false)}
                  className="text-slate-400 hover:text-white text-sm"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateAssignment} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Assignment Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Lab 4: Hybrid RAG Search with Reciprocal Rank Fusion"
                    className="w-full text-xs rounded-xl bg-midnight-950 border border-white/10 p-3 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Description & Instructions *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="Describe problem statement, deliverables, test cases, and guidelines..."
                    className="w-full text-xs rounded-xl bg-midnight-950 border border-white/10 p-3 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Max Marks *
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={newMaxMarks}
                      onChange={(e) => setNewMaxMarks(e.target.value)}
                      className="w-full text-xs rounded-xl bg-midnight-950 border border-white/10 p-3 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Submission Deadline *
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={newDueAt}
                      onChange={(e) => setNewDueAt(e.target.value)}
                      className="w-full text-xs rounded-xl bg-midnight-950 border border-white/10 p-3 text-slate-200 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                {createError && (
                  <p className="text-xs p-2.5 rounded-xl border bg-rose-500/10 border-rose-500/30 text-rose-300">
                    {createError}
                  </p>
                )}

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCreateModalOpen(false)}
                    className="text-xs px-4 py-2"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="gradient"
                    disabled={creating}
                    className="text-xs px-5 py-2 font-semibold"
                  >
                    {creating ? "Publishing..." : "Publish to Cohort"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Grade Submission Modal */}
        {gradingModalSubmission && (
          <div className="fixed inset-0 z-50 bg-midnight-950/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="w-full max-w-md rounded-3xl bg-midnight-900 border border-cyan-500/30 p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400">
                    Grading Console
                  </span>
                  <h3 className="text-base font-bold text-white mt-0.5">
                    {gradingModalSubmission.studentName}
                  </h3>
                </div>
                <button
                  onClick={() => setGradingModalSubmission(null)}
                  className="text-slate-400 hover:text-white text-sm"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleGradeSubmission} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Assigned Marks (0 - {gradingModalSubmission.maxMarks}) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={gradingModalSubmission.maxMarks}
                    required
                    value={gradingMarks}
                    onChange={(e) => setGradingMarks(e.target.value)}
                    className="w-full text-xs rounded-xl bg-midnight-950 border border-white/10 p-3 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Instructor Feedback & Notes
                  </label>
                  <textarea
                    rows={3}
                    value={gradingFeedback}
                    onChange={(e) => setGradingFeedback(e.target.value)}
                    placeholder="Provide constructive feedback on algorithm design, code style, or edge cases..."
                    className="w-full text-xs rounded-xl bg-midnight-950 border border-white/10 p-3 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                {gradingError && (
                  <p className="text-xs p-2.5 rounded-xl border bg-rose-500/10 border-rose-500/30 text-rose-300">
                    {gradingError}
                  </p>
                )}

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setGradingModalSubmission(null)}
                    className="text-xs px-4 py-2"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="gradient"
                    disabled={gradingSubmitting}
                    className="text-xs px-5 py-2 font-semibold"
                  >
                    {gradingSubmitting ? "Saving..." : "Release Grade"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
