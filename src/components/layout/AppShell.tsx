"use client";

import React, { useState } from "react";
import AppSidebar from "./AppSidebar";
import AppHeader from "./AppHeader";
import { AuthProvider } from "@/lib/auth-context";

interface AppShellProps {
  children: React.ReactNode;
  breadcrumbs?: { label: string; href?: string }[];
}

export default function AppShell({ children, breadcrumbs }: AppShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <AuthProvider>
      <div className="min-h-screen bg-midnight-950 text-slate-100 flex">
        {/* Desktop Sidebar */}
        <div className="hidden md:block shrink-0">
          <AppSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
        </div>

        {/* Mobile Drawer */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            <div
              className="fixed inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <div className="relative w-64 bg-midnight-950 h-full z-10">
              <AppSidebar
                collapsed={false}
                setCollapsed={() => setMobileOpen(false)}
              />
            </div>
          </div>
        )}

        {/* Main Content Layout */}
        <div
          className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
            collapsed ? "md:pl-20" : "md:pl-64"
          }`}
        >
          <AppHeader
            onToggleSidebar={() => setMobileOpen(true)}
            breadcrumbs={breadcrumbs}
          />

          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
            {children}
          </main>
        </div>
      </div>
    </AuthProvider>
  );
}
