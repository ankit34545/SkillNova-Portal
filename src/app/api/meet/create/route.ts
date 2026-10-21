import { NextRequest, NextResponse } from "next/server";
import { ClassroomRepository } from "@/lib/repository";
import type { CreateMeetingRequest } from "@/types/meet";
import { defaultMeetingSettings, generateUUID, generateRoomId, generateMeetingCode } from "@/lib/meeting-utils";
import { generateLiveKitToken } from "@/lib/livekit-token";
import { signSessionToken, createSessionCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body: CreateMeetingRequest = await req.json();

    if (!body.title?.trim()) {
      return NextResponse.json({ error: "Meeting title is required." }, { status: 400 });
    }
    if (!body.hostName?.trim()) {
      return NextResponse.json({ error: "Host name is required." }, { status: 400 });
    }

    const hostId = "host-" + Date.now();
    const id = generateUUID();
    const roomId = generateRoomId();
    const code = generateMeetingCode();

    const meetingData = {
      id,
      roomId,
      code,
      title: body.title.trim().slice(0, 100),
      description: body.description?.trim().slice(0, 500),
      hostId,
      hostName: body.hostName.trim(),
      scheduledAt: body.scheduledAt,
      visibility: body.visibility ?? "private",
      settings: {
        ...defaultMeetingSettings(),
        ...body.settings,
      },
      createdAt: new Date().toISOString(),
      status: "active" as const,
      participantCount: 1,
      inviteLink: `/meet/${roomId}`,
    };

    // Save to PostgreSQL via ClassroomRepository
    const meeting = await ClassroomRepository.createMeeting(meetingData);

    // Generate real LiveKit token for the host
    const { token } = await generateLiveKitToken({
      roomName: meeting.roomId,
      participantIdentity: hostId,
      participantName: meeting.hostName,
      isHost: true,
      canPublish: true,
      canSubscribe: true,
    });

    // Milestone 3: Issue signed JWT session token for host
    const sessionToken = signSessionToken({
      userId: hostId,
      name: meeting.hostName,
      email: `${hostId}@skillnova.internal`,
      role: "host",
      roomId: meeting.roomId,
      isHost: true,
    });

    const response = NextResponse.json({ meeting, token }, { status: 201 });
    response.headers.set("Set-Cookie", createSessionCookie(sessionToken));
    return response;
  } catch (err: any) {
    console.error("[/api/meet/create]", err);
    return NextResponse.json({ error: err.message || "Internal server error." }, { status: 500 });
  }
}
