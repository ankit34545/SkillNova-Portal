"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Search,
  Filter,
  Clock,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Users,
  Star,
  FileText,
  PlayCircle,
  ExternalLink,
} from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import { FEATURED_TRACKS, LearningTrack } from "@/lib/mock-data";

export default function CoursesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = ["All", "AI & ML", "Systems", "DSA & SDE", "DevOps"];

  const filteredTracks = FEATURED_TRACKS.filter((track) => {
    const matchesSearch =
      track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      track.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      track.keySkills.some((s) =>
        s.toLowerCase().includes(searchQuery.toLowerCase())
      );

    if (selectedCategory === "All") return matchesSearch;
    if (selectedCategory === "AI & ML")
      return matchesSearch && track.id === "ai-eng";
    if (selectedCategory === "Systems")
      return matchesSearch && track.id === "fullstack-cloud";
    if (selectedCategory === "DSA & SDE")
      return matchesSearch && track.id === "dsa-interview";
    if (selectedCategory === "DevOps")
      return matchesSearch && track.id === "cloud-devops";
    return matchesSearch;
  });

  return (
    <AppShell breadcrumbs={[{ label: "Course Curricula" }]}>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Engineering Curricula & Career Tracks
            </h1>
            <p className="mt-1 text-slate-400 text-sm">
              Production-focused tracks designed by staff engineers from tier-1 firms with real capstones and live cohort classes.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/meet"
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 hover:bg-cyan-500/20 transition-colors flex items-center gap-2"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Join Active Cohort Room</span>
            </Link>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by skill, framework, or topic (e.g. PyTorch, Kafka, Raft)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-midnight-900 border border-white/10 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-2 rounded-xl text-xs font-medium transition-colors shrink-0 ${
                  selectedCategory === cat
                    ? "bg-purple-600/30 text-white border border-purple-500/50"
                    : "text-slate-400 hover:text-white bg-midnight-900 border border-white/5"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredTracks.map((track) => (
            <div
              key={track.id}
              className="p-6 rounded-3xl bg-midnight-900/90 border border-white/10 hover:border-purple-500/40 transition-all flex flex-col justify-between group shadow-xl"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                    {track.level}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-amber-400">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span className="font-semibold">{track.rating}</span>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors">
                  {track.title}
                </h3>
                <p className="text-xs text-purple-400 font-medium mt-1">
                  Target Role: {track.role}
                </p>
                <p className="text-xs text-slate-300 mt-3 line-clamp-3 leading-relaxed">
                  {track.description}
                </p>

                {/* Key Skills Pills */}
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {track.keySkills.map((skill) => (
                    <span
                      key={skill}
                      className="text-[10px] px-2 py-0.5 rounded bg-white/[0.04] text-slate-300 border border-white/5"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-400">Duration</span>
                  <p className="text-xs font-semibold text-white">
                    {track.durationWeeks} Weeks • {track.projectCount} Projects
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={async () => {
                      try {
                        const res = await fetch("/api/student/enroll", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ trackId: track.id }),
                        });
                        if (res.ok) {
                          alert(`Successfully enrolled in ${track.title}! You can now access all modules from your student dashboard.`);
                        }
                      } catch {
                        alert("Enrollment failed. Please check network connection.");
                      }
                    }}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/10 transition-colors"
                  >
                    Enroll Track
                  </button>
                  <Link
                    href={`/meet/${
                      track.id === "ai-eng"
                        ? "ai-eng-live"
                        : track.id === "dsa-interview"
                        ? "dsa-faang-prep"
                        : "sys-design-401"
                    }`}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white shadow-glow-violet transition-all flex items-center gap-1.5"
                  >
                    <span>Enter Live Lab</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
