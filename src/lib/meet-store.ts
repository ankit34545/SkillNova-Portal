// src/lib/meet-store.ts
// In-memory meeting, doubt, notes, whiteboard & classroom registry

import type {
  Meeting,
  MeetingStore,
  DoubtQuestion,
  SharedNote,
  LearningMaterial,
  WhiteboardPage,
  WhiteboardStroke,
  Poll,
  ChatMessage,
  AttendanceRecord,
} from "@/types/meet";
import {
  generateMeetingCode,
  generateRoomId,
  generateUUID,
  buildInviteLink,
  defaultMeetingSettings,
} from "./meeting-utils";

// Global singleton across server invocations
const globalForStore = globalThis as unknown as {
  __skillnova_meet_store__?: MeetingStore;
};

export const store: MeetingStore =
  globalForStore.__skillnova_meet_store__ || {
    meetings: {},
    codeIndex: {},
    doubts: {},
    notes: {},
    materials: {},
    whiteboards: {},
    polls: {},
    messages: {},
    attendance: {},
  };

if (process.env.NODE_ENV !== "production") {
  globalForStore.__skillnova_meet_store__ = store;
}

// Seed initial meetings and mock classrooms if empty
function seedDemoMeetings() {
  if (Object.keys(store.meetings).length > 0) return;

  const demos: Omit<Meeting, "inviteLink">[] = [
    {
      id: "demo-1",
      roomId: "ai-eng-live",
      code: "AI2026",
      title: "Generative AI & LLM Systems: Masterclass",
      description: "Live session on RAG architectures, vector quantization, and autonomous AI agents.",
      hostId: "host-aryan",
      hostName: "Dr. Aryan Mehta",
      createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
      status: "active",
      visibility: "public",
      settings: defaultMeetingSettings({
        waitingRoom: false,
        allowParticipantScreenShare: true,
        allowParticipantWhiteboard: true,
        recordingEnabled: true,
      }),
      participantCount: 28,
    },
    {
      id: "demo-2",
      roomId: "sys-design-401",
      code: "SYS401",
      title: "Distributed Systems & Scalable Architecture",
      description: "Kafka partition topologies, Raft consensus algorithm, and zero-downtime database sharding.",
      hostId: "host-priya",
      hostName: "Priya Sharma (Staff Eng)",
      createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
      scheduledAt: new Date(Date.now() + 1000 * 60 * 30).toISOString(),
      status: "waiting",
      visibility: "invite-only",
      settings: defaultMeetingSettings({
        waitingRoom: true,
        allowParticipantWhiteboard: true,
        maxParticipants: 50,
      }),
      participantCount: 0,
    },
    {
      id: "demo-3",
      roomId: "dsa-faang-prep",
      code: "FAANG1",
      title: "Advanced Dynamic Programming & Graph Algorithms",
      description: "Live problem solving: Matrix Exponentiation, Segment Trees, and Hard LeetCode patterns.",
      hostId: "host-rohit",
      hostName: "Rohit Verma",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      endsAt: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString(),
      status: "ended",
      visibility: "public",
      settings: defaultMeetingSettings({ recordingEnabled: true }),
      participantCount: 45,
    },
  ];

  for (const demo of demos) {
    const inviteLink = buildInviteLink(demo.roomId);
    const meeting: Meeting = { ...demo, inviteLink };
    store.meetings[demo.roomId] = meeting;
    store.codeIndex[demo.code] = demo.roomId;

    // Seed initial doubts for active room
    if (demo.roomId === "ai-eng-live") {
      store.doubts[demo.roomId] = [
        {
          id: "doubt-1",
          studentId: "s-101",
          studentName: "Ananya Roy",
          question: "How do we prevent hallucination during multi-hop vector retrieval with hybrid search?",
          priority: "urgent",
          status: "pinned",
          createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
          answers: [
            {
              id: "ans-1",
              authorName: "Dr. Aryan Mehta",
              authorRole: "teacher",
              text: "Utilize reciprocal rank fusion (RRF) with a re-ranking cross-encoder before context packing.",
              answeredAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
            },
          ],
        },
        {
          id: "doubt-2",
          studentId: "s-102",
          studentName: "Karthik Nair",
          question: "What is the memory trade-off between FP16 vs INT4 quantized embeddings on edge devices?",
          priority: "normal",
          status: "open",
          createdAt: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
          answers: [],
        },
      ];

      // Seed initial shared notes
      store.notes[demo.roomId] = [
        {
          id: "note-1",
          authorId: "host-aryan",
          authorName: "Dr. Aryan Mehta",
          title: "Session 4 Key Architecture Takeaways",
          content: `# RAG Optimization Checklist\n\n1. Chunking strategy: 512 tokens with 10% overlap.\n2. Vector indexing: HNSW with M=16, efSearch=64.\n3. Re-ranking: Cohere or bge-reranker-large.\n4. Fallback: Prompt guardrails with structured schema outputs.`,
          isShared: true,
          updatedAt: new Date().toISOString(),
        },
      ];

      // Seed learning materials
      store.materials[demo.roomId] = [
        {
          id: "mat-1",
          title: "Production_RAG_Architecture_Guide.pdf",
          fileType: "pdf",
          fileUrl: "/docs/rag-guide.pdf",
          sizeBytes: 2450000,
          pageCount: 14,
          uploadedBy: "Dr. Aryan Mehta",
          uploadedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        },
        {
          id: "mat-2",
          title: "retrieval_agent_pipeline.py",
          fileType: "code",
          fileUrl: "/code/pipeline.py",
          sizeBytes: 4200,
          uploadedBy: "Dr. Aryan Mehta",
          uploadedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
        },
      ];

      // Seed whiteboard
      store.whiteboards[demo.roomId] = [
        {
          id: "board-page-1",
          title: "System Topology & RAG Flow",
          strokes: [
            {
              id: "stroke-1",
              tool: "rect",
              x: 120,
              y: 80,
              width: 180,
              height: 90,
              color: "#38bdf8",
              strokeWidth: 3,
            },
            {
              id: "stroke-2",
              tool: "text",
              x: 140,
              y: 125,
              text: "User Query + Embedding",
              color: "#f8fafc",
              strokeWidth: 2,
            },
            {
              id: "stroke-3",
              tool: "arrow",
              points: [300, 125, 420, 125],
              color: "#a855f7",
              strokeWidth: 3,
            },
            {
              id: "stroke-4",
              tool: "rect",
              x: 420,
              y: 80,
              width: 180,
              height: 90,
              color: "#22c55e",
              strokeWidth: 3,
            },
            {
              id: "stroke-5",
              tool: "text",
              x: 440,
              y: 125,
              text: "Vector DB (HNSW Index)",
              color: "#f8fafc",
              strokeWidth: 2,
            },
          ],
        },
      ];

      // Seed chat messages
      store.messages[demo.roomId] = [
        {
          id: "msg-1",
          senderId: "system",
          senderName: "System",
          text: "Welcome to SkillNova Live Classroom! Microphone is muted on entry for all students.",
          sentAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
          type: "system",
        },
        {
          id: "msg-2",
          senderId: "host-aryan",
          senderName: "Dr. Aryan Mehta",
          senderRole: "teacher",
          text: "Hello everyone, please open the RAG Architecture PDF from the Materials tab.",
          sentAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
          type: "text",
        },
        {
          id: "msg-3",
          senderId: "s-103",
          senderName: "Sneha Kapur",
          senderRole: "student",
          text: "Good afternoon Sir, audio is crystal clear!",
          sentAt: new Date(Date.now() - 1000 * 60 * 16).toISOString(),
          type: "text",
        },
      ];

      // Seed poll
      store.polls[demo.roomId] = [
        {
          id: "poll-1",
          question: "Which vector index type are you currently using for similarity search?",
          options: ["HNSW (Hierarchical Navigable Small World)", "IVFFlat (Inverted File Index)", "Flat L2 Exact Search", "ScaNN / DiskANN"],
          votes: { "s-101": 0, "s-102": 0, "s-103": 1, "s-104": 0 },
          isOpen: true,
          createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
          createdBy: "Dr. Aryan Mehta",
        },
      ];

      // Seed attendance
      store.attendance[demo.roomId] = [
        {
          participantId: "host-aryan",
          participantName: "Dr. Aryan Mehta",
          role: "teacher",
          joinedAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
          durationMinutes: 25,
        },
        {
          participantId: "s-101",
          participantName: "Ananya Roy",
          role: "student",
          joinedAt: new Date(Date.now() - 1000 * 60 * 22).toISOString(),
          durationMinutes: 22,
        },
        {
          participantId: "s-102",
          participantName: "Karthik Nair",
          role: "student",
          joinedAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
          durationMinutes: 20,
        },
      ];
    }
  }
}

