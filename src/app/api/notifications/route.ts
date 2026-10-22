import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = getAuthenticatedSession(req);
    const roleHeader = req.headers.get("x-skillnova-role");
    const userHeaderId = req.headers.get("x-skillnova-user-id");
    const effectiveUserId = session ? session.userId : userHeaderId || "usr-student-soniya";
    const effectiveRole = session ? session.role : roleHeader || "student";
    const requestedUserId = req.nextUrl.searchParams.get("userId") || effectiveUserId;

    // Strictly enforce ownership: non-admins cannot query notifications of other users
    if (requestedUserId !== effectiveUserId && effectiveRole !== "admin") {
      return NextResponse.json(
        { error: "Forbidden: You cannot view notifications belonging to other accounts." },
        { status: 403 }
      );
    }

    const targetUserId = requestedUserId;

    const limitParam = req.nextUrl.searchParams.get("limit");
    const pageParam = req.nextUrl.searchParams.get("page");
    const limit = Math.min(50, Math.max(1, parseInt(limitParam || "15", 10)));
    const page = Math.max(1, parseInt(pageParam || "1", 10));
    const skip = (page - 1) * limit;

    const [notifications, totalCount, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId: targetUserId },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip,
      }),
      prisma.notification.count({
        where: { userId: targetUserId },
      }),
      prisma.notification.count({
        where: { userId: targetUserId, isRead: false },
      }),
    ]);

    return NextResponse.json({
      notifications,
      unreadCount,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (err: any) {
    console.error("[/api/notifications GET]", err);
    return NextResponse.json({ error: err.message || "Failed to load notifications" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = getAuthenticatedSession(req);
    const roleHeader = req.headers.get("x-skillnova-role");
    const userHeaderId = req.headers.get("x-skillnova-user-id");
    const effectiveUserId = session ? session.userId : userHeaderId || "usr-student-soniya";
    const effectiveRole = session ? session.role : roleHeader || "student";

    const body = await req.json();
    const { notificationId, markAll, markAllRead, userId } = body;

    const targetUserId = userId || effectiveUserId;

    if (targetUserId !== effectiveUserId && effectiveRole !== "admin") {
      return NextResponse.json(
        { error: "Forbidden: Cannot alter another user's notifications" },
        { status: 403 }
      );
    }

    if (markAll || markAllRead) {
      await prisma.notification.updateMany({
        where: { userId: targetUserId, isRead: false },
        data: { isRead: true },
      });
      return NextResponse.json({ success: true, message: "All notifications marked as read." });
    }

    if (notificationId) {
      const existing = await prisma.notification.findUnique({
        where: { id: notificationId },
      });

      if (!existing) {
        return NextResponse.json({ error: "Notification not found" }, { status: 404 });
      }

      if (session && existing.userId !== session.userId && session.role !== "admin") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      const updated = await prisma.notification.update({
        where: { id: notificationId },
        data: { isRead: true },
      });

      return NextResponse.json({ notification: updated });
    }

    return NextResponse.json({ error: "Provide notificationId or markAll: true" }, { status: 400 });
  } catch (err: any) {
    console.error("[/api/notifications PATCH]", err);
    return NextResponse.json({ error: err.message || "Failed to update notification status" }, { status: 500 });
  }
}
