"use client";
import PublicHeader from "../../components/public/PublicHeader";
import PublicFooter from "../../components/public/PublicFooter";
import { useLanguage } from '@/lib/context/LanguageContext';
import { useTranslations } from '@/lib/i18n';

export default function TermsPage() {
  const { language } = useLanguage();
  const t = useTranslations(language);
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex flex-col">
      <PublicHeader />
      
      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="rounded-3xl bg-white/80 backdrop-blur border border-white/60 shadow-xl p-8 sm:p-12">
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-slate-100 mb-4">{t('legal.terms.title')}</h1>
            <p className="text-slate-600 mb-8">{t('legal.terms.lastUpdated')}</p>

            <div className="prose prose-slate max-w-none space-y-8">
              <section>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">{t('legal.terms.section1Title')}</h2>
              <p className="text-slate-700 leading-relaxed">{t('legal.terms.section1Content')}</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">{t('legal.terms.section2Title')}</h2>
              <p className="text-slate-700 leading-relaxed">{t('legal.terms.section2Content')}</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">{t('legal.terms.section3Title')}</h2>
              <p className="text-slate-700 leading-relaxed">{t('legal.terms.section3Content')}</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">{t('legal.terms.section4Title')}</h2>
              <p className="text-slate-700 leading-relaxed">{t('legal.terms.section4Content')}</p>
              <ul className="list-disc list-inside text-slate-700 space-y-2 mt-4">
                <li>{t('legal.terms.section4Item1')}</li>
                <li>{t('legal.terms.section4Item2')}</li>
                <li>{t('legal.terms.section4Item3')}</li>
                <li>{t('legal.terms.section4Item4')}</li>
                <li>{t('legal.terms.section4Item5')}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">{t('legal.terms.section5Title')}</h2>
              <p className="text-slate-700 leading-relaxed">{t('legal.terms.section5Content')}</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">{t('legal.terms.section6Title')}</h2>
              <p className="text-slate-700 leading-relaxed">{t('legal.terms.section6Content')}</p>
            </section>

            <div className="mt-12 p-6 rounded-xl bg-amber-50 border border-amber-200">
              <p className="text-sm text-amber-900">{t('legal.terms.legalNote')}</p>
            </div>
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
