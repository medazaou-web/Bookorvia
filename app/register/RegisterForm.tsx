"use client";
import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import supabase from "../../lib/supabase/browserClient";
import { AlertIcon, CheckIcon, CalendarIcon, ClientsIcon, LoyaltyIcon, MessageIcon } from "@/components/icons";
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

  const benefits = [
    { Icon: CalendarIcon, label: "Smart Scheduling" },
    { Icon: ClientsIcon, label: "Client Management" },
    { Icon: LoyaltyIcon, label: "Loyalty Rewards" },
    { Icon: MessageIcon, label: "SMS & WhatsApp" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 flex flex-col items-center justify-center p-4 overflow-hidden transition-colors duration-200">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-400/5 dark:bg-indigo-500/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-400/5 dark:bg-blue-500/5 rounded-full blur-3xl"></div>
      </div>

      {/* Top controls */}
      <div className="absolute top-4 right-4 flex items-center gap-3 z-10">
        <LanguageSwitcher />
        <ThemeToggle />
      </div>

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center relative z-10">
        {/* Left: Benefits Section */}
        <div className="hidden md:block">
          <div className="mb-8">
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-3">
              {t('auth.startBuildingLoyalty')}
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 mb-8">
              {t('auth.freeTrialDescription')}
            </p>
          </div>

          {/* Benefits Checklist */}
          <div className="space-y-4">
            {benefits.map((benefit, idx) => (
              <div key={idx} className="flex items-center gap-4 p-4 rounded-2xl bg-white/40 dark:bg-slate-800/40 backdrop-blur border border-white/60 dark:border-slate-700/40 hover:bg-white/60 dark:hover:bg-slate-700/60 transition-all">
                <benefit.Icon className="h-7 w-7 flex-shrink-0 text-indigo-600 dark:text-indigo-400" />
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">{benefit.label}</p>
                </div>
                <CheckIcon className="h-5 w-5 ml-auto text-emerald-500" />
              </div>
            ))}
          </div>

          {/* Social Proof */}
          <div className="mt-8 p-4 rounded-2xl bg-gradient-to-r from-blue-500/10 dark:from-blue-600/20 to-indigo-500/10 dark:to-indigo-600/20 border border-blue-200/50 dark:border-blue-700/30">
            <p className="text-sm text-slate-700 dark:text-slate-300">
              <span className="font-bold text-slate-900 dark:text-white">500+ businesses</span> are already using Bookorvia
            </p>
          </div>
        </div>

        {/* Right: Register Card */}
        <div className="w-full">
          <div className="rounded-3xl bg-white dark:bg-slate-900 backdrop-blur-md border border-white/80 dark:border-slate-700/60 p-8 shadow-2xl">
            <form onSubmit={handleRegister} className="space-y-5">
              {error && (
                <div className="rounded-2xl bg-gradient-to-r from-red-50 dark:from-red-950/60 to-red-100/50 dark:to-red-900/60 border border-red-200 dark:border-red-700/80 p-4 text-sm text-red-700 dark:text-red-200 font-medium animate-pulse">
                  <div className="flex items-start gap-3">
                    <AlertIcon className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    <div>{error}</div>
                  </div>
                </div>
              )}
              {info && (
                <div className="rounded-2xl bg-gradient-to-r from-emerald-50 dark:from-emerald-950/60 to-emerald-100/50 dark:to-emerald-900/60 border border-emerald-200 dark:border-emerald-700/80 p-4 text-sm text-emerald-700 dark:text-emerald-200 font-medium">
                  <div className="flex items-start gap-3">
                    <CheckIcon className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    <div>{info}</div>
                  </div>
                </div>
              )}

              {/* Email Field */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2.5">{t('auth.emailAddress')}</label>
                <input 
                  required 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  type="email" 
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white/50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent focus:bg-white dark:focus:bg-slate-800 transition-all" 
                  placeholder="you@example.com" 
                />
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2.5">{t('common.password')}</label>
                <input 
                  required 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  type="password" 
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white/50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent focus:bg-white dark:focus:bg-slate-800 transition-all" 
                  placeholder="••••••••" 
                />
              </div>

              {/* Confirm Password Field */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2.5">{t('common.confirmPassword')}</label>
                <input 
                  required 
                  value={confirm} 
                  onChange={(e) => setConfirm(e.target.value)} 
                  type="password" 
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white/50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent focus:bg-white dark:focus:bg-slate-800 transition-all" 
                  placeholder="••••••••" 
                />
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                disabled={loading}
                className="w-full mt-7 px-4 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold text-center hover:from-indigo-700 hover:to-blue-700 hover:shadow-xl dark:from-indigo-600 dark:to-blue-600 dark:hover:from-indigo-500 dark:hover:to-blue-500 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
              >
                {loading ? t('auth.creatingAccount') : t('auth.startFreeTrial')}
              </button>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-300 dark:border-slate-600"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white dark:bg-slate-900 px-3 text-slate-500 dark:text-slate-400 font-medium">{t('auth.alreadyHaveAccount')}</span>
                </div>
              </div>

              {/* Sign In Link */}
              <a 
                href="/login" 
                className="block w-full px-4 py-3 rounded-xl border-2 border-indigo-200 dark:border-indigo-700/50 bg-white/60 dark:bg-slate-800/60 text-indigo-600 dark:text-indigo-400 font-bold text-center hover:bg-indigo-50 dark:hover:bg-slate-700/80 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all duration-200"
              >
                {t('auth.signIn')}
              </a>
            </form>
          </div>

          {/* Footer */}
          <div className="mt-6 space-y-3">
            <div className="text-center text-xs text-slate-600 dark:text-slate-400">
              <p>{t('auth.agreeToTermsRegister')}</p>
            </div>
            <div className="flex gap-3 text-xs text-slate-600 dark:text-slate-400 justify-center flex-wrap">
              <Link href="/cookies" className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition-colors font-medium">{t('public.cookies')}</Link>
              <span className="text-slate-400 dark:text-slate-600">•</span>
              <Link href="/refund-policy" className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition-colors font-medium">{t('public.refund')}</Link>
              <span className="text-slate-400 dark:text-slate-600">•</span>
              <Link href="/contact" className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition-colors font-medium">{t('public.contact')}</Link>
              <span className="text-slate-400 dark:text-slate-600">•</span>
              <Link href="/help" className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition-colors font-medium">{t('public.help')}</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
