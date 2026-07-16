'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import supabase from '@/lib/supabase/browserClient';
import { useLanguage } from '@/lib/context/LanguageContext';
import { useTranslations } from '@/lib/i18n';
import { LanguageSwitcher } from '@/app/components/LanguageSwitcher';
import { ThemeToggle } from '@/app/components/ThemeToggle';

export default function ResetPasswordPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const t = useTranslations(language);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSessionValid, setIsSessionValid] = useState(false);

  // Check if there's a valid session from the reset link
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (session && !error) {
          setIsSessionValid(true);
        } else {
          setErrorMessage(t('auth.resetLinkExpired'));
        }
      } catch (err) {
        setErrorMessage(t('auth.sessionVerificationFailed'));
        console.error('Session check error:', err);
      }
    };

    checkSession();
  }, [t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    // Validation
    if (!password.trim()) {
      setErrorMessage(t('auth.pleaseEnterNewPassword'));
      return;
    }

    if (password.length < 8) {
      setErrorMessage(t('auth.passwordTooShort'));
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage(t('auth.passwordMustMatch'));
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        // Show user-friendly message, not raw error
        setErrorMessage(t('authMessages.unableToUpdatePassword'));
        console.error('Password update error:', error);
      } else {
        setSuccessMessage(t('auth.passwordUpdatedSuccess'));
        setPassword('');
        setConfirmPassword('');
        // Redirect to login after a short delay
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      }
    } catch (err) {
      setErrorMessage('Something went wrong. Please try again later.');
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
              <span className="text-xs font-semibold text-indigo-700">🔐 {t('auth.resetPasswordTitle')}</span>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">{t('auth.setNewPassword')}</h1>
            <p className="text-slate-600 text-sm">
              {t('auth.resetPasswordDescription')}
            </p>
          </div>

          {!isSessionValid ? (
            // Invalid session state
            <div className="space-y-4">
              <div className="rounded-xl bg-red-50 border border-red-200 p-4">
                <p className="text-sm text-red-800">
                  ✕ {t('auth.resetLinkExpiredMessage')}
                </p>
              </div>
              <Link
                href="/forgot-password"
                className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all active:scale-95 text-center block"
              >
                {t('auth.requestNewResetLink')}
              </Link>
              <Link
                href="/login"
                className="w-full px-4 py-3 rounded-xl border-2 border-indigo-200 bg-white/40 backdrop-blur text-indigo-600 font-semibold hover:bg-white/60 transition-all text-center block"
              >
                {t('auth.backToSignIn')}
              </Link>
            </div>
          ) : (
            // Valid session - show form
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* New Password Input */}
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                  {t('auth.newPassword')}
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder={t('auth.newPasswordPlaceholder')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading || !!successMessage}
                  className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-slate-900/50 backdrop-blur border border-white/60 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* Confirm Password Input */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                  {t('common.confirmPassword')}
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  placeholder={t('auth.confirmNewPassword')}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
                {isLoading ? t('auth.updating') : t('auth.updatePassword')}
              </button>
            </form>
          )}

          {/* Divider (if valid session) */}
          {isSessionValid && (
            <>
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200/50"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-2 bg-white text-slate-600">or</span>
                </div>
              </div>

              {/* Links */}
              <div className="text-center text-sm">
                <p className="text-slate-700">
                  {t('auth.rememberPassword')}{' '}
                  <Link href="/login" className="text-indigo-600 hover:text-indigo-700 font-semibold hover:underline">
                    {t('auth.signIn')}
                  </Link>
                </p>
              </div>
            </>
          )}

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
