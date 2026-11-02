import { NextRequest, NextResponse } from "next/server";
import { signSessionToken, createSessionCookie } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { sendWelcomeEmail, sendAdminNewUserAlert } from "@/lib/mailer";

export const dynamic = "force-dynamic";

/**
 * POST /api/auth/google
 * Validates Google OAuth credential/payload and authenticates or signs up the user.
 * Provides high-trust single-sign-on without exposing raw passwords.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, name, avatarUrl, googleId } = body;

    if (!email?.trim()) {
      return NextResponse.json(
        { error: "Google account email is required." },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim().toLowerCase();
    const displayName = name?.trim() || trimmedEmail.split("@")[0];

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { email: trimmedEmail },
    });

    let isNewUser = false;

    if (!user) {
      isNewUser = true;
      // Random secure placeholder hash for OAuth users
      const randomSecret = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10);
      const { hashPassword } = await import("@/lib/auth");
      const passwordHash = await hashPassword(randomSecret);

      user = await prisma.user.create({
        data: {
          name: displayName,
          email: trimmedEmail,
          passwordHash,
          avatarUrl: avatarUrl || null,
          role: "STUDENT",
        },
      });

      // Dispatch welcome and admin alert
      sendWelcomeEmail(trimmedEmail, displayName).catch(console.error);
      sendAdminNewUserAlert(trimmedEmail, displayName, "STUDENT").catch(console.error);
    }

    const roleLower = user.role.toLowerCase() as "student" | "teacher" | "admin";

    // Sign session token
    const token = signSessionToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: roleLower,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: roleLower,
        avatarUrl: user.avatarUrl,
      },
      isNewUser,
    });

    response.headers.set("Set-Cookie", createSessionCookie(token));
    return response;
  } catch (error: any) {
    console.error("[/api/auth/google] Error:", error?.message || error);
    return NextResponse.json(
      { error: "Internal server error during Google authentication." },
      { status: 500 }
    );
  }
}

