"use client";

import React, { useRef, useEffect, useState } from "react";
import {
  Camera,
  CameraOff,
  Mic,
  MicOff,
  Settings,
  Sparkles,
  Volume2,
  Video,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import type { ParticipantRole } from "@/types/meet";

interface PreJoinModalProps {
  roomId: string;
  roomTitle: string;
  initialName?: string;
  initialRole?: ParticipantRole;
  onJoin: (data: {
    displayName: string;
    role: ParticipantRole;
    cameraEnabled: boolean;
    micEnabled: boolean;
    selectedCameraId?: string;
    selectedMicId?: string;
  }) => void;
}

export default function PreJoinModal({
  roomId,
  roomTitle,
  initialName = "",
  initialRole = "student",
  onJoin,
}: PreJoinModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [displayName, setDisplayName] = useState(initialName);
  const [role, setRole] = useState<ParticipantRole>(initialRole);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [micEnabled, setMicEnabled] = useState(true);

  const [devices, setDevices] = useState<{
    video: MediaDeviceInfo[];
    audio: MediaDeviceInfo[];
  }>({ video: [], audio: [] });

  const [selectedCameraId, setSelectedCameraId] = useState<string>("");
  const [selectedMicId, setSelectedMicId] = useState<string>("");
  const [permissionError, setPermissionError] = useState<string>("");
  const [micLevel, setMicLevel] = useState<number>(30);

  // Initialize camera and mic streams
  useEffect(() => {
    let active = true;

    async function initMedia() {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          setPermissionError("Camera/Microphone API is not supported in this browser.");
          return;
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        if (!active) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        // Enumerate actual hardware devices
        const allDevices = await navigator.mediaDevices.enumerateDevices();
        const videoDevs = allDevices.filter((d) => d.kind === "videoinput");
        const audioDevs = allDevices.filter((d) => d.kind === "audioinput");

        setDevices({ video: videoDevs, audio: audioDevs });
        if (videoDevs.length > 0) setSelectedCameraId(videoDevs[0].deviceId);
        if (audioDevs.length > 0) setSelectedMicId(audioDevs[0].deviceId);
      } catch (err: any) {
        console.warn("Camera/Mic permission denied or unavailable:", err);
        setPermissionError(
          "Camera or microphone access was blocked. You can still join in listen/view mode."
        );
        setCameraEnabled(false);
        setMicEnabled(false);
      }
    }

    initMedia();

    return () => {
      active = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Handle camera toggle
  const toggleCamera = () => {
    if (!streamRef.current) return;
    const videoTrack = streamRef.current.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !cameraEnabled;
      setCameraEnabled(!cameraEnabled);
    }
  };

  // Handle mic toggle
  const toggleMic = () => {
    if (!streamRef.current) return;
    const audioTrack = streamRef.current.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !micEnabled;
      setMicEnabled(!micEnabled);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) return;

    // Stop pre-join preview tracks so room can take control
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }

    onJoin({
      displayName: displayName.trim(),
      role,
      cameraEnabled,
      micEnabled,
      selectedCameraId,
      selectedMicId,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-midnight-950/95 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-midnight-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row">
        {/* Left: Camera Preview Tile */}
        <div className="w-full md:w-1/2 p-6 bg-black/40 flex flex-col justify-between border-b md:border-b-0 md:border-r border-white/10 relative">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
              <span className="text-xs font-mono uppercase tracking-wider text-cyan-300">
                Hardware Check
              </span>
            </div>
            <h3 className="text-sm font-semibold text-white">Audio & Video Preview</h3>
          </div>

          {/* Video Container */}
          <div className="my-4 aspect-video rounded-2xl bg-midnight-950 border border-white/10 overflow-hidden relative flex items-center justify-center">
            {cameraEnabled ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform -scale-x-100"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-500">
                <CameraOff className="w-10 h-10 mb-2 stroke-1" />
                <span className="text-xs">Camera is Off</span>
              </div>
            )}

            {/* In-preview control overlay */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1.5 rounded-full bg-midnight-950/80 backdrop-blur-md border border-white/15">
              <button
                type="button"
                onClick={toggleMic}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                  micEnabled ? "bg-white/10 text-white hover:bg-white/20" : "bg-red-500/20 text-red-400"
                }`}
                title={micEnabled ? "Mute Microphone" : "Unmute Microphone"}
              >
                {micEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              </button>

              <button
                type="button"
                onClick={toggleCamera}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                  cameraEnabled ? "bg-white/10 text-white hover:bg-white/20" : "bg-red-500/20 text-red-400"
                }`}
                title={cameraEnabled ? "Turn off camera" : "Turn on camera"}
              >
                {cameraEnabled ? <Camera className="w-4 h-4" /> : <CameraOff className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Audio level indication */}
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Mic level:</span>
            <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  micEnabled ? "bg-cyan-400 w-2/5" : "bg-slate-600 w-0"
                }`}
              />
            </div>
          </div>

          {permissionError && (
            <div className="mt-3 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
              <span>{permissionError}</span>
            </div>
          )}
        </div>

        {/* Right: User identity & Join Details */}
        <div className="w-full md:w-1/2 p-6 flex flex-col justify-between">
          <div>
            <div className="mb-4">
              <span className="text-[11px] uppercase tracking-wider font-mono text-purple-400">
                Ready to Join
              </span>
              <h2 className="text-lg font-bold text-white mt-0.5 line-clamp-1">{roomTitle}</h2>
              <span className="text-xs text-slate-400 font-mono">Room: {roomId}</span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Your Display Name *
                </label>
                <Input
                  value={displayName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDisplayName(e.target.value)}
                  placeholder="Enter your name..."
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Classroom Role
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole("student")}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                      role === "student"
                        ? "bg-purple-600/25 border-purple-500 text-purple-300"
                        : "bg-midnight-950 border-white/10 text-slate-400 hover:text-white"
                    }`}
                  >
                    Student
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("teacher")}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                      role === "teacher"
                        ? "bg-cyan-600/25 border-cyan-500 text-cyan-300"
                        : "bg-midnight-950 border-white/10 text-slate-400 hover:text-white"
                    }`}
                  >
                    Teacher / Mentor
                  </button>
                </div>
              </div>

              {devices.video.length > 1 && (
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">
                    Select Camera
                  </label>
                  <select
                    value={selectedCameraId}
                    onChange={(e) => setSelectedCameraId(e.target.value)}
                    className="w-full text-xs rounded-xl bg-midnight-950 border border-white/10 text-slate-300 px-3 py-2 focus:outline-none focus:border-cyan-500"
                  >
                    {devices.video.map((d, i) => (
                      <option key={d.deviceId || i} value={d.deviceId}>
                        {d.label || `Camera ${i + 1}`}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> WebRTC End-to-End
                </span>

                <Button
                  type="submit"
                  variant="gradient"
                  disabled={!displayName.trim()}
                  className="shadow-glow-violet px-5 py-2.5 font-semibold text-xs flex items-center gap-2"
                >
                  <Video className="w-4 h-4" />
                  <span>Join Classroom</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
