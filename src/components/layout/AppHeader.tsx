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
  LogOut,
  User as UserIcon,
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
  const { user, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);

  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loadingNotifs, setLoadingNotifs] = useState(false);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      setLoadingNotifs(true);
      const res = await fetch(`/api/notifications?userId=${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch {} finally {
      setLoadingNotifs(false);
    }
  };

  React.useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 15000);
      return () => clearInterval(interval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, user?.role]);

  const handleMarkAllRead = async () => {
    if (!user) return;
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-skillnova-role": user.role,
        },
        body: JSON.stringify({ markAll: true, userId: user.id }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {}
  };

  const handleMarkSingleRead = async (id: string) => {
    if (!user) return;
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-skillnova-role": user.role,
        },
        body: JSON.stringify({ notificationId: id }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {}
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-midnight-950/80 backdrop-blur-md border-b border-white/10 px-4 sm:px-6 flex items-center justify-between">
      {/* Left: Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-2 -ml-1 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 shrink-0 transition-colors"
            aria-label="Toggle Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="flex items-center gap-1.5 text-xs sm:text-sm min-w-0 truncate">
          <Link
            href="/dashboard"
            className="text-slate-400 hover:text-white transition-colors shrink-0 font-bold tracking-tight"
          >
            SkillNova
          </Link>
          {breadcrumbs && breadcrumbs.length > 0 && (
            <>
              <ChevronRight className="w-3 h-3 text-slate-600 shrink-0" />
              <span className="text-white font-medium truncate max-w-[120px] sm:max-w-[200px]">
                {breadcrumbs[breadcrumbs.length - 1].label}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Middle: Universal Search Bar (desktop only) */}
      <div className="hidden lg:flex items-center max-w-xs xl:max-w-md w-full mx-4">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search courses, live classes, doubts..."
            className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs sm:text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all"
          />
        </div>
      </div>

      {/* Right: Actions, Notifications, Profile/Login */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        {/* Live Classroom Quick Jump (Hidden on small mobile) */}
        <Link
          href="/meet"
          className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
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
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 px-1.5 py-0.2 rounded-full bg-cyan-400 text-midnight-950 font-bold text-[9px] ring-2 ring-midnight-950">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="fixed sm:absolute inset-x-2 sm:inset-x-auto right-0 sm:right-0 top-16 sm:top-auto sm:mt-2 sm:w-96 rounded-2xl bg-midnight-900 border border-white/10 shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-white">
                    Notification Center
                  </span>
                  {unreadCount > 0 && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
                      {unreadCount} New
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold"
                  >
                    Mark all as read
                  </button>
                )}
              </div>
              <div className="divide-y divide-white/5 max-h-72 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`py-3 px-2 rounded-xl transition-colors ${
                        !n.isRead ? "bg-cyan-500/[0.04]" : "hover:bg-white/[0.02]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          href={n.link || "/dashboard"}
                          onClick={() => {
                            setShowNotifications(false);
                            if (!n.isRead) handleMarkSingleRead(n.id);
                          }}
                          className="flex-1"
                        >
                          <p className={`text-xs flex items-center gap-1.5 ${!n.isRead ? "font-bold text-white" : "font-medium text-slate-300"}`}>
                            {!n.isRead && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />}
                            <span>{n.title}</span>
                          </p>
                          <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">
                            {n.message}
                          </p>
                        </Link>
                        <span className="text-[10px] text-slate-500 shrink-0 font-mono">
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-xs text-slate-400">
                    No notifications yet.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Account / Profile or Clear Login CTA */}
        <div className="relative shrink-0">
          {user ? (
            <>
              <button
                onClick={() => setShowAccountMenu(!showAccountMenu)}
                className="flex items-center gap-2 p-1 rounded-xl hover:bg-white/5 transition-colors"
                title="Account Menu"
              >
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-cyan-400 flex items-center justify-center text-white text-xs font-bold shadow-glow-violet shrink-0">
                  {user.name ? user.name[0] : "U"}
                </div>
                <div className="hidden lg:flex flex-col text-left">
                  <span className="text-xs font-medium text-slate-200 truncate max-w-[100px]">
                    {user.name.split(" ")[0]}
                  </span>
                  <span className="text-[10px] text-slate-400 uppercase font-mono">
                    {user.role}
                  </span>
                </div>
              </button>

              {showAccountMenu && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-midnight-900 border border-white/10 shadow-2xl p-4 z-50">
                  <div className="pb-3 border-b border-white/10 flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-cyan-400 flex items-center justify-center text-white font-bold text-sm shrink-0">
                      {user.name[0]}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-xs font-semibold text-white truncate">{user.name}</p>
                      <p className="text-[11px] text-slate-400 font-mono truncate">{user.email}</p>
                      <span className={`inline-block mt-1 text-[9px] font-mono px-2 py-0.5 rounded uppercase font-semibold ${
                        user.role === "admin"
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          : user.role === "teacher"
                          ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                          : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                      }`}>
                        {user.role}
                      </span>
                    </div>
                  </div>

                  <div className="pt-3">
                    <button
                      onClick={async () => {
                        setShowAccountMenu(false);
                        await logout();
                      }}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center gap-1.5">
              <span className="hidden sm:inline text-[11px] font-mono text-slate-400 bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
                Guest
              </span>
              <Link
                href="/login"
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 shadow-glow-violet transition-all flex items-center justify-center shrink-0 min-h-[34px]"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
