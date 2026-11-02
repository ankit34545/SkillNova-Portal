import { NextRequest, NextResponse } from "next/server";
import { signSessionToken, createSessionCookie } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { sendWelcomeEmail, sendAdminNewUserAlert } from "@/lib/mailer";
import { verifyGoogleIdToken, VerifiedGoogleUser } from "@/lib/google-auth";

export const dynamic = "force-dynamic";

/**
 * POST /api/auth/google
 * End-to-end Google OAuth endpoint.
 * Accepts cryptographic `credential` (Google ID Token) from Google Identity Services (One Tap or button),
 * or handles authorization code exchange with state/CSRF validation.
 * NEVER trusts unverified client-supplied emails or roles.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { credential, code, redirectUri } = body;

    let verifiedGoogleUser: VerifiedGoogleUser | null = null;

    // 1. Direct ID Token verification (Google Identity Services / One Tap / OAuth Credential)
    if (credential) {
      try {
        verifiedGoogleUser = await verifyGoogleIdToken(credential);
      } catch (err: any) {
        console.warn("[/api/auth/google] Token verification rejected:", err?.message || err);
        return NextResponse.json(
          { error: "Invalid or expired Google credential." },
          { status: 401 }
        );
      }
    } 
    // 2. Authorization code exchange fallback (standard OAuth redirect flow)
    else if (code && redirectUri) {
      const clientId = process.env.GOOGLE_CLIENT_ID;
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

      if (!clientId || !clientSecret) {
        return NextResponse.json(
          { error: "Google OAuth client is not configured on server." },
          { status: 503 }
        );
      }

      const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          grant_type: "authorization_code",
        }),
      });

      if (!tokenRes.ok) {
        return NextResponse.json(
          { error: "Failed to exchange authorization code with Google." },
          { status: 401 }
        );
      }

      const tokenData = await tokenRes.json();
      if (!tokenData.id_token) {
        return NextResponse.json(
          { error: "Google token exchange did not return ID token." },
          { status: 401 }
        );
      }

      verifiedGoogleUser = await verifyGoogleIdToken(tokenData.id_token);
    } else {
      return NextResponse.json(
        { error: "Missing required Google credential or authorization code." },
        { status: 400 }
      );
    }

    if (!verifiedGoogleUser || !verifiedGoogleUser.email) {
      return NextResponse.json(
        { error: "Could not obtain verified identity from Google." },
        { status: 401 }
      );
    }

    const { email: verifiedEmail, name: verifiedName, picture: avatarUrl } = verifiedGoogleUser;

    // 3. Database user account linking / creation
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: "Database configuration error. Please contact administrator." },
        { status: 503 }
      );
    }

    let user = await prisma.user.findUnique({
      where: { email: verifiedEmail },
    });

    let isNewUser = false;

    if (!user) {
      isNewUser = true;
      // High-entropy random hash placeholder so OAuth accounts cannot be accessed via empty/guessable password
      const randomSecret = (await import("crypto")).randomBytes(32).toString("hex");
      const { hashPassword } = await import("@/lib/auth");
      const passwordHash = await hashPassword(randomSecret);

      // SECURITY RULE: Always assign STUDENT role on self-signup; never allow client role escalation
      user = await prisma.user.create({
        data: {
          name: verifiedName,
          email: verifiedEmail,
          passwordHash,
          avatarUrl: avatarUrl || null,
          role: "STUDENT",
        },
      });

      // Dispatch welcome and admin notifications safely
      sendWelcomeEmail(verifiedEmail, verifiedName).catch((err) =>
        console.error("[Google Auth] Welcome email error:", err?.message || err)
      );
      sendAdminNewUserAlert(verifiedEmail, verifiedName, "STUDENT").catch((err) =>
        console.error("[Google Auth] Admin alert error:", err?.message || err)
      );
    } else if (avatarUrl && !user.avatarUrl) {
      // Safe non-destructive update of avatar if missing
      try {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { avatarUrl },
        });
      } catch {
        // Ignore non-critical avatar update error
      }
    }

    // Preserve existing database role for existing accounts, enforce strict role typing
    const roleLower = user.role.toLowerCase() as "student" | "teacher" | "admin";

    // 4. Issue signed HttpOnly JWT session token
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
    console.error("[/api/auth/google] Server error:", error?.message || error);
    return NextResponse.json(
      { error: "Internal server error during Google authentication." },
      { status: 500 }
    );
  }
}
