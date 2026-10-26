import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/teacher/courses
 * Strict Teacher Boundaries:
 * - If teacher, returns ONLY courses assigned to this teacher (instructorId === session.userId).
 * - If admin, returns all courses.
 * - Rejects students with 403 Forbidden.
 */
export async function GET(req: NextRequest) {
  try {
    const session = getAuthenticatedSession(req);
    if (!session) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 }
      );
    }

    if (session.role !== "teacher" && session.role !== "admin" && session.role !== "host") {
      return NextResponse.json(
        { error: "Forbidden: Teacher privileges required." },
        { status: 403 }
      );
    }

    const whereClause: any = {};
    if (session.role === "teacher" || session.role === "host") {
      whereClause.instructorId = session.userId;
    }

    const courses = await prisma.course.findMany({
      where: whereClause,
      include: {
        instructor: { select: { id: true, name: true, email: true } },
        modules: {
          orderBy: { orderIndex: "asc" },
          include: {
            lessons: {
              select: { id: true, title: true, durationMinutes: true },
            },
          },
        },
        enrollments: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
          orderBy: { enrolledAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formatted = courses.map((c) => ({
      id: c.id,
      slug: c.slug,
      title: c.title,
      description: c.description,
      level: c.level,
      durationWeeks: c.durationWeeks,
      category: c.category,
      isPublished: c.isPublished,
      instructor: c.instructor,
      moduleCount: c.modules.length,
      lessonCount: c.modules.reduce((sum, m) => sum + m.lessons.length, 0),
      enrolledStudentsCount: c.enrollments.length,
      students: c.enrollments.map((e) => ({
        id: e.id,
        userId: e.user.id,
        name: e.user.name,
        email: e.user.email,
        progressPercent: e.progressPercent,
        enrolledAt: e.enrolledAt,
      })),
    }));

    return NextResponse.json({
      courses: formatted,
      count: formatted.length,
      managedBy: session.name,
    });
  } catch (error: any) {
    console.error("[/api/teacher/courses GET] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to retrieve teacher courses." },
      { status: 500 }
    );
  }
}
