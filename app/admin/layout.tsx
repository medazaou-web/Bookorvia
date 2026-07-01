"use client";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import supabase from "../../lib/supabase/browserClient";
import AdminProtect from "./AdminProtect";

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
    { href: "/admin", label: "Overview", icon: "📊" },
    { href: "/admin/support", label: "Support Tickets", icon: "🆘" },
    { href: "/admin/users", label: "Users", icon: "👥" },
    { href: "/admin/businesses", label: "Businesses", icon: "🏢" },
  ];

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex flex-col md:flex-row overflow-hidden relative">
      {/* Mobile Header */}
      <div className="flex md:hidden items-center justify-between border-b border-white/40 backdrop-blur-xl bg-white/60 px-4 py-4 relative z-50">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center text-white font-bold">C</div>
          <div>
            <div className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">Bookorvia</div>
            <div className="text-xs text-slate-600">Admin</div>
          </div>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 active:scale-95 transition-all"
        >
          {sidebarOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-72 flex-col border-r border-white/40 backdrop-blur-xl bg-white/60 sticky top-0 h-screen overflow-y-auto relative z-40">
        <div className="p-6 border-b border-white/40">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center text-white font-bold">C</div>
            <div>
              <div className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">Bookorvia</div>
              <div className="text-xs text-slate-600">Admin</div>
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
                  ? "bg-indigo-100 text-indigo-700 border border-indigo-300"
                  : "text-slate-700 hover:bg-white/50 border border-transparent"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-6 border-t border-white/40">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm text-slate-700 hover:bg-white/50 transition-all border border-transparent"
          >
            <span className="text-lg">← </span>
            <span>Back to Dashboard</span>
          </Link>
        </div>
      </aside>

      {/* Mobile Menu */}
      {sidebarOpen && (
        <div className="md:hidden border-b border-white/40 backdrop-blur-xl bg-white/60 p-4 animate-in fade-in duration-200 z-40">
          <nav className="space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
                  isActive(item.href)
                    ? "bg-indigo-100 text-indigo-700 border border-indigo-300"
                    : "text-slate-700 hover:bg-white/50 border border-transparent"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
          <div className="mt-4 pt-4 border-t border-white/40">
            <Link
              href="/dashboard"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm text-slate-700 hover:bg-white/50 transition-all border border-transparent"
            >
              <span className="text-lg">← </span>
              <span>Back to Dashboard</span>
            </Link>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative z-10">
        {/* Top Bar for Desktop */}
        <div className="hidden md:flex items-center justify-between border-b border-white/40 backdrop-blur-xl bg-white/60 px-6 lg:px-8 py-4 sticky top-0 z-30">
          <div className="text-sm font-semibold text-slate-600">Admin Area</div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-amber-100 text-amber-700 px-3 py-1 rounded-full font-semibold">
              Role: {profile?.role?.toUpperCase()}
            </span>
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
