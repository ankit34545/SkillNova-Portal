import { NextRequest, NextResponse } from "next/server";
import { ClassroomRepository } from "@/lib/repository";
import {
  getMaterials,
  addMaterial,
  getMessages,
  addMessage,
} from "@/lib/meet-store";
import { getAuthenticatedSession } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: { roomId: string } }
) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const roomId = params.roomId;

  // Step 2 & 3: Validate room existence before returning resources
  const meeting = await ClassroomRepository.getMeeting(roomId);
  if (!meeting) {
    return NextResponse.json({ error: "Classroom not found." }, { status: 404 });
  }

  if (type === "doubts") return NextResponse.json({ doubts: await ClassroomRepository.getDoubts(roomId) });
  if (type === "notes") return NextResponse.json({ notes: await ClassroomRepository.getNotes(roomId) });
  if (type === "materials") return NextResponse.json({ materials: getMaterials(roomId) });
  if (type === "whiteboard") return NextResponse.json({ pages: await ClassroomRepository.getWhiteboard(roomId) });
  if (type === "messages") return NextResponse.json({ messages: getMessages(roomId) });
  if (type === "polls") return NextResponse.json({ polls: await ClassroomRepository.getPolls(roomId) });
  if (type === "attendance") return NextResponse.json({ attendance: await ClassroomRepository.getAttendance(roomId) });

  const [doubts, notes, whiteboard, polls, attendance] = await Promise.all([
    ClassroomRepository.getDoubts(roomId),
    ClassroomRepository.getNotes(roomId),
    ClassroomRepository.getWhiteboard(roomId),
    ClassroomRepository.getPolls(roomId),
    ClassroomRepository.getAttendance(roomId),
  ]);

  return NextResponse.json({
    doubts,
    notes,
    materials: getMaterials(roomId),
    whiteboard,
    messages: getMessages(roomId),
    polls,
    attendance,
  });
}

export async function POST(
  req: NextRequest,
  { params }: { params: { roomId: string } }
) {
  try {
    const roomId = params.roomId;
    const meeting = await ClassroomRepository.getMeeting(roomId);
    if (!meeting) {
      return NextResponse.json({ error: "Room not found." }, { status: 404 });
    }

    const body = await req.json();
    const { action } = body;

    if (action === "add-doubt") {
      const doubt = await ClassroomRepository.addDoubt(roomId, {
        studentId: body.studentId || "student-anon",
        studentName: body.studentName || "Anonymous Student",
        question: body.question,
        priority: body.priority || "normal",
        codeSnippet: body.codeSnippet,
      });
      return NextResponse.json({ doubt }, { status: 201 });
    }

    if (action === "answer-doubt") {
      const doubt = await ClassroomRepository.answerDoubt(roomId, body.doubtId, {
        authorName: body.authorName,
        authorRole: body.authorRole || "teacher",
        text: body.text,
      });
      return NextResponse.json({ doubt });
    }

    if (action === "pin-doubt") {
      const doubt = await ClassroomRepository.togglePinDoubt(roomId, body.doubtId);
      return NextResponse.json({ doubt });
    }

    if (action === "save-note") {
      const note = await ClassroomRepository.saveNote(roomId, {
        id: body.id,
        authorId: body.authorId,
        authorName: body.authorName,
        title: body.title,
        content: body.content,
        isShared: !!body.isShared,
      });
      return NextResponse.json({ note });
    }

    if (action === "add-material") {
      const session = getAuthenticatedSession(req);
      const isTeacherOrHost = (session && (session.isHost || session.role === "host" || session.role === "teacher" || session.role === "admin")) || body.authorRole === "teacher";
      if (!isTeacherOrHost) {
        return NextResponse.json({ error: "Unauthorized: only teachers can publish classroom materials" }, { status: 403 });
      }
      const material = addMaterial(roomId, {
        title: body.title,
        fileType: body.fileType || "pdf",
        fileUrl: body.fileUrl || "#",
        sizeBytes: body.sizeBytes || 1024,
        pageCount: body.pageCount || 1,
        uploadedBy: session?.name || body.uploadedBy || "Teacher",
      });
      return NextResponse.json({ material }, { status: 201 });
    }

    if (action === "add-stroke") {
      const stroke = await ClassroomRepository.addWhiteboardStroke(roomId, body.pageId || "board-1", body.stroke);
      return NextResponse.json({ stroke }, { status: 201 });
    }

    if (action === "send-message") {
      const message = addMessage(roomId, {
        senderId: body.senderId,
        senderName: body.senderName,
        senderRole: body.senderRole,
        text: body.text,
        type: body.type || "text",
        emoji: body.emoji,
      });
      return NextResponse.json({ message }, { status: 201 });
    }

    if (action === "create-poll") {
      const session = getAuthenticatedSession(req);
      const isInstructor = (session && (session.isHost || session.role === "host" || session.role === "teacher" || session.role === "admin")) || body.authorRole === "teacher";
      if (!isInstructor) {
        return NextResponse.json({ error: "Unauthorized: only teachers or hosts can launch live polls" }, { status: 403 });
      }
      const poll = await ClassroomRepository.createPoll(roomId, body.question, body.options, body.createdBy);
      return NextResponse.json({ poll }, { status: 201 });
    }

    if (action === "vote-poll") {
      const poll = await ClassroomRepository.votePoll(roomId, body.pollId, body.participantId, body.optionIndex);
      return NextResponse.json({ poll });
    }

    if (action === "attendance") {
      const rec = await ClassroomRepository.recordAttendance(roomId, {
        participantId: body.participantId,
        participantName: body.participantName,
        role: body.role,
        joinedAt: body.joinedAt || new Date().toISOString(),
        leftAt: body.leftAt,
      });
      return NextResponse.json({ attendance: rec });
    }

    // Privileged actions restriction check: verified via trusted server session token OR verified hostKey
    const session = getAuthenticatedSession(req);
    const hasValidHostSession = session && session.roomId === roomId && (session.isHost || session.role === "host" || session.role === "teacher");
    const isHostAttempt = body.userRole === "host" || body.userRole === "teacher";
    const hasMatchingHostKey = isHostAttempt && body.hostKey && body.hostKey === meeting.hostId;
    const isVerifiedHost = Boolean(hasValidHostSession || hasMatchingHostKey);

    if (action === "update-settings") {
      if (!isVerifiedHost) {
        return NextResponse.json({ error: "Unauthorized: only verified instructor or host can modify room settings" }, { status: 403 });
      }
      const updated = await ClassroomRepository.updateMeetingSettings(roomId, body.settings);
      return NextResponse.json({ meeting: updated });
    }

    if (action === "end-meeting") {
      if (!isVerifiedHost) {
        return NextResponse.json({ error: "Unauthorized: only verified instructor or host can end the classroom for all" }, { status: 403 });
      }
      const ended = await ClassroomRepository.endMeeting(roomId);
      return NextResponse.json({ meeting: ended });
    }

    if (action === "clear-whiteboard") {
      if (!isVerifiedHost) {
        return NextResponse.json({ error: "Unauthorized: only verified instructor can clear the collaborative canvas" }, { status: 403 });
      }
      await ClassroomRepository.clearWhiteboard(roomId, body.pageId || "board-1");
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err) {
    console.error("[classroom api]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
