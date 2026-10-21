// SkillNova Live — Core Meeting & Classroom Types

export type MeetingStatus = "waiting" | "active" | "ended";
export type MeetingVisibility = "public" | "private" | "invite-only";
export type ParticipantRole = "host" | "co-host" | "teacher" | "student" | "participant" | "guest";
export type TeachingMode =
  | "video"
  | "board"
  | "screen"
  | "presentation"
  | "coding"
  | "discussion";

export interface MeetingSettings {
  waitingRoom: boolean;
  maxParticipants: number;
  allowGuests: boolean;
  muteOnEntry: boolean;
  videoOffOnEntry: boolean;
  allowParticipantScreenShare: boolean;
  allowParticipantWhiteboard: boolean;
  recordingEnabled: boolean;
  chatEnabled: boolean;
  isLocked?: boolean;
  coHostIds: string[];
}

export interface Meeting {
  id: string;
  roomId: string; // short slug used in URL
  code: string;   // 6-char alphanumeric join code
  title: string;
  description?: string;
  hostId: string;
  hostName: string;
  createdAt: string; // ISO string for serialisability
  scheduledAt?: string;
  endsAt?: string;
  status: MeetingStatus;
  visibility: MeetingVisibility;
  settings: MeetingSettings;
  participantCount: number;
  inviteLink: string;
}

export interface Participant {
  id: string;
  name: string;
  role: ParticipantRole;
  audioEnabled: boolean;
  videoEnabled: boolean;
  handRaised: boolean;
  isScreenSharing: boolean;
  joinedAt: string;
  connectionQuality: "excellent" | "good" | "poor" | "unknown";
  isMutedByHost?: boolean;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole?: ParticipantRole;
  text: string;
  sentAt: string;
  type: "text" | "system" | "reaction";
  emoji?: string;
}

export interface DoubtQuestion {
  id: string;
  studentId: string;
  studentName: string;
  question: string;
  codeSnippet?: string;
  attachmentName?: string;
  priority: "normal" | "urgent";
  status: "open" | "resolved" | "pinned";
  createdAt: string;
  answers: {
    id: string;
    authorName: string;
    authorRole: ParticipantRole;
    text: string;
    answeredAt: string;
  }[];
}

export interface SharedNote {
  id: string;
  authorId: string;
  authorName: string;
  title: string;
  content: string;
  isShared: boolean;
  updatedAt: string;
}

export interface LearningMaterial {
  id: string;
  title: string;
  fileType: "pdf" | "code" | "doc";
  fileUrl: string;
  sizeBytes: number;
  pageCount?: number;
  uploadedBy: string;
  uploadedAt: string;
}

export interface WhiteboardStroke {
  id: string;
  tool: "pen" | "highlighter" | "eraser" | "line" | "rect" | "circle" | "arrow" | "text";
  points?: number[]; // [x1, y1, x2, y2, ...]
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  color: string;
  strokeWidth: number;
  text?: string;
}

export interface WhiteboardPage {
  id: string;
  title: string;
  strokes: WhiteboardStroke[];
}

export interface Poll {
  id: string;
  question: string;
  options: string[];
  votes: Record<string, number>; // participantId -> optionIndex
  isOpen: boolean;
  createdAt: string;
  createdBy: string;
}

export interface AttendanceRecord {
  participantId: string;
  participantName: string;
  role: ParticipantRole;
  joinedAt: string;
  leftAt?: string;
  durationMinutes: number;
}

export interface HandRaise {
  participantId: string;
  participantName: string;
  raisedAt: string;
}

export interface WhiteboardPermission {
  mode: "teacher-only" | "teacher-and-selected" | "all" | "read-only";
  allowedIds: string[];
}

// Pre-join state (local, not persisted)
export interface PreJoinState {
  displayName: string;
  role: ParticipantRole;
  cameraEnabled: boolean;
  micEnabled: boolean;
  selectedCameraId?: string;
  selectedMicId?: string;
  selectedSpeakerId?: string;
}

// Meeting store slice (in-memory for development singleton, robust for mock + live)
export interface MeetingStore {
  meetings: Record<string, Meeting>; // keyed by roomId
  codeIndex: Record<string, string>; // code -> roomId
  doubts: Record<string, DoubtQuestion[]>; // roomId -> questions
  notes: Record<string, SharedNote[]>; // roomId -> notes
  materials: Record<string, LearningMaterial[]>; // roomId -> materials
  whiteboards: Record<string, WhiteboardPage[]>; // roomId -> whiteboard pages
  polls: Record<string, Poll[]>; // roomId -> polls
  messages: Record<string, ChatMessage[]>; // roomId -> messages
  attendance: Record<string, AttendanceRecord[]>; // roomId -> attendance
}

// API request / response types
export interface CreateMeetingRequest {
  title: string;
  description?: string;
  hostName: string;
  scheduledAt?: string;
  visibility: MeetingVisibility;
  settings: Partial<MeetingSettings>;
}

export interface CreateMeetingResponse {
  meeting: Meeting;
  token?: string;
}

export interface JoinMeetingRequest {
  code?: string;
  roomId?: string;
  displayName: string;
  role?: ParticipantRole;
}

export interface JoinMeetingResponse {
  meeting: Meeting;
  participantId: string;
  token?: string;
  livekitUrl?: string;
}

export interface TokenRequest {
  roomId: string;
  participantId: string;
  participantName: string;
  role: ParticipantRole;
}

export interface RecapData {
  meetingId: string;
  title: string;
  duration: number; // minutes
  participantCount: number;
  attendees: { name: string; joinedAt: string; leftAt?: string }[];
  chatHighlights: ChatMessage[];
  aiSummary?: string;
  actionItems?: string[];
  transcriptAvailable: boolean;
  recordingUrl?: string;
}
