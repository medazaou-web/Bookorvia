"use client";
import PublicHeader from "../../components/public/PublicHeader";
import PublicFooter from "../../components/public/PublicFooter";
import { useLanguage } from '@/lib/context/LanguageContext';
import { useTranslations } from '@/lib/i18n';

export default function CookiesPage() {
  const { language } = useLanguage();
  const t = useTranslations(language);
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex flex-col">
      <PublicHeader />
      
      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="rounded-3xl bg-white/80 backdrop-blur border border-white/60 shadow-xl p-8 sm:p-12">
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-slate-100 mb-4">{t('public.cookiePolicy')}</h1>
            <p className="text-slate-600 mb-8">{t('dashboard.lastUpdatedJune2026')}</p>

            <div className="prose prose-slate max-w-none space-y-8">
              <section>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">1. What Are Cookies?</h2>
              <p className="text-slate-700 leading-relaxed">
                Cookies are small text files stored on your device when you visit a website. They help websites remember your preferences and improve your browsing experience.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">2. Essential Cookies</h2>
              <p className="text-slate-700 leading-relaxed">
                These cookies are necessary for Bookorvia to function properly. They include:
              </p>
              <ul className="list-disc list-inside text-slate-700 space-y-2 mt-4">
                <li>Session cookies for maintaining your login session</li>
                <li>CSRF protection cookies for security</li>
                <li>Cookie preferences storage</li>
              </ul>
              <p className="text-slate-700 leading-relaxed mt-4">You cannot disable essential cookies, as they are required for the service to work.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">3. Authentication Cookies</h2>
              <p className="text-slate-700 leading-relaxed">
                Bookorvia uses Supabase for authentication. Auth-related cookies are stored to keep you logged in across sessions and to maintain your security. These cookies contain session tokens and do not store sensitive passwords.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">4. Analytics Cookies (Optional)</h2>
              <p className="text-slate-700 leading-relaxed">
                We may use analytics cookies to understand how users interact with Bookorvia. These help us improve features and identify usage patterns. You can opt-out of analytics cookies through your preferences.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">5. Managing Cookies</h2>
              <p className="text-slate-700 leading-relaxed">
                You can control cookies through your browser settings:
              </p>
              <ul className="list-disc list-inside text-slate-700 space-y-2 mt-4">
                <li>View and delete cookies</li>
                <li>Block cookies by default</li>
                <li>Allow exceptions for specific sites</li>
              </ul>
              <p className="text-slate-700 leading-relaxed mt-4">
                Please note that disabling cookies may affect Bookorvia's functionality, particularly your ability to stay logged in.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">6. Third-Party Cookies</h2>
              <p className="text-slate-700 leading-relaxed">
                Bookorvia may include third-party services (payment processors, analytics) that set their own cookies. These services have their own cookie policies which we encourage you to review.
              </p>
            </section>

            <div className="mt-12 p-6 rounded-xl bg-amber-50 border border-amber-200">
              <p className="text-sm text-amber-900">
                <strong>Note:</strong> This is a template cookie policy. Specific cookie usage may vary depending on implemented features and third-party services.
              </p>
            </div>
            </div> {/* End of prose div */}
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
