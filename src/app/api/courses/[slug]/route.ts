import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/courses/[slug]
 * Retrieves details, modules, and lessons for a specific course.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const session = getAuthenticatedSession(req);
    const userId = session?.userId;

    const course = await prisma.course.findUnique({
      where: { slug },
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
    });

    if (!course) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      );
    }

    if (!course.isPublished && session?.role !== "admin" && session?.role !== "teacher") {
      return NextResponse.json(
        { error: "Course is currently unpublished" },
        { status: 403 }
      );
    }

    const totalLessons = course.modules.reduce((sum, m) => sum + m.lessons.length, 0);
    const totalMinutes = course.modules.reduce(
      (sum, m) => sum + m.lessons.reduce((lSum, l) => lSum + l.durationMinutes, 0),
      0
    );
    const userEnrollment = course.enrollments && course.enrollments.length > 0 ? course.enrollments[0] : null;

    return NextResponse.json({
      course: {
        id: course.id,
        slug: course.slug,
        title: course.title,
        description: course.description,
        level: course.level,
        durationWeeks: course.durationWeeks,
        category: course.category,
        isPublished: course.isPublished,
        instructor: course.instructor
          ? {
              id: course.instructor.id,
              name: course.instructor.name,
              role: course.instructor.role,
            }
          : null,
        moduleCount: course.modules.length,
        lessonCount: totalLessons,
        totalDurationMinutes: totalMinutes,
        modules: course.modules.map((m) => ({
          id: m.id,
          title: m.title,
          description: m.description,
          orderIndex: m.orderIndex,
          lessons: m.lessons.map((l) => ({
            id: l.id,
            title: l.title,
            durationMinutes: l.durationMinutes,
            orderIndex: l.orderIndex,
            content: l.content,
          })),
        })),
        isEnrolled: Boolean(userEnrollment),
        enrollment: userEnrollment
          ? {
              id: userEnrollment.id,
              progressPercent: userEnrollment.progressPercent,
              enrolledAt: userEnrollment.enrolledAt,
            }
          : null,
      },
    });
  } catch (error: any) {
    console.error("[/api/courses/[slug]] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to retrieve course details" },
      { status: 500 }
    );
  }
}
