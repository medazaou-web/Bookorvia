"use client";
import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import supabase from "../../lib/supabase/browserClient";
import { AlertIcon, CheckIcon } from "@/components/icons";
import { useLanguage } from "@/lib/context/LanguageContext";
import { useTranslations } from "@/lib/i18n";
import { LanguageSwitcher } from "@/app/components/LanguageSwitcher";
import { ThemeToggle } from "@/app/components/ThemeToggle";

export default function RegisterForm() {
  const router = useRouter();
  const { language } = useLanguage();
  const t = useTranslations(language);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);

    if (!email || !password) {
      setError(t('authMessages.pleaseProvideEmailPassword'));
      return;
    }
    if (password !== confirm) {
      setError(t('authMessages.passwordsDoNotMatch'));
      return;
    }

    setLoading(true);
    try {
      const { data, error: err } = await supabase.auth.signUp({ email, password });
      if (err) {
        setError(err.message || "Registration failed.");
      } else {
        if (data?.user) {
          try {
            await fetch("/api/auth/refresh", { method: "POST", credentials: "include" });
          } catch (e) {
            // ignore
          }
          router.push("/dashboard");
        } else {
          setInfo(t('authMessages.checkEmailToConfirm'));
        }
      }
    } catch (e: any) {
      setError(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 flex flex-col items-center justify-center p-4 overflow-hidden transition-colors duration-200">
      {/* Top controls */}
      <div className="absolute top-4 right-4 flex items-center gap-3">
        <LanguageSwitcher />
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <Image 
            src="/bookorvia-logo.png" 
            alt="Bookorvia" 
            width={56} 
            height={56} 
            className="mx-auto h-14 w-14 rounded-2xl mb-4"
          />
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{t('auth.startBuildingLoyalty')}</h1>
          <p className="text-slate-600 dark:text-slate-400">{t('auth.freeTrialDescription')}</p>
        </div>

        {/* Main Card */}
        <div className="rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-white/60 dark:border-white/10 p-8 shadow-2xl">
          <form onSubmit={handleRegister} className="space-y-6">
            {error && (
              <div className="rounded-2xl bg-gradient-to-r from-red-50 dark:from-red-950/30 to-red-100/50 dark:to-red-900/30 border border-red-200 dark:border-red-800/50 p-4 text-sm text-red-700 dark:text-red-300 font-medium">
                <div className="flex items-start gap-3">
                  <AlertIcon className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <div>{error}</div>
                </div>
              </div>
            )}
            {info && (
              <div className="rounded-2xl bg-gradient-to-r from-emerald-50 dark:from-emerald-950/30 to-emerald-100/50 dark:to-emerald-900/30 border border-emerald-200 dark:border-emerald-800/50 p-4 text-sm text-emerald-700 dark:text-emerald-300 font-medium">
                <div className="flex items-start gap-3">
                  <CheckIcon className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <div>{info}</div>
                </div>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">{t('auth.emailAddress')}</label>
              <input 
                required 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                type="email" 
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white/50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-all" 
                placeholder="you@example.com" 
              />
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">{t('common.password')}</label>
              <input 
                required 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                type="password" 
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white/50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-all" 
                placeholder="••••••••" 
              />
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">{t('common.confirmPassword')}</label>
              <input 
                required 
                value={confirm} 
                onChange={(e) => setConfirm(e.target.value)} 
                type="password" 
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white/50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-all" 
                placeholder="••••••••" 
              />
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={loading}
              className="w-full mt-8 px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold text-center hover:shadow-2xl hover:-translate-y-1 active:scale-95 disabled:opacity-60 transition-all duration-200"
            >
              {loading ? t('auth.creatingAccount') : t('auth.startFreeTrial')}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white dark:bg-slate-900 px-2 text-slate-600 dark:text-slate-400">{t('auth.alreadyHaveAccount')}</span>
            </div>
          </div>

          {/* Sign In Link */}
          <a 
            href="/login" 
            className="block w-full px-4 py-3 rounded-xl border-2 border-indigo-200 dark:border-indigo-800 bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-bold text-center hover:bg-indigo-50 dark:hover:bg-slate-700 transition-colors"
          >
            {t('auth.signIn')}
          </a>
        </div>

        {/* Footer */}
        <div className="mt-6 space-y-3">
          <div className="text-center text-xs text-slate-600 dark:text-slate-400">
            <p>{t('auth.agreeToTermsRegister')}</p>
          </div>
          <div className="flex gap-4 text-xs text-slate-600 dark:text-slate-400 justify-center flex-wrap">
            <Link href="/cookies" className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">{t('public.cookies')}</Link>
            <Link href="/refund-policy" className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">{t('public.refund')}</Link>
            <Link href="/contact" className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">{t('public.contact')}</Link>
            <Link href="/help" className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">{t('public.help')}</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