seedDemoMeetings();

// --- Meetings CRUD ---

export function createMeeting(params: {
  title: string;
  description?: string;
  hostId: string;
  hostName: string;
  scheduledAt?: string;
  visibility: Meeting["visibility"];
  settings?: Partial<Meeting["settings"]>;
}): Meeting {
  const id = generateUUID();
  const roomId = generateRoomId();
  let code = generateMeetingCode();

  while (store.codeIndex[code]) {
    code = generateMeetingCode();
  }

  const inviteLink = buildInviteLink(roomId);

  const meeting: Meeting = {
    id,
    roomId,
    code,
    title: params.title,
    description: params.description,
    hostId: params.hostId,
    hostName: params.hostName,
    createdAt: new Date().toISOString(),
    scheduledAt: params.scheduledAt,
    status: "active",
    visibility: params.visibility,
    settings: defaultMeetingSettings(params.settings),
    participantCount: 1,
    inviteLink,
  };

  store.meetings[roomId] = meeting;
  store.codeIndex[code] = roomId;

  // Initialize data containers
  store.doubts[roomId] = [];
  store.notes[roomId] = [];
  store.materials[roomId] = [];
  store.whiteboards[roomId] = [
    {
      id: "board-1",
      title: "Main Canvas",
      strokes: [],
    },
  ];
  store.polls[roomId] = [];
  store.messages[roomId] = [];
  store.attendance[roomId] = [];

  return meeting;
}

