"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  GraduationCap,
  Calendar,
  Clock,
  Video,
  FileText,
  HelpCircle,
  Award,
  CheckCircle2,
  TrendingUp,
  FolderOpen,
  ArrowRight,
  Sparkles,
  BookOpen,
  PlayCircle,
  ExternalLink,
  ChevronRight,
  AlertCircle,
  Code2,
  ClipboardCheck,
  UploadCloud,
  FileCheck,
  Download,
} from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import Button from "@/components/ui/Button";

export default function StudentDashboardPage() {
  const [activeTab, setActiveTab] = useState<
    "overview" | "assignments" | "schedule" | "notes" | "doubts" | "materials"
  >("overview");
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submissionModal, setSubmissionModal] = useState<any | null>(null);
  const [submissionText, setSubmissionText] = useState("");
  const [submissionFile, setSubmissionFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submissionStatusMessage, setSubmissionStatusMessage] = useState<string | null>(null);

  const fetchAssignments = async () => {
    try {
      const res = await fetch("/api/assignments");
      if (res.ok) {
        const data = await res.json();
        setAssignments(data.assignments || []);
      }
    } catch (e) {
      console.error("Assignments fetch error:", e);
    }
  };

  React.useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/student/dashboard");
        if (res.ok) {
          const data = await res.json();
          setDashboardData(data);
        }
        await fetchAssignments();
      } catch (e) {
        console.error("Dashboard fetch error:", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleOpenSubmissionModal = (assignment: any) => {
    setSubmissionModal(assignment);
    const existing = assignment.submissions?.[0];
    setSubmissionText(existing?.content || "");
    setSubmissionFile(null);
    setSubmissionStatusMessage(null);
  };

  const handleSubmitAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submissionModal) return;
    setSubmitting(true);
    setSubmissionStatusMessage(null);

    try {
      const formData = new FormData();
      if (submissionText.trim()) formData.append("content", submissionText.trim());
      if (submissionFile) formData.append("file", submissionFile);

      const res = await fetch(`/api/assignments/${submissionModal.id}/submit`, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        setSubmissionStatusMessage("Assignment submitted successfully!");
        await fetchAssignments();
        setTimeout(() => setSubmissionModal(null), 1200);
      } else {
        const err = await res.json();
        setSubmissionStatusMessage(err.error || "Failed to submit assignment.");
      }
    } catch (e: any) {
      setSubmissionStatusMessage(e.message || "Submission failed.");
    } finally {
      setSubmitting(false);
    }
  };

  // Enrolled Courses & Progress
  const enrolledTracks = [
    {
      id: "ai-eng",
      title: "Generative AI & LLM Systems",
      progress: 68,
      nextLesson: "Quantization & LoRA Fine-Tuning",
      mentor: "Dr. Aryan Mehta",
      gradient: "from-purple-500 to-indigo-600",
      liveStatus: "Class Live Now",
      roomId: "ai-eng-live",
      totalModules: 14,
      completedModules: 9,
    },
    {
      id: "sys-design",
      title: "Distributed Systems & Scalable Architecture",
      progress: 42,
      nextLesson: "Consensus Protocols (Raft & Paxos)",
      mentor: "Priya Sharma",
      gradient: "from-cyan-500 to-blue-600",
      liveStatus: "Today at 6:30 PM",
      roomId: "sys-design-401",
      totalModules: 16,
      completedModules: 7,
    },
    {
      id: "dsa-interview",
      title: "Algorithmic Mastery & Hard DSA",
      progress: 84,
      nextLesson: "Segment Trees & Fenwick Trees",
      mentor: "Rohit Verma",
      gradient: "from-pink-500 to-purple-600",
      liveStatus: "Tomorrow at 4:00 PM",
      roomId: "dsa-faang-prep",
      totalModules: 12,
      completedModules: 10,
    },
  ];

  // Upcoming Live Cohort Classes
  const upcomingClasses = [
    {
      id: "c-1",
      title: "Generative AI: RAG Pipeline Optimization",
      date: "Today",
      time: "Live Now (Started 20m ago)",
      instructor: "Dr. Aryan Mehta",
      isLive: true,
      roomId: "ai-eng-live",
    },
    {
      id: "c-2",
      title: "Distributed Systems: Event-Driven Kafka Topologies",
      date: "Today",
      time: "6:30 PM - 8:00 PM",
      instructor: "Priya Sharma",
      isLive: false,
      roomId: "sys-design-401",
    },
    {
      id: "c-3",
      title: "1-on-1 SDE Mock Interview & Code Review",
      date: "Tomorrow",
      time: "11:00 AM - 12:00 PM",
      instructor: "Rohit Verma (Senior SDE)",
      isLive: false,
      roomId: "dsa-faang-prep",
    },
  ];

  // Doubts with responses
  const doubtHistory = [
    {
      id: "d-1",
      track: "Generative AI",
      question: "How do we prevent hallucinations during multi-hop hybrid search retrieval?",
      status: "resolved",
      mentor: "Dr. Aryan Mehta",
      answer: "Utilize reciprocal rank fusion (RRF) with a re-ranking cross-encoder before context packing.",
      date: "Yesterday",
    },
    {
      id: "d-2",
      track: "Distributed Systems",
      question: "What happens if a Raft leader node experiences network partition during commit log write?",
      status: "open",
      mentor: "Pending Mentor Review",
      date: "3 hours ago",
    },
  ];

  // Saved Notes
  const classNotes = [
    {
      id: "n-1",
      title: "RAG Production Architecture Checklist",
      course: "Generative AI",
      snippet: "1. Chunking strategy: 512 tokens with 10% overlap.\n2. Vector indexing: HNSW with M=16, efSearch=64...",
      updated: "2 days ago",
    },
    {
      id: "n-2",
      title: "Raft Consensus State Machine Breakdown",
      course: "Distributed Systems",
      snippet: "Leader Election term numbers, Heartbeat intervals, and Log replication invariants...",
      updated: "4 days ago",
    },
  ];

  return (
    <AppShell breadcrumbs={[{ label: "Student Dashboard" }]}>
      <div className="space-y-8">
        {/* Top Welcome Banner */}
        <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-purple-900/30 via-indigo-900/20 to-midnight-900 border border-purple-500/20 shadow-xl overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-mono mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Semester 6 • Campus SDE Track</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Welcome back, Arjun 👋
              </h1>
              <p className="mt-1 text-slate-300 text-sm max-w-xl">
                You are on a 12-day coding streak! Your next live masterclass on{" "}
                <strong className="text-white">RAG Architectures</strong> is happening right now.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/meet/ai-eng-live"
                className="px-5 py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 shadow-glow-cyan text-sm flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
              >
                <Video className="w-4 h-4" />
                <span>Join Live Classroom</span>
              </Link>

              <Link
                href="/courses"
                className="px-4 py-2.5 rounded-xl font-medium text-slate-200 bg-white/5 hover:bg-white/10 border border-white/10 text-sm transition-colors"
              >
                Browse Curricula
              </Link>
            </div>
          </div>

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/10">
            <div>
              <p className="text-xs text-slate-400">Enrolled Curricula</p>
              <p className="text-xl font-bold text-white mt-1">3 Tracks</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Total Live Sessions</p>
              <p className="text-xl font-bold text-emerald-400 mt-1">
                {dashboardData?.metrics?.totalEnrolled ?? 6} Sessions
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Doubt Inquiries</p>
              <p className="text-xl font-bold text-cyan-400 mt-1">
                {dashboardData?.metrics?.resolvedDoubts ? `${dashboardData.metrics.resolvedDoubts} Resolved` : "6 Resolved"}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Attendance Logged</p>
              <p className="text-xl font-bold text-purple-400 mt-1">
                {dashboardData?.metrics?.totalAttendance ? `${dashboardData.metrics.totalAttendance} Records` : "6 Records"}
              </p>
            </div>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-3 overflow-x-auto">
          {[
            { id: "overview", label: "Enrolled Courses", icon: BookOpen },
            { id: "assignments", label: `Assignments (${assignments.length})`, icon: ClipboardCheck },
            { id: "schedule", label: "Class Schedule", icon: Calendar },
            { id: "notes", label: "Saved Notes", icon: FileText },
            { id: "doubts", label: "Doubt Center", icon: HelpCircle },
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

        {/* Tab 1: Overview & Enrolled Courses */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-cyan-400" />
                  <span>Active Learning Progress</span>
                </h2>
                <Link
                  href="/courses"
                  className="text-xs text-cyan-400 hover:underline flex items-center gap-1"
                >
                  <span>View All Modules</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {enrolledTracks.map((track) => (
                  <div
                    key={track.id}
                    className="p-5 rounded-2xl bg-midnight-900 border border-white/10 hover:border-purple-500/30 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs mb-3">
                        <span className="text-slate-400">{track.mentor}</span>
                        <span className="font-semibold text-cyan-400">
                          {track.progress}%
                        </span>
                      </div>

                      <h3 className="font-bold text-white text-base leading-snug">
                        {track.title}
                      </h3>

                      {/* Progress Bar */}
                      <div className="w-full h-2 rounded-full bg-white/10 mt-4 overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${track.gradient} rounded-full`}
                          style={{ width: `${track.progress}%` }}
                        />
                      </div>

                      <div className="mt-4 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                        <p className="text-[11px] text-slate-400">Up Next:</p>
                        <p className="text-xs font-medium text-slate-200 mt-0.5 truncate">
                          {track.nextLesson}
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">
                        {track.completedModules}/{track.totalModules} Units
                      </span>

                      <Link
                        href={`/meet/${track.roomId}`}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/10 hover:bg-cyan-500/20 text-white hover:text-cyan-300 transition-colors flex items-center gap-1"
                      >
                        <span>Open Class</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Schedule Row */}
            <div className="p-6 rounded-3xl bg-midnight-900/60 border border-white/10">
              <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-400" />
                <span>Today&apos;s Live Class Lineup</span>
              </h2>

              <div className="divide-y divide-white/5">
                {upcomingClasses.map((c) => (
                  <div
                    key={c.id}
                    className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        {c.isLive && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 animate-pulse">
                            LIVE NOW
                          </span>
                        )}
                        <h4 className="text-sm font-semibold text-white">
                          {c.title}
                        </h4>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        Instructor: {c.instructor} • {c.date}, {c.time}
                      </p>
                    </div>

                    <Link
                      href={`/meet/${c.roomId}`}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 ${
                        c.isLive
                          ? "bg-emerald-500 hover:bg-emerald-400 text-midnight-950 font-bold shadow-glow-cyan"
                          : "bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10"
                      }`}
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>{c.isLive ? "Join Classroom" : "View Room"}</span>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab: Assignments */}
        {activeTab === "assignments" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <ClipboardCheck className="w-5 h-5 text-cyan-400" />
                  <span>Coursework & Graded Submissions</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Submit solutions as text or file attachments. Track released marks and instructor feedback.
                </p>
              </div>
            </div>

            {assignments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {assignments.map((asgn) => {
                  const submission = asgn.submissions?.[0];
                  const isSubmitted = Boolean(submission);
                  const isGraded = submission?.status === "GRADED";
                  const isPastDue = new Date() > new Date(asgn.dueAt);

                  return (
                    <div
                      key={asgn.id}
                      className="p-6 rounded-2xl bg-midnight-900 border border-white/10 hover:border-cyan-500/30 transition-all flex flex-col justify-between space-y-4"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-purple-400 font-mono">
                            {asgn.meeting?.title || "MCA Core"}
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              isGraded
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                : isSubmitted
                                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                                : isPastDue
                                ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                                : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                            }`}
                          >
                            {isGraded
                              ? `Graded: ${submission.marks}/${asgn.maxMarks}`
                              : isSubmitted
                              ? "Submitted"
                              : isPastDue
                              ? "Closed / Overdue"
                              : "Pending"}
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-white line-clamp-1">
                          {asgn.title}
                        </h3>
                        <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                          {asgn.description}
                        </p>

                        <div className="flex items-center gap-4 text-xs text-slate-400 pt-2 border-t border-white/5 font-mono">
                          <span>Max Marks: {asgn.maxMarks}</span>
                          <span>•</span>
                          <span>Due: {new Date(asgn.dueAt).toLocaleDateString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                        </div>

                        {/* If graded, show mentor feedback */}
                        {isGraded && (
                          <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-xs space-y-1">
                            <p className="font-semibold text-emerald-300">
                              Feedback from {submission.gradedByName || "Instructor"}:
                            </p>
                            <p className="text-slate-300">{submission.feedback || "Good work!"}</p>
                          </div>
                        )}

                        {/* Submission details */}
                        {isSubmitted && !isGraded && (
                          <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/20 text-xs flex items-center justify-between">
                            <div className="flex items-center gap-2 text-cyan-200">
                              <FileCheck className="w-4 h-4 text-cyan-400" />
                              <span className="truncate max-w-[200px]">
                                {submission.fileName || "Text submission recorded"}
                              </span>
                            </div>
                            {submission.fileKey && (
                              <a
                                href={`/api/assignments/${asgn.id}/download?submissionId=${submission.id}`}
                                download
                                className="text-cyan-400 hover:text-cyan-200 text-xs flex items-center gap-1 font-semibold underline"
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>File</span>
                              </a>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="pt-2 flex items-center justify-end">
                        <Button
                          variant={isSubmitted ? "outline" : "gradient"}
                          onClick={() => handleOpenSubmissionModal(asgn)}
                          className="text-xs px-4 py-2"
                        >
                          {isSubmitted ? "Resubmit / Update" : "Submit Assignment"}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-12 rounded-3xl bg-midnight-900 border border-white/10 text-center space-y-3">
                <ClipboardCheck className="w-10 h-10 text-slate-500 mx-auto" />
                <h4 className="text-base font-bold text-white">No Coursework Assigned Yet</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Your instructors will publish course assignments, programming exercises, and project deliverables here.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Schedule */}
        {activeTab === "schedule" && (
          <div className="p-6 rounded-3xl bg-midnight-900 border border-white/10 space-y-4">
            <h3 className="text-base font-bold text-white">
              Weekly Cohort Timetable
            </h3>
            <p className="text-xs text-slate-400">
              Classes are conducted via high-fidelity LiveKit WebRTC video channels with synchronized collaborative whiteboards.
            </p>
            <div className="space-y-3 pt-2">
              {upcomingClasses.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {item.title}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {item.instructor} • {item.date} at {item.time}
                    </p>
                  </div>
                  <Link
                    href={`/meet/${item.roomId}`}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 transition-colors"
                  >
                    Enter Room
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Notes */}
        {activeTab === "notes" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {classNotes.length > 0 ? (
              classNotes.map((note) => (
                <div
                  key={note.id}
                  className="p-5 rounded-2xl bg-midnight-900 border border-white/10 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="text-purple-400 font-medium">{note.course}</span>
                      <span className="text-slate-500">{note.updated}</span>
                    </div>
                    <h4 className="text-base font-bold text-white">{note.title}</h4>
                    <p className="text-xs text-slate-300 mt-2 font-mono whitespace-pre-line bg-black/30 p-3 rounded-lg border border-white/5">
                      {note.snippet}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-white/5 flex justify-end">
                    <Link
                      href="/meet/ai-eng-live"
                      className="text-xs text-cyan-400 hover:underline flex items-center gap-1"
                    >
                      <span>Open in Classroom Canvas</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full p-8 rounded-3xl bg-midnight-900 border border-white/10 text-center space-y-2">
                <FileText className="w-8 h-8 text-purple-400 mx-auto" />
                <h4 className="text-sm font-bold text-white">No Notes Saved Yet</h4>
                <p className="text-xs text-slate-400">Save notes during live lectures to review concepts and checklists here.</p>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Doubts */}
        {activeTab === "doubts" && (
          <div className="space-y-4">
            {dashboardData?.recentDoubts && dashboardData.recentDoubts.length > 0 ? (
              dashboardData.recentDoubts.map((d: any) => (
                <div
                  key={d.id}
                  className="p-5 rounded-2xl bg-midnight-900 border border-white/10 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-purple-400 font-medium">
                      Asked by {d.studentName}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                        d.status === "resolved"
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                      }`}
                    >
                      {d.status.toUpperCase()}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-white">{d.question}</h4>
                  {d.answers && d.answers.length > 0 ? (
                    d.answers.map((ans: any, idx: number) => (
                      <div key={idx} className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/20 text-xs text-slate-200">
                        <p className="font-semibold text-cyan-300 mb-1">
                          Answer by {ans.authorName} ({ans.authorRole}):
                        </p>
                        <p>{ans.text}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500 italic">Pending instructor response.</p>
                  )}
                </div>
              ))
            ) : (
              <div className="p-8 rounded-3xl bg-midnight-900 border border-white/10 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-cyan-400 mx-auto" />
                <h4 className="text-sm font-bold text-white">No Inquiries Found</h4>
                <p className="text-xs text-slate-400">Ask questions during live classroom sessions to track answers here.</p>
              </div>
            )}
          </div>
        )}

        {/* Submission Modal Dialog */}
        {submissionModal && (
          <div className="fixed inset-0 z-50 bg-midnight-950/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="w-full max-w-lg rounded-3xl bg-midnight-900 border border-purple-500/30 p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400">
                    Assignment Submission
                  </span>
                  <h3 className="text-base font-bold text-white mt-0.5">
                    {submissionModal.title}
                  </h3>
                </div>
                <button
                  onClick={() => setSubmissionModal(null)}
                  className="text-slate-400 hover:text-white text-sm"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmitAssignment} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Text / Code Solution (Optional if uploading file)
                  </label>
                  <textarea
                    rows={4}
                    value={submissionText}
                    onChange={(e) => setSubmissionText(e.target.value)}
                    placeholder="Paste solution code, write answers, or include Git repository links..."
                    className="w-full text-xs rounded-xl bg-midnight-950 border border-white/10 p-3 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Attach Solution File (PDF, Code, or ZIP - Max 10MB)
                  </label>
                  <input
                    type="file"
                    onChange={(e) => setSubmissionFile(e.target.files?.[0] || null)}
                    className="w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-purple-600/20 file:text-purple-300 hover:file:bg-purple-600/30 cursor-pointer"
                  />
                </div>

                {submissionStatusMessage && (
                  <p
                    className={`text-xs p-2.5 rounded-xl border ${
                      submissionStatusMessage.includes("success")
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                        : "bg-rose-500/10 border-rose-500/30 text-rose-300"
                    }`}
                  >
                    {submissionStatusMessage}
                  </p>
                )}

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setSubmissionModal(null)}
                    className="text-xs px-4 py-2"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="gradient"
                    disabled={submitting || (!submissionText.trim() && !submissionFile)}
                    className="text-xs px-5 py-2 font-semibold"
                  >
                    {submitting ? "Submitting..." : "Confirm & Turn In"}
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
