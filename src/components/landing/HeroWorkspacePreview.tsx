"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Bot,
  TrendingUp,
  RotateCcw,
  Check,
} from "lucide-react";

export interface HeroWorkspacePreviewProps {
  selectedSkill?: string;
  onSkillSelect?: (skill: string) => void;
}

interface TrackData {
  filename: string;
  lang: string;
  unit: string;
  progress: number;
  initialCode: string;
  optimizedCode: string;
  suggestion: string;
  rationale: string;
}

export default function HeroWorkspacePreview({
  selectedSkill = "AI Engineering",
}: HeroWorkspacePreviewProps) {
  const [activeTab, setActiveTab] = useState<"editor" | "assistant">("editor");
  const [suggestionApplied, setSuggestionApplied] = useState(false);

  // Skill-specific code, optimizations, and curriculum metadata
  const snippetMap: Record<string, TrackData> = {
    "AI Engineering": {
      filename: "rag-pipeline.ts",
      lang: "TypeScript 5.7",
      unit: "Unit 9 of 14 • Vector Indexing",
      progress: 68,
      initialCode: `// SkillNova AI: Hybrid Search Reranking
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
      optimizedCode: `// SkillNova AI: Hybrid Search Reranking (Optimized)
export async function rerankContext(
  query: string,
  chunks: DocChunk[]
): Promise<DocChunk[]> {
  // Pre-filter with HNSW graph index before cross-encoder
  const candidateIds = await hnswIndex.search(query, { topK: 16 });
  const candidates = chunks.filter(c => candidateIds.has(c.id));
  const scores = await crossEncoder.score(query, candidates);
  return candidates
    .map((c, i) => ({ ...c, score: scores[i] }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);
}`,
      suggestion:
        "Optimize latency by pre-filtering embeddings with HNSW graph index before cross-encoder scoring.",
      rationale:
        "Reduces cross-encoder inference cost by ~72% under high concurrency without quality degradation.",
    },
    "Full-Stack Web": {
      filename: "edge-stream.ts",
      lang: "TypeScript 5.7",
      unit: "Unit 7 of 16 • Edge Runtimes",
      progress: 44,
      initialCode: `// SkillNova Full-Stack: Edge Streaming
export async function streamTokens(prompt: string) {
  const stream = await llm.generateStream({ prompt });
  return new Response(stream.toReadableStream(), {
    headers: { "Content-Type": "text/event-stream" },
  });
}`,
      optimizedCode: `// SkillNova Full-Stack: Edge Streaming (Optimized)
export async function streamTokens(prompt: string) {
  const stream = await llm.generateStream({ prompt });
  return new Response(stream.toReadableStream(), {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}`,
      suggestion:
        "Enable compression bypass on HTTP/2 chunk boundaries to minimize client time-to-first-token.",
      rationale:
        "Disables proxy buffering so chunks flush immediately to the browser with zero latency.",
    },
    "Cloud & DevOps": {
      filename: "k8s-topology.yaml",
      lang: "YAML / Kubernetes",
      unit: "Unit 11 of 15 • Autoscaling",
      progress: 73,
      initialCode: `# SkillNova Cloud: Production Pod Autoscaling
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
      optimizedCode: `# SkillNova Cloud: Production Pod Autoscaling (Stabilized)
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: inference-worker
spec:
  scaleTargetRef:
    kind: Deployment
    name: vllm-cluster
  minReplicas: 3
  maxReplicas: 24
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300`,
      suggestion:
        "Set scale-down stabilization window to 300s to avoid flapping during sporadic burst traffic.",
      rationale:
        "Prevents premature pod churn and cold-start spikes when LLM token requests arrive in bursts.",
    },
    "System Design & DSA": {
      filename: "lru-cache.ts",
      lang: "TypeScript 5.7",
      unit: "Unit 10 of 12 • Cache Topologies",
      progress: 83,
      initialCode: `// SkillNova Systems: O(1) Eviction Cache
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
      optimizedCode: `// SkillNova Systems: O(1) Eviction Cache (Pre-allocated)
class LRUCache<K, V> {
  private map: Map<K, Node<K, V>>;
  private head = new Node<K, V>();
  private tail = new Node<K, V>();

  constructor(private capacity: number) {
    this.map = new Map<K, Node<K, V>>();
  }

  get(key: K): V | undefined {
    const node = this.map.get(key);
    if (!node) return undefined;
    this.moveToHead(node);
    return node.value;
  }
}`,
      suggestion:
        "Pre-allocate map capacity and enforce bounded eviction limits to guarantee O(1) memory bounds.",
      rationale:
        "Guarantees deterministic GC footprint and avoids memory leaks under continuous writes.",
    },
  };

  const current = snippetMap[selectedSkill] || snippetMap["AI Engineering"];

  // Reset applied state when user switches skill track
  useEffect(() => {
    setSuggestionApplied(false);
  }, [selectedSkill]);

  const toggleSuggestion = () => {
    setSuggestionApplied((prev) => !prev);
  };

  return (
    <div className="w-full h-full p-4 sm:p-5 flex flex-col justify-between select-none">
      {/* Top Workspace Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-[11px] font-mono text-slate-200">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="truncate max-w-[140px] sm:max-w-none">{current.filename}</span>
          </div>
          <span className="hidden sm:inline text-[11px] font-mono text-slate-400">
            {current.lang}
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
      <div className="flex-1 my-3 rounded-xl bg-midnight-950/85 border border-white/10 p-3.5 sm:p-4 overflow-hidden relative flex flex-col justify-between shadow-inner">
        {/* Soft violet/cyan ambient glows (static, non-distracting) */}
        <div className="absolute -top-10 -right-10 w-44 h-44 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-44 h-44 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {activeTab === "editor" ? (
          <div className="relative z-10 flex flex-col justify-between h-full">
            <div className="overflow-x-auto">
              <pre className="font-mono text-[11px] sm:text-xs leading-relaxed text-slate-200 whitespace-pre">
                <code>{suggestionApplied ? current.optimizedCode : current.initialCode}</code>
              </pre>
            </div>

            {/* Micro AI Inline Suggestion Banner */}
            <div className="mt-3 p-2.5 rounded-lg bg-purple-950/50 border border-purple-500/30 flex items-start justify-between gap-3 backdrop-blur-sm">
              <div className="flex items-start gap-2.5 min-w-0">
                <Sparkles className="w-4 h-4 text-cyan-300 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-[11px] font-semibold text-cyan-300">
                      SkillNova Copilot
                    </p>
                    <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.2 rounded font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                      Live Suggestion
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 line-clamp-2 mt-0.5">
                    {current.suggestion}
                  </p>
                </div>
              </div>

              <button
                onClick={toggleSuggestion}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold shrink-0 transition-colors flex items-center gap-1 ${
                  suggestionApplied
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30"
                    : "bg-white/10 hover:bg-cyan-500/20 text-slate-200 hover:text-cyan-300 border border-white/10"
                }`}
                title={suggestionApplied ? "Revert to initial code" : "Apply optimization demo"}
              >
                {suggestionApplied ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span>Applied</span>
                    <RotateCcw className="w-2.5 h-2.5 text-slate-400 ml-0.5" />
                  </>
                ) : (
                  <span>Apply Hint</span>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="relative z-10 flex flex-col justify-between h-full space-y-3">
            <div className="space-y-2.5">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-300">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white">Spatial AI Tutor</span>
                  <p className="text-[10px] text-slate-400">Track: {selectedSkill}</p>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-white/[0.03] border border-white/10 text-xs text-slate-200 leading-relaxed space-y-1.5">
                <p className="text-purple-300 font-semibold text-[11px]">
                  Architectural Recommendation:
                </p>
                <p className="text-[11px] text-slate-300">{current.suggestion}</p>
                <p className="text-[10px] text-slate-400 pt-1 border-t border-white/5">
                  <strong className="text-slate-300">Rationale:</strong> {current.rationale}
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-cyan-950/30 border border-cyan-500/20 flex items-center justify-between text-xs text-cyan-300">
                <span>Verified Benchmark</span>
                <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-cyan-500/20">
                  Tier-1 Product Spec
                </span>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 flex items-center justify-between pt-2 border-t border-white/5">
              <span>Classroom Whiteboard Sync</span>
              <span className="text-emerald-400 font-medium flex items-center gap-1.5 text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Live Channel Ready
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Course Progress Strip */}
      <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-300 shrink-0">
            <TrendingUp className="w-3.5 h-3.5" />
          </div>
          <div className="truncate">
            <p className="text-[11px] font-semibold text-white truncate">{selectedSkill} Masterclass</p>
            <p className="text-[10px] text-slate-400">{current.unit}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right hidden sm:block">
            <span className="text-[10px] text-slate-400 font-mono">Progress</span>
            <p className="text-xs font-bold text-cyan-400 font-mono">{current.progress}%</p>
          </div>
          <div className="w-16 sm:w-20 h-2 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 rounded-full transition-all duration-300"
              style={{ width: `${current.progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
