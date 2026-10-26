import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/courses
 * Returns the four initial courses.
 * If user is authenticated, returns their enrollment status for each course.
 * Unauthenticated users can also browse published courses.
 */
export async function GET(req: NextRequest) {
  try {
    const session = getAuthenticatedSession(req);
    const userId = session?.userId;

    const courses = await prisma.course.findMany({
      where: session?.role === "admin" ? {} : { isPublished: true },
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        modules: {
          orderBy: { orderIndex: "asc" },
          include: {
            lessons: {
              orderBy: { orderIndex: "asc" },
              select: {
                id: true,
                title: true,
                durationMinutes: true,
                orderIndex: true,
              },
            },
          },
        },
        enrollments: userId
          ? {
              where: { userId },
              select: {
                id: true,
                progressPercent: true,
                enrolledAt: true,
              },
            }
          : false,
      },
      orderBy: { createdAt: "asc" },
    });

    const formatted = courses.map((c) => {
      const totalLessons = c.modules.reduce((sum, m) => sum + m.lessons.length, 0);
      const userEnrollment = c.enrollments && c.enrollments.length > 0 ? c.enrollments[0] : null;

      return {
        id: c.id,
        slug: c.slug,
        title: c.title,
        description: c.description,
        level: c.level,
        durationWeeks: c.durationWeeks,
        category: c.category,
        isPublished: c.isPublished,
        instructor: c.instructor
          ? {
              id: c.instructor.id,
              name: c.instructor.name,
              role: c.instructor.role,
            }
          : null,
        moduleCount: c.modules.length,
        lessonCount: totalLessons,
        modules: c.modules.map((m) => ({
          id: m.id,
          title: m.title,
          description: m.description,
          orderIndex: m.orderIndex,
          lessons: m.lessons,
        })),
        isEnrolled: Boolean(userEnrollment),
        enrollment: userEnrollment
          ? {
              id: userEnrollment.id,
              progressPercent: userEnrollment.progressPercent,
              enrolledAt: userEnrollment.enrolledAt,
            }
          : null,
      };
    });

    return NextResponse.json({
      courses: formatted,
      count: formatted.length,
    });
  } catch (error: any) {
    console.error("[/api/courses] Error fetching courses:", error);
    return NextResponse.json(
      { error: error.message || "Failed to retrieve courses" },
      { status: 500 }
    );
  }
}
