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
    secondaryBtn: "border-amber-500 text-amber-400 hover:bg-amber-500/10"
  },
  elegant_light: {
    bg: "bg-gradient-to-br from-white via-slate-50 to-slate-100",
    text: "text-slate-900",
    card: "bg-white/60 border-slate-200",
    button: "font-bold text-white",
    accent: "text-indigo-600",
    header: "bg-white/80 border-slate-200",
    secondaryBtn: "border-slate-300 text-slate-900 hover:bg-slate-50"
  },
  modern_gradient: {
    bg: "bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20",
    text: "text-slate-900",
    card: "bg-white/70 backdrop-blur border-white/60 shadow-lg",
    button: "font-bold text-white",
    accent: "text-indigo-600",
    header: "bg-white/80 backdrop-blur border-white/60",
    secondaryBtn: "border-indigo-300 text-indigo-600 hover:bg-indigo-50"
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
              <a href="/" className="text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors">← Back</a>
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
        {/* Decorative elements */}
        {biz.public_theme === "luxury_dark" && (
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 -left-40 w-96 h-96 bg-amber-500/3 rounded-full blur-3xl"></div>
          </div>
        )}
        {biz.public_theme === "modern_gradient" && (
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-300/8 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 -left-40 w-96 h-96 bg-violet-300/6 rounded-full blur-3xl"></div>
          </div>
        )}

        {/* Header */}
        <header className={`sticky top-0 z-50 ${theme.header} backdrop-blur border-b transition-colors px-4 sm:px-6 py-4 shadow-sm`}>
          <div className="mx-auto max-w-7xl flex items-center justify-between">
            <div className={`text-2xl font-bold ${theme.text}`}>{biz.name}</div>
            <a href="/" className={`text-sm font-medium ${theme.text} opacity-75 hover:opacity-100 transition-opacity`}>← Back</a>
          </div>
        </header>

        <main className={`mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-12 relative z-10 ${theme.text}`}>
          {/* Premium Hero Section */}
          <div className={`rounded-3xl ${theme.card} backdrop-blur border shadow-xl overflow-hidden mb-8 sm:mb-12`}>
            {/* Cover Image or Gradient */}
            <div 
              className="h-64 sm:h-80 md:h-96 bg-cover bg-center relative overflow-hidden"
              style={{
                backgroundImage: coverImage ? `url('${coverImage}')` : undefined,
                backgroundColor: !coverImage ? brandColor : undefined,
              }}
            >
              {coverImage && (
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-950/20"></div>
              )}
              {!coverImage && (
                <div className={`absolute inset-0 opacity-20`} style={{ backgroundColor: brandColor }}></div>
              )}
            </div>

            {/* Hero Content */}
            <div className={`px-6 sm:px-8 md:px-12 pb-8 sm:pb-12 ${biz.public_theme === "luxury_dark" ? "-mt-20 relative z-10" : "-mt-24 relative z-10"}`}>
              {/* Logo */}
              <div className="mb-6 sm:mb-8">
                <div 
                  className="w-32 sm:w-40 h-32 sm:h-40 rounded-2xl shadow-2xl overflow-hidden border-4 flex items-center justify-center text-4xl sm:text-5xl font-bold"
                  style={{ 
                    backgroundColor: logo ? "transparent" : brandColor,
                    borderColor: accentColor,
                    color: biz.public_theme === "luxury_dark" ? "white" : "#1a1a2e"
                  }}
                >
                  {logo ? (
                    <img src={logo} alt={`${biz.name} logo`} className="w-full h-full object-cover" />
                  ) : (
                    initials
                  )}
                </div>
              </div>

              {/* Business Info */}
              <div className="mb-6 sm:mb-8">
                <h1 className={`text-4xl sm:text-5xl md:text-6xl font-bold mb-3`}>{biz.name}</h1>
                {biz.category && (
                  <p className={`text-lg sm:text-xl font-semibold ${theme.accent} mb-3`}>{biz.category}</p>
                )}
                {biz.description && (
                  <p className={`text-base sm:text-lg leading-relaxed max-w-2xl opacity-90`}>{biz.description}</p>
                )}
                {biz.address && (
                  <p className={`mt-4 text-sm sm:text-base opacity-75 flex items-center gap-2`}>
                    <MapPinIcon className="h-5 w-5 flex-shrink-0" /> {biz.address}
                  </p>
                )}
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-3 sm:gap-4">
                <a 
                  href="#book" 
                  className={`inline-flex items-center justify-center rounded-xl px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-bold text-white shadow-lg hover:shadow-xl hover:-translate-y-1 active:scale-95 transition-all`}
                  style={{ backgroundColor: brandColor }}
                >
                  Book Now
                </a>
                {biz.whatsapp && (
                  <a 
                    href={`https://wa.me/${biz.whatsapp.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className={`inline-flex items-center justify-center rounded-xl px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 active:scale-95 transition-all text-white bg-emerald-600 hover:bg-emerald-700`}
                  >
                    WhatsApp
                  </a>
                )}
                {biz.phone && (
                  <a 
                    href={`tel:${biz.phone.replace(/[^0-9+]/g, "")}`}
                    className={`inline-flex items-center justify-center rounded-xl px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-bold border-2 shadow-lg hover:shadow-xl hover:-translate-y-1 active:scale-95 transition-all`}
                    style={{ borderColor: accentColor, color: accentColor }}
                  >
                    Call
                  </a>
                )}
                <a 
                  href="#reviews"
                  className={`inline-flex items-center justify-center rounded-xl px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-bold border-2 shadow-lg hover:shadow-xl hover:-translate-y-1 active:scale-95 transition-all`}
                  style={{ borderColor: accentColor, color: accentColor }}
                >
                  Reviews
                </a>
              </div>
            </div>
          </div>

          {/* Services Section */}
          {services && services.length > 0 && (
            <section className="mb-8 sm:mb-12">
              <div className="mb-6 sm:mb-8">
                <h2 className={`text-3xl sm:text-4xl font-bold`}>Services</h2>
                <p className={`opacity-70 mt-2`}>Premium offerings tailored for you</p>
              </div>
              <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
                {services.map((s: any) => (
                  <div 
                    key={s.id} 
                    className={`relative rounded-2xl overflow-hidden border shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all group min-h-96`}
                  >
                    {/* Background Image */}
                    {s.background_image_url ? (
                      <>
                        <div className="absolute inset-0">
                          <img
                            src={s.background_image_url}
                            alt={s.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        {/* Strong gradient overlay for text readability */}
                        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-black/80"></div>
                      </>
                    ) : (
                      <div className={`absolute inset-0 ${theme.card}`}></div>
                    )}

                    {/* Content */}
                    <div className="relative p-6 sm:p-8 h-full flex flex-col justify-between">
                      <div className="mb-4">
                        <h3 className={`text-xl font-bold transition-colors ${s.background_image_url ? 'text-white' : theme.text}`} style={s.background_image_url ? {textShadow: "0 2px 8px rgba(0,0,0,0.5), 0 4px 12px rgba(0,0,0,0.3)"} : {}}>{s.name}</h3>
                        {s.description && (
                          <p className={`text-sm mt-2 ${s.background_image_url ? 'text-white/95' : 'opacity-70'}`} style={s.background_image_url ? {textShadow: "0 1px 4px rgba(0,0,0,0.5)"} : {}}>{s.description}</p>
                        )}
                      </div>

                      {/* Price & Duration */}
                      <div className="my-6 pt-6 border-t" style={{borderColor: s.background_image_url ? 'rgba(255,255,255,0.3)' : 'var(--border-color, #e2e8f0)'}}>
                        <div className="grid grid-cols-2 gap-4">
                          {s.price && (
                            <div>
                              <p className={`text-xs font-semibold uppercase ${s.background_image_url ? 'text-white/80' : 'opacity-60'}`} style={s.background_image_url ? {textShadow: "0 1px 3px rgba(0,0,0,0.5)"} : {}}>Price</p>
                              <p className={`text-2xl font-bold mt-1 ${s.background_image_url ? 'text-white' : theme.text}`} style={s.background_image_url ? {textShadow: "0 2px 6px rgba(0,0,0,0.5)"} : {}}>{s.price}</p>
                              <p className={`text-xs mt-1 ${s.background_image_url ? 'text-white/80' : 'opacity-60'}`} style={s.background_image_url ? {textShadow: "0 1px 3px rgba(0,0,0,0.5)"} : {}}>{s.currency || 'MAD'}</p>
                            </div>
                          )}
                          {s.duration_minutes && (
                            <div>
                              <p className={`text-xs font-semibold uppercase ${s.background_image_url ? 'text-white/80' : 'opacity-60'}`} style={s.background_image_url ? {textShadow: "0 1px 3px rgba(0,0,0,0.5)"} : {}}>Duration</p>
                              <p className={`text-2xl font-bold mt-1 ${s.background_image_url ? 'text-white' : theme.text}`} style={s.background_image_url ? {textShadow: "0 2px 6px rgba(0,0,0,0.5)"} : {}}>{s.duration_minutes}</p>
                              <p className={`text-xs mt-1 ${s.background_image_url ? 'text-white/80' : 'opacity-60'}`} style={s.background_image_url ? {textShadow: "0 1px 3px rgba(0,0,0,0.5)"} : {}}>min</p>
                            </div>
                          )}
                        </div>
                      </div>

                      <a 
                        href="#book" 
                        className={`block w-full text-center rounded-lg py-3 text-base font-bold shadow-md hover:shadow-lg transition-all active:scale-95 text-white`}
                        style={{ backgroundColor: brandColor }}
                      >
                        Book This Service
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Booking Form Section */}
          <section id="book" className="mb-8 sm:mb-12 scroll-mt-24">
            <BookingSection 
              businessId={biz.id} 
              services={services} 
              businessSlug={biz.slug} 
              themeStyles={publicThemeStyles[biz.public_theme as keyof typeof publicThemeStyles]}
              language={biz.language || 'en'}
            />
          </section>

          {/* Reviews Section */}
          <section id="reviews" className="mb-8 sm:mb-12 scroll-mt-24">
            <div className="mb-6 sm:mb-8">
              <h2 className={`text-3xl sm:text-4xl font-bold`}>Reviews</h2>
              <p className={`opacity-70 mt-2`}>Help others discover this business</p>
            </div>
            <div className={`rounded-3xl ${theme.card} backdrop-blur border shadow-lg p-6 sm:p-8`}>
              <ReviewBooster businessId={biz.id} googleReviewUrl={biz.google_review_url} preloadedReviews={reviews} themeStyles={publicThemeStyles[biz.public_theme as keyof typeof publicThemeStyles]} />
            </div>
          </section>

          {/* Loyalty Section */}
          <section className="mb-8 sm:mb-12">
            <div className={`rounded-3xl ${theme.card} backdrop-blur border shadow-lg p-6 sm:p-8`}>
              <LoyaltyLookup businessId={biz.id} themeStyles={publicThemeStyles[biz.public_theme as keyof typeof publicThemeStyles]} />
            </div>
          </section>

          {/* Contact Section */}
          <section className="mb-8 sm:mb-12">
            <div className="mb-6 sm:mb-8">
              <h2 className={`text-3xl sm:text-4xl font-bold`}>Get In Touch</h2>
            </div>
            <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
              {biz.phone && (
                <a 
                  href={`tel:${biz.phone.replace(/[^0-9+]/g, "")}`}
                  className={`rounded-2xl ${theme.card} backdrop-blur border shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all p-6 text-center group`}
                >
                  <div className="text-2xl font-bold mb-3" style={{ color: accentColor }}>Call</div>
                  <p className={`text-sm opacity-70 mb-2`}>Phone</p>
                  <p className={`font-bold ${theme.accent}`}>{biz.phone}</p>
                </a>
              )}
              {biz.whatsapp && (
                <a 
                  href={`https://wa.me/${biz.whatsapp.replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className={`rounded-2xl ${theme.card} backdrop-blur border shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all p-6 text-center group`}
                >
                  <div className="text-2xl font-bold mb-3" style={{ color: accentColor }}>WhatsApp</div>
                  <p className={`text-sm opacity-70 mb-2`}>Message</p>
                  <p className={`font-bold ${theme.accent} truncate`}>{biz.whatsapp}</p>
                </a>
              )}
              {biz.instagram_url && (
                <a 
                  href={biz.instagram_url}
                  target="_blank"
                  rel="noreferrer"
                  className={`rounded-2xl ${theme.card} backdrop-blur border shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all p-6 text-center group`}
                >
                  <div className="text-2xl font-bold mb-3" style={{ color: accentColor }}>Instagram</div>
                  <p className={`text-sm opacity-70 mb-2`}>Follow</p>
                  <p className={`font-bold ${theme.accent} truncate`}>@{biz.instagram_url.split('/').pop()}</p>
                </a>
              )}
              {biz.website_url && (
                <a 
                  href={biz.website_url}
                  target="_blank"
                  rel="noreferrer"
                  className={`rounded-2xl ${theme.card} backdrop-blur border shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all p-6 text-center group`}
                >
                  <div className="text-2xl font-bold mb-3" style={{ color: accentColor }}>Website</div>
                  <p className={`text-sm opacity-70 mb-2`}>Visit</p>
                  <p className={`font-bold ${theme.accent} truncate text-sm`}>{new URL(biz.website_url).hostname}</p>
                </a>
              )}
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className={`${theme.header} backdrop-blur border-t transition-colors px-4 sm:px-6 py-8 mt-12 relative z-10`}>
          <div className="mx-auto max-w-7xl text-center">
            <p className={`opacity-70 text-sm`}>
              Powered by <span className="font-semibold">Bookorvia</span> © {new Date().getFullYear()}
            </p>
            <p className={`opacity-50 text-xs mt-2`}>Professional booking & loyalty management</p>
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
            <a href="/" className="text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors">← Back</a>
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
