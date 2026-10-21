"use client";

import React, { useState } from "react";
import {
  X,
  MessageSquare,
  Users,
  HelpCircle,
  FileText,
  FolderOpen,
  Send,
  Pin,
  CheckCircle2,
  Clock,
  Download,
  Upload,
  Plus,
  AlertCircle,
  FileCode,
  Sparkles,
  BarChart2,
  FileDown,
} from "lucide-react";
import type {
  ParticipantRole,
  ChatMessage,
  DoubtQuestion,
  SharedNote,
  LearningMaterial,
  Participant,
  Poll,
} from "@/types/meet";
import Button from "@/components/ui/Button";

interface ClassroomSidePanelProps {
  activeTab: "chat" | "participants" | "doubts" | "notes" | "materials";
  onClose: () => void;
  userRole: ParticipantRole;
  userName: string;
  userId: string;
  participants: Participant[];
  messages: ChatMessage[];
  doubts: DoubtQuestion[];
  notes: SharedNote[];
  materials: LearningMaterial[];
  polls: Poll[];
  onSendMessage: (text: string) => void;
  onSubmitDoubt: (question: string, priority: "normal" | "urgent", code?: string) => void;
  onAnswerDoubt: (doubtId: string, answerText: string) => void;
  onPinDoubt: (doubtId: string) => void;
  onSaveNote: (title: string, content: string, isShared: boolean, noteId?: string) => void;
  onUploadMaterial: (title: string, fileType: "pdf" | "code" | "doc") => void;
  onVotePoll: (pollId: string, optionIndex: number) => void;
  onCreatePoll: (question: string, options: string[]) => void;
}

