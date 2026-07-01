"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "../../../lib/supabase/browserClient";

interface Service {
  name: string;
  price: number | "";
  currency: string;
  duration_minutes: number | "";
}

export default function OnboardingPage() {
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
      setError("Business name and slug are required");
      return;
    }

    setSavingBusiness(true);
    setError(null);
    try {
      const payload = {
        user_id: user.id,
        name: businessName,
        slug: slug.toLowerCase().trim(),
        category: category,
        description: description,
        phone: phone,
        whatsapp: whatsapp,
        address: address,
      };

      const { data: newBiz, error: insErr } = await supabase.from("businesses").insert(payload).select().single();
      if (insErr) throw insErr;

      setBusinessId((newBiz as any)?.id);
      setBusinessData(newBiz);
      setSuccess("Business profile created! Now add your services.");
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
      setError("Add at least one service");
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

      setSuccess("Services added! Check the preview.");
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
      const url = `${window.location.origin}/b/${businessData.slug}`;
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
      setSuccess("Link copied to clipboard!");
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
          <p className="text-slate-600 font-medium">Loading onboarding...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-white p-4 sm:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-2">Welcome to Bookorvia</h1>
          <p className="text-lg text-slate-600">Let's set up your business in 5 minutes</p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            {[1, 2, 3, 4, 5].map((s) => (
              <div key={s} className="flex flex-col items-center">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                    s <= step
                      ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg"
                      : "bg-white border-2 border-indigo-200 text-indigo-400"
                  }`}
                >
                  {s < step ? "✓" : s}
                </div>
                <p className="text-xs text-slate-600 mt-2 text-center hidden sm:block">
                  {["Business", "Services", "Preview", "QR Code", "Finish"][s - 1]}
                </p>
              </div>
            ))}
          </div>
          <div className="w-full h-2 bg-white/60 rounded-full overflow-hidden border border-indigo-100">
            <div
              className="h-full bg-gradient-to-r from-indigo-600 to-blue-600 transition-all duration-300"
              style={{ width: `${(step / 5) * 100}%` }}
            />
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 font-medium flex items-center gap-3">
            <span className="text-xl">⚠️</span>
            {error}
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-medium flex items-center gap-3">
            <span className="text-xl">✓</span>
            {success}
          </div>
        )}

        {/* Step 1: Business Profile */}
        {step === 1 && (
          <div className="rounded-3xl bg-white/80 backdrop-blur border border-white/60 shadow-xl p-8 sm:p-10">
            <h2 className="text-3xl font-bold text-slate-900 mb-8">Business Profile</h2>

            <form onSubmit={saveBusiness} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Business Name *</label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => {
                    setBusinessName(e.target.value);
                    setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"));
                  }}
                  placeholder="e.g., Casa Barber"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white/50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">URL Slug *</label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="e.g., casa-barber"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white/50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  required
                />
                <p className="text-xs text-slate-600 mt-1">Your public page: {window?.location?.origin}/b/{slug}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white/50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                >
                  <option value="salon">Salon</option>
                  <option value="barber">Barber</option>
                  <option value="spa">Spa</option>
                  <option value="clinic">Clinic</option>
                  <option value="fitness">Fitness</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell your customers about your business..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white/50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Phone</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g., +212 5XX XXX XXX"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white/50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">WhatsApp Number</label>
                <input
                  type="tel"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="e.g., +212 5XX XXX XXX"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white/50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g., 123 Main Street, City"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white/50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>

              <button
                disabled={savingBusiness}
                type="submit"
                className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold hover:shadow-lg hover:-translate-y-1 active:scale-95 disabled:opacity-60 transition-all"
              >
                {savingBusiness ? "Creating..." : "Continue"}
              </button>
            </form>
          </div>
        )}

        {/* Step 2: Add Services */}
        {step === 2 && (
          <div className="rounded-3xl bg-white/80 backdrop-blur border border-white/60 shadow-xl p-8 sm:p-10">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Add Services</h2>
            <p className="text-slate-600 mb-8">Add 1-3 services to get started</p>

            <form onSubmit={saveServices} className="space-y-6">
              {services.map((service, idx) => (
                <div key={idx} className="p-6 rounded-xl bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-slate-900">Service {idx + 1}</h3>
                    {services.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setServices(services.filter((_, i) => i !== idx))}
                        className="text-red-600 hover:text-red-700 font-bold text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-900 mb-1">Service Name *</label>
                      <input
                        type="text"
                        value={service.name}
                        onChange={(e) => {
                          const newServices = [...services];
                          newServices[idx].name = e.target.value;
                          setServices(newServices);
                        }}
                        placeholder="e.g., Haircut"
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white/50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-900 mb-1">Price *</label>
                      <input
                        type="number"
                        value={service.price}
                        onChange={(e) => {
                          const newServices = [...services];
                          newServices[idx].price = e.target.value ? Number(e.target.value) : "";
                          setServices(newServices);
                        }}
                        placeholder="0.00"
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white/50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-900 mb-1">Currency</label>
                      <select
                        value={service.currency}
                        onChange={(e) => {
                          const newServices = [...services];
                          newServices[idx].currency = e.target.value;
                          setServices(newServices);
                        }}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white/50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm"
                      >
                        <option value="MAD">MAD (Moroccan Dirham)</option>
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-900 mb-1">Duration (minutes)</label>
                      <input
                        type="number"
                        value={service.duration_minutes}
                        onChange={(e) => {
                          const newServices = [...services];
                          newServices[idx].duration_minutes = e.target.value ? Number(e.target.value) : "";
                          setServices(newServices);
                        }}
                        placeholder="30"
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white/50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm"
                      />
                    </div>
                  </div>
                </div>
              ))}

              {services.length < 3 && (
                <button
                  type="button"
                  onClick={() => setServices([...services, { name: "", price: "", currency: "MAD", duration_minutes: 30 }])}
                  className="w-full px-6 py-3 rounded-xl border-2 border-dashed border-indigo-300 text-indigo-700 font-bold hover:bg-indigo-50 transition-all"
                >
                  + Add Another Service
                </button>
              )}

              <button
                disabled={savingServices}
                type="submit"
                className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold hover:shadow-lg hover:-translate-y-1 active:scale-95 disabled:opacity-60 transition-all"
              >
                {savingServices ? "Saving..." : "Continue"}
              </button>
            </form>
          </div>
        )}

        {/* Step 3: Preview */}
        {step === 3 && businessData && (
          <div className="rounded-3xl bg-white/80 backdrop-blur border border-white/60 shadow-xl p-8 sm:p-10">
            <h2 className="text-3xl font-bold text-slate-900 mb-8">Preview Your Public Page</h2>

            {/* Preview Card */}
            <div className="mb-8 p-8 rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-100 border-2 border-indigo-300">
              <div className="mb-4">
                <h3 className="text-3xl font-bold text-slate-900">{businessData.name}</h3>
                <p className="text-sm text-slate-600 mt-1">
                  {businessData.category ? businessData.category.charAt(0).toUpperCase() + businessData.category.slice(1) : "Business"}
                </p>
              </div>

              {businessData.description && <p className="text-slate-700 mb-6">{businessData.description}</p>}

              {businessData.whatsapp && (
                <button className="px-6 py-2 rounded-lg bg-emerald-600 text-white font-bold hover:shadow-lg active:scale-95 transition-all inline-block mb-6">
                  💬 WhatsApp
                </button>
              )}

              <div className="space-y-3">
                <p className="font-semibold text-slate-900">Featured Services:</p>
                <div className="space-y-2">
                  {services.slice(0, 3).map((s, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-white/60 rounded-lg">
                      <span className="text-slate-900 font-medium">{s.name}</span>
                      <span className="text-indigo-600 font-bold">
                        {s.price} {s.currency}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={nextFromPreview}
              className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold hover:shadow-lg hover:-translate-y-1 active:scale-95 transition-all"
            >
              Continue to QR Code
            </button>
          </div>
        )}

        {/* Step 4: QR Code */}
        {step === 4 && businessData && publicPageUrl && (
          <div className="rounded-3xl bg-white/80 backdrop-blur border border-white/60 shadow-xl p-8 sm:p-10">
            <h2 className="text-3xl font-bold text-slate-900 mb-8">Your QR Code</h2>

            <div className="grid sm:grid-cols-2 gap-8 mb-8">
              {/* QR Code */}
              <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-50 border-2 border-indigo-200">
                {qrCodeUrl ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={qrCodeUrl} alt="QR Code" className="w-64 h-64 rounded-xl" />
                    <p className="text-sm text-slate-600 mt-4">Scan to view your public page</p>
                  </>
                ) : (
                  <div className="text-slate-600">Generating QR code...</div>
                )}
              </div>

              {/* Public Link */}
              <div className="flex flex-col justify-center">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Public Page Link</h3>

                <div className="p-4 rounded-xl bg-white/60 border border-indigo-200 mb-4">
                  <p className="text-sm text-slate-600 break-all font-mono">{publicPageUrl}</p>
                </div>

                <div className="space-y-2 mb-6">
                  <button
                    onClick={copyLink}
                    className="w-full px-6 py-3 rounded-xl border-2 border-indigo-300 bg-white text-indigo-700 font-bold hover:bg-indigo-50 active:scale-95 transition-all"
                  >
                    📋 Copy Link
                  </button>

                  <button
                    onClick={downloadQR}
                    className="w-full px-6 py-3 rounded-xl border-2 border-indigo-300 bg-white text-indigo-700 font-bold hover:bg-indigo-50 active:scale-95 transition-all"
                  >
                    ⬇️ Download QR
                  </button>
                </div>

                <p className="text-sm text-slate-600">
                  Share your public page link and QR code with your customers. You can also edit this later in Settings.
                </p>
              </div>
            </div>

            <button
              onClick={() => setStep(5)}
              className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold hover:shadow-lg hover:-translate-y-1 active:scale-95 transition-all"
            >
              Finish Setup
            </button>
          </div>
        )}

        {/* Step 5: Finish */}
        {step === 5 && (
          <div className="text-center rounded-3xl bg-white/80 backdrop-blur border border-white/60 shadow-xl p-8 sm:p-10">
            <div className="text-6xl mb-6">🎉</div>
            <h2 className="text-4xl font-bold text-slate-900 mb-4">All Set!</h2>
            <p className="text-lg text-slate-600 mb-2">Your business is ready to go.</p>
            <p className="text-slate-600 mb-10">You can edit your profile, add more services, and manage your business from the dashboard.</p>

            <button
              onClick={finishOnboarding}
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold text-lg hover:shadow-lg hover:-translate-y-1 active:scale-95 transition-all inline-block"
            >
              Go to Dashboard →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
