import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { LANGUAGE_REGISTRY } from "@/lib/code-runner";

export const dynamic = "force-dynamic";

/**
 * GET /api/codinglab/projects
 * Retrieves projects owned by the authenticated student or template projects.
 *
 * POST /api/codinglab/projects
 * Saves, creates, updates or deletes student projects.
 */
export async function GET(req: NextRequest) {
  try {
    const session = getAuthenticatedSession(req);
    const { searchParams } = new URL(req.url);
    const templateOnly = searchParams.get("templates") === "true";

    if (templateOnly) {
      try {
        const templates = await prisma.codingProject.findMany({
          where: { isTemplate: true },
          take: 20,
          orderBy: { updatedAt: "desc" },
        });
        return NextResponse.json({ projects: templates });
      } catch (dbErr) {
        // Fallback to built-in language templates if DB table not yet migrated
        const defaultTemplates = Object.entries(LANGUAGE_REGISTRY).map(([key, def]) => ({
          id: `tpl-${key}`,
          title: `${def.name} Starter`,
          language: key,
          files: def.templateFiles,
          isTemplate: true,
        }));
        return NextResponse.json({ projects: defaultTemplates });
      }
    }

    if (!session) {
      return NextResponse.json({ error: "Authentication required to view your projects." }, { status: 401 });
    }

    const projects = await prisma.codingProject.findMany({
      where: { userId: session.userId },
      orderBy: { updatedAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ projects });
  } catch (error: any) {
    console.error("[/api/codinglab/projects:GET]", error?.message || error);
    return NextResponse.json({ error: "Failed to load projects." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = getAuthenticatedSession(req);
    if (!session) {
      return NextResponse.json({ error: "Authentication required to save projects." }, { status: 401 });
    }

    const body = await req.json();
    const { action, projectId, title, description, language, files } = body;

    // 1. Create or Save Project
    if (action === "save" || action === "create") {
      if (!title?.trim()) {
        return NextResponse.json({ error: "Project title is required." }, { status: 400 });
      }

      const langKey = language?.toLowerCase() || "javascript";
      const filesToSave = files && typeof files === "object" ? files : (LANGUAGE_REGISTRY[langKey]?.templateFiles || {});

      if (projectId) {
        // Ownership check: ensure user owns this project or is admin
        const existing = await prisma.codingProject.findUnique({ where: { id: projectId } });
        if (!existing) {
          return NextResponse.json({ error: "Project not found." }, { status: 404 });
        }
        if (existing.userId !== session.userId && session.role !== "admin") {
          return NextResponse.json({ error: "Forbidden: You cannot modify another user's project." }, { status: 403 });
        }

        const updated = await prisma.codingProject.update({
          where: { id: projectId },
          data: {
            title: title.trim(),
            description: description?.trim() || null,
            language: langKey,
            files: filesToSave,
          },
        });
        return NextResponse.json({ success: true, project: updated });
      }

      // Create new
      const project = await prisma.codingProject.create({
        data: {
          userId: session.userId,
          title: title.trim(),
          description: description?.trim() || null,
          language: langKey,
          files: filesToSave,
        },
      });

      return NextResponse.json({ success: true, project }, { status: 201 });
    }

    // 2. Delete Project
    if (action === "delete") {
      if (!projectId) return NextResponse.json({ error: "Project ID required." }, { status: 400 });

      const existing = await prisma.codingProject.findUnique({ where: { id: projectId } });
      if (!existing) return NextResponse.json({ error: "Project not found." }, { status: 404 });
      if (existing.userId !== session.userId && session.role !== "admin") {
        return NextResponse.json({ error: "Forbidden: Cannot delete another user's project." }, { status: 403 });
      }

      await prisma.codingProject.delete({ where: { id: projectId } });
      return NextResponse.json({ success: true, message: "Project deleted." });
    }

    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  } catch (error: any) {
    console.error("[/api/codinglab/projects:POST]", error?.message || error);
    return NextResponse.json({ error: "Failed to process project request." }, { status: 500 });
  }
}

