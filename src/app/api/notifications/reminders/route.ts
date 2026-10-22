import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedSession } from "@/lib/auth";
import { NotificationService } from "@/lib/notifications";

export async function POST(req: NextRequest) {
  try {
    const session = getAuthenticatedSession(req);
    const roleHeader = req.headers.get("x-skillnova-role");
    const userRole = session ? session.role : roleHeader;

    // Cron / Scheduler or admin/teacher privilege required to trigger deadline job
    const isAuthorized = userRole === "admin" || userRole === "teacher" || req.headers.get("x-scheduler-secret") === (process.env.SCHEDULER_SECRET || "skillnova_cron_secret");

    if (!isAuthorized) {
      return NextResponse.json(
        { error: "Unauthorized to trigger deadline processing scheduler." },
        { status: 403 }
      );
    }

    const result = await NotificationService.processApproachingDeadlines();
    return NextResponse.json({
      status: "completed",
      timestamp: new Date().toISOString(),
      ...result,
    });
  } catch (err: any) {
    console.error("[/api/notifications/reminders POST]", err);
    return NextResponse.json({ error: err.message || "Failed to process reminders" }, { status: 500 });
  }
}
