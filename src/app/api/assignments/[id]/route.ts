import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = getAuthenticatedSession(req);
    const roleHeader = req.headers.get("x-skillnova-role");
    const userRole = session ? session.role : roleHeader || "student";
    const userId = session ? session.userId : req.nextUrl.searchParams.get("userId") || "usr-student-soniya";

    const assignment = await prisma.assignment.findUnique({
      where: { id: params.id },
      include: {
        meeting: {
          select: { roomId: true, title: true, hostName: true },
        },
        submissions: {
          where: userRole === "student" ? { studentId: userId } : undefined,
          include: {
            student: {
              select: { id: true, name: true, email: true },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!assignment) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
    }

    if (userRole === "student" && assignment.status === "DRAFT") {
      return NextResponse.json({ error: "Assignment not published" }, { status: 404 });
    }

    return NextResponse.json({ assignment });
  } catch (err: any) {
    console.error("[/api/assignments/[id] GET]", err);
    return NextResponse.json({ error: err.message || "Failed to fetch assignment" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = getAuthenticatedSession(req);
    const roleHeader = req.headers.get("x-skillnova-role");
    const userRole = session ? session.role : roleHeader;

    if (userRole !== "teacher" && userRole !== "host" && userRole !== "admin") {
      return NextResponse.json(
        { error: "Forbidden: Only instructors can edit assignments" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { title, description, maxMarks, dueAt, status } = body;

    const existing = await prisma.assignment.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
    }

    const updateData: any = {};
    if (title?.trim()) updateData.title = title.trim();
    if (description?.trim()) updateData.description = description.trim();
    if (maxMarks) {
      const marksNum = parseInt(maxMarks, 10);
      if (isNaN(marksNum) || marksNum <= 0) {
        return NextResponse.json({ error: "maxMarks must be positive" }, { status: 400 });
      }
      updateData.maxMarks = marksNum;
    }
    if (dueAt) updateData.dueAt = new Date(dueAt);
    if (status) updateData.status = status;

    const updated = await prisma.assignment.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json({ assignment: updated });
  } catch (err: any) {
    console.error("[/api/assignments/[id] PUT]", err);
    return NextResponse.json({ error: err.message || "Failed to update assignment" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = getAuthenticatedSession(req);
    const roleHeader = req.headers.get("x-skillnova-role");
    const userRole = session ? session.role : roleHeader;

    if (userRole !== "teacher" && userRole !== "host" && userRole !== "admin") {
      return NextResponse.json(
        { error: "Forbidden: Only instructors can delete assignments" },
        { status: 403 }
      );
    }

    await prisma.assignment.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[/api/assignments/[id] DELETE]", err);
    return NextResponse.json({ error: err.message || "Failed to delete assignment" }, { status: 500 });
  }
}
