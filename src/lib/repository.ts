// src/lib/repository.ts
// Authoritative PostgreSQL (Prisma) Repository with Multi-Entity Relational Transactions
// Directly persists Meetings, Memberships, Doubts, Notes, Whiteboard, Polls, and Attendance.

import prisma from "./prisma";
import { store } from "./meet-store";
import type {
  Meeting,
  DoubtQuestion,
  SharedNote,
  LearningMaterial,
  WhiteboardPage,
  WhiteboardStroke,
  Poll,
  ChatMessage,
  AttendanceRecord,
} from "@/types/meet";

export class ClassroomRepository {
  /** Check if PostgreSQL connection is alive and working */
  static async isConnected(): Promise<boolean> {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (err) {
      console.error("[ClassroomRepository.isConnected] Connection check failed:", err);
      return false;
    }
  }

  /**
   * Helper: Ensure a User record exists for a given participant/host identity
   * to satisfy relational foreign key constraints in PostgreSQL.
   */
  static async ensureUser(
    userId: string,
    name: string,
    role: "STUDENT" | "TEACHER" | "HOST" | "ADMIN" = "STUDENT"
  ) {
    try {
      const existing = await prisma.user.findUnique({ where: { id: userId } });
      if (existing) return existing;

      return await prisma.user.create({
        data: {
          id: userId,
          email: `${userId.replace(/[^a-zA-Z0-9_-]/g, "")}@skillnova.internal`,
          name: name || "Classroom Participant",
          role,
          passwordHash: "$2a$12$e68Y9x8rB24c0s9Y6E0UKeVl2r2e3gZ0wZ.9v5T8b1Q3v5U6V8i8S", // Default bcrypt hash placeholder
        },
      });
    } catch {
      // In case of race condition on concurrent creation
      return await prisma.user.findFirst({ where: { id: userId } });
    }
  }

  /** Create Meeting in PostgreSQL with Host relational link */
  static async createMeeting(meeting: Meeting): Promise<Meeting> {
    try {
      await this.ensureUser(meeting.hostId, meeting.hostName, "HOST");

      const created = await prisma.meeting.create({
        data: {
          id: meeting.id,
          roomId: meeting.roomId,
          code: meeting.code,
          title: meeting.title,
          description: meeting.description || null,
          hostId: meeting.hostId,
          hostName: meeting.hostName,
          status: meeting.status === "ended" ? "ENDED" : meeting.status === "waiting" ? "WAITING" : "ACTIVE",
          visibility: meeting.visibility,
          isLocked: !!meeting.settings?.isLocked,
          maxParticipants: meeting.settings?.maxParticipants || 100,
          waitingRoom: !!meeting.settings?.waitingRoom,
          recordingEnabled: !!meeting.settings?.recordingEnabled,
          scheduledAt: meeting.scheduledAt ? new Date(meeting.scheduledAt) : null,
          whiteboardPages: {
            create: {
              title: "Main Canvas",
            },
          },
        },
      });

      // Synchronize in-memory store for instant zero-latency caching
      store.meetings[meeting.roomId] = meeting;
      store.codeIndex[meeting.code] = meeting.roomId;
      if (!store.doubts[meeting.roomId]) store.doubts[meeting.roomId] = [];
      if (!store.notes[meeting.roomId]) store.notes[meeting.roomId] = [];
      if (!store.materials[meeting.roomId]) store.materials[meeting.roomId] = [];
      if (!store.whiteboards[meeting.roomId]) {
        store.whiteboards[meeting.roomId] = [{ id: "board-1", title: "Main Canvas", strokes: [] }];
      }
      if (!store.polls[meeting.roomId]) store.polls[meeting.roomId] = [];
      if (!store.messages[meeting.roomId]) store.messages[meeting.roomId] = [];
      if (!store.attendance[meeting.roomId]) store.attendance[meeting.roomId] = [];

      return meeting;
    } catch (err) {
      console.error("[ClassroomRepository.createMeeting] Error writing to DB:", err);
      // Fallback to store only in non-production environments
      if (process.env.NODE_ENV === "production") {
        throw new Error("Durable persistence failed: could not commit meeting to PostgreSQL.");
      }
      store.meetings[meeting.roomId] = meeting;
      store.codeIndex[meeting.code] = meeting.roomId;
      return meeting;
    }
  }

