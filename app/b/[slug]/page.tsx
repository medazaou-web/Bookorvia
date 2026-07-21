import { createServerSupabase } from "../../../lib/supabase/serverClient";
import { cookies } from "next/headers";
import BookingSection from "./BookingSection";
import ReviewBooster from "./ReviewBooster";
import LoyaltyLookup from "./LoyaltyLookup";
import { MapPinIcon } from "@/components/icons";

type Props = { params: any };

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
    const theme = themeConfig[biz.public_theme as keyof typeof themeConfig] || themeConfig.modern_gradient;
    const brandColor = biz.brand_color || "#4f46e5";
    const accentColor = biz.accent_color || "#06b6d4";
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

    return (
      <div className={`min-h-screen ${theme.bg} transition-colors duration-300`}>
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-48 -right-40 w-96 h-96 rounded-full blur-3xl" style={{ backgroundColor: `${brandColor}22` }}></div>
          <div className="absolute bottom-0 -left-52 w-[28rem] h-[28rem] rounded-full blur-3xl" style={{ backgroundColor: `${accentColor}22` }}></div>
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
          <div className={`rounded-[2rem] ${theme.card} backdrop-blur border shadow-2xl overflow-hidden mb-8 sm:mb-10`}>
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
                    backgroundColor: logo ? 'transparent' : brandColor,
                    borderColor: accentColor,
                    color: biz.public_theme === 'luxury_dark' ? 'white' : '#0f172a',
                  }}
                >
                  {logo ? (
                    <img src={logo} alt={`${biz.name} logo`} className="w-full h-full object-cover" />
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
                  <div className="mt-4 w-full max-w-sm h-1.5 rounded-full" style={{ background: brandGradient }}></div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-bold border" style={{ borderColor: `${brandColor}66`, color: brandColor, backgroundColor: `${brandColor}15` }}>Brand Accent</span>
                    <span className="px-3 py-1 rounded-full text-xs font-bold border" style={{ borderColor: `${accentColor}66`, color: accentColor, backgroundColor: `${accentColor}15` }}>Signature Color</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href="#book"
                  className="inline-flex items-center justify-center rounded-xl px-5 sm:px-7 py-3 text-sm sm:text-base font-bold text-white shadow-lg hover:shadow-xl hover:-translate-y-1 active:scale-95 transition-all"
                  style={{ background: brandGradient }}
                >
                  Book Now
                </a>
                {biz.whatsapp && (
                  <a
                    href={`https://wa.me/${biz.whatsapp.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center rounded-xl px-5 sm:px-7 py-3 text-sm sm:text-base font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg hover:shadow-xl hover:-translate-y-1 active:scale-95 transition-all"
                  >
                    WhatsApp
                  </a>
                )}
                {biz.phone && (
                  <a
                    href={`tel:${biz.phone.replace(/[^0-9+]/g, '')}`}
                    className="inline-flex items-center justify-center rounded-xl px-5 sm:px-7 py-3 text-sm sm:text-base font-bold border-2 shadow-lg hover:shadow-xl hover:-translate-y-1 active:scale-95 transition-all"
                    style={{ borderColor: accentColor, color: accentColor }}
                  >
                    Call
                  </a>
                )}
                <a
                  href="#reviews"
                  className="inline-flex items-center justify-center rounded-xl px-5 sm:px-7 py-3 text-sm sm:text-base font-bold border-2 shadow-lg hover:shadow-xl hover:-translate-y-1 active:scale-95 transition-all"
                  style={{ borderColor: accentColor, color: accentColor }}
                >
                  Reviews
                </a>
              </div>
            </div>
          </div>

          <nav className="sticky top-[74px] z-40 mb-8 sm:mb-10">
            <div className={`rounded-2xl border p-2 backdrop-blur-xl ${theme.surface}`} style={{ borderColor: `${brandColor}66`, background: `linear-gradient(90deg, ${brandColor}14, ${accentColor}14)` }}>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <a href="#services" className={`rounded-xl border px-3 py-2 text-center text-xs sm:text-sm font-semibold transition-colors ${theme.navPill}`} style={{ borderColor: `${brandColor}44` }}>Services</a>
                <a href="#book" className={`rounded-xl border px-3 py-2 text-center text-xs sm:text-sm font-semibold transition-colors ${theme.navPill}`} style={{ borderColor: `${brandColor}44` }}>Booking</a>
                <a href="#reviews" className={`rounded-xl border px-3 py-2 text-center text-xs sm:text-sm font-semibold transition-colors ${theme.navPill}`} style={{ borderColor: `${accentColor}44` }}>Reviews</a>
                <a href="#contact" className={`rounded-xl border px-3 py-2 text-center text-xs sm:text-sm font-semibold transition-colors ${theme.navPill}`} style={{ borderColor: `${accentColor}44` }}>Contact</a>
              </div>
            </div>
          </nav>

          {services && services.length > 0 && (
            <section id="services" className="mb-10 sm:mb-14 scroll-mt-36">
              <div className="mb-6 sm:mb-8">
                <h2 className="text-3xl sm:text-4xl font-bold">Services</h2>
                <p className={`${theme.subtext} mt-2`}>Choose a service and continue to booking.</p>
              </div>
              <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
                {services.map((s: any) => (
                  <div key={s.id} className={`relative rounded-2xl overflow-hidden border shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all group min-h-80 ${theme.surface}`} style={{ borderColor: s.background_image_url ? undefined : `${accentColor}44` }}>
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
                            <p className={`text-xs uppercase tracking-wide ${s.background_image_url ? 'text-white/75' : 'opacity-60'}`}>Price</p>
                            <p className={`text-2xl font-bold ${s.background_image_url ? 'text-white' : theme.text}`}>{s.price ?? '-'}</p>
                            <p className={`text-xs ${s.background_image_url ? 'text-white/75' : 'opacity-60'}`}>{s.currency || 'MAD'}</p>
                          </div>
                          <div className="text-right">
                            <p className={`text-xs uppercase tracking-wide ${s.background_image_url ? 'text-white/75' : 'opacity-60'}`}>Duration</p>
                            <p className={`text-2xl font-bold ${s.background_image_url ? 'text-white' : theme.text}`}>{s.duration_minutes ?? '-'}</p>
                            <p className={`text-xs ${s.background_image_url ? 'text-white/75' : 'opacity-60'}`}>min</p>
                          </div>
                        </div>
                      </div>

                      <a href="#book" className="mt-5 block w-full text-center rounded-lg py-3 text-sm font-bold shadow-md hover:shadow-lg transition-all active:scale-95 text-white" style={{ background: brandGradient }}>
                        Book This Service
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section id="book" className="mb-10 sm:mb-14 scroll-mt-36">
            <div className={`rounded-3xl ${theme.card} backdrop-blur border shadow-xl p-5 sm:p-7`} style={{ borderColor: `${brandColor}55` }}>
              <div className="mb-5">
                <h2 className="text-3xl sm:text-4xl font-bold">Book Your Visit</h2>
                <p className={`${theme.subtext} mt-2`}>Select services, date, and time in one quick flow.</p>
              </div>
              <BookingSection
                businessId={biz.id}
                services={services}
                businessSlug={biz.slug}
                themeStyles={publicThemeStyles[biz.public_theme as keyof typeof publicThemeStyles]}
                language={biz.language || 'en'}
              />
            </div>
          </section>

          <section id="reviews" className="mb-10 sm:mb-14 scroll-mt-36">
            <div className="mb-6 sm:mb-8">
              <h2 className="text-3xl sm:text-4xl font-bold">Reviews</h2>
              <p className={`${theme.subtext} mt-2`}>Help others discover this business.</p>
            </div>
            <div className={`rounded-3xl ${theme.card} backdrop-blur border shadow-lg p-6 sm:p-8`} style={{ borderColor: `${accentColor}55` }}>
              <ReviewBooster businessId={biz.id} googleReviewUrl={biz.google_review_url} preloadedReviews={reviews} themeStyles={publicThemeStyles[biz.public_theme as keyof typeof publicThemeStyles]} />
            </div>
          </section>

          <section className="mb-10 sm:mb-14">
            <div className={`rounded-3xl ${theme.card} backdrop-blur border shadow-lg p-6 sm:p-8`} style={{ borderColor: `${brandColor}55` }}>
              <LoyaltyLookup businessId={biz.id} themeStyles={publicThemeStyles[biz.public_theme as keyof typeof publicThemeStyles]} />
            </div>
          </section>

          <section id="contact" className="mb-10 sm:mb-14 scroll-mt-36">
            <div className="mb-6 sm:mb-8">
              <h2 className="text-3xl sm:text-4xl font-bold">Get In Touch</h2>
            </div>
            <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
              {biz.phone && (
                <a href={`tel:${biz.phone.replace(/[^0-9+]/g, '')}`} className={`rounded-2xl ${theme.surface} border shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all p-6 text-center`} style={{ borderColor: `${accentColor}55` }}>
                  <div className="text-2xl font-bold mb-3" style={{ color: accentColor }}>Call</div>
                  <p className={`text-sm ${theme.subtext} mb-2`}>Phone</p>
                  <p className={`font-bold ${theme.accent}`}>{biz.phone}</p>
                </a>
              )}
              {biz.whatsapp && (
                <a href={`https://wa.me/${biz.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className={`rounded-2xl ${theme.surface} border shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all p-6 text-center`} style={{ borderColor: `${brandColor}55` }}>
                  <div className="text-2xl font-bold mb-3" style={{ color: accentColor }}>WhatsApp</div>
                  <p className={`text-sm ${theme.subtext} mb-2`}>Message</p>
                  <p className={`font-bold ${theme.accent} truncate`}>{biz.whatsapp}</p>
                </a>
              )}
              {biz.instagram_url && (
                <a href={biz.instagram_url} target="_blank" rel="noreferrer" className={`rounded-2xl ${theme.surface} border shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all p-6 text-center`} style={{ borderColor: `${accentColor}55` }}>
                  <div className="text-2xl font-bold mb-3" style={{ color: accentColor }}>Instagram</div>
                  <p className={`text-sm ${theme.subtext} mb-2`}>Follow</p>
                  <p className={`font-bold ${theme.accent} truncate`}>@{biz.instagram_url.split('/').pop()}</p>
                </a>
              )}
              {biz.website_url && (
                <a href={biz.website_url} target="_blank" rel="noreferrer" className={`rounded-2xl ${theme.surface} border shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all p-6 text-center`} style={{ borderColor: `${brandColor}55` }}>
                  <div className="text-2xl font-bold mb-3" style={{ color: accentColor }}>Website</div>
                  <p className={`text-sm ${theme.subtext} mb-2`}>Visit</p>
                  <p className={`font-bold ${theme.accent} truncate text-sm`}>{new URL(biz.website_url).hostname}</p>
                </a>
              )}
            </div>
          </section>
        </main>

        <footer className={`${theme.header} backdrop-blur border-t transition-colors px-4 sm:px-6 py-8 mt-12 relative z-10`}>
          <div className="mx-auto max-w-7xl text-center">
            <p className="opacity-70 text-sm">
              Powered by <span className="font-semibold">Bookorvia</span> © {new Date().getFullYear()}
            </p>
            <p className="opacity-50 text-xs mt-2">Professional booking & loyalty management</p>
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
