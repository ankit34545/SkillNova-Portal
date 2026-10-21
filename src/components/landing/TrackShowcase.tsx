"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FEATURED_TRACKS, LearningTrack } from "@/lib/mock-data";
import { Sparkles, Clock, BookOpen, Star, Users, ArrowUpRight, CheckCircle2, ChevronRight, Layers, Cpu, BrainCircuit, Cloud } from "lucide-react";

export default function TrackShowcase() {
  const [selectedId, setSelectedId] = useState<string>("ai-eng");
  const currentTrack = FEATURED_TRACKS.find((t) => t.id === selectedId) || FEATURED_TRACKS[0];

  const getIcon = (name: string) => {
    switch (name) {
      case "Cpu":
        return <Cpu className="w-5 h-5 text-purple-400" />;
      case "Layers":
        return <Layers className="w-5 h-5 text-cyan-400" />;
      case "BrainCircuit":
        return <BrainCircuit className="w-5 h-5 text-pink-400" />;
      case "Cloud":
        return <Cloud className="w-5 h-5 text-emerald-400" />;
      default:
        return <Sparkles className="w-5 h-5 text-indigo-400" />;
    }
  };

  return (
    <section id="career-paths" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-mono font-medium mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Career-Focused Curricula</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Engineered for Real Placements.{" "}
              <span className="text-gradient-primary">Not Textbook Theory.</span>
            </h2>
          </div>
          <p className="text-slate-400 text-sm max-w-md">
            Each track is curated with lead architects from FAANG and high-growth unicorns, featuring verified capstones and live mock evaluations.
          </p>
        </div>

        {/* Tracks Grid & Detail */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Track Selection Cards */}
          <div className="lg:col-span-5 flex flex-col gap-3">
            {FEATURED_TRACKS.map((track) => {
              const isSelected = track.id === selectedId;
              return (
                <button
                  key={track.id}
                  onClick={() => setSelectedId(track.id)}
                  className={`w-full text-left p-5 rounded-2xl border transition-all duration-300 relative ${
                    isSelected
                      ? "bg-midnight-800/90 border-cyan-400/60 shadow-glow-cyan/50"
                      : "bg-midnight-900/60 border-white/5 hover:border-white/15 hover:bg-midnight-800/40"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-midnight-950 border border-white/10">
                        {getIcon(track.iconName)}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">{track.title}</h4>
                        <div className="text-xs text-cyan-400 font-mono">{track.role}</div>
                      </div>
                    </div>
                    <span className="text-xs font-bold font-mono text-emerald-400 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                      {track.avgPackage}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-400 mt-3 pt-3 border-t border-white/5 font-mono">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      {track.durationWeeks} Weeks
                    </span>
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                      {track.projectCount} Production Projects
                    </span>
                    <span className="flex items-center gap-1 text-amber-400 font-semibold ml-auto">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      {track.rating}
                    </span>
                  </div>

                  {isSelected && (
                    <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-1.5 h-10 bg-cyan-400 rounded-r-full shadow-glow-cyan" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Expanded Selected Track Showcase */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl border border-white/10 bg-midnight-900/90 p-6 sm:p-8 backdrop-blur-xl shadow-glass relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-2 text-xs font-mono text-purple-300">
                    <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/30">
                      {currentTrack.level} Level
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-slate-300">
                      <Users className="w-3.5 h-3.5 text-cyan-400" />
                      {currentTrack.enrolledStudents.toLocaleString()} students enrolled
                    </span>
                  </div>

                  <div className="text-xs font-mono text-emerald-400 flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
                    <span>Benchmark CTC:</span>
                    <strong className="text-white">{currentTrack.avgPackage}</strong>
                  </div>
                </div>

                <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
                  {currentTrack.title}
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed mb-6">
                  {currentTrack.description}
                </p>

                {/* Core Skills Matrix */}
                <div className="mb-6">
                  <div className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2.5">
                    Skills & Technologies Mastered:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {currentTrack.keySkills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-lg bg-midnight-950 border border-white/10 text-xs font-mono text-cyan-300 flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Tags */}
                <div className="mb-8 flex flex-wrap gap-2">
                  {currentTrack.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-md text-[11px] font-mono text-slate-300 bg-white/5 border border-white/5"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Action Row */}
                <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-xs text-slate-400">
                    Includes GitHub portfolio audit & mock technical interviews
                  </div>

                  <Link
                    href="/dashboard"
                    className="w-full sm:w-auto px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 shadow-glow-violet transition-all flex items-center justify-center gap-2 text-xs"
                  >
                    <span>Enroll in Track</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