  /** Retrieve meeting by Room ID */
  static async getMeeting(roomId: string): Promise<Meeting | null> {
    try {
      const m = await prisma.meeting.findUnique({
        where: { roomId },
      });
      if (m) {
        return {
          id: m.id,
          roomId: m.roomId,
          code: m.code,
          title: m.title,
          description: m.description ?? undefined,
          hostId: m.hostId,
          hostName: m.hostName,
          status: m.status.toLowerCase() as any,
          visibility: m.visibility as any,
          settings: {
            waitingRoom: m.waitingRoom,
            maxParticipants: m.maxParticipants,
            allowGuests: true,
            muteOnEntry: false,
            videoOffOnEntry: false,
            allowParticipantScreenShare: true,
            allowParticipantWhiteboard: true,
            recordingEnabled: m.recordingEnabled,
            chatEnabled: true,
            isLocked: m.isLocked,
            coHostIds: [],
          },
          participantCount: store.meetings[roomId]?.participantCount || 1,
          inviteLink: `/meet/${m.roomId}`,
          createdAt: m.createdAt.toISOString(),
        };
      }
    } catch (err) {
      console.warn("[ClassroomRepository.getMeeting] DB read fallback:", err);
    }
    return store.meetings[roomId] || null;
  }

  /** Retrieve meeting by 6-character Code */
  static async getMeetingByCode(code: string): Promise<Meeting | null> {
    try {
      const m = await prisma.meeting.findUnique({
        where: { code: code.toUpperCase() },
      });
      if (m) return this.getMeeting(m.roomId);
    } catch (err) {
      console.warn("[ClassroomRepository.getMeetingByCode] DB read fallback:", err);
    }
    const roomId = store.codeIndex[code.toUpperCase()];
    return roomId ? store.meetings[roomId] || null : null;
  }

  /** Update Meeting Settings */
  static async updateMeetingSettings(roomId: string, settings: Partial<Meeting["settings"]>): Promise<Meeting | null> {
    try {
      const updated = await prisma.meeting.update({
        where: { roomId },
        data: {
          isLocked: settings.isLocked !== undefined ? settings.isLocked : undefined,
          waitingRoom: settings.waitingRoom !== undefined ? settings.waitingRoom : undefined,
          maxParticipants: settings.maxParticipants !== undefined ? settings.maxParticipants : undefined,
          recordingEnabled: settings.recordingEnabled !== undefined ? settings.recordingEnabled : undefined,
        },
      });
      if (store.meetings[roomId]) {
        store.meetings[roomId].settings = {
          ...store.meetings[roomId].settings,
          ...settings,
        };
      }
      return this.getMeeting(roomId);
    } catch (err) {
      console.error("[ClassroomRepository.updateMeetingSettings] DB update error:", err);
      if (store.meetings[roomId]) {
        store.meetings[roomId].settings = {
          ...store.meetings[roomId].settings,
          ...settings,
        };
        return store.meetings[roomId];
      }
      return null;
    }
  }

  /** End Meeting */
  static async endMeeting(roomId: string): Promise<Meeting | null> {
    try {
      await prisma.meeting.update({
        where: { roomId },
        data: {
          status: "ENDED",
          endsAt: new Date(),
        },
      });
    } catch (err) {
      console.warn("[ClassroomRepository.endMeeting] DB update fallback:", err);
    }
    if (store.meetings[roomId]) {
      store.meetings[roomId].status = "ended";
      store.meetings[roomId].endsAt = new Date().toISOString();
      store.meetings[roomId].participantCount = 0;
      return store.meetings[roomId];
    }
    return null;
  }

