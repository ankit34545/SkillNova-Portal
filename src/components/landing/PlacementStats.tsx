"use client";

import React from "react";
import { PLATFORM_STATS } from "@/lib/mock-data";
import { TrendingUp, Building2, Award, CheckCircle2 } from "lucide-react";

export default function PlacementStats() {
  const companies = [
    "Google", "Microsoft", "Amazon", "Uber", "Atlassian", 
    "Razorpay", "Swiggy", "Flipkart", "CRED", "Zomato", "Adobe", "Salesforce"
  ];

  return (
    <section id="placement-stats" className="py-20 relative bg-midnight-950/60 border-y border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-medium mb-3">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Placement Analytics & Hiring Network</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Proven Career Outcomes Across{" "}
            <span className="text-gradient-primary">220+ Colleges</span>
          </h2>
          <p className="mt-4 text-slate-300 text-sm sm:text-base">
            SkillNova students outperform traditional coding bootcamps by 3.2x in machine-coding and live system design interviews.
          </p>
        </div>

        {/* 4 Big Metric Stat Counters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {PLATFORM_STATS.map((stat, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-midnight-900/80 border border-white/10 text-center relative overflow-hidden group hover:border-cyan-500/40 transition-colors"
            >
              <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight text-gradient-primary group-hover:scale-105 transition-transform duration-300">
                {stat.value}
              </div>
              <div className="text-xs sm:text-sm font-semibold text-slate-200 mt-2">
                {stat.label}
              </div>
              <div className="text-[11px] text-slate-400 font-mono mt-1">
                {stat.detail}
              </div>
            </div>
          ))}
        </div>

        {/* Hiring Partners Marquee/Grid */}
        <div className="rounded-2xl border border-white/10 bg-midnight-900/40 p-8 backdrop-blur-md">
          <div className="text-center text-xs font-mono uppercase tracking-widest text-slate-400 mb-6">
            Where SkillNova Alumni Work Today
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {companies.map((company, idx) => (
              <div
                key={idx}
                className="py-3 px-4 rounded-xl bg-midnight-950/70 border border-white/5 flex items-center justify-center font-bold text-sm tracking-wide text-slate-300 hover:text-white hover:border-cyan-500/30 hover:bg-midnight-800/60 transition-all cursor-default"
              >
                {company}
              </div>
            ))}
          </div>

          <div className="mt-6 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Over 180+ verified tech enterprises actively hiring from our portfolio pool</span>
          </div>
        </div>
      </div>
    </section>
  );
}
