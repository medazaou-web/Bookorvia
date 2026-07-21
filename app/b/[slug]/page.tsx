import { createServerSupabase } from "../../../lib/supabase/serverClient";
import { cookies } from "next/headers";
import BookingSection from "./BookingSection";
import ReviewBooster from "./ReviewBooster";
import LoyaltyLookup from "./LoyaltyLookup";
import { MapPinIcon } from "@/components/icons";
import { getTranslation } from "@/lib/i18n";
import { locales, type Locale } from "@/lib/i18n/config";

type Props = { params: any };

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

// Main theme configuration
const themeConfig = {
  luxury_dark: {
    bg: "bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950",
    text: "text-white",
    card: "bg-slate-800/40 border-slate-700/50",
    button: "bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold",
    accent: "text-amber-400",
    header: "bg-slate-950/80 border-slate-700/50",
    secondaryBtn: "border-amber-500 text-amber-400 hover:bg-amber-500/10",
    navPill: "bg-slate-800/70 border-slate-700/60 text-slate-200 hover:bg-slate-700/70",
    surface: "bg-slate-900/40 border-slate-700/60",
    subtext: "text-slate-300",
    kicker: "text-amber-300"
  },
  elegant_light: {
    bg: "bg-gradient-to-br from-white via-slate-50 to-slate-100",
    text: "text-slate-900",
    card: "bg-white/60 border-slate-200",
    button: "font-bold text-white",
    accent: "text-indigo-600",
    header: "bg-white/80 border-slate-200",
    secondaryBtn: "border-slate-300 text-slate-900 hover:bg-slate-50",
    navPill: "bg-white border-slate-300 text-slate-700 hover:bg-slate-50",
    surface: "bg-white/80 border-slate-200",
    subtext: "text-slate-600",
    kicker: "text-indigo-700"
  },
  modern_gradient: {
    bg: "bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20",
    text: "text-slate-900",
    card: "bg-white/70 backdrop-blur border-white/60 shadow-lg",
    button: "font-bold text-white",
    accent: "text-indigo-600",
    header: "bg-white/80 backdrop-blur border-white/60",
    secondaryBtn: "border-indigo-300 text-indigo-600 hover:bg-indigo-50",
    navPill: "bg-white/80 backdrop-blur border-white/70 text-slate-700 hover:bg-white",
    surface: "bg-white/75 backdrop-blur border-white/70 shadow-lg",
    subtext: "text-slate-600",
    kicker: "text-indigo-700"
  }
};

// Theme-aware inner component styling
const publicThemeStyles = {
  luxury_dark: {
    sectionCard: "bg-slate-800/40 border-slate-700/50",
    innerCard: "bg-white/5 border-white/10",
    input: "bg-white/10 border-white/10 text-white placeholder:text-slate-400 focus:ring-amber-400/40 focus:border-amber-400/50",
    label: "text-white",
    mutedText: "text-slate-300",
    buttonPrimary: "bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold",
    buttonSecondary: "border-amber-500/30 text-amber-400 hover:bg-amber-500/10",
    timeSlot: "bg-white/10 border-white/20 text-white hover:bg-white/20",
    timeSlotSelected: "bg-amber-500 border-amber-500 text-slate-950 font-bold",
    emptyState: "bg-white/5 border-white/10 text-slate-300",
    success: "bg-emerald-950/40 border-emerald-900/50 text-emerald-200",
    error: "bg-red-950/40 border-red-900/50 text-red-200",
    progressBar: "bg-amber-500"
  },
  elegant_light: {
    sectionCard: "bg-white/60 border-slate-200",
    innerCard: "bg-white border-slate-200",
    input: "bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:ring-indigo-500 focus:border-indigo-500",
    label: "text-slate-900",
    mutedText: "text-slate-600",
    buttonPrimary: "bg-indigo-600 hover:bg-indigo-700 text-white font-bold",
    buttonSecondary: "border-slate-300 text-slate-900 hover:bg-slate-50",
    timeSlot: "bg-white border-slate-300 text-slate-900 hover:bg-slate-50",
    timeSlotSelected: "bg-indigo-600 border-indigo-600 text-white font-bold",
    emptyState: "bg-slate-50 border-slate-200 text-slate-600",
    success: "bg-emerald-50 border-emerald-200 text-emerald-800",
    error: "bg-red-50 border-red-200 text-red-800",
    progressBar: "bg-indigo-600"
  },
  modern_gradient: {
    sectionCard: "bg-white/70 backdrop-blur border-white/60 shadow-lg",
    innerCard: "bg-white/80 backdrop-blur border-white/60",
    input: "bg-white/90 border-white/70 text-slate-900 placeholder:text-slate-400 focus:ring-indigo-500 focus:border-indigo-500",
    label: "text-slate-900",
    mutedText: "text-slate-600",
    buttonPrimary: "bg-indigo-600 hover:bg-indigo-700 text-white font-bold",
    buttonSecondary: "border-indigo-300 text-indigo-600 hover:bg-indigo-50",
    timeSlot: "bg-white/80 border-white/70 text-slate-900 hover:bg-white",
    timeSlotSelected: "bg-indigo-600 border-indigo-600 text-white font-bold",
    emptyState: "bg-white/60 border-white/70 text-slate-600",
    success: "bg-emerald-50/80 border-emerald-200 text-emerald-800",
    error: "bg-red-50/80 border-red-200 text-red-800",
    progressBar: "bg-indigo-600"
  }
};

