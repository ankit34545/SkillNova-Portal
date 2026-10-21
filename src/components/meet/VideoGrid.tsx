"use client";

import React, { useRef, useEffect } from "react";
import { Mic, MicOff, Video, VideoOff, Maximize2, Shield, User } from "lucide-react";
import type { Participant } from "@/types/meet";

interface VideoGridProps {
  localStream: MediaStream | null;
  screenStream: MediaStream | null;
  remoteParticipants: Participant[];
  localName: string;
  localRole: string;
  isMuted: boolean;
  isVideoOff: boolean;
  activeSpeakerId?: string;
}

export default function VideoGrid({
  localStream,
  screenStream,
  remoteParticipants,
  localName,
  localRole,
  isMuted,
  isVideoOff,
  activeSpeakerId,
}: VideoGridProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const screenVideoRef = useRef<HTMLVideoElement>(null);

  // Bind local camera stream
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream, isVideoOff]);

  // Bind screen share stream
  useEffect(() => {
    if (screenVideoRef.current && screenStream) {
      screenVideoRef.current.srcObject = screenStream;
    }
  }, [screenStream]);

  // If someone is screen sharing, make screen presentation the dominant tile
  if (screenStream) {
    return (
      <div className="w-full h-full flex flex-col md:flex-row gap-3 p-3 bg-midnight-950 overflow-hidden">
        {/* Dominant Screen Share Tile */}
        <div className="flex-1 rounded-2xl bg-black border border-cyan-500/30 overflow-hidden relative flex items-center justify-center shadow-glow-cyan">
          <video
            ref={screenVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-contain"
          />
          <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-semibold flex items-center gap-2 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>Screen Broadcast Live</span>
          </div>
        </div>

        {/* Vertical strip for participants */}
        <div className="w-full md:w-64 flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto">
          {/* Local participant video tile */}
          <div className="w-48 md:w-full aspect-video rounded-xl bg-midnight-900 border border-white/10 overflow-hidden relative shrink-0">
            {!isVideoOff && localStream ? (
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform -scale-x-100"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-midnight-900 text-slate-500">
                <User className="w-8 h-8" />
              </div>
            )}
            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[11px] text-white bg-black/60 px-2 py-0.5 rounded-lg backdrop-blur-sm">
              <span className="truncate">{localName} (You)</span>
              {isMuted ? <MicOff className="w-3 h-3 text-red-400" /> : <Mic className="w-3 h-3 text-cyan-400" />}
            </div>
          </div>

          {/* Remote peers in strip */}
          {remoteParticipants.map((p) => (
            <div
              key={p.id}
              className={`w-48 md:w-full aspect-video rounded-xl bg-midnight-900 border overflow-hidden relative shrink-0 ${
                activeSpeakerId === p.id ? "border-cyan-400 shadow-glow-cyan" : "border-white/10"
              }`}
            >
              <div className="w-full h-full flex flex-col items-center justify-center bg-midnight-900/90 text-slate-400">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 to-cyan-500 flex items-center justify-center text-white font-bold text-sm mb-1">
                  {p.name.charAt(0).toUpperCase()}
                </div>
              </div>
              <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[11px] text-white bg-black/60 px-2 py-0.5 rounded-lg backdrop-blur-sm">
                <span className="truncate">{p.name}</span>
                {p.audioEnabled ? <Mic className="w-3 h-3 text-cyan-400" /> : <MicOff className="w-3 h-3 text-red-400" />}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Standard Dynamic Multi-Tile Video Grid
  const totalTiles = 1 + remoteParticipants.length;
  const gridClass =
    totalTiles === 1
      ? "grid-cols-1"
      : totalTiles === 2
      ? "grid-cols-1 md:grid-cols-2"
      : totalTiles <= 4
      ? "grid-cols-2"
      : "grid-cols-2 md:grid-cols-3";

  return (
    <div className={`w-full h-full p-3 grid gap-3 bg-midnight-950 overflow-y-auto ${gridClass}`}>
      {/* Self View Tile */}
      <div className="w-full h-full min-h-[220px] rounded-2xl bg-midnight-900 border border-white/10 overflow-hidden relative flex items-center justify-center group shadow-md">
        {!isVideoOff && localStream ? (
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover transform -scale-x-100"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-midnight-900 to-midnight-950 text-slate-400">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600/30 to-cyan-500/30 border border-white/10 flex items-center justify-center text-2xl font-bold text-white mb-2 shadow-inner">
              {localName ? localName.charAt(0).toUpperCase() : "U"}
            </div>
            <span className="text-xs text-slate-400">Camera turned off</span>
          </div>
        )}

        {/* Identity bar */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white bg-midnight-950/80 px-3 py-1.5 rounded-xl border border-white/10 backdrop-blur-md">
          <div className="flex items-center gap-1.5 truncate">
            <span className="font-semibold truncate">{localName}</span>
            <span className="text-[10px] text-cyan-300 font-mono">({localRole})</span>
          </div>

          <div className="flex items-center gap-1.5">
            {isMuted ? (
              <span className="p-1 rounded-md bg-red-500/20 text-red-400">
                <MicOff className="w-3.5 h-3.5" />
              </span>
            ) : (
              <span className="p-1 rounded-md bg-cyan-500/20 text-cyan-300">
                <Mic className="w-3.5 h-3.5" />
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Remote Participant Tiles */}
      {remoteParticipants.map((p) => {
        const isSpeaking = activeSpeakerId === p.id;
        return (
          <div
            key={p.id}
            className={`w-full h-full min-h-[220px] rounded-2xl bg-midnight-900 border overflow-hidden relative flex items-center justify-center group transition-all ${
              isSpeaking
                ? "border-cyan-400 shadow-glow-cyan ring-1 ring-cyan-400"
                : "border-white/10"
            }`}
          >
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-midnight-900 to-midnight-950 text-slate-400">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-500/30 via-pink-500/20 to-cyan-500/30 border border-white/10 flex items-center justify-center text-2xl font-bold text-white mb-2 shadow-inner">
                {p.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-xs text-slate-400 capitalize">{p.role}</span>
            </div>

            {/* Bottom info bar */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white bg-midnight-950/80 px-3 py-1.5 rounded-xl border border-white/10 backdrop-blur-md">
              <div className="flex items-center gap-1.5 truncate">
                <span className="font-semibold truncate">{p.name}</span>
                {p.role === "teacher" && (
                  <span className="px-1.5 py-0.2 rounded bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-[10px]">
                    Teacher
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {p.handRaised && <span className="text-sm">✋</span>}
                {p.audioEnabled ? (
                  <Mic className="w-3.5 h-3.5 text-cyan-400" />
                ) : (
                  <MicOff className="w-3.5 h-3.5 text-red-400" />
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
