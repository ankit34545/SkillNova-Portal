import prisma from "./prisma";
import { NotificationType } from "@prisma/client";

export interface CreateNotificationParams {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  link?: string;
  dedupeKey?: string;
}

export class NotificationService {
  /**
   * Create an in-app notification with deduplication support to prevent repeated alerts
   */
  static async sendNotification(params: CreateNotificationParams) {
    try {
      if (params.dedupeKey) {
        // If notification with dedupeKey exists, avoid duplicate emission
        const existing = await prisma.notification.findUnique({
          where: { dedupeKey: params.dedupeKey },
        });
        if (existing) return existing;
      }

      return await prisma.notification.create({
        data: {
          userId: params.userId,
          title: params.title,
          message: params.message,
          type: params.type,
          link: params.link,
          dedupeKey: params.dedupeKey,
        },
      });
    } catch (err: any) {
      // In case of race-condition on dedupeKey unique index, return existing
      if (err.code === "P2002" && params.dedupeKey) {
        return await prisma.notification.findUnique({
          where: { dedupeKey: params.dedupeKey },
        });
      }
      console.warn("[NotificationService.sendNotification] error:", err);
      return null;
    }
  }

  /**
   * Broadcast notification to all enrolled students of a meeting room
   */
  static async notifyEnrolledStudents(roomId: string, params: Omit<CreateNotificationParams, "userId">) {
    try {
      const meeting = await prisma.meeting.findUnique({
        where: { roomId },
        include: { memberships: true },
      });

      if (!meeting) return [];

      const studentMemberships = meeting.memberships.filter((m) => m.role === "STUDENT");
      const results = [];

      for (const mem of studentMemberships) {
        const notif = await this.sendNotification({
          ...params,
          userId: mem.userId,
          dedupeKey: params.dedupeKey ? `${mem.userId}-${params.dedupeKey}` : undefined,
        });
        if (notif) results.push(notif);
      }

      return results;
    } catch (err) {
      console.warn("[NotificationService.notifyEnrolledStudents] error:", err);
      return [];
    }
  }

  /**
   * Scheduled job / runner: Inspect upcoming assignment deadlines within 24 hours
   * Emits DEADLINE_APPROACHING notifications idempotently with timezone-safe UTC timestamps.
   */
  static async processApproachingDeadlines() {
    const now = new Date();
    const next24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    // Find assignments with deadline between now and next 24 hours that are still PUBLISHED
    const urgentAssignments = await prisma.assignment.findMany({
      where: {
        status: "PUBLISHED",
        dueAt: {
          gt: now,
          lte: next24h,
        },
      },
      include: {
        meeting: {
          include: { memberships: true },
        },
        submissions: true,
      },
    });

    let dispatchedCount = 0;

    for (const asgn of urgentAssignments) {
      const hoursRemaining = Math.max(1, Math.round((asgn.dueAt.getTime() - now.getTime()) / (1000 * 60 * 60)));
      const studentMembers = asgn.meeting.memberships.filter((m) => m.role === "STUDENT");

      for (const student of studentMembers) {
        // Skip students who have already submitted
        const hasSubmitted = asgn.submissions.some((s) => s.studentId === student.userId);
        if (hasSubmitted) continue;

        const dedupeKey = `deadline-reminder-${asgn.id}-${student.userId}`;
        const notif = await this.sendNotification({
          userId: student.userId,
          title: "Assignment Deadline Approaching",
          message: `"${asgn.title}" is due in approximately ${hoursRemaining} hours. Please submit your work on time.`,
          type: "DEADLINE_APPROACHING",
          link: "/dashboard?tab=assignments",
          dedupeKey,
        });

        if (notif) dispatchedCount++;
      }
    }

    return { processedAssignments: urgentAssignments.length, dispatchedCount };
  }
}
