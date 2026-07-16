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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 flex flex-col items-center justify-center p-4 transition-colors duration-200">
      {/* Top controls */}
      <div className="absolute top-4 right-4 flex items-center gap-3">
        <LanguageSwitcher />
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md">
        {/* Card */}
        <div className="rounded-3xl bg-white/80 backdrop-blur border border-white/60 shadow-2xl p-8 sm:p-10">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="inline-block mb-4 px-4 py-2 rounded-full bg-indigo-100/60 border border-indigo-200/60">
              <span className="text-xs font-semibold text-indigo-700">🔐 {t('auth.passwordReset')}</span>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">{t('auth.forgotPasswordTitle')}</h1>
            <p className="text-slate-600 text-sm">
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
                className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-slate-900/50 backdrop-blur border border-white/60 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* Success Message */}
            {successMessage && (
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4">
                <p className="text-sm text-emerald-800">✓ {successMessage}</p>
              </div>
            )}

            {/* Error Message */}
            {errorMessage && (
              <div className="rounded-xl bg-red-50 border border-red-200 p-4">
                <p className="text-sm text-red-800">✕ {errorMessage}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !!successMessage}
              className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:translate-y-0"
            >
              {isLoading ? t('auth.sending') : t('auth.sendResetLink')}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200/50"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-white text-slate-600">or</span>
            </div>
          </div>

          {/* Links */}
          <div className="space-y-3 text-center text-sm">
            <p className="text-slate-700">
              {t('auth.rememberPassword')}{' '}
              <Link href="/login" className="text-indigo-600 hover:text-indigo-700 font-semibold hover:underline">
                {t('auth.signIn')}
              </Link>
            </p>
            <p className="text-slate-700">
              {t('auth.dontHaveAccount')}{' '}
              <Link href="/register" className="text-indigo-600 hover:text-indigo-700 font-semibold hover:underline">
                {t('auth.createOne')}
              </Link>
            </p>
          </div>

          {/* Legal Links Footer */}
          <div className="mt-8 pt-6 border-t border-slate-200/50">
            <div className="flex flex-wrap justify-center gap-3 text-xs text-slate-600">
              <Link href="/terms" className="text-slate-700 hover:text-slate-900 transition-colors">{t('public.terms')}</Link>
              <span>•</span>
              <Link href="/privacy" className="text-slate-700 hover:text-slate-900 transition-colors">{t('public.privacy')}</Link>
              <span>•</span>
              <Link href="/help" className="text-slate-700 hover:text-slate-900 transition-colors">{t('public.help')}</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
