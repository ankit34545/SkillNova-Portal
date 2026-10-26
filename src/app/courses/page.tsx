"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen,
  Search,
  Clock,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Users,
  Layers,
  GraduationCap,
  ExternalLink,
  ChevronRight,
  Loader2,
  AlertCircle,
} from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";

interface CourseItem {
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
  isEnrolled: boolean;
  enrollment: {
    id: string;
    progressPercent: number;
    enrolledAt: string;
  } | null;
}

export default function CoursesPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [enrollingId, setEnrollingId] = useState<string | null>(null);
  const [enrollmentNotice, setEnrollmentNotice] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const fetchCourses = async () => {
    try {
      const res = await fetch("/api/courses");
      if (!res.ok) throw new Error("Failed to load courses");
      const data = await res.json();
      setCourses(data.courses || []);
    } catch (err: any) {
      setError(err.message || "Failed to load course catalogue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [user]);

  const handleEnroll = async (course: CourseItem) => {
    if (!user) {
      router.push(`/login?redirect=/courses`);
      return;
    }

    setEnrollingId(course.id);
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
        await fetchCourses();
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
      setEnrollingId(null);
    }
  };

  const categories = ["All", "Programming Languages", "Software Engineering", "Systems Programming", "Full-Stack Development"];

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.category.toLowerCase().includes(searchQuery.toLowerCase());

    if (selectedCategory === "All") return matchesSearch;
    return matchesSearch && course.category.toLowerCase() === selectedCategory.toLowerCase();
  });

  return (
    <AppShell breadcrumbs={[{ label: "Course Curricula" }]}>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-mono mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Core Engineering Curricula</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Verified Technical Courses
            </h1>
            <p className="mt-1 text-slate-400 text-sm max-w-2xl">
              Production-tested curricula with real database-backed module schedules, code labs, and faculty-led instruction.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/15 text-white border border-white/10 transition-colors flex items-center gap-2"
            >
              <BookOpen className="w-3.5 h-3.5 text-purple-400" />
              <span>My Enrolled Courses</span>
            </Link>
          </div>
        </div>

        {/* Notice alert */}
        {enrollmentNotice && (
          <div
            className={`p-4 rounded-2xl border flex items-center justify-between text-sm transition-all ${
              enrollmentNotice.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                : "bg-rose-500/10 border-rose-500/30 text-rose-300"
            }`}
          >
            <div className="flex items-center gap-2.5">
              {enrollmentNotice.type === "success" ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              )}
              <span>{enrollmentNotice.message}</span>
            </div>
            <button
              onClick={() => setEnrollmentNotice(null)}
              className="text-xs opacity-75 hover:opacity-100"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by course title or keyword (e.g. Python, Java, C++, React)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-midnight-900 border border-white/10 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-2 rounded-xl text-xs font-medium transition-colors shrink-0 ${
                  selectedCategory === cat
                    ? "bg-purple-600/30 text-white border border-purple-500/50"
                    : "text-slate-400 hover:text-white bg-midnight-900 border border-white/5"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Loading / Error States */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
            <p className="text-sm">Loading verified course catalogue...</p>
          </div>
        ) : error ? (
          <div className="p-8 rounded-3xl bg-midnight-900 border border-rose-500/30 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
            <p className="text-sm text-rose-300">{error}</p>
            <button
              onClick={fetchCourses}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/10 text-white hover:bg-white/15"
            >
              Retry
            </button>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="p-12 rounded-3xl bg-midnight-900 border border-white/10 text-center space-y-2">
            <BookOpen className="w-8 h-8 text-slate-500 mx-auto" />
            <h3 className="text-base font-semibold text-white">No courses match your criteria</h3>
            <p className="text-xs text-slate-400">Try adjusting your search terms or filter tags.</p>
          </div>
        ) : (
          /* Courses Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredCourses.map((course) => {
              const isEnrolled = course.isEnrolled;
              const isEnrolling = enrollingId === course.id;

              return (
                <div
                  key={course.id}
                  className="p-6 rounded-3xl bg-midnight-900/90 border border-white/10 hover:border-purple-500/40 transition-all flex flex-col justify-between group shadow-xl"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                        {course.level}
                      </span>
                      <span className="text-xs text-slate-400 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span>{course.durationWeeks} Weeks</span>
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {course.title}
                    </h3>

                    {course.instructor && (
                      <p className="text-xs text-purple-400 font-medium mt-1 flex items-center gap-1.5">
                        <GraduationCap className="w-3.5 h-3.5" />
                        <span>Instructor: {course.instructor.name}</span>
                      </p>
                    )}

                    <p className="text-xs text-slate-300 mt-3 line-clamp-3 leading-relaxed">
                      {course.description}
                    </p>

                    <div className="mt-4 flex items-center gap-4 text-xs text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-purple-400" />
                        <span>{course.moduleCount} Modules</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{course.lessonCount} Lessons</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                    <Link
                      href={`/courses/${course.slug}`}
                      className="text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1 transition-colors"
                    >
                      <span>View Syllabus</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>

                    <div className="flex items-center gap-2">
                      {isEnrolled ? (
                        <Link
                          href={`/courses/${course.slug}`}
                          className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/20 transition-all flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Enrolled • Continue</span>
                        </Link>
                      ) : (
                        <button
                          onClick={() => handleEnroll(course)}
                          disabled={isEnrolling}
                          className="px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white shadow-glow-violet transition-all flex items-center gap-1.5 disabled:opacity-50"
                        >
                          {isEnrolling ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>Enrolling...</span>
                            </>
                          ) : (
                            <>
                              <span>Enroll Course</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
