"use client";
import { useEffect, useState } from "react";
import supabase from "../../../lib/supabase/browserClient";
import { useLanguage } from '../../../lib/context/LanguageContext';
import { useTranslations } from '../../../lib/i18n';
import QRCode from "qrcode";
import { AlertIcon, CopyIcon, ExternalLinkIcon, EyeIcon, DownloadIcon, SparkIcon, QRIcon } from "@/components/icons";

const DEFAULT_PUBLIC_THEME = "elegant_light";
const DEFAULT_BUTTON_TEXT_COLOR = "#ffffff";
const DEFAULT_BACKGROUND_STYLE = "orbs";

function normalizeColor(color: string | null | undefined, fallback: string): string {
  const value = (color || "").trim();
  if (!value) return fallback;
  const withHash = value.startsWith("#") ? value : `#${value}`;
  if (/^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/.test(withHash)) {
    if (withHash.length === 4) {
      const r = withHash[1];
      const g = withHash[2];
      const b = withHash[3];
      return `#${r}${r}${g}${g}${b}${b}`;
    }
    return withHash;
  }
  return fallback;
}

function withAlpha(hexColor: string, alpha: number): string {
  const safeAlpha = Math.max(0, Math.min(1, alpha));
  const hex = normalizeColor(hexColor, "#4f46e5").replace("#", "");
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${safeAlpha})`;
}

function getPreviewBackgroundStyle(style: string, isDarkMode: boolean, brandColor: string, accentColor: string) {
  const b = normalizeColor(brandColor, "#4f46e5");
  const a = normalizeColor(accentColor, "#06b6d4");

  if (style === "mesh") {
    return {
      backgroundColor: isDarkMode ? "#050811" : "#f7faff",
      backgroundImage: `
        linear-gradient(140deg, ${withAlpha(b, isDarkMode ? 0.2 : 0.14)} 0%, ${withAlpha(a, isDarkMode ? 0.18 : 0.13)} 100%),
        repeating-linear-gradient(0deg, ${withAlpha(b, isDarkMode ? 0.12 : 0.08)} 0 1px, transparent 1px 26px),
        repeating-linear-gradient(90deg, ${withAlpha(a, isDarkMode ? 0.12 : 0.08)} 0 1px, transparent 1px 26px)
      `,
    };
  }

  if (style === "stripes") {
    return {
      backgroundColor: isDarkMode ? "#070a13" : "#f9fbff",
      backgroundImage: `
        linear-gradient(114deg, transparent 0%, transparent 28%, ${withAlpha(b, isDarkMode ? 0.3 : 0.2)} 28%, transparent 44%),
        linear-gradient(74deg, transparent 0%, transparent 52%, ${withAlpha(a, isDarkMode ? 0.25 : 0.17)} 52%, transparent 70%),
        linear-gradient(180deg, ${isDarkMode ? "#060912" : "#fcfdff"}, ${isDarkMode ? "#12192a" : "#eef3ff"})
      `,
    };
  }

  if (style === "grid") {
    return {
      backgroundColor: isDarkMode ? "#040713" : "#f6f9ff",
      backgroundImage: `
        radial-gradient(360px 200px at 50% -10%, ${withAlpha(b, isDarkMode ? 0.33 : 0.22)} 0%, transparent 70%),
        repeating-linear-gradient(120deg, ${withAlpha(b, isDarkMode ? 0.18 : 0.12)} 0 1px, transparent 1px 30px),
        repeating-linear-gradient(60deg, ${withAlpha(a, isDarkMode ? 0.16 : 0.1)} 0 1px, transparent 1px 30px),
        linear-gradient(180deg, ${isDarkMode ? "#050912" : "#fbfdff"}, ${isDarkMode ? "#0d1424" : "#eef4ff"})
      `,
    };
  }

  if (style === "spotlight") {
    return {
      backgroundColor: isDarkMode ? "#070812" : "#f9faff",
      backgroundImage: `
        radial-gradient(280px 480px at 14% -8%, ${withAlpha(b, isDarkMode ? 0.38 : 0.22)} 0%, transparent 74%),
        radial-gradient(280px 500px at 86% -10%, ${withAlpha(a, isDarkMode ? 0.32 : 0.2)} 0%, transparent 76%),
        linear-gradient(180deg, ${isDarkMode ? "#060611" : "#fdfdff"}, ${isDarkMode ? "#14192c" : "#eef2ff"})
      `,
    };
  }

  if (style === "vortex") {
    return {
      backgroundColor: isDarkMode ? "#05070f" : "#f6f9ff",
      backgroundImage: `
        conic-gradient(from 210deg at 50% 44%, ${withAlpha(b, isDarkMode ? 0.34 : 0.22)}, ${withAlpha(a, isDarkMode ? 0.28 : 0.18)}, ${withAlpha(b, isDarkMode ? 0.2 : 0.14)}, transparent 76%),
        linear-gradient(180deg, ${isDarkMode ? "#04070f" : "#fbfdff"}, ${isDarkMode ? "#10172a" : "#edf3ff"})
      `,
    };
  }

  return {
    backgroundColor: isDarkMode ? "#060a12" : "#f1f6ff",
    backgroundImage: `
      radial-gradient(420px 260px at 10% 8%, ${withAlpha(b, isDarkMode ? 0.34 : 0.24)} 0%, transparent 62%),
      radial-gradient(400px 240px at 88% 10%, ${withAlpha(a, isDarkMode ? 0.3 : 0.22)} 0%, transparent 66%),
      linear-gradient(164deg, ${isDarkMode ? "#050911" : "#fbfdff"} 0%, ${isDarkMode ? "#0f1626" : "#eaf2ff"} 100%)
    `,
  };
}

function parseLegacyThemePayload(value: string | null | undefined) {
  const raw = (value || "").trim();
  if (!raw.includes("|")) {
    return { theme: raw || DEFAULT_PUBLIC_THEME, backgroundStyle: null as string | null, buttonTextColor: null as string | null };
  }

  const [themePart, ...parts] = raw.split("|");
  let backgroundStyle: string | null = null;
  let buttonTextColor: string | null = null;

  for (const part of parts) {
    if (part.startsWith("bg=")) {
      backgroundStyle = decodeURIComponent(part.slice(3));
    }
    if (part.startsWith("btc=")) {
      buttonTextColor = decodeURIComponent(part.slice(4));
    }
  }

  return {
    theme: themePart || DEFAULT_PUBLIC_THEME,
    backgroundStyle,
    buttonTextColor,
  };
}

function buildLegacyThemePayload(theme: string, backgroundStyle: string, buttonTextColor: string) {
  return `${theme}|bg=${encodeURIComponent(backgroundStyle)}|btc=${encodeURIComponent(buttonTextColor)}`;
}

function shouldUseLegacyStyleFallback(err: any): boolean {
  const combined = [err?.message, err?.details, err?.hint, err?.code].filter(Boolean).join(" ").toLowerCase();
  return (
    combined.includes("button_text_color") ||
    combined.includes("background_style") ||
    combined.includes("schema cache") ||
    combined.includes("pgrst204")
  );
}

export default function DashboardBusinessPage() {
  const { language } = useLanguage();
  const t = useTranslations(language);
  
  const [loading, setLoading] = useState(true);
  const [designSaving, setDesignSaving] = useState(false);
  const [business, setBusiness] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [designError, setDesignError] = useState<string | null>(null);
  const [designSuccess, setDesignSuccess] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [publicTheme, setPublicTheme] = useState(DEFAULT_PUBLIC_THEME);
  const [brandColor, setBrandColor] = useState("#4f46e5");
  const [accentColor, setAccentColor] = useState("#06b6d4");
  const [buttonTextColor, setButtonTextColor] = useState(DEFAULT_BUTTON_TEXT_COLOR);
  const [backgroundStyle, setBackgroundStyle] = useState(DEFAULT_BACKGROUND_STYLE);

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
          if (mounted) {
            setBusiness(data ?? null);
            const parsedTheme = parseLegacyThemePayload((data as any)?.public_theme ?? DEFAULT_PUBLIC_THEME);
            const normalizedTheme = parsedTheme.theme === "luxury_dark" ? "luxury_dark" : "elegant_light";
            setPublicTheme(normalizedTheme);
            setBrandColor((data as any)?.brand_color ?? "#4f46e5");
            setAccentColor((data as any)?.accent_color ?? "#06b6d4");
            setButtonTextColor((data as any)?.button_text_color ?? parsedTheme.buttonTextColor ?? (normalizedTheme === "luxury_dark" ? "#0f172a" : DEFAULT_BUTTON_TEXT_COLOR));
            setBackgroundStyle((data as any)?.background_style ?? parsedTheme.backgroundStyle ?? DEFAULT_BACKGROUND_STYLE);
          }
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
  const livePageHref = business ? `/b/${business.slug}` : '/b/demo';
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

  async function handleSaveDesign() {
    if (!business?.id) return;
    setDesignError(null);
    setDesignSuccess(null);
    setDesignSaving(true);

    try {
      const normalizedTheme = publicTheme === "luxury_dark" ? "luxury_dark" : "elegant_light";
      const payload = {
        public_theme: normalizedTheme,
        brand_color: brandColor,
        accent_color: accentColor,
        button_text_color: buttonTextColor,
        background_style: backgroundStyle,
      } as any;

      const legacyPayload = {
        public_theme: buildLegacyThemePayload(normalizedTheme, backgroundStyle, buttonTextColor),
        brand_color: brandColor,
        accent_color: accentColor,
      } as any;

      let { error: updateErr } = await supabase
        .from("businesses")
        .update(payload)
        .eq("id", business.id)
        .select("id")
        .single();

      if (updateErr && shouldUseLegacyStyleFallback(updateErr)) {
        const { error: fallbackErr } = await supabase
          .from("businesses")
          .update(legacyPayload)
          .eq("id", business.id)
          .select("id")
          .single();
        updateErr = fallbackErr || null;
      }

      if (updateErr) {
        throw updateErr;
      }

      const nextBusiness = {
        ...business,
        public_theme: normalizedTheme,
        brand_color: brandColor,
        accent_color: accentColor,
        button_text_color: buttonTextColor,
        background_style: backgroundStyle,
      };
      setBusiness(nextBusiness);
      setDesignSuccess("Public page design saved successfully.");
    } catch (e: any) {
      const detailParts = [e?.message, e?.details, e?.hint, e?.code].filter(Boolean);
      setDesignError(detailParts.join(" | ") || String(e));
    } finally {
      setDesignSaving(false);
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
        <div className="flex flex-col gap-6">
          <div className="order-1 flex flex-col gap-6">
            <div className="order-3 glass-panel neon-outline rounded-3xl p-6 sm:p-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2"><ExternalLinkIcon className="h-6 w-6 text-cyan-600 dark:text-cyan-300" /> {t('dashboard.publicLink')}</h2>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 mb-6">{t('dashboard.shareWithCustomers')}</p>

              <div className="mb-6 p-5 sm:p-6 rounded-2xl bg-slate-50/90 dark:bg-slate-950/70 border border-slate-200 dark:border-white/10">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-3">{t('dashboard.publicPageUrl')}</p>
                <div className="font-mono text-sm sm:text-base lg:text-lg text-slate-900 dark:text-slate-100 break-all">{publicLink}</div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white/75 dark:bg-slate-900/65 p-3">
                  <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1">Reach</p>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Social + bio + direct messages</p>
                </div>
                <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white/75 dark:bg-slate-900/65 p-3">
                  <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1">Speed</p>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">One tap from ad to booking</p>
                </div>
                <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white/75 dark:bg-slate-900/65 p-3">
                  <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1">Control</p>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Track, update, and share instantly</p>
                </div>
              </div>
            </div>

            <div className="order-4 glass-panel neon-outline rounded-3xl p-6 sm:p-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2"><QRIcon className="h-6 w-6 text-cyan-600 dark:text-cyan-300" /> {t('dashboard.qrCode')}</h2>

              <div className="grid md:grid-cols-[0.85fr_1.15fr] gap-6 lg:gap-8">
                <div className="flex flex-col items-center">
                  <div className="w-56 h-56 sm:w-64 sm:h-64 rounded-2xl bg-white dark:bg-slate-950/60 p-4 shadow-xl border border-slate-200 dark:border-white/10 flex items-center justify-center mb-4">
                    {qrLoading ? (
                      <div className="text-slate-500 dark:text-slate-400">{t('dashboard.generatingQrCode')}</div>
                    ) : qrDataUrl ? (
                      <img src={qrDataUrl} alt="QR code" className="max-w-full max-h-full" />
                    ) : (
                      <div className="text-slate-500 dark:text-slate-400">{t('dashboard.qrUnavailable')}</div>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 text-center">Scan test before printing batches.</p>
                </div>

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

            <div id="public-design" className="order-2 glass-panel neon-outline rounded-3xl p-6 sm:p-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2"><SparkIcon className="h-6 w-6 text-cyan-600 dark:text-cyan-300" /> Public Page Design</h2>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 mb-6">Manage the look of your public page here without leaving Business Page.</p>

              {designError && (
                <div className="rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-400/20 p-4 text-sm text-red-700 dark:text-red-200 font-medium mb-4">
                  {designError}
                </div>
              )}
              {designSuccess && (
                <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-400/20 p-4 text-sm text-emerald-700 dark:text-emerald-200 font-medium mb-4">
                  {designSuccess}
                </div>
              )}

              <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
                <div className="space-y-4 sm:space-y-6">
                  <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-slate-900 dark:text-white mb-2">Theme</label>
                      <div className="grid grid-cols-2 gap-2">
                        {[{ value: "luxury_dark", label: "Dark" }, { value: "elegant_light", label: "Light" }].map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => setPublicTheme(option.value)}
                            className={`rounded-xl border px-3 py-2 text-sm font-semibold transition-all ${publicTheme === option.value ? "border-cyan-500 bg-cyan-500/10 text-cyan-700 dark:text-cyan-200" : "border-slate-300 dark:border-white/10 text-slate-700 dark:text-slate-200"}`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-slate-900 dark:text-white mb-2">Background Style</label>
                      <select
                        value={backgroundStyle}
                        onChange={(e) => setBackgroundStyle(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-white/10 bg-white/80 dark:bg-slate-900/70 text-slate-900 dark:text-white"
                      >
                        <option value="orbs">Liquid Chrome</option>
                        <option value="mesh">Neural Lattice</option>
                        <option value="stripes">Prism Shards</option>
                        <option value="grid">Holographic Circuit</option>
                        <option value="spotlight">Velvet Stage</option>
                        <option value="vortex">Orbit Pulse</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-slate-900 dark:text-white mb-2">Brand Color</label>
                      <div className="flex items-center gap-2">
                        <input type="color" value={brandColor} onChange={(e) => setBrandColor(e.target.value)} className="w-12 h-10 rounded-lg border border-slate-300 dark:border-white/20" />
                        <input value={brandColor} onChange={(e) => setBrandColor(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-white/10 bg-white/80 dark:bg-slate-900/70 text-slate-900 dark:text-white font-mono" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-slate-900 dark:text-white mb-2">Accent Color</label>
                      <div className="flex items-center gap-2">
                        <input type="color" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} className="w-12 h-10 rounded-lg border border-slate-300 dark:border-white/20" />
                        <input value={accentColor} onChange={(e) => setAccentColor(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-white/10 bg-white/80 dark:bg-slate-900/70 text-slate-900 dark:text-white font-mono" />
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs sm:text-sm font-semibold text-slate-900 dark:text-white mb-2">Button Text Color</label>
                      <div className="flex items-center gap-2">
                        <input type="color" value={buttonTextColor} onChange={(e) => setButtonTextColor(e.target.value)} className="w-12 h-10 rounded-lg border border-slate-300 dark:border-white/20" />
                        <input value={buttonTextColor} onChange={(e) => setButtonTextColor(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-white/10 bg-white/80 dark:bg-slate-900/70 text-slate-900 dark:text-white font-mono" />
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleSaveDesign}
                    disabled={designSaving || !business?.id}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold hover:shadow-lg active:scale-95 disabled:opacity-60 transition-all"
                  >
                    {designSaving ? "Saving..." : "Save Public Page Design"}
                  </button>
                </div>

                <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-gradient-to-br from-slate-50/90 to-slate-100/70 dark:from-white/5 dark:to-white/10 p-4 sm:p-5">
                  <p className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2"><EyeIcon className="h-4 w-4" /> Live Preview: {publicTheme === "luxury_dark" ? "Dark" : "Light"}</p>
                  <div className="rounded-2xl overflow-hidden border" style={{ borderColor: publicTheme === "luxury_dark" ? "rgba(148,163,184,0.35)" : "rgba(148,163,184,0.3)" }}>
                    <div
                      className="h-[430px] overflow-y-auto p-3"
                      style={getPreviewBackgroundStyle(backgroundStyle, publicTheme === "luxury_dark", brandColor, accentColor)}
                    >
                      <div className="space-y-3">
                        <div className="rounded-xl p-3 border" style={{ background: publicTheme === "luxury_dark" ? "rgba(15,23,42,0.72)" : "rgba(255,255,255,0.86)", borderColor: publicTheme === "luxury_dark" ? "rgba(148,163,184,0.34)" : "rgba(148,163,184,0.28)" }}>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-xs font-bold" style={{ color: brandColor }}>
                              {(business?.name || "B").slice(0, 2).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-semibold truncate" style={{ color: publicTheme === "luxury_dark" ? "#f8fafc" : "#0f172a" }}>{business?.name || "Your Business"}</p>
                              <p className="text-[10px] truncate" style={{ color: publicTheme === "luxury_dark" ? "#cbd5e1" : "#475569" }}>{business?.category || "Category"}</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            className="mt-3 w-full px-3 py-2 rounded-lg text-[11px] font-bold"
                            style={{ background: `linear-gradient(135deg, ${brandColor || "#4f46e5"}, ${accentColor || "#06b6d4"})`, color: buttonTextColor || "#ffffff" }}
                          >
                            Book Now
                          </button>
                        </div>

                        <div className="rounded-xl p-3 border" style={{ background: publicTheme === "luxury_dark" ? "rgba(15,23,42,0.68)" : "rgba(255,255,255,0.84)", borderColor: publicTheme === "luxury_dark" ? "rgba(148,163,184,0.3)" : "rgba(148,163,184,0.24)" }}>
                          <p className="text-[11px] font-semibold mb-2" style={{ color: publicTheme === "luxury_dark" ? "#e2e8f0" : "#1e293b" }}>Services</p>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="rounded-lg px-2 py-2 text-[10px] border" style={{ borderColor: withAlpha(brandColor || "#4f46e5", 0.35), background: withAlpha(brandColor || "#4f46e5", 0.14), color: publicTheme === "luxury_dark" ? "#f8fafc" : "#0f172a" }}>Premium Cut</div>
                            <div className="rounded-lg px-2 py-2 text-[10px] border" style={{ borderColor: withAlpha(accentColor || "#06b6d4", 0.35), background: withAlpha(accentColor || "#06b6d4", 0.14), color: publicTheme === "luxury_dark" ? "#f8fafc" : "#0f172a" }}>Glow Care</div>
                          </div>
                        </div>

                        <div className="rounded-xl p-3 border" style={{ background: publicTheme === "luxury_dark" ? "rgba(15,23,42,0.68)" : "rgba(255,255,255,0.84)", borderColor: publicTheme === "luxury_dark" ? "rgba(148,163,184,0.3)" : "rgba(148,163,184,0.24)" }}>
                          <p className="text-[11px] font-semibold mb-2" style={{ color: publicTheme === "luxury_dark" ? "#e2e8f0" : "#1e293b" }}>Contact</p>
                          <div className="flex flex-wrap gap-2 text-[10px]">
                            <span className="rounded-full px-2 py-1" style={{ background: "rgba(34,197,94,0.24)", color: publicTheme === "luxury_dark" ? "#bbf7d0" : "#166534" }}>WhatsApp</span>
                            <span className="rounded-full px-2 py-1" style={{ background: "rgba(96,165,250,0.24)", color: publicTheme === "luxury_dark" ? "#bfdbfe" : "#1e3a8a" }}>Call</span>
                            <span className="rounded-full px-2 py-1" style={{ background: "rgba(244,114,182,0.24)", color: publicTheme === "luxury_dark" ? "#fbcfe8" : "#9d174d" }}>Instagram</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">Preview updates instantly as you tweak colors and background style.</p>
                </div>
              </div>
            </div>

            <div className="order-1 grid grid-cols-1 gap-6 xl:grid-cols-2">
              <div className="glass-panel neon-outline rounded-3xl p-6">
                <p className="text-xs uppercase tracking-[0.16em] text-cyan-700 dark:text-cyan-200 font-bold mb-3">Launch Actions</p>
                <div className="space-y-3">
                  <button
                    onClick={handleCopy}
                    className="w-full px-5 py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold hover:shadow-lg active:scale-95 transition-all inline-flex items-center justify-center gap-2"
                  >
                    {copied ? `✓ ${t('dashboard.linkCopied')}` : <><CopyIcon className="h-4 w-4" /> {t('dashboard.copyLink')}</>}
                  </button>
                  <a
                    href={livePageHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full px-5 py-3 rounded-xl bg-white dark:bg-white/10 border border-slate-300 dark:border-white/10 text-slate-700 dark:text-slate-200 font-bold hover:bg-slate-50 dark:hover:bg-white/15 transition-all inline-flex items-center justify-center gap-2"
                  >
                    <EyeIcon className="h-4 w-4" /> {t('dashboard.viewPage')}
                  </a>
                  <a
                    href="#public-design"
                    className="w-full px-5 py-3 rounded-xl bg-cyan-600 text-white font-bold hover:shadow-lg active:scale-95 transition-all inline-flex items-center justify-center gap-2"
                  >
                    <SparkIcon className="h-4 w-4" /> Public Page Design
                  </a>
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
                      className="w-full px-5 py-3 rounded-xl bg-emerald-600 text-white font-bold hover:shadow-lg active:scale-95 transition-all inline-flex items-center justify-center gap-2"
                    >
                      <DownloadIcon className="h-4 w-4" /> {t('dashboard.downloadQr')}
                    </button>
                  )}
                </div>
              </div>

              <div className="glass-panel neon-outline rounded-3xl p-6">
                <p className="text-xs uppercase tracking-[0.16em] text-cyan-700 dark:text-cyan-200 font-bold mb-3">Distribution Checklist</p>
                <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                  <li className="rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 px-3 py-2">• Add link to Instagram bio</li>
                  <li className="rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 px-3 py-2">• Print QR near front desk</li>
                  <li className="rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 px-3 py-2">• Attach QR to invoices</li>
                  <li className="rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 px-3 py-2">• Test booking flow weekly</li>
                </ul>
              </div>
            </div>

            <div className="order-5 futuristic-header neon-outline rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-cyan-700 dark:text-cyan-200 font-bold mb-1">Conversion Tip</p>
                <p className="text-sm sm:text-base text-slate-700 dark:text-slate-200">Place the QR near checkout, front desk, and social posts to increase repeat bookings.</p>
              </div>
              <a
                href={livePageHref}
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

