// src/lib/google-auth.ts
// Secure verification of Google ID Tokens / OAuth Credentials using Google's JWKS
import * as jose from "jose";

const GOOGLE_ISSUERS = ["https://accounts.google.com", "accounts.google.com"];
const GOOGLE_JWKS_URL = new URL("https://www.googleapis.com/oauth2/v3/certs");
const JWKS = jose.createRemoteJWKSet(GOOGLE_JWKS_URL);

export interface VerifiedGoogleUser {
  email: string;
  name: string;
  picture?: string;
  sub: string; // Google User Unique ID
}

/**
 * Verify a Google ID token cryptographically against Google's public keys.
 * Validates issuer, signature, expiry, and (if configured) audience (client ID).
 */
export async function verifyGoogleIdToken(token: string): Promise<VerifiedGoogleUser> {
  const expectedAudience = process.env.GOOGLE_CLIENT_ID;

  const verifyOptions: jose.JWTVerifyOptions = {
    issuer: GOOGLE_ISSUERS,
  };

  if (expectedAudience) {
    verifyOptions.audience = expectedAudience;
  }

  const { payload } = await jose.jwtVerify(token, JWKS, verifyOptions);

  if (!payload.email || typeof payload.email !== "string") {
    throw new Error("Google token is missing valid email claim.");
  }

  if (payload.email_verified === false) {
    throw new Error("Google email address is not verified.");
  }

  return {
    email: payload.email.trim().toLowerCase(),
    name: (typeof payload.name === "string" ? payload.name : payload.email.split("@")[0]).trim(),
    picture: typeof payload.picture === "string" ? payload.picture : undefined,
    sub: payload.sub as string,
  };
}

