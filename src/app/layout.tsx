import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#060814",
};

export const metadata: Metadata = {
  title: "SkillNova — Futuristic 3D AI Learning & Placement Platform",
  description: "Master modern software engineering, generative AI, cloud systems, and placement interviews through interactive 3D roadmaps and intelligent AI tutoring.",
  keywords: [
    "AI Learning Platform",
    "3D WebGL Learning",
    "Computer Science Placement Prep",
    "Next.js Course",
    "AI Study Copilot",
    "Mock Interview Simulator",
    "Coding Lab"
  ],
  authors: [{ name: "SkillNova Engineering" }],
  openGraph: {
    title: "SkillNova — Futuristic 3D AI Learning Platform",
    description: "Accelerate your engineering career with 3D roadmaps, AI mentors, and real-world project portfolios.",
    type: "website",
    locale: "en_US",
  },
};

import { AuthProvider } from "@/lib/auth-context";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-midnight-950 text-slate-100 antialiased selection:bg-purple-600/30 selection:text-cyan-300 min-h-screen flex flex-col">
        {/* Ambient background glows */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="glow-orb-violet -top-40 left-1/4 w-[600px] h-[600px] opacity-40 animate-pulse-slow" />
          <div className="glow-orb-cyan top-1/3 -right-20 w-[500px] h-[500px] opacity-35" />
          <div className="glow-orb-violet bottom-10 left-10 w-[450px] h-[450px] opacity-25" />
          <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none" />
        </div>

        <AuthProvider>
          <div className="relative z-10 flex flex-col min-h-screen">
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
