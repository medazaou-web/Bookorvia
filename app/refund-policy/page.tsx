"use client";
import PublicHeader from "../../components/public/PublicHeader";
import PublicFooter from "../../components/public/PublicFooter";
import { useLanguage } from '@/lib/context/LanguageContext';
import { useTranslations } from '@/lib/i18n';

export default function RefundPolicyPage() {
  const { language } = useLanguage();
  const t = useTranslations(language);
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex flex-col">
      <PublicHeader />
      
      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="rounded-3xl bg-white/80 backdrop-blur border border-white/60 shadow-xl p-8 sm:p-12">
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-slate-100 mb-4">{t('public.refundPolicy')}</h1>
            <p className="text-slate-600 mb-8">{t('legal.refund.lastUpdated')}</p>

            <div className="prose prose-slate max-w-none space-y-8">
              <section>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">{t('legal.refund.section1Title')}</h2>
              <p className="text-slate-700 leading-relaxed">
                {t('legal.refund.section1Content')}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">{t('legal.refund.section2Title')}</h2>
              <p className="text-slate-700 leading-relaxed">
                {t('legal.refund.section2Content')}
              </p>
              <ul className="list-disc list-inside text-slate-700 space-y-2 mt-4">
                <li>{t('legal.refund.section2Item1')}</li>
                <li>{t('legal.refund.section2Item2')}</li>
                <li>{t('legal.refund.section2Item3')}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">{t('legal.refund.section3Title')}</h2>
              <p className="text-slate-700 leading-relaxed">
                {t('legal.refund.section3Content')}
              </p>
              <ul className="list-disc list-inside text-slate-700 space-y-2 mt-4">
                <li>{t('legal.refund.section3Item1')}</li>
                <li>{t('legal.refund.section3Item2')}</li>
                <li>{t('legal.refund.section3Item3')}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">{t('legal.refund.section4Title')}</h2>
              <p className="text-slate-700 leading-relaxed">
                {t('legal.refund.section4Content')}
              </p>
              <ul className="list-disc list-inside text-slate-700 space-y-2 mt-4">
                <li>{t('legal.refund.section4Item1')}</li>
                <li>{t('legal.refund.section4Item2')}</li>
                <li>{t('legal.refund.section4Item3')}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">{t('legal.refund.section5Title')}</h2>
              <p className="text-slate-700 leading-relaxed">
                {t('legal.refund.section5Content')}
              </p>
              <ol className="list-decimal list-inside text-slate-700 space-y-2 mt-4">
                <li>{t('legal.refund.section5Item1')}</li>
                <li>{t('legal.refund.section5Item2')}</li>
                <li>{t('legal.refund.section5Item3')}</li>
                <li>{t('legal.refund.section5Item4')}</li>
              </ol>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">{t('legal.refund.section6Title')}</h2>
              <p className="text-slate-700 leading-relaxed">
                {t('legal.refund.section6Content')}
              </p>
              <ul className="list-disc list-inside text-slate-700 space-y-2 mt-4">
                <li>{t('legal.refund.section6Item1')}</li>
                <li>{t('legal.refund.section6Item2')}</li>
                <li>{t('legal.refund.section6Item3')}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">{t('legal.refund.section7Title')}</h2>
              <p className="text-slate-700 leading-relaxed">
                {t('legal.refund.section7Content')}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">{t('legal.refund.section8Title')}</h2>
              <p className="text-slate-700 leading-relaxed">
                {t('legal.refund.section8Content')}
              </p>
              <ul className="list-disc list-inside text-slate-700 space-y-2 mt-4">
                <li>{t('legal.refund.section8Item1')}</li>
                <li>{t('legal.refund.section8Item2')}</li>
                <li>{t('legal.refund.section8Item3')}</li>
              </ul>
            </section>

            <div className="mt-12 p-6 rounded-xl bg-amber-50 border border-amber-200">
              <p className="text-sm text-amber-900">
                {t('legal.refund.legalNote')}
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