export function getMeetingByRoomId(roomId: string): Meeting | null {
  return store.meetings[roomId] || null;
}

export function getMeetingByCode(code: string): Meeting | null {
  const roomId = store.codeIndex[code.toUpperCase()];
  if (!roomId) return null;
  return store.meetings[roomId] || null;
}

export function getAllMeetings(): Meeting[] {
  return Object.values(store.meetings);
}

export function updateMeetingSettings(roomId: string, settings: Partial<Meeting["settings"]>): Meeting | null {
  const meeting = store.meetings[roomId];
  if (!meeting) return null;
  meeting.settings = { ...meeting.settings, ...settings };
  return meeting;
}

export function endMeeting(roomId: string): Meeting | null {
  const meeting = store.meetings[roomId];
  if (!meeting) return null;
  meeting.status = "ended";
  meeting.endsAt = new Date().toISOString();
  meeting.participantCount = 0;
  return meeting;
}

export function incrementParticipantCount(roomId: string): void {
  const meeting = store.meetings[roomId];
  if (meeting) {
    meeting.participantCount += 1;
  }
}

export function decrementParticipantCount(roomId: string): void {
  const meeting = store.meetings[roomId];
  if (meeting && meeting.participantCount > 0) {
    meeting.participantCount -= 1;
  }
}

// --- Doubts & Q&A ---

export function getDoubts(roomId: string): DoubtQuestion[] {
  return store.doubts[roomId] || [];
}

export function addDoubt(roomId: string, doubt: Omit<DoubtQuestion, "id" | "createdAt" | "answers" | "status">): DoubtQuestion {
  if (!store.doubts[roomId]) store.doubts[roomId] = [];
  const newDoubt: DoubtQuestion = {
    ...doubt,
    id: "doubt-" + generateUUID(),
    status: "open",
    createdAt: new Date().toISOString(),
    answers: [],
  };
  store.doubts[roomId].unshift(newDoubt);
  return newDoubt;
}

export function answerDoubt(roomId: string, doubtId: string, answer: { authorName: string; authorRole: any; text: string }) {
  const doubts = store.doubts[roomId] || [];
  const found = doubts.find((d) => d.id === doubtId);
  if (!found) return null;
  const newAns = {
    id: "ans-" + generateUUID(),
    authorName: answer.authorName,
    authorRole: answer.authorRole,
    text: answer.text,
    answeredAt: new Date().toISOString(),
  };
  found.answers.push(newAns);
  found.status = "resolved";
  return found;
}

