"use client";
import { useEffect, useRef, useState } from "react";
import supabase from "../../lib/supabase/browserClient";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/context/LanguageContext";
import { useTranslations } from "@/lib/i18n";
import { SettingsIcon, LogoutIcon, AdminIcon, SupportIcon } from "@/components/icons";

export default function ProfileDropdown() {
  const { language } = useLanguage();
  const t = useTranslations(language);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    // Close dropdown when clicking outside
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  async function loadProfile() {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const currentUser = (userData as any)?.user ?? null;
      if (!currentUser) return;

      setUser(currentUser);

      const { data: prof } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", currentUser.id)
        .single();

      setProfile(prof ?? null);
    } catch (e) {
      console.error("Failed to load profile:", e);
    }
  }

  async function handleLogout() {
    try {
      await supabase.auth.signOut();
      router.push("/login");
    } catch (e) {
      console.error("Logout failed:", e);
    }
  }

  // Get avatar or initials
  const getInitials = () => {
    if (profile?.full_name) {
      return profile.full_name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return "U";
  };

  const avatarUrl = profile?.avatar_url;
  const email = user?.email ?? "user@example.com";
  const fullName = profile?.full_name ?? "User";

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-blue-400 flex items-center justify-center text-white font-bold hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:ring-offset-2 dark:focus:ring-offset-slate-950 overflow-hidden"
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt="Avatar"
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-sm">{getInitials()}</span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur border border-slate-200/60 dark:border-slate-700/60 shadow-xl animate-in fade-in zoom-in-95 duration-200 z-50">
          {/* Profile Info */}
          <div className="p-4 border-b border-slate-200/40 dark:border-slate-700/40">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-blue-400 flex items-center justify-center text-white font-bold flex-shrink-0 overflow-hidden">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{getInitials()}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-slate-900 dark:text-white truncate">
                  {fullName}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400 truncate">{email}</div>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="p-2">
            <a
              href="/dashboard/profile"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200"
              onClick={() => setOpen(false)}
            >
              <SettingsIcon className="h-5 w-5" />
              <span>{t('common.profileMenuSettings')}</span>
            </a>

            <a
              href="/dashboard/support"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-amber-50 dark:hover:bg-amber-950/30 hover:text-amber-600 dark:hover:text-amber-400 transition-colors duration-200"
              onClick={() => setOpen(false)}
            >
              <SupportIcon className="h-5 w-5" />
              <span>{t('common.profileMenuSupport')}</span>
            </a>

            {(profile?.role === "admin" || profile?.role === "support" || profile?.role === "support_manager") && (
              <a
                href="/admin"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-200"
                onClick={() => setOpen(false)}
              >
                <AdminIcon className="h-5 w-5" />
                <span>{t('common.profileMenuAdmin')}</span>
              </a>
            )}

            <div className="border-t border-slate-200/40 dark:border-slate-700/40 my-2"></div>

            <button
              onClick={() => {
                setOpen(false);
                handleLogout();
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-200"
            >
              <LogoutIcon className="h-5 w-5" />
              <span>{t('common.logout')}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