export default async function BusinessPage({ params }: Props) {
  const resolvedParams = (await params) as { slug?: string };
  const slug = resolvedParams?.slug ?? "";
  const supabase = createServerSupabase(await cookies());

  try {
    const { data, error } = await supabase
      .from("businesses")
      .select("*")
      .eq("slug", slug)
      .limit(1)
      .single();

    if (error || !data) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-white via-indigo-50/40 to-violet-50 text-slate-900">
          <header className="border-b bg-white/80 backdrop-blur px-6 py-4 sticky top-0 z-50">
            <div className="mx-auto max-w-7xl flex items-center justify-between">
              <div className="text-xl font-bold text-indigo-600">Bookorvia</div>
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Public Booking</div>
            </div>
          </header>
          <main className="mx-auto max-w-7xl px-4 sm:px-6 py-24 text-center">
            <h1 className="text-4xl font-bold mb-4">Business Not Found</h1>
            <p className="text-slate-600 mb-8">We couldn't find a business with the slug "{slug}".</p>
            <a href="/" className="inline-flex items-center rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors">Back to Home</a>
          </main>
        </div>
      );
    }

    const biz: any = data;
    const locale: Locale = locales.includes(biz.language) ? biz.language : 'en';
    const t = (key: string) => getTranslation(locale, key);
    const theme = themeConfig[biz.public_theme as keyof typeof themeConfig] || themeConfig.modern_gradient;
    const brandColor = normalizeColor(biz.brand_color, "#4f46e5");
    const accentColor = normalizeColor(biz.accent_color, "#06b6d4");
    const brandGradient = `linear-gradient(135deg, ${brandColor}, ${accentColor})`;

    // Load active services IN PARALLEL
    const [servicesResult, reviewsResult] = await Promise.all([
      supabase
        .from("services")
        .select("id, name, description, price, currency, duration_minutes, is_active, background_image_url")
        .eq("business_id", biz.id)
        .eq("is_active", true)
        .order("created_at", { ascending: false }),
      supabase
        .from("reviews")
        .select("id, client_name, rating, comment, created_at")
        .eq("business_id", biz.id)
        .order("created_at", { ascending: false })
        .limit(10)
    ]);

    const services = servicesResult.data ?? [];
    const reviews = reviewsResult.data ?? [];
    const logo = biz.logo_url;
    const coverImage = biz.cover_image_url;
    const initials = biz.name ? biz.name.split(" ").map((s: string) => s[0]).slice(0,2).join("") : "B";
    const websiteHref = biz.website_url
      ? (/^https?:\/\//i.test(biz.website_url) ? biz.website_url : `https://${biz.website_url}`)
      : null;
    const websiteDisplay = (() => {
      if (!websiteHref) return "";
      try {
        return new URL(websiteHref).hostname;
      } catch {
        return biz.website_url;
      }
    })();

    return (
      <div className={`min-h-screen ${theme.bg} transition-colors duration-300`}>
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-48 -right-40 w-96 h-96 rounded-full blur-3xl" style={{ backgroundColor: withAlpha(brandColor, 0.13) }}></div>
          <div className="absolute bottom-0 -left-52 w-[28rem] h-[28rem] rounded-full blur-3xl" style={{ backgroundColor: withAlpha(accentColor, 0.13) }}></div>
        </div>

        <header className={`sticky top-0 z-50 ${theme.header} backdrop-blur border-b transition-colors px-4 sm:px-6 py-4 shadow-sm`}>
          <div className="mx-auto max-w-7xl flex items-center justify-between gap-4">
            <div className="min-w-0">
              <div className={`text-xl sm:text-2xl font-bold truncate ${theme.text}`}>{biz.name}</div>
              {biz.category && <p className={`text-xs sm:text-sm ${theme.kicker}`}>{biz.category}</p>}
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <a
                href="#book"
                className="px-4 sm:px-5 py-2 rounded-xl text-sm font-bold text-white shadow-md hover:shadow-lg transition-all"
                style={{ background: brandGradient }}
              >
                Book
              </a>
            </div>
          </div>
        </header>

        <main className={`mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-12 relative z-10 ${theme.text}`}>
          <div className={`rounded-[2rem] ${theme.card} backdrop-blur border shadow-2xl overflow-hidden mb-8 sm:mb-10`} style={{ boxShadow: `0 24px 60px ${withAlpha(brandColor, 0.13)}` }}>
            <div
              className="h-60 sm:h-72 md:h-80 bg-cover bg-center relative"
              style={{
                backgroundImage: coverImage ? `url('${coverImage}')` : undefined,
                backgroundColor: !coverImage ? brandColor : undefined,
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/20 to-black/55"></div>
            </div>

            <div className="px-5 sm:px-8 pb-8 -mt-16 sm:-mt-20 relative z-10">
              <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-5 items-end">
                <div
                  className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl shadow-2xl overflow-hidden border-4 flex items-center justify-center text-4xl sm:text-5xl font-bold"
                  style={{
                    backgroundColor: logo ? '#ffffff' : brandColor,
                    borderColor: accentColor,
                    color: biz.public_theme === 'luxury_dark' ? 'white' : '#0f172a',
                  }}
                >
                  {logo ? (
                    <img src={logo} alt={`${biz.name} logo`} className="w-full h-full object-contain p-2" />
                  ) : (
                    initials
                  )}
                </div>

                <div>
                  <h1 className="text-3xl sm:text-5xl font-bold mb-2">{biz.name}</h1>
                  {biz.description && <p className={`text-sm sm:text-base leading-relaxed max-w-2xl ${theme.subtext}`}>{biz.description}</p>}
                  {biz.address && (
                    <p className={`mt-3 text-sm sm:text-base flex items-center gap-2 ${theme.subtext}`}>
                      <MapPinIcon className="h-5 w-5 flex-shrink-0" /> {biz.address}
                    </p>
                  )}
                </div>

              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href="#book"
                  className="inline-flex items-center justify-center rounded-xl px-5 sm:px-7 py-3 text-sm sm:text-base font-bold text-white shadow-lg hover:shadow-xl hover:-translate-y-1 active:scale-95 transition-all"
                  style={{ background: brandGradient }}
                >
                  {t('booking.bookNow')}
                </a>
                {biz.whatsapp && (
                  <a
                    href={`https://wa.me/${biz.whatsapp.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center rounded-xl px-5 sm:px-7 py-3 text-sm sm:text-base font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg hover:shadow-xl hover:-translate-y-1 active:scale-95 transition-all"
                  >
                    {t('dashboard.whatsappLabel')}
                  </a>
                )}
                {biz.phone && (
                  <a
                    href={`tel:${biz.phone.replace(/[^0-9+]/g, '')}`}
                    className="inline-flex items-center justify-center rounded-xl px-5 sm:px-7 py-3 text-sm sm:text-base font-bold border-2 shadow-lg hover:shadow-xl hover:-translate-y-1 active:scale-95 transition-all"
                    style={{ borderColor: accentColor, color: accentColor }}
                  >
                    {t('public.bookingSourceCall')}
                  </a>
                )}
                <a
                  href="#reviews"
                  className="inline-flex items-center justify-center rounded-xl px-5 sm:px-7 py-3 text-sm sm:text-base font-bold border-2 shadow-lg hover:shadow-xl hover:-translate-y-1 active:scale-95 transition-all"
                  style={{ borderColor: accentColor, color: accentColor }}
                >
                  {t('business.reviews')}
                </a>
              </div>
            </div>
          </div>

          <nav className="sticky top-[74px] z-40 mb-8 sm:mb-10">
            <div className={`rounded-2xl border p-2 backdrop-blur-xl ${theme.surface}`} style={{ borderColor: withAlpha(brandColor, 0.4), background: `linear-gradient(90deg, ${withAlpha(brandColor, 0.08)}, ${withAlpha(accentColor, 0.08)})` }}>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <a href="#services" className={`rounded-xl border px-3 py-2 text-center text-xs sm:text-sm font-semibold transition-colors ${theme.navPill}`} style={{ borderColor: withAlpha(brandColor, 0.26) }}>{t('business.services')}</a>
                <a href="#book" className={`rounded-xl border px-3 py-2 text-center text-xs sm:text-sm font-semibold transition-colors ${theme.navPill}`} style={{ borderColor: withAlpha(brandColor, 0.26) }}>{t('booking.bookNow')}</a>
                <a href="#reviews" className={`rounded-xl border px-3 py-2 text-center text-xs sm:text-sm font-semibold transition-colors ${theme.navPill}`} style={{ borderColor: withAlpha(accentColor, 0.26) }}>{t('business.reviews')}</a>
                <a href="#contact" className={`rounded-xl border px-3 py-2 text-center text-xs sm:text-sm font-semibold transition-colors ${theme.navPill}`} style={{ borderColor: withAlpha(accentColor, 0.26) }}>{t('public.contact')}</a>
              </div>
            </div>
          </nav>

          {services && services.length > 0 && (
            <section id="services" className="mb-10 sm:mb-14 scroll-mt-36">
              <div className="mb-6 sm:mb-8">
                <h2 className="text-3xl sm:text-4xl font-bold">{t('business.services')}</h2>
                <p className={`${theme.subtext} mt-2`}>{t('business.servicesDescription')}</p>
              </div>
              <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
                {services.map((s: any) => (
                  <div key={s.id} className={`relative rounded-[1.75rem] overflow-hidden border shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all group min-h-80 ${theme.surface}`} style={{ borderColor: s.background_image_url ? undefined : withAlpha(accentColor, 0.26), boxShadow: `0 16px 40px ${withAlpha(accentColor, 0.07)}` }}>
                    {s.background_image_url ? (
                      <>
                        <div className="absolute inset-0">
                          <img src={s.background_image_url} alt={s.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/55 to-black/80"></div>
                      </>
                    ) : null}

                    <div className="relative p-5 sm:p-6 h-full flex flex-col justify-between">
                      <div>
                        <h3 className={`text-xl font-bold ${s.background_image_url ? 'text-white' : theme.text}`} style={s.background_image_url ? { textShadow: '0 2px 8px rgba(0,0,0,0.5)' } : {}}>{s.name}</h3>
                        {s.description && (
                          <p className={`text-sm mt-2 ${s.background_image_url ? 'text-white/90' : theme.subtext}`} style={s.background_image_url ? { textShadow: '0 1px 4px rgba(0,0,0,0.5)' } : {}}>{s.description}</p>
                        )}
                      </div>

                      <div className="mt-5 pt-5 border-t" style={{ borderColor: s.background_image_url ? 'rgba(255,255,255,0.28)' : 'rgba(148,163,184,0.32)' }}>
                        <div className="flex items-end justify-between gap-3">
                          <div>
                            <p className={`text-xs uppercase tracking-wide ${s.background_image_url ? 'text-white/75' : 'opacity-60'}`}>{t('business.price')}</p>
                            <p className={`text-2xl font-bold ${s.background_image_url ? 'text-white' : theme.text}`}>{s.price ?? '-'}</p>
                            <p className={`text-xs ${s.background_image_url ? 'text-white/75' : 'opacity-60'}`}>{s.currency || 'MAD'}</p>
                          </div>
                          <div className="text-right">
                            <p className={`text-xs uppercase tracking-wide ${s.background_image_url ? 'text-white/75' : 'opacity-60'}`}>{t('business.duration')}</p>
                            <p className={`text-2xl font-bold ${s.background_image_url ? 'text-white' : theme.text}`}>{s.duration_minutes ?? '-'}</p>
                            <p className={`text-xs ${s.background_image_url ? 'text-white/75' : 'opacity-60'}`}>{t('business.min')}</p>
                          </div>
                        </div>
                      </div>

                      <a href="#book" className="mt-5 block w-full text-center rounded-xl py-3 text-sm font-bold shadow-md hover:shadow-lg transition-all active:scale-95 text-white" style={{ background: brandGradient }}>
                        {t('business.bookThisService')}
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section id="book" className="mb-10 sm:mb-14 scroll-mt-36">
            <div className={`rounded-3xl ${theme.card} backdrop-blur border shadow-xl p-5 sm:p-7`} style={{ borderColor: withAlpha(brandColor, 0.33), boxShadow: `0 18px 48px ${withAlpha(brandColor, 0.11)}` }}>
              <div className="mb-6 flex flex-col gap-4 rounded-[1.6rem] border p-5 sm:p-6" style={{ borderColor: withAlpha(brandColor, 0.53), background: `linear-gradient(145deg, ${withAlpha(brandColor, 0.13)}, ${withAlpha(accentColor, 0.1)})` }}>
                <div>
                  <h2 className="text-3xl sm:text-4xl font-bold" style={{ color: brandColor }}>{t('booking.requestBooking')}</h2>
                  <p className={`${theme.subtext} mt-2`}>{t('booking.selectServiceTime')}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${theme.navPill}`} style={{ borderColor: withAlpha(brandColor, 0.4), background: withAlpha(brandColor, 0.13) }}>{t('booking.selectServices')}</span>
                  <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${theme.navPill}`} style={{ borderColor: withAlpha(accentColor, 0.4), background: withAlpha(accentColor, 0.13) }}>{t('booking.preferredDate')}</span>
                  <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${theme.navPill}`} style={{ borderColor: withAlpha(brandColor, 0.4), background: withAlpha(brandColor, 0.13) }}>{t('booking.availableTimes')}</span>
                </div>
              </div>
              <BookingSection
                businessId={biz.id}
                services={services}
                businessSlug={biz.slug}
                themeStyles={publicThemeStyles[biz.public_theme as keyof typeof publicThemeStyles]}
                language={biz.language || 'en'}
                brandColor={brandColor}
                accentColor={accentColor}
              />
            </div>
          </section>

          <section id="reviews" className="mb-10 sm:mb-14 scroll-mt-36">
            <div className="mb-6 sm:mb-8">
              <h2 className="text-3xl sm:text-4xl font-bold">{t('business.reviews')}</h2>
            </div>
            <div className={`rounded-3xl ${theme.card} backdrop-blur border shadow-lg p-6 sm:p-8`} style={{ borderColor: withAlpha(accentColor, 0.33), boxShadow: `0 18px 48px ${withAlpha(accentColor, 0.1)}` }}>
              <ReviewBooster businessId={biz.id} googleReviewUrl={biz.google_review_url} preloadedReviews={reviews} themeStyles={publicThemeStyles[biz.public_theme as keyof typeof publicThemeStyles]} />
            </div>
          </section>

          <section className="mb-10 sm:mb-14">
            <div className={`rounded-3xl ${theme.card} backdrop-blur border shadow-lg p-6 sm:p-8`} style={{ borderColor: withAlpha(brandColor, 0.33), boxShadow: `0 18px 48px ${withAlpha(brandColor, 0.09)}` }}>
              <LoyaltyLookup businessId={biz.id} themeStyles={publicThemeStyles[biz.public_theme as keyof typeof publicThemeStyles]} />
            </div>
          </section>

          <section id="contact" className="mb-10 sm:mb-14 scroll-mt-36">
            <div className="mb-6 sm:mb-8">
              <h2 className="text-3xl sm:text-4xl font-bold">{t('public.contact')}</h2>
            </div>
            <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
              {biz.phone && (
                <a href={`tel:${biz.phone.replace(/[^0-9+]/g, '')}`} className={`rounded-[1.8rem] border shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all p-6 text-center`} style={{ borderColor: '#60a5fa88', background: 'linear-gradient(160deg, rgba(96,165,250,0.22), rgba(59,130,246,0.08))' }}>
                  <div className="text-2xl font-bold mb-3 text-blue-500">{t('public.bookingSourceCall')}</div>
                  <p className={`font-bold ${theme.accent}`}>{biz.phone}</p>
                </a>
              )}
              {biz.whatsapp && (
                <a href={`https://wa.me/${biz.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className={`rounded-[1.8rem] border shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all p-6 text-center`} style={{ borderColor: '#22c55e88', background: 'linear-gradient(160deg, rgba(34,197,94,0.2), rgba(21,128,61,0.08))' }}>
                  <div className="text-2xl font-bold mb-3 text-emerald-500">{t('dashboard.whatsappLabel')}</div>
                  <p className={`font-bold ${theme.accent} truncate`}>{biz.whatsapp}</p>
                </a>
              )}
              {biz.instagram_url && (
                <a href={biz.instagram_url} target="_blank" rel="noreferrer" className={`rounded-[1.8rem] border shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all p-6 text-center`} style={{ borderColor: '#ec489988', background: 'linear-gradient(160deg, rgba(244,114,182,0.2), rgba(249,115,22,0.08))' }}>
                  <div className="text-2xl font-bold mb-3 text-pink-500">Instagram</div>
                  <p className={`font-bold ${theme.accent} truncate`}>@{biz.instagram_url.split('/').pop()}</p>
                </a>
              )}
              {websiteHref && (
                <a href={websiteHref} target="_blank" rel="noreferrer" className={`rounded-[1.8rem] border shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all p-6 text-center`} style={{ borderColor: withAlpha(brandColor, 0.53), background: `linear-gradient(160deg, ${withAlpha(brandColor, 0.13)}, ${withAlpha(accentColor, 0.07)})` }}>
                  <div className="text-2xl font-bold mb-3" style={{ color: accentColor }}>{t('business.website')}</div>
                  <p className={`font-bold ${theme.accent} truncate text-sm`}>{websiteDisplay}</p>
                </a>
              )}
            </div>
          </section>
        </main>

        <footer className={`${theme.header} backdrop-blur border-t transition-colors px-4 sm:px-6 py-8 mt-12 relative z-10`}>
          <div className="mx-auto max-w-7xl text-center">
            <p className={`${theme.text} opacity-75 text-sm`}>
              Powered by <span className="font-semibold">Bookorvia</span> © {new Date().getFullYear()}
            </p>
            <p className={`${theme.text} opacity-60 text-xs mt-2`}>Professional booking & loyalty management</p>
          </div>
        </footer>
      </div>
    );
  } catch (e) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-slate-100 text-slate-900">
        <header className="border-b border-slate-200 bg-white/80 backdrop-blur px-6 py-4 sticky top-0 z-50">
          <div className="mx-auto max-w-7xl flex items-center justify-between">
            <div className="text-xl font-bold text-indigo-600">Bookorvia</div>
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Public Booking</div>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-4 sm:px-6 py-24 text-center">
          <h1 className="text-4xl font-bold mb-4">Oops! Something Went Wrong</h1>
          <p className="text-slate-600 mb-8">We encountered an error loading this business. Please try again later.</p>
          <a href="/" className="inline-flex items-center rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors">Back to Home</a>
        </main>
      </div>
    );
  }
}
