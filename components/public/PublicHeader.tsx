"use client";
import Image from "next/image";
import Link from "next/link";

export default function PublicHeader() {
  return (
    <nav className="sticky top-0 z-50 border-b border-white/40 dark:border-white/10 backdrop-blur-xl bg-white/60 dark:bg-slate-950/40 supports-[backdrop-filter]:bg-white/30 dark:supports-[backdrop-filter]:bg-slate-950/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Image 
            src="/bookorvia-logo.png" 
            alt="Bookorvia" 
            width={40} 
            height={40} 
            className="h-10 w-10 rounded-lg"
          />
          <span className="text-xl font-bold text-slate-900 dark:text-white">Bookorvia</span>
        </Link>
        <div className="hidden md:flex items-center gap-8">
          <a href="/#features" className="text-sm text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 font-medium transition-colors">Features</a>
          <a href="/#pricing" className="text-sm text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 font-medium transition-colors">Pricing</a>
          <Link href="/help" className="text-sm text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 font-medium transition-colors">Help</Link>
          <Link href="/login" className="px-4 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-white/10 text-sm font-semibold transition-colors">Sign In</Link>
          <Link href="/register" className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-sm font-semibold hover:shadow-lg transition-all">Start Free</Link>
        </div>
        <div className="md:hidden flex items-center gap-2">
          <Link href="/login" className="px-2 py-1 rounded-lg text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-white/50 dark:hover:bg-white/10 transition-colors">Sign In</Link>
          <Link href="/register" className="px-3 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-sm font-semibold">Start</Link>
        </div>
      </div>
    </nav>
  );
}
