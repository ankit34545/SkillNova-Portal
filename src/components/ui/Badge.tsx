"use client";

import React from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "active" | "waiting" | "ended" | "host" | "cohost" | "participant" | "guest" | "recording" | "live" | "info";

const variants: Record<BadgeVariant, string> = {
  active: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  waiting: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  ended: "bg-slate-500/15 text-slate-400 border-slate-500/30",
  host: "bg-violet-500/20 text-violet-300 border-violet-500/40",
  cohost: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
  participant: "bg-cyan-500/10 text-cyan-400 border-cyan-500/25",
  guest: "bg-slate-500/10 text-slate-400 border-slate-500/25",
  recording: "bg-red-500/15 text-red-400 border-red-500/30 animate-pulse",
  live: "bg-rose-500/20 text-rose-300 border-rose-500/40",
  info: "bg-blue-500/10 text-blue-300 border-blue-500/25",
};

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  dot?: boolean;
  className?: string;
}

export function Badge({ variant = "info", children, dot = false, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border",
        variants[variant],
        className
      )}
    >
      {dot && (
        <span className={cn(
          "w-1.5 h-1.5 rounded-full",
          variant === "active" && "bg-emerald-400",
          variant === "live" || variant === "recording" ? "bg-red-400" : "",
          variant === "waiting" && "bg-amber-400",
        )} />
      )}
      {children}
    </span>
  );
}
