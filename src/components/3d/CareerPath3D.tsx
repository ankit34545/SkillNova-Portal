"use client";

import React, { useState } from "react";
import { CheckCircle2, Lock, Sparkles, Terminal, ChevronRight, Award, Flame, ArrowUpRight } from "lucide-react";

interface Milestone {
  id: number;
  stage: string;
  title: string;
  skills: string[];
  project: string;
  placementImpact: string;
  status: "completed" | "in-progress" | "unlocked" | "upcoming";
  xp: number;
}

const MILESTONES: Milestone[] = [
  {
    id: 1,
    stage: "Milestone 01",
    title: "Core Data Structures & Complexity",
    skills: ["Graph Theory", "Dynamic Programming", "Bit Manipulation", "Time-Space Limits"],
    project: "High-Throughput Concurrent Cache in Go",
    placementImpact: "Clears SDE-1 Technical Round 1 (DSA Screen)",
    status: "completed",
    xp: 1200,
  },
  {
    id: 2,
    stage: "Milestone 02",
    title: "Production Full-Stack & State Architecture",
    skills: ["Next.js 14 App Router", "TypeScript", "Tailwind Design Systems", "WebSockets"],
    project: "Real-time Collaborative Canvas & Chat",
    placementImpact: "Clears Machine Coding / Frontend Tech Rounds",
    status: "in-progress",
    xp: 2400,
  },
  {
    id: 3,
    stage: "Milestone 03",
    title: "Generative AI Systems & Vector Retrieval",
    skills: ["LangChain & LlamaIndex", "Embeddings", "pgvector", "Model Evaluation"],
    project: "Autonomous Multi-Agent Research Assistant",
    placementImpact: "Qualifies for High-Paying AI Engineer / Applied Scientist Roles",
    status: "unlocked",
    xp: 3600,
  },
  {
    id: 4,
    stage: "Milestone 04",
    title: "Distributed Microservices & Cloud Scale",
    skills: ["Docker & Kubernetes", "Kafka Event Bus", "gRPC Contracts", "Database Sharding"],
    project: "Financial Transaction Ledger with Fault-Tolerance",
    placementImpact: "Clears System Design & Architecture Round (HLD/LLD)",
    status: "upcoming",
    xp: 4800,
  },
  {
    id: 5,
    stage: "Milestone 05",
    title: "Placement Gauntlet & FAANG Simulator",
    skills: ["Behavioral STAR Matrix", "Live System Stress Testing", "Resume ATS Tuning"],
    project: "Verified Capstone Portfolio & GitHub Proof-of-Work",
    placementImpact: "Final Offer Negotiation & CTC Maximization (₹24+ LPA)",
    status: "upcoming",
    xp: 6000,
  },
];

export default function CareerPath3D() {
  const [activeStep, setActiveStep] = useState(2);
  const selectedMilestone = MILESTONES.find((m) => m.id === activeStep) || MILESTONES[1];

  return (
    <div className="w-full py-8">
      {/* 3D Isometric / Perspective Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: 3D Milestone Node Track */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Milestone Sequence</span>
            <span className="text-xs font-mono text-cyan-400">Step {activeStep} of 5</span>
          </div>

          {MILESTONES.map((milestone) => {
            const isCurrent = milestone.id === activeStep;
            return (
              <button
                key={milestone.id}
                onClick={() => setActiveStep(milestone.id)}
                className={`w-full text-left p-4 rounded-xl transition-all duration-300 relative border ${
                  isCurrent
                    ? "bg-midnight-800/90 border-purple-500/60 shadow-glow-violet scale-[1.02]"
                    : "bg-midnight-900/60 border-white/5 hover:border-white/15 hover:bg-midnight-800/40"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-purple-300 font-semibold">
                    {milestone.stage}
                  </span>
                  <div className="flex items-center gap-2">
                    {milestone.status === "completed" && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3" /> Done
                      </span>
                    )}
                    {milestone.status === "in-progress" && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/30 animate-pulse">
                        <Flame className="w-3 h-3 text-cyan-400" /> Current
                      </span>
                    )}
                    {milestone.status === "unlocked" && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/30">
                        <Sparkles className="w-3 h-3" /> Ready
                      </span>
                    )}
                    {milestone.status === "upcoming" && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 bg-slate-800/40 px-2 py-0.5 rounded-full border border-white/5">
                        <Lock className="w-3 h-3" /> Locked
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-sm font-semibold text-white truncate">{milestone.title}</div>
                <div className="text-xs text-slate-400 mt-1 flex items-center justify-between">
                  <span className="truncate max-w-[200px]">{milestone.project}</span>
                  <span className="font-mono text-purple-400 text-[11px]">+{milestone.xp} XP</span>
                </div>

                {isCurrent && (
                  <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-gradient-to-b from-cyan-400 to-purple-500 rounded-r-full" />
                )}
              </button>
            );
          })}
        </div>

        {/* Right Side: 3D Holographic Detail Card with Perspective Depth */}
        <div className="lg:col-span-7">
          <div className="relative rounded-2xl border border-purple-500/30 bg-gradient-to-b from-midnight-800/80 to-midnight-900/90 p-6 sm:p-8 backdrop-blur-xl shadow-glass overflow-hidden">
            {/* Ambient Corner Glow */}
            <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-cyan-500/20 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-purple-600/20 blur-3xl pointer-events-none" />

            <div className="relative z-10">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4 mb-6">
                <div>
                  <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-semibold">
                    {selectedMilestone.stage} Blueprint
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold text-white mt-1">
                    {selectedMilestone.title}
                  </h3>
                </div>
                <div className="px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-mono font-medium flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-purple-400" />
                  <span>{selectedMilestone.xp} Experience Points</span>
                </div>
              </div>

              {/* Placement Impact Highlight */}
              <div className="mb-6 p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/30 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-semibold">Placement Advantage</div>
                  <div className="text-sm text-slate-200 mt-0.5">{selectedMilestone.placementImpact}</div>
                </div>
              </div>

              {/* Skills Checklist */}
              <div className="mb-6">
                <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-3">Skills Mastered in this Stage</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {selectedMilestone.skills.map((skill, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2.5 p-2.5 rounded-lg bg-midnight-950/60 border border-white/5 text-xs text-slate-200"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-glow-cyan" />
                      <span>{skill}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hands-on Project Milestone */}
              <div className="p-4 rounded-xl bg-midnight-950/70 border border-purple-500/20 mb-6">
                <div className="flex items-center gap-2 text-xs font-mono text-purple-300 mb-1">
                  <Terminal className="w-3.5 h-3.5 text-purple-400" />
                  <span>Capstone Deliverable</span>
                </div>
                <div className="text-sm font-semibold text-white">{selectedMilestone.project}</div>
                <div className="text-xs text-slate-400 mt-1">
                  Includes automated CI test runner, Dockerfile, live demo URL, and code walkthrough for your portfolio.
                </div>
              </div>

              {/* Action row */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                <div className="text-xs text-slate-400 font-mono">
                  Verified by 180+ tech recruiters
                </div>
                <button
                  onClick={() => alert(`Opening curriculum for ${selectedMilestone.title}`)}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-glow-violet transition-all flex items-center gap-2 hover:scale-102"
                >
                  <span>Explore Stage Curriculum</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
