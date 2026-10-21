"use client";

import React, { useState } from "react";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  ScreenShare,
  Hand,
  MessageSquare,
  Users,
  PenTool,
  HelpCircle,
  FileText,
  FolderOpen,
  Settings,
  PhoneOff,
  Smile,
  Shield,
  Lock,
  Unlock,
  Radio,
  Share2,
} from "lucide-react";
import type { ParticipantRole } from "@/types/meet";

interface MeetingToolbarProps {
  role: ParticipantRole;
  isMuted: boolean;
  isVideoOff: boolean;
  isScreenSharing: boolean;
  isHandRaised: boolean;
  activePanel: "chat" | "participants" | "doubts" | "notes" | "materials" | "whiteboard" | null;
  unreadCount?: number;
  openDoubtsCount?: number;
  isRoomLocked?: boolean;
  onToggleMute: () => void;
  onToggleVideo: () => void;
  onToggleScreenShare: () => void;
  onToggleHandRaise: () => void;
  onSelectPanel: (panel: "chat" | "participants" | "doubts" | "notes" | "materials" | "whiteboard") => void;
  onSendReaction: (emoji: string) => void;
  onToggleLock?: () => void;
  onOpenSettings: () => void;
  onLeave: () => void;
  onEndRoom?: () => void;
}

