/**
 * SkillNova Integration & Security Test Suite
 * Validates:
 * 1. Meeting creation with valid/invalid inputs
 * 2. Room code and room ID resolution
 * 3. Role-based permission gating (host/teacher vs student)
 * 4. Classroom doubts submission and resolution
 * 5. Whiteboard stroke persistence and clear permissions
 * 6. LiveKit token generation and server URL presence
 */

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3005";

async function runTestSuite() {
  console.log("==================================================");
  console.log("   SkillNova Automated Integration & Security Suite");
  console.log("==================================================");
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

  // Test 1: Meeting Creation API Validation
  await assert("Rejects empty meeting creation payload with 400", async () => {
    const res = await fetch(`${BASE_URL}/api/meet/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "", hostName: "" }),
    });
    if (res.status !== 400) throw new Error(`Expected status 400, got ${res.status}`);
  });

  // Test 2: Valid Meeting Creation & Token Return
  let createdRoomId = "";
  let createdCode = "";
  let createdHostId = "";
  await assert("Creates new meeting with room ID, 6-char code, and LiveKit token", async () => {
    const res = await fetch(`${BASE_URL}/api/meet/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "Automated QA Virtual Room",
        hostName: "QA Instructor",
        description: "Regression testing room",
        visibility: "public",
      }),
    });
    if (res.status !== 201) throw new Error(`Expected status 201, got ${res.status}`);
    const data = await res.json();
    if (!data.meeting?.roomId) throw new Error("Missing meeting roomId");
    if (!data.meeting?.code || data.meeting.code.length !== 6) throw new Error("Invalid 6-character code");
    if (!data.token) throw new Error("Missing LiveKit host token");
    createdRoomId = data.meeting.roomId;
    createdCode = data.meeting.code;
    createdHostId = data.meeting.hostId;
  });

  // Test 3: Join Room via Room Code
  await assert("Joins room via 6-character meeting code and returns LiveKit token", async () => {
    const res = await fetch(`${BASE_URL}/api/meet/join`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: createdCode,
        displayName: "Student Peer 1",
        role: "student",
      }),
    });
    if (res.status !== 200) throw new Error(`Expected status 200, got ${res.status}`);
    const data = await res.json();
    if (data.meeting.roomId !== createdRoomId) throw new Error("Room ID mismatch");
    if (!data.token) throw new Error("Missing peer LiveKit token");
  });

  // Test 4: Classroom State Initial Endpoint
  await assert("Classroom API returns initialized whiteboard and doubt containers", async () => {
    const res = await fetch(`${BASE_URL}/api/meet/${createdRoomId}/classroom`);
    if (res.status !== 200) throw new Error(`Expected status 200, got ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data.doubts)) throw new Error("doubts must be an array");
    if (!Array.isArray(data.whiteboard)) throw new Error("whiteboard must be an array");
  });

  // Test 5: Doubt Submission & Resolution
  let createdDoubtId = "";
  await assert("Allows student to submit a priority doubt and stores it", async () => {
    const res = await fetch(`${BASE_URL}/api/meet/${createdRoomId}/classroom`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "add-doubt",
        studentId: "student-101",
        studentName: "Student Peer 1",
        question: "How does LiveKit negotiate ICE candidate pairs?",
        priority: "urgent",
      }),
    });
    if (res.status !== 201) throw new Error(`Expected status 201, got ${res.status}`);
    const data = await res.json();
    if (!data.doubt?.id) throw new Error("Missing doubt ID");
    createdDoubtId = data.doubt.id;
  });

  await assert("Allows teacher to answer and resolve the submitted doubt", async () => {
    const res = await fetch(`${BASE_URL}/api/meet/${createdRoomId}/classroom`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "answer-doubt",
        doubtId: createdDoubtId,
        authorName: "QA Instructor",
        authorRole: "teacher",
        text: "ICE candidates are exchanged through the WebSocket signaling channel.",
      }),
    });
    if (res.status !== 200) throw new Error(`Expected status 200, got ${res.status}`);
    const data = await res.json();
    if (data.doubt.status !== "resolved") throw new Error("Doubt status should be resolved");
    if (data.doubt.answers.length === 0) throw new Error("Missing answer entry");
  });

  // Test 6: Collaborative Whiteboard Stroke Persistence
  await assert("Persists whiteboard stroke and confirms peer retrieval", async () => {
    const stroke = {
      id: "stroke-qa-1",
      tool: "rect",
      x: 100,
      y: 100,
      width: 250,
      height: 150,
      color: "#38bdf8",
      strokeWidth: 4,
    };
    const res = await fetch(`${BASE_URL}/api/meet/${createdRoomId}/classroom`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "add-stroke",
        pageId: "board-1",
        stroke,
      }),
    });
    if (res.status !== 201) throw new Error(`Expected status 201, got ${res.status}`);

    const verifyRes = await fetch(`${BASE_URL}/api/meet/${createdRoomId}/classroom?type=whiteboard`);
    const data = await verifyRes.json();
    const hasStroke = data.pages?.[0]?.strokes?.some((s) => s.id === "stroke-qa-1");
    if (!hasStroke) throw new Error("Stroke was not persisted in room whiteboard page");
  });

  // Test 7: Security Gating - Student Unauthorized Host Action
  await assert("Blocks unauthorized student from ending classroom with 403 Forbidden", async () => {
    const res = await fetch(`${BASE_URL}/api/meet/${createdRoomId}/classroom`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "end-meeting",
        userRole: "student",
      }),
    });
    if (res.status !== 403) throw new Error(`Expected status 403, got ${res.status}`);
  });

  await assert("Blocks unverified user from claiming teacher role without hostKey (403 Forbidden)", async () => {
    const res = await fetch(`${BASE_URL}/api/meet/${createdRoomId}/classroom`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "update-settings",
        settings: { isLocked: true },
        userRole: "teacher", // Attempted impersonation without hostKey
      }),
    });
    if (res.status !== 403) throw new Error(`Expected status 403, got ${res.status}`);
  });

  // Test 8: Authorized Instructor Action Execution with verified hostKey
  await assert("Allows verified instructor to lock classroom with 200 OK using hostKey", async () => {
    const res = await fetch(`${BASE_URL}/api/meet/${createdRoomId}/classroom`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "update-settings",
        settings: { isLocked: true },
        userRole: "teacher",
        hostKey: createdHostId, // Verified host credential
      }),
    });
    if (res.status !== 200) throw new Error(`Expected status 200, got ${res.status}`);
    const data = await res.json();
    if (!data.meeting?.settings?.isLocked) throw new Error("Meeting was not locked");
  });

  // Test 9: Whiteboard Clear Authorization & Stroke Purge
  await assert("Blocks unauthorized student from clearing whiteboard with 403 Forbidden", async () => {
    const res = await fetch(`${BASE_URL}/api/meet/${createdRoomId}/classroom`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "clear-whiteboard",
        pageId: "board-1",
        userRole: "student",
      }),
    });
    if (res.status !== 403) throw new Error(`Expected status 403, got ${res.status}`);
  });

  await assert("Allows verified instructor to clear whiteboard and purges strokes", async () => {
    const res = await fetch(`${BASE_URL}/api/meet/${createdRoomId}/classroom`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "clear-whiteboard",
        pageId: "board-1",
        userRole: "teacher",
        hostKey: createdHostId,
      }),
    });
    if (res.status !== 200) throw new Error(`Expected status 200, got ${res.status}`);

    const verifyRes = await fetch(`${BASE_URL}/api/meet/${createdRoomId}/classroom?type=whiteboard`);
    const data = await verifyRes.json();
    const strokes = data.pages?.[0]?.strokes || [];
    if (strokes.length !== 0) throw new Error(`Expected 0 strokes after clear, found ${strokes.length}`);
  });

  console.log("==================================================");
  console.log(`   Suite Results: ${passed} Passed, ${failed} Failed`);
  console.log("==================================================");

  if (failed > 0) process.exit(1);
}

runTestSuite().catch((e) => {
  console.error("Test execution failed:", e);
  process.exit(1);
});