  /** Get Doubts for Room */
  static async getDoubts(roomId: string): Promise<DoubtQuestion[]> {
    try {
      const meeting = await prisma.meeting.findUnique({
        where: { roomId },
        include: {
          doubts: {
            include: { answers: true },
            orderBy: { createdAt: "desc" },
          },
        },
      });
      if (meeting) {
        return meeting.doubts.map((d) => ({
          id: d.id,
          studentId: d.studentId,
          studentName: d.studentName,
          question: d.question,
          codeSnippet: d.codeSnippet ?? undefined,
          priority: d.priority.toLowerCase() as any,
          status: d.status.toLowerCase() as any,
          createdAt: d.createdAt.toISOString(),
          answers: d.answers.map((a) => ({
            id: a.id,
            authorName: a.authorName,
            authorRole: a.authorRole.toLowerCase() as any,
            text: a.text,
            answeredAt: a.createdAt.toISOString(),
          })),
        }));
      }
    } catch (err) {
      console.warn("[ClassroomRepository.getDoubts] DB fallback:", err);
    }
    return store.doubts[roomId] || [];
  }

  /** Add doubt */
  static async addDoubt(
    roomId: string,
    doubt: Omit<DoubtQuestion, "id" | "createdAt" | "answers" | "status">
  ): Promise<DoubtQuestion> {
    try {
      const meeting = await prisma.meeting.findUnique({ where: { roomId } });
      if (meeting) {
        await this.ensureUser(doubt.studentId, doubt.studentName, "STUDENT");

        const created = await prisma.doubt.create({
          data: {
            meetingId: meeting.id,
            studentId: doubt.studentId,
            studentName: doubt.studentName,
            question: doubt.question,
            codeSnippet: doubt.codeSnippet,
            priority: doubt.priority === "urgent" ? "URGENT" : "NORMAL",
          },
        });
        const result: DoubtQuestion = {
          id: created.id,
          studentId: created.studentId,
          studentName: created.studentName,
          question: created.question,
          codeSnippet: created.codeSnippet ?? undefined,
          priority: doubt.priority,
          status: "open",
          createdAt: created.createdAt.toISOString(),
          answers: [],
        };
        if (!store.doubts[roomId]) store.doubts[roomId] = [];
        store.doubts[roomId].unshift(result);
        return result;
      }
    } catch (err) {
      console.error("[ClassroomRepository.addDoubt] DB write error:", err);
    }

    if (!store.doubts[roomId]) store.doubts[roomId] = [];
    const newDoubt: DoubtQuestion = {
      ...doubt,
      id: "doubt-" + Math.random().toString(36).substring(2, 9),
      status: "open",
      createdAt: new Date().toISOString(),
      answers: [],
    };
    store.doubts[roomId].unshift(newDoubt);
    return newDoubt;
  }

  /** Answer doubt */
  static async answerDoubt(
    roomId: string,
    doubtId: string,
    answer: { authorName: string; authorRole: any; text: string }
  ): Promise<DoubtQuestion | null> {
    try {
      const doubt = await prisma.doubt.findUnique({ where: { id: doubtId } });
      if (doubt) {
        const authorId = `author-${answer.authorName.replace(/\s+/g, "").toLowerCase()}`;
        await this.ensureUser(authorId, answer.authorName, "TEACHER");

        await prisma.$transaction([
          prisma.doubtAnswer.create({
            data: {
              doubtId,
              authorId,
              authorName: answer.authorName,
              authorRole: answer.authorRole === "host" ? "HOST" : "TEACHER",
              text: answer.text,
            },
          }),
          prisma.doubt.update({
            where: { id: doubtId },
            data: { status: "RESOLVED" },
          }),
        ]);

        const updatedDoubts = await this.getDoubts(roomId);
        return updatedDoubts.find((d) => d.id === doubtId) || null;
      }
    } catch (err) {
      console.error("[ClassroomRepository.answerDoubt] DB write error:", err);
    }

    const doubts = store.doubts[roomId] || [];
    const found = doubts.find((d) => d.id === doubtId);
    if (!found) return null;
    const newAns = {
      id: "ans-" + Math.random().toString(36).substring(2, 9),
      authorName: answer.authorName,
      authorRole: answer.authorRole,
      text: answer.text,
      answeredAt: new Date().toISOString(),
    };
    found.answers.push(newAns);
    found.status = "resolved";
    return found;
  }

