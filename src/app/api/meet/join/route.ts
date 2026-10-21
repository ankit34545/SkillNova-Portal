import { NextRequest, NextResponse } from "next/server";
import { ClassroomRepository } from "@/lib/repository";
import { incrementParticipantCount } from "@/lib/meet-store";
import { generateUUID } from "@/lib/meeting-utils";
import type { JoinMeetingRequest, JoinMeetingResponse, ParticipantRole } from "@/types/meet";
import { generateLiveKitToken } from "@/lib/livekit-token";
import { signSessionToken, createSessionCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body: JoinMeetingRequest = await req.json();

    if (!body.displayName?.trim()) {
      return NextResponse.json({ error: "Display name is required." }, { status: 400 });
    }

    let meeting = null;

    if (body.code) {
      meeting = await ClassroomRepository.getMeetingByCode(body.code.trim().toUpperCase());
      if (!meeting) {
        return NextResponse.json({ error: "Invalid meeting code." }, { status: 404 });
      }
    } else if (body.roomId) {
      meeting = await ClassroomRepository.getMeeting(body.roomId);
      if (!meeting) {
        return NextResponse.json({ error: "Meeting not found." }, { status: 404 });
      }
    } else {
      return NextResponse.json({ error: "Provide a meeting code or room ID." }, { status: 400 });
    }

    if (meeting.status === "ended") {
      return NextResponse.json({ error: "This meeting has ended." }, { status: 410 });
    }

    if (meeting.settings?.isLocked) {
      return NextResponse.json({ error: "Room is currently locked by the host." }, { status: 423 });
    }

    if (meeting.participantCount >= (meeting.settings?.maxParticipants || 100)) {
      return NextResponse.json({ error: "Meeting is at full capacity." }, { status: 403 });
    }

    const participantId = "p-" + generateUUID();
    // Security Check: Join route only permits student role for public attendees.
    // Host / Teacher privileges cannot be self-claimed without host secret/hostId match.
    const isHostAttempt = body.role === "host" || body.role === "teacher";
    const isVerifiedHost = isHostAttempt && (body as any).hostKey && (body as any).hostKey === meeting.hostId;
    const assignedRole: ParticipantRole = isVerifiedHost && body.role ? body.role : "student";
    
    incrementParticipantCount(meeting.roomId);

    // Record attendance in PostgreSQL
    await ClassroomRepository.recordAttendance(meeting.roomId, {
      participantId,
      participantName: body.displayName.trim(),
      role: assignedRole,
      joinedAt: new Date().toISOString(),
    });

    // Generate real LiveKit WebRTC access token with server-verified role
    const { token, serverUrl } = await generateLiveKitToken({
      roomName: meeting.roomId,
      participantIdentity: participantId,
      participantName: body.displayName.trim(),
      isHost: isVerifiedHost,
      canPublish: true,
      canSubscribe: true,
    });

    // Milestone 3: Issue signed JWT session token for admitted attendee
    const sessionToken = signSessionToken({
      userId: participantId,
      name: body.displayName.trim(),
      email: `${participantId}@skillnova.internal`,
      role: isVerifiedHost ? (assignedRole as any) : "student",
      roomId: meeting.roomId,
      isHost: isVerifiedHost,
    });

    const responsePayload: JoinMeetingResponse = {
      meeting,
      participantId,
      token,
      livekitUrl: serverUrl,
    };

    const res = NextResponse.json(responsePayload, { status: 200 });
    res.headers.set("Set-Cookie", createSessionCookie(sessionToken));
    return res;
  } catch (err) {
    console.error("[/api/meet/join]", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
