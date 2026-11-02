import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedSession, hashPassword } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/users
 * Search, filter by role/status, and paginate all platform users.
 *
 * POST /api/admin/users
 * Admin action dispatcher:
 * - create_user
 * - update_user (name, email, role)
 * - reset_password
 * - delete_user (with last-superadmin safeguard)
 */
export async function GET(req: NextRequest) {
  try {
    const session = getAuthenticatedSession(req);
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admin privileges required." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query")?.trim() || "";
    const roleFilter = searchParams.get("role")?.toUpperCase();
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get("limit") || "15", 10)));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query) {
      where.OR = [
        { name: { contains: query, mode: "insensitive" } },
        { email: { contains: query, mode: "insensitive" } },
      ];
    }
    if (roleFilter && ["STUDENT", "TEACHER", "ADMIN", "HOST"].includes(roleFilter)) {
      where.role = roleFilter;
    }

    const [totalUsers, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          avatarUrl: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              enrollments: true,
              hostedMeetings: true,
              taughtCourses: true,
              submissions: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
    ]);

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total: totalUsers,
        totalPages: Math.ceil(totalUsers / limit),
      },
    });
  } catch (error: any) {
    console.error("[/api/admin/users:GET] Error:", error?.message || error);
    return NextResponse.json({ error: "Failed to retrieve user accounts." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = getAuthenticatedSession(req);
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admin privileges required." }, { status: 403 });
    }

    const body = await req.json();
    const { action } = body;

    // 1. Create User Manually
    if (action === "create_user") {
      const { name, email, password, role } = body;
      if (!name?.trim() || !email?.trim() || !password) {
        return NextResponse.json({ error: "Name, email, and password are required." }, { status: 400 });
      }

      const trimmedEmail = email.trim().toLowerCase();
      const existing = await prisma.user.findUnique({ where: { email: trimmedEmail } });
      if (existing) {
        return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
      }

      const assignedRole = ["STUDENT", "TEACHER", "ADMIN"].includes(role?.toUpperCase())
        ? role.toUpperCase()
        : "STUDENT";

      const passwordHash = await hashPassword(password);
      const user = await prisma.user.create({
        data: {
          name: name.trim(),
          email: trimmedEmail,
          passwordHash,
          role: assignedRole,
        },
        select: { id: true, name: true, email: true, role: true, createdAt: true },
      });

      // Audit Log
      try {
        await prisma.auditLog.create({
          data: {
            adminId: session.userId,
            action: "USER_MANUALLY_CREATED",
            targetType: "USER",
            targetId: user.id,
            details: { email: user.email, role: user.role },
          },
        });
      } catch {}

      return NextResponse.json({ success: true, user }, { status: 201 });
    }

    // 2. Update User (Name, Email, Role)
    if (action === "update_user") {
      const { userId, name, email, role } = body;
      if (!userId) {
        return NextResponse.json({ error: "User ID is required." }, { status: 400 });
      }

      const target = await prisma.user.findUnique({ where: { id: userId } });
      if (!target) {
        return NextResponse.json({ error: "User not found." }, { status: 404 });
      }

      // Safeguard: Prevent removing admin role from the last active admin
      if (target.role === "ADMIN" && role && role.toUpperCase() !== "ADMIN") {
        const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
        if (adminCount <= 1) {
          return NextResponse.json(
            { error: "Cannot demote the last active super-admin on the platform." },
            { status: 400 }
          );
        }
      }

      const dataToUpdate: any = {};
      if (name?.trim()) dataToUpdate.name = name.trim();
      if (email?.trim()) dataToUpdate.email = email.trim().toLowerCase();
      if (role && ["STUDENT", "TEACHER", "ADMIN"].includes(role.toUpperCase())) {
        dataToUpdate.role = role.toUpperCase();
      }

      const updated = await prisma.user.update({
        where: { id: userId },
        data: dataToUpdate,
        select: { id: true, name: true, email: true, role: true, updatedAt: true },
      });

      try {
        await prisma.auditLog.create({
          data: {
            adminId: session.userId,
            action: "USER_UPDATED",
            targetType: "USER",
            targetId: target.id,
            details: dataToUpdate,
          },
        });
      } catch {}

      return NextResponse.json({ success: true, user: updated });
    }

    // 3. Reset User Password
    if (action === "reset_password") {
      const { userId, newPassword } = body;
      if (!userId || !newPassword || newPassword.length < 8) {
        return NextResponse.json(
          { error: "Valid User ID and minimum 8-character password required." },
          { status: 400 }
        );
      }

      const passwordHash = await hashPassword(newPassword);
      await prisma.user.update({
        where: { id: userId },
        data: { passwordHash },
      });

      try {
        await prisma.auditLog.create({
          data: {
            adminId: session.userId,
            action: "USER_PASSWORD_RESET",
            targetType: "USER",
            targetId: userId,
          },
        });
      } catch {}

      return NextResponse.json({ success: true, message: "Password updated successfully." });
    }

    // 4. Delete User (Destructive Action Safeguarded)
    if (action === "delete_user") {
      const { userId } = body;
      if (!userId) {
        return NextResponse.json({ error: "User ID is required." }, { status: 400 });
      }

      const target = await prisma.user.findUnique({ where: { id: userId } });
      if (!target) {
        return NextResponse.json({ error: "User not found." }, { status: 404 });
      }

      // Safeguard: Never delete the last admin or self
      if (target.role === "ADMIN") {
        const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
        if (adminCount <= 1) {
          return NextResponse.json(
            { error: "Cannot delete the last super-admin. Promote another admin first." },
            { status: 400 }
          );
        }
      }

      if (target.id === session.userId) {
        return NextResponse.json(
          { error: "Cannot delete your own active administrator session." },
          { status: 400 }
        );
      }

      await prisma.user.delete({ where: { id: userId } });

      try {
        await prisma.auditLog.create({
          data: {
            adminId: session.userId,
            action: "USER_DELETED",
            targetType: "USER",
            targetId: userId,
            details: { name: target.name, email: target.email },
          },
        });
      } catch {}

      return NextResponse.json({ success: true, message: "User deleted successfully." });
    }

    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  } catch (error: any) {
    console.error("[/api/admin/users:POST] Error:", error?.message || error);
    return NextResponse.json({ error: "Operation failed." }, { status: 500 });
  }
}

