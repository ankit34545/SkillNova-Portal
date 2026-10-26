import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/courses/[slug]/lessons/[lessonId]
 * Retrieves lesson details, content, module siblings, and progress for the authenticated user.
 * Access control:
 * - Must be authenticated
 * - Students must be enrolled in the course (or course must be taught by teacher, or user is admin)
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string; lessonId: string } }
) {
  try {
    const session = getAuthenticatedSession(req);
    if (!session || !session.userId) {
      return NextResponse.json(
        { error: "Authentication required to access course lessons." },
        { status: 401 }
      );
    }

    const { slug, lessonId } = params;

    // Verify course
    const course = await prisma.course.findUnique({
      where: { slug },
      include: {
        instructor: { select: { id: true, name: true } },
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
      },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found." }, { status: 404 });
    }

    // Authorization check
    if (session.role !== "admin" && course.instructorId !== session.userId) {
      const enrollment = await prisma.courseEnrollment.findUnique({
        where: {
          courseId_userId: {
            courseId: course.id,
            userId: session.userId,
          },
        },
      });

      if (!enrollment) {
        return NextResponse.json(
          { error: "Forbidden: You must be enrolled in this course to view lesson material." },
          { status: 403 }
        );
      }
    }

    // Find lesson
    const lesson = await prisma.courseLesson.findUnique({
      where: { id: lessonId },
      include: {
        module: {
          select: { id: true, title: true, orderIndex: true, courseId: true },
        },
      },
    });

    if (!lesson || lesson.module.courseId !== course.id) {
      return NextResponse.json({ error: "Lesson not found in this course." }, { status: 404 });
    }

    // Flatten all course lessons to calculate previous and next
    const allLessons: Array<{ id: string; title: string; moduleId: string; orderIndex: number }> = [];
    course.modules.forEach((mod) => {
      mod.lessons.forEach((l) => {
        allLessons.push({
          id: l.id,
          title: l.title,
          moduleId: mod.id,
          orderIndex: l.orderIndex,
        });
      });
    });

    const currentIndex = allLessons.findIndex((l) => l.id === lesson.id);
    const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
    const nextLesson = currentIndex >= 0 && currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

    // Fetch user progress for all lessons in this course to display syllabus status
    const completedRecords = await prisma.lessonProgress.findMany({
      where: {
        userId: session.userId,
        lessonId: { in: allLessons.map((l) => l.id) },
        isCompleted: true,
      },
      select: { lessonId: true },
    });
    const completedSet = new Set(completedRecords.map((r) => r.lessonId));

    return NextResponse.json({
      course: {
        id: course.id,
        slug: course.slug,
        title: course.title,
        level: course.level,
        instructor: course.instructor?.name || "SkillNova Faculty",
      },
      lesson: {
        id: lesson.id,
        title: lesson.title,
        durationMinutes: lesson.durationMinutes,
        orderIndex: lesson.orderIndex,
        content: lesson.content,
        isCompleted: completedSet.has(lesson.id),
        module: lesson.module,
      },
      navigation: {
        prev: prevLesson,
        next: nextLesson,
      },
      modules: course.modules.map((m) => ({
        id: m.id,
        title: m.title,
        orderIndex: m.orderIndex,
        lessons: m.lessons.map((l) => ({
          id: l.id,
          title: l.title,
          durationMinutes: l.durationMinutes,
          orderIndex: l.orderIndex,
          isCompleted: completedSet.has(l.id),
        })),
      })),
      progress: {
        completedLessonsCount: completedSet.size,
        totalLessonsCount: allLessons.length,
        percentage: Math.round((completedSet.size / (allLessons.length || 1)) * 100),
      },
    });
  } catch (error: any) {
    console.error("[/api/courses/[slug]/lessons/[lessonId] GET] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to retrieve lesson." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/courses/[slug]/lessons/[lessonId]
 * Body: { isCompleted: boolean }
 * Updates completion status for the authenticated student and recalculates course progress.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string; lessonId: string } }
) {
  try {
    const session = getAuthenticatedSession(req);
    if (!session || !session.userId) {
      return NextResponse.json(
        { error: "Authentication required to update lesson progress." },
        { status: 401 }
      );
    }

    const { slug, lessonId } = params;
    const body = await req.json().catch(() => ({}));
    const isCompleted = body.isCompleted !== undefined ? Boolean(body.isCompleted) : true;

    // Verify course & enrollment
    const course = await prisma.course.findUnique({
      where: { slug },
      include: {
        modules: {
          include: { lessons: { select: { id: true } } },
        },
      },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found." }, { status: 404 });
    }

    // Verify lesson exists in course
    const allLessonIds = course.modules.flatMap((m) => m.lessons.map((l) => l.id));
    if (!allLessonIds.includes(lessonId)) {
      return NextResponse.json({ error: "Lesson does not belong to this course." }, { status: 404 });
    }

    // Upsert lesson progress
    const progressRecord = await prisma.lessonProgress.upsert({
      where: {
        lessonId_userId: {
          lessonId,
          userId: session.userId,
        },
      },
      create: {
        lessonId,
        userId: session.userId,
        isCompleted,
        completedAt: isCompleted ? new Date() : null,
      },
      update: {
        isCompleted,
        completedAt: isCompleted ? new Date() : null,
      },
    });

    // Recalculate CourseEnrollment progressPercent
    const completedCount = await prisma.lessonProgress.count({
      where: {
        userId: session.userId,
        lessonId: { in: allLessonIds },
        isCompleted: true,
      },
    });

    const progressPercent = Math.min(
      100,
      Math.round((completedCount / (allLessonIds.length || 1)) * 100)
    );

    await prisma.courseEnrollment.updateMany({
      where: {
        courseId: course.id,
        userId: session.userId,
      },
      data: {
        progressPercent,
      },
    });

    return NextResponse.json({
      success: true,
      isCompleted: progressRecord.isCompleted,
      progressPercent,
      completedCount,
      totalCount: allLessonIds.length,
    });
  } catch (error: any) {
    console.error("[/api/courses/[slug]/lessons/[lessonId] POST] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update lesson progress." },
      { status: 500 }
    );
  }
}
