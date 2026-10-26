import { NextRequest, NextResponse } from "next/server";
import { verifyPassword, signSessionToken, createSessionCookie, clearSessionCookie, getAuthenticatedSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * POST /api/auth/login
 * Authenticates user credentials against PostgreSQL, returns session info, and sets secure HttpOnly cookie.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim().toLowerCase();

    // Query user from PostgreSQL
    const user = await prisma.user.findUnique({
      where: { email: trimmedEmail },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    // Verify password hash
    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    const roleLower = user.role.toLowerCase() as "student" | "teacher" | "admin";

    // Sign session token
    const token = signSessionToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: roleLower,
    });

    const userProfile = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: roleLower,
    };

    const response = NextResponse.json({
      success: true,
      user: userProfile,
    });

    response.headers.set("Set-Cookie", createSessionCookie(token));
    return response;
  } catch (error: any) {
    const errorMsg = error?.message || String(error);
    const errorCode = error?.code || "UNKNOWN";
    const errorName = error?.name || "Error";

    // Distinguish database connection/initialization failures vs other runtime issues
    const isDbError =
      errorName.includes("PrismaClient") ||
      errorCode.startsWith("P1") ||
      errorCode.startsWith("P2");

    console.error("[/api/auth/login] Diagnostic failure:", {
      type: isDbError ? "DATABASE_ERROR" : "RUNTIME_ERROR",
      name: errorName,
      code: errorCode,
      message: errorMsg,
      hasAuthSecret: Boolean(process.env.AUTH_SECRET),
      hasDbUrl: Boolean(process.env.DATABASE_URL),
    });

    return NextResponse.json(
      { error: "Internal server error during authentication." },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/auth/login
 * Clears authentication session cookie (Logout).
 */
export async function DELETE(req: NextRequest) {
  const response = NextResponse.json({ success: true, message: "Logged out successfully." });
  response.headers.set("Set-Cookie", clearSessionCookie());
  return response;
}
