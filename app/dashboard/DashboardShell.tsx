"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Sidebar from "./Sidebar";
import ProfileDropdown from "./ProfileDropdown";
import PageTransition from "./PageTransition";
import DashboardRoutePreloader from "./DashboardRoutePreloader";
import DashboardDataSync from "./DashboardDataSync";
import { ThemeToggle } from "../components/ThemeToggle";
import { LanguageSwitcher } from "../components/LanguageSwitcher";
import NotificationBell from "./NotificationBell";
import { useLanguage } from "@/lib/context/LanguageContext";
import { useTranslations } from "@/lib/i18n";

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const { language } = useLanguage();
  const t = useTranslations(language);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 flex flex-col md:flex-row relative transition-colors duration-200">
      <DashboardRoutePreloader />
      <DashboardDataSync />
      {/* Mobile top bar */}
      <div className="flex md:hidden items-center justify-between border-b border-white/40 dark:border-white/10 backdrop-blur-xl bg-white/60 dark:bg-slate-950/40 px-4 sm:px-6 py-4 relative z-50 transition-all duration-300">
        <div className="flex items-center gap-3">
          <Image 
            src="/bookorvia-logo.png" 
            alt="Bookorvia" 
            width={40} 
            height={40} 
            className="h-10 w-10 rounded-lg"
          />
          <div className="text-lg font-bold text-slate-900 dark:text-white">Bookorvia</div>
        </div>
        <button 
          onClick={() => setOpen(!open)} 
          className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-95 transition-all duration-200 ease-out smooth-hover"
        >
          {open ? '✕' : '☰'}
        </button>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:w-72 flex-col border-r border-white/40 dark:border-white/10 backdrop-blur-xl bg-white/60 dark:bg-slate-950/40 sticky top-0 h-screen overflow-y-auto relative z-40">
        <div className="p-6 border-b border-white/40 dark:border-white/10">
          <div className="flex items-center gap-3 mb-8">
            <Image 
              src="/bookorvia-logo.png" 
              alt="Bookorvia" 
              width={40} 
              height={40} 
              className="h-10 w-10 rounded-lg"
            />
            <div>
              <div className="text-lg font-bold text-slate-900 dark:text-white">Bookorvia</div>
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
        <div className="hidden md:flex items-center justify-between border-b border-white/40 dark:border-white/10 backdrop-blur-xl bg-white/60 dark:bg-slate-950/40 px-6 lg:px-8 py-4 sticky top-0 z-30 transition-all duration-300">
          <div className="text-sm font-semibold text-slate-600 dark:text-slate-400">{t('dashboard.welcomeBackText')}</div>
          <div className="flex items-center gap-4">
            <NotificationBell />
            <LanguageSwitcher />
            <ThemeToggle />
            <Link href="/dashboard/support" className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-800/50 transition-all duration-300 ease-out smooth-hover flex items-center gap-2">
              {t('dashboard.helpLink')}
            </Link>
            <ProfileDropdown />
          </div>
        </div>

        {/* Mobile menu drawer */}
        {open && (
          <div className="md:hidden border-b border-white/40 dark:border-white/10 backdrop-blur-xl bg-white/60 dark:bg-slate-950/40 p-4 animate-slide-in-left z-40">
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
