"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Video,
  Users,
  FileText,
  HelpCircle,
  Compass,
  Settings,
  Shield,
  Calendar,
  GraduationCap,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  LogOut,
  BarChart3,
  UserCheck,
  FolderGit2,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

export default function AppSidebar({
  collapsed,
  setCollapsed,
}: {
  collapsed: boolean;
  setCollapsed: (c: boolean) => void;
}) {
  const pathname = usePathname();
  const { user, setRole } = useAuth();

  const studentNav: NavItem[] = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "My Courses", href: "/courses", icon: BookOpen, badge: "3" },
    { label: "Live Classes", href: "/classes", icon: Video, badge: "Live" },
    { label: "Meet Workspace", href: "/meet", icon: Users },
    { label: "Class Notes", href: "/dashboard?tab=notes", icon: FileText },
    { label: "Doubt Center", href: "/dashboard?tab=doubts", icon: HelpCircle },
    { label: "Career Roadmap", href: "/#career-paths", icon: Compass },
  ];

  const teacherNav: NavItem[] = [
    { label: "Teacher Dashboard", href: "/teacher", icon: LayoutDashboard },
    { label: "Assigned Courses", href: "/teacher#courses", icon: BookOpen },
    { label: "Teaching Schedule", href: "/teacher#schedule", icon: Calendar },
    { label: "Live Classroom", href: "/meet", icon: Video, badge: "Host" },
    { label: "Student Doubts", href: "/teacher#doubts", icon: HelpCircle, badge: "4 New" },
    { label: "Curriculum Notes", href: "/teacher#materials", icon: FileText },
  ];

  const adminNav: NavItem[] = [
    { label: "Admin Overview", href: "/admin", icon: Shield },
    { label: "User Directory", href: "/admin#users", icon: Users },
    { label: "Faculty & Mentors", href: "/admin#faculty", icon: GraduationCap },
    { label: "Courses & Curricula", href: "/admin#courses", icon: FolderGit2 },
    { label: "Class Schedules", href: "/admin#sessions", icon: Calendar },
    { label: "Platform Analytics", href: "/admin#metrics", icon: BarChart3 },
    { label: "System Settings", href: "/admin#settings", icon: Settings },
  ];

  const navItems =
    user.role === "admin"
      ? adminNav
      : user.role === "teacher"
      ? teacherNav
      : studentNav;

  return (
    <aside
      className={`fixed top-0 left-0 h-screen z-40 bg-midnight-950/95 border-r border-white/10 transition-all duration-300 flex flex-col ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 px-4 border-b border-white/10 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-400 p-[1px] shadow-glow-violet shrink-0">
            <div className="w-full h-full bg-midnight-950 rounded-[11px] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-cyan-400" />
            </div>
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-white via-slate-100 to-cyan-300 bg-clip-text text-transparent">
                SkillNova
              </span>
              <span className="text-[10px] font-mono tracking-wider text-purple-400 uppercase">
                {user.role} Portal
              </span>
            </div>
          )}
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors hidden md:block"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Role Switcher Pill */}
      {!collapsed ? (
        <div className="p-3 mx-3 my-2 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-medium">Role:</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setRole("student")}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                user.role === "student"
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Student
            </button>
            <button
              onClick={() => setRole("teacher")}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                user.role === "teacher"
                  ? "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Teacher
            </button>
            <button
              onClick={() => setRole("admin")}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                user.role === "admin"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Admin
            </button>
          </div>
        </div>
      ) : (
        <div className="py-2 flex justify-center">
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 uppercase">
            {user.role[0]}
          </span>
        </div>
      )}

      {/* Navigation Items */}
      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                isActive
                  ? "bg-gradient-to-r from-purple-600/30 via-indigo-600/20 to-cyan-500/10 text-white border border-purple-500/40 shadow-sm"
                  : "text-slate-400 hover:text-slate-100 hover:bg-white/[0.04]"
              } ${collapsed ? "justify-center" : ""}`}
              title={collapsed ? item.label : undefined}
            >
              <Icon
                className={`w-5 h-5 shrink-0 transition-colors ${
                  isActive
                    ? "text-cyan-400"
                    : "text-slate-400 group-hover:text-slate-200"
                }`}
              />
              {!collapsed && (
                <div className="flex-1 flex items-center justify-between overflow-hidden">
                  <span className="truncate">{item.label}</span>
                  {item.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                        item.badge === "Live"
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 animate-pulse"
                          : "bg-white/10 text-slate-300"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer Profile Strip */}
      <div className="p-3 border-t border-white/10">
        <div
          className={`flex items-center gap-3 p-2 rounded-xl bg-white/[0.02] border border-white/5 ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-cyan-400 flex items-center justify-center text-white text-xs font-bold shrink-0">
            {user.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)}
          </div>
          {!collapsed && (
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-semibold text-white truncate">
                {user.name}
              </p>
              <p className="text-[11px] text-slate-400 truncate capitalize">
                {user.role}
              </p>
            </div>
          )}
          {!collapsed && (
            <Link
              href="/"
              className="p-1 rounded text-slate-400 hover:text-rose-400 transition-colors"
              title="Return to Home"
            >
              <LogOut className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>
    </aside>
  );
}
