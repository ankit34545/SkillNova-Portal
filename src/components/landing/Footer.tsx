"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sparkles, Terminal, Mail, Check, ArrowRight, Github, Twitter, Linkedin, Heart } from "lucide-react";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setTimeout(() => {
        setEmail("");
        setSubscribed(false);
      }, 3000);
    }
  };

  return (
    <footer className="border-t border-white/10 bg-midnight-950 pt-16 pb-12 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-purple-900/10 blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Brand info */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-4 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-400 p-[1px]">
                <div className="w-full h-full bg-midnight-950 rounded-[11px] flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                </div>
              </div>
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-cyan-300 bg-clip-text text-transparent">
                SkillNova
              </span>
            </Link>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-sm mb-6">
              Next-generation 3D spatial learning and AI tutoring platform designed for computer science college students preparing for high-paying product engineering careers.
            </p>

            {/* Newsletter Subscribe */}
            <form onSubmit={handleSubscribe} className="max-w-sm">
              <div className="text-xs font-mono text-purple-300 mb-2">Get 2026 Campus Placement Alerts:</div>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your college email"
                  required
                  className="flex-1 bg-midnight-900 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-glow-violet transition-all flex items-center gap-1.5"
                >
                  {subscribed ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <ArrowRight className="w-3.5 h-3.5" />}
                  <span>{subscribed ? "Subscribed" : "Join"}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Links Col 1: Platform */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-white font-bold mb-4">
              Platform Features
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400 font-medium">
              <li>
                <Link href="/dashboard" className="hover:text-cyan-300 transition-colors">
                  Student Dashboard
                </Link>
              </li>
              <li>
                <a href="#career-paths" className="hover:text-cyan-300 transition-colors">
                  3D Learning Galaxy
                </a>
              </li>
              <li>
                <a href="#coding-lab" className="hover:text-cyan-300 transition-colors">
                  Interactive Coding Lab
                </a>
              </li>
              <li>
                <a href="#copilot" className="hover:text-cyan-300 transition-colors">
                  AI Study Copilot
                </a>
              </li>
              <li>
                <span className="text-slate-500">Live Classroom (Milestone 5)</span>
              </li>
            </ul>
          </div>

          {/* Links Col 2: Career & Placements */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-white font-bold mb-4">
              Career Preparation
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400 font-medium">
              <li>
                <a href="#placement-stats" className="hover:text-cyan-300 transition-colors">
                  Hiring Partner Network
                </a>
              </li>
              <li>
                <span className="text-slate-500">Mock Interview Simulator</span>
              </li>
              <li>
                <span className="text-slate-500">ATS Resume & Portfolio</span>
              </li>
              <li>
                <span className="text-slate-500">FAANG DSA Sheet 2026</span>
              </li>
              <li>
                <span className="text-slate-500">System Design Cheat-sheets</span>
              </li>
            </ul>
          </div>

          {/* Links Col 3: Engineering & Tech */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-white font-bold mb-4">
              Architecture & Stack
            </h4>
            <div className="space-y-2 text-xs font-mono text-slate-400">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <span>Next.js 14 App Router</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                <span>Three.js + R3F WebGL</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Tailwind CSS Glassmorphism</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-pink-400" />
                <span>Autonomous AI Agent Core</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © 2026 SkillNova Platform Inc. All rights reserved. Built for future-ready software engineers.
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              All Systems Operational
            </span>
            <span>•</span>
            <span className="text-slate-400">Milestone 1 Active</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
