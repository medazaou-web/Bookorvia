"use client";
import { useState } from "react";
import Link from "next/link";
import Sidebar from "./Sidebar";
import ProfileDropdown from "./ProfileDropdown";
import PageTransition from "./PageTransition";
import { ThemeToggle } from "../components/ThemeToggle";

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 flex flex-col md:flex-row overflow-hidden relative transition-colors duration-200">
      {/* Mobile top bar */}
      <div className="flex md:hidden items-center justify-between border-b border-white/40 dark:border-white/10 backdrop-blur-xl bg-white/60 dark:bg-slate-950/40 px-4 sm:px-6 py-4 relative z-50">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center text-white font-bold">C</div>
          <div className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">Bookorvia</div>
        </div>
        <button 
          onClick={() => setOpen(!open)} 
          className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-95 transition-all"
        >
          {open ? '✕' : '☰'}
        </button>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:w-72 flex-col border-r border-white/40 dark:border-white/10 backdrop-blur-xl bg-white/60 dark:bg-slate-950/40 sticky top-0 h-screen overflow-y-auto relative z-40">
        <div className="p-6 border-b border-white/40 dark:border-white/10">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center text-white font-bold">C</div>
            <div>
              <div className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">Bookorvia</div>
              <div className="text-xs text-slate-600 dark:text-slate-400">Business</div>
            </div>
          </div>
        </div>
        <div className="p-6 flex-1">
          <Sidebar />
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden relative z-10">
        {/* Top bar for desktop */}
        <div className="hidden md:flex items-center justify-between border-b border-white/40 dark:border-white/10 backdrop-blur-xl bg-white/60 dark:bg-slate-950/40 px-6 lg:px-8 py-4 sticky top-0 z-30">
          <div className="text-sm font-semibold text-slate-600 dark:text-slate-400">Welcome back</div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link href="/dashboard/support" className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-800/50 transition-colors flex items-center gap-2">
              Help
            </Link>
            <ProfileDropdown />
          </div>
        </div>

        {/* Mobile menu drawer */}
        {open && (
          <div className="md:hidden border-b border-white/40 dark:border-white/10 backdrop-blur-xl bg-white/60 dark:bg-slate-950/40 p-4 animate-in fade-in duration-200 z-40">
            <Sidebar />
          </div>
        )}

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-10">
            <div className="mx-auto max-w-6xl">
              <PageTransition>{children}</PageTransition>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
