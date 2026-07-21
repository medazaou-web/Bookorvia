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
    <div className="space-y-8 sm:space-y-10">
      {/* Hero Header */}
      <div className="futuristic-header neon-outline rounded-3xl p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5">
          <div>
            <div className="inline-flex items-center gap-2 mb-3 rounded-full border border-cyan-300/60 dark:border-cyan-400/30 bg-cyan-50/70 dark:bg-cyan-500/10 px-3 py-1.5 text-[11px] uppercase tracking-[0.16em] font-bold text-cyan-700 dark:text-cyan-200">
              <SparkIcon className="h-3.5 w-3.5" />
              Public Presence
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">{t('dashboard.businessPageTitle')}</h1>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl">{t('dashboard.businessPageDescription')}</p>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm min-w-[200px]">
            <div className="rounded-xl border border-slate-300/70 dark:border-white/10 bg-white/75 dark:bg-slate-900/70 px-3 py-2">
              <p className="text-slate-500 dark:text-slate-400">Page Status</p>
              <p className="font-bold text-emerald-600 dark:text-emerald-300">Live</p>
            </div>
            <div className="rounded-xl border border-slate-300/70 dark:border-white/10 bg-white/75 dark:bg-slate-900/70 px-3 py-2">
              <p className="text-slate-500 dark:text-slate-400">Traffic Tool</p>
              <p className="font-bold text-cyan-700 dark:text-cyan-200">QR Ready</p>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="glass-panel neon-outline rounded-3xl p-12 text-center text-slate-600 dark:text-slate-300">
          {t('dashboard.loadingBusiness')}
        </div>
      ) : !business ? (
        <div className="glass-panel neon-outline rounded-3xl p-12 text-center">
          <div className="text-5xl mb-4">🏢</div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{t('dashboard.noBusinessProfile')}</h3>
          <p className="text-slate-600 dark:text-slate-300 mb-6">{t('dashboard.createBusinessFirst')}</p>
          <a href="/dashboard/settings" className="inline-block px-6 py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold hover:shadow-lg hover:-translate-y-1 transition-all">
            {t('dashboard.goToSettings')}
          </a>
        </div>
      ) : error ? (
        <div className="rounded-3xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-400/20 shadow-lg p-6 text-red-700 dark:text-red-200 font-medium flex items-center gap-3">
          <AlertIcon className="h-5 w-5 flex-shrink-0" />
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          {/* Public Link Section */}
          <div className="glass-panel neon-outline rounded-3xl p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2"><ExternalLinkIcon className="h-6 w-6 text-cyan-600 dark:text-cyan-300" /> {t('dashboard.publicLink')}</h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 mb-6">{t('dashboard.shareWithCustomers')}</p>
            
            <div className="mb-6 p-5 sm:p-6 rounded-2xl bg-slate-50/90 dark:bg-slate-950/70 border border-slate-200 dark:border-white/10">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-3">{t('dashboard.publicPageUrl')}</p>
              <div className="font-mono text-sm sm:text-base lg:text-lg text-slate-900 dark:text-slate-100 break-all mb-4">{publicLink}</div>
              <div className="flex gap-3 flex-wrap">
                <button
                  onClick={handleCopy}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold hover:shadow-lg active:scale-95 transition-all inline-flex items-center gap-2"
                >
                  {copied ? `✓ ${t('dashboard.linkCopied')}` : <><CopyIcon className="h-4 w-4" /> {t('dashboard.copyLink')}</>}
                </button>
                <a
                  href={business ? `/b/${business.slug}` : '/b/demo'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 rounded-xl bg-white dark:bg-white/10 border border-slate-300 dark:border-white/10 text-slate-700 dark:text-slate-200 font-bold hover:bg-slate-50 dark:hover:bg-white/15 transition-all inline-flex items-center gap-2"
                >
                  <EyeIcon className="h-4 w-4" /> {t('dashboard.viewPage')}
                </a>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white/75 dark:bg-slate-900/65 p-3">
                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1">Reach</p>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Use this link in bio, stories, and posts.</p>
              </div>
              <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white/75 dark:bg-slate-900/65 p-3">
                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1">Speed</p>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">One tap from ad to booking form.</p>
              </div>
            </div>
          </div>

          {/* QR Code Section */}
          <div className="glass-panel neon-outline rounded-3xl p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2"><QRIcon className="h-6 w-6 text-cyan-600 dark:text-cyan-300" /> {t('dashboard.qrCode')}</h2>

            <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
              {/* QR Code Display */}
              <div className="flex flex-col items-center">
                <div className="w-56 h-56 sm:w-64 sm:h-64 rounded-2xl bg-white dark:bg-slate-950/60 p-4 shadow-xl border border-slate-200 dark:border-white/10 flex items-center justify-center mb-6">
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
                    className="px-6 py-3 rounded-xl bg-emerald-600 text-white font-bold hover:shadow-lg active:scale-95 transition-all inline-flex items-center gap-2"
                  >
                    <DownloadIcon className="h-4 w-4" /> {t('dashboard.downloadQr')}
                  </button>
                )}
              </div>

              {/* QR Code Info */}
              <div>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2"><SparkIcon className="h-5 w-5 text-cyan-600 dark:text-cyan-300" /> {t('dashboard.qrWhatIsIt')}</h3>
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

          <div className="xl:col-span-2">
            <div className="futuristic-header neon-outline rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-cyan-700 dark:text-cyan-200 font-bold mb-1">Conversion Tip</p>
                <p className="text-sm sm:text-base text-slate-700 dark:text-slate-200">Place the QR near checkout, front desk, and social posts to increase repeat bookings.</p>
              </div>
              <a
                href={business ? `/b/${business.slug}` : '/b/demo'}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold hover:shadow-lg transition-all inline-flex items-center justify-center gap-2"
              >
                <ExternalLinkIcon className="h-4 w-4" />
                Open Live Page
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

