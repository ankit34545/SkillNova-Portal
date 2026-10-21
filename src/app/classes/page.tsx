"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Video,
  Calendar,
  Clock,
  Users,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import AppShell from "@/components/layout/AppShell";

export default function LiveClassesPage() {
  const [filter, setFilter] = useState<"all" | "live" | "upcoming">("all");

  const classes = [
    {
      id: "live-1",
      title: "Generative AI: RAG Pipeline Optimization & Vector Search",
      instructor: "Dr. Aryan Mehta",
      role: "Lead AI Scientist",
      status: "live",
      time: "Live Now (Started 25m ago)",
      attendees: 32,
      roomId: "ai-eng-live",
      track: "AI & ML",
      topics: ["HNSW Graph Indexing", "Cross-Encoder Re-Ranking", "Chunking Strategy"],
    },
    {
      id: "sched-1",
      title: "Distributed Systems: Event-Driven Kafka Topologies",
      instructor: "Priya Sharma",
      role: "Staff Infrastructure Engineer",
      status: "upcoming",
      time: "Today at 6:30 PM (in 1h 30m)",
      attendees: 48,
      roomId: "sys-design-401",
      track: "Systems Engineering",
      topics: ["Partition Replication", "Consumer Rebalance Protocol", "Zero-Data-Loss Invariants"],
    },
    {
      id: "sched-2",
      title: "Algorithmic Masterclass: Segment Trees & Fenwick Trees",
      instructor: "Rohit Verma",
      role: "Ex-Google Senior SDE",
      status: "upcoming",
      time: "Tomorrow at 4:00 PM",
      attendees: 64,
      roomId: "dsa-faang-prep",
      track: "Core SDE Interview Prep",
      topics: ["Range Minimum Query", "Lazy Propagation", "Matrix Exponentiation"],
    },
  ];

  const filtered = classes.filter((c) => {
    if (filter === "live") return c.status === "live";
    if (filter === "upcoming") return c.status === "upcoming";
    return true;
  });

  return (
    <AppShell breadcrumbs={[{ label: "Live Classes" }]}>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Live Interactive Classes & Labs
            </h1>
            <p className="mt-1 text-slate-400 text-sm">
              Real-time WebRTC audio/video sessions with multi-user whiteboard, real-time code sharing, and instant doubt resolution.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                filter === "all"
                  ? "bg-purple-600/30 text-white border border-purple-500/40"
                  : "text-slate-400 hover:text-white bg-midnight-900"
              }`}
            >
              All Sessions
            </button>
            <button
              onClick={() => setFilter("live")}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors flex items-center gap-1.5 ${
                filter === "live"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                  : "text-slate-400 hover:text-white bg-midnight-900"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Live Now</span>
            </button>
            <button
              onClick={() => setFilter("upcoming")}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                filter === "upcoming"
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                  : "text-slate-400 hover:text-white bg-midnight-900"
              }`}
            >
              Upcoming
            </button>
          </div>
        </div>

        {/* Classes List */}
        <div className="space-y-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className={`p-6 rounded-3xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 ${
                item.status === "live"
                  ? "bg-gradient-to-r from-emerald-950/30 via-midnight-900 to-midnight-900 border-emerald-500/40 shadow-glow-cyan"
                  : "bg-midnight-900/90 border-white/10"
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {item.status === "live" ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 animate-pulse flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span>IN PROGRESS</span>
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-white/10 text-slate-300 border border-white/10">
                      SCHEDULED
                    </span>
                  )}
                  <span className="text-xs text-purple-400 font-medium">
                    {item.track}
                  </span>
                </div>

                <h3 className="text-lg sm:text-xl font-bold text-white">
                  {item.title}
                </h3>

                <p className="text-xs text-slate-400">
                  Instructor: <strong className="text-slate-200">{item.instructor}</strong> ({item.role}) • {item.time}
                </p>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {item.topics.map((t) => (
                    <span
                      key={t}
                      className="text-[10px] px-2 py-0.5 rounded bg-white/[0.03] text-slate-300 border border-white/5"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="hidden sm:block text-right">
                  <p className="text-xs text-slate-400 flex items-center gap-1 justify-end">
                    <Users className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{item.attendees} enrolled</span>
                  </p>
                </div>

                <Link
                  href={`/meet/${item.roomId}`}
                  className={`px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all flex items-center gap-2 ${
                    item.status === "live"
                      ? "bg-emerald-500 hover:bg-emerald-400 text-midnight-950 font-bold shadow-glow-cyan transform hover:-translate-y-0.5"
                      : "bg-white/10 hover:bg-white/15 text-white border border-white/10"
                  }`}
                >
                  <Video className="w-4 h-4" />
                  <span>{item.status === "live" ? "Enter Live Classroom" : "Pre-Join Check"}</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
