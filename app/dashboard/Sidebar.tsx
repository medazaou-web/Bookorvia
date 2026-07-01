"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";

export default function Sidebar() {
  const pathname = usePathname() || "/dashboard";

  const primaryLinks = [
    { href: "/dashboard", label: "Overview", icon: "📊" },
    { href: "/dashboard/clients", label: "Clients", icon: "👥" },
    { href: "/dashboard/bookings", label: "Bookings", icon: "📅" },
    { href: "/dashboard/calendar", label: "Calendar", icon: "📆" },
  ];

  const secondaryLinks = [
    { href: "/dashboard/services", label: "Services", icon: "🏷️" },
    { href: "/dashboard/reviews", label: "Reviews", icon: "⭐" },
    { href: "/dashboard/follow-ups", label: "Follow-ups", icon: "💬" },
    { href: "/dashboard/loyalty", label: "Loyalty Cards", icon: "🎁" },
  ];

  const settingsLinks = [
    { href: "/dashboard/business-page", label: "Business Page", icon: "🌐" },
    { href: "/dashboard/settings", label: "Settings", icon: "⚙️" },
  ];

  const LinkItem = ({ href, label, icon, active }: any) => (
    <Link
      href={href}
      prefetch={true}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
        active 
          ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg" 
          : "text-slate-700 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-slate-800/50 dark:hover:text-slate-200"
      }`}
    >
      <span className="text-lg">{icon}</span>
      <span>{label}</span>
      {active && <span className="ml-auto text-xs">→</span>}
    </Link>
  );

  return (
    <nav className="flex flex-col gap-8 text-sm">
      {/* Primary Navigation */}
      <div className="space-y-2">
        {primaryLinks.map((l) => {
          const active = pathname === l.href || pathname.startsWith(l.href + "/");
          return <LinkItem key={l.href} {...l} active={active} />;
        })}
      </div>

      {/* Divider */}
      <div className="border-t border-white/40 dark:border-white/10" />

      {/* Secondary Navigation */}
      <div className="space-y-2">
        <div className="px-4 py-2 text-xs font-bold text-slate-500 dark:text-slate-500 uppercase tracking-wider">Features</div>
        {secondaryLinks.map((l) => {
          const active = pathname === l.href || pathname.startsWith(l.href + "/");
          return <LinkItem key={l.href} {...l} active={active} />;
        })}
      </div>

      {/* Settings */}
      <div className="space-y-2">
        <div className="px-4 py-2 text-xs font-bold text-slate-500 dark:text-slate-500 uppercase tracking-wider">System</div>
        {settingsLinks.map((l) => {
          const active = pathname === l.href || pathname.startsWith(l.href + "/");
          return <LinkItem key={l.href} {...l} active={active} />;
        })}
      </div>
    </nav>
  );
}
