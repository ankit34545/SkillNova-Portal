import React from "react";
import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import CareerPath3D from "@/components/3d/CareerPath3D";
import TrackShowcase from "@/components/landing/TrackShowcase";
import LiveLabPreview from "@/components/landing/LiveLabPreview";
import FeaturesGrid from "@/components/landing/FeaturesGrid";
import PlacementStats from "@/components/landing/PlacementStats";
import StudentTestimonials from "@/components/landing/StudentTestimonials";
import Footer from "@/components/landing/Footer";
import Link from "next/link";
import { ArrowRight, Sparkles, Rocket } from "lucide-react";

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col bg-midnight-950 text-slate-100 selection:bg-purple-600/30 selection:text-cyan-300">
      {/* Navigation */}
      <Navbar />

      {/* Hero Section with 3D Canvas */}
      <HeroSection />

      {/* 3D Career Path Section */}
      <section className="py-16 sm:py-20 relative bg-midnight-950/80 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-medium mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Interactive 3D Progression Blueprint</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Spatial Career Roadmap:{" "}
              <span className="text-gradient-cyan">From Novice to FAANG Offer</span>
            </h2>
            <p className="mt-3 text-slate-300 text-sm sm:text-base">
              Explore each milestone stage, examine hands-on capstone deliverables, and see the exact placement impact for campus recruitment rounds.
            </p>
          </div>

          <CareerPath3D />
        </div>
      </section>

      {/* Featured Career Curricula & Tracks */}
      <TrackShowcase />

      {/* Interactive Browser Coding Sandbox & AI Copilot Preview */}
      <LiveLabPreview />

      {/* Platform Features Grid */}
      <FeaturesGrid />

      {/* Verified Placement Statistics & Hiring Partners */}
      <PlacementStats />

      {/* College Student Testimonials */}
      <StudentTestimonials />

      {/* Bottom Conversion Call-to-Action */}
      <section className="py-20 relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl p-8 sm:p-12 border border-purple-500/40 bg-gradient-to-tr from-purple-900/40 via-midnight-900/90 to-cyan-900/40 shadow-glow-violet backdrop-blur-2xl text-center overflow-hidden">
            {/* Ambient glows */}
            <div className="absolute top-0 right-0 w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-cyan-300 text-xs font-mono mb-4 border border-white/15">
                <Rocket className="w-3.5 h-3.5 text-cyan-400" />
                <span>Begin Your 2026 Engineering Sprint</span>
              </div>

              <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
                Ready to Experience Next-Gen{" "}
                <span className="text-gradient-primary">3D Tech Learning?</span>
              </h2>

              <p className="mt-4 text-slate-300 text-sm sm:text-base max-w-xl mx-auto">
                Join over 45,000 college engineers leveling up their coding, AI systems, and interview confidence right now.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/dashboard"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 shadow-glow-violet transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 text-sm"
                >
                  <span>Launch Student Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <a
                  href="#coding-lab"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-medium text-slate-200 bg-midnight-950/80 hover:bg-midnight-900 border border-white/10 hover:border-white/20 transition-all flex items-center justify-center gap-2 text-sm"
                >
                  <span>Test Coding Sandbox</span>
                </a>
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
