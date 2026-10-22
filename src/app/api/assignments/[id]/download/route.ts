import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getAssignmentFile } from "@/lib/assignment-storage";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = getAuthenticatedSession(req);
    const roleHeader = req.headers.get("x-skillnova-role");
    const userRole = session ? session.role : roleHeader || "student";
    const currentUserId = session ? session.userId : req.nextUrl.searchParams.get("userId") || "usr-student-soniya";

    const submissionId = req.nextUrl.searchParams.get("submissionId");
    if (!submissionId) {
      return NextResponse.json({ error: "submissionId is required" }, { status: 400 });
    }

    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: { assignment: true },
    });

    if (!submission || submission.assignmentId !== params.id) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    // Authorization: Only the submission owner, assigned teacher, or admin can download the file
    const isOwner = submission.studentId === currentUserId;
    const isPrivileged = userRole === "teacher" || userRole === "host" || userRole === "admin";

    if (!isOwner && !isPrivileged) {
      return NextResponse.json(
        { error: "Forbidden: You are not authorized to download this submission file." },
        { status: 403 }
      );
    }

    if (!submission.fileKey) {
      return NextResponse.json({ error: "No file attached to this submission" }, { status: 404 });
    }

    const fileData = await getAssignmentFile(submission.fileKey);
    if (!fileData) {
      return NextResponse.json({ error: "File not found on storage disk" }, { status: 404 });
    }

    const downloadName = submission.fileName || "submission_attachment";
    
    // Return file with appropriate binary download headers
    return new NextResponse(fileData.buffer as any, {
      status: 200,
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${downloadName}"`,
        "Content-Length": fileData.buffer.length.toString(),
      },
    });
  } catch (err: any) {
    console.error("[/api/assignments/[id]/download GET]", err);
    return NextResponse.json({ error: err.message || "Failed to download file" }, { status: 500 });
  }
}
