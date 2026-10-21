// src/lib/auth.ts
// Secure JWT and bcrypt authentication utilities for SkillNova

import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

export interface SessionPayload {
  userId: string;
  email: string;
  name: string;
  role: "student" | "teacher" | "host" | "admin";
  roomId?: string;
  isHost?: boolean;
}

const JWT_SECRET = process.env.AUTH_SECRET || "skillnova_dev_jwt_secret_987654321_secure";
const SESSION_COOKIE_NAME = "skillnova_session";

/** Hash plain-text password */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

/** Compare plain-text password with bcrypt hash */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/** Sign secure short-lived session token (4h expiry) */
export function signSessionToken(payload: SessionPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "4h", algorithm: "HS256" });
}

/** Verify signed session token */
export function verifySessionToken(token: string): SessionPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET, { algorithms: ["HS256"] }) as SessionPayload;
  } catch {
    return null;
  }
}

/** Extract and verify user session from NextRequest cookies or Authorization header */
export function getAuthenticatedSession(req: NextRequest): SessionPayload | null {
  // 1. Check HttpOnly cookie
  const cookieToken = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (cookieToken) {
    const verified = verifySessionToken(cookieToken);
    if (verified) return verified;
  }

  // 2. Check Bearer Authorization header
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const headerToken = authHeader.substring(7).trim();
    return verifySessionToken(headerToken);
  }

  return null;
}

/** Build HttpOnly cookie string for authentication response */
export function createSessionCookie(token: string): string {
  const isProd = process.env.NODE_ENV === "production";
  return `${SESSION_COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${4 * 3600}${
    isProd ? "; Secure" : ""
  }`;
}
