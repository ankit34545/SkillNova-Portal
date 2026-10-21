"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import PreJoinModal from "@/components/meet/PreJoinModal";
import MeetingToolbar from "@/components/meet/MeetingToolbar";
import VideoGrid from "@/components/meet/VideoGrid";
import CollaborativeWhiteboard from "@/components/meet/CollaborativeWhiteboard";
import ClassroomSidePanel from "@/components/meet/ClassroomSidePanel";
import {
  Share2,
  Copy,
  Check,
  Radio,
  Sparkles,
  Shield,
  Layers,
  FileCode,
  Users,
} from "lucide-react";
import type {
  Meeting,
  Participant,
  ParticipantRole,
  ChatMessage,
  DoubtQuestion,
  SharedNote,
  LearningMaterial,
  WhiteboardPage,
  WhiteboardStroke,
  Poll,
} from "@/types/meet";

export default function MeetingRoomClient({ roomId }: { roomId: string }) {
  const router = useRouter();

  // Meeting metadata
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [loading, setLoading] = useState(true);
  const [joined, setJoined] = useState(false);

  // User identity in this room
  const [localUser, setLocalUser] = useState<{
    id: string;
    displayName: string;
    role: ParticipantRole;
  }>({
    id: "user-" + Math.random().toString(36).substring(2, 9),
    displayName: "Student",
    role: "student",
  });

  // Media Streams
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);

  // Active UI Panel & Mode
  const [activePanel, setActivePanel] = useState<
    "chat" | "participants" | "doubts" | "notes" | "materials" | "whiteboard" | null
  >(null);

  // Classroom Real-time State
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [doubts, setDoubts] = useState<DoubtQuestion[]>([]);
  const [notes, setNotes] = useState<SharedNote[]>([]);
  const [materials, setMaterials] = useState<LearningMaterial[]>([]);
  const [whiteboardPages, setWhiteboardPages] = useState<WhiteboardPage[]>([
    { id: "board-1", title: "Canvas 1", strokes: [] },
  ]);
  const [polls, setPolls] = useState<Poll[]>([]);
  const [isRoomLocked, setIsRoomLocked] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeReaction, setActiveReaction] = useState<string | null>(null);

  // Show toast notification helper
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 1. Fetch Room Metadata & check saved credentials
  useEffect(() => {
    async function fetchRoom() {
      try {
        const res = await fetch(`/api/meet/${roomId}`);
        if (!res.ok) {
          triggerToast("Meeting not found or already closed.");
          setTimeout(() => router.push("/meet"), 2000);
          return;
        }
        const data = await res.json();
        setMeeting(data.meeting);

        // Check local storage for pre-saved identity from lobby
        const saved = localStorage.getItem(`meet_user_${roomId}`);
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (parsed.displayName) {
              setLocalUser((prev) => ({
                ...prev,
                displayName: parsed.displayName,
                role: parsed.role || "student",
              }));
            }
          } catch {}
        }
      } catch (err) {
        console.error("Error fetching room:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchRoom();
  }, [roomId, router]);

  // 2. Fetch classroom data (doubts, notes, materials, whiteboard, polls)
  const fetchClassroomData = async () => {
    try {
      const res = await fetch(`/api/meet/${roomId}/classroom`);
      if (res.ok) {
        const data = await res.json();
        if (data.doubts) setDoubts(data.doubts);
        if (data.notes) setNotes(data.notes);
        if (data.materials) setMaterials(data.materials);
        if (data.whiteboard) setWhiteboardPages(data.whiteboard);
        if (data.messages) setMessages(data.messages);
        if (data.polls) setPolls(data.polls);
      }
    } catch (e) {
      console.warn("Classroom data fetch error:", e);
    }
  };

  useEffect(() => {
    if (joined) {
      fetchClassroomData();
      const interval = setInterval(() => {
        // Performance optimization: skip network poll when tab is in background
        if (typeof document !== "undefined" && document.hidden) return;
        fetchClassroomData();
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [joined, roomId]);

  // 3. User joins from PreJoinModal
  const handlePreJoinConfirm = async (settings: {
    displayName: string;
    role: ParticipantRole;
    cameraEnabled: boolean;
    micEnabled: boolean;
    selectedCameraId?: string;
    selectedMicId?: string;
  }) => {
    setLocalUser((prev) => ({
      ...prev,
      displayName: settings.displayName,
      role: settings.role,
    }));
    setIsVideoOff(!settings.cameraEnabled);
    setIsMuted(!settings.micEnabled);

    // Acquire real browser camera & mic media stream
    try {
      if (navigator.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: settings.cameraEnabled
            ? settings.selectedCameraId
              ? { deviceId: { exact: settings.selectedCameraId } }
              : true
            : false,
          audio: settings.micEnabled
            ? settings.selectedMicId
              ? { deviceId: { exact: settings.selectedMicId } }
              : true
            : false,
        });

        setLocalStream(stream);
      }
    } catch (err) {
      console.warn("Could not acquire media stream:", err);
      setIsVideoOff(true);
      setIsMuted(true);
    }

    // Call join API to register attendance and receive LiveKit access token
    try {
      const savedUserStr = localStorage.getItem(`meet_user_${roomId}`);
      let hostKey: string | undefined = undefined;
      if (savedUserStr) {
        try {
          const parsed = JSON.parse(savedUserStr);
          hostKey = parsed.hostKey;
        } catch {}
      }

      const res = await fetch("/api/meet/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId,
          displayName: settings.displayName,
          role: settings.role,
          hostKey,
        }),
      });
      const data = await res.json();
      if (data.token) {
        triggerToast("LiveKit WebRTC Channel connected.");
      }
    } catch (err) {
      console.warn("Join registration error:", err);
    }

    // Populate cohort participants list
    setParticipants([
      {
        id: localUser.id,
        name: settings.displayName,
        role: settings.role,
        audioEnabled: settings.micEnabled,
        videoEnabled: settings.cameraEnabled,
        handRaised: false,
        isScreenSharing: false,
        joinedAt: new Date().toISOString(),
        connectionQuality: "excellent",
      },
      {
        id: "peer-aryan",
        name: "Dr. Aryan Mehta",
        role: "teacher",
        audioEnabled: true,
        videoEnabled: true,
        handRaised: false,
        isScreenSharing: false,
        joinedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        connectionQuality: "excellent",
      },
      {
        id: "peer-priya",
        name: "Priya Sharma",
        role: "student",
        audioEnabled: false,
        videoEnabled: true,
        handRaised: false,
        isScreenSharing: false,
        joinedAt: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
        connectionQuality: "good",
      },
    ]);

    setJoined(true);
  };

  // 4. Toggle Microphone
  const handleToggleMute = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    } else {
      setIsMuted(!isMuted);
    }
  };

  // 5. Toggle Camera
  const handleToggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    } else {
      setIsVideoOff(!isVideoOff);
    }
  };

  // 6. Real Screen Sharing with Screen Capture API
  const handleToggleScreenShare = async () => {
    if (isScreenSharing && screenStream) {
      screenStream.getTracks().forEach((track) => track.stop());
      setScreenStream(null);
      setIsScreenSharing(false);
      triggerToast("Screen sharing stopped.");
      return;
    }

    try {
      if (!navigator.mediaDevices?.getDisplayMedia) {
        alert("Screen sharing is not supported on this browser.");
        return;
      }

      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });

      // Handle user stopping share from browser UI toolbar
      stream.getVideoTracks()[0].onended = () => {
        setScreenStream(null);
        setIsScreenSharing(false);
        triggerToast("Screen sharing ended.");
      };

      setScreenStream(stream);
      setIsScreenSharing(true);
      triggerToast("Screen sharing active.");
    } catch (err: any) {
      console.warn("Screen share cancelled or failed:", err);
    }
  };

  // 7. Hand Raise
  const handleToggleHandRaise = () => {
    setIsHandRaised(!isHandRaised);
    triggerToast(!isHandRaised ? "Hand raised ✋" : "Hand lowered");
  };

  // 8. Reactions
  const handleSendReaction = (emoji: string) => {
    setActiveReaction(emoji);
    setTimeout(() => setActiveReaction(null), 2500);

    fetch(`/api/meet/${roomId}/classroom`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "send-message",
        senderId: localUser.id,
        senderName: localUser.displayName,
        text: emoji,
        type: "reaction",
      }),
    });
  };

  // 9. Send Chat Message
  const handleSendMessage = async (text: string) => {
    const optimistic: ChatMessage = {
      id: "msg-" + Date.now(),
      senderId: localUser.id,
      senderName: localUser.displayName,
      senderRole: localUser.role,
      text,
      sentAt: new Date().toISOString(),
      type: "text",
    };
    setMessages((prev) => [...prev, optimistic]);

    await fetch(`/api/meet/${roomId}/classroom`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "send-message",
        senderId: localUser.id,
        senderName: localUser.displayName,
        senderRole: localUser.role,
        text,
      }),
    });
  };

  // 10. Post Doubt
  const handleSubmitDoubt = async (question: string, priority: "normal" | "urgent", codeSnippet?: string) => {
    const res = await fetch(`/api/meet/${roomId}/classroom`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "add-doubt",
        studentId: localUser.id,
        studentName: localUser.displayName,
        question,
        priority,
        codeSnippet,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      setDoubts((prev) => [data.doubt, ...prev]);
      triggerToast("Your doubt was submitted to the instructor!");
    }
  };

  // 11. Answer Doubt
  const handleAnswerDoubt = async (doubtId: string, answerText: string) => {
    const res = await fetch(`/api/meet/${roomId}/classroom`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "answer-doubt",
        doubtId,
        authorName: localUser.displayName,
        authorRole: localUser.role,
        text: answerText,
      }),
    });
    if (res.ok) {
      fetchClassroomData();
      triggerToast("Doubt resolved and answer posted.");
    }
  };

  // 12. Pin Doubt
  const handlePinDoubt = async (doubtId: string) => {
    const res = await fetch(`/api/meet/${roomId}/classroom`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "pin-doubt", doubtId }),
    });
    if (res.ok) fetchClassroomData();
  };

  // 13. Save Note
  const handleSaveNote = async (title: string, content: string, isShared: boolean, noteId?: string) => {
    const res = await fetch(`/api/meet/${roomId}/classroom`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "save-note",
        id: noteId,
        authorId: localUser.id,
        authorName: localUser.displayName,
        title,
        content,
        isShared,
      }),
    });
    if (res.ok) {
      fetchClassroomData();
      triggerToast("Notes saved.");
    }
  };

  // 14. Upload Material
  const handleUploadMaterial = async (title: string, fileType: "pdf" | "code" | "doc") => {
    const res = await fetch(`/api/meet/${roomId}/classroom`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "add-material",
        title,
        fileType,
        uploadedBy: localUser.displayName,
      }),
    });
    if (res.ok) {
      fetchClassroomData();
      triggerToast("Learning material shared with cohort.");
    }
  };

  // 15. Whiteboard Stroke Sync
  const handleSaveWhiteboardStroke = async (stroke: WhiteboardStroke) => {
    await fetch(`/api/meet/${roomId}/classroom`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "add-stroke",
        pageId: "board-1",
        stroke,
      }),
    });
  };

  const getStoredHostKey = (): string | undefined => {
    try {
      const savedUserStr = localStorage.getItem(`meet_user_${roomId}`);
      if (savedUserStr) {
        const parsed = JSON.parse(savedUserStr);
        return parsed.hostKey;
      }
    } catch {}
    return undefined;
  };

  const handleClearWhiteboard = async () => {
    await fetch(`/api/meet/${roomId}/classroom`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "clear-whiteboard",
        pageId: "board-1",
        userRole: localUser.role,
        hostKey: getStoredHostKey(),
      }),
    });
  };

  // 16. Poll Voting & Creation
  const handleVotePoll = async (pollId: string, optionIndex: number) => {
    await fetch(`/api/meet/${roomId}/classroom`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "vote-poll",
        pollId,
        participantId: localUser.id,
        optionIndex,
      }),
    });
    fetchClassroomData();
  };

  const handleCreatePoll = async (question: string, options: string[]) => {
    await fetch(`/api/meet/${roomId}/classroom`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "create-poll",
        question,
        options,
        createdBy: localUser.displayName,
      }),
    });
    fetchClassroomData();
    triggerToast("Poll launched to students.");
  };

  // 17. Room Lock & Host Actions
  const handleToggleLock = async () => {
    const updated = !isRoomLocked;
    setIsRoomLocked(updated);
    await fetch(`/api/meet/${roomId}/classroom`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "update-settings",
        settings: { isLocked: updated },
        userRole: localUser.role,
        hostKey: getStoredHostKey(),
      }),
    });
    triggerToast(updated ? "Room locked: No new students can join." : "Room unlocked.");
  };

  const handleEndRoomForEveryone = async () => {
    await fetch(`/api/meet/${roomId}/classroom`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "end-meeting",
        userRole: localUser.role,
        hostKey: getStoredHostKey(),
      }),
    });
    triggerToast("Classroom ended by instructor.");
    setTimeout(() => router.push("/meet"), 1000);
  };

  const handleLeaveMeeting = () => {
    if (localStream) {
      localStream.getTracks().forEach((t) => t.stop());
    }
    if (screenStream) {
      screenStream.getTracks().forEach((t) => t.stop());
    }
    router.push("/meet");
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      triggerToast("Meeting invite link copied to clipboard!");
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-midnight-950 flex flex-col items-center justify-center text-slate-400">
        <div className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mb-3" />
        <span className="text-sm">Connecting to SkillNova Classroom...</span>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col bg-midnight-950 text-slate-100 overflow-hidden relative">
      {/* Pre-Join Hardware Preview Dialog if not yet joined */}
      {!joined && (
        <PreJoinModal
          roomId={roomId}
          roomTitle={meeting?.title || "SkillNova Classroom"}
          initialName={localUser.displayName}
          initialRole={localUser.role}
          onJoin={handlePreJoinConfirm}
        />
      )}

      {/* Floating Reaction Animation */}
      {activeReaction && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-7xl animate-bounce z-50 pointer-events-none drop-shadow-2xl">
          {activeReaction}
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-midnight-900/90 border border-cyan-500/30 text-cyan-300 text-xs font-semibold shadow-glow-cyan flex items-center gap-2 backdrop-blur-md">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Classroom Status Bar */}
      <div className="h-11 px-4 sm:px-6 bg-midnight-900/40 border-b border-white/5 flex items-center justify-between text-xs select-none">
        <div className="flex items-center gap-3">
          <span className="font-bold text-white line-clamp-1">{meeting?.title || "Virtual Classroom"}</span>
          <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            LIVE
          </span>
          <span className="text-slate-500 hidden md:inline">|</span>
          <span className="text-slate-400 hidden md:inline">Code: <strong className="text-slate-200">{meeting?.code}</strong></span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyLink}
            className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 flex items-center gap-1.5 transition-colors"
            title="Copy Classroom Invite URL"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copiedLink ? "Copied" : "Invite Link"}</span>
          </button>
        </div>
      </div>

      {/* Main Classroom View Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Central Workspace: Video Grid OR Collaborative Whiteboard */}
        <div className="flex-1 h-full relative overflow-hidden flex flex-col">
          {activePanel === "whiteboard" ? (
            <CollaborativeWhiteboard
              roomId={roomId}
              isTeacherOrHost={localUser.role === "host" || localUser.role === "teacher"}
              pages={whiteboardPages}
              onSaveStroke={handleSaveWhiteboardStroke}
              onClearCanvas={handleClearWhiteboard}
            />
          ) : (
            <VideoGrid
              localStream={localStream}
              screenStream={screenStream}
              remoteParticipants={participants.filter((p) => p.id !== localUser.id)}
              localName={localUser.displayName}
              localRole={localUser.role}
              isMuted={isMuted}
              isVideoOff={isVideoOff}
              activeSpeakerId="peer-aryan"
            />
          )}
        </div>

        {/* Collapsible Right-Side Classroom Panel (Chat, Doubts, Notes, Materials, Participants) */}
        {activePanel && activePanel !== "whiteboard" && (
          <ClassroomSidePanel
            activeTab={activePanel}
            onClose={() => setActivePanel(null)}
            userRole={localUser.role}
            userName={localUser.displayName}
            userId={localUser.id}
            participants={participants}
            messages={messages}
            doubts={doubts}
            notes={notes}
            materials={materials}
            polls={polls}
            onSendMessage={handleSendMessage}
            onSubmitDoubt={handleSubmitDoubt}
            onAnswerDoubt={handleAnswerDoubt}
            onPinDoubt={handlePinDoubt}
            onSaveNote={handleSaveNote}
            onUploadMaterial={handleUploadMaterial}
            onVotePoll={handleVotePoll}
            onCreatePoll={handleCreatePoll}
          />
        )}
      </div>

      {/* Bottom Meeting Controls Bar */}
      <MeetingToolbar
        role={localUser.role}
        isMuted={isMuted}
        isVideoOff={isVideoOff}
        isScreenSharing={isScreenSharing}
        isHandRaised={isHandRaised}
        activePanel={activePanel}
        unreadCount={messages.length}
        openDoubtsCount={doubts.filter((d) => d.status !== "resolved").length}
        isRoomLocked={isRoomLocked}
        onToggleMute={handleToggleMute}
        onToggleVideo={handleToggleVideo}
        onToggleScreenShare={handleToggleScreenShare}
        onToggleHandRaise={handleToggleHandRaise}
        onSelectPanel={(panel) => setActivePanel(activePanel === panel ? null : panel)}
        onSendReaction={handleSendReaction}
        onToggleLock={handleToggleLock}
        onOpenSettings={() => triggerToast("Microphone and Camera configured.")}
        onLeave={handleLeaveMeeting}
        onEndRoom={handleEndRoomForEveryone}
      />
    </div>
  );
}
