import type { Metadata } from "next";
import Link from "next/link";
import { Video, Zap } from "lucide-react";

export const metadata: Metadata = {
  title: "SkillNova Live — Virtual Classroom",
  description: "Host and join live virtual classrooms with HD video, collaborative whiteboard, screen sharing, and AI-powered teaching tools.",
};

export default function MeetLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-midnight-950 text-slate-100 flex flex-col">
      {/* Meet-specific top nav — separate from landing navbar */}
      <header className="sticky top-0 z-40 border-b border-white/5 bg-midnight-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <Link href="/meet" className="flex items-center gap-2.5 group">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-violet-600 to-cyan-500 flex items-center justify-center shadow-glow-violet group-hover:shadow-glow-cyan transition-shadow">
              <Video className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-white text-sm">SkillNova</span>
            <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400 text-sm">Live</span>
            <span className="hidden sm:inline-flex items-center gap-1 ml-1 px-1.5 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-[10px] font-mono">
              <Zap className="w-2.5 h-2.5" /> BETA
            </span>
          </Link>

          <nav className="flex items-center gap-1">
            <Link
              href="/"
              className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-white/5 transition-all"
            >
              ← SkillNova
            </Link>
            <Link
              href="/meet/new"
              className="px-4 py-1.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 transition-all shadow-glow-violet"
            >
              New Meeting
            </Link>
          </nav>
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1">{children}</main>
    </div>
  );
}
