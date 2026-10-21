import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = getAuthenticatedSession(req);
    const roleHeader = req.headers.get("x-skillnova-role");
    const currentRole = session ? session.role : roleHeader;

    // Check DB health
    let isDbHealthy = false;
    let registeredUsersCount = 0;
    let meetings: any[] = [];
    let doubts: any[] = [];
    let attendanceCount = 0;

    try {
      await prisma.$queryRaw`SELECT 1`;
      isDbHealthy = true;
      registeredUsersCount = await prisma.user.count();
      meetings = await prisma.meeting.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          roomId: true,
          code: true,
          title: true,
          hostName: true,
          status: true,
          createdAt: true,
        },
      });

      doubts = await prisma.doubt.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          answers: true,
        },
      });

      attendanceCount = await prisma.attendance.count();
    } catch (err) {
      console.warn("[/api/student/dashboard] Database query warning:", err);
    }

    return NextResponse.json({
      dbConnected: isDbHealthy,
      metrics: {
        totalEnrolled: meetings.length,
        totalAttendance: attendanceCount,
        openDoubts: doubts.filter((d) => d.status === "OPEN").length,
        resolvedDoubts: doubts.filter((d) => d.status === "RESOLVED").length,
      },
      recentMeetings: meetings,
      recentDoubts: doubts.map((d) => ({
        id: d.id,
        question: d.question,
        status: d.status.toLowerCase(),
        studentName: d.studentName,
        createdAt: d.createdAt,
        answers: d.answers.map((a: any) => ({
          authorName: a.authorName,
          authorRole: a.authorRole,
          text: a.text,
        })),
      })),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to load student dashboard" },
      { status: 500 }
    );
  }
}
