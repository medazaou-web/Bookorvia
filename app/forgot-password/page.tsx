'use client';

import { useState } from 'react';
import Link from 'next/link';
import supabase from '@/lib/supabase/browserClient';
import { useLanguage } from '@/lib/context/LanguageContext';
import { useTranslations } from '@/lib/i18n';
import { LanguageSwitcher } from '@/app/components/LanguageSwitcher';
import { ThemeToggle } from '@/app/components/ThemeToggle';

export default function ForgotPasswordPage() {
  const { language } = useLanguage();
  const t = useTranslations(language);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      if (!email.trim()) {
        setErrorMessage(t('authMessages.pleaseEnterEmail'));
        setIsLoading(false);
        return;
      }

      const appUrl = process.env.NEXT_PUBLIC_APP_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${appUrl}/reset-password`,
      });

      if (error) {
        // Show user-friendly message, not raw error
        setErrorMessage(t('authMessages.unableToProcessRequest'));
        console.error('Password reset error:', error);
      } else {
        setSuccessMessage(t('authMessages.resetLinkSent'));
        setEmail('');
      }
    } catch (err) {
      setErrorMessage(t('authMessages.somethingWentWrong'));
      console.error('Unexpected error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 flex flex-col items-center justify-center p-4 transition-colors duration-200">
      {/* Top controls */}
      <div className="absolute top-4 right-4 flex items-center gap-3">
        <LanguageSwitcher />
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md">
        {/* Card */}
        <div className="rounded-3xl bg-white/90 dark:bg-slate-900 backdrop-blur border border-white/60 dark:border-slate-700/50 shadow-2xl p-8 sm:p-10">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="inline-block mb-4 px-4 py-2 rounded-full bg-indigo-100/60 dark:bg-indigo-900/40 border border-indigo-200/60 dark:border-indigo-700/40">
              <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-400">🔐 {t('auth.passwordReset')}</span>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{t('auth.forgotPasswordTitle')}</h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              {t('auth.forgotPasswordDescription')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                {t('auth.emailAddress')}
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading || !!successMessage}
                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* Success Message */}
            {successMessage && (
              <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-700 p-4">
                <p className="text-sm text-emerald-800 dark:text-emerald-300">✓ {successMessage}</p>
              </div>
            )}

            {/* Error Message */}
            {errorMessage && (
              <div className="rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-700 p-4">
                <p className="text-sm text-red-800 dark:text-red-300">✕ {errorMessage}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !!successMessage}
              className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold hover:from-indigo-700 hover:to-blue-700 dark:from-indigo-600 dark:to-blue-600 dark:hover:from-indigo-500 dark:hover:to-blue-500 hover:shadow-lg active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
            >
              {isLoading ? t('auth.sending') : t('auth.sendResetLink')}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400">or</span>
            </div>
          </div>

          {/* Links */}
          <div className="space-y-3 text-center text-sm">
            <p className="text-slate-700 dark:text-slate-300">
              {t('auth.rememberPassword')}{' '}
              <Link href="/login" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-semibold hover:underline">
                {t('auth.signIn')}
              </Link>
            </p>
            <p className="text-slate-700 dark:text-slate-300">
              {t('auth.dontHaveAccount')}{' '}
              <Link href="/register" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-semibold hover:underline">
                {t('auth.createOne')}
              </Link>
            </p>
          </div>

          {/* Legal Links Footer */}
          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
            <div className="flex flex-wrap justify-center gap-3 text-xs text-slate-600 dark:text-slate-400">
              <Link href="/terms" className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">{t('public.terms')}</Link>
              <span>•</span>
              <Link href="/privacy" className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">{t('public.privacy')}</Link>
              <span>•</span>
              <Link href="/help" className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">{t('public.help')}</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
