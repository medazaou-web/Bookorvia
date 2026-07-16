"use client";
import { useEffect, useState } from "react";
import supabase from "../../../lib/supabase/browserClient";
import { useLanguage } from '../../../lib/context/LanguageContext';
import { useTranslations } from '../../../lib/i18n';
import QRCode from "qrcode";
import { AlertIcon, CopyIcon, ExternalLinkIcon, EyeIcon, DownloadIcon, SparkIcon, QRIcon } from "@/components/icons";

export default function DashboardBusinessPage() {
  const { language } = useLanguage();
  const t = useTranslations(language);
  
  const [loading, setLoading] = useState(true);
  const [business, setBusiness] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const { data: userData } = await supabase.auth.getUser();
        const user = (userData as any)?.user ?? null;
        if (!user) {
          setError(t('auth.notAuthenticated'));
          setLoading(false);
          return;
        }

        const { data, error: fetchErr } = await supabase
          .from("businesses")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (fetchErr) {
          // if no business found, data will be null
          if ((fetchErr as any).code === "PGRST116") {
            if (mounted) setBusiness(null);
          } else {
            throw fetchErr;
          }
        } else {
          if (mounted) setBusiness(data ?? null);
        }
      } catch (e: any) {
        if (mounted) setError(e?.message || String(e));
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const appUrl = typeof window !== 'undefined' ? (process.env.NEXT_PUBLIC_APP_URL || window.location.origin) : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const publicLink = business ? `${appUrl}/b/${business.slug}` : "/b/demo";
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [qrLoading, setQrLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function gen() {
      if (!business) {
        setQrDataUrl(null);
        return;
      }
      const appUrl = typeof window !== 'undefined' ? (process.env.NEXT_PUBLIC_APP_URL || window.location.origin) : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const url = `${appUrl}/b/${business.slug}`;
      setQrLoading(true);
      try {
        const dataUrl = await QRCode.toDataURL(url, { margin: 2, width: 300 });
        if (mounted) setQrDataUrl(dataUrl);
      } catch (e: any) {
        if (mounted) setQrDataUrl(null);
      } finally {
        if (mounted) setQrLoading(false);
      }
    }
    gen();
    return () => { mounted = false; };
  }, [business]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(publicLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      // fallback: select and copy
      const ta = document.createElement("textarea");
      ta.value = publicLink;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-12">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">{t('dashboard.businessPageTitle')}</h1>
          <p className="text-lg text-slate-600 dark:text-slate-300">{t('dashboard.businessPageDescription')}</p>
        </div>
      </div>

      {loading ? (
        <div className="rounded-3xl bg-white/80 dark:bg-slate-900 backdrop-blur border border-white/60 dark:border-white/10 shadow-lg p-12 text-center text-slate-600 dark:text-slate-300">
          {t('dashboard.loadingBusiness')}
        </div>
      ) : !business ? (
        <div className="rounded-3xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-400/20 shadow-lg p-12 text-center">
          <div className="text-5xl mb-4">🏢</div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{t('dashboard.noBusinessProfile')}</h3>
          <p className="text-slate-600 dark:text-slate-300 mb-6">{t('dashboard.createBusinessFirst')}</p>
          <a href="/dashboard/settings" className="inline-block px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold hover:shadow-lg hover:-translate-y-1 transition-all">
            {t('dashboard.goToSettings')}
          </a>
        </div>
      ) : error ? (
        <div className="rounded-3xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-400/20 shadow-lg p-6 text-red-700 dark:text-red-200 font-medium flex items-center gap-3">
          <AlertIcon className="h-5 w-5 flex-shrink-0" />
          {error}
        </div>
      ) : (
        <div className="space-y-8">
          {/* Public Link Section */}
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-lg p-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2"><ExternalLinkIcon className="h-6 w-6" /> {t('dashboard.publicLink')}</h2>
            
            <div className="mb-6 p-6 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-white/10">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-3">{t('dashboard.publicPageUrl')}</p>
              <div className="font-mono text-lg text-slate-900 dark:text-slate-100 break-all mb-4">{publicLink}</div>
              <div className="flex gap-3 flex-wrap">
                <button
                  onClick={handleCopy}
                  className="px-6 py-2 rounded-xl bg-indigo-600 text-white font-bold hover:shadow-lg active:scale-95 transition-all"
                >
                  {copied ? `✓ ${t('dashboard.linkCopied')}` : <><CopyIcon className="h-4 w-4" /> {t('dashboard.copyLink')}</>}
                </button>
                <a
                  href={business ? `/b/${business.slug}` : '/b/demo'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-2 rounded-xl bg-white dark:bg-white/10 border border-slate-300 dark:border-white/10 text-slate-700 dark:text-slate-200 font-bold hover:bg-slate-50 dark:hover:bg-white/15 transition-all"
                >
                  <EyeIcon className="h-4 w-4" /> {t('dashboard.viewPage')}
                </a>
              </div>
            </div>

            <p className="text-slate-600 dark:text-slate-400">
              {t('dashboard.shareWithCustomers')}
            </p>
          </div>

          {/* QR Code Section */}
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-lg p-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2"><QRIcon className="h-6 w-6" /> {t('dashboard.qrCode')}</h2>

            <div className="grid md:grid-cols-2 gap-8">
              {/* QR Code Display */}
              <div className="flex flex-col items-center">
                <div className="w-64 h-64 rounded-2xl bg-white dark:bg-slate-950/60 p-4 shadow-xl border border-slate-200 dark:border-white/10 flex items-center justify-center mb-6">
                  {qrLoading ? (
                    <div className="text-slate-500 dark:text-slate-400">{t('dashboard.generatingQrCode')}</div>
                  ) : qrDataUrl ? (
                    <img src={qrDataUrl} alt="QR code" className="max-w-full max-h-full" />
                  ) : (
                    <div className="text-slate-500 dark:text-slate-400">{t('dashboard.qrUnavailable')}</div>
                  )}
                </div>
                
                {qrDataUrl && (
                  <button
                    onClick={() => {
                      const a = document.createElement('a');
                      a.href = qrDataUrl;
                      a.download = `${business?.slug || 'business'}-qr.png`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                    }}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-bold hover:shadow-lg active:scale-95 transition-all"
                  >
                    <DownloadIcon className="h-4 w-4" /> {t('dashboard.downloadQr')}
                  </button>
                )}
              </div>

              {/* QR Code Info */}
              <div>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2"><SparkIcon className="h-5 w-5" /> {t('dashboard.qrWhatIsIt')}</h3>
                    <p className="text-slate-600 dark:text-slate-400">
                      {t('dashboard.qrDescription')}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{t('dashboard.qrHowToUse')}</h3>
                    <ul className="text-slate-600 dark:text-slate-400 space-y-2 list-disc list-inside">
                      <li>{t('dashboard.qrUsageBusinessCards')}</li>
                      <li>{t('dashboard.qrUsageStorefront')}</li>
                      <li>{t('dashboard.qrUsageInvoices')}</li>
                      <li>{t('dashboard.qrUsageNfc')}</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{t('dashboard.qrTips')}</h3>
                    <ul className="text-slate-600 dark:text-slate-400 space-y-2 list-disc list-inside">
                      <li>{t('dashboard.qrTipSize')}</li>
                      <li>{t('dashboard.qrTipContrast')}</li>
                      <li>{t('dashboard.qrTipTest')}</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

