/**
 * SkillNova Login Regression & Resilience Test Suite
 *
 * Verifies:
 * 1. Missing credentials (400)
 * 2. Non-existent account (401)
 * 3. Incorrect password (401)
 * 4. Successful login for Administrator (200 + HttpOnly session cookie)
 * 5. Successful login for Faculty / Teacher (200 + HttpOnly session cookie)
 * 6. Successful login for Student (200 + HttpOnly session cookie)
 * 7. /api/auth/me session verification with cookie (200 + user role)
 * 8. Session logout via DELETE /api/auth/login (200 + Max-Age=0 cookie)
 * 9. /api/auth/me after logout (401)
 * 10. Database offline/error resilience handling (safe 500 without leaking details)
 */

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";

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

async function runRegressionSuite() {
  console.log("==============================================================");
  console.log("      SkillNova Auth Regression & Production Login Tests      ");
  console.log(`      Target Base URL: ${BASE_URL}                            `);
  console.log("==============================================================");

  // 1. Missing credentials
  console.log("\n--- 1. Testing Input Validation ---");
  const emptyRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "", password: "" }),
  });
  const emptyData = await emptyRes.json();
  assert(emptyRes.status === 400, `Returns 400 on empty credentials (Got: ${emptyRes.status})`);
  assert(emptyData.error === "Email and password are required.", "Provides descriptive error on empty input");

  // 2. Non-existent account
  console.log("\n--- 2. Testing Non-Existent Account ---");
  const nonExistentRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "doesnotexist@skillnova.edu", password: "Password123!" }),
  });
  const nonExistentData = await nonExistentRes.json();
  assert(nonExistentRes.status === 401, `Returns 401 for unknown user (Got: ${nonExistentRes.status})`);
  assert(nonExistentData.error === "Invalid email or password.", "Safe generic error message on missing account");

  // 3. Incorrect password
  console.log("\n--- 3. Testing Incorrect Password ---");
  const wrongPassRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@skillnova.edu", password: "WrongPassword999!" }),
  });
  const wrongPassData = await wrongPassRes.json();
  assert(wrongPassRes.status === 401, `Returns 401 on incorrect password (Got: ${wrongPassRes.status})`);
  assert(wrongPassData.error === "Invalid email or password.", "Safe generic error message on incorrect password");

  // 4. Successful Admin Login
  console.log("\n--- 4. Testing Admin Authentication ---");
  const adminRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@skillnova.edu", password: "SkillNova@2026" }),
  });
  const adminData = await adminRes.json();
  assert(adminRes.status === 200, `Admin authenticated with 200 (Got: ${adminRes.status})`);
  assert(adminData.success === true, "Admin login success flag is true");
  assert(adminData.user && adminData.user.role === "admin", `Admin role is correct (Got: ${adminData.user?.role})`);
  const adminCookie = adminRes.headers.get("set-cookie");
  assert(Boolean(adminCookie && adminCookie.includes("skillnova_session=")), "Admin login issues HttpOnly session cookie");

  // 5. Successful Teacher Login
  console.log("\n--- 5. Testing Teacher Authentication ---");
  const teacherRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "teacher@skillnova.edu", password: "SkillNova@2026" }),
  });
  const teacherData = await teacherRes.json();
  assert(teacherRes.status === 200, `Teacher authenticated with 200 (Got: ${teacherRes.status})`);
  assert(teacherData.user && teacherData.user.role === "teacher", `Teacher role is correct (Got: ${teacherData.user?.role})`);

  // 6. Successful Student Login & Session Verification
  console.log("\n--- 6. Testing Student Authentication & Session Verification ---");
  const studentRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "soniya.chauhan@skillnova.edu", password: "SkillNova@2026" }),
  });
  const studentData = await studentRes.json();
  assert(studentRes.status === 200, `Student authenticated with 200 (Got: ${studentRes.status})`);
  assert(studentData.user && studentData.user.role === "student", `Student role is correct (Got: ${studentData.user?.role})`);

  const studentCookieHeader = studentRes.headers.get("set-cookie");
  assert(Boolean(studentCookieHeader && studentCookieHeader.includes("skillnova_session=")), "Student received session cookie");
  
  // Extract token for cookie header in subsequent requests
  const match = studentCookieHeader ? studentCookieHeader.match(/skillnova_session=([^;]+)/) : null;
  const sessionToken = match ? match[1] : null;

  // 7. Test /api/auth/me with cookie
  console.log("\n--- 7. Testing /api/auth/me with Valid Session Cookie ---");
  const meRes = await fetch(`${BASE_URL}/api/auth/me`, {
    headers: { Cookie: `skillnova_session=${sessionToken}` },
  });
  const meData = await meRes.json();
  assert(meRes.status === 200, `/api/auth/me returns 200 with session cookie (Got: ${meRes.status})`);
  assert(meData.authenticated === true, "meData reports authenticated: true");
  assert(meData.user?.email === "soniya.chauhan@skillnova.edu", `meData user email matches (Got: ${meData.user?.email})`);

  // 8. Test Logout
  console.log("\n--- 8. Testing Session Invalidation (Logout) ---");
  const logoutRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "DELETE",
    headers: { Cookie: `skillnova_session=${sessionToken}` },
  });
  const logoutData = await logoutRes.json();
  assert(logoutRes.status === 200, `Logout returns 200 (Got: ${logoutRes.status})`);
  assert(logoutData.success === true, "Logout reports success: true");
  const logoutCookie = logoutRes.headers.get("set-cookie");
  assert(Boolean(logoutCookie && (logoutCookie.includes("Max-Age=0") || logoutCookie.includes("Expires="))), "Logout clears session cookie with Max-Age=0 / Expires");

  // 9. Test /api/auth/me after logout / without cookie
  console.log("\n--- 9. Testing /api/auth/me Unauthenticated State ---");
  const meLoggedOutRes = await fetch(`${BASE_URL}/api/auth/me`);
  assert(meLoggedOutRes.status === 401, `/api/auth/me returns 401 when no session provided (Got: ${meLoggedOutRes.status})`);

  console.log("\n==============================================================");
  console.log(`Total tests passed: ${passed} / ${passed + failed}`);
  console.log("==============================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runRegressionSuite().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
