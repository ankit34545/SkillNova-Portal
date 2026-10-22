import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = getAuthenticatedSession(req);
    const roleHeader = req.headers.get("x-skillnova-role");
    const userHeaderId = req.headers.get("x-skillnova-user-id");
    const effectiveRole = session ? session.role : roleHeader || "student";
    const effectiveUserId = session ? session.userId : userHeaderId || "usr-student-soniya";

    const requestedRole = req.nextUrl.searchParams.get("role") || effectiveRole;
    const requestedStudentId = req.nextUrl.searchParams.get("studentId") || req.nextUrl.searchParams.get("userId");

    // ==========================================
    // 1. ADMIN ANALYTICS
    // ==========================================
    if (requestedRole === "admin") {
      if (effectiveRole !== "admin") {
        return NextResponse.json({ error: "Forbidden: Admin analytics restricted" }, { status: 403 });
      }

      const [
        totalUsers,
        usersByRole,
        totalMeetings,
        totalAssignments,
        totalSubmissions,
        totalAttendances,
        activeDoubts,
      ] = await Promise.all([
        prisma.user.count(),
        prisma.user.groupBy({
          by: ["role"],
          _count: { id: true },
        }),
        prisma.meeting.count(),
        prisma.assignment.count(),
        prisma.submission.count(),
        prisma.attendance.count(),
        prisma.doubt.count({ where: { status: "OPEN" } }),
      ]);

      const roleDistribution = usersByRole.reduce((acc: any, r) => {
        acc[r.role.toLowerCase()] = r._count.id;
        return acc;
      }, {});

      return NextResponse.json({
        scope: "admin",
        metrics: {
          totalUsers,
          usersByRole: roleDistribution,
          roleDistribution,
          totalMeetings,
          totalAssignments,
          totalSubmissions,
          totalAttendances,
          activeDoubts,
        },
      });
    }

    // ==========================================
    // 2. TEACHER ANALYTICS
    // ==========================================
    if (requestedRole === "teacher") {
      if (effectiveRole !== "teacher" && effectiveRole !== "admin") {
        return NextResponse.json({ error: "Forbidden: Teacher analytics restricted" }, { status: 403 });
      }

      const teacherId = effectiveUserId;

      // Query assignments created by this teacher
      const assignments = await prisma.assignment.findMany({
        where: { teacherId },
        include: {
          submissions: true,
          meeting: {
            include: { memberships: true },
          },
        },
      });

      // Distinct student count across courses assigned to this teacher
      const studentIds = new Set<string>();
      let totalSubmissions = 0;
      let gradedSubmissions = 0;
      let pendingGrading = 0;

      const courseMap = new Map<string, { courseId: string; title: string; submissionsCount: number; pendingGrading: number }>();

      for (const asgn of assignments) {
        asgn.meeting.memberships.forEach((m) => {
          if (m.role === "STUDENT") studentIds.add(m.userId);
        });
        totalSubmissions += asgn.submissions.length;
        let asgnPending = 0;
        asgn.submissions.forEach((s) => {
          if (s.status === "GRADED") gradedSubmissions++;
          else {
            pendingGrading++;
            asgnPending++;
          }
        });

        const cId = asgn.meetingId;
        if (!courseMap.has(cId)) {
          courseMap.set(cId, {
            courseId: cId,
            title: asgn.meeting.title,
            submissionsCount: asgn.submissions.length,
            pendingGrading: asgnPending,
          });
        } else {
          const c = courseMap.get(cId)!;
          c.submissionsCount += asgn.submissions.length;
          c.pendingGrading += asgnPending;
        }
      }

      return NextResponse.json({
        scope: "teacher",
        metrics: {
          assignedCoursesCount: courseMap.size > 0 ? courseMap.size : 1,
          totalStudents: studentIds.size,
          totalAssignments: assignments.length,
          totalSubmissionsReceived: totalSubmissions,
          gradedSubmissionsCount: gradedSubmissions,
          pendingGradingQueue: pendingGrading,
          courseSummaries: Array.from(courseMap.values()),
        },
      });
    }

    // ==========================================
    // 3. STUDENT ANALYTICS
    // ==========================================
    const targetStudentId = requestedStudentId || effectiveUserId;

    // Enforce student privacy: cannot view peer's metrics unless teacher/admin
    if (targetStudentId !== effectiveUserId && effectiveRole !== "admin" && effectiveRole !== "teacher") {
      return NextResponse.json({ error: "Forbidden: Cannot view peer analytics" }, { status: 403 });
    }

    const [enrolledMemberships, submissions, allAssignments, attendances] = await Promise.all([
      prisma.membership.findMany({
        where: { userId: targetStudentId, role: "STUDENT" },
        include: { meeting: true },
      }),
      prisma.submission.findMany({
        where: { studentId: targetStudentId },
        include: { assignment: true },
      }),
      prisma.assignment.findMany({
        where: { status: "PUBLISHED" },
      }),
      prisma.attendance.findMany({
        where: { userId: targetStudentId },
      }),
    ]);

    const totalAssigned = allAssignments.length;
    const completedSubmissions = submissions.length;
    const gradedSubmissions = submissions.filter((s) => s.status === "GRADED");

    // Compute genuine average score only where submissions have been graded
    let averageGradePercentage: number | null = null;
    if (gradedSubmissions.length > 0) {
      const totalScore = gradedSubmissions.reduce((sum, s) => sum + (s.marks || 0), 0);
      const totalPossible = gradedSubmissions.reduce((sum, s) => sum + s.assignment.maxMarks, 0);
      averageGradePercentage = totalPossible > 0 ? Math.round((totalScore / totalPossible) * 100) : null;
    }

    const now = new Date();
    const upcomingDeadlines = allAssignments
      .filter((a) => new Date(a.dueAt) > now)
      .map((a) => {
        const sub = submissions.find((s) => s.assignmentId === a.id);
        return {
          id: a.id,
          title: a.title,
          dueAt: a.dueAt,
          maxMarks: a.maxMarks,
          isSubmitted: Boolean(sub),
          status: sub ? sub.status : "PENDING",
        };
      })
      .slice(0, 5);

    return NextResponse.json({
      scope: "student",
      metrics: {
        enrolledCoursesCount: enrolledMemberships.length,
        totalAssignmentsPublished: totalAssigned,
        completedSubmissionsCount: completedSubmissions,
        assignmentsSubmitted: completedSubmissions,
        pendingAssignmentsCount: Math.max(0, totalAssigned - completedSubmissions),
        gradedCount: gradedSubmissions.length,
        averageGradePercentage, // null if no graded work exists
        attendanceSessionsCount: attendances.length,
      },
      upcomingDeadlines,
    });
  } catch (err: any) {
    console.error("[/api/analytics GET]", err);
    return NextResponse.json({ error: err.message || "Failed to load learning analytics" }, { status: 500 });
  }
}
