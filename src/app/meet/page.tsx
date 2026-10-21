"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Video,
  Plus,
  LogIn,
  Calendar,
  Sparkles,
  Shield,
  Users,
  Clock,
  ArrowRight,
  Tv,
  PenTool,
  MessageSquare,
  Lock,
  Globe,
  Radio,
} from "lucide-react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function MeetLobbyPage() {
  const router = useRouter();

  // Create modal state
  const [createOpen, setCreateOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [hostName, setHostName] = useState("");
  const [description, setDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  // Join modal state
  const [joinOpen, setJoinOpen] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [joinName, setJoinName] = useState("");
  const [joinRole, setJoinRole] = useState<"student" | "teacher">("student");
  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState("");

  // Live active demo classes
  const [activeClasses, setActiveClasses] = useState<any[]>([
    {
      roomId: "ai-eng-live",
      code: "AI2026",
      title: "Generative AI & LLM Systems: Masterclass",
      host: "Dr. Aryan Mehta",
      role: "AI Lead Instructor",
      tag: "Live Now",
      participants: 28,
      mode: "RAG & Agents",
      badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    },
    {
      roomId: "sys-design-401",
      code: "SYS401",
      title: "Distributed Systems & Scalable Architecture",
      host: "Priya Sharma",
      role: "Staff Infrastructure Eng",
      tag: "Starting Soon",
      participants: 12,
      mode: "Whiteboard & HLD",
      badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
    },
  ]);

  const handleCreateMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !hostName.trim()) {
      setCreateError("Please provide both title and your name.");
      return;
    }
    setIsCreating(true);
    setCreateError("");

    try {
      const res = await fetch("/api/meet/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          hostName,
          description,
          visibility: "public",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create meeting.");

      // Save user identity and host authorization key in local storage for room entry
      localStorage.setItem(`meet_user_${data.meeting.roomId}`, JSON.stringify({
        displayName: hostName,
        role: "teacher",
        hostKey: data.meeting.hostId,
      }));

      router.push(`/meet/${data.meeting.roomId}`);
    } catch (err: any) {
      setCreateError(err.message || "An error occurred.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim() || !joinName.trim()) {
      setJoinError("Please provide room code and your name.");
      return;
    }
    setIsJoining(true);
    setJoinError("");

    try {
      const cleanCode = joinCode.trim().toUpperCase();
      const res = await fetch("/api/meet/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: cleanCode.length === 6 ? cleanCode : undefined,
          roomId: cleanCode.length !== 6 ? cleanCode.toLowerCase() : undefined,
          displayName: joinName,
          role: joinRole,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to join room.");

      localStorage.setItem(`meet_user_${data.meeting.roomId}`, JSON.stringify({
        displayName: joinName,
        role: joinRole,
      }));

      router.push(`/meet/${data.meeting.roomId}`);
    } catch (err: any) {
      setJoinError(err.message || "Could not find meeting.");
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-mono font-medium mb-4">
          <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span>Real-Time WebRTC Virtual Classroom</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          Spatial Live Learning &{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400">
            Interactive Classroom
          </span>
        </h1>
        <p className="mt-4 text-slate-300 text-base sm:text-lg">
          Join high-definition video classrooms with multi-party WebRTC, synchronized collaborative whiteboards, instant code & doubt resolution, and rich classroom materials.
        </p>

        {/* Quick Action Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Button
            size="lg"
            variant="gradient"
            onClick={() => setCreateOpen(true)}
            className="shadow-glow-violet px-6 py-3 font-semibold text-white flex items-center gap-2.5"
          >
            <Plus className="w-5 h-5" />
            <span>Host New Classroom</span>
          </Button>

          <Button
            size="lg"
            variant="secondary"
            onClick={() => setJoinOpen(true)}
            className="px-6 py-3 font-semibold text-slate-200 border-white/10 hover:border-cyan-500/40 hover:text-cyan-300 flex items-center gap-2.5"
          >
            <LogIn className="w-5 h-5" />
            <span>Join with Code or URL</span>
          </Button>

          <Link href="/dashboard">
            <Button
              size="lg"
              variant="outline"
              className="px-6 py-3 font-semibold text-slate-300 border-white/10 hover:border-white/20 hover:text-white flex items-center gap-2"
            >
              <Calendar className="w-4 h-4 text-purple-400" />
              <span>Student Schedule</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Featured Live Classrooms Grid */}
      <div className="mb-14">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <span>Active Public Classrooms</span>
            </h2>
            <p className="text-sm text-slate-400">
              Drop into an ongoing cohort session or test classroom audio/video synchronization.
            </p>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            2 Active Cohorts
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {activeClasses.map((c) => (
            <div
              key={c.roomId}
              className="p-6 rounded-2xl bg-midnight-900/60 border border-white/10 hover:border-purple-500/40 backdrop-blur-md transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${c.badgeColor}`}>
                    {c.tag}
                  </span>
                  <span className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-cyan-400" />
                    {c.participants} students joined
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                  {c.title}
                </h3>
                <p className="text-sm text-slate-400 mt-1">
                  Instructor: <strong className="text-slate-200">{c.host}</strong> ({c.role})
                </p>

                <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-300">
                  <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/5 flex items-center gap-1">
                    <PenTool className="w-3.5 h-3.5 text-purple-400" /> Whiteboard Ready
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/5 flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5 text-cyan-400" /> Live Q&A Doubt Center
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/5 font-mono text-purple-300">
                    Code: {c.code}
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-mono">/meet/{c.roomId}</span>
                <Button
                  size="sm"
                  variant="gradient"
                  onClick={() => {
                    localStorage.setItem(`meet_user_${c.roomId}`, JSON.stringify({
                      displayName: "Student Guest",
                      role: "student",
                    }));
                    router.push(`/meet/${c.roomId}`);
                  }}
                  className="flex items-center gap-1.5 text-xs font-medium px-4 py-2"
                >
                  <span>Enter Classroom</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Classroom Capabilities Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5">
          <Tv className="w-6 h-6 text-cyan-400 mb-3" />
          <h4 className="text-sm font-bold text-white">Full HD Video & Screens</h4>
          <p className="text-xs text-slate-400 mt-1">
            WebRTC peer mesh with active speaker detection, camera preview, and tab/screen audio sharing.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5">
          <PenTool className="w-6 h-6 text-purple-400 mb-3" />
          <h4 className="text-sm font-bold text-white">Multi-Page Whiteboard</h4>
          <p className="text-xs text-slate-400 mt-1">
            Pen, highlighter, shapes, text tools, undo/redo, pan/zoom, and one-click PNG export.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5">
          <MessageSquare className="w-6 h-6 text-pink-400 mb-3" />
          <h4 className="text-sm font-bold text-white">Live Doubt Resolution</h4>
          <p className="text-xs text-slate-400 mt-1">
            Structured question queue with priority indicators, code snippets, teacher answers, and pinned items.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5">
          <Shield className="w-6 h-6 text-emerald-400 mb-3" />
          <h4 className="text-sm font-bold text-white">Host Controls & Security</h4>
          <p className="text-xs text-slate-400 mt-1">
            Role-based permissions (host, teacher, student), room lock, mute all, and attendance records.
          </p>
        </div>
      </div>

      {/* Create Classroom Modal */}
      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Host a Live Classroom"
        size="md"
      >
        <form onSubmit={handleCreateMeeting} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Classroom Title *
            </label>
            <Input
              placeholder="e.g. Next.js 14 Server Actions Deep Dive"
              value={title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Instructor / Host Name *
            </label>
            <Input
              placeholder="e.g. Dr. Aryan Mehta"
              value={hostName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setHostName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Topic Description (Optional)
            </label>
            <textarea
              className="w-full px-3.5 py-2.5 rounded-xl bg-midnight-900 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-purple-500 transition-colors resize-none h-20"
              placeholder="Outline today's topics, assignments, or prerequisites..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {createError && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-xs">
              {createError}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setCreateOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="gradient"
              disabled={isCreating}
              className="shadow-glow-violet"
            >
              {isCreating ? "Initializing Room..." : "Launch Classroom"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Join Classroom Modal */}
      <Modal
        open={joinOpen}
        onClose={() => setJoinOpen(false)}
        title="Join a Classroom"
        size="md"
      >
        <form onSubmit={handleJoinMeeting} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              6-Letter Code or Room ID *
            </label>
            <Input
              placeholder="e.g. AI2026 or ai-eng-live"
              value={joinCode}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setJoinCode(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Your Display Name *
            </label>
            <Input
              placeholder="e.g. Rohan Gupta"
              value={joinName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setJoinName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Role
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setJoinRole("student")}
                className={`px-3 py-2 rounded-xl text-xs font-medium border text-center transition-all ${
                  joinRole === "student"
                    ? "bg-purple-600/20 border-purple-500 text-purple-300"
                    : "bg-midnight-900 border-white/10 text-slate-400 hover:text-white"
                }`}
              >
                Student
              </button>
              <button
                type="button"
                onClick={() => setJoinRole("teacher")}
                className={`px-3 py-2 rounded-xl text-xs font-medium border text-center transition-all ${
                  joinRole === "teacher"
                    ? "bg-cyan-600/20 border-cyan-500 text-cyan-300"
                    : "bg-midnight-900 border-white/10 text-slate-400 hover:text-white"
                }`}
              >
                Teacher / Mentor
              </button>
            </div>
          </div>

          {joinError && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-xs">
              {joinError}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setJoinOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="gradient"
              disabled={isJoining}
              className="shadow-glow-cyan"
            >
              {isJoining ? "Connecting..." : "Enter Room"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
