import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { ClassroomRepository } from "@/lib/repository";

export async function GET(req: NextRequest) {
  try {
    const session = getAuthenticatedSession(req);
    const roleHeader = req.headers.get("x-skillnova-role");
    const userRole = session ? session.role : roleHeader || "student";
    const userId = session ? session.userId : req.nextUrl.searchParams.get("userId") || "usr-student-soniya";

    const roomId = req.nextUrl.searchParams.get("roomId");

    // Fetch assignments for the target room or all published assignments
    const whereClause: any = {};
    if (roomId) {
      whereClause.meeting = { roomId };
    }

    // Students only see PUBLISHED or CLOSED assignments (no drafts)
    if (userRole === "student") {
      whereClause.status = { in: ["PUBLISHED", "CLOSED"] };
    }

    const assignments = await prisma.assignment.findMany({
      where: whereClause,
      include: {
        meeting: {
          select: { roomId: true, title: true, hostName: true },
        },
        submissions: {
          // If student, only include their own submission
          where: userRole === "student" ? { studentId: userId } : undefined,
          select: {
            id: true,
            studentId: true,
            studentName: true,
            status: true,
            marks: true,
            feedback: true,
            fileKey: true,
            fileName: true,
            fileSize: true,
            content: true,
            createdAt: true,
            updatedAt: true,
            gradedAt: true,
            gradedByName: true,
          },
        },
      },
      orderBy: { dueAt: "asc" },
    });

    return NextResponse.json({ assignments });
  } catch (err: any) {
    console.error("[/api/assignments GET]", err);
    return NextResponse.json({ error: err.message || "Failed to load assignments" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = getAuthenticatedSession(req);
    const roleHeader = req.headers.get("x-skillnova-role");
    const userRole = session ? session.role : roleHeader;

    // Teacher or Admin required to create assignments
    if (userRole !== "teacher" && userRole !== "host" && userRole !== "admin") {
      return NextResponse.json(
        { error: "Forbidden: Only teachers and administrators can create assignments." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { roomId, title, description, maxMarks, dueAt, status } = body;

    if (!title?.trim() || !description?.trim() || !dueAt) {
      return NextResponse.json(
        { error: "Title, description, and due date are required." },
        { status: 400 }
      );
    }

    const marksNum = parseInt(maxMarks, 10);
    if (isNaN(marksNum) || marksNum <= 0) {
      return NextResponse.json(
        { error: "Maximum marks must be a positive integer." },
        { status: 400 }
      );
    }

    // Resolve meeting (with fallback to any active meeting or default cohort)
    const targetRoomId = roomId || "ai-eng-live";
    let meeting = await prisma.meeting.findUnique({
      where: { roomId: targetRoomId },
    });

    if (!meeting) {
      meeting = await prisma.meeting.findFirst({
        where: { status: "ACTIVE" },
      });
    }

    if (!meeting) {
      meeting = await prisma.meeting.findFirst();
    }

    if (!meeting) {
      return NextResponse.json({ error: "Classroom meeting not found." }, { status: 404 });
    }

    const teacherId = session ? session.userId : "tch-201";
    const teacherName = session ? session.name : "Dr. Aryan Mehta";

    await ClassroomRepository.ensureUser(teacherId, teacherName, "TEACHER");

    const assignment = await prisma.assignment.create({
      data: {
        meetingId: meeting.id,
        title: title.trim(),
        description: description.trim(),
        maxMarks: marksNum,
        dueAt: new Date(dueAt),
        status: status === "DRAFT" ? "DRAFT" : "PUBLISHED",
        teacherId,
        teacherName,
      },
      include: {
        meeting: {
          select: { roomId: true, title: true },
        },
      },
    });

    return NextResponse.json({ assignment }, { status: 201 });
  } catch (err: any) {
    console.error("[/api/assignments POST]", err);
    return NextResponse.json({ error: err.message || "Failed to create assignment" }, { status: 500 });
  }
}
