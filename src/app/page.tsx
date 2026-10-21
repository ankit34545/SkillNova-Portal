import React from "react";
import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import CareerPath3D from "@/components/3d/CareerPath3D";
import TrackShowcase from "@/components/landing/TrackShowcase";
import LiveLabPreview from "@/components/landing/LiveLabPreview";
import PlacementStats from "@/components/landing/PlacementStats";
import StudentTestimonials from "@/components/landing/StudentTestimonials";
import Footer from "@/components/landing/Footer";
import Link from "next/link";
import { ArrowRight, Sparkles, Rocket, Terminal, BookOpen, Video, Users } from "lucide-react";

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col bg-midnight-950 text-slate-100 selection:bg-purple-600/30 selection:text-cyan-300">
      {/* Navigation */}
      <Navbar />

      {/* Hero Section with Spatial 3D AI Core Canvas */}
      <HeroSection />

      {/* Interactive 3D Career Path Section */}
      <section id="career-paths" className="py-14 sm:py-18 relative bg-midnight-950/90 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-mono font-medium mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Spatial Career Roadmap</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              From College Fundamentals to{" "}
              <span className="text-gradient-cyan">Tier-1 Product Roles</span>
            </h2>
            <p className="mt-2 text-slate-400 text-xs sm:text-sm">
              Inspect hands-on capstones, verified placement benchmarks, and core engineering milestones.
            </p>
          </div>

          <CareerPath3D />
        </div>
      </section>

      {/* Curricula & Tracks Grid */}
      <TrackShowcase />

      {/* Live Coding Sandbox & AI Copilot Preview */}
      <section id="coding-lab">
        <LiveLabPreview />
      </section>

      {/* Placement Benchmarks & College Testimonials */}
      <PlacementStats />
      <StudentTestimonials />

      {/* Bottom Conversion CTA Strip */}
      <section className="py-16 relative overflow-hidden border-t border-white/5">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl p-8 sm:p-10 border border-purple-500/30 bg-gradient-to-tr from-purple-900/20 via-midnight-900/80 to-cyan-900/20 backdrop-blur-xl text-center overflow-hidden shadow-2xl">
            <div className="relative z-10">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 text-cyan-300 text-xs font-mono mb-3 border border-white/10">
                <Rocket className="w-3.5 h-3.5 text-cyan-400" />
                <span>2026 Engineering Cohorts Active</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                Accelerate Your Engineering Career with{" "}
                <span className="text-gradient-primary">SkillNova Spatial AI</span>
              </h2>

              <p className="mt-3 text-slate-300 text-xs sm:text-sm max-w-lg mx-auto">
                Join over 45,000 college engineers leveling up their full-stack systems, LLM pipelines, and live interview skills.
              </p>

              <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/dashboard"
                  className="w-full sm:w-auto px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 shadow-glow-violet transition-all text-xs sm:text-sm flex items-center justify-center gap-2"
                >
                  <span>Launch Student Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/courses"
                  className="w-full sm:w-auto px-5 py-3 rounded-xl font-medium text-slate-200 bg-midnight-950 hover:bg-midnight-900 border border-white/10 transition-all text-xs sm:text-sm flex items-center justify-center gap-2"
                >
                  <BookOpen className="w-4 h-4 text-purple-400" />
                  <span>Browse Curricula</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </main>
  );
}
