import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { ClassroomRepository } from "@/lib/repository";

export async function GET(req: NextRequest) {
  try {
    const session = getAuthenticatedSession(req);
    const userId = session?.userId || req.nextUrl.searchParams.get("userId") || "std-101";

    const enrollments = await prisma.membership.findMany({
      where: { userId },
      include: {
        meeting: {
          select: {
            id: true,
            roomId: true,
            title: true,
            hostName: true,
            status: true,
          },
        },
      },
      orderBy: { joinedAt: "desc" },
    });

    return NextResponse.json({
      userId,
      enrollments: enrollments.map((e) => ({
        id: e.id,
        roomId: e.meeting.roomId,
        title: e.meeting.title,
        hostName: e.meeting.hostName,
        status: e.meeting.status,
        enrolledAt: e.joinedAt,
      })),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch student enrollments" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = getAuthenticatedSession(req);
    const body = await req.json();
    const userId = session?.userId || body.userId || "std-101";
    const userName = session?.name || body.userName || "Arjun Verma";
    const { trackId, roomId } = body;

    const targetRoomId = roomId || (trackId === "fullstack-cloud" ? "sys-design-401" : trackId === "dsa-interview" ? "dsa-faang-prep" : "ai-eng-live");

    // 1. Ensure user exists in PostgreSQL
    await ClassroomRepository.ensureUser(userId, userName, "STUDENT");

    // 2. Find or ensure meeting exists
    let meeting = await prisma.meeting.findUnique({
      where: { roomId: targetRoomId },
    });

    if (!meeting) {
      meeting = await prisma.meeting.findFirst({
        where: { status: "ACTIVE" },
      });
    }

    if (!meeting) {
      return NextResponse.json(
        { error: "No active cohort room available for enrollment." },
        { status: 404 }
      );
    }

    // 3. Upsert membership to prevent duplicate enrollments safely
    const membership = await prisma.membership.upsert({
      where: {
        meetingId_userId: {
          meetingId: meeting.id,
          userId,
        },
      },
      create: {
        meetingId: meeting.id,
        userId,
        role: "STUDENT",
      },
      update: {
        joinedAt: new Date(),
      },
    });

    return NextResponse.json(
      {
        message: "Successfully enrolled in track cohort.",
        enrollment: {
          id: membership.id,
          roomId: meeting.roomId,
          title: meeting.title,
          joinedAt: membership.joinedAt,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[/api/student/enroll]", error);
    return NextResponse.json(
      { error: error.message || "Enrollment transaction failed" },
      { status: 500 }
    );
  }
}
