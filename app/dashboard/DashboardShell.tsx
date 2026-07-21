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
    <div className="app-content min-h-screen flex flex-col md:flex-row relative transition-colors duration-200">
      <DashboardRoutePreloader />
      <DashboardDataSync />
      {/* Mobile top bar */}
      <div className="futuristic-header neon-outline mx-3 mt-3 flex md:hidden items-center justify-between rounded-2xl px-4 sm:px-6 py-4 relative z-50 transition-all duration-300">
        <div className="flex items-center gap-3">
          <Image 
            src="/bookorvia-logo.png" 
            alt="Bookorvia" 
            width={40} 
            height={40} 
            className="h-10 w-10 rounded-lg"
          />
          <div>
            <div className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">Bookorvia</div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-cyan-700 dark:text-cyan-200">Command Center</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
          <button 
            onClick={() => setOpen(!open)} 
            className="rounded-lg border border-slate-300/70 dark:border-slate-600/70 bg-white/80 dark:bg-slate-800/80 px-3 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-95 transition-all duration-200 ease-out smooth-hover"
          >
            {open ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Desktop sidebar */}
      <aside className="sidebar-shell neon-outline hidden md:flex md:w-72 flex-col border-r sticky top-0 h-screen overflow-y-auto relative z-40 m-3 mr-0 rounded-3xl">
        <div className="p-6 border-b border-slate-200/70 dark:border-white/10">
          <div className="flex items-center gap-3 mb-8">
            <Image 
              src="/bookorvia-logo.png" 
              alt="Bookorvia" 
              width={40} 
              height={40} 
              className="h-10 w-10 rounded-lg"
            />
            <div>
              <div className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">Bookorvia</div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-cyan-700 dark:text-cyan-200">Business OS</div>
            </div>
          </div>
        </div>
        <div className="p-6 flex-1">
          <Sidebar />
        </div>
      </aside>

      {/* Main content */}
      <main className="app-content flex-1 flex flex-col overflow-hidden relative z-10">
        {/* Top bar for desktop */}
        <div className="hidden md:block px-4 lg:px-6 pt-4 sticky top-0 z-30">
          <div className="futuristic-header neon-outline rounded-2xl flex items-center justify-between px-6 lg:px-8 py-4 transition-all duration-300">
          <div className="text-sm font-semibold text-slate-600 dark:text-slate-400">{t('dashboard.welcomeBackText')}</div>
          <div className="flex items-center gap-4">
            <NotificationBell />
            <LanguageSwitcher />
            <ThemeToggle />
            <Link href="/dashboard/support" className="hover-lift px-4 py-2 rounded-lg border border-slate-300/70 dark:border-slate-600/70 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-white/80 dark:hover:bg-slate-800/70 transition-all duration-300 ease-out smooth-hover flex items-center gap-2">
              {t('dashboard.helpLink')}
            </Link>
            <ProfileDropdown />
          </div>
          </div>
        </div>

        {/* Mobile menu drawer */}
        {open && (
          <div className="futuristic-header md:hidden mx-3 mt-2 rounded-2xl p-4 animate-slide-in-left z-40">
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
