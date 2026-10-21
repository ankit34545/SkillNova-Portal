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
} from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import Button from "@/components/ui/Button";
import { useAuth } from "@/lib/auth-context";

export default function TeacherWorkspacePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"classes" | "doubts" | "materials">("classes");
  const [cohortData, setCohortData] = useState<any>(null);

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
      } catch {}
    }
    fetchCohort();
  }, [user.role]);

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
            <p className="text-2xl font-bold text-white mt-1">2 Active</p>
            <span className="text-[10px] text-purple-400 mt-1 block">AI & Systems</span>
          </div>

          <div className="p-5 rounded-2xl bg-midnight-900 border border-white/10">
            <p className="text-xs text-slate-400">Total Students</p>
            <p className="text-2xl font-bold text-cyan-400 mt-1">142</p>
            <span className="text-[10px] text-slate-500 mt-1 block">94% average attendance</span>
          </div>

          <div className="p-5 rounded-2xl bg-midnight-900 border border-white/10">
            <p className="text-xs text-slate-400">Unresolved Doubts</p>
            <p className="text-2xl font-bold text-amber-400 mt-1">
              {cohortData?.pendingCount ? `${cohortData.pendingCount} Pending` : "2 Pending"}
            </p>
            <span className="text-[10px] text-amber-500/80 mt-1 block">1 marked urgent</span>
          </div>

          <div className="p-5 rounded-2xl bg-midnight-900 border border-white/10">
            <p className="text-xs text-slate-400">Teaching Hours</p>
            <p className="text-2xl font-bold text-emerald-400 mt-1">48.5 hrs</p>
            <span className="text-[10px] text-slate-500 mt-1 block">This semester</span>
          </div>
        </div>

        {/* Action Tabs */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-3">
          {[
            { id: "classes", label: "Upcoming Cohort Sessions", icon: Calendar },
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
            {pendingDoubts.map((d) => (
              <div
                key={d.id}
                className="p-5 rounded-2xl bg-midnight-900 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-purple-400 font-semibold">{d.student}</span>
                    <span className="text-xs text-slate-500">• {d.time}</span>
                    {d.priority === "urgent" && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
                        URGENT
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-semibold text-white mt-1">{d.question}</h4>
                </div>

                <Link
                  href="/meet/ai-eng-live"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-cyan-500/20 text-white hover:text-cyan-300 border border-white/10 transition-colors shrink-0"
                >
                  Answer in Classroom
                </Link>
              </div>
            ))}
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
      </div>
    </AppShell>
  );
}
