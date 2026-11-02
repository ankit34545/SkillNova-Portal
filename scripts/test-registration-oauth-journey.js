/**
 * Automated Test Suite: Registration, Duplicate Email Prevention,
 * Role Escalation Prevention, and Google OAuth Validation
 */

const http = require("http");

function makeRequest({ port, path, method = "GET", headers = {}, body = null }) {
  return new Promise((resolve, reject) => {
    const postData = body ? JSON.stringify(body) : null;
    const reqHeaders = {
      ...headers,
      ...(postData ? { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(postData) } : {}),
    };

    const req = http.request(
      {
        hostname: "127.0.0.1",
        port,
        path,
        method,
        headers: reqHeaders,
      },
      (res) => {
        let rawData = "";
        res.on("data", (chunk) => {
          rawData += chunk;
        });
        res.on("end", () => {
          try {
            const parsed = rawData ? JSON.parse(rawData) : null;
            resolve({ status: res.statusCode, headers: res.headers, body: parsed });
          } catch (e) {
            resolve({ status: res.statusCode, headers: res.headers, raw: rawData });
          }
        });
      }
    );

    req.on("error", (e) => reject(e));
    if (postData) req.write(postData);
    req.end();
  });
}

async function runTests() {
  const PORT = 3099;
  console.log(`\n======================================================`);
  console.log(`Starting Registration, Google Auth & RBAC Verification`);
  console.log(`Targeting local instance at http://127.0.0.1:${PORT}`);
  console.log(`======================================================\n`);

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // 1. Password strength validation (less than 8 chars)
    const weakPassRes = await makeRequest({
      port: PORT,
      path: "/api/auth/signup",
      method: "POST",
      body: { name: "Test User", email: "testweak@example.com", password: "123" },
    });
    assert(weakPassRes.status === 400 && weakPassRes.body?.error?.includes("8 characters"), "Rejects password under 8 characters with HTTP 400");

    // 2. Password complexity validation (only letters or only digits)
    const noDigitsPassRes = await makeRequest({
      port: PORT,
      path: "/api/auth/signup",
      method: "POST",
      body: { name: "Test User", email: "testnodigit@example.com", password: "purealphabetpassword" },
    });
    assert(noDigitsPassRes.status === 400 && noDigitsPassRes.body?.error?.includes("letters and numbers"), "Rejects password without both letters & numbers with HTTP 400");

    // 3. Valid self-service signup creates STUDENT user
    const uniqueEmail = `student_${Date.now()}@example.com`;
    const validSignupRes = await makeRequest({
      port: PORT,
      path: "/api/auth/signup",
      method: "POST",
      body: { name: "Audit Student", email: uniqueEmail, password: "SecurePassword123!" },
    });
    assert(validSignupRes.status === 201 && validSignupRes.body?.user?.role === "STUDENT", "Creates new self-service user with STUDENT role and HTTP 201");

    // 4. Role Escalation Prevention: Attempt to pass role: 'ADMIN'
    const escalateEmail = `hacker_${Date.now()}@example.com`;
    const escalateRes = await makeRequest({
      port: PORT,
      path: "/api/auth/signup",
      method: "POST",
      body: { name: "Escalation Attempt", email: escalateEmail, password: "SecurePassword123!", role: "ADMIN" },
    });
    assert(escalateRes.status === 201 && escalateRes.body?.user?.role === "STUDENT", "Ignores or strips client-supplied ADMIN role and safely defaults to STUDENT");

    // 5. Duplicate email rejection
    const duplicateRes = await makeRequest({
      port: PORT,
      path: "/api/auth/signup",
      method: "POST",
      body: { name: "Duplicate Test", email: uniqueEmail, password: "SecurePassword123!" },
    });
    assert(duplicateRes.status === 409, "Rejects duplicate email with HTTP 409 conflict");

    // 6. Forged Google Credential Rejection
    const fakeGoogleRes = await makeRequest({
      port: PORT,
      path: "/api/auth/google",
      method: "POST",
      body: { credential: "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImhhY2tlckBnb29nbGUuY29tIn0.signature" },
    });
    assert(fakeGoogleRes.status === 401, "Rejects forged / unverified Google credential with HTTP 401");

    // 7. Google OAuth missing code / missing server credentials rejection
    const emptyGoogleRes = await makeRequest({
      port: PORT,
      path: "/api/auth/google",
      method: "POST",
      body: {},
    });
    assert(emptyGoogleRes.status === 400, "Rejects empty Google OAuth request payload with HTTP 400");

    console.log(`\n======================================================`);
    console.log(`Test Execution Summary: ${passed} Passed, ${failed} Failed`);
    console.log(`======================================================\n`);

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error("Test runner error:", err);
    process.exit(1);
  }
}

runTests();

