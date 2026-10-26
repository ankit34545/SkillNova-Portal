import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * POST /api/courses/enroll
 * Body: { courseId?: string, slug?: string }
 * Enrolls the currently authenticated student into the course.
 * Rejects unauthenticated requests with 401.
 * Prevents duplicate enrollments safely.
 */
export async function POST(req: NextRequest) {
  try {
    const session = getAuthenticatedSession(req);
    if (!session || !session.userId) {
      return NextResponse.json(
        { error: "Authentication required. Please sign in to enroll." },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { courseId, slug } = body;

    if (!courseId && !slug) {
      return NextResponse.json(
        { error: "Missing course identifier (courseId or slug required)." },
        { status: 400 }
      );
    }

    // Lookup course
    const course = await prisma.course.findFirst({
      where: courseId ? { id: courseId } : { slug },
      include: {
        modules: true,
      },
    });

    if (!course) {
      return NextResponse.json(
        { error: "Course not found." },
        { status: 404 }
      );
    }

    if (!course.isPublished && session.role !== "admin" && session.role !== "teacher") {
      return NextResponse.json(
        { error: "Cannot enroll in an unpublished course." },
        { status: 403 }
      );
    }

    // Check if already enrolled
    const existing = await prisma.courseEnrollment.findUnique({
      where: {
        courseId_userId: {
          courseId: course.id,
          userId: session.userId,
        },
      },
    });

    if (existing) {
      return NextResponse.json({
        message: "Already enrolled in this course.",
        alreadyEnrolled: true,
        enrollment: existing,
      });
    }

    // Create enrollment record
    const enrollment = await prisma.courseEnrollment.create({
      data: {
        courseId: course.id,
        userId: session.userId,
        progressPercent: 0,
      },
    });

    // Also create in-app notification for the student
    try {
      await prisma.notification.create({
        data: {
          userId: session.userId,
          title: "Enrollment Confirmed",
          message: `You have successfully enrolled in ${course.title}. Start exploring your course curriculum!`,
          type: "SYSTEM_ANNOUNCEMENT",
          link: `/courses/${course.slug}`,
          dedupeKey: `enrollment-${session.userId}-${course.id}`,
        },
      });
    } catch (notifErr) {
      console.warn("Enrollment notification warning:", notifErr);
    }

    return NextResponse.json({
      success: true,
      message: `Enrolled successfully in ${course.title}!`,
      alreadyEnrolled: false,
      enrollment: {
        id: enrollment.id,
        courseId: enrollment.courseId,
        userId: enrollment.userId,
        progressPercent: enrollment.progressPercent,
        enrolledAt: enrollment.enrolledAt,
      },
    });
  } catch (error: any) {
    console.error("[/api/courses/enroll] Enrollment error:", error);
    return NextResponse.json(
      { error: error.message || "Enrollment failed." },
      { status: 500 }
    );
  }
}
