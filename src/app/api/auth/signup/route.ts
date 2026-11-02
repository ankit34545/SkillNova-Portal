import { NextRequest, NextResponse } from "next/server";
import { hashPassword, signSessionToken, createSessionCookie } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { sendWelcomeEmail, sendAdminNewUserAlert } from "@/lib/mailer";

export const dynamic = "force-dynamic";

/**
 * POST /api/auth/signup
 * Self-service signup with strong password verification, database duplication check,
 * secure bcrypt hashing, session cookie issuance, and automated transactional emails.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password } = body;

    // 1. Mandatory input checks
    if (!name?.trim() || !email?.trim() || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required." },
        { status: 400 }
      );
    }

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();

    // 2. Strong email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    // 3. Strict privacy & password strength checks
    // Must be at least 8 chars, contain letters and numbers
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long." },
        { status: 400 }
      );
    }

    if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
      return NextResponse.json(
        { error: "Password must contain both letters and numbers for strong security." },
        { status: 400 }
      );
    }

    // 4. Verify database connectivity
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: "Database configuration error. Please contact administrator." },
        { status: 503 }
      );
    }

    // 5. Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email: trimmedEmail },
    });

    if (existing) {
      return NextResponse.json(
        { error: "An account with this email address already exists. Please log in." },
        { status: 409 }
      );
    }

    // 6. Secure password hashing with salt cost 12
    const passwordHash = await hashPassword(password);

    // 7. Create new user in PostgreSQL (default role: STUDENT for self-signups to preserve security)
    const newUser = await prisma.user.create({
      data: {
        name: trimmedName,
        email: trimmedEmail,
        passwordHash,
        role: "STUDENT",
      },
    });

    // 8. Trigger emails asynchronously without blocking response
    sendWelcomeEmail(trimmedEmail, trimmedName).catch((err) =>
      console.error("[Signup] Welcome email error:", err)
    );
    sendAdminNewUserAlert(trimmedEmail, trimmedName, "STUDENT").catch((err) =>
      console.error("[Signup] Admin notification error:", err)
    );

    // 9. Sign session JWT token
    const token = signSessionToken({
      userId: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: "student",
    });

    const response = NextResponse.json(
      {
        success: true,
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: "student",
        },
        message: "Account created successfully.",
      },
      { status: 201 }
    );

    response.headers.set("Set-Cookie", createSessionCookie(token));
    return response;
  } catch (error: any) {
    console.error("[/api/auth/signup] Error:", error?.message || error);
    return NextResponse.json(
      { error: "Internal server error during account creation." },
      { status: 500 }
    );
  }
}

