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
  Bell,
  Search,
  Download,
  PlayCircle,
  ExternalLink,
} from "lucide-react";
import Button from "@/components/ui/Button";

export default function StudentDashboardPage() {
  const [activeTab, setActiveTab] = useState<
    "overview" | "schedule" | "notes" | "doubts" | "materials" | "recordings"
  >("overview");

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

  // Resolved & Open Doubts
  const doubtHistory = [
    {
      id: "d-1",
      topic: "Multi-hop vector retrieval with cross-encoder re-ranking",
      status: "resolved",
      askedIn: "Generative AI & LLM Systems",
      answer: "Utilize reciprocal rank fusion (RRF) with a re-ranking cross-encoder before context packing.",
      date: "Oct 19, 2026",
    },
    {
      id: "d-2",
      topic: "Trade-offs between FP16 vs INT4 quantized embeddings on edge devices",
      status: "open",
      askedIn: "Generative AI & LLM Systems",
      date: "Oct 19, 2026",
    },
    {
      id: "d-3",
      topic: "Handling split-brain in network partitions with Raft",
      status: "resolved",
      askedIn: "Distributed Systems",
      answer: "A leader election requires a strict majority (N/2 + 1) votes, preventing minority partitions from electing a leader.",
      date: "Oct 17, 2026",
    },
  ];

  // Saved Notes
  const savedNotes = [
    {
      id: "n-1",
      title: "Session 4 Key Architecture Takeaways",
      course: "Generative AI & LLM Systems",
      updatedAt: "Today",
      snippet: "Chunking strategy: 512 tokens with 10% overlap. Vector indexing: HNSW with M=16...",
    },
    {
      id: "n-2",
      title: "Kafka Consumer Groups & Partition Rebalancing",
      course: "Distributed Systems",
      updatedAt: "2 days ago",
      snippet: "Eager rebalance vs Cooperative Sticky Assignor. Ensuring zero-downtime message consumption...",
    },
  ];

  // Learning Materials
  const materials = [
    {
      id: "m-1",
      title: "Production_RAG_Architecture_Guide.pdf",
      size: "2.4 MB",
      type: "PDF Guide",
      date: "Oct 19",
    },
    {
      id: "m-2",
      title: "retrieval_agent_pipeline.py",
      size: "4.2 KB",
      type: "Python Code",
      date: "Oct 19",
    },
    {
      id: "m-3",
      title: "Distributed_Caching_Strategies_v2.pdf",
      size: "3.8 MB",
      type: "PDF Slides",
      date: "Oct 17",
    },
  ];

  return (
    <div className="min-h-screen bg-midnight-950 text-slate-100 flex flex-col">
      {/* Dashboard Top Header */}
      <header className="sticky top-0 z-30 border-b border-white/5 bg-midnight-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <span className="font-extrabold text-white text-base">SkillNova</span>
              <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 text-sm">
                Portal
              </span>
            </Link>

            <div className="hidden sm:flex items-center gap-1 ml-4 pl-4 border-l border-white/10">
              <button
                onClick={() => setActiveTab("overview")}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                  activeTab === "overview"
                    ? "bg-purple-600/20 text-purple-300 border border-purple-500/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab("schedule")}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                  activeTab === "schedule"
                    ? "bg-purple-600/20 text-purple-300 border border-purple-500/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Live Classes
              </button>
              <button
                onClick={() => setActiveTab("doubts")}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                  activeTab === "doubts"
                    ? "bg-purple-600/20 text-purple-300 border border-purple-500/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Doubt History
              </button>
              <button
                onClick={() => setActiveTab("notes")}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                  activeTab === "notes"
                    ? "bg-purple-600/20 text-purple-300 border border-purple-500/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Saved Notes
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/meet">
              <Button size="sm" variant="gradient" className="shadow-glow-violet text-xs flex items-center gap-1.5">
                <Video className="w-3.5 h-3.5" />
                <span>Join Live Classroom</span>
              </Button>
            </Link>

            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-cyan-500 flex items-center justify-center font-bold text-xs text-white">
              RK
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome Banner */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-purple-900/30 via-midnight-900 to-cyan-900/20 border border-white/10 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-mono font-medium mb-3">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>Winter 2026 Engineering Cohort</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-300">Rohan</span>!
            </h1>
            <p className="mt-1 text-slate-300 text-xs sm:text-sm max-w-xl">
              You are on Track 1 (AI Engineering). Your live lecture on <strong>Production RAG Pipelines</strong> is in progress right now.
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-3">
            <Link href="/meet/ai-eng-live">
              <Button size="lg" variant="gradient" className="shadow-glow-cyan font-bold text-xs sm:text-sm px-6 py-3 flex items-center gap-2">
                <Video className="w-4 h-4 animate-pulse" />
                <span>Join Ongoing Class</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-midnight-900/60 border border-white/10">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs">Overall Progress</span>
              <TrendingUp className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-extrabold text-white">68%</div>
            <span className="text-[11px] text-cyan-400 mt-1 block">On track for Capstone Evaluation</span>
          </div>

          <div className="p-5 rounded-2xl bg-midnight-900/60 border border-white/10">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs">Live Attendance</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-extrabold text-white">96.4%</div>
            <span className="text-[11px] text-emerald-400 mt-1 block">27 of 28 sessions attended</span>
          </div>

          <div className="p-5 rounded-2xl bg-midnight-900/60 border border-white/10">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs">Doubts Resolved</span>
              <HelpCircle className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-extrabold text-white">14 / 15</div>
            <span className="text-[11px] text-purple-400 mt-1 block">Avg resolution time: 6 mins</span>
          </div>

          <div className="p-5 rounded-2xl bg-midnight-900/60 border border-white/10">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs">Placement Readiness</span>
              <Award className="w-4 h-4 text-pink-400" />
            </div>
            <div className="text-2xl font-extrabold text-white">Tier-1 Ready</div>
            <span className="text-[11px] text-pink-400 mt-1 block">Target: ₹24+ LPA Roles</span>
          </div>
        </div>

        {/* Enrolled Courses & Live Schedule Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left 2 Cols: Enrolled Learning Tracks */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-purple-400" />
                <span>My Active Enrolled Tracks</span>
              </h2>
            </div>

            <div className="space-y-4">
              {enrolledTracks.map((t) => (
                <div
                  key={t.id}
                  className="p-5 rounded-2xl bg-midnight-900/50 border border-white/10 hover:border-purple-500/40 transition-all flex flex-col justify-between"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <div>
                      <h3 className="text-base font-bold text-white">{t.title}</h3>
                      <span className="text-xs text-slate-400">Mentor: {t.mentor}</span>
                    </div>

                    <span className="text-xs px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 font-medium self-start sm:self-auto">
                      {t.liveStatus}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="my-2">
                    <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
                      <span>Curriculum Completion</span>
                      <span className="font-mono font-bold text-cyan-300">{t.progress}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 transition-all duration-500"
                        style={{ width: `${t.progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
                    <span className="text-xs text-slate-400">Next: <strong className="text-slate-200">{t.nextLesson}</strong></span>
                    <Link href={`/meet/${t.roomId}`}>
                      <Button size="sm" variant="secondary" className="text-xs py-1.5 px-3 flex items-center gap-1.5">
                        <span>Enter Room</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Col: Live Class Schedule & Doubts Feed */}
          <div className="space-y-6">
            {/* Live Class Schedule */}
            <div className="p-5 rounded-2xl bg-midnight-900/50 border border-white/10">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
                <Calendar className="w-4 h-4 text-cyan-400" />
                <span>Upcoming Cohort Schedule</span>
              </h3>

              <div className="space-y-3">
                {upcomingClasses.map((c) => (
                  <div
                    key={c.id}
                    className={`p-3 rounded-xl border text-xs ${
                      c.isLive
                        ? "bg-cyan-500/10 border-cyan-500/40"
                        : "bg-white/[0.02] border-white/5"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-white">{c.title}</span>
                      {c.isLive && (
                        <span className="px-1.5 py-0.2 rounded-full bg-red-500/20 text-red-400 font-bold text-[9px] animate-pulse">
                          LIVE
                        </span>
                      )}
                    </div>
                    <span className="text-slate-400 block">{c.time} • {c.instructor}</span>
                    <Link href={`/meet/${c.roomId}`} className="mt-2 text-cyan-400 hover:underline block font-semibold">
                      Join Classroom →
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Doubt Log */}
            <div className="p-5 rounded-2xl bg-midnight-900/50 border border-white/10">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
                <HelpCircle className="w-4 h-4 text-pink-400" />
                <span>Recent Doubts & Answers</span>
              </h3>

              <div className="space-y-3">
                {doubtHistory.slice(0, 2).map((d) => (
                  <div key={d.id} className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 font-mono">{d.askedIn}</span>
                      <span className={`text-[10px] font-bold ${d.status === "resolved" ? "text-emerald-400" : "text-amber-400"}`}>
                        {d.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="font-medium text-slate-200">{d.topic}</p>
                    {d.answer && (
                      <p className="text-[11px] text-cyan-300 bg-cyan-500/10 p-2 rounded-lg border border-cyan-500/20">
                        Ans: {d.answer}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Downloadable Materials & Lecture Notes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Lecture Notes */}
          <div className="p-5 rounded-2xl bg-midnight-900/50 border border-white/10">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4 text-purple-400" />
              <span>Saved Classroom Notes</span>
            </h3>
            <div className="space-y-2.5">
              {savedNotes.map((n) => (
                <div key={n.id} className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-white">{n.title}</span>
                    <span className="text-[10px] text-slate-500">{n.updatedAt}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono truncate">{n.snippet}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Course Materials */}
          <div className="p-5 rounded-2xl bg-midnight-900/50 border border-white/10">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
              <FolderOpen className="w-4 h-4 text-pink-400" />
              <span>Cohort Learning Resources</span>
            </h3>
            <div className="space-y-2.5">
              {materials.map((m) => (
                <div key={m.id} className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-xs flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-white block">{m.title}</span>
                    <span className="text-[10px] text-slate-400">{m.type} • {m.size}</span>
                  </div>
                  <button className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300">
                    <Download className="w-4 h-4 text-cyan-400" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
