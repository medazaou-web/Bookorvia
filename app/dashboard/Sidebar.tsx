"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/lib/context/LanguageContext";
import { useTranslations } from "@/lib/i18n";
import {
  DashboardIcon,
  ClientsIcon,
  BookingIcon,
  CalendarIcon,
  ServicesIcon,
  ReviewsIcon,
  FollowUpsIcon,
  LoyaltyIcon,
  BusinessPageIcon,
  SettingsIcon,
} from "@/components/icons";

export default function Sidebar() {
  const { language } = useLanguage();
  const t = useTranslations(language);
  const pathname = usePathname() || "/dashboard";

  const primaryLinks = [
    { href: "/dashboard", label: t('dashboard.overview'), Icon: DashboardIcon },
    { href: "/dashboard/clients", label: t('dashboard.clients'), Icon: ClientsIcon },
    { href: "/dashboard/bookings", label: t('dashboard.bookings'), Icon: BookingIcon },
    { href: "/dashboard/calendar", label: t('dashboard.calendar'), Icon: CalendarIcon },
  ];

  const secondaryLinks = [
    { href: "/dashboard/services", label: t('dashboard.services'), Icon: ServicesIcon },
    { href: "/dashboard/reviews", label: t('dashboard.reviews'), Icon: ReviewsIcon },
    { href: "/dashboard/follow-ups", label: t('dashboard.followUps'), Icon: FollowUpsIcon },
    { href: "/dashboard/loyalty", label: t('dashboard.loyaltyCards'), Icon: LoyaltyIcon },
  ];

  const settingsLinks = [
    { href: "/dashboard/business-page", label: t('dashboard.businessPage'), Icon: BusinessPageIcon },
    { href: "/dashboard/settings", label: t('dashboard.settings'), Icon: SettingsIcon },
  ];

  const LinkItem = ({ href, label, Icon, active }: any) => (
    <Link
      href={href}
      prefetch={true}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
        active 
          ? "neon-outline bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-lg" 
          : "text-slate-600 dark:text-slate-300 hover:bg-white/80 dark:hover:bg-slate-800/70 hover:text-slate-800 dark:hover:text-slate-100 border border-transparent"
      }`}
    >
      <Icon className={`h-5 w-5 flex-shrink-0 ${active ? "text-white dark:text-slate-900" : "text-slate-500 dark:text-slate-400"}`} />
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
      <div className="border-t border-slate-200/70 dark:border-white/10" />

      {/* Secondary Navigation */}
      <div className="space-y-2">
        <div className="px-4 py-2 text-xs font-bold text-slate-500 dark:text-slate-500 uppercase tracking-wider">{t('dashboard.features')}</div>
        {secondaryLinks.map((l) => {
          const active = pathname === l.href || pathname.startsWith(l.href + "/");
          return <LinkItem key={l.href} {...l} active={active} />;
        })}
      </div>

      {/* Settings */}
      <div className="space-y-2">
        <div className="px-4 py-2 text-xs font-bold text-slate-500 dark:text-slate-500 uppercase tracking-wider">{t('dashboard.system')}</div>
        {settingsLinks.map((l) => {
          const active = pathname === l.href || pathname.startsWith(l.href + "/");
          return <LinkItem key={l.href} {...l} active={active} />;
        })}
      </div>
    </nav>
  );
}
