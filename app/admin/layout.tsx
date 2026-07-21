"use client";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import supabase from "../../lib/supabase/browserClient";
import AdminProtect from "./AdminProtect";
import { ThemeToggle } from "../components/ThemeToggle";
import {
  DashboardIcon,
  SupportIcon,
  ClientsIcon,
  BusinessIcon,
  MenuIcon,
  CloseIcon,
} from "@/components/icons";

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [profile, setProfile] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    getProfile();
  }, []);

  async function getProfile() {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const user = (userData as any)?.user;
      if (!user) return;

      const { data: prof } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (prof) {
        setProfile(prof);
      }
    } catch (e) {
      console.error("Failed to fetch profile:", e);
    }
  }

  const navItems = [
    { href: "/admin", label: "Overview", Icon: DashboardIcon },
    { href: "/admin/support", label: "Support Tickets", Icon: SupportIcon },
    { href: "/admin/users", label: "Users", Icon: ClientsIcon },
    { href: "/admin/businesses", label: "Businesses", Icon: BusinessIcon },
  ];

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  return (
    <div className="app-content min-h-screen flex flex-col md:flex-row overflow-hidden relative transition-colors duration-200">
      {/* Mobile Header */}
      <div className="glass-panel neon-outline flex md:hidden items-center justify-between border-b border-slate-200/70 dark:border-white/10 px-4 py-4 relative z-50">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center text-white font-bold">C</div>
          <div>
            <div className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">Bookorvia</div>
            <div className="text-xs text-slate-600 dark:text-slate-400">Admin</div>
          </div>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-95 transition-all"
        >
          {sidebarOpen ? <CloseIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
        </button>
      </div>

      {/* Desktop Sidebar */}
      <aside className="glass-panel neon-outline hidden md:flex md:w-72 flex-col border-r border-slate-200/70 dark:border-white/10 sticky top-0 h-screen overflow-y-auto relative z-40 transition-colors duration-200">
        <div className="p-6 border-b border-slate-200/70 dark:border-white/10">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center text-white font-bold">C</div>
            <div>
              <div className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">Bookorvia</div>
              <div className="text-xs text-slate-600 dark:text-slate-400">Admin</div>
            </div>
          </div>
        </div>

        <nav className="p-6 flex-1 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
                isActive(item.href)
                  ? "bg-indigo-100 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-200 border border-indigo-300 dark:border-indigo-400/30"
                  : "text-slate-700 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-800/50 border border-transparent"
              }`}
            >
              <item.Icon className={`h-5 w-5 flex-shrink-0 ${
                isActive(item.href) ? "text-indigo-600 dark:text-indigo-300" : "text-slate-600 dark:text-slate-400"
              }`} />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-200/70 dark:border-white/10 space-y-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm text-slate-700 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-800/50 transition-all border border-transparent"
          >
            <span className="text-lg">← </span>
            <span>Back to Dashboard</span>
          </Link>
        </div>
      </aside>

      {/* Mobile Menu */}
      {sidebarOpen && (
        <div className="glass-panel md:hidden border-b border-slate-200/70 dark:border-white/10 p-4 animate-in fade-in duration-200 z-40">
          <nav className="space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
                  isActive(item.href)
                    ? "bg-indigo-100 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-200 border border-indigo-300 dark:border-indigo-400/30"
                    : "text-slate-700 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-800/50 border border-transparent"
                }`}
              >
                <item.Icon className={`h-5 w-5 flex-shrink-0 ${
                  isActive(item.href) ? "text-indigo-600 dark:text-indigo-300" : "text-slate-600 dark:text-slate-400"
                }`} />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
          <div className="mt-4 pt-4 border-t border-white/40 dark:border-white/10">
            <Link
              href="/dashboard"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm text-slate-700 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-800/50 transition-all border border-transparent"
            >
              <span className="text-lg">← </span>
              <span>Back to Dashboard</span>
            </Link>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="app-content flex-1 flex flex-col overflow-hidden relative z-10">
        {/* Top Bar for Desktop */}
        <div className="glass-panel hidden md:flex items-center justify-between border-b border-slate-200/70 dark:border-white/10 px-6 lg:px-8 py-4 sticky top-0 z-30 transition-colors duration-200">
          <div className="text-sm font-semibold text-slate-600 dark:text-slate-400">Admin Area</div>
          <div className="flex items-center gap-4">
            <span className="text-xs bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-200 px-3 py-1 rounded-full font-semibold border border-amber-300 dark:border-amber-400/30">
              {profile?.role?.toUpperCase() || 'ADMIN'}
            </span>
            <ThemeToggle />
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-10">
            <div className="mx-auto max-w-6xl">{children}</div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminProtect>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </AdminProtect>
  );
}
