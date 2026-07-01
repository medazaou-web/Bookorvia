"use client";
import Link from "next/link";

export default function PublicFooter() {
  return (
    <footer className="border-t border-white/40 dark:border-white/10 px-4 sm:px-6 lg:px-8 py-12 bg-white/10 dark:bg-slate-950/40 backdrop-blur">
      <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-sm text-slate-600 dark:text-slate-400">© {new Date().getFullYear()} Bookorvia — Built for local businesses</div>
        <div className="flex gap-6 text-sm flex-wrap justify-center md:justify-end">
          <Link href="/terms" className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">Terms</Link>
          <Link href="/privacy" className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">Privacy</Link>
          <Link href="/cookies" className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">Cookies</Link>
          <Link href="/refund-policy" className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">Refund Policy</Link>
          <Link href="/contact" className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">Contact</Link>
          <Link href="/help" className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">Help</Link>
        </div>
      </div>
    </footer>
  );
}
