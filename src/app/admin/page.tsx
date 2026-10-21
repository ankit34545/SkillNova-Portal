"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Shield,
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  BarChart3,
  Settings,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Database,
  Lock,
} from "lucide-react";
import AppShell from "@/components/layout/AppShell";

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "courses" | "audit">("overview");

  const systemMetrics = [
    { label: "Total Registered Users", value: "1,248", change: "+14% this month" },
    { label: "Active Live Rooms", value: "3", change: "LiveKit WebRTC healthy" },
    { label: "PostgreSQL Records", value: "11 Tables", change: "Prisma schema synchronized" },
    { label: "Server Status", value: "Operational", change: "Next.js App Router 14.2" },
  ];

  const recentUsers = [
    { id: "usr-1", name: "Dr. Aryan Mehta", role: "TEACHER", email: "aryan.mehta@skillnova.edu", status: "Active" },
    { id: "usr-2", name: "Priya Sharma", role: "TEACHER", email: "priya.sharma@skillnova.edu", status: "Active" },
    { id: "usr-3", name: "Arjun Verma", role: "STUDENT", email: "arjun.verma@nit.ac.in", status: "Active" },
    { id: "usr-4", name: "Ananya Roy", role: "STUDENT", email: "ananya.roy@iitd.ac.in", status: "Active" },
  ];

  return (
    <AppShell breadcrumbs={[{ label: "Admin Console" }]}>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-amber-950/30 via-midnight-900 to-midnight-900 border border-amber-500/20 shadow-xl">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono mb-2">
              <Shield className="w-3.5 h-3.5" />
              <span>System Operations • Administrator View</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              SkillNova Platform Administration
            </h1>
            <p className="mt-1 text-slate-300 text-sm">
              Operational overview of platform users, LiveKit WebRTC active connections, PostgreSQL database integrity, and security audit logs.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/meet"
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/15 text-white border border-white/10 transition-colors"
            >
              Inspect Active Meetings
            </Link>
          </div>
        </div>

        {/* System Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {systemMetrics.map((m) => (
            <div key={m.label} className="p-5 rounded-2xl bg-midnight-900 border border-white/10">
              <p className="text-xs text-slate-400">{m.label}</p>
              <p className="text-2xl font-bold text-white mt-1">{m.value}</p>
              <span className="text-[11px] text-cyan-400 mt-1 block font-mono">{m.change}</span>
            </div>
          ))}
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-3">
          {[
            { id: "overview", label: "Operational Overview", icon: BarChart3 },
            { id: "users", label: "User Directory", icon: Users },
            { id: "courses", label: "Curricula Catalog", icon: BookOpen },
            { id: "audit", label: "Security & Audit Logs", icon: Lock },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors shrink-0 ${
                  isActive
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: Overview */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-3xl bg-midnight-900 border border-white/10 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Database className="w-4 h-4 text-cyan-400" />
                <span>PostgreSQL Connection Status</span>
              </h3>
              <div className="space-y-3 text-xs text-slate-300">
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <span>Engine:</span>
                  <span className="font-mono text-emerald-400">PostgreSQL (Prisma 5.22.0)</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <span>Migration Status:</span>
                  <span className="font-mono text-cyan-400">20261020074325_init applied</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <span>Session Security:</span>
                  <span className="font-mono text-purple-400">HS256 HttpOnly Cookies</span>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-midnight-900 border border-white/10 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>LiveKit WebRTC Infrastructure</span>
              </h3>
              <div className="space-y-3 text-xs text-slate-300">
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <span>Signaling Server:</span>
                  <span className="font-mono text-emerald-400">wss:// (WebSocket Active)</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <span>Screen Capture:</span>
                  <span className="font-mono text-cyan-400">getDisplayMedia API Active</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <span>Whiteboard Sync:</span>
                  <span className="font-mono text-purple-400">Dual-Store Direct Persist</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: User Directory */}
        {activeTab === "users" && (
          <div className="p-6 rounded-3xl bg-midnight-900 border border-white/10">
            <h3 className="text-base font-bold text-white mb-4">Registered Users</h3>
            <div className="divide-y divide-white/5">
              {recentUsers.map((u) => (
                <div key={u.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white">{u.name}</p>
                    <p className="text-xs text-slate-400">{u.email}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-slate-300">
                      {u.role}
                    </span>
                    <span className="text-xs text-emerald-400 font-medium">{u.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Audit */}
        {activeTab === "audit" && (
          <div className="p-6 rounded-3xl bg-midnight-900 border border-white/10 space-y-3">
            <h3 className="text-base font-bold text-white">Security & Access Logs</h3>
            <div className="space-y-2 text-xs font-mono text-slate-400">
              <p className="p-2.5 rounded-lg bg-black/40 border border-white/5">
                [AUTH] 2026-10-21 18:20:12 UTC - Signed host token issued for room ai-eng-live (Dr. Aryan Mehta)
              </p>
              <p className="p-2.5 rounded-lg bg-black/40 border border-white/5">
                [AUTH] 2026-10-21 18:22:45 UTC - Public student session issued for participant p-arjun
              </p>
              <p className="p-2.5 rounded-lg bg-black/40 border border-white/5">
                [ACL] 2026-10-21 18:24:01 UTC - Blocked unauthorized role escalation attempt (student to teacher)
              </p>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