export default function ClassroomSidePanel({
  activeTab,
  onClose,
  userRole,
  userName,
  userId,
  participants,
  messages,
  doubts,
  notes,
  materials,
  polls,
  onSendMessage,
  onSubmitDoubt,
  onAnswerDoubt,
  onPinDoubt,
  onSaveNote,
  onUploadMaterial,
  onVotePoll,
  onCreatePoll,
}: ClassroomSidePanelProps) {
  // Chat input
  const [chatInput, setChatInput] = useState("");

  // Doubt input
  const [doubtQuestion, setDoubtQuestion] = useState("");
  const [doubtPriority, setDoubtPriority] = useState<"normal" | "urgent">("normal");
  const [doubtCode, setDoubtCode] = useState("");
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [replyingToDoubtId, setReplyingToDoubtId] = useState<string | null>(null);
  const [answerInput, setAnswerInput] = useState("");

  // Notes state
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [noteTitle, setNoteTitle] = useState("Class Notes");
  const [noteContent, setNoteContent] = useState("");
  const [isSharedNote, setIsSharedNote] = useState(false);

  // Poll state
  const [newPollQuestion, setNewPollQuestion] = useState("");
  const [newPollOptions, setNewPollOptions] = useState(["", ""]);
  const [showCreatePoll, setShowCreatePoll] = useState(false);

  const isTeacherOrHost = userRole === "host" || userRole === "teacher";

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    onSendMessage(chatInput.trim());
    setChatInput("");
  };

  const handlePostDoubt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!doubtQuestion.trim()) return;
    onSubmitDoubt(doubtQuestion.trim(), doubtPriority, doubtCode.trim() || undefined);
    setDoubtQuestion("");
    setDoubtCode("");
    setShowCodeInput(false);
  };

  const handlePostAnswer = (doubtId: string) => {
    if (!answerInput.trim()) return;
    onAnswerDoubt(doubtId, answerInput.trim());
    setAnswerInput("");
    setReplyingToDoubtId(null);
  };

  const handleSaveCurrentNote = () => {
    onSaveNote(noteTitle, noteContent, isSharedNote, activeNoteId || undefined);
  };

  const handleAddPoll = (e: React.FormEvent) => {
    e.preventDefault();
    const validOpts = newPollOptions.filter((o) => o.trim().length > 0);
    if (!newPollQuestion.trim() || validOpts.length < 2) return;
    onCreatePoll(newPollQuestion.trim(), validOpts);
    setNewPollQuestion("");
    setNewPollOptions(["", ""]);
    setShowCreatePoll(false);
  };

  return (
    <aside className="w-80 sm:w-96 bg-midnight-950 border-l border-white/10 flex flex-col h-full z-30 select-none">
      {/* Panel Header */}
      <div className="h-14 px-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {activeTab === "chat" && <MessageSquare className="w-4 h-4 text-violet-400" />}
          {activeTab === "participants" && <Users className="w-4 h-4 text-cyan-400" />}
          {activeTab === "doubts" && <HelpCircle className="w-4 h-4 text-cyan-400" />}
          {activeTab === "notes" && <FileText className="w-4 h-4 text-purple-400" />}
          {activeTab === "materials" && <FolderOpen className="w-4 h-4 text-pink-400" />}

          <h3 className="text-sm font-bold text-white capitalize">
            {activeTab === "doubts"
              ? "Live Doubt Center"
              : activeTab === "notes"
              ? "Shared Class Notes"
              : activeTab === "materials"
              ? "Learning Materials"
              : activeTab}
          </h3>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tab Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* ================= CHAT TAB ================= */}
        {activeTab === "chat" && (
          <div className="flex flex-col h-full justify-between">
            <div className="space-y-3 overflow-y-auto pr-1">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`p-3 rounded-2xl text-xs ${
                    m.type === "system"
                      ? "bg-white/5 border border-white/5 text-slate-400 text-center"
                      : m.senderId === userId
                      ? "bg-purple-600/20 border border-purple-500/30 text-purple-200 ml-4"
                      : "bg-white/[0.04] border border-white/10 text-slate-200 mr-4"
                  }`}
                >
                  {m.type !== "system" && (
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-white flex items-center gap-1.5">
                        {m.senderName}
                        {m.senderRole === "teacher" && (
                          <span className="px-1.5 py-0.2 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-[10px]">
                            Teacher
                          </span>
                        )}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(m.sentAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  )}
                  <p className="leading-relaxed">{m.text}</p>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendChat} className="mt-3 flex items-center gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Send message to everyone..."
                className="flex-1 text-xs px-3.5 py-2.5 rounded-xl bg-midnight-900 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
              <button
                type="submit"
                className="p-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* ================= PARTICIPANTS TAB ================= */}
        {activeTab === "participants" && (
          <div className="space-y-4">
            <div className="text-xs text-slate-400 flex items-center justify-between">
              <span>Connected Learners</span>
              <span className="font-mono text-cyan-300">{participants.length} Active</span>
            </div>

            <div className="space-y-2">
              {participants.map((p) => (
                <div
                  key={p.id}
                  className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-cyan-500 flex items-center justify-center font-bold text-xs text-white">
                      {p.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                        <span>{p.name}</span>
                        {p.id === userId && <span className="text-[10px] text-slate-500">(You)</span>}
                      </div>
                      <span className="text-[10px] text-slate-400 capitalize">{p.role}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    {p.handRaised && (
                      <span className="text-amber-400 animate-pulse text-xs" title="Hand Raised">
                        ✋
                      </span>
                    )}
                    <span
                      className={`w-2 h-2 rounded-full ${
                        p.connectionQuality === "excellent"
                          ? "bg-emerald-400"
                          : p.connectionQuality === "good"
                          ? "bg-cyan-400"
                          : "bg-amber-400"
                      }`}
                      title={`Connection: ${p.connectionQuality}`}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Polls & Quizzes Section */}
            <div className="pt-4 border-t border-white/10">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <BarChart2 className="w-4 h-4 text-pink-400" /> Live Classroom Polls
                </span>
                {isTeacherOrHost && !showCreatePoll && (
                  <button
                    onClick={() => setShowCreatePoll(true)}
                    className="text-[11px] text-pink-400 hover:text-pink-300 flex items-center gap-1 font-semibold"
                  >
                    <Plus className="w-3.5 h-3.5" /> New Poll
                  </button>
                )}
              </div>

              {showCreatePoll && (
                <form onSubmit={handleAddPoll} className="p-3 rounded-xl bg-midnight-900 border border-white/10 space-y-2 mb-3">
                  <input
                    type="text"
                    value={newPollQuestion}
                    onChange={(e) => setNewPollQuestion(e.target.value)}
                    placeholder="Poll Question..."
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg bg-midnight-950 border border-white/10 text-white"
                    required
                  />
                  {newPollOptions.map((opt, idx) => (
                    <input
                      key={idx}
                      type="text"
                      value={opt}
                      onChange={(e) => {
                        const copy = [...newPollOptions];
                        copy[idx] = e.target.value;
                        setNewPollOptions(copy);
                      }}
                      placeholder={`Option ${idx + 1}`}
                      className="w-full text-xs px-2.5 py-1 rounded-lg bg-midnight-950 border border-white/10 text-white"
                      required
                    />
                  ))}
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowCreatePoll(false)}
                      className="text-[11px] text-slate-400 px-2 py-1"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="text-[11px] bg-pink-600 text-white px-3 py-1 rounded-lg font-semibold"
                    >
                      Launch
                    </button>
                  </div>
                </form>
              )}

              {polls.map((poll) => {
                const totalVotes = Object.keys(poll.votes).length;
                return (
                  <div key={poll.id} className="p-3 rounded-xl bg-white/[0.02] border border-white/10 space-y-2">
                    <h5 className="text-xs font-semibold text-white">{poll.question}</h5>
                    <div className="space-y-1.5">
                      {poll.options.map((opt, i) => {
                        const count = Object.values(poll.votes).filter((v) => v === i).length;
                        const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
                        return (
                          <button
                            key={i}
                            onClick={() => onVotePoll(poll.id, i)}
                            className="w-full text-left p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 relative overflow-hidden"
                          >
                            <div
                              className="absolute inset-y-0 left-0 bg-pink-500/20"
                              style={{ width: `${pct}%` }}
                            />
                            <div className="relative flex items-center justify-between text-[11px]">
                              <span className="text-slate-200">{opt}</span>
                              <span className="font-mono text-pink-300 font-bold">{pct}%</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= DOUBTS TAB ================= */}
        {activeTab === "doubts" && (
          <div className="space-y-4">
            {/* Ask Doubt Form */}
            <form onSubmit={handlePostDoubt} className="p-3.5 rounded-2xl bg-midnight-900 border border-cyan-500/20 space-y-2.5">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Ask Instructor
              </span>
              <textarea
                value={doubtQuestion}
                onChange={(e) => setDoubtQuestion(e.target.value)}
                placeholder="What concept or code part needs clarification?..."
                className="w-full text-xs p-2.5 rounded-xl bg-midnight-950 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 resize-none h-16"
                required
              />

              {showCodeInput && (
                <textarea
                  value={doubtCode}
                  onChange={(e) => setDoubtCode(e.target.value)}
                  placeholder="// Paste relevant code snippet here..."
                  className="w-full font-mono text-[11px] p-2.5 rounded-xl bg-black/60 border border-white/10 text-cyan-300 placeholder-slate-600 focus:outline-none focus:border-cyan-500 resize-none h-20"
                />
              )}

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCodeInput(!showCodeInput)}
                    className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                  >
                    <FileCode className="w-3.5 h-3.5" />
                    <span>{showCodeInput ? "Remove Code" : "+ Code"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDoubtPriority(doubtPriority === "normal" ? "urgent" : "normal")}
                    className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors ${
                      doubtPriority === "urgent"
                        ? "bg-red-500/20 text-red-300 border-red-500/40 font-bold"
                        : "bg-white/5 text-slate-400 border-white/10"
                    }`}
                  >
                    {doubtPriority === "urgent" ? "Urgent Priority" : "Normal"}
                  </button>
                </div>

                <Button type="submit" size="sm" variant="gradient" className="text-xs py-1.5 px-3">
                  Submit Question
                </Button>
              </div>
            </form>

            {/* Doubts List */}
            <div className="space-y-3">
              {doubts.map((d) => (
                <div
                  key={d.id}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    d.status === "pinned"
                      ? "bg-cyan-500/10 border-cyan-500/40"
                      : d.status === "resolved"
                      ? "bg-emerald-500/5 border-emerald-500/20 opacity-80"
                      : "bg-white/[0.03] border-white/10"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-white">{d.studentName}</span>
                      {d.priority === "urgent" && (
                        <span className="px-1.5 py-0.2 rounded-full bg-red-500/20 text-red-400 text-[9px] font-bold">
                          URGENT
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      {isTeacherOrHost && (
                        <button
                          onClick={() => onPinDoubt(d.id)}
                          className={`p-1 rounded text-slate-400 hover:text-cyan-300 ${
                            d.status === "pinned" ? "text-cyan-400" : ""
                          }`}
                          title="Pin question to top"
                        >
                          <Pin className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {d.status === "resolved" && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-slate-200 mt-2 font-medium">{d.question}</p>

                  {d.codeSnippet && (
                    <pre className="mt-2 p-2 rounded-lg bg-black/60 text-cyan-300 font-mono text-[10px] overflow-x-auto border border-white/5">
                      {d.codeSnippet}
                    </pre>
                  )}

                  {/* Answers */}
                  {d.answers.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-white/5 space-y-1.5">
                      {d.answers.map((ans) => (
                        <div key={ans.id} className="p-2 rounded-xl bg-white/5 text-[11px]">
                          <span className="font-bold text-cyan-300">{ans.authorName}: </span>
                          <span className="text-slate-200">{ans.text}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Reply button for teachers */}
                  {isTeacherOrHost && replyingToDoubtId !== d.id && (
                    <button
                      onClick={() => setReplyingToDoubtId(d.id)}
                      className="mt-2 text-[11px] text-cyan-400 hover:underline font-semibold"
                    >
                      + Answer Question
                    </button>
                  )}

                  {replyingToDoubtId === d.id && (
                    <div className="mt-2 pt-2 border-t border-white/10 space-y-1.5">
                      <input
                        type="text"
                        value={answerInput}
                        onChange={(e) => setAnswerInput(e.target.value)}
                        placeholder="Write verified instructor answer..."
                        className="w-full text-xs px-2.5 py-1.5 rounded-lg bg-midnight-950 border border-cyan-500/40 text-white"
                      />
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => setReplyingToDoubtId(null)}
                          className="text-[10px] text-slate-400 px-2 py-0.5"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handlePostAnswer(d.id)}
                          className="text-[10px] bg-cyan-500 text-midnight-950 font-bold px-2.5 py-0.5 rounded-md"
                        >
                          Resolve & Post
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= NOTES TAB ================= */}
        {activeTab === "notes" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <input
                type="text"
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                className="text-xs font-bold text-white bg-transparent border-b border-white/20 pb-1 focus:outline-none focus:border-purple-400"
              />
              <button
                onClick={handleSaveCurrentNote}
                className="px-2.5 py-1 rounded-lg bg-purple-600/30 text-purple-300 border border-purple-500/40 text-[11px] font-semibold hover:bg-purple-600/50"
              >
                Autosave
              </button>
            </div>

            <textarea
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="Take structured markdown notes during lecture (timestamps, formulas, key links)..."
              className="w-full h-64 text-xs p-3 rounded-2xl bg-midnight-900 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 resize-none font-mono leading-relaxed"
            />

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isSharedNote}
                  onChange={(e) => setIsSharedNote(e.target.checked)}
                  className="rounded accent-purple-600"
                />
                <span className="text-[11px]">Share with entire cohort</span>
              </label>

              <button
                onClick={() => {
                  const blob = new Blob([noteContent], { type: "text/markdown" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `${noteTitle.replace(/\s+/g, "_")}.md`;
                  a.click();
                }}
                className="text-[11px] text-purple-400 hover:text-purple-300 flex items-center gap-1 font-semibold"
              >
                <Download className="w-3.5 h-3.5" /> Export MD
              </button>
            </div>

            {/* List of saved cohort notes */}
            {notes.length > 0 && (
              <div className="pt-3 border-t border-white/10 space-y-2">
                <span className="text-[11px] font-semibold text-slate-400">Classroom Shared Notes:</span>
                {notes.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => {
                      setActiveNoteId(n.id);
                      setNoteTitle(n.title);
                      setNoteContent(n.content);
                      setIsSharedNote(n.isShared);
                    }}
                    className="p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/10 border border-white/5 cursor-pointer"
                  >
                    <h5 className="text-xs font-semibold text-white">{n.title}</h5>
                    <span className="text-[10px] text-slate-400">By {n.authorName}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= MATERIALS TAB ================= */}
        {activeTab === "materials" && (
          <div className="space-y-4">
            {isTeacherOrHost && (
              <div className="p-3.5 rounded-2xl bg-pink-500/10 border border-pink-500/20 space-y-2">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5 text-pink-400" /> Share Document / PDF
                </span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const name = prompt("Enter Material Title / File Name:");
                      if (name) onUploadMaterial(name, "pdf");
                    }}
                    className="text-xs py-1.5 border-pink-500/30 text-pink-300 hover:bg-pink-500/20"
                  >
                    + Add Lecture PDF
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const name = prompt("Enter Code Asset Name:");
                      if (name) onUploadMaterial(name, "code");
                    }}
                    className="text-xs py-1.5 border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20"
                  >
                    + Add Code File
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-2.5">
              {materials.map((m) => (
                <div
                  key={m.id}
                  className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center font-bold text-xs">
                      {m.fileType.toUpperCase()}
                    </div>
                    <div>
                      <h5 className="text-xs font-semibold text-white line-clamp-1">{m.title}</h5>
                      <span className="text-[10px] text-slate-400">
                        {(m.sizeBytes / 1024).toFixed(0)} KB • By {m.uploadedBy}
                      </span>
                    </div>
                  </div>

                  <a
                    href={m.fileUrl}
                    download
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white"
                    title="Download File"
                  >
                    <FileDown className="w-4 h-4 text-pink-400" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