  /** Toggle Pin Doubt */
  static async togglePinDoubt(roomId: string, doubtId: string): Promise<DoubtQuestion | null> {
    try {
      const doubt = await prisma.doubt.findUnique({ where: { id: doubtId } });
      if (doubt) {
        const newStatus = doubt.status === "PINNED" ? "OPEN" : "PINNED";
        await prisma.doubt.update({
          where: { id: doubtId },
          data: { status: newStatus },
        });
        const updatedDoubts = await this.getDoubts(roomId);
        return updatedDoubts.find((d) => d.id === doubtId) || null;
      }
    } catch (err) {
      console.error("[ClassroomRepository.togglePinDoubt] DB error:", err);
    }

    const doubts = store.doubts[roomId] || [];
    const found = doubts.find((d) => d.id === doubtId);
    if (!found) return null;
    found.status = found.status === "pinned" ? "open" : "pinned";
    return found;
  }

  /** Get Notes */
  static async getNotes(roomId: string): Promise<SharedNote[]> {
    try {
      const meeting = await prisma.meeting.findUnique({
        where: { roomId },
        include: { notes: { orderBy: { updatedAt: "desc" } } },
      });
      if (meeting) {
        return meeting.notes.map((n) => ({
          id: n.id,
          authorId: n.authorId,
          authorName: n.authorName,
          title: n.title,
          content: n.content,
          isShared: n.isShared,
          updatedAt: n.updatedAt.toISOString(),
        }));
      }
    } catch (err) {
      console.warn("[ClassroomRepository.getNotes] DB read fallback:", err);
    }
    return store.notes[roomId] || [];
  }

  /** Save or update note */
  static async saveNote(
    roomId: string,
    note: Omit<SharedNote, "id" | "updatedAt"> & { id?: string }
  ): Promise<SharedNote> {
    try {
      let meeting = await prisma.meeting.findUnique({ where: { roomId } });
      if (!meeting) {
        // Find any existing active meeting or create master cohort meeting
        meeting = await prisma.meeting.findFirst({ where: { status: "ACTIVE" } });
        if (!meeting) {
          const hostId = "host-system-master";
          await this.ensureUser(hostId, "Dr. Aryan Mehta", "HOST");
          meeting = await prisma.meeting.create({
            data: {
              roomId,
              code: "AIENG1",
              title: "Generative AI Systems Masterclass",
              hostId,
              hostName: "Dr. Aryan Mehta",
              status: "ACTIVE",
            },
          });
        }
      }

      if (meeting) {
        await this.ensureUser(note.authorId, note.authorName, "STUDENT");

        if (note.id) {
          const updated = await prisma.note.update({
            where: { id: note.id },
            data: {
              title: note.title,
              content: note.content,
              isShared: note.isShared,
            },
          });
          return {
            id: updated.id,
            authorId: updated.authorId,
            authorName: updated.authorName,
            title: updated.title,
            content: updated.content,
            isShared: updated.isShared,
            updatedAt: updated.updatedAt.toISOString(),
          };
        } else {
          const created = await prisma.note.create({
            data: {
              meetingId: meeting.id,
              authorId: note.authorId,
              authorName: note.authorName,
              title: note.title,
              content: note.content,
              isShared: note.isShared,
            },
          });
          return {
            id: created.id,
            authorId: created.authorId,
            authorName: created.authorName,
            title: created.title,
            content: created.content,
            isShared: created.isShared,
            updatedAt: created.updatedAt.toISOString(),
          };
        }
      }
    } catch (err) {
      console.error("[ClassroomRepository.saveNote] DB write error:", err);
    }

    if (!store.notes[roomId]) store.notes[roomId] = [];
    const list = store.notes[roomId];
    if (note.id) {
      const idx = list.findIndex((n) => n.id === note.id);
      if (idx !== -1) {
        list[idx] = {
          ...list[idx],
          title: note.title,
          content: note.content,
          isShared: note.isShared,
          updatedAt: new Date().toISOString(),
        };
        return list[idx];
      }
    }
    const newNote: SharedNote = {
      id: note.id || "note-" + Math.random().toString(36).substring(2, 9),
      authorId: note.authorId,
      authorName: note.authorName,
      title: note.title,
      content: note.content,
      isShared: note.isShared,
      updatedAt: new Date().toISOString(),
    };
    list.unshift(newNote);
    return newNote;
  }

