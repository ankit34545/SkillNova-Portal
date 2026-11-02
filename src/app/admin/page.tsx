"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Shield,
  Users,
  BookOpen,
  Calendar,
  BarChart3,
  Settings,
  Lock,
  Search,
  Plus,
  Trash2,
  KeyRound,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Bell,
  MessageSquare,
  FileSpreadsheet,
} from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import { useAuth } from "@/lib/auth-context";

export default function AdminControlCenterPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"users" | "courses" | "announcements" | "settings" | "audit">("users");

  // Users state
  const [usersList, setUsersList] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [usersLoading, setUsersLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  // Modal forms
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserRole, setNewUserRole] = useState("STUDENT");

  // Reset password modal
  const [showResetModal, setShowResetModal] = useState(false);
  const [targetResetUser, setTargetResetUser] = useState<any | null>(null);
  const [newResetPassword, setNewResetPassword] = useState("");

  // System state
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [platformSettings, setPlatformSettings] = useState<any[]>([]);
  const [coursesList, setCoursesList] = useState<any[]>([]);

  // Announcement modal
  const [newAnnounceTitle, setNewAnnounceTitle] = useState("");
  const [newAnnounceContent, setNewAnnounceContent] = useState("");

  // Feedback notifications
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const showFeedback = (text: string, type: "success" | "error" = "success") => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 3500);
  };

  // Auth Protection
  useEffect(() => {
    if (!authLoading && (!user || user.role !== "admin")) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // Fetch Users
  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const q = encodeURIComponent(searchQuery);
      const r = roleFilter !== "ALL" ? `&role=${roleFilter}` : "";
      const res = await fetch(`/api/admin/users?query=${q}${r}`);
      if (res.ok) {
        const data = await res.json();
        setUsersList(data.users || []);
      }
    } catch {
      showFeedback("Failed to load users list.", "error");
    } finally {
      setUsersLoading(false);
    }
  };

  // Fetch Courses
  const fetchCourses = async () => {
    try {
      const res = await fetch("/api/admin/courses");
      if (res.ok) {
        const data = await res.json();
        setCoursesList(data.courses || []);
      }
    } catch {}
  };

  // Fetch System Details
  const fetchSystemData = async () => {
    try {
      const res = await fetch("/api/admin/system");
      if (res.ok) {
        const data = await res.json();
        setAnnouncements(data.announcements || []);
        setAuditLogs(data.auditLogs || []);
        setPlatformSettings(data.settings || []);
      }
    } catch {}
  };

  useEffect(() => {
    if (user && user.role === "admin") {
      fetchUsers();
      fetchCourses();
      fetchSystemData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, searchQuery, roleFilter]);

  // Handle Create User
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_user",
          name: newUserName,
          email: newUserEmail,
          password: newUserPassword,
          role: newUserRole,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        showFeedback(`User ${newUserName} created successfully.`);
        setShowCreateModal(false);
        setNewUserName("");
        setNewUserEmail("");
        setNewUserPassword("");
        fetchUsers();
      } else {
        showFeedback(data.error || "Failed to create user.", "error");
      }
    } catch {
      showFeedback("Network error creating user.", "error");
    }
  };

  // Handle Role Change
  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_user",
          userId,
          role: newRole,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        showFeedback("User role updated successfully.");
        fetchUsers();
      } else {
        showFeedback(data.error || "Failed to update role.", "error");
      }
    } catch {
      showFeedback("Network error updating role.", "error");
    }
  };

  // Handle Password Reset
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetResetUser || !newResetPassword) return;
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reset_password",
          userId: targetResetUser.id,
          newPassword: newResetPassword,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        showFeedback(`Password updated for ${targetResetUser.name}.`);
        setShowResetModal(false);
        setNewResetPassword("");
        setTargetResetUser(null);
      } else {
        showFeedback(data.error || "Password reset failed.", "error");
      }
    } catch {
      showFeedback("Network error resetting password.", "error");
    }
  };

  // Handle Delete User
  const handleDeleteUser = async (targetUser: any) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete user "${targetUser.name}" (${targetUser.email})? This action cannot be undone.`
    );
    if (!confirmed) return;

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete_user",
          userId: targetUser.id,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        showFeedback(`User ${targetUser.name} deleted.`);
        fetchUsers();
      } else {
        showFeedback(data.error || "Deletion prohibited.", "error");
      }
    } catch {
      showFeedback("Network error deleting user.", "error");
    }
  };

  // Toggle Course Publish
  const handleToggleCoursePublish = async (courseId: string, currentStatus: boolean) => {
    try {
      const res = await fetch("/api/admin/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "toggle_publish",
          courseId,
          isPublished: !currentStatus,
        }),
      });
      if (res.ok) {
        showFeedback("Course status updated.");
        fetchCourses();
      }
    } catch {
      showFeedback("Network error updating course.", "error");
    }
  };

  // Create Announcement
  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/system", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_announcement",
          title: newAnnounceTitle,
          content: newAnnounceContent,
        }),
      });
      if (res.ok) {
        showFeedback("Announcement published.");
        setNewAnnounceTitle("");
        setNewAnnounceContent("");
        fetchSystemData();
      }
    } catch {
      showFeedback("Failed to post announcement.", "error");
    }
  };

  if (!user || user.role !== "admin") {
    return null;
  }

  return (
    <AppShell breadcrumbs={[{ label: "Admin Control Center" }]}>
      <div className="space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-midnight-900 border border-white/10 shadow-xl">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono mb-2">
              <Shield className="w-3.5 h-3.5" />
              <span>Full Administrative Control Center</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              SkillNova Administrator Console
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Manage accounts, courses, global announcements, and system audit logs.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/codinglab"
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-colors flex items-center gap-2"
            >
              <span>CodingLab IDE</span>
            </Link>
          </div>
        </div>

        {feedback && (
          <div
            className={`p-3.5 rounded-xl text-xs font-medium flex items-center gap-2 ${
              feedback.type === "success"
                ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-300"
                : "bg-rose-500/15 border border-rose-500/30 text-rose-300"
            }`}
          >
            {feedback.type === "success" ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
            <span>{feedback.text}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-white/10 overflow-x-auto pb-2">
          {[
            { id: "users", label: "User Accounts", icon: Users },
            { id: "courses", label: "Courses & Curricula", icon: BookOpen },
            { id: "announcements", label: "Announcements", icon: Bell },
            { id: "settings", label: "Platform Settings", icon: Settings },
            { id: "audit", label: "Audit Logs", icon: Shield },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-white/15 text-white border border-white/20 shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: USER ACCOUNTS */}
        {activeTab === "users" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-midnight-900/60 p-4 rounded-2xl border border-white/10">
              <div className="flex items-center gap-3 w-full sm:w-auto flex-1">
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search name or email..."
                    className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-midnight-950 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="bg-midnight-950 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none"
                >
                  <option value="ALL">All Roles</option>
                  <option value="STUDENT">Student</option>
                  <option value="TEACHER">Teacher</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>

              <button
                onClick={() => setShowCreateModal(true)}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create User</span>
              </button>
            </div>

            {/* Users Table */}
            <div className="rounded-2xl border border-white/10 overflow-hidden bg-midnight-900/40">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-white/5 border-b border-white/10 text-slate-400 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="p-3.5">Name</th>
                      <th className="p-3.5">Email</th>
                      <th className="p-3.5">Role</th>
                      <th className="p-3.5">Enrolled</th>
                      <th className="p-3.5">Joined</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-mono">
                    {usersList.map((u) => (
                      <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="p-3.5 font-sans font-semibold text-white">{u.name}</td>
                        <td className="p-3.5 text-slate-400">{u.email}</td>
                        <td className="p-3.5">
                          <select
                            value={u.role}
                            onChange={(e) => handleRoleChange(u.id, e.target.value)}
                            className="bg-midnight-950 border border-white/15 rounded-lg px-2 py-1 text-[11px] text-cyan-300 font-semibold focus:outline-none"
                          >
                            <option value="STUDENT">STUDENT</option>
                            <option value="TEACHER">TEACHER</option>
                            <option value="ADMIN">ADMIN</option>
                          </select>
                        </td>
                        <td className="p-3.5 text-slate-400">{u._count?.enrollments ?? 0} courses</td>
                        <td className="p-3.5 text-slate-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                        <td className="p-3.5 text-right font-sans">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setTargetResetUser(u);
                                setShowResetModal(true);
                              }}
                              title="Reset Password"
                              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition-colors"
                            >
                              <KeyRound className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(u)}
                              title="Delete Account"
                              className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {usersList.length === 0 && !usersLoading && (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-500">
                          No accounts match your query.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: COURSES & CURRICULA */}
        {activeTab === "courses" && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-white/10 overflow-hidden bg-midnight-900/40">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-white/5 border-b border-white/10 text-slate-400 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="p-3.5">Course Title</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5">Modules / Lessons</th>
                    <th className="p-3.5">Enrollments</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {coursesList.map((c) => (
                    <tr key={c.id} className="hover:bg-white/[0.02]">
                      <td className="p-3.5 font-semibold text-white">{c.title}</td>
                      <td className="p-3.5 text-slate-400">{c.category}</td>
                      <td className="p-3.5 text-slate-400 font-mono">
                        {c.moduleCount} modules • {c.lessonCount} lessons
                      </td>
                      <td className="p-3.5 font-mono text-cyan-300">{c.enrollmentCount} students</td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            c.isPublished
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                              : "bg-slate-500/20 text-slate-400 border border-slate-500/30"
                          }`}
                        >
                          {c.isPublished ? "PUBLISHED" : "DRAFT"}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => handleToggleCoursePublish(c.id, c.isPublished)}
                          className="px-3 py-1 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/15 text-white transition-colors"
                        >
                          {c.isPublished ? "Unpublish" : "Publish"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: ANNOUNCEMENTS */}
        {activeTab === "announcements" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 p-5 rounded-2xl bg-midnight-900 border border-white/10 space-y-4">
              <h3 className="text-sm font-bold text-white">Create Institutional Notice</h3>
              <form onSubmit={handleCreateAnnouncement} className="space-y-3">
                <input
                  type="text"
                  required
                  value={newAnnounceTitle}
                  onChange={(e) => setNewAnnounceTitle(e.target.value)}
                  placeholder="Notice title..."
                  className="w-full px-3 py-2 bg-midnight-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                />
                <textarea
                  required
                  rows={4}
                  value={newAnnounceContent}
                  onChange={(e) => setNewAnnounceContent(e.target.value)}
                  placeholder="Announcement body..."
                  className="w-full px-3 py-2 bg-midnight-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                />
                <button
                  type="submit"
                  className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-xl text-xs transition-colors"
                >
                  Publish Notice
                </button>
              </form>
            </div>

            <div className="md:col-span-2 space-y-3">
              {announcements.map((a) => (
                <div key={a.id} className="p-4 rounded-2xl bg-midnight-900/60 border border-white/10 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white">{a.title}</h4>
                    <span className="text-[10px] text-slate-500">{new Date(a.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{a.content}</p>
                </div>
              ))}
              {announcements.length === 0 && (
                <div className="p-8 text-center text-slate-500 text-xs">No active announcements.</div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: PLATFORM SETTINGS */}
        {activeTab === "settings" && (
          <div className="p-6 rounded-2xl bg-midnight-900 border border-white/10 space-y-4">
            <h3 className="text-sm font-bold text-white">System Runtime Configuration</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-midnight-950 border border-white/10 space-y-1">
                <span className="text-slate-400 font-medium">Bcrypt Hashing Salt Cost</span>
                <p className="font-mono text-cyan-300 font-bold">12 (Hardened Institutional Cost)</p>
              </div>
              <div className="p-4 rounded-xl bg-midnight-950 border border-white/10 space-y-1">
                <span className="text-slate-400 font-medium">Session Token Security</span>
                <p className="font-mono text-cyan-300 font-bold">HS256 HttpOnly Secure Cookies</p>
              </div>
              <div className="p-4 rounded-xl bg-midnight-950 border border-white/10 space-y-1">
                <span className="text-slate-400 font-medium">LiveKit SFU Signaling</span>
                <p className="font-mono text-cyan-300 font-bold">WebSocket Auto-Reconnecting Mesh</p>
              </div>
              <div className="p-4 rounded-xl bg-midnight-950 border border-white/10 space-y-1">
                <span className="text-slate-400 font-medium">CodingLab Engine</span>
                <p className="font-mono text-cyan-300 font-bold">Monaco VS Code Sandbox</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: AUDIT LOGS */}
        {activeTab === "audit" && (
          <div className="rounded-2xl border border-white/10 overflow-hidden bg-midnight-900/40">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-white/5 border-b border-white/10 text-slate-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="p-3.5">Timestamp</th>
                  <th className="p-3.5">Admin</th>
                  <th className="p-3.5">Action</th>
                  <th className="p-3.5">Entity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono text-[11px]">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/[0.02]">
                    <td className="p-3.5 text-slate-500">{new Date(log.createdAt).toLocaleString()}</td>
                    <td className="p-3.5 font-sans font-medium text-white">{log.admin?.name || log.adminId}</td>
                    <td className="p-3.5 text-cyan-300 font-bold">{log.action}</td>
                    <td className="p-3.5 text-slate-400">{log.targetType}</td>
                  </tr>
                ))}
                {auditLogs.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-slate-500 font-sans">
                      No administrative audit records logged yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* MODAL: Create User */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 bg-midnight-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-midnight-900 border border-white/15 rounded-3xl p-6 shadow-2xl space-y-4">
              <h3 className="text-base font-bold text-white">Create User Account</h3>
              <form onSubmit={handleCreateUser} className="space-y-3">
                <div>
                  <label className="text-xs text-slate-400">Full Name</label>
                  <input
                    type="text"
                    required
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    className="w-full px-3 py-2 bg-midnight-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400">Institutional Email</label>
                  <input
                    type="email"
                    required
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-midnight-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400">Initial Password (min 8 chars)</label>
                  <input
                    type="password"
                    required
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-midnight-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400">Assign Role</label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value)}
                    className="w-full px-3 py-2 bg-midnight-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none"
                  >
                    <option value="STUDENT">STUDENT</option>
                    <option value="TEACHER">TEACHER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white"
                  >
                    Save Account
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: Reset Password */}
        {showResetModal && targetResetUser && (
          <div className="fixed inset-0 z-50 bg-midnight-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-sm bg-midnight-900 border border-white/15 rounded-3xl p-6 shadow-2xl space-y-4">
              <h3 className="text-base font-bold text-white">Reset Password</h3>
              <p className="text-xs text-slate-400">
                Updating credentials for <strong className="text-white">{targetResetUser.name}</strong>.
              </p>
              <form onSubmit={handleResetPassword} className="space-y-3">
                <input
                  type="password"
                  required
                  placeholder="New password (min 8 chars)..."
                  value={newResetPassword}
                  onChange={(e) => setNewResetPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-midnight-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none"
                />
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowResetModal(false);
                      setTargetResetUser(null);
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white"
                  >
                    Update Password
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
