import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = getAuthenticatedSession(req);
    const roleHeader = req.headers.get("x-skillnova-role");
    const userRole = session ? session.role : roleHeader;

    if (userRole !== "teacher" && userRole !== "host" && userRole !== "admin") {
      return NextResponse.json(
        { error: "Forbidden: Only instructors and administrators can grade submissions." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { submissionId, marks, feedback } = body;

    if (!submissionId) {
      return NextResponse.json({ error: "submissionId is required." }, { status: 400 });
    }

    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: { assignment: true },
    });

    if (!submission || submission.assignmentId !== params.id) {
      return NextResponse.json({ error: "Submission not found for this assignment." }, { status: 404 });
    }

    const marksNum = parseInt(marks, 10);
    if (isNaN(marksNum) || marksNum < 0) {
      return NextResponse.json(
        { error: "Marks must be a non-negative integer." },
        { status: 400 }
      );
    }

    if (marksNum > submission.assignment.maxMarks) {
      return NextResponse.json(
        { error: `Marks cannot exceed the maximum allowed marks (${submission.assignment.maxMarks}).` },
        { status: 400 }
      );
    }

    const teacherId = session ? session.userId : "tch-201";
    const teacherName = session ? session.name : "Dr. Aryan Mehta";

    const updatedSubmission = await prisma.submission.update({
      where: { id: submissionId },
      data: {
        marks: marksNum,
        feedback: feedback?.trim() || null,
        status: "GRADED",
        gradedAt: new Date(),
        gradedById: teacherId,
        gradedByName: teacherName,
      },
      include: {
        student: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json({ submission: updatedSubmission });
  } catch (err: any) {
    console.error("[/api/assignments/[id]/grade POST]", err);
    return NextResponse.json({ error: err.message || "Failed to grade submission" }, { status: 500 });
  }
}