  /** Get Whiteboard Pages & Strokes */
  static async getWhiteboard(roomId: string): Promise<WhiteboardPage[]> {
    try {
      const meeting = await prisma.meeting.findUnique({
        where: { roomId },
        include: {
          whiteboardPages: {
            include: { strokes: { orderBy: { createdAt: "asc" } } },
          },
        },
      });
      if (meeting && meeting.whiteboardPages.length > 0) {
        return meeting.whiteboardPages.map((p) => ({
          id: p.id,
          title: p.title,
          strokes: p.strokes.map((s) => ({
            id: s.id,
            tool: s.tool as any,
            color: s.color,
            strokeWidth: s.strokeWidth,
            x: s.x ?? undefined,
            y: s.y ?? undefined,
            width: s.width ?? undefined,
            height: s.height ?? undefined,
            text: s.text ?? undefined,
            points: s.pointsJson ? JSON.parse(s.pointsJson) : undefined,
          })),
        }));
      }
    } catch (err) {
      console.warn("[ClassroomRepository.getWhiteboard] DB read fallback:", err);
    }
    if (!store.whiteboards[roomId]) {
      store.whiteboards[roomId] = [{ id: "board-1", title: "Main Canvas", strokes: [] }];
    }
    return store.whiteboards[roomId];
  }

  /** Add Whiteboard Stroke */
  static async addWhiteboardStroke(
    roomId: string,
    pageId: string,
    stroke: WhiteboardStroke
  ): Promise<WhiteboardStroke> {
    try {
      const meeting = await prisma.meeting.findUnique({ where: { roomId } });
      let page = await prisma.whiteboardPage.findFirst({
        where: meeting ? { meetingId: meeting.id } : { id: pageId },
      });
      if (!page && meeting) {
        page = await prisma.whiteboardPage.create({
          data: {
            id: pageId,
            meetingId: meeting.id,
            title: "Main Canvas",
          },
        });
      }

      if (page) {
        await prisma.whiteboardStroke.upsert({
          where: { id: stroke.id },
          update: {
            pageId: page.id,
            tool: stroke.tool,
            color: stroke.color,
            strokeWidth: stroke.strokeWidth,
            x: stroke.x,
            y: stroke.y,
            width: stroke.width,
            height: stroke.height,
            text: stroke.text,
            pointsJson: stroke.points ? JSON.stringify(stroke.points) : null,
          },
          create: {
            id: stroke.id,
            pageId: page.id,
            tool: stroke.tool,
            color: stroke.color,
            strokeWidth: stroke.strokeWidth,
            x: stroke.x,
            y: stroke.y,
            width: stroke.width,
            height: stroke.height,
            text: stroke.text,
            pointsJson: stroke.points ? JSON.stringify(stroke.points) : null,
          },
        });
      }
    } catch (err) {
      console.error("[ClassroomRepository.addWhiteboardStroke] DB error:", err);
    }

    // Always maintain in-memory representation
    const pages = store.whiteboards[roomId] || [{ id: "board-1", title: "Main Canvas", strokes: [] }];
    const targetPage = pages.find((p) => p.id === pageId) || pages[0];
    targetPage.strokes.push(stroke);
    return stroke;
  }

