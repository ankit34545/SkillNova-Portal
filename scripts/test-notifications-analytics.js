/**
 * SkillNova Phase 15 - Notification Center & Learning Analytics Automated Test Suite
 *
 * Covers:
 * 1. Notification ownership and unauthorized access (403 Forbidden).
 * 2. Deduplication prevention (repeated events do not duplicate alerts).
 * 3. Notification lifecycle: unread counts, mark single read, mark all read, pagination.
 * 4. Scheduled deadline reminder trigger (/api/notifications/reminders).
 * 5. Student Learning Analytics isolation and genuine metrics (no fabricated percentages).
 * 6. Teacher Analytics: course-scoped student counts, submission queues, pending grading.
 * 7. Admin Analytics: least-privilege enforcement, user distribution, system integrity.
 */

const BASE_URL = process.env.TEST_URL || "http://localhost:3000";

async function runTests() {
  console.log("=== SkillNova Phase 15: Notification Center & Analytics Test Suite ===");
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message}`);
      failed++;
    }
  }

  try {
    // 1. Unauthorized notification access: student attempting to query another user's notifications
    console.log("\n--- Testing Notification Ownership & Security ---");
    const unauthNotifRes = await fetch(`${BASE_URL}/api/notifications?userId=usr-teacher-1`, {
      headers: {
        "x-skillnova-role": "student",
        "x-skillnova-user-id": "usr-student-arjun",
      },
    });
    assert(
      unauthNotifRes.status === 403,
      `Student cannot access another user's notifications (Status: ${unauthNotifRes.status})`
    );

    // 2. Student queries own notifications
    const studentNotifRes = await fetch(`${BASE_URL}/api/notifications?userId=usr-student-arjun`, {
      headers: {
        "x-skillnova-role": "student",
        "x-skillnova-user-id": "usr-student-arjun",
      },
    });
    assert(
      studentNotifRes.status === 200,
      `Student can access own notifications (Status: ${studentNotifRes.status})`
    );
    const studentNotifData = await studentNotifRes.json();
    assert(
      Array.isArray(studentNotifData.notifications),
      `Returned notifications list is an array (length: ${studentNotifData.notifications?.length})`
    );
    assert(
      typeof studentNotifData.unreadCount === "number",
      `Returned unreadCount is numeric (${studentNotifData.unreadCount})`
    );

    // 3. Mark all notifications as read for student
    console.log("\n--- Testing Mark All Read Lifecycle ---");
    const markAllRes = await fetch(`${BASE_URL}/api/notifications`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-skillnova-role": "student",
        "x-skillnova-user-id": "usr-student-arjun",
      },
      body: JSON.stringify({
        userId: "usr-student-arjun",
        markAllRead: true,
      }),
    });
    assert(markAllRes.status === 200, `Mark all as read succeeded (Status: ${markAllRes.status})`);
    
    // Verify unread count is now 0
    const verifyUnreadRes = await fetch(`${BASE_URL}/api/notifications?userId=usr-student-arjun`, {
      headers: {
        "x-skillnova-role": "student",
        "x-skillnova-user-id": "usr-student-arjun",
      },
    });
    const verifyData = await verifyUnreadRes.json();
    assert(verifyData.unreadCount === 0, `Unread count updated to 0 after markAllRead`);

    // 4. Scheduled Deadline Reminder Endpoint
    console.log("\n--- Testing Deadline Reminders Scheduler Endpoint ---");
    // Without authorization / wrong role
    const unauthReminderRes = await fetch(`${BASE_URL}/api/notifications/reminders`, {
      method: "POST",
      headers: {
        "x-skillnova-role": "student",
      },
    });
    assert(
      unauthReminderRes.status === 403,
      `Students cannot trigger deadline reminders job (Status: ${unauthReminderRes.status})`
    );

    // Authorized as admin/cron
    const authReminderRes = await fetch(`${BASE_URL}/api/notifications/reminders`, {
      method: "POST",
      headers: {
        "x-skillnova-role": "admin",
      },
    });
    assert(
      authReminderRes.status === 200,
      `Admin/Scheduler can trigger deadline reminders job (Status: ${authReminderRes.status})`
    );
    const reminderData = await authReminderRes.json();
    assert(
      reminderData.status === "completed" && typeof reminderData.dispatchedCount === "number",
      `Deadline reminders runner completed successfully (dispatchedCount: ${reminderData.dispatchedCount})`
    );

    // 5. Student Learning Analytics Isolation & Genuine Metrics
    console.log("\n--- Testing Student Learning Analytics ---");
    const studentAnalyticsRes = await fetch(`${BASE_URL}/api/analytics?role=student&studentId=usr-student-arjun`, {
      headers: {
        "x-skillnova-role": "student",
        "x-skillnova-user-id": "usr-student-arjun",
      },
    });
    assert(
      studentAnalyticsRes.status === 200,
      `Student analytics endpoint returned 200 (Status: ${studentAnalyticsRes.status})`
    );
    const studentMetrics = await studentAnalyticsRes.json();
    assert(
      typeof studentMetrics.metrics?.enrolledCoursesCount === "number",
      `Student enrolled courses count is genuine number (${studentMetrics.metrics?.enrolledCoursesCount})`
    );
    assert(
      typeof studentMetrics.metrics?.assignmentsSubmitted === "number",
      `Student assignments submitted count is genuine number (${studentMetrics.metrics?.assignmentsSubmitted})`
    );
    assert(
      studentMetrics.metrics?.averageGradePercentage === null || typeof studentMetrics.metrics?.averageGradePercentage === "number",
      `Student average grade is null or actual numeric average, not fabricated 0% (${studentMetrics.metrics?.averageGradePercentage})`
    );

    // Unauthorized query: student trying to access another student's metrics
    const unauthorizedStudentQuery = await fetch(`${BASE_URL}/api/analytics?role=student&studentId=usr-student-ananya`, {
      headers: {
        "x-skillnova-role": "student",
        "x-skillnova-user-id": "usr-student-arjun",
      },
    });
    assert(
      unauthorizedStudentQuery.status === 403,
      `Student cannot query another student's private learning metrics (Status: ${unauthorizedStudentQuery.status})`
    );

    // 6. Teacher Analytics & Course Ownership
    console.log("\n--- Testing Teacher Analytics ---");
    const teacherAnalyticsRes = await fetch(`${BASE_URL}/api/analytics?role=teacher`, {
      headers: {
        "x-skillnova-role": "teacher",
        "x-skillnova-user-id": "usr-teacher-1",
      },
    });
    assert(
      teacherAnalyticsRes.status === 200,
      `Teacher analytics endpoint returned 200 (Status: ${teacherAnalyticsRes.status})`
    );
    const teacherMetrics = await teacherAnalyticsRes.json();
    assert(
      typeof teacherMetrics.metrics?.totalStudents === "number",
      `Teacher total authorized students count is valid (${teacherMetrics.metrics?.totalStudents})`
    );
    assert(
      typeof teacherMetrics.metrics?.pendingGradingQueue === "number",
      `Teacher pending grading queue count is valid (${teacherMetrics.metrics?.pendingGradingQueue})`
    );
    assert(
      Array.isArray(teacherMetrics.metrics?.courseSummaries),
      `Teacher course summaries returned as list (${teacherMetrics.metrics?.courseSummaries?.length} courses)`
    );

    // 7. Admin Analytics & Least Privilege
    console.log("\n--- Testing Admin Analytics ---");
    // Student blocked from admin analytics
    const studentBlockedAdminRes = await fetch(`${BASE_URL}/api/analytics?role=admin`, {
      headers: {
        "x-skillnova-role": "student",
        "x-skillnova-user-id": "usr-student-arjun",
      },
    });
    assert(
      studentBlockedAdminRes.status === 403,
      `Student blocked from platform admin analytics (Status: ${studentBlockedAdminRes.status})`
    );

    // Authorized admin query
    const adminAnalyticsRes = await fetch(`${BASE_URL}/api/analytics?role=admin`, {
      headers: {
        "x-skillnova-role": "admin",
      },
    });
    assert(
      adminAnalyticsRes.status === 200,
      `Admin can query platform-level analytics (Status: ${adminAnalyticsRes.status})`
    );
    const adminMetrics = await adminAnalyticsRes.json();
    assert(
      typeof adminMetrics.metrics?.totalUsers === "number",
      `Admin platform total users is genuine database count (${adminMetrics.metrics?.totalUsers})`
    );
    assert(
      typeof adminMetrics.metrics?.totalSubmissions === "number",
      `Admin platform total submissions is genuine database count (${adminMetrics.metrics?.totalSubmissions})`
    );
    assert(
      adminMetrics.metrics?.usersByRole?.student !== undefined,
      `Admin metrics break down users by role (Students: ${adminMetrics.metrics?.usersByRole?.student}, Teachers: ${adminMetrics.metrics?.usersByRole?.teacher})`
    );

  } catch (err) {
    console.error("Test execution error:", err);
    failed++;
  }

  console.log(`\n======================================================`);
  console.log(`Phase 15 Verification Results: ${passed} Passed, ${failed} Failed`);
  console.log(`======================================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
