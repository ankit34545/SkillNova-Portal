/**
 * Verification Test: Two devices (Device 1: Laptop, Device 2: Mobile)
 * joining the same LiveKit room and verifying:
 * 1. Both get valid tokens pointing to the exact same room
 * 2. Identities are unique and properly registered
 * 3. Token decode verifies canPublish=true, canSubscribe=true
 * 4. Classroom attendance sync endpoint returns both participants
 */
const { decodeTokenPayload } = require("livekit-client");

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";

async function verifyTwoDeviceSync() {
  console.log("==================================================================");
  console.log("   SkillNova Multi-Device LiveKit Synchronization Verification     ");
  console.log("==================================================================");

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

  // Step 1: Create a meeting room
  console.log("\n1. Creating test meeting room...");
  const createRes = await fetch(`${BASE_URL}/api/meet/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: "Multi-Device Live Sync Room",
      hostName: "Instructor Ankit",
      settings: { waitingRoom: false, maxParticipants: 50 },
    }),
  });

  const createData = await createRes.json();
  const meeting = createData.meeting;
  assert(meeting && meeting.roomId, `Meeting created successfully: roomId=${meeting?.roomId}, code=${meeting?.code}`);

  // Step 2: Device 1 (Laptop - Student) joins
  console.log("\n2. Device 1 (Laptop - Student) joining room...");
  const dev1Res = await fetch(`${BASE_URL}/api/meet/join`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      roomId: meeting.roomId,
      displayName: "Student Laptop",
      role: "student",
    }),
  });
  const dev1Data = await dev1Res.json();
  assert(dev1Data.token, `Device 1 obtained LiveKit token`);
  assert(dev1Data.participantId, `Device 1 assigned unique participant ID: ${dev1Data.participantId}`);

  const dev1TokenPayload = decodeTokenPayload(dev1Data.token);
  assert(
    dev1TokenPayload.video.room === meeting.roomId,
    `Device 1 token room matches exactly (${dev1TokenPayload.video.room})`
  );
  assert(
    dev1TokenPayload.video.canPublish === true && dev1TokenPayload.video.canSubscribe === true,
    `Device 1 has canPublish=true & canSubscribe=true grants`
  );

  // Step 3: Device 2 (Mobile - Ankit Kumar) joins
  console.log("\n3. Device 2 (Mobile - Ankit Kumar) joining room...");
  const dev2Res = await fetch(`${BASE_URL}/api/meet/join`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      roomId: meeting.roomId,
      displayName: "Ankit Kumar Mobile",
      role: "student",
    }),
  });
  const dev2Data = await dev2Res.json();
  assert(dev2Data.token, `Device 2 obtained LiveKit token`);
  assert(dev2Data.participantId, `Device 2 assigned unique participant ID: ${dev2Data.participantId}`);
  assert(dev1Data.participantId !== dev2Data.participantId, `Both devices have distinct participant identities`);

  const dev2TokenPayload = decodeTokenPayload(dev2Data.token);
  assert(
    dev2TokenPayload.video.room === meeting.roomId,
    `Device 2 token room matches Device 1 room (${dev2TokenPayload.video.room})`
  );
  assert(
    dev2TokenPayload.video.canPublish === true && dev2TokenPayload.video.canSubscribe === true,
    `Device 2 has canPublish=true & canSubscribe=true grants`
  );

  // Step 4: Verify Classroom attendance query returns both devices
  console.log("\n4. Verifying Classroom attendance synchronization endpoint...");
  const classroomRes = await fetch(`${BASE_URL}/api/meet/${meeting.roomId}/classroom`);
  const classroomData = await classroomRes.json();

  const attendance = classroomData.attendance || [];
  const foundDev1 = attendance.some(
    (a) => (a.participantName === "Student Laptop" || a.userName === "Student Laptop")
  );
  const foundDev2 = attendance.some(
    (a) => (a.participantName === "Ankit Kumar Mobile" || a.userName === "Ankit Kumar Mobile")
  );

  assert(foundDev1, `Classroom data includes Device 1 (Student Laptop) in attendance list`);
  assert(foundDev2, `Classroom data includes Device 2 (Ankit Kumar Mobile) in attendance list`);

  console.log("\n==================================================================");
  console.log(`Results: ${passed} Passed, ${failed} Failed`);
  console.log("==================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

verifyTwoDeviceSync().catch((err) => {
  console.error("Verification error:", err);
  process.exit(1);
});

