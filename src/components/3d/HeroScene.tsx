"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Sparkles, Cpu, Eye, Zap, RefreshCw } from "lucide-react";

// Lazy load the 3D canvas with ssr disabled
const LearningCore3D = dynamic(() => import("./LearningCore3D"), {
  ssr: false,
  loading: () => <HeroStaticFallback isLoading={true} />,
});

// High-fidelity CSS 3D Fallback for mobile & performance-sensitive environments
export function HeroStaticFallback({
  isLoading = false,
  activeSkill = "AI Engineering",
  onSelect,
}: {
  isLoading?: boolean;
  activeSkill?: string;
  onSelect?: (skill: string) => void;
}) {
  const skills = [
    { name: "AI Engineering", color: "border-purple-500/50 text-purple-300 bg-purple-500/10" },
    { name: "Full-Stack Web", color: "border-cyan-500/50 text-cyan-300 bg-cyan-500/10" },
    { name: "Cloud & DevOps", color: "border-emerald-500/50 text-emerald-300 bg-emerald-500/10" },
    { name: "System Design & DSA", color: "border-pink-500/50 text-pink-300 bg-pink-500/10" },
  ];

  return (
    <div className="w-full h-full min-h-[420px] flex flex-col items-center justify-center relative overflow-hidden select-none">
      {/* Concentric glowing rings */}
      <div className="absolute w-[340px] h-[340px] sm:w-[420px] sm:h-[420px] rounded-full border border-purple-500/20 animate-spin" style={{ animationDuration: "28s" }} />
      <div className="absolute w-[260px] h-[260px] sm:w-[320px] sm:h-[320px] rounded-full border border-cyan-500/20 animate-spin" style={{ animationDuration: "18s", animationDirection: "reverse" }} />
      <div className="absolute w-[180px] h-[180px] sm:w-[220px] sm:h-[220px] rounded-full border border-dashed border-indigo-400/30 animate-pulse" />

      {/* Central Geometric Hologram */}
      <div className="relative z-10 w-32 h-32 sm:w-40 sm:h-40 flex items-center justify-center">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-purple-600/40 via-indigo-600/40 to-cyan-500/40 blur-xl opacity-80 animate-pulse" />
        <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl border border-white/20 bg-midnight-900/80 backdrop-blur-md flex flex-col items-center justify-center shadow-glow-violet transform rotate-6 hover:rotate-0 transition-transform duration-500">
          <Cpu className="w-10 h-10 text-cyan-400 animate-bounce" style={{ animationDuration: "3s" }} />
          <span className="text-[11px] font-semibold text-slate-300 mt-2 tracking-wider uppercase">
            {isLoading ? "Synthesizing 3D..." : "Quantum Core"}
          </span>
        </div>
      </div>

      {/* Interactive skill satellite pills */}
      <div className="relative z-20 flex flex-wrap gap-2 justify-center max-w-sm mt-8 px-4">
        {skills.map((s) => (
          <button
            key={s.name}
            onClick={() => onSelect && onSelect(s.name)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border backdrop-blur-md transition-all duration-300 ${
              s.color
            } ${activeSkill === s.name ? "ring-2 ring-white/50 scale-105 shadow-glow-cyan" : "hover:scale-102 opacity-80 hover:opacity-100"}`}
          >
            {s.name}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="absolute bottom-4 flex items-center gap-2 text-xs text-slate-400 font-mono">
          <RefreshCw className="w-3.5 h-3.5 animate-spin text-purple-400" />
          <span>Booting WebGL Canvas...</span>
        </div>
      )}
    </div>
  );
}

export interface HeroSceneProps {
  onSkillSelect?: (skill: string) => void;
  selectedSkill?: string;
}

export default function HeroScene({ onSkillSelect, selectedSkill = "AI Engineering" }: HeroSceneProps) {
  const [mounted, setMounted] = useState(false);
  const [use3D, setUse3D] = useState(true);
  const [currentSkill, setCurrentSkill] = useState(selectedSkill);

  useEffect(() => {
    setMounted(true);
    // Auto-detect mobile devices for default performance optimization
    const isMobile = typeof window !== "undefined" && window.innerWidth < 640;
    if (isMobile) {
      setUse3D(false);
    }
  }, []);

  const handleSkillSelect = (skill: string) => {
    setCurrentSkill(skill);
    if (onSkillSelect) onSkillSelect(skill);
  };

  return (
    <div className="relative w-full h-[480px] sm:h-[540px] lg:h-[620px] flex items-center justify-center">
      {/* 3D Scene / Fallback */}
      {!mounted ? (
        <HeroStaticFallback isLoading={true} activeSkill={currentSkill} />
      ) : use3D ? (
        <LearningCore3D onSkillSelect={handleSkillSelect} selectedSkill={currentSkill} />
      ) : (
        <HeroStaticFallback
          isLoading={false}
          activeSkill={currentSkill}
          onSelect={handleSkillSelect}
        />
      )}

      {/* Floating Mode Toggle Control */}
      <div className="absolute top-2 right-2 sm:top-4 sm:right-4 z-20">
        <button
          onClick={() => setUse3D(!use3D)}
          aria-label="Toggle 3D WebGL Scene"
          className="px-3 py-1.5 rounded-full text-xs font-mono flex items-center gap-2 bg-midnight-900/80 hover:bg-midnight-800/90 border border-white/10 hover:border-purple-500/40 text-slate-300 transition-all backdrop-blur-md shadow-glass-sm"
        >
          {use3D ? (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>3D WebGL active</span>
            </>
          ) : (
            <>
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>Static Mode</span>
            </>
          )}
        </button>
      </div>

      {/* Active Node Floating Tooltip Badge */}
      <div className="absolute bottom-3 left-3 sm:bottom-6 sm:left-6 z-20 pointer-events-none">
        <div className="glass-panel px-3.5 py-2 rounded-xl flex items-center gap-2.5 shadow-lg border border-white/10">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Target Focus Node</span>
            <span className="text-xs font-semibold text-white">{currentSkill}</span>
          </div>
        </div>
      </div>

      {/* Interaction Hint */}
      {use3D && (
        <div className="absolute bottom-3 right-3 sm:bottom-6 sm:right-6 z-20 pointer-events-none hidden sm:flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
          <Eye className="w-3.5 h-3.5 text-purple-400" />
          <span>Drag to orbit • Click node to focus</span>
        </div>
      )}
    </div>
  );
}
