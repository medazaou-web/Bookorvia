"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "../../../lib/supabase/browserClient";
import { useLanguage } from '@/lib/context/LanguageContext';
import { useTranslations } from '@/lib/i18n';
import { AlertIcon, MessageIcon } from "@/components/icons";

interface Service {
  name: string;
  price: number | "";
  currency: string;
  duration_minutes: number | "";
}

export default function OnboardingPage() {
  const { language } = useLanguage();
  const t = useTranslations(language);
  const router = useRouter();
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Step 1: Business Profile
  const [businessName, setBusinessName] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("salon");
  const [description, setDescription] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [address, setAddress] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [bookingCountries, setBookingCountries] = useState<string[]>(["US"]);
  const [savingBusiness, setSavingBusiness] = useState(false);

  // Step 2: Services
  const [services, setServices] = useState<Service[]>([
    { name: "", price: "", currency: "MAD", duration_minutes: 30 },
  ]);
  const [savingServices, setSavingServices] = useState(false);
  const [businessId, setBusinessId] = useState<string | null>(null);

  // Step 3: Preview
  const [businessData, setBusinessData] = useState<any | null>(null);

  // Step 4: QR Code
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [publicPageUrl, setPublicPageUrl] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const authUser = (userData as any)?.user ?? null;
      if (!authUser) {
        router.push("/login");
        return;
      }

      setUser(authUser);

      // Check if already has business
      const { data: biz } = await supabase.from("businesses").select("id").eq("user_id", authUser.id).single();
      if (biz) {
        // Already has business, redirect to dashboard
        router.push("/dashboard");
        return;
      }

      setLoading(false);
    } catch (e: any) {
      setLoading(false);
    }
  }

  // Step 1: Save business profile
  async function saveBusiness(e: React.FormEvent) {
    e.preventDefault();
    if (!businessName.trim() || !slug.trim()) {
      setError(t('onboardingMessages.businessNameAndSlugRequired'));
      return;
    }

    setSavingBusiness(true);
    setError(null);
    try {
      const payload: any = {
        user_id: user.id,
        name: businessName,
        slug: slug.toLowerCase().trim(),
        category: category,
        description: description,
        phone: phone,
        whatsapp: whatsapp,
        address: address,
        currency: currency,
      };

      // Only include booking_countries if provided
      if (bookingCountries && bookingCountries.length > 0) {
        payload.booking_countries = bookingCountries;
      }

      const { data: newBiz, error: insErr } = await supabase.from("businesses").insert(payload).select().single();
      if (insErr) throw insErr;

      setBusinessId((newBiz as any)?.id);
      setBusinessData(newBiz);
      setSuccess(t('onboardingMessages.businessProfileCreated'));
      setStep(2);
    } catch (e: any) {
      setError(e?.message || String(e));
    } finally {
      setSavingBusiness(false);
    }
  }

  // Step 2: Save services
  async function saveServices(e: React.FormEvent) {
    e.preventDefault();
    const validServices = services.filter((s) => s.name.trim() && s.price !== "");
    if (validServices.length === 0) {
      setError(t('onboardingMessages.addAtLeastOneService'));
      return;
    }

    setSavingServices(true);
    setError(null);
    try {
      const payloads = validServices.map((s) => ({
        business_id: businessId,
        name: s.name,
        price: Number(s.price),
        currency: s.currency,
        duration_minutes: Number(s.duration_minutes),
        is_active: true,
      }));

      const { error: insErr } = await supabase.from("services").insert(payloads);
      if (insErr) throw insErr;

      setSuccess(t('onboardingMessages.servicesAdded'));
      setStep(3);
    } catch (e: any) {
      setError(e?.message || String(e));
    } finally {
      setSavingServices(false);
    }
  }

  // Step 3: Load preview data
  useEffect(() => {
    if (step === 3 && businessData) {
      generateQRCode();
    }
  }, [step]);

  function generateQRCode() {
    if (businessData?.slug) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
      const url = `${appUrl}/b/${businessData.slug}`;
      setPublicPageUrl(url);
      // Using QR server API for QR code generation
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}`;
      setQrCodeUrl(qrUrl);
    }
  }

  function nextFromPreview() {
    setSuccess(null);
    setStep(4);
  }

  function copyLink() {
    if (publicPageUrl) {
      navigator.clipboard.writeText(publicPageUrl);
      setSuccess(t('onboardingMessages.linkCopied'));
      setTimeout(() => setSuccess(null), 2000);
    }
  }

  function downloadQR() {
    if (qrCodeUrl) {
      const link = document.createElement("a");
      link.href = qrCodeUrl;
      link.download = `${businessData.slug}-qr.png`;
      link.click();
    }
  }

  function finishOnboarding() {
    router.push("/dashboard");
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-white flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">{t('onboarding.loadingOnboarding')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 p-4 sm:p-8 transition-colors duration-200">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-400/5 dark:bg-indigo-500/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-400/5 dark:bg-blue-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-3xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent mb-2">{t('onboarding.welcomeTitle')}</h1>
          <p className="text-lg text-slate-600 dark:text-slate-300">{t('onboarding.welcomeSubtitle')}</p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            {[1, 2, 3, 4, 5].map((s) => (
              <div key={s} className="flex flex-col items-center flex-1">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm transition-all transform ${
                    s <= step
                      ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg scale-110"
                      : "bg-white dark:bg-slate-800 border-2 border-indigo-200 dark:border-slate-600 text-indigo-400 dark:text-slate-400"
                  }`}
                >
                  {s < step ? "✓" : s}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 text-center hidden sm:block font-medium">
                  {[t('onboarding.progressBusiness'), t('onboarding.progressServices'), t('onboarding.progressPreview'), t('onboarding.progressQrCode'), t('onboarding.progressDone')][s - 1]}
                </p>
              </div>
            ))}
          </div>
          <div className="w-full h-2 bg-white/60 dark:bg-slate-700/60 rounded-full overflow-hidden border border-indigo-100 dark:border-slate-600">
            <div
              className="h-full bg-gradient-to-r from-indigo-600 to-blue-600 transition-all duration-300 shadow-lg"
              style={{ width: `${(step / 5) * 100}%` }}
            />
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-red-50 dark:from-red-950/60 to-red-100/50 dark:to-red-900/60 border border-red-200 dark:border-red-700/80 text-red-700 dark:text-red-200 font-medium flex items-center gap-3 animate-pulse">
            <AlertIcon className="h-5 w-5 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-emerald-50 dark:from-emerald-950/60 to-emerald-100/50 dark:to-emerald-900/60 border border-emerald-200 dark:border-emerald-700/80 text-emerald-700 dark:text-emerald-200 font-medium flex items-center gap-3">
            <span className="text-xl">✓</span>
            {success}
          </div>
        )}

        {/* Step 1: Business Profile */}
        {step === 1 && (
          <div className="rounded-3xl bg-white dark:bg-slate-900 backdrop-blur-md border border-white/80 dark:border-slate-700/60 p-8 sm:p-10 shadow-2xl">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{t('onboarding.businessProfileTitle')}</h2>
              <p className="text-slate-600 dark:text-slate-300">{t('onboarding.businessProfileSubtitle')}</p>
            </div>

            <form onSubmit={saveBusiness} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2.5">{t('onboarding.businessName')} *</label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => {
                    setBusinessName(e.target.value);
                    setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"));
                  }}
                  placeholder={t('onboarding.businessNamePlaceholder')}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white/50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent focus:bg-white dark:focus:bg-slate-800 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2.5">{t('onboarding.urlSlugLabel')} *</label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder={t('onboarding.urlSlugPlaceholder')}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white/50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent focus:bg-white dark:focus:bg-slate-800 transition-all"
                  required
                />
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 font-medium">{t('onboarding.publicPageLabel')} {window?.location?.origin}/b/{slug}</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2.5">{t('onboarding.businessCategory')}</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white/50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent focus:bg-white dark:focus:bg-slate-800 transition-all"
                  >
                    <option value="salon">{t('onboarding.categorySalon')}</option>
                    <option value="barber">{t('onboarding.categoryBarber')}</option>
                    <option value="spa">{t('onboarding.categorySpa')}</option>
                    <option value="clinic">{t('onboarding.categoryClinic')}</option>
                    <option value="fitness">{t('onboarding.categoryFitness')}</option>
                    <option value="other">{t('onboarding.categoryOther')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2.5">{t('onboarding.currencyLabel')} *</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white/50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent focus:bg-white dark:focus:bg-slate-800 transition-all"
                  >
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                    <option value="MAD">MAD - Moroccan Dirham</option>
                    <option value="BRL">BRL - Brazilian Real</option>
                    <option value="MXN">MXN - Mexican Peso</option>
                    <option value="ARS">ARS - Argentine Peso</option>
                    <option value="AED">AED - UAE Dirham</option>
                    <option value="SAR">SAR - Saudi Riyal</option>
                    <option value="INR">INR - Indian Rupee</option>
                    <option value="AUD">AUD - Australian Dollar</option>
                    <option value="CAD">CAD - Canadian Dollar</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2.5">{t('onboarding.businessDescription')}</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t('onboarding.descriptionPlaceholder')}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white/50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent focus:bg-white dark:focus:bg-slate-800 transition-all resize-none"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2.5">{t('onboarding.businessPhone')}</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g., +212 5XX XXX XXX"
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white/50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent focus:bg-white dark:focus:bg-slate-800 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2.5">{t('onboarding.businessWhatsapp')}</label>
                  <input
                    type="tel"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="e.g., +212 5XX XXX XXX"
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white/50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent focus:bg-white dark:focus:bg-slate-800 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2.5">{t('onboarding.businessAddress')}</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g., 123 Main Street, City"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white/50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent focus:bg-white dark:focus:bg-slate-800 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-3">{t('onboarding.bookingCountries')}</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {["US", "CA", "GB", "ES", "FR", "DE", "IT", "MA", "AE", "SA", "BR", "MX", "AR", "IN", "AU", "JP"].map((country) => (
                    <label key={country} className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors">
                      <input
                        type="checkbox"
                        checked={bookingCountries.includes(country)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setBookingCountries([...bookingCountries, country]);
                          } else {
                            setBookingCountries(bookingCountries.filter((c) => c !== country));
                          }
                        }}
                        className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-indigo-600 dark:bg-slate-800 focus:ring-indigo-500 cursor-pointer"
                      />
                      <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">{country}</span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-3 font-medium">{t('onboarding.bookingCountriesHint')}</p>
              </div>

              <button
                disabled={savingBusiness}
                type="submit"
                className="w-full px-6 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold text-center hover:from-indigo-700 hover:to-blue-700 hover:shadow-xl dark:from-indigo-600 dark:to-blue-600 dark:hover:from-indigo-500 dark:hover:to-blue-500 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 shadow-lg mt-8"
              >
                {savingBusiness ? t('onboarding.creating') : t('onboarding.continue')}
              </button>
            </form>
          </div>
        )}

        {/* Step 2: Add Services */}
        {step === 2 && (
          <div className="rounded-3xl bg-white dark:bg-slate-900 backdrop-blur-md border border-white/80 dark:border-slate-700/60 p-8 sm:p-10 shadow-2xl">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{t('onboarding.addServices')}</h2>
              <p className="text-slate-600 dark:text-slate-300">{t('onboarding.addServicesSubtitle')}</p>
            </div>

            <form onSubmit={saveServices} className="space-y-6">
              {services.map((service, idx) => (
                <div key={idx} className="p-6 rounded-2xl bg-gradient-to-br from-indigo-50 dark:from-indigo-950/40 to-blue-50 dark:to-blue-900/40 border border-indigo-200 dark:border-indigo-700/40">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-slate-900 dark:text-white">{t('onboarding.serviceLabel')} {idx + 1}</h3>
                    {services.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setServices(services.filter((_, i) => i !== idx))}
                        className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-bold text-sm transition-colors"
                      >
                        {t('onboarding.remove')}
                      </button>
                    )}
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-900 dark:text-white mb-2">{t('onboarding.serviceNameLabel')} *</label>
                      <input
                        type="text"
                        value={service.name}
                        onChange={(e) => {
                          const newServices = [...services];
                          newServices[idx].name = e.target.value;
                          setServices(newServices);
                        }}
                        placeholder={t('onboarding.serviceNamePlaceholder')}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white/50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent focus:bg-white dark:focus:bg-slate-800 transition-all text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-900 dark:text-white mb-2">{t('onboarding.priceLabel')} *</label>
                      <input
                        type="number"
                        value={service.price}
                        onChange={(e) => {
                          const newServices = [...services];
                          newServices[idx].price = e.target.value ? Number(e.target.value) : "";
                          setServices(newServices);
                        }}
                        placeholder="0.00"
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white/50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent focus:bg-white dark:focus:bg-slate-800 transition-all text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-900 dark:text-white mb-2">{t('onboarding.currencyLabel')}</label>
                      <select
                        value={service.currency}
                        onChange={(e) => {
                          const newServices = [...services];
                          newServices[idx].currency = e.target.value;
                          setServices(newServices);
                        }}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white/50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent focus:bg-white dark:focus:bg-slate-800 transition-all text-sm"
                      >
                        <option value="MAD">MAD (Moroccan Dirham)</option>
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-900 dark:text-white mb-2">{t('onboarding.durationMinutesLabel')}</label>
                      <input
                        type="number"
                        value={service.duration_minutes}
                        onChange={(e) => {
                          const newServices = [...services];
                          newServices[idx].duration_minutes = e.target.value ? Number(e.target.value) : "";
                          setServices(newServices);
                        }}
                        placeholder="30"
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white/50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent focus:bg-white dark:focus:bg-slate-800 transition-all text-sm"
                      />
                    </div>
                  </div>
                </div>
              ))}

              {services.length < 3 && (
                <button
                  type="button"
                  onClick={() => setServices([...services, { name: "", price: "", currency: "MAD", duration_minutes: 30 }])}
                  className="w-full px-6 py-3 rounded-xl border-2 border-dashed border-indigo-300 dark:border-indigo-600/50 text-indigo-700 dark:text-indigo-300 font-bold hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-all"
                >
                  + {t('onboarding.addAnotherService')}
                </button>
              )}

              <button
                disabled={savingServices}
                type="submit"
                className="w-full px-6 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold text-center hover:from-indigo-700 hover:to-blue-700 hover:shadow-xl dark:from-indigo-600 dark:to-blue-600 dark:hover:from-indigo-500 dark:hover:to-blue-500 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 shadow-lg mt-8"
              >
                {savingServices ? t('onboarding.saving') : t('onboarding.continue')}
              </button>
            </form>
          </div>
        )}
        {/* Step 3: Preview */}
        {step === 3 && businessData && (
          <div className="rounded-3xl bg-white dark:bg-slate-900 backdrop-blur-md border border-white/80 dark:border-slate-700/60 p-8 sm:p-10 shadow-2xl">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{t('onboarding.previewTitle')}</h2>
              <p className="text-slate-600 dark:text-slate-300">{t('onboarding.previewSubtitle')}</p>
            </div>

            {/* Preview Card */}
            <div className="mb-8 p-8 rounded-2xl bg-gradient-to-br from-indigo-50 dark:from-indigo-950/40 to-blue-50 dark:to-blue-900/40 border-2 border-indigo-200 dark:border-indigo-700/40">
              <div className="mb-4">
                <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{businessData.name}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  {businessData.category ? businessData.category.charAt(0).toUpperCase() + businessData.category.slice(1) : t('onboarding.progressBusiness')}
                </p>
              </div>

              {businessData.description && <p className="text-slate-700 dark:text-slate-300 mb-6">{businessData.description}</p>}

              {businessData.whatsapp && (
                <button className="px-6 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold hover:shadow-lg active:scale-95 transition-all inline-block mb-6">
                  <MessageIcon className="h-4 w-4 inline mr-2" /> WhatsApp
                </button>
              )}

              <div className="space-y-3">
                <p className="font-semibold text-slate-900 dark:text-white">{t('onboarding.featuredServices')}</p>
                <div className="space-y-2">
                  {services.slice(0, 3).map((s, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-white dark:bg-slate-800/50 rounded-lg">
                      <span className="text-slate-900 dark:text-white font-medium">{s.name}</span>
                      <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                        {s.price} {s.currency}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={nextFromPreview}
              className="w-full px-6 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold text-center hover:from-indigo-700 hover:to-blue-700 hover:shadow-xl dark:from-indigo-600 dark:to-blue-600 dark:hover:from-indigo-500 dark:hover:to-blue-500 active:scale-95 transition-all duration-200 shadow-lg"
            >
              {t('onboarding.continueToQrCode')}
            </button>
          </div>
        )}

        {/* Step 4: QR Code */}
        {step === 4 && businessData && publicPageUrl && (
          <div className="rounded-3xl bg-white dark:bg-slate-900 backdrop-blur-md border border-white/80 dark:border-slate-700/60 p-8 sm:p-10 shadow-2xl">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{t('onboarding.yourQrCodeTitle')}</h2>
              <p className="text-slate-600 dark:text-slate-300">{t('onboarding.yourQrCodeSubtitle')}</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-8 mb-8">
              {/* QR Code */}
              <div className="flex flex-col items-center justify-center p-8 rounded-2xl bg-gradient-to-br from-indigo-50 dark:from-indigo-950/40 to-blue-50 dark:to-blue-900/40 border-2 border-indigo-200 dark:border-indigo-700/40">
                {qrCodeUrl ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={qrCodeUrl} alt={t('onboarding.qrCodeAlt')} className="w-64 h-64 rounded-xl shadow-lg" />
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-4 font-medium">{t('onboarding.scanPublicPage')}</p>
                  </>
                ) : (
                  <div className="text-slate-600 dark:text-slate-400">{t('onboarding.generatingQrCode')}</div>
                )}
              </div>

              {/* Public Link */}
              <div className="flex flex-col justify-center">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">{t('onboarding.publicPageLink')}</h3>

                <div className="p-4 rounded-xl bg-white/60 dark:bg-slate-800/60 border border-indigo-200 dark:border-indigo-700/40 mb-4">
                  <p className="text-sm text-slate-600 dark:text-slate-300 break-all font-mono">{publicPageUrl}</p>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={copyLink}
                    className="w-full px-6 py-3 rounded-xl border-2 border-indigo-300 dark:border-indigo-600/50 bg-white dark:bg-slate-800/60 text-indigo-700 dark:text-indigo-300 font-bold hover:bg-indigo-50 dark:hover:bg-slate-700/80 active:scale-95 transition-all"
                  >
                    📋 {t('onboarding.copyLinkButton')}
                  </button>

                  <button
                    onClick={downloadQR}
                    className="w-full px-6 py-3 rounded-xl border-2 border-indigo-300 dark:border-indigo-600/50 bg-white dark:bg-slate-800/60 text-indigo-700 dark:text-indigo-300 font-bold hover:bg-indigo-50 dark:hover:bg-slate-700/80 active:scale-95 transition-all"
                  >
                    ⬇️ {t('onboarding.downloadQrButton')}
                  </button>
                </div>

                <p className="text-sm text-slate-600 dark:text-slate-400 mt-6 font-medium">
                  {t('onboarding.qrHelpText')}
                </p>
              </div>
            </div>

            <button
              onClick={() => setStep(5)}
              className="w-full px-6 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold text-center hover:from-indigo-700 hover:to-blue-700 hover:shadow-xl dark:from-indigo-600 dark:to-blue-600 dark:hover:from-indigo-500 dark:hover:to-blue-500 active:scale-95 transition-all duration-200 shadow-lg"
            >
              {t('onboarding.finishSetup')}
            </button>
          </div>
        )}

        {/* Step 5: Finish */}
        {step === 5 && (
          <div className="text-center rounded-3xl bg-white dark:bg-slate-900 backdrop-blur-md border border-white/80 dark:border-slate-700/60 shadow-2xl p-8 sm:p-12">
            <div className="text-7xl mb-6 animate-bounce">🎉</div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent mb-4">{t('onboarding.allSetTitle')}</h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 mb-2 font-medium">{t('onboarding.readyMessage')}</p>
            <p className="text-slate-600 dark:text-slate-400 mb-10">{t('onboarding.readySubMessage')}</p>

            <button
              onClick={finishOnboarding}
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold text-lg hover:from-indigo-700 hover:to-blue-700 hover:shadow-xl dark:from-indigo-600 dark:to-blue-600 dark:hover:from-indigo-500 dark:hover:to-blue-500 active:scale-95 transition-all inline-block shadow-lg"
            >
              {t('onboarding.goToDashboardButton')} →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
