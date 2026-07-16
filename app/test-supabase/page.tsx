'use client';
import { useLanguage } from '@/lib/context/LanguageContext';
import { useTranslations } from '@/lib/i18n';

export default function TestSupabasePage() {
  const { language } = useLanguage();
  const t = useTranslations(language);
  
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || null;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || null;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-3xl rounded-xl bg-white p-6 shadow-sm border border-gray-100">
  <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{t('public.supabaseEnvironmentCheck')}</h1>
  <p className="mt-3 text-sm text-slate-700">{t('public.supabaseEnvironmentDescription')}</p>

        <div className="mt-6 space-y-3 text-sm">
          <div>
            <strong>NEXT_PUBLIC_SUPABASE_URL:</strong> {url ? <span className="text-emerald-700">{t('public.environmentLoaded')}</span> : <span className="text-red-600">{t('public.environmentMissing')}</span>}
          </div>
          <div>
            <strong>NEXT_PUBLIC_SUPABASE_ANON_KEY:</strong> {key ? <span className="text-emerald-700">{t('public.environmentLoaded')}</span> : <span className="text-red-600">{t('public.environmentMissing')}</span>}
          </div>
        </div>

        {url && key ? (
          <div className="mt-6 rounded-md bg-emerald-50 p-3 text-sm text-emerald-700">{t('public.publicSupabaseVariablesAvailable')}</div>
        ) : (
          <div className="mt-6 rounded-md bg-amber-50 p-3 text-sm text-amber-700">{t('public.publicSupabaseVariablesMissing')}</div>
        )}
      </div>
    </div>
  );
}
