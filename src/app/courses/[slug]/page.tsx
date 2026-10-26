"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  BookOpen,
  Clock,
  GraduationCap,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Layers,
  Sparkles,
  Loader2,
  AlertCircle,
  FileText,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import { useAuth } from "@/lib/auth-context";

interface Lesson {
  id: string;
  title: string;
  durationMinutes: number;
  orderIndex: number;
  content: string | null;
}

interface Module {
  id: string;
  title: string;
  description: string | null;
  orderIndex: number;
  lessons: Lesson[];
}

interface CourseDetail {
  id: string;
  slug: string;
  title: string;
  description: string;
  level: string;
  durationWeeks: number;
  category: string;
  isPublished: boolean;
  instructor: {
    id: string;
    name: string;
    role: string;
  } | null;
  moduleCount: number;
  lessonCount: number;
  totalDurationMinutes: number;
  modules: Module[];
  isEnrolled: boolean;
  enrollment: {
    id: string;
    progressPercent: number;
    enrolledAt: string;
  } | null;
}

export default function CourseDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const router = useRouter();
  const { user } = useAuth();

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enrolling, setEnrolling] = useState(false);
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
  const [enrollmentNotice, setEnrollmentNotice] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const fetchCourse = async () => {
    if (!slug) return;
    try {
      const res = await fetch(`/api/courses/${slug}`);
      if (!res.ok) {
        if (res.status === 404) throw new Error("Course not found");
        throw new Error("Failed to load course details");
      }
      const data = await res.json();
      setCourse(data.course);

      // Expand first module by default
      if (data.course?.modules?.[0]) {
        setExpandedModules({ [data.course.modules[0].id]: true });
      }
    } catch (err: any) {
      setError(err.message || "Could not load course");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourse();
  }, [slug, user]);

  const toggleModule = (id: string) => {
    setExpandedModules((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleEnroll = async () => {
    if (!user) {
      router.push(`/login?redirect=/courses/${slug}`);
      return;
    }

    if (!course) return;

    setEnrolling(true);
    setEnrollmentNotice(null);

    try {
      const res = await fetch("/api/courses/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId: course.id }),
      });

      const data = await res.json();

      if (res.ok) {
        setEnrollmentNotice({
          type: "success",
          message: data.message || `Successfully enrolled in ${course.title}!`,
        });
        await fetchCourse();
      } else {
        setEnrollmentNotice({
          type: "error",
          message: data.error || "Enrollment failed. Please try again.",
        });
      }
    } catch (err: any) {
      setEnrollmentNotice({
        type: "error",
        message: err.message || "Enrollment request failed.",
      });
    } finally {
      setEnrolling(false);
    }
  };

  return (
    <AppShell
      breadcrumbs={[
        { label: "Course Curricula", href: "/courses" },
        { label: course?.title || "Course Details" },
      ]}
    >
      <div className="space-y-8 max-w-5xl mx-auto">
        <Link
          href="/courses"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Course Catalogue</span>
        </Link>

        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center space-y-3 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
            <p className="text-sm">Loading syllabus and curriculum details...</p>
          </div>
        ) : error || !course ? (
          <div className="p-8 rounded-3xl bg-midnight-900 border border-rose-500/30 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
            <h3 className="text-base font-semibold text-white">Course Not Available</h3>
            <p className="text-xs text-rose-300">{error || "The requested course could not be found."}</p>
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-white/10 text-white hover:bg-white/15"
            >
              Browse All Courses
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Hero Banner */}
            <div className="p-8 rounded-3xl bg-gradient-to-r from-purple-950/40 via-midnight-900 to-cyan-950/30 border border-white/10 space-y-6 shadow-2xl">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs font-mono px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                  {course.level} Level
                </span>
                <span className="text-xs font-mono px-3 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/30">
                  {course.category}
                </span>
                {course.isEnrolled && (
                  <span className="text-xs font-mono px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Enrolled</span>
                  </span>
                )}
              </div>

              <div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                  {course.title}
                </h1>
                <p className="mt-3 text-slate-300 text-sm sm:text-base leading-relaxed max-w-3xl">
                  {course.description}
                </p>
              </div>

              {/* Meta stats bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-white/10 text-xs">
                <div>
                  <span className="text-slate-400 block">Duration</span>
                  <span className="font-semibold text-white mt-0.5 block flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    {course.durationWeeks} Weeks
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Curriculum</span>
                  <span className="font-semibold text-white mt-0.5 block flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-purple-400" />
                    {course.moduleCount} Modules • {course.lessonCount} Lessons
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Total Runtime</span>
                  <span className="font-semibold text-white mt-0.5 block">
                    {Math.round(course.totalDurationMinutes / 60)} Hours
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Lead Faculty</span>
                  <span className="font-semibold text-white mt-0.5 block flex items-center gap-1">
                    <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
                    {course.instructor ? course.instructor.name : "SkillNova Faculty"}
                  </span>
                </div>
              </div>

              {/* Enrollment CTA */}
              <div className="pt-2 flex items-center gap-3">
                {course.isEnrolled ? (
                  <div className="flex items-center gap-3">
                    <div className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Enrolled in this Course</span>
                    </div>
                    <Link
                      href="/dashboard"
                      className="px-5 py-2.5 rounded-xl font-semibold text-xs text-white bg-white/10 hover:bg-white/15 border border-white/10 transition-colors flex items-center gap-1.5"
                    >
                      <span>Go to Student Dashboard</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ) : (
                  <button
                    onClick={handleEnroll}
                    disabled={enrolling}
                    className="px-6 py-3 rounded-xl font-semibold text-xs sm:text-sm text-white bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 shadow-glow-violet transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    {enrolling ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Enrolling into Course...</span>
                      </>
                    ) : (
                      <>
                        <span>Enroll Now in Course</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                )}
              </div>

              {enrollmentNotice && (
                <div
                  className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 ${
                    enrollmentNotice.type === "success"
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                      : "bg-rose-500/10 border-rose-500/30 text-rose-300"
                  }`}
                >
                  {enrollmentNotice.type === "success" ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  )}
                  <span>{enrollmentNotice.message}</span>
                </div>
              )}
            </div>

            {/* Modules & Syllabus */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-purple-400" />
                  <span>Curriculum & Module Syllabus</span>
                </h2>
                <span className="text-xs text-slate-400">
                  {course.modules.length} Modules Total
                </span>
              </div>

              <div className="space-y-3">
                {course.modules.map((mod, index) => {
                  const isExpanded = Boolean(expandedModules[mod.id]);
                  return (
                    <div
                      key={mod.id}
                      className="rounded-2xl bg-midnight-900 border border-white/10 overflow-hidden transition-colors"
                    >
                      <button
                        onClick={() => toggleModule(mod.id)}
                        className="w-full p-5 text-left flex items-center justify-between hover:bg-white/[0.02] transition-colors"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
                              Part {index + 1}
                            </span>
                            <h3 className="text-base font-semibold text-white">
                              {mod.title}
                            </h3>
                          </div>
                          {mod.description && (
                            <p className="text-xs text-slate-400">
                              {mod.description}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-xs text-slate-400 hidden sm:inline">
                            {mod.lessons.length} Lessons
                          </span>
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-slate-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="p-5 pt-0 border-t border-white/5 space-y-2 bg-black/20">
                          <div className="divide-y divide-white/5">
                            {mod.lessons.map((lesson, lIdx) => (
                              <div
                                key={lesson.id}
                                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                              >
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-mono text-slate-500">
                                      {index + 1}.{lIdx + 1}
                                    </span>
                                    <span className="text-xs font-medium text-slate-200">
                                      {lesson.title}
                                    </span>
                                  </div>
                                  {lesson.content && (
                                    <p className="text-[11px] text-slate-400 pl-5">
                                      {lesson.content}
                                    </p>
                                  )}
                                </div>
                                <span className="text-[11px] text-slate-500 font-mono shrink-0 flex items-center gap-1 sm:pl-4">
                                  <Clock className="w-3 h-3" />
                                  <span>{lesson.durationMinutes} min</span>
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
