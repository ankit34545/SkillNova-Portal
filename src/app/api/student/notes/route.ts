import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { ClassroomRepository } from "@/lib/repository";

export async function GET(req: NextRequest) {
  try {
    const session = getAuthenticatedSession(req);
    const userId = session?.userId || req.nextUrl.searchParams.get("userId") || "std-101";

    const notes = await prisma.note.findMany({
      where: { authorId: userId },
      include: {
        meeting: {
          select: {
            title: true,
            roomId: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({
      notes: notes.map((n) => ({
        id: n.id,
        title: n.title,
        content: n.content,
        isShared: n.isShared,
        course: n.meeting?.title || "Engineering Track",
        roomId: n.meeting?.roomId || "ai-eng-live",
        updatedAt: n.updatedAt,
      })),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to retrieve student notes" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = getAuthenticatedSession(req);
    const body = await req.json();
    const authorId = session?.userId || body.authorId || "std-101";
    const authorName = session?.name || body.authorName || "Arjun Verma";
    const { title, content, roomId = "ai-eng-live", isShared = false } = body;

    if (!title?.trim()) {
      return NextResponse.json({ error: "Note title is required." }, { status: 400 });
    }

    const note = await ClassroomRepository.saveNote(roomId, {
      id: body.id,
      authorId,
      authorName,
      title: title.trim(),
      content: content || "",
      isShared: !!isShared,
    });

    return NextResponse.json({ note }, { status: 201 });
  } catch (error: any) {
    console.error("[/api/student/notes]", error);
    return NextResponse.json(
      { error: error.message || "Failed to persist note" },
      { status: 500 }
    );
  }
}
