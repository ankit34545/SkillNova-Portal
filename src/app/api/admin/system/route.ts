import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/system
 * Returns audit logs, announcements, platform settings, and support tickets for Admin Control Center.
 *
 * POST /api/admin/system
 * Admin action dispatcher:
 * - create_announcement
 * - delete_announcement
 * - update_setting
 * - resolve_ticket
 */
export async function GET(req: NextRequest) {
  try {
    const session = getAuthenticatedSession(req);
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admin privileges required." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const view = searchParams.get("view") || "all";

    const [auditLogs, announcements, settings, tickets] = await Promise.all([
      view === "all" || view === "audit"
        ? prisma.auditLog.findMany({
            take: 40,
            orderBy: { createdAt: "desc" },
            include: { admin: { select: { id: true, name: true, email: true } } },
          })
        : [],
      view === "all" || view === "announcements"
        ? prisma.announcement.findMany({
            take: 30,
            orderBy: { createdAt: "desc" },
            include: { author: { select: { id: true, name: true } } },
          })
        : [],
      view === "all" || view === "settings"
        ? prisma.platformSetting.findMany({
            orderBy: { category: "asc" },
          })
        : [],
      view === "all" || view === "tickets"
        ? prisma.supportTicket.findMany({
            take: 30,
            orderBy: { createdAt: "desc" },
            include: { user: { select: { id: true, name: true, email: true } } },
          })
        : [],
    ]);

    return NextResponse.json({
      auditLogs,
      announcements,
      settings,
      tickets,
    });
  } catch (error: any) {
    console.error("[/api/admin/system:GET] Error:", error?.message || error);
    return NextResponse.json({ error: "Failed to retrieve system data." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = getAuthenticatedSession(req);
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admin privileges required." }, { status: 403 });
    }

    const body = await req.json();
    const { action } = body;

    // 1. Create Announcement
    if (action === "create_announcement") {
      const { title, content, targetRole } = body;
      if (!title?.trim() || !content?.trim()) {
        return NextResponse.json({ error: "Title and content are required." }, { status: 400 });
      }

      const announcement = await prisma.announcement.create({
        data: {
          title: title.trim(),
          content: content.trim(),
          authorId: session.userId,
          targetRole: targetRole || null,
        },
      });

      return NextResponse.json({ success: true, announcement }, { status: 201 });
    }

    // 2. Delete Announcement
    if (action === "delete_announcement") {
      const { id } = body;
      await prisma.announcement.delete({ where: { id } });
      return NextResponse.json({ success: true, message: "Announcement removed." });
    }

    // 3. Update Platform Setting
    if (action === "update_setting") {
      const { key, value, category } = body;
      if (!key) return NextResponse.json({ error: "Setting key required." }, { status: 400 });

      const setting = await prisma.platformSetting.upsert({
        where: { key },
        update: { value: String(value), category: category || "general" },
        create: { key, value: String(value), category: category || "general" },
      });

      return NextResponse.json({ success: true, setting });
    }

    // 4. Resolve Support Ticket
    if (action === "resolve_ticket") {
      const { ticketId, response, status } = body;
      const updated = await prisma.supportTicket.update({
        where: { id: ticketId },
        data: {
          status: status || "RESOLVED",
          response: response || "Resolved by administrator.",
        },
      });
      return NextResponse.json({ success: true, ticket: updated });
    }

    return NextResponse.json({ error: "Unknown action." }, { status: 400 });
  } catch (error: any) {
    console.error("[/api/admin/system:POST] Error:", error?.message || error);
    return NextResponse.json({ error: "Operation failed." }, { status: 500 });
  }
}