  /** Clear Whiteboard Page */
  static async clearWhiteboard(roomId: string, pageId: string): Promise<void> {
    try {
      const meeting = await prisma.meeting.findUnique({ where: { roomId } });
      if (meeting) {
        // If specific page matches id or if default pageId 'board-1' matches first page of room
        const page = await prisma.whiteboardPage.findFirst({
          where: {
            meetingId: meeting.id,
            ...(pageId && pageId !== "board-1" ? { id: pageId } : {}),
          },
        });
        if (page) {
          await prisma.whiteboardStroke.deleteMany({
            where: { pageId: page.id },
          });
        } else {
          // Alternatively delete all strokes associated with any whiteboard page belonging to this meeting
          await prisma.whiteboardStroke.deleteMany({
            where: {
              page: { meetingId: meeting.id },
            },
          });
        }
      } else {
        await prisma.whiteboardStroke.deleteMany({
          where: { pageId },
        });
      }
    } catch (err) {
      console.error("[ClassroomRepository.clearWhiteboard] DB error:", err);
    }

    const pages = store.whiteboards[roomId];
    if (pages) {
      const page = pages.find((p) => p.id === pageId) || pages[0];
      if (page) page.strokes = [];
    }
  }

  /** Get Polls */
  static async getPolls(roomId: string): Promise<Poll[]> {
    try {
      const meeting = await prisma.meeting.findUnique({
        where: { roomId },
        include: {
          polls: {
            include: { votes: true },
            orderBy: { createdAt: "desc" },
          },
        },
      });
      if (meeting) {
        return meeting.polls.map((p) => {
          const votesMap: Record<string, number> = {};
          p.votes.forEach((v) => {
            votesMap[v.userId] = v.optionIndex;
          });
          return {
            id: p.id,
            question: p.question,
            options: p.options,
            votes: votesMap,
            isOpen: p.isOpen,
            createdAt: p.createdAt.toISOString(),
            createdBy: p.createdBy,
          };
        });
      }
    } catch (err) {
      console.warn("[ClassroomRepository.getPolls] DB error:", err);
    }
    return store.polls[roomId] || [];
  }

  /** Create Poll */
  static async createPoll(roomId: string, question: string, options: string[], createdBy: string): Promise<Poll> {
    try {
      const meeting = await prisma.meeting.findUnique({ where: { roomId } });
      if (meeting) {
        const created = await prisma.poll.create({
          data: {
            meetingId: meeting.id,
            question,
            options,
            createdBy,
            isOpen: true,
          },
        });
        const poll: Poll = {
          id: created.id,
          question: created.question,
          options: created.options,
          votes: {},
          isOpen: created.isOpen,
          createdAt: created.createdAt.toISOString(),
          createdBy: created.createdBy,
        };
        if (!store.polls[roomId]) store.polls[roomId] = [];
        store.polls[roomId].unshift(poll);
        return poll;
      }
    } catch (err) {
      console.error("[ClassroomRepository.createPoll] DB error:", err);
    }

    if (!store.polls[roomId]) store.polls[roomId] = [];
    const poll: Poll = {
      id: "poll-" + Math.random().toString(36).substring(2, 9),
      question,
      options,
      votes: {},
      isOpen: true,
      createdAt: new Date().toISOString(),
      createdBy,
    };
    store.polls[roomId].unshift(poll);
    return poll;
  }

