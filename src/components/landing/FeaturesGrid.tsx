"use client";

import React from "react";
import { CORE_FEATURES } from "@/lib/mock-data";
import { Bot, Boxes, Terminal, Video, FileCheck, Users, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function FeaturesGrid() {
  const getIcon = (name: string) => {
    switch (name) {
      case "Bot":
        return <Bot className="w-6 h-6 text-purple-400" />;
      case "Boxes":
        return <Boxes className="w-6 h-6 text-cyan-400" />;
      case "Terminal":
        return <Terminal className="w-6 h-6 text-pink-400" />;
      case "Video":
        return <Video className="w-6 h-6 text-purple-400" />;
      case "FileCheck":
        return <FileCheck className="w-6 h-6 text-cyan-400" />;
      case "Users":
        return <Users className="w-6 h-6 text-amber-400" />;
      default:
        return <Sparkles className="w-6 h-6 text-indigo-400" />;
    }
  };

  return (
    <section id="copilot" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-300 text-xs font-mono font-medium mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Integrated Platform Architecture</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Everything You Need To Secure{" "}
            <span className="text-gradient-primary">Top Tier 1 Offers</span>
          </h2>
          <p className="mt-4 text-slate-300 text-sm sm:text-base">
            SkillNova consolidates fragmented tools into an intelligent learning operating system.
          </p>
        </div>

        {/* 6 Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CORE_FEATURES.map((feat, idx) => (
            <div
              key={idx}
              className="glass-panel glass-panel-hover rounded-2xl p-6 relative group overflow-hidden flex flex-col justify-between"
            >
              {/* Corner Glow Accent */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition-colors pointer-events-none" />

              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="p-3 rounded-xl bg-midnight-950 border border-white/10 shadow-inner group-hover:scale-110 transition-transform">
                    {getIcon(feat.icon)}
                  </div>
                  <span className="text-[10px] font-mono tracking-wider uppercase px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300">
                    {feat.tag}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                  {feat.title}
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {feat.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/5 flex items-center text-xs font-mono text-purple-400 group-hover:text-cyan-400 transition-colors">
                <span>Explore feature details</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
