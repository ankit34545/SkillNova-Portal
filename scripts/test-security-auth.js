/**
 * SkillNova Phase 10 - Negative Authorization & Security Audit Test Suite
 * 
 * Verifies:
 * 1. Missing authentication credentials (rejects unauthenticated attempts)
 * 2. Expired JWT session tokens (rejects expired tokens)
 * 3. Malformed/tampered JWT signatures (rejects forged tokens)
 * 4. Cross-room access prevention (prevents room A host token from mutating room B)
 * 5. Student privilege escalation prevention (students cannot clear whiteboards, change room settings, or end meetings)
 * 6. Invalid host key / secret rejection
 * 7. Admin endpoint rejection of non-admin roles (students, teachers without admin privileges)
 * 8. Teacher cohort endpoint rejection of non-privileged students
 */

const jwt = require("jsonwebtoken");
const fs = require("fs");

// Load environment variables from .env or .env.local
[".env.local", ".env"].forEach(file => {
  if (fs.existsSync(file)) {
    const lines = fs.readFileSync(file, "utf8").split("\n");
    lines.forEach(l => {
      const m = l.match(/^([^#=]+)=(.*)$/);
      if (m && !process.env[m[1].trim()]) {
        process.env[m[1].trim()] = m[2].trim().replace(/^['"]|['"]$/g, '');
      }
    });
  }
});

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";
const DEV_SECRET = process.env.AUTH_SECRET || "skillnova_dev_jwt_secret_987654321_secure";
const WRONG_SECRET = "forged_hacker_secret_key_1234567890123456";

async function runSecurityAuthSuite() {
  console.log("==========================================================");
  console.log("   SkillNova Phase 10 Negative Authorization & Security   ");
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

  // First create two test rooms to test cross-room isolation
  let roomA = null;
  let roomB = null;

  try {
    const resA = await fetch(`${BASE_URL}/api/meet/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "Security Room Alpha",
        hostName: "Instructor Alpha",
        visibility: "private",
      }),
    });
    const dataA = await resA.json();
    roomA = dataA.meeting;

    const resB = await fetch(`${BASE_URL}/api/meet/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "Security Room Beta",
        hostName: "Instructor Beta",
        visibility: "private",
      }),
    });
    const dataB = await resB.json();
    roomB = dataB.meeting;
  } catch (setupErr) {
    console.error("Setup failed:", setupErr);
    process.exit(1);
  }

  // 1. Missing credentials on admin metrics
  await assert("Admin metrics rejects request with no credentials (403)", async () => {
    const res = await fetch(`${BASE_URL}/api/admin/metrics`);
    if (res.status !== 403) throw new Error(`Expected 403, got ${res.status}`);
  });

  // 2. Malformed token rejection
  await assert("Admin metrics rejects malformed JWT header (403)", async () => {
    const res = await fetch(`${BASE_URL}/api/admin/metrics`, {
      headers: { Authorization: "Bearer totally-malformed-not-a-jwt" },
    });
    if (res.status !== 403) throw new Error(`Expected 403, got ${res.status}`);
  });

  // 3. Forged / Tampered token rejection (signed with wrong secret)
  await assert("Admin metrics rejects forged JWT signed with untrusted secret (403)", async () => {
    const forgedToken = jwt.sign(
      { userId: "attacker", name: "Hacker", email: "hacker@test.com", role: "admin" },
      WRONG_SECRET,
      { expiresIn: "1h", algorithm: "HS256" }
    );
    const res = await fetch(`${BASE_URL}/api/admin/metrics`, {
      headers: { Authorization: `Bearer ${forgedToken}` },
    });
    if (res.status !== 403) throw new Error(`Expected 403, got ${res.status}`);
  });

  // 4. Expired token rejection
  await assert("Admin metrics rejects expired admin JWT (403)", async () => {
    const expiredToken = jwt.sign(
      { userId: "old-admin", name: "Admin", email: "admin@test.com", role: "admin" },
      DEV_SECRET,
      { expiresIn: "-10s", algorithm: "HS256" }
    );
    const res = await fetch(`${BASE_URL}/api/admin/metrics`, {
      headers: { Authorization: `Bearer ${expiredToken}` },
    });
    if (res.status !== 403) throw new Error(`Expected 403, got ${res.status}`);
  });

  // 5. Valid Admin token acceptance
  await assert("Admin metrics accepts legitimate admin JWT (200)", async () => {
    const validAdminToken = jwt.sign(
      { userId: "valid-admin", name: "Admin Lead", email: "lead@skillnova.internal", role: "admin" },
      DEV_SECRET,
      { expiresIn: "1h", algorithm: "HS256" }
    );
    const res = await fetch(`${BASE_URL}/api/admin/metrics`, {
      headers: { Authorization: `Bearer ${validAdminToken}` },
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (data.status !== "operational") throw new Error("Expected operational status");
  });

  // 6. Teacher cohort rejects unprivileged student role token
  await assert("Teacher cohort rejects student role JWT (403)", async () => {
    const studentToken = jwt.sign(
      { userId: "student-1", name: "Alice", email: "alice@test.com", role: "student" },
      DEV_SECRET,
      { expiresIn: "1h", algorithm: "HS256" }
    );
    const res = await fetch(`${BASE_URL}/api/teacher/cohort`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    if (res.status !== 403) throw new Error(`Expected 403, got ${res.status}`);
  });

  // 7. Teacher cohort accepts authorized teacher JWT
  await assert("Teacher cohort accepts valid teacher JWT (200)", async () => {
    const teacherToken = jwt.sign(
      { userId: "teacher-1", name: "Prof Smith", email: "smith@skillnova.internal", role: "teacher" },
      DEV_SECRET,
      { expiresIn: "1h", algorithm: "HS256" }
    );
    const res = await fetch(`${BASE_URL}/api/teacher/cohort`, {
      headers: { Authorization: `Bearer ${teacherToken}` },
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
  });

  // 8. Classroom: Student cannot perform privileged action (clear-whiteboard)
  await assert("Student session cannot clear whiteboard (403)", async () => {
    const studentToken = jwt.sign(
      { userId: "student-1", name: "Alice", role: "student", roomId: roomA.roomId, isHost: false },
      DEV_SECRET,
      { expiresIn: "1h", algorithm: "HS256" }
    );
    const res = await fetch(`${BASE_URL}/api/meet/${roomA.roomId}/classroom`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `skillnova_session=${studentToken}`,
      },
      body: JSON.stringify({
        action: "clear-whiteboard",
        pageId: "board-1",
      }),
    });
    if (res.status !== 403) throw new Error(`Expected 403, got ${res.status}`);
  });

  // 9. Classroom: Student cannot change room settings
  await assert("Student session cannot modify meeting settings (403)", async () => {
    const studentToken = jwt.sign(
      { userId: "student-1", name: "Alice", role: "student", roomId: roomA.roomId, isHost: false },
      DEV_SECRET,
      { expiresIn: "1h", algorithm: "HS256" }
    );
    const res = await fetch(`${BASE_URL}/api/meet/${roomA.roomId}/classroom`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `skillnova_session=${studentToken}`,
      },
      body: JSON.stringify({
        action: "update-settings",
        settings: { isLocked: true },
      }),
    });
    if (res.status !== 403) throw new Error(`Expected 403, got ${res.status}`);
  });

  // 10. Cross-Room Mutation Prevention: Host of Room A cannot mutate Room B
  await assert("Host of Room A cannot modify settings or end Room B (403)", async () => {
    // Host token strictly bound to roomA.roomId
    const hostTokenA = jwt.sign(
      { userId: roomA.hostId, name: roomA.hostName, role: "host", roomId: roomA.roomId, isHost: true },
      DEV_SECRET,
      { expiresIn: "1h", algorithm: "HS256" }
    );

    // Attempting to invoke end-meeting on roomB using token for roomA
    const res = await fetch(`${BASE_URL}/api/meet/${roomB.roomId}/classroom`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `skillnova_session=${hostTokenA}`,
      },
      body: JSON.stringify({
        action: "end-meeting",
      }),
    });
    if (res.status !== 403) throw new Error(`Expected 403, got ${res.status}`);
  });

  // 11. Invalid Host Key Rejection
  await assert("Privileged action rejects bogus hostKey (403)", async () => {
    const res = await fetch(`${BASE_URL}/api/meet/${roomA.roomId}/classroom`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "update-settings",
        userRole: "host",
        hostKey: "bogus-unauthorized-key",
        settings: { isLocked: true },
      }),
    });
    if (res.status !== 403) throw new Error(`Expected 403, got ${res.status}`);
  });

  // 12. Valid Host Key / Session acceptance on authorized room
  await assert("Legitimate Host can update settings in own room (200)", async () => {
    const hostTokenA = jwt.sign(
      { userId: roomA.hostId, name: roomA.hostName, role: "host", roomId: roomA.roomId, isHost: true },
      DEV_SECRET,
      { expiresIn: "1h", algorithm: "HS256" }
    );
    const res = await fetch(`${BASE_URL}/api/meet/${roomA.roomId}/classroom`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `skillnova_session=${hostTokenA}`,
      },
      body: JSON.stringify({
        action: "update-settings",
        settings: { allowChat: true },
      }),
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
  });

  // 13. Cross-Student Note Isolation: Student A cannot fetch Student B's notes
  await assert("Student cannot access another student's private notes (403)", async () => {
    const soniyaToken = jwt.sign(
      { userId: "usr-student-soniya", name: "Soniya Chauhan", role: "student" },
      DEV_SECRET,
      { expiresIn: "1h", algorithm: "HS256" }
    );
    // Attempt to access Mohit's notes using Soniya's token
    const res = await fetch(`${BASE_URL}/api/student/notes?userId=usr-student-mohit`, {
      headers: { Authorization: `Bearer ${soniyaToken}` },
    });
    if (res.status !== 403) throw new Error(`Expected 403 Forbidden, got ${res.status}`);
  });

  // 14. Cross-Student Enrollment Isolation: Student A cannot fetch Student B's enrollments
  await assert("Student cannot access another student's private course enrollments (403)", async () => {
    const soniyaToken = jwt.sign(
      { userId: "usr-student-soniya", name: "Soniya Chauhan", role: "student" },
      DEV_SECRET,
      { expiresIn: "1h", algorithm: "HS256" }
    );
    // Attempt to access Mohit's enrollments using Soniya's token
    const res = await fetch(`${BASE_URL}/api/student/enroll?userId=usr-student-mohit`, {
      headers: { Authorization: `Bearer ${soniyaToken}` },
    });
    if (res.status !== 403) throw new Error(`Expected 403 Forbidden, got ${res.status}`);
  });

  // 15. Student cannot post classroom materials
  await assert("Student cannot post official course materials (403)", async () => {
    const soniyaToken = jwt.sign(
      { userId: "usr-student-soniya", name: "Soniya Chauhan", role: "student", roomId: roomA.roomId },
      DEV_SECRET,
      { expiresIn: "1h", algorithm: "HS256" }
    );
    const res = await fetch(`${BASE_URL}/api/meet/${roomA.roomId}/classroom`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `skillnova_session=${soniyaToken}`,
      },
      body: JSON.stringify({
        action: "add-material",
        title: "Malicious PDF Upload",
      }),
    });
    if (res.status !== 403) throw new Error(`Expected 403 Forbidden, got ${res.status}`);
  });

  // 16. Student cannot launch classroom polls
  await assert("Student cannot launch classroom polls (403)", async () => {
    const soniyaToken = jwt.sign(
      { userId: "usr-student-soniya", name: "Soniya Chauhan", role: "student", roomId: roomA.roomId },
      DEV_SECRET,
      { expiresIn: "1h", algorithm: "HS256" }
    );
    const res = await fetch(`${BASE_URL}/api/meet/${roomA.roomId}/classroom`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `skillnova_session=${soniyaToken}`,
      },
      body: JSON.stringify({
        action: "create-poll",
        question: "Unauthorized Poll Question",
        options: ["Yes", "No"],
      }),
    });
    if (res.status !== 403) throw new Error(`Expected 403 Forbidden, got ${res.status}`);
  });

  // 17. Nonexistent Room GET rejects with 404
  await assert("Nonexistent classroom resource query safely returns 404 Not Found", async () => {
    const res = await fetch(`${BASE_URL}/api/meet/nonexistent-fake-room-id-9999/classroom`);
    if (res.status !== 404) throw new Error(`Expected 404 Not Found, got ${res.status}`);
  });

  // 18. Nonexistent Room POST rejects with 404
  await assert("Nonexistent classroom action dispatch safely returns 404 Not Found", async () => {
    const res = await fetch(`${BASE_URL}/api/meet/nonexistent-fake-room-id-9999/classroom`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "add-doubt", question: "Ghost question" }),
    });
    if (res.status !== 404) throw new Error(`Expected 404 Not Found, got ${res.status}`);
  });

  console.log("==========================================================");
  console.log(`Security Test Results: ${passed} passed, ${failed} failed`);
  console.log("==========================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runSecurityAuthSuite();
