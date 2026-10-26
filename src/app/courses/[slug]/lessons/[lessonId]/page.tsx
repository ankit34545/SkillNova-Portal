"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  BookOpen,
  Clock,
  CheckCircle2,
  Circle,
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Sparkles,
  Loader2,
  AlertCircle,
  Code2,
  FileText,
  Share2,
} from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import { useAuth } from "@/lib/auth-context";

interface LessonData {
  id: string;
  title: string;
  durationMinutes: number;
  orderIndex: number;
  content: string | null;
  isCompleted: boolean;
  module: {
    id: string;
    title: string;
  };
}

interface ModuleData {
  id: string;
  title: string;
  orderIndex: number;
  lessons: Array<{
    id: string;
    title: string;
    durationMinutes: number;
    orderIndex: number;
    isCompleted: boolean;
  }>;
}

export default function LessonLearningPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const lessonId = params?.lessonId as string;
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [course, setCourse] = useState<any>(null);
  const [lesson, setLesson] = useState<LessonData | null>(null);
  const [modules, setModules] = useState<ModuleData[]>([]);
  const [navigation, setNavigation] = useState<{ prev: any; next: any }>({ prev: null, next: null });
  const [progress, setProgress] = useState<{ completedLessonsCount: number; totalLessonsCount: number; percentage: number }>({
    completedLessonsCount: 0,
    totalLessonsCount: 0,
    percentage: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [togglingCompletion, setTogglingCompletion] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const fetchLessonData = async () => {
    if (!slug || !lessonId) return;
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/courses/${slug}/lessons/${lessonId}`);

      if (res.status === 401) {
        router.push(`/login?redirect=/courses/${slug}/lessons/${lessonId}`);
        return;
      }

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to load lesson.");
      }

      const data = await res.json();
      setCourse(data.course);
      setLesson(data.lesson);
      setModules(data.modules);
      setNavigation(data.navigation);
      setProgress(data.progress);
    } catch (err: any) {
      setError(err.message || "Failed to load lesson content.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push(`/login?redirect=/courses/${slug}/lessons/${lessonId}`);
      } else {
        fetchLessonData();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, lessonId, user, authLoading]);

  const handleToggleCompletion = async () => {
    if (!lesson) return;
    setTogglingCompletion(true);
    const newStatus = !lesson.isCompleted;

    try {
      const res = await fetch(`/api/courses/${slug}/lessons/${lessonId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isCompleted: newStatus }),
      });

      if (res.ok) {
        const data = await res.json();
        setLesson((prev) => prev ? { ...prev, isCompleted: data.isCompleted } : null);
        setProgress((prev) => ({
          ...prev,
          percentage: data.progressPercent,
          completedLessonsCount: data.completedCount,
        }));
        // Update module list item completion state locally
        setModules((prev) =>
          prev.map((mod) => ({
            ...mod,
            lessons: mod.lessons.map((l) =>
              l.id === lessonId ? { ...l, isCompleted: data.isCompleted } : l
            ),
          }))
        );
      }
    } catch (e) {
      console.error("Completion toggle error:", e);
    } finally {
      setTogglingCompletion(false);
    }
  };

  return (
    <AppShell
      breadcrumbs={[
        { label: "Course Curricula", href: "/courses" },
        { label: course?.title || "Course", href: `/courses/${slug}` },
        { label: lesson?.title || "Lesson" },
      ]}
    >
      <div className="relative">
        {/* Mobile Curriculum Drawer Toggle */}
        <div className="lg:hidden flex items-center justify-between p-3 mb-4 rounded-xl bg-midnight-900 border border-white/10">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-semibold text-white">Course Syllabus</span>
            <span className="text-[10px] font-mono text-cyan-400">
              {progress.percentage}% Done
            </span>
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="px-3 py-1 rounded-lg text-xs font-medium bg-white/10 hover:bg-white/15 text-white flex items-center gap-1.5"
          >
            {sidebarOpen ? <X className="w-3.5 h-3.5" /> : <Menu className="w-3.5 h-3.5" />}
            <span>{sidebarOpen ? "Close Syllabus" : "View Syllabus"}</span>
          </button>
        </div>

        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center space-y-3 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
            <p className="text-sm">Loading interactive lesson material...</p>
          </div>
        ) : error || !lesson ? (
          <div className="max-w-xl mx-auto my-12 p-8 rounded-3xl bg-midnight-900 border border-rose-500/30 text-center space-y-4">
            <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
            <h3 className="text-base font-bold text-white">Access Restricted</h3>
            <p className="text-xs text-rose-300 leading-relaxed">
              {error || "Could not access this lesson."}
            </p>
            <div className="pt-2 flex items-center justify-center gap-3">
              <Link
                href={`/courses/${slug}`}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/10 text-white hover:bg-white/15"
              >
                Back to Course Overview
              </Link>
              <Link
                href="/courses"
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-purple-600 to-cyan-500 text-white"
              >
                Browse All Courses
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Lesson Content (3 Columns) */}
            <div className="lg:col-span-3 space-y-6">
              {/* Lesson Header Banner */}
              <div className="p-6 sm:p-8 rounded-3xl bg-midnight-900 border border-white/10 shadow-xl space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/30">
                      {lesson.module.title}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{lesson.durationMinutes} mins</span>
                    </span>
                  </div>

                  {/* Completion Button */}
                  <button
                    onClick={handleToggleCompletion}
                    disabled={togglingCompletion}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                      lesson.isCompleted
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30"
                        : "bg-white/10 hover:bg-white/20 text-white border border-white/10"
                    }`}
                  >
                    {togglingCompletion ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : lesson.isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-400" />
                    )}
                    <span>{lesson.isCompleted ? "Completed" : "Mark as Complete"}</span>
                  </button>
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {lesson.title}
                </h1>
              </div>

              {/* Lesson Body */}
              <div className="p-6 sm:p-8 rounded-3xl bg-midnight-900 border border-white/10 space-y-6 leading-relaxed text-slate-200">
                <div className="space-y-4 text-sm sm:text-base">
                  <p className="text-slate-300 font-medium">
                    {lesson.content || "Interactive code and study materials for this curriculum unit."}
                  </p>
                </div>

                {/* Practical Interactive Code Snippet / Demonstration */}
                <div className="rounded-2xl bg-black/50 border border-white/10 overflow-hidden space-y-0">
                  <div className="px-4 py-2.5 bg-white/[0.04] border-b border-white/5 flex items-center justify-between text-xs text-slate-400">
                    <span className="font-mono flex items-center gap-2">
                      <Code2 className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Example Implementation</span>
                    </span>
                    <span className="text-[10px] uppercase font-mono text-purple-400">
                      {course.slug.includes("python")
                        ? "Python"
                        : course.slug.includes("java")
                        ? "Java"
                        : course.slug.includes("cpp")
                        ? "C++"
                        : "TypeScript"}
                    </span>
                  </div>
                  <pre className="p-4 sm:p-6 text-xs sm:text-sm font-mono overflow-x-auto text-emerald-300 leading-relaxed">
                    {course.slug.includes("python")
                      ? `# ${lesson.title}\ndef solve():\n    data = [1, 2, 3, 4, 5]\n    # Generator comprehension for zero memory overhead\n    result = [x * 2 for x in data if x % 2 != 0]\n    print("Processed stream:", result)\n\nif __name__ == "__main__":\n    solve()`
                      : course.slug.includes("java")
                      ? `// ${lesson.title}\npublic class Main {\n    public static void main(String[] args) {\n        var elements = java.util.List.of(1, 2, 3, 4, 5);\n        elements.stream()\n            .filter(n -> n % 2 != 0)\n            .map(n -> n * 2)\n            .forEach(System.out::println);\n    }\n}`
                      : course.slug.includes("cpp")
                      ? `// ${lesson.title}\n#include <iostream>\n#include <vector>\n#include <algorithm>\n\nint main() {\n    std::vector<int> nums = {1, 2, 3, 4, 5};\n    for (const auto& n : nums) {\n        if (n % 2 != 0) std::cout << n * 2 << "\\n";\n    }\n    return 0;\n}`
                      : `// ${lesson.title}\nexport async function handleRequest() {\n  const res = await fetch("/api/courses");\n  const data = await res.json();\n  console.log("Verified courses:", data.count);\n}`}
                  </pre>
                </div>
              </div>

              {/* Bottom Navigation Controls */}
              <div className="flex items-center justify-between pt-2">
                {navigation.prev ? (
                  <Link
                    href={`/courses/${slug}/lessons/${navigation.prev.id}`}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/15 text-white transition-colors flex items-center gap-2"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">Previous:</span>
                    <span className="truncate max-w-[140px] sm:max-w-[200px]">{navigation.prev.title}</span>
                  </Link>
                ) : (
                  <div />
                )}

                {navigation.next ? (
                  <Link
                    href={`/courses/${slug}/lessons/${navigation.next.id}`}
                    className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white shadow-glow-violet transition-all flex items-center gap-2"
                  >
                    <span className="hidden sm:inline">Next:</span>
                    <span className="truncate max-w-[140px] sm:max-w-[200px]">{navigation.next.title}</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <Link
                    href={`/courses/${slug}`}
                    className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 transition-all flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Curriculum Completed</span>
                  </Link>
                )}
              </div>
            </div>

            {/* Desktop / Mobile Syllabus Drawer (1 Column) */}
            <div
              className={`lg:block ${
                sidebarOpen ? "block" : "hidden"
              } lg:col-span-1 space-y-4`}
            >
              <div className="p-5 rounded-3xl bg-midnight-900 border border-white/10 space-y-4 sticky top-24">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div>
                    <h3 className="text-sm font-bold text-white">Course Syllabus</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {progress.completedLessonsCount} of {progress.totalLessonsCount} Completed
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold text-cyan-400">
                    {progress.percentage}%
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 transition-all"
                    style={{ width: `${progress.percentage}%` }}
                  />
                </div>

                <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
                  {modules.map((m, mIdx) => (
                    <div key={m.id} className="space-y-1.5">
                      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        {m.title}
                      </p>
                      <div className="space-y-1">
                        {m.lessons.map((l, lIdx) => {
                          const isCurrent = l.id === lessonId;
                          return (
                            <Link
                              key={l.id}
                              href={`/courses/${slug}/lessons/${l.id}`}
                              onClick={() => setSidebarOpen(false)}
                              className={`p-2.5 rounded-xl flex items-center justify-between text-xs transition-all group ${
                                isCurrent
                                  ? "bg-purple-600/30 text-white border border-purple-500/40"
                                  : "text-slate-300 hover:text-white hover:bg-white/[0.04]"
                              }`}
                            >
                              <div className="flex items-center gap-2 truncate pr-2">
                                {l.isCompleted ? (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                ) : (
                                  <Circle className="w-3.5 h-3.5 text-slate-500 shrink-0 group-hover:text-slate-400" />
                                )}
                                <span className="truncate">{l.title}</span>
                              </div>
                              <span className="text-[10px] text-slate-500 font-mono shrink-0">
                                {l.durationMinutes}m
                              </span>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
