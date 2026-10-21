import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedSession } from "@/lib/auth";
import { ClassroomRepository } from "@/lib/repository";

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

    return NextResponse.json({
      activeCohort: "ai-eng-live",
      doubts,
      attendance,
      pendingCount: doubts.filter((d) => d.status === "open").length,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
