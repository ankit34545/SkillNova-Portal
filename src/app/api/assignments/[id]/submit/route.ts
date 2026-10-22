import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { ClassroomRepository } from "@/lib/repository";
import { saveAssignmentFile } from "@/lib/assignment-storage";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = getAuthenticatedSession(req);
    const roleHeader = req.headers.get("x-skillnova-role");
    const userRole = session ? session.role : roleHeader || "student";

    // Verify assignment exists and is not CLOSED
    const assignment = await prisma.assignment.findUnique({
      where: { id: params.id },
    });

    if (!assignment) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
    }

    if (assignment.status === "CLOSED") {
      return NextResponse.json(
        { error: "This assignment is closed. New submissions are no longer accepted." },
        { status: 400 }
      );
    }

    // Check content-type: multipart/form-data for file upload OR application/json for text submission
    const contentType = req.headers.get("content-type") || "";
    let content: string | undefined = undefined;
    let fileKey: string | undefined = undefined;
    let fileName: string | undefined = undefined;
    let fileSize: number | undefined = undefined;
    let studentId = session ? session.userId : "usr-student-soniya";
    let studentName = session ? session.name : "Soniya Chauhan";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const contentField = formData.get("content")?.toString();
      const file = formData.get("file") as File | null;
      const customStudentId = formData.get("studentId")?.toString();
      const customStudentName = formData.get("studentName")?.toString();

      if (customStudentId) studentId = customStudentId;
      if (customStudentName) studentName = customStudentName;
      if (contentField) content = contentField.trim();

      if (file && file.size > 0) {
        // Enforce 10MB file size limit
        if (file.size > 10 * 1024 * 1024) {
          return NextResponse.json(
            { error: "File size exceeds maximum allowed limit (10MB)" },
            { status: 400 }
          );
        }

        // Validate allowed extensions (PDF, TXT, PY, JS, TS, ZIP, DOCX)
        const allowedExts = [".pdf", ".txt", ".py", ".js", ".ts", ".zip", ".docx", ".png", ".jpg"];
        const lowerName = file.name.toLowerCase();
        const isValidExt = allowedExts.some((ext) => lowerName.endsWith(ext));
        if (!isValidExt) {
          return NextResponse.json(
            { error: "Unsupported file extension. Allowed: PDF, TXT, PY, JS, TS, ZIP, DOCX, PNG, JPG" },
            { status: 400 }
          );
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const saved = await saveAssignmentFile(buffer, file.name);
        fileKey = saved.fileKey;
        fileName = file.name;
        fileSize = saved.fileSize;
      }
    } else {
      const body = await req.json();
      content = body.content?.trim();
      if (body.studentId) studentId = body.studentId;
      if (body.studentName) studentName = body.studentName;
    }

    if (!content && !fileKey) {
      return NextResponse.json(
        { error: "Submission must include text content or an uploaded file." },
        { status: 400 }
      );
    }

    await ClassroomRepository.ensureUser(studentId, studentName, "STUDENT");

    // Upsert submission (supports re-submission before grading or deadline)
    const existingSubmission = await prisma.submission.findUnique({
      where: {
        assignmentId_studentId: {
          assignmentId: params.id,
          studentId,
        },
      },
    });

    const isResubmission = Boolean(existingSubmission);

    const submission = await prisma.submission.upsert({
      where: {
        assignmentId_studentId: {
          assignmentId: params.id,
          studentId,
        },
      },
      update: {
        content: content !== undefined ? content : existingSubmission?.content,
        fileKey: fileKey !== undefined ? fileKey : existingSubmission?.fileKey,
        fileName: fileName !== undefined ? fileName : existingSubmission?.fileName,
        fileSize: fileSize !== undefined ? fileSize : existingSubmission?.fileSize,
        status: "SUBMITTED",
        updatedAt: new Date(),
      },
      create: {
        assignmentId: params.id,
        studentId,
        studentName,
        content,
        fileKey,
        fileName,
        fileSize,
        status: "SUBMITTED",
      },
    });

    return NextResponse.json(
      { submission, isResubmission },
      { status: isResubmission ? 200 : 201 }
    );
  } catch (err: any) {
    console.error("[/api/assignments/[id]/submit POST]", err);
    return NextResponse.json({ error: err.message || "Failed to submit assignment" }, { status: 500 });
  }
}
