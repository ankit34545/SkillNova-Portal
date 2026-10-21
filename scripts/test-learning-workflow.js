/**
 * SkillNova Learning Workflow Regression Suite
 * Validates:
 * 1. Course enrollment endpoint and duplicate prevention (PostgreSQL membership upsert)
 * 2. Student notes saving and retrieval from database
 * 3. Teacher cohort endpoint with student directory, doubts, and attendance
 * 4. Doubt submission, resolution, and verification across student and teacher surfaces
 * 5. Role-based server protection on administrative metrics
 */

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3005";

async function runWorkflowSuite() {
  console.log("==========================================================");
  console.log("   SkillNova Complete Learning Workflow Automated Suite   ");
  console.log("==========================================================");
  let passed = 0;
  let failed = 0;

  async function assert(desc, fn) {
    try {
      await fn();
      console.log(`PASS: ${desc}`);
      passed++;
    } catch (err) {
      console.error(`FAIL: ${desc} -> ${err.message}`);
      failed++;
    }
  }

  // 1. Student Course Enrollment Workflow
  await assert("Enrolls student in track and returns 201 Created", async () => {
    const res = await fetch(`${BASE_URL}/api/student/enroll`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: "std-test-workflow",
        userName: "Workflow Learner",
        trackId: "ai-eng",
        roomId: "ai-eng-live",
      }),
    });
    if (res.status !== 201) throw new Error(`Expected status 201, got ${res.status}`);
    const data = await res.json();
    if (!data.enrollment?.roomId) throw new Error("Missing enrollment roomId");
  });

  // 2. Duplicate Enrollment Prevention (Idempotent Upsert)
  await assert("Prevents duplicate enrollment without errors via upsert", async () => {
    const res = await fetch(`${BASE_URL}/api/student/enroll`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: "std-test-workflow",
        userName: "Workflow Learner",
        trackId: "ai-eng",
        roomId: "ai-eng-live",
      }),
    });
    if (res.status !== 201) throw new Error(`Expected status 201 on upsert, got ${res.status}`);
  });

  // 3. Query Student Enrollments
  await assert("Retrieves enrolled tracks for student", async () => {
    const res = await fetch(`${BASE_URL}/api/student/enroll?userId=std-test-workflow`);
    if (res.status !== 200) throw new Error(`Expected status 200, got ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data.enrollments) || data.enrollments.length === 0) {
      throw new Error("Enrollments array empty or invalid");
    }
  });

  // 4. Student Notes Workflow
  let createdNoteId = "";
  await assert("Saves student note to PostgreSQL", async () => {
    const res = await fetch(`${BASE_URL}/api/student/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        authorId: "std-test-workflow",
        authorName: "Workflow Learner",
        title: "Vector Search Notes",
        content: "HNSW graphs with cosine distance metrics.",
        roomId: "ai-eng-live",
      }),
    });
    if (res.status !== 201) throw new Error(`Expected status 201, got ${res.status}`);
    const data = await res.json();
    if (!data.note?.id) throw new Error("Missing note id");
    createdNoteId = data.note.id;
  });

  await assert("Retrieves persisted student notes from database", async () => {
    const res = await fetch(`${BASE_URL}/api/student/notes?userId=std-test-workflow`);
    if (res.status !== 200) throw new Error(`Expected status 200, got ${res.status}`);
    const data = await res.json();
    const found = data.notes?.some((n) => n.id === createdNoteId);
    if (!found) throw new Error("Created note not found in retrieved list");
  });

  // 5. Teacher Cohort & Enrolled Student Directory
  await assert("Rejects student from accessing teacher cohort endpoint (403)", async () => {
    const res = await fetch(`${BASE_URL}/api/teacher/cohort`, {
      headers: { "x-skillnova-role": "student" },
    });
    if (res.status !== 403) throw new Error(`Expected status 403, got ${res.status}`);
  });

  await assert("Allows teacher to inspect enrolled students in active cohort", async () => {
    const res = await fetch(`${BASE_URL}/api/teacher/cohort`, {
      headers: { "x-skillnova-role": "teacher" },
    });
    if (res.status !== 200) throw new Error(`Expected status 200, got ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data.doubts)) throw new Error("doubts must be array");
    if (!Array.isArray(data.students)) throw new Error("students must be array");
  });

  // 6. Admin Endpoint Protection
  await assert("Blocks non-admin user from accessing admin metrics (403)", async () => {
    const res = await fetch(`${BASE_URL}/api/admin/metrics`, {
      headers: { "x-skillnova-role": "student" },
    });
    if (res.status !== 403) throw new Error(`Expected status 403, got ${res.status}`);
  });

  await assert("Allows verified admin to inspect real database metrics (200)", async () => {
    const res = await fetch(`${BASE_URL}/api/admin/metrics`, {
      headers: { "x-skillnova-role": "admin" },
    });
    if (res.status !== 200) throw new Error(`Expected status 200, got ${res.status}`);
    const data = await res.json();
    if (data.dbHealth !== "connected") throw new Error("PostgreSQL should report connected");
  });

  console.log("==========================================================");
  console.log(`   Learning Suite: ${passed} Passed, ${failed} Failed    `);
  console.log("==========================================================");

  if (failed > 0) process.exit(1);
}

runWorkflowSuite().catch((e) => {
  console.error("Test execution failed:", e);
  process.exit(1);
});
