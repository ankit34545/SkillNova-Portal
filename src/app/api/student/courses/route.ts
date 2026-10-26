import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/student/courses
 * Returns the authenticated student's enrolled courses directly from PostgreSQL.
 * Strictly checks session and prevents client spoofing.
 */
export async function GET(req: NextRequest) {
  try {
    const session = getAuthenticatedSession(req);
    if (!session || !session.userId) {
      return NextResponse.json(
        { error: "Authentication required to view student courses." },
        { status: 401 }
      );
    }

    const enrollments = await prisma.courseEnrollment.findMany({
      where: { userId: session.userId },
      include: {
        course: {
          include: {
            instructor: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            modules: {
              orderBy: { orderIndex: "asc" },
              include: {
                lessons: {
                  orderBy: { orderIndex: "asc" },
                  select: { id: true, title: true, durationMinutes: true },
                },
              },
            },
          },
        },
      },
      orderBy: { enrolledAt: "desc" },
    });

    const courses = enrollments.map((enr) => {
      const c = enr.course;
      const totalLessons = c.modules.reduce((sum, m) => sum + m.lessons.length, 0);

      return {
        enrollmentId: enr.id,
        courseId: c.id,
        slug: c.slug,
        title: c.title,
        description: c.description,
        level: c.level,
        durationWeeks: c.durationWeeks,
        category: c.category,
        instructor: c.instructor ? c.instructor.name : "SkillNova Faculty",
        totalModules: c.modules.length,
        totalLessons,
        progressPercent: enr.progressPercent,
        enrolledAt: enr.enrolledAt,
        modules: c.modules.map((m) => ({
          id: m.id,
          title: m.title,
          lessonCount: m.lessons.length,
          lessons: m.lessons,
        })),
      };
    });

    return NextResponse.json({
      courses,
      totalCount: courses.length,
    });
  } catch (error: any) {
    console.error("[/api/student/courses] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to retrieve enrolled courses" },
      { status: 500 }
    );
  }
}
