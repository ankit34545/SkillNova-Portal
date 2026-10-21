import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedSession } from "@/lib/auth";
import { ClassroomRepository } from "@/lib/repository";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = getAuthenticatedSession(req);
    const roleHeader = req.headers.get("x-skillnova-role");
    const currentRole = session ? session.role : roleHeader;

    if (currentRole !== "teacher" && currentRole !== "host" && currentRole !== "admin") {
      return NextResponse.json(
        {
          error: "Unauthorized: Instructor or mentor privileges required.",
          requiredRole: "teacher",
          currentRole: currentRole || "unauthenticated",
        },
        { status: 403 }
      );
    }

    // Retrieve active room doubts & attendance
    const doubts = await ClassroomRepository.getDoubts("ai-eng-live");
    const attendance = await ClassroomRepository.getAttendance("ai-eng-live");
    
    // Query real enrolled student memberships from PostgreSQL
    let enrolledStudents: any[] = [];
    try {
      const targetMeeting = await prisma.meeting.findUnique({
        where: { roomId: "ai-eng-live" },
        include: {
          memberships: {
            include: { user: true },
            orderBy: { joinedAt: "desc" },
          },
        },
      });
      if (targetMeeting) {
        enrolledStudents = targetMeeting.memberships.map((m: any) => ({
          id: m.id,
          userId: m.userId,
          name: m.user.name,
          email: m.user.email,
          role: m.role,
          joinedAt: m.joinedAt,
        }));
      }
    } catch (e) {
      console.warn("[/api/teacher/cohort] Student query:", e);
    }

    return NextResponse.json({
      activeCohort: "ai-eng-live",
      doubts,
      attendance,
      students: enrolledStudents,
      pendingCount: doubts.filter((d) => d.status === "open").length,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