export function togglePinDoubt(roomId: string, doubtId: string) {
  const doubts = store.doubts[roomId] || [];
  const found = doubts.find((d) => d.id === doubtId);
  if (!found) return null;
  found.status = found.status === "pinned" ? "open" : "pinned";
  return found;
}

// --- Shared Notes ---

export function getNotes(roomId: string): SharedNote[] {
  return store.notes[roomId] || [];
}

export function saveNote(roomId: string, note: Omit<SharedNote, "id" | "updatedAt"> & { id?: string }): SharedNote {
  if (!store.notes[roomId]) store.notes[roomId] = [];
  const list = store.notes[roomId];

  if (note.id) {
    const existingIndex = list.findIndex((n) => n.id === note.id);
    if (existingIndex !== -1) {
      list[existingIndex] = {
        ...list[existingIndex],
        title: note.title,
        content: note.content,
        isShared: note.isShared,
        updatedAt: new Date().toISOString(),
      };
      return list[existingIndex];
    }
  }

  const newNote: SharedNote = {
    id: note.id || "note-" + generateUUID(),
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

// --- Learning Materials ---

export function getMaterials(roomId: string): LearningMaterial[] {
  return store.materials[roomId] || [];
}

export function addMaterial(roomId: string, material: Omit<LearningMaterial, "id" | "uploadedAt">): LearningMaterial {
  if (!store.materials[roomId]) store.materials[roomId] = [];
  const item: LearningMaterial = {
    ...material,
    id: "mat-" + generateUUID(),
    uploadedAt: new Date().toISOString(),
  };
  store.materials[roomId].unshift(item);
  return item;
}

// --- Collaborative Whiteboard ---

export function getWhiteboard(roomId: string): WhiteboardPage[] {
  if (!store.whiteboards[roomId]) {
    store.whiteboards[roomId] = [{ id: "board-1", title: "Canvas 1", strokes: [] }];
  }
  return store.whiteboards[roomId];
}

export function addWhiteboardStroke(roomId: string, pageId: string, stroke: WhiteboardStroke): WhiteboardStroke {
  const pages = getWhiteboard(roomId);
  const page = pages.find((p) => p.id === pageId) || pages[0];
  page.strokes.push(stroke);
  return stroke;
}

export function clearWhiteboard(roomId: string, pageId: string): void {
  const pages = getWhiteboard(roomId);
  const page = pages.find((p) => p.id === pageId);
  if (page) {
    page.strokes = [];
  }
}

// --- Chat Messages ---

export function getMessages(roomId: string): ChatMessage[] {
  return store.messages[roomId] || [];
}

export function addMessage(roomId: string, msg: Omit<ChatMessage, "id" | "sentAt">): ChatMessage {
  if (!store.messages[roomId]) store.messages[roomId] = [];
  const newMsg: ChatMessage = {
    ...msg,
    id: "msg-" + generateUUID(),
    sentAt: new Date().toISOString(),
  };
  store.messages[roomId].push(newMsg);
  return newMsg;
}

// --- Polls ---

export function getPolls(roomId: string): Poll[] {
  return store.polls[roomId] || [];
}

export function createPoll(roomId: string, question: string, options: string[], createdBy: string): Poll {
  if (!store.polls[roomId]) store.polls[roomId] = [];
  const newPoll: Poll = {
    id: "poll-" + generateUUID(),
    question,
    options,
    votes: {},
    isOpen: true,
    createdAt: new Date().toISOString(),
    createdBy,
  };
  store.polls[roomId].unshift(newPoll);
  return newPoll;
}

export function votePoll(roomId: string, pollId: string, participantId: string, optionIndex: number): Poll | null {
  const polls = store.polls[roomId] || [];
  const poll = polls.find((p) => p.id === pollId);
  if (!poll || !poll.isOpen) return null;
  poll.votes[participantId] = optionIndex;
  return poll;
}

// --- Attendance Tracking ---

export function recordAttendance(roomId: string, record: Omit<AttendanceRecord, "durationMinutes">): AttendanceRecord {
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

export function getAttendance(roomId: string): AttendanceRecord[] {
  return store.attendance[roomId] || [];
}
