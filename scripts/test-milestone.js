/**
 * Milestone Verification Test: Admin Control Center & CodingLab Endpoints
 */
const BASE_URL = process.env.TEST_BASE_URL || "http://127.0.0.1:3091";

async function runMilestoneVerification() {
  console.log("==================================================================");
  console.log("  SkillNova Admin Center & CodingLab Verification Suite           ");
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

  // 1. Unauthenticated Admin endpoint rejection
  console.log("\n1. Testing Admin API route security...");
  const unauthUsers = await fetch(`${BASE_URL}/api/admin/users`);
  assert(unauthUsers.status === 403, `Unauthenticated /api/admin/users blocked with 403 (${unauthUsers.status})`);

  const unauthSystem = await fetch(`${BASE_URL}/api/admin/system`);
  assert(unauthSystem.status === 403, `Unauthenticated /api/admin/system blocked with 403 (${unauthSystem.status})`);

  // 2. Unauthenticated CodingLab project modification rejection
  console.log("\n2. Testing CodingLab project authorization...");
  const unauthProjects = await fetch(`${BASE_URL}/api/codinglab/projects`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "save",
      title: "Hacked Project",
      files: {},
    }),
  });
  assert(unauthProjects.status === 401, `Unauthenticated /api/codinglab/projects rejected with 401 (${unauthProjects.status})`);

  // 3. Template retrieval without credentials
  const templates = await fetch(`${BASE_URL}/api/codinglab/projects?templates=true`);
  assert(templates.status === 200, `Public template projects endpoint accessible (${templates.status})`);

  // 4. Verify CodingLab page renders without runtime SSR errors
  console.log("\n3. Testing CodingLab and Admin UI routes...");
  const codingLabRes = await fetch(`${BASE_URL}/codinglab`);
  assert(codingLabRes.status === 200, `/codinglab page renders cleanly with HTTP 200 (${codingLabRes.status})`);

  const adminPageRes = await fetch(`${BASE_URL}/admin`);
  assert(adminPageRes.status === 200, `/admin page renders cleanly with HTTP 200 (${adminPageRes.status})`);

  console.log("\n==================================================================");
  console.log(`Results: ${passed} Passed, ${failed} Failed`);
  console.log("==================================================================");

  if (failed > 0) process.exit(1);
}

runMilestoneVerification().catch((err) => {
  console.error("Test error:", err);
  process.exit(1);
});

