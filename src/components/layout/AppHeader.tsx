"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Search,
  Bell,
  Menu,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Shield,
  HelpCircle,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

interface AppHeaderProps {
  onToggleSidebar?: () => void;
  breadcrumbs?: { label: string; href?: string }[];
}

export default function AppHeader({
  onToggleSidebar,
  breadcrumbs,
}: AppHeaderProps) {
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    {
      id: 1,
      title: "Generative AI Masterclass is Live",
      desc: "Dr. Aryan Mehta started session 'RAG Optimization'",
      time: "2m ago",
      href: "/meet/ai-eng-live",
      isLive: true,
    },
    {
      id: 2,
      title: "Doubt Answered",
      desc: "Your question on LoRA fine-tuning received a solution.",
      time: "1h ago",
      href: "/dashboard?tab=doubts",
    },
    {
      id: 3,
      title: "Assignment Due Tomorrow",
      desc: "Distributed Systems: Kafka topology simulation",
      time: "4h ago",
      href: "/courses",
    },
  ];

  return (
    <header className="sticky top-0 z-30 h-16 bg-midnight-950/80 backdrop-blur-md border-b border-white/10 px-4 sm:px-6 flex items-center justify-between">
      {/* Left: Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
            aria-label="Toggle Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="flex items-center gap-2 text-xs sm:text-sm">
          <Link
            href="/dashboard"
            className="text-slate-400 hover:text-white transition-colors"
          >
            SkillNova
          </Link>
          {breadcrumbs &&
            breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={idx}>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                {crumb.href ? (
                  <Link
                    href={crumb.href}
                    className="text-slate-300 hover:text-cyan-300 transition-colors"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-white font-medium">{crumb.label}</span>
                )}
              </React.Fragment>
            ))}
        </div>
      </div>

      {/* Middle: Universal Search Bar */}
      <div className="hidden md:flex items-center max-w-xs lg:max-w-md w-full mx-4">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search courses, live classes, doubts..."
            className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs sm:text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all"
          />
        </div>
      </div>

      {/* Right: Actions, Notifications, Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Live Classroom Quick Jump */}
        <Link
          href="/meet"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Live Meet</span>
        </Link>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors relative"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-400 ring-2 ring-midnight-950" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-midnight-900 border border-white/10 shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <span className="text-sm font-semibold text-white">
                  Notifications
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
                  3 New
                </span>
              </div>
              <div className="divide-y divide-white/5 max-h-72 overflow-y-auto">
                {notifications.map((n) => (
                  <Link
                    key={n.id}
                    href={n.href}
                    onClick={() => setShowNotifications(false)}
                    className="block py-3 hover:bg-white/[0.02] transition-colors rounded-lg px-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-semibold text-white flex items-center gap-1.5">
                        {n.isLive && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        )}
                        {n.title}
                      </p>
                      <span className="text-[10px] text-slate-500 shrink-0">
                        {n.time}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                      {n.desc}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Avatar Badge */}
        <div className="flex items-center gap-2 pl-2 border-l border-white/10">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-cyan-400 flex items-center justify-center text-white text-xs font-bold shadow-glow-violet">
            {user.name[0]}
          </div>
          <span className="hidden lg:inline text-xs font-medium text-slate-200">
            {user.name.split(" ")[0]}
          </span>
        </div>
      </div>
    </header>
  );
}
