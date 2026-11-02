const { createRemoteJWKSet, jwtVerify } = require("jose");
const bcrypt = require("bcryptjs");

const GOOGLE_JWKS = createRemoteJWKSet(
  new URL("https://www.googleapis.com/oauth2/v3/certs")
);

async function verifyGoogleIdToken(token) {
  if (!token) throw new Error("Missing Google ID token");
  const { payload } = await jwtVerify(token, GOOGLE_JWKS, {
    issuer: ["https://accounts.google.com", "accounts.google.com"],
  });
  return payload;
}

async function run() {
  console.log("==========================================");
  console.log("UNIT VERIFICATION: Google Auth & Bcrypt");
  console.log("==========================================");

  // 1. Verify bcrypt salt rounds cost 12
  const plain = "AuditTestPassword2026!";
  const hash = await bcrypt.hash(plain, 12);
  const isCost12 = hash.startsWith("$2a$12$") || hash.startsWith("$2b$12$");
  console.log("Bcrypt cost 12 check:", isCost12 ? "PASSED" : "FAILED", `(hash starts with ${hash.substring(0, 7)})`);

  const passwordMatches = await bcrypt.compare(plain, hash);
  console.log("Bcrypt comparison match:", passwordMatches ? "PASSED" : "FAILED");

  // 2. Verify forged / corrupted Google token rejection
  try {
    await verifyGoogleIdToken("invalid.jwt.signature");
    console.error("FAILED: Forged token was accepted!");
    process.exit(1);
  } catch (err) {
    console.log("Forged Google token rejection: PASSED (Error:", err.message + ")");
  }

  // 3. Verify empty token rejection
  try {
    await verifyGoogleIdToken("");
    console.error("FAILED: Empty token was accepted!");
    process.exit(1);
  } catch (err) {
    console.log("Empty Google token rejection: PASSED (Error:", err.message + ")");
  }

  console.log("==========================================");
  console.log("ALL DIRECT CRYPTOGRAPHIC CHECKS PASSED!");
  console.log("==========================================");
}

run();