  /** Vote on Poll */
  static async votePoll(roomId: string, pollId: string, participantId: string, optionIndex: number): Promise<Poll | null> {
    try {
      await this.ensureUser(participantId, "Poll Participant", "STUDENT");

      await prisma.pollVote.upsert({
        where: {
          pollId_userId: { pollId, userId: participantId },
        },
        update: { optionIndex },
        create: {
          pollId,
          userId: participantId,
          optionIndex,
        },
      });

      const updatedPolls = await this.getPolls(roomId);
      return updatedPolls.find((p) => p.id === pollId) || null;
    } catch (err) {
      console.error("[ClassroomRepository.votePoll] DB error:", err);
    }

    const polls = store.polls[roomId] || [];
    const poll = polls.find((p) => p.id === pollId);
    if (!poll || !poll.isOpen) return null;
    poll.votes[participantId] = optionIndex;
    return poll;
  }

  /** Record Attendance */
  static async recordAttendance(roomId: string, record: Omit<AttendanceRecord, "durationMinutes">): Promise<AttendanceRecord> {
    try {
      const meeting = await prisma.meeting.findUnique({ where: { roomId } });
      if (meeting) {
        await this.ensureUser(record.participantId, record.participantName, record.role === "teacher" ? "TEACHER" : "STUDENT");

        const existing = await prisma.attendance.findFirst({
          where: { meetingId: meeting.id, userId: record.participantId },
        });

        if (existing) {
          const updated = await prisma.attendance.update({
            where: { id: existing.id },
            data: {
              leftAt: record.leftAt ? new Date(record.leftAt) : null,
              durationMinutes: record.leftAt
                ? Math.max(1, Math.round((new Date(record.leftAt).getTime() - new Date(existing.joinedAt).getTime()) / 60000))
                : existing.durationMinutes,
            },
          });
          return {
            participantId: updated.userId,
            participantName: updated.userName,
            role: updated.role.toLowerCase() as any,
            joinedAt: updated.joinedAt.toISOString(),
            leftAt: updated.leftAt ? updated.leftAt.toISOString() : undefined,
            durationMinutes: updated.durationMinutes,
          };
        } else {
          const created = await prisma.attendance.create({
            data: {
              meetingId: meeting.id,
              userId: record.participantId,
              userName: record.participantName,
              role: record.role === "teacher" ? "TEACHER" : "STUDENT",
              joinedAt: record.joinedAt ? new Date(record.joinedAt) : new Date(),
              durationMinutes: 1,
            },
          });
          return {
            participantId: created.userId,
            participantName: created.userName,
            role: created.role.toLowerCase() as any,
            joinedAt: created.joinedAt.toISOString(),
            durationMinutes: 1,
          };
        }
      }
    } catch (err) {
      console.error("[ClassroomRepository.recordAttendance] DB error:", err);
    }

    if (!store.attendance[roomId]) store.attendance[roomId] = [];
    const existing = store.attendance[roomId].find((a) => a.participantId === record.participantId);
    if (existing) {
      existing.leftAt = record.leftAt;
      return existing;
    }
    const entry: AttendanceRecord = {
      ...record,
      durationMinutes: 1,
    };
    store.attendance[roomId].push(entry);
    return entry;
  }

  /** Get Attendance */
  static async getAttendance(roomId: string): Promise<AttendanceRecord[]> {
    try {
      const meeting = await prisma.meeting.findUnique({
        where: { roomId },
        include: { attendances: true },
      });
      if (meeting) {
        return meeting.attendances.map((a) => ({
          participantId: a.userId,
          participantName: a.userName,
          role: a.role.toLowerCase() as any,
          joinedAt: a.joinedAt.toISOString(),
          leftAt: a.leftAt ? a.leftAt.toISOString() : undefined,
          durationMinutes: a.durationMinutes,
        }));
      }
    } catch (err) {
      console.warn("[ClassroomRepository.getAttendance] DB error:", err);
    }
    return store.attendance[roomId] || [];
  }
}

export default ClassroomRepository;
