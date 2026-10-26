import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/auth/me
 * Returns the currently authenticated user's profile from the database based on the secure session.
 */
export async function GET(req: NextRequest) {
  try {
    const session = getAuthenticatedSession(req);

    if (!session) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    if (!dbUser) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        role: dbUser.role.toLowerCase(),
      },
    });
  } catch (err: any) {
    console.error("[/api/auth/me] error:", err);
    return NextResponse.json({ error: "Failed to verify session" }, { status: 500 });
  }
}
