import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/courses
 * Returns all courses (including draft/unpublished) with statistics for administration.
 *
 * POST /api/admin/courses
 * Create or toggle publish status on courses.
 */
export async function GET(req: NextRequest) {
  try {
    const session = getAuthenticatedSession(req);
    if (!session || session.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden: Admin privileges required." },
        { status: 403 }
      );
    }

    const courses = await prisma.course.findMany({
      include: {
        instructor: { select: { id: true, name: true, email: true } },
        modules: {
          include: {
            lessons: { select: { id: true } },
          },
        },
        _count: {
          select: { enrollments: true },
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
      lessonCount: c.modules.reduce((acc, m) => acc + m.lessons.length, 0),
      enrollmentCount: c._count.enrollments,
      createdAt: c.createdAt,
    }));

    return NextResponse.json({ courses: formatted });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to retrieve admin courses." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = getAuthenticatedSession(req);
    if (!session || session.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden: Admin privileges required." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { action, courseId, isPublished, title, slug, description, level, durationWeeks, category, instructorId } = body;

    // Toggle publish
    if (action === "toggle_publish" && courseId) {
      const updated = await prisma.course.update({
        where: { id: courseId },
        data: { isPublished: Boolean(isPublished) },
      });
      return NextResponse.json({ success: true, course: updated });
    }

    // Create course
    if (title && slug && description) {
      const created = await prisma.course.create({
        data: {
          title,
          slug,
          description,
          level: level || "Beginner",
          durationWeeks: durationWeeks || 8,
          category: category || "Computer Science",
          isPublished: isPublished !== undefined ? Boolean(isPublished) : true,
          instructorId: instructorId || null,
        },
      });
      return NextResponse.json({ success: true, course: created });
    }

    return NextResponse.json(
      { error: "Invalid admin course operation parameters." },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to execute course admin operation." },
      { status: 500 }
    );
  }
}
