"use client";

import React, { useState } from "react";
import { Terminal, Play, Bot, Sparkles, CheckCircle2, RotateCcw, Copy, Check } from "lucide-react";

export default function LiveLabPreview() {
  const [isRunning, setIsRunning] = useState(false);
  const [hasRun, setHasRun] = useState(false);
  const [activeTab, setActiveTab] = useState<"code" | "ai">("code");
  const [copied, setCopied] = useState(false);

  const initialCode = `// SkillNova Interactive Lab: Real-time Vector Similarity Search
import { cosineSimilarity, VectorStore } from "@skillnova/ai-core";

async function queryKnowledgeBase(userPrompt: string, topK: number = 3) {
  const vectorStore = new VectorStore({ indexName: "placement-curriculum" });
  
  // 1. Generate text embedding
  const queryEmbedding = await vectorStore.embedText(userPrompt);
  
  // 2. Perform Cosine Similarity against 45,000 indexed questions
  const matches = await vectorStore.similaritySearch(queryEmbedding, {
    k: topK,
    minScore: 0.85
  });

  return matches.map(match => ({
    topic: match.metadata.topic,
    difficulty: match.metadata.difficulty,
    relevance: match.score.toFixed(3)
  }));
}

// Execute query for SDE interview prep
export default queryKnowledgeBase("Dynamic Programming on Trees", 2);`;

  const [code, setCode] = useState(initialCode);

  const handleRun = () => {
    setIsRunning(true);
    setTimeout(() => {
      setIsRunning(false);
      setHasRun(true);
    }, 900);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <section id="coding-lab" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-medium mb-3">
            <Terminal className="w-3.5 h-3.5" />
            <span>Browser-Based Cloud Sandbox</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Write Code. Get Socratic AI Guidance.{" "}
            <span className="text-gradient-cyan">Pass Real Tech Screens.</span>
          </h2>
          <p className="mt-4 text-slate-300 text-sm sm:text-base">
            Zero setup overhead. Experience our zero-latency WebAssembly compiler with inline AI feedback, step-by-step memory inspection, and automated test runners.
          </p>
        </div>

        {/* Interactive Editor Mockup Container */}
        <div className="relative rounded-2xl border border-white/10 bg-midnight-900/90 shadow-glass overflow-hidden backdrop-blur-xl">
          {/* Top Window Bar */}
          <div className="px-4 py-3 bg-midnight-950 border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 mr-3">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              </div>
              <span className="text-xs font-mono text-slate-400">vector-rag-search.ts</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                TypeScript 5.4
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="px-2.5 py-1 rounded-lg text-xs font-mono text-slate-400 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>

              <button
                onClick={() => {
                  setCode(initialCode);
                  setHasRun(false);
                }}
                className="px-2.5 py-1 rounded-lg text-xs font-mono text-slate-400 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>

              <button
                onClick={handleRun}
                disabled={isRunning}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 shadow-glow-cyan transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                <Play className={`w-3.5 h-3.5 fill-white ${isRunning ? "animate-spin" : ""}`} />
                <span>{isRunning ? "Executing..." : "Run in Sandbox"}</span>
              </button>
            </div>
          </div>

          {/* Editor Body Grid: Code + AI Copilot / Terminal */}
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[380px]">
            {/* Left: Code Editor View */}
            <div className="lg:col-span-7 p-4 sm:p-5 font-mono text-xs sm:text-sm bg-midnight-950/70 border-b lg:border-b-0 lg:border-r border-white/10 overflow-x-auto text-slate-200">
              <div className="flex">
                <div className="select-none text-slate-600 text-right pr-4 font-mono text-xs leading-6 opacity-60">
                  {code.split("\n").map((_, i) => (
                    <div key={i}>{i + 1}</div>
                  ))}
                </div>
                <pre className="font-mono text-xs leading-6 text-slate-200 overflow-x-auto">
                  <code>{code}</code>
                </pre>
              </div>
            </div>

            {/* Right: Terminal Output & AI Tutor Panel */}
            <div className="lg:col-span-5 flex flex-col bg-midnight-900/80">
              {/* Tab Selector */}
              <div className="flex border-b border-white/10 bg-midnight-950/40">
                <button
                  onClick={() => setActiveTab("code")}
                  className={`flex-1 py-2.5 px-4 text-xs font-mono font-medium flex items-center justify-center gap-2 border-b-2 transition-colors ${
                    activeTab === "code"
                      ? "border-cyan-400 text-cyan-300 bg-white/5"
                      : "border-transparent text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Terminal Output</span>
                </button>
                <button
                  onClick={() => setActiveTab("ai")}
                  className={`flex-1 py-2.5 px-4 text-xs font-mono font-medium flex items-center justify-center gap-2 border-b-2 transition-colors ${
                    activeTab === "ai"
                      ? "border-purple-400 text-purple-300 bg-white/5"
                      : "border-transparent text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Bot className="w-3.5 h-3.5 text-purple-400" />
                  <span>AI Study Copilot</span>
                </button>
              </div>

              {/* Tab Content */}
              <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between overflow-y-auto">
                {activeTab === "code" ? (
                  <div className="font-mono text-xs space-y-3">
                    <div className="text-slate-400">
                      $ node --loader ts-node/esm vector-rag-search.ts
                    </div>

                    {isRunning && (
                      <div className="text-cyan-400 animate-pulse flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                        <span>Compiling AST & calculating cosine distances...</span>
                      </div>
                    )}

                    {hasRun && !isRunning ? (
                      <div className="space-y-3">
                        <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>All 4 test assertions passed in 38ms (Memory: 18.4MB)</span>
                        </div>

                        <div className="p-3 rounded-lg bg-midnight-950 border border-white/10 text-slate-300 text-[11px] leading-relaxed">
                          <div className="text-cyan-400 font-semibold mb-1">Result JSON:</div>
                          [<br />
                          &nbsp;&nbsp;{`{ topic: "DP with Binary Lifting", difficulty: "Hard", relevance: 0.942 }`},<br />
                          &nbsp;&nbsp;{`{ topic: "Subtree Re-rooting Pattern", difficulty: "Medium", relevance: 0.891 }`}<br />
                          ]
                        </div>

                        <div className="text-purple-300 text-[11px] flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                          <span>Placement Readiness Boost: +25 Points</span>
                        </div>
                      </div>
                    ) : (
                      !isRunning && (
                        <div className="text-slate-500 text-xs italic">
                          Click &quot;Run in Sandbox&quot; to compile and execute the test pipeline.
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  /* AI Copilot Tab */
                  <div className="space-y-3">
                    <div className="flex items-start gap-2.5 p-3 rounded-xl bg-purple-950/20 border border-purple-500/20">
                      <div className="w-7 h-7 rounded-lg bg-purple-600/30 border border-purple-500/40 flex items-center justify-center shrink-0">
                        <Bot className="w-4 h-4 text-purple-300" />
                      </div>
                      <div className="text-xs text-slate-200 leading-relaxed">
                        <div className="font-semibold text-purple-300 mb-1">SkillNova AI Mentor:</div>
                        Your cosine similarity retrieval logic is clean! For top-tier tech rounds, interviewer may ask:{" "}
                        <span className="text-cyan-300 italic font-mono">&quot;How would you scale this to 10M embeddings with sub-10ms latency?&quot;</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-midnight-950 border border-white/10 text-xs text-slate-300">
                      <div className="text-[11px] font-mono uppercase text-slate-400 mb-1.5">Suggested Architecture Refactor:</div>
                      <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px]">
                        <li>Switch to HNSW (Hierarchical Navigable Small World) indexing.</li>
                        <li>Implement Product Quantization (PQ) for 4x memory compression.</li>
                      </ul>
                    </div>
                  </div>
                )}

                {/* Footer status */}
                <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Sandbox Container: Online
                  </span>
                  <span>AWS us-east-1 Micro-Node</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