export default function MeetingToolbar({
  role,
  isMuted,
  isVideoOff,
  isScreenSharing,
  isHandRaised,
  activePanel,
  unreadCount = 0,
  openDoubtsCount = 0,
  isRoomLocked = false,
  onToggleMute,
  onToggleVideo,
  onToggleScreenShare,
  onToggleHandRaise,
  onSelectPanel,
  onSendReaction,
  onToggleLock,
  onOpenSettings,
  onLeave,
  onEndRoom,
}: MeetingToolbarProps) {
  const [showReactions, setShowReactions] = useState(false);
  const [showEndConfirm, setShowEndConfirm] = useState(false);

  const emojis = ["👍", "👏", "🔥", "❤️", "💡", "🙋‍♂️", "🎉"];
  const isHostOrTeacher = role === "host" || role === "teacher";

  return (
    <>
      <div className="h-16 bg-midnight-950/90 backdrop-blur-xl border-t border-white/10 px-4 sm:px-6 flex items-center justify-between relative z-40 select-none">
        {/* Left Side: Room details & security badge */}
        <div className="flex items-center gap-2">
          {isHostOrTeacher && onToggleLock && (
            <button
              onClick={onToggleLock}
              className={`p-2 rounded-xl text-xs font-medium border flex items-center gap-1.5 transition-colors ${
                isRoomLocked
                  ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
                  : "bg-white/5 border-white/10 text-slate-400 hover:text-white"
              }`}
              title={isRoomLocked ? "Unlock Classroom" : "Lock Classroom (No new joins)"}
            >
              {isRoomLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{isRoomLocked ? "Locked" : "Lock"}</span>
            </button>
          )}

          <div className="relative">
            <button
              onClick={() => setShowReactions(!showReactions)}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-colors"
              title="Send Live Reaction"
            >
              <Smile className="w-4 h-4 text-pink-400" />
            </button>

            {/* Reactions Popover */}
            {showReactions && (
              <div className="absolute bottom-14 left-0 bg-midnight-900 border border-white/15 rounded-2xl p-2 shadow-2xl flex items-center gap-1.5 animate-in fade-in zoom-in-95 duration-150">
                {emojis.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => {
                      onSendReaction(emoji);
                      setShowReactions(false);
                    }}
                    className="w-8 h-8 rounded-lg hover:bg-white/10 text-lg flex items-center justify-center transition-transform hover:scale-125"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Center: Primary Media & Classroom Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mute Button */}
          <button
            onClick={onToggleMute}
            className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${
              isMuted
                ? "bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30"
                : "bg-white/10 text-white border border-white/10 hover:bg-white/15 shadow-glow-cyan"
            }`}
            title={isMuted ? "Unmute Microphone (Ctrl+D)" : "Mute Microphone (Ctrl+D)"}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Camera Button */}
          <button
            onClick={onToggleVideo}
            className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${
              isVideoOff
                ? "bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30"
                : "bg-white/10 text-white border border-white/10 hover:bg-white/15 shadow-glow-violet"
            }`}
            title={isVideoOff ? "Start Camera (Ctrl+E)" : "Stop Camera (Ctrl+E)"}
          >
            {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
          </button>

          {/* Screen Share Button */}
          <button
            onClick={onToggleScreenShare}
            className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${
              isScreenSharing
                ? "bg-cyan-500 text-midnight-950 font-bold border border-cyan-400 shadow-glow-cyan"
                : "bg-white/10 text-slate-200 border border-white/10 hover:bg-white/15 hover:text-white"
            }`}
            title={isScreenSharing ? "Stop Sharing Screen" : "Share Your Screen"}
          >
            <ScreenShare className="w-5 h-5" />
          </button>

          {/* Raise Hand Button */}
          <button
            onClick={onToggleHandRaise}
            className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${
              isHandRaised
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse"
                : "bg-white/10 text-slate-200 border border-white/10 hover:bg-white/15"
            }`}
            title={isHandRaised ? "Lower Hand" : "Raise Hand"}
          >
            <Hand className="w-5 h-5" />
          </button>

          {/* Whiteboard Toggle */}
          <button
            onClick={() => onSelectPanel("whiteboard")}
            className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${
              activePanel === "whiteboard"
                ? "bg-purple-600 text-white border border-purple-400 shadow-glow-violet"
                : "bg-white/10 text-purple-300 border border-white/10 hover:bg-white/15"
            }`}
            title="Interactive Collaborative Whiteboard"
          >
            <PenTool className="w-5 h-5" />
          </button>
        </div>

        {/* Right Side: Classroom Tabs & Leave Button */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Doubt Center Tab */}
          <button
            onClick={() => onSelectPanel("doubts")}
            className={`p-2.5 rounded-xl border relative transition-colors ${
              activePanel === "doubts"
                ? "bg-cyan-500/20 border-cyan-500 text-cyan-300"
                : "bg-white/5 border-white/10 text-slate-300 hover:text-white"
            }`}
            title="Q&A Doubt Center"
          >
            <HelpCircle className="w-4 h-4 text-cyan-400" />
            {openDoubtsCount > 0 && (
              <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full bg-cyan-500 text-[10px] font-bold text-midnight-950">
                {openDoubtsCount}
              </span>
            )}
          </button>

          {/* Shared Notes Tab */}
          <button
            onClick={() => onSelectPanel("notes")}
            className={`p-2.5 rounded-xl border transition-colors ${
              activePanel === "notes"
                ? "bg-purple-500/20 border-purple-500 text-purple-300"
                : "bg-white/5 border-white/10 text-slate-300 hover:text-white"
            }`}
            title="Class Notes & Markdown"
          >
            <FileText className="w-4 h-4 text-purple-400" />
          </button>

          {/* Learning Materials Tab */}
          <button
            onClick={() => onSelectPanel("materials")}
            className={`p-2.5 rounded-xl border transition-colors ${
              activePanel === "materials"
                ? "bg-pink-500/20 border-pink-500 text-pink-300"
                : "bg-white/5 border-white/10 text-slate-300 hover:text-white"
            }`}
            title="Course Materials & PDFs"
          >
            <FolderOpen className="w-4 h-4 text-pink-400" />
          </button>

          {/* Chat Tab */}
          <button
            onClick={() => onSelectPanel("chat")}
            className={`p-2.5 rounded-xl border relative transition-colors ${
              activePanel === "chat"
                ? "bg-violet-500/20 border-violet-500 text-violet-300"
                : "bg-white/5 border-white/10 text-slate-300 hover:text-white"
            }`}
            title="Class Chat"
          >
            <MessageSquare className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full bg-pink-500 text-[10px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Participants Tab */}
          <button
            onClick={() => onSelectPanel("participants")}
            className={`p-2.5 rounded-xl border transition-colors ${
              activePanel === "participants"
                ? "bg-white/20 border-white/30 text-white"
                : "bg-white/5 border-white/10 text-slate-300 hover:text-white"
            }`}
            title="Participants List"
          >
            <Users className="w-4 h-4" />
          </button>

          {/* Settings */}
          <button
            onClick={onOpenSettings}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 transition-colors"
            title="Audio/Video Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Leave / End Room */}
          {isHostOrTeacher && onEndRoom ? (
            <button
              onClick={() => setShowEndConfirm(true)}
              className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all shadow-glow-red flex items-center gap-1.5 ml-1"
            >
              <PhoneOff className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">End Class</span>
            </button>
          ) : (
            <button
              onClick={onLeave}
              className="px-3.5 py-2 rounded-xl bg-red-600/80 hover:bg-red-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 ml-1"
            >
              <PhoneOff className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Leave</span>
            </button>
          )}
        </div>
      </div>

      {/* End Meeting Host Confirmation Modal */}
      {showEndConfirm && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-midnight-900 border border-white/15 rounded-2xl max-w-sm w-full p-5 shadow-2xl">
            <h3 className="text-base font-bold text-white">End Classroom for All?</h3>
            <p className="text-xs text-slate-400 mt-2">
              Ending this session will disconnect all joined students and save attendance records.
            </p>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowEndConfirm(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowEndConfirm(false);
                  onLeave();
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/10 text-white hover:bg-white/20"
              >
                Leave Only
              </button>
              <button
                onClick={() => {
                  setShowEndConfirm(false);
                  onEndRoom && onEndRoom();
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 text-white hover:bg-red-500 shadow-glow-red"
              >
                End for Everyone
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
