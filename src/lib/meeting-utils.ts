// src/lib/meeting-utils.ts
// Utilities for meeting ID, code, and link generation

import { Meeting, MeetingSettings, MeetingVisibility } from "@/types/meet";

const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // no ambiguous chars

/** Generate a 6-character alphanumeric meeting code */
export function generateMeetingCode(): string {
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return code;
}

/** Generate a URL-safe room ID (12 chars) */
export function generateRoomId(): string {
  const chars = "abcdefghijkmnpqrstuvwxyz0123456789";
  let id = "";
  for (let i = 0; i < 12; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

/** Generate a UUID v4 */
export function generateUUID(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for environments without crypto.randomUUID
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/** Build the shareable invite link */
export function buildInviteLink(roomId: string, baseUrl?: string): string {
  const base = baseUrl ?? (typeof window !== "undefined" ? window.location.origin : "http://localhost:3005");
  return `${base}/meet/${roomId}`;
}

/** Default meeting settings */
export function defaultMeetingSettings(
  overrides?: Partial<MeetingSettings>
): MeetingSettings {
  return {
    waitingRoom: false,
    maxParticipants: 100,
    allowGuests: true,
    muteOnEntry: false,
    videoOffOnEntry: false,
    allowParticipantScreenShare: true,
    allowParticipantWhiteboard: false,
    recordingEnabled: false,
    chatEnabled: true,
    coHostIds: [],
    ...overrides,
  };
}

/** Format meeting duration from ms */
export function formatDuration(ms: number): string {
  const mins = Math.floor(ms / 60000);
  const hrs = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  if (hrs === 0) return `${mins}m`;
  return `${hrs}h ${remainingMins}m`;
}

/** Format a date for display */
export function formatMeetingTime(isoString?: string): string {
  if (!isoString) return "—";
  const date = new Date(isoString);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/** Validate a meeting code (6 alphanumeric, no I/O/L/1/0) */
export function isValidCode(code: string): boolean {
  return /^[A-HJ-NP-Z2-9]{6}$/i.test(code.trim());
}

/** Visibility label helper */
export const VISIBILITY_LABELS: Record<MeetingVisibility, string> = {
  public: "Public — Anyone with the link",
  private: "Private — Invite only",
  "invite-only": "Invite Only — Requires approval",
};
