"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, Terminal, Play, ShieldCheck, Star, Users, Brain, Cpu, Compass } from "lucide-react";
import HeroWorkspacePreview from "./HeroWorkspacePreview";

export default function HeroSection() {
  const [selectedSkill, setSelectedSkill] = useState("AI Engineering");

  return (
    <section className="relative pt-6 pb-16 lg:py-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Hero Copy & Actions */}
          <div className="lg:col-span-7 flex flex-col z-10 text-center lg:text-left">
            {/* Top Pill Badge */}
            <div className="inline-flex items-center gap-2 self-center lg:self-start px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-mono font-medium mb-6 shadow-glow-violet/40">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>SkillNova 3.0 • College Placement Accelerator</span>
              <span className="text-slate-500">•</span>
              <span className="text-cyan-300 font-semibold">2026 Batch Ready</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.12]">
              Master In-Demand Tech with{" "}
              <span className="text-gradient-primary">
                3D Spatial Learning
              </span>{" "}
              & AI Copilot.
            </h1>

            {/* Subtitle */}
            <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Bridge the college-to-FAANG engineering gap. Experience interactive 3D system architecture, real-world full-stack labs, live AI mock interviews, and automated portfolio verification.
            </p>

            {/* Skill Quick Selector (interacts with 3D canvas) */}
            <div className="mt-7 flex flex-col gap-2">
              <div className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center justify-center lg:justify-start gap-1.5">
                <Compass className="w-3.5 h-3.5 text-cyan-400" />
                <span>Interactive 3D Skill Focus:</span>
              </div>
              <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                {[
                  { name: "AI Engineering", icon: Brain },
                  { name: "Full-Stack Web", icon: Terminal },
                  { name: "Cloud & DevOps", icon: Cpu },
                  { name: "System Design & DSA", icon: Sparkles },
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = selectedSkill === item.name;
                  return (
                    <button
                      key={item.name}
                      onClick={() => setSelectedSkill(item.name)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200 flex items-center gap-1.5 ${
                        isActive
                          ? "bg-purple-600/30 border-cyan-400 text-cyan-300 shadow-glow-cyan"
                          : "bg-midnight-900/60 border-white/10 text-slate-300 hover:border-white/20 hover:text-white"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 text-purple-400" />
                      <span>{item.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* CTAs */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link
                href="/dashboard"
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 shadow-glow-violet transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2.5 text-sm"
              >
                <span>Launch Student Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#career-paths"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-medium text-slate-200 bg-midnight-900/80 hover:bg-midnight-800 border border-white/10 hover:border-white/20 transition-all flex items-center justify-center gap-2 text-sm backdrop-blur-md"
              >
                <Terminal className="w-4 h-4 text-cyan-400" />
                <span>Explore 3D Roadmap</span>
              </a>
            </div>

            {/* Social Proof & Metrics row */}
            <div className="mt-10 pt-6 border-t border-white/10 flex flex-wrap items-center justify-center lg:justify-start gap-6 sm:gap-8">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  <div className="w-7 h-7 rounded-full bg-purple-500 border border-white/30 flex items-center justify-center text-[10px] font-bold">IIT</div>
                  <div className="w-7 h-7 rounded-full bg-cyan-500 border border-white/30 flex items-center justify-center text-[10px] font-bold">NIT</div>
                  <div className="w-7 h-7 rounded-full bg-indigo-500 border border-white/30 flex items-center justify-center text-[10px] font-bold">BITS</div>
                </div>
                <div className="text-left text-xs">
                  <div className="font-semibold text-white">45,000+ Students</div>
                  <div className="text-slate-400">from 220+ Colleges</div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-amber-400 text-xs font-semibold">
                <Star className="w-4 h-4 fill-amber-400" />
                <span>4.9/5 Rating</span>
                <span className="text-slate-400 font-normal">(3,400+ reviews)</span>
              </div>

              <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold">
                <ShieldCheck className="w-4 h-4" />
                <span>₹21.4 LPA Avg CTC</span>
              </div>
            </div>
          </div>

          {/* Right Column: AI Learning Workspace Preview */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            {/* Ambient Backlight */}
            <div className="absolute inset-0 bg-gradient-radial from-purple-600/15 via-cyan-500/10 to-transparent blur-3xl pointer-events-none" />
            <div className="relative w-full h-[450px] sm:h-[500px] lg:h-[520px] rounded-3xl border border-white/10 bg-midnight-900/60 backdrop-blur-xl overflow-hidden shadow-2xl">
              <HeroWorkspacePreview
                selectedSkill={selectedSkill}
                onSkillSelect={(skill) => setSelectedSkill(skill)}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
