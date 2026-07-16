"use client";
import PublicHeader from "../../components/public/PublicHeader";
import PublicFooter from "../../components/public/PublicFooter";
import { SupportIcon, PhoneIcon, FollowUpMessageIcon, ChevronDownIcon } from "@/components/icons";
import { useLanguage } from '@/lib/context/LanguageContext';
import { useTranslations } from '@/lib/i18n';

export default function ContactPage() {
  const { language } = useLanguage();
  const t = useTranslations(language);
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex flex-col">
      <PublicHeader />
      
      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="rounded-3xl bg-white/80 backdrop-blur border border-white/60 shadow-xl p-8 sm:p-12">
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-slate-100 mb-4">{t('public.contactUs')}</h1>
            <p className="text-slate-600 mb-8">{t('public.weAreHereToHelp')}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              {/* Support for Logged-In Users */}
            <div className="rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200 p-6">
              <h2 className="text-2xl font-bold text-indigo-900 mb-3 flex items-center gap-2">
                <SupportIcon className="h-6 w-6 text-indigo-900" /> Support & Help
              </h2>
              <p className="text-slate-700 mb-4">
                If you're a Bookorvia user, use our dedicated support system for the fastest response.
              </p>
              <a
                href="/dashboard/support"
                className="inline-block px-6 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-all hover:shadow-lg active:scale-95"
              >
                Go to Support Dashboard
              </a>
              <p className="text-sm text-slate-600 mt-4">
                Log in to your account to submit a support ticket or view your existing requests.
              </p>
            </div>

            {/* General Contact */}
            <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 p-6">
              <h2 className="text-2xl font-bold text-emerald-900 mb-3 flex items-center gap-2">
                <PhoneIcon className="h-6 w-6 text-emerald-900" /> General Inquiry
              </h2>
              <p className="text-slate-700 mb-4">
                For general questions, press inquiries, or partnership opportunities.
              </p>
              <a
                href="mailto:support@bookorvia.pro"
                className="inline-block px-6 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-all hover:shadow-lg active:scale-95"
              >
                Email Us
              </a>
              <p className="text-sm text-slate-600 mt-4">
                Response within 24 hours
              </p>
            </div>
          </div>

          {/* Contact Options */}
          <div className="prose prose-slate max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">Ways to Reach Us</h2>
              <div className="space-y-4">
                <div className="rounded-lg bg-slate-50 border border-slate-200 p-4">
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-2"><SupportIcon className="h-5 w-5" /> Support Tickets (Recommended for Users)</h3>
                  <p className="text-slate-700">
                    If you have an active Bookorvia account, submit a support ticket through the Support & Help section. Include as much detail as possible about your issue. Our support team prioritizes tickets from logged-in users for faster resolution.
                  </p>
                </div>
                <div className="rounded-lg bg-slate-50 border border-slate-200 p-4">
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-2"><PhoneIcon className="h-5 w-5" /> Email</h3>
                  <p className="text-slate-700">
                    Email us at <a href="mailto:support@bookorvia.pro" className="text-indigo-600 hover:text-indigo-800 font-semibold">support@bookorvia.pro</a> for general inquiries, billing questions, or issues outside the support system.
                  </p>
                </div>
                <div className="rounded-lg bg-slate-50 border border-slate-200 p-4">
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-2"><FollowUpMessageIcon className="h-5 w-5" /> Response Times</h3>
                  <ul className="list-disc list-inside text-slate-700 space-y-1">
                    <li><strong>Urgent (High Priority):</strong> 2-4 hours</li>
                    <li><strong>Normal (Medium Priority):</strong> 4-24 hours</li>
                    <li><strong>Low Priority:</strong> 2-3 business days</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">FAQ</h2>
              <div className="space-y-4">
                <details className="group rounded-lg border border-slate-200 bg-white/50 p-4 cursor-pointer">
                  <summary className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    How do I reset my password?
                    <span className="ml-auto group-open:rotate-180 transition-transform">🔽</span>
                  </summary>
                  <p className="text-slate-700 mt-3">
                    Click "Forgot password?" on the login page. Enter your email address and we'll send you a password reset link. Check your email (and spam folder) for the link. Click it and enter a new password.
                  </p>
                </details>

                <details className="group rounded-lg border border-slate-200 bg-white/50 p-4 cursor-pointer">
                  <summary className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    How do I cancel my subscription?
                    <span className="ml-auto group-open:rotate-180 transition-transform">🔽</span>
                  </summary>
                  <p className="text-slate-700 mt-3">
                    Go to your account settings and select "Billing" or "Subscription". Click "Cancel Subscription" and follow the prompts. You can also contact support for assistance. See our <a href="/refund-policy" className="text-indigo-600 hover:text-indigo-800 font-semibold">Refund & Cancellation Policy</a> for details.
                  </p>
                </details>

                <details className="group rounded-lg border border-slate-200 bg-white/50 p-4 cursor-pointer">
                  <summary className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    Do you offer refunds?
                    <span className="ml-auto group-open:rotate-180 transition-transform">🔽</span>
                  </summary>
                  <p className="text-slate-700 mt-3">
                    We offer refunds under specific circumstances, including billing errors, service interruptions, and within 14 days of your first subscription payment. See our <a href="/refund-policy" className="text-indigo-600 hover:text-indigo-800 font-semibold">Refund & Cancellation Policy</a> for complete details.
                  </p>
                </details>

                <details className="group rounded-lg border border-slate-200 bg-white/50 p-4 cursor-pointer">
                  <summary className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    How secure is my business data?
                    <span className="ml-auto group-open:rotate-180 transition-transform">🔽</span>
                  </summary>
                  <p className="text-slate-700 mt-3">
                    Bookorvia uses industry-standard encryption (HTTPS/TLS) and secure database (Supabase with PostgreSQL). Your data is encrypted both in transit and at rest. See our <a href="/privacy" className="text-indigo-600 hover:text-indigo-800 font-semibold">Privacy Policy</a> for detailed security information.
                  </p>
                </details>

                <details className="group rounded-lg border border-slate-200 bg-white/50 p-4 cursor-pointer">
                  <summary className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    What payment methods do you accept?
                    <span className="ml-auto group-open:rotate-180 transition-transform">🔽</span>
                  </summary>
                  <p className="text-slate-700 mt-3">
                    We accept all major credit cards (Visa, Mastercard, American Express) and other payment methods through our payment processor. Contact support for alternative payment arrangements.
                  </p>
                </details>

                <details className="group rounded-lg border border-slate-200 bg-white/50 p-4 cursor-pointer">
                  <summary className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    How do I export my data?
                    <span className="ml-auto group-open:rotate-180 transition-transform">🔽</span>
                  </summary>
                  <p className="text-slate-700 mt-3">
                    You can export business data, clients, bookings, and other information from your dashboard. Contact support if you need help exporting specific data or if you need data after cancellation (available for 30 days).
                  </p>
                </details>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">Other Resources</h2>
              <div className="space-y-3">
                <a href="/help" className="flex items-center gap-3 p-4 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-200 hover:border-slate-300">
                  <span className="text-2xl">❓</span>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-slate-100">Help & FAQ</h3>
                    <p className="text-sm text-slate-600">Browse our comprehensive help guide</p>
                  </div>
                </a>
                <a href="/terms" className="flex items-center gap-3 p-4 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-200 hover:border-slate-300">
                  <span className="text-2xl">📋</span>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-slate-100">Terms of Service</h3>
                    <p className="text-sm text-slate-600">Read our full terms and conditions</p>
                  </div>
                </a>
                <a href="/privacy" className="flex items-center gap-3 p-4 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-200 hover:border-slate-300">
                  <span className="text-2xl">🔒</span>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-slate-100">Privacy Policy</h3>
                    <p className="text-sm text-slate-600">Learn how we protect your data</p>
                  </div>
                </a>
              </div>
            </section>
          </div> {/* End of prose div */}
          </div> {/* End of card div */}
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
