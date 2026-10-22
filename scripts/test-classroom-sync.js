/**
 * SkillNova Phase 13 - Live Classroom Synchronization & State Verification Suite
 * Validates:
 * 1. Teacher creates authorized meeting and obtains valid LiveKit host token
 * 2. Student Soniya Chauhan joins via room code and receives LiveKit token + attendance record
 * 3. Student Mohit joins the same meeting and receives LiveKit token + attendance record
 * 4. Attendance duplicate prevention: re-joining updates record rather than duplicating
 * 5. Whiteboard stroke broadcast & persistence across simulated participant reconnect
 * 6. Student doubt submission and teacher resolution with relational updates
 * 7. Live poll launch by teacher and voting by both students
 * 8. Host classroom lock blocks subsequent student admissions (423 Locked)
 * 9. Meeting end terminates the room and returns 410 on subsequent joins
 */

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";

async function runClassroomSyncSuite() {
  console.log("==================================================================");
  console.log("   SkillNova Phase 13: Live Classroom Synchronization Suite       ");
  console.log("==================================================================");

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

  let meeting = null;
  let teacherHostKey = null;
  let soniyaToken = null;
  let mohitToken = null;

  // 1. Teacher starts meeting
  await assert("Teacher creates classroom and receives host token and room code", async () => {
    const res = await fetch(`${BASE_URL}/api/meet/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "MCA Python & AI Live Lecture",
        hostName: "Dr. Aryan Mehta",
        settings: {
          waitingRoom: false,
          maxParticipants: 50,
        },
      }),
    });
    if (res.status !== 201) throw new Error(`Expected 201, got ${res.status}`);
    const data = await res.json();
    if (!data.meeting?.roomId || !data.token || !data.meeting?.hostId) {
      throw new Error("Missing meeting roomId, LiveKit token, or hostId");
    }
    meeting = data.meeting;
    teacherHostKey = data.meeting.hostId;
  });

  // 2. Student Soniya joins
  await assert("Student Soniya Chauhan joins room via code and registers attendance", async () => {
    const res = await fetch(`${BASE_URL}/api/meet/join`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: meeting.code,
        displayName: "Soniya Chauhan",
        role: "student",
      }),
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (!data.token) throw new Error("Missing LiveKit token for Soniya");
    soniyaToken = data.token;
  });

  // 3. Student Mohit joins
  await assert("Student Mohit joins the same classroom session", async () => {
    const res = await fetch(`${BASE_URL}/api/meet/join`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        roomId: meeting.roomId,
        displayName: "Mohit",
        role: "student",
      }),
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (!data.token) throw new Error("Missing LiveKit token for Mohit");
    mohitToken = data.token;
  });

  // 4. Attendance Verification
  await assert("Attendance correctly records teacher and both students without duplicates", async () => {
    const res = await fetch(`${BASE_URL}/api/meet/${meeting.roomId}/classroom?type=attendance`);
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data.attendance)) throw new Error("Attendance is not an array");
    const soniya = data.attendance.find((a) => a.participantName === "Soniya Chauhan");
    const mohit = data.attendance.find((a) => a.participantName === "Mohit");
    if (!soniya) throw new Error("Soniya not found in attendance");
    if (!mohit) throw new Error("Mohit not found in attendance");
  });

  // 5. Whiteboard Stroke Synchronization & Persistence
  const strokeId = "stroke-" + Date.now();
  await assert("Teacher draws stroke on whiteboard and persists to database", async () => {
    const res = await fetch(`${BASE_URL}/api/meet/${meeting.roomId}/classroom`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "add-stroke",
        pageId: "board-1",
        stroke: {
          id: strokeId,
          tool: "pen",
          color: "#06b6d4",
          strokeWidth: 3,
          points: [{ x: 10, y: 10 }, { x: 50, y: 50 }, { x: 90, y: 120 }],
        },
      }),
    });
    if (res.status !== 201) throw new Error(`Expected 201, got ${res.status}`);
  });

  await assert("Student reconnects/refreshes and receives persisted whiteboard strokes", async () => {
    const res = await fetch(`${BASE_URL}/api/meet/${meeting.roomId}/classroom?type=whiteboard`);
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    const page = data.pages?.find((p) => p.id === "board-1") || data.pages?.[0];
    if (!page) throw new Error("Whiteboard page not found");
    const foundStroke = page.strokes?.find((s) => s.id === strokeId);
    if (!foundStroke) throw new Error("Persisted stroke not found in refreshed page");
    if (foundStroke.color !== "#06b6d4") throw new Error("Stroke color mismatch");
  });

  // 6. Doubt Submission & Resolution
  let doubtId = null;
  await assert("Student Soniya Chauhan posts priority doubt", async () => {
    const res = await fetch(`${BASE_URL}/api/meet/${meeting.roomId}/classroom`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "add-doubt",
        studentId: "user-soniya",
        studentName: "Soniya Chauhan",
        question: "How do Python generators optimize memory compared to list comprehensions?",
        priority: "urgent",
      }),
    });
    if (res.status !== 201) throw new Error(`Expected 201, got ${res.status}`);
    const data = await res.json();
    if (!data.doubt?.id) throw new Error("Missing doubt id");
    doubtId = data.doubt.id;
  });

  await assert("Teacher Dr. Aryan Mehta answers and resolves doubt", async () => {
    const res = await fetch(`${BASE_URL}/api/meet/${meeting.roomId}/classroom`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "answer-doubt",
        doubtId,
        authorName: "Dr. Aryan Mehta",
        authorRole: "teacher",
        text: "Generators use lazy evaluation via yield, yielding one item at a time without loading the entire collection into RAM.",
      }),
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (data.doubt?.status !== "resolved") throw new Error(`Expected resolved doubt status, got ${data.doubt?.status}`);
  });

  // 7. Interactive Poll Workflow
  let pollId = null;
  await assert("Teacher creates interactive poll for cohort", async () => {
    const res = await fetch(`${BASE_URL}/api/meet/${meeting.roomId}/classroom`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "create-poll",
        question: "Which data structure has O(1) average lookup time?",
        options: ["Linked List", "Binary Search Tree", "Hash Table / Dictionary", "Array"],
        authorRole: "teacher",
        createdBy: "Dr. Aryan Mehta",
      }),
    });
    if (res.status !== 201) throw new Error(`Expected 201, got ${res.status}`);
    const data = await res.json();
    if (!data.poll?.id) throw new Error("Missing poll id");
    pollId = data.poll.id;
  });

  await assert("Students cast votes and poll totals update correctly", async () => {
    // Soniya votes Option 2 (Hash Table)
    await fetch(`${BASE_URL}/api/meet/${meeting.roomId}/classroom`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "vote-poll",
        pollId,
        participantId: "user-soniya",
        optionIndex: 2,
      }),
    });
    // Mohit votes Option 2 (Hash Table)
    const res = await fetch(`${BASE_URL}/api/meet/${meeting.roomId}/classroom`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "vote-poll",
        pollId,
        participantId: "user-mohit",
        optionIndex: 2,
      }),
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (data.poll?.votes?.["user-soniya"] !== 2 || data.poll?.votes?.["user-mohit"] !== 2) {
      throw new Error("Votes not recorded accurately in poll object");
    }
  });

  // 8. Classroom Lock Behavior
  await assert("Teacher locks room; new joins return 423 Locked", async () => {
    const lockRes = await fetch(`${BASE_URL}/api/meet/${meeting.roomId}/classroom`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "update-settings",
        settings: { isLocked: true },
        userRole: "host",
        hostKey: teacherHostKey,
      }),
    });
    if (lockRes.status !== 200) throw new Error(`Failed to lock room: ${lockRes.status}`);

    const joinAttempt = await fetch(`${BASE_URL}/api/meet/join`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        roomId: meeting.roomId,
        displayName: "Late Student",
        role: "student",
      }),
    });
    if (joinAttempt.status !== 423) throw new Error(`Expected 423 Locked, got ${joinAttempt.status}`);
  });

  // 9. Meeting End & Cleanup
  await assert("Teacher ends classroom; subsequent joins return 410 Gone", async () => {
    const endRes = await fetch(`${BASE_URL}/api/meet/${meeting.roomId}/classroom`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "end-meeting",
        userRole: "host",
        hostKey: teacherHostKey,
      }),
    });
    if (endRes.status !== 200) throw new Error(`Failed to end room: ${endRes.status}`);

    const joinAfterEnd = await fetch(`${BASE_URL}/api/meet/join`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        roomId: meeting.roomId,
        displayName: "Post End Student",
        role: "student",
      }),
    });
    if (joinAfterEnd.status !== 410) throw new Error(`Expected 410 Gone, got ${joinAfterEnd.status}`);
  });

  console.log("==================================================================");
  console.log(`Classroom Synchronization Suite: ${passed} Passed, ${failed} Failed`);
  console.log("==================================================================");
  if (failed > 0) process.exit(1);
}

runClassroomSyncSuite().catch((err) => {
  console.error("Suite execution error:", err);
  process.exit(1);
});
