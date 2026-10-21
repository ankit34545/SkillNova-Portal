"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Bot,
  Play,
  CheckCircle2,
  FileCode2,
  ArrowRight,
  ChevronRight,
  TrendingUp,
  Cpu,
  Layers,
  Check,
  Terminal,
  Code2,
} from "lucide-react";

export interface HeroWorkspacePreviewProps {
  selectedSkill?: string;
  onSkillSelect?: (skill: string) => void;
}

export default function HeroWorkspacePreview({
  selectedSkill = "AI Engineering",
  onSkillSelect,
}: HeroWorkspacePreviewProps) {
  const [activeTab, setActiveTab] = useState<"editor" | "assistant">("editor");
  const [suggestionApplied, setSuggestionApplied] = useState(false);

  // Skill-specific code snippets
  const snippetMap: Record<string, { filename: string; code: string; suggestion: string }> = {
    "AI Engineering": {
      filename: "rag-pipeline.ts",
      code: `// SkillNova AI: Hybrid Search Reranking
export async function rerankContext(
  query: string,
  chunks: DocChunk[]
): Promise<DocChunk[]> {
  const scores = await crossEncoder.score(query, chunks);
  return chunks
    .map((c, i) => ({ ...c, score: scores[i] }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);
}`,
      suggestion:
        "Optimize latency by pre-filtering embeddings with HNSW graph index before cross-encoder scoring.",
    },
    "Full-Stack Web": {
      filename: "edge-stream.ts",
      code: `// SkillNova Full-Stack: Edge Streaming
export async function streamTokens(prompt: string) {
  const stream = await llm.generateStream({ prompt });
  return new Response(stream.toReadableStream(), {
    headers: { "Content-Type": "text/event-stream" },
  });
}`,
      suggestion:
        "Enable compression on HTTP/2 stream chunk boundaries to reduce client time-to-first-token.",
    },
    "Cloud & DevOps": {
      filename: "k8s-topology.yaml",
      code: `# SkillNova Cloud: Production Pod Autoscaling
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: inference-worker
spec:
  scaleTargetRef:
    kind: Deployment
    name: vllm-cluster
  minReplicas: 3
  maxReplicas: 24`,
      suggestion:
        "Set scale-down stabilization window to 300s to avoid flapping during sporadic burst traffic.",
    },
    "System Design & DSA": {
      filename: "lru-cache.ts",
      code: `// SkillNova Systems: O(1) Eviction Cache
class LRUCache<K, V> {
  private map = new Map<K, Node<K, V>>();
  private head = new Node<K, V>();
  private tail = new Node<K, V>();

  get(key: K): V | undefined {
    const node = this.map.get(key);
    if (!node) return undefined;
    this.moveToHead(node);
    return node.value;
  }
}`,
      suggestion:
        "Pre-allocate map bucket sizing to minimize rehashing overhead under heavy concurrent reads.",
    },
  };

  const current = snippetMap[selectedSkill] || snippetMap["AI Engineering"];

  return (
    <div className="w-full h-full p-3 sm:p-5 flex flex-col justify-between select-none">
      {/* Top Workspace Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/5 border border-white/10 text-[11px] font-mono text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="truncate max-w-[140px] sm:max-w-none">{current.filename}</span>
          </div>
          <span className="hidden sm:inline text-[11px] font-mono text-slate-500">
            TypeScript 5.7
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveTab("editor")}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
              activeTab === "editor"
                ? "bg-purple-600/30 text-purple-200 border border-purple-500/40"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Editor
          </button>
          <button
            onClick={() => setActiveTab("assistant")}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${
              activeTab === "assistant"
                ? "bg-cyan-500/20 text-cyan-200 border border-cyan-500/40"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Bot className="w-3 h-3 text-cyan-400" />
            <span>AI Copilot</span>
          </button>
        </div>
      </div>

      {/* Main Workspace Body */}
      <div className="flex-1 my-3 rounded-xl bg-midnight-950/80 border border-white/5 p-3.5 sm:p-4 overflow-hidden relative flex flex-col justify-between">
        {/* Soft violet/cyan ambient glows */}
        <div className="absolute -top-10 -right-10 w-44 h-44 bg-purple-600/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-44 h-44 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

        {activeTab === "editor" ? (
          <div className="relative z-10 flex flex-col justify-between h-full">
            <pre className="font-mono text-[11px] sm:text-xs leading-relaxed text-slate-300 overflow-x-auto whitespace-pre">
              <code>{current.code}</code>
            </pre>

            {/* Micro AI Inline Suggestion Banner */}
            <div className="mt-3 p-2.5 rounded-lg bg-purple-950/40 border border-purple-500/30 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-cyan-300 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold text-cyan-300">
                  SkillNova AI Optimization Hint
                </p>
                <p className="text-[11px] text-slate-300 line-clamp-2 mt-0.5">
                  {current.suggestion}
                </p>
              </div>
              <button
                onClick={() => setSuggestionApplied(true)}
                className={`px-2 py-1 rounded text-[10px] font-semibold shrink-0 transition-colors ${
                  suggestionApplied
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                    : "bg-white/10 hover:bg-cyan-500/20 text-slate-200 hover:text-cyan-300 border border-white/10"
                }`}
              >
                {suggestionApplied ? "Applied ✓" : "Apply"}
              </button>
            </div>
          </div>
        ) : (
          <div className="relative z-10 flex flex-col justify-between h-full space-y-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-300">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white">Spatial AI Tutor</span>
                  <p className="text-[10px] text-slate-400">Context: {selectedSkill}</p>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-white/[0.03] border border-white/5 text-xs text-slate-200 leading-relaxed">
                <p className="text-purple-300 font-semibold mb-1 text-[11px]">
                  Architectural Review:
                </p>
                <p className="text-[11px] text-slate-300">{current.suggestion}</p>
              </div>

              <div className="p-2.5 rounded-lg bg-cyan-950/30 border border-cyan-500/20 flex items-center justify-between text-xs text-cyan-300">
                <span>Verified Benchmarks Available</span>
                <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-cyan-500/20">
                  Tier-1 SDE Spec
                </span>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 flex items-center justify-between pt-2 border-t border-white/5">
              <span>Ready for live classroom discussion</span>
              <span className="text-emerald-400 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Sync Active
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Course Progress Strip */}
      <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-300 shrink-0">
            <TrendingUp className="w-3.5 h-3.5" />
          </div>
          <div className="truncate">
            <p className="text-[11px] font-semibold text-white truncate">{selectedSkill} Masterclass</p>
            <p className="text-[10px] text-slate-400">Unit 9 of 14 • Vector Pipelines</p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right hidden sm:block">
            <span className="text-[10px] text-slate-400 font-mono">Progress</span>
            <p className="text-xs font-bold text-cyan-400 font-mono">68%</p>
          </div>
          <div className="w-16 sm:w-20 h-2 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 rounded-full w-[68%]" />
          </div>
        </div>
      </div>
    </div>
  );
}
