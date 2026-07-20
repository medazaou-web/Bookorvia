"use client";
import { useEffect, useState, useRef } from "react";
import supabase from "../../../lib/supabase/browserClient";
import { useLanguage } from '@/lib/context/LanguageContext';
import { useTranslations } from '@/lib/i18n';
import { AlertIcon, ClockIcon, UploadCloudIcon, DeleteIcon, SparkIcon, ThemeMoonIcon, ThemeSunIcon, EyeIcon, BusinessIcon, PhoneIcon, WebsiteIcon, SaveIcon, CalendarIcon, ReviewsIcon, RefreshIcon, BellIcon } from "@/components/icons";

export default function DashboardSettings() {
  const { language } = useLanguage();
  const t = useTranslations(language);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [businessId, setBusinessId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [address, setAddress] = useState("");
  const [instagram_url, setInstagramUrl] = useState("");
  const [website_url, setWebsiteUrl] = useState("");
  const [google_review_url, setGoogleReviewUrl] = useState("");
  const [logo_url, setLogoUrl] = useState("");
  const [public_theme, setPublicTheme] = useState("modern_gradient");
  const [brand_color, setBrandColor] = useState("#4f46e5");
  const [accent_color, setAccentColor] = useState("#06b6d4");
  const [cover_image_url, setCoverImageUrl] = useState("");
  
  // Notification preferences
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] = useState(true);
  const [emailBookingNotifications, setEmailBookingNotifications] = useState(true);
  const [emailStatusNotifications, setEmailStatusNotifications] = useState(true);
  const [emailReviewNotifications, setEmailReviewNotifications] = useState(true);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        // Initialize notification preferences first
        try {
          await fetch('/api/init-notification-preferences', { method: 'POST' });
        } catch (err) {
          console.error('Error initializing preferences:', err);
        }

        const { data: userData } = await supabase.auth.getUser();
        const user = (userData as any)?.user ?? null;
        if (!user) {
        setError(t('errors.unauthorized'));
          return;
        }

        setUserId(user.id);

        const { data, error: fetchErr } = await supabase
          .from("businesses")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (fetchErr && fetchErr.code !== "PGRST116") {
          // PGRST116 is 'No rows found' in some setups; continue
        }

        if (data) {
          if (!mounted) return;
          setBusinessId((data as any).id ?? null);
          setName((data as any).name ?? "");
          setSlug((data as any).slug ?? "");
          setCategory((data as any).category ?? "");
          setDescription((data as any).description ?? "");
          setPhone((data as any).phone ?? "");
          setWhatsapp((data as any).whatsapp ?? "");
          setAddress((data as any).address ?? "");
          setInstagramUrl((data as any).instagram_url ?? "");
          setWebsiteUrl((data as any).website_url ?? "");
          setGoogleReviewUrl((data as any).google_review_url ?? "");
          setLogoUrl((data as any).logo_url ?? "");
          setPublicTheme((data as any).public_theme ?? "modern_gradient");
          setBrandColor((data as any).brand_color ?? "#4f46e5");
          setAccentColor((data as any).accent_color ?? "#06b6d4");
          setCoverImageUrl((data as any).cover_image_url ?? "");
        }

        // Load notification preferences from profiles
        const { data: profileData } = await supabase
          .from("profiles")
          .select("email_notifications_enabled, email_booking_notifications, email_status_notifications, email_review_notifications")
          .eq("id", user.id)
          .single();

        if (profileData) {
          setEmailNotificationsEnabled((profileData as any).email_notifications_enabled ?? true);
          setEmailBookingNotifications((profileData as any).email_booking_notifications ?? true);
          setEmailStatusNotifications((profileData as any).email_status_notifications ?? true);
          setEmailReviewNotifications((profileData as any).email_review_notifications ?? true);
        }
      } catch (e: any) {
        setError(e?.message || String(e));
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSaving(true);

    try {
      const { data: userData } = await supabase.auth.getUser();
      const user = (userData as any)?.user ?? null;
      if (!user) {
        setError(t('dashboard.notLoggedInError'));
        setSaving(false);
        return;
      }

      const payload = {
        user_id: user.id,
        name,
        slug,
        category,
        description,
        phone,
        whatsapp,
        address,
        instagram_url,
        website_url,
        google_review_url,
        logo_url,
        public_theme,
        brand_color,
        accent_color,
        cover_image_url,
      } as any;

      // Update notification preferences in profiles
      const { error: profileErr } = await supabase
        .from("profiles")
        .update({
          email_notifications_enabled: emailNotificationsEnabled,
          email_booking_notifications: emailBookingNotifications,
          email_status_notifications: emailStatusNotifications,
          email_review_notifications: emailReviewNotifications,
        })
        .eq("id", user.id);

      if (profileErr) {
        console.error("Error updating notification preferences:", profileErr);
      }

      if (businessId) {
        const { data, error: updateErr } = await supabase
          .from("businesses")
          .update(payload)
          .eq("id", businessId)
          .select()
          .single();

        if (updateErr) {
          throw updateErr;
        }
        setSuccess(t('dashboard.businessProfileUpdated'));
      } else {
        const { data, error: insertErr } = await supabase
          .from("businesses")
          .insert(payload)
          .select()
          .single();

        if (insertErr) {
          throw insertErr;
        }
        setBusinessId((data as any).id ?? null);
        setSuccess(t('dashboard.businessProfileCreated'));
      }
    } catch (e: any) {
      setError(e?.message || String(e));
    } finally {
      setSaving(false);
    }
  }

  async function handleLogoUpload(file: File) {
    setUploadError(null);
    setUploading(true);

    try {
      // Validation
      const maxSizeMB = 5;
      const maxSizeBytes = maxSizeMB * 1024 * 1024;
      const allowedTypes = ["image/png", "image/jpeg", "image/webp"];

      if (!allowedTypes.includes(file.type)) {
        setUploadError(t('dashboard.uploadImageFormatError'));
        setUploading(false);
        return;
      }

      if (file.size > maxSizeBytes) {
        setUploadError(t('dashboard.uploadImageSizeError').replace('{maxSizeMB}', String(maxSizeMB)));
        setUploading(false);
        return;
      }

      if (!businessId || !userId) {
        setUploadError(t('dashboard.businessIdNotFoundError'));
        setUploading(false);
        return;
      }

      // Get file extension
      const ext = file.name.split(".").pop()?.toLowerCase() || "png";

      // Create storage path
      const timestamp = Date.now();
      const storagePath = `${userId}/${businessId}-${timestamp}.${ext}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadErr } = await supabase.storage
        .from("business-logos")
        .upload(storagePath, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadErr) {
        // Log full error for debugging
        console.error("Logo upload error:", uploadErr);
        
        // Check for bucket-related errors
        const errorMsg = uploadErr?.message?.toLowerCase() || "";
        if (errorMsg.includes("bucket") || errorMsg.includes("not found")) {
          throw new Error(t('dashboard.logoStorageNotReadyError'));
        }
        
        throw uploadErr;
      }

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from("business-logos")
        .getPublicUrl(storagePath);

      const publicUrl = publicUrlData?.publicUrl;

      if (!publicUrl) {
        throw new Error(t('dashboard.getPublicUrlError'));
      }

      console.log("Logo uploaded successfully:", { storagePath, publicUrl });

      // Update database with new logo URL
      const { error: updateErr } = await supabase
        .from("businesses")
        .update({ logo_url: publicUrl })
        .eq("id", businessId)
        .eq("user_id", userId);

      if (updateErr) {
        console.error("Database update error:", updateErr);
        throw updateErr;
      }

      // Update local state
      setLogoUrl(publicUrl);
      setUploadError(null);
      setSuccess(t('dashboard.logoUploadedSuccess'));
    } catch (e: any) {
      console.error("Logo upload catch error:", e);
      setUploadError(e?.message || "Failed to upload logo. Please try again.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  async function handleCoverImageUpload(file: File) {
    setUploadError(null);
    setUploading(true);

    try {
      // Validation
      const maxSizeMB = 5;
      const maxSizeBytes = maxSizeMB * 1024 * 1024;
      const allowedTypes = ["image/png", "image/jpeg", "image/webp"];

      if (!allowedTypes.includes(file.type)) {
        setUploadError(t('dashboard.uploadImageFormatError'));
        setUploading(false);
        return;
      }

      if (file.size > maxSizeBytes) {
        setUploadError(t('dashboard.uploadImageSizeError').replace('{maxSizeMB}', String(maxSizeMB)));
        setUploading(false);
        return;
      }

      if (!businessId || !userId) {
        setUploadError(t('dashboard.businessIdNotFoundError'));
        setUploading(false);
        return;
      }

      // Get file extension
      const ext = file.name.split(".").pop()?.toLowerCase() || "png";

      // Create storage path
      const timestamp = Date.now();
      const storagePath = `${userId}/${businessId}-cover-${timestamp}.${ext}`;

      console.log('📤 [Cover Upload] Uploading to:', storagePath);

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadErr } = await supabase.storage
        .from("business-covers")
        .upload(storagePath, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadErr) {
        console.error("❌ Cover image upload error:", uploadErr);
        const errorMsg = uploadErr?.message?.toLowerCase() || "";
        if (errorMsg.includes("bucket") || errorMsg.includes("not found")) {
          // Try to initialize the bucket
          await fetch('/api/services/init-bucket?type=business-covers').catch(() => {});
          setUploadError("Storage bucket was not ready. Please try again in a moment.");
          setUploading(false);
          return;
        }
        throw uploadErr;
      }

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from("business-covers")
        .getPublicUrl(storagePath);

      const publicUrl = publicUrlData?.publicUrl;

      if (!publicUrl) {
        throw new Error(t('dashboard.getPublicUrlError'));
      }

      console.log("✅ Cover image uploaded successfully:", { storagePath, publicUrl });

      // Update database with new cover image URL
      const { error: updateErr } = await supabase
        .from("businesses")
        .update({ cover_image_url: publicUrl })
        .eq("id", businessId)
        .eq("user_id", userId);

      if (updateErr) {
        console.error("❌ Database update error:", updateErr);
        throw updateErr;
      }

      // Update local state
      setCoverImageUrl(publicUrl);
      setUploadError(null);
      setSuccess(t('dashboard.uploadedSuccess'));
    } catch (e: any) {
      console.error("❌ Cover image upload catch error:", e);
      setUploadError(e?.message || "Failed to upload cover image. Please try again.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  async function handleRemoveLogo() {
    setUploadError(null);
    setUploading(true);

    try {
      if (!businessId || !userId) {
        setUploadError("Business ID or User ID not found.");
        setUploading(false);
        return;
      }

      // Update database to remove logo URL
      const { error: updateErr } = await supabase
        .from("businesses")
        .update({ logo_url: null })
        .eq("id", businessId)
        .eq("user_id", userId);

      if (updateErr) {
        throw updateErr;
      }

      // Update local state
      setLogoUrl("");
      setUploadError(null);
      setSuccess(t('dashboard.logoRemovedSuccess'));
    } catch (e: any) {
      setUploadError(e?.message || "Failed to remove logo. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8 sm:mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-2">{t('dashboard.settings')}</h1>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300">{t('dashboard.manageYourBusinessProfile')}</p>
      </div>

      {loading ? (
        <div className="rounded-2xl sm:rounded-3xl bg-white/80 dark:bg-slate-900 backdrop-blur border border-white/60 dark:border-white/10 shadow-lg p-8 sm:p-12 text-center text-sm sm:text-base text-slate-600 dark:text-slate-300">
          {t('common.loading')}
        </div>
      ) : (
        <div className="rounded-2xl sm:rounded-3xl bg-white/80 dark:bg-slate-900 backdrop-blur border border-white/60 dark:border-white/10 shadow-lg p-6 sm:p-8">
          <form onSubmit={handleSave} className="space-y-6 sm:space-y-8">
            {error && (
              <div className="rounded-xl sm:rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-400/20 p-4 sm:p-6 text-xs sm:text-sm text-red-700 dark:text-red-200 font-medium">
                 {error}
              </div>
            )}
            {uploadError && (
              <div className="rounded-xl sm:rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-400/20 p-4 sm:p-6 text-xs sm:text-sm text-red-700 dark:text-red-200 font-medium">
                 {uploadError}
              </div>
            )}
            {success && (
              <div className="rounded-xl sm:rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-400/20 p-4 sm:p-6 text-xs sm:text-sm text-emerald-700 dark:text-emerald-200 font-medium">
                 {success}
              </div>
            )}

            {/* Business Logo Section */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 sm:mb-6 flex items-center gap-2">
                <span>{t('dashboard.logoSettings')}</span>
              </h2>
              <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
                {/* Logo Preview */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-300 mb-2 sm:mb-3">{t('dashboard.currentLogo')}</label>
                  <div className="h-32 sm:h-40 w-32 sm:w-40 rounded-xl sm:rounded-2xl bg-gradient-to-br from-indigo-100 dark:from-indigo-950/40 to-blue-100 dark:to-blue-900/30 flex items-center justify-center border-2 border-indigo-200 dark:border-indigo-400/20 overflow-hidden">
                    {logo_url ? (
                      <img src={logo_url} alt="Business logo" className="h-full w-full object-cover" />
                    ) : (
                      <div className="text-2xl sm:text-3xl font-bold text-indigo-600 dark:text-indigo-400">{name ? name.split(" ").map(s => s[0]).slice(0, 2).join("") : "?"}</div>
                    )}
                  </div>
                </div>

                {/* Logo Upload */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-300 mb-2 sm:mb-3">{t('dashboard.uploadLogo')}</label>
                  <div className="space-y-2 sm:space-y-3">
                    <div
                      className="rounded-lg sm:rounded-xl border-2 border-dashed border-indigo-300 dark:border-indigo-500/30 bg-indigo-50/30 dark:bg-indigo-950/20 p-4 sm:p-6 text-center hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-colors cursor-pointer"
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.currentTarget.classList.add("bg-indigo-50", "border-indigo-500");
                      }}
                      onDragLeave={(e) => {
                        e.currentTarget.classList.remove("bg-indigo-50", "border-indigo-500");
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.currentTarget.classList.remove("bg-indigo-50", "border-indigo-500");
                        const file = e.dataTransfer.files?.[0];
                        if (file) {
                          handleLogoUpload(file);
                        }
                      }}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleLogoUpload(file);
                          }
                        }}
                        disabled={uploading}
                        className="hidden"
                        aria-label="Upload logo"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="w-full text-center px-3 sm:px-4 py-6 sm:py-8 rounded-lg sm:rounded-xl text-indigo-600 dark:text-indigo-400 font-semibold text-xs sm:text-sm hover:text-indigo-700 dark:hover:text-indigo-300 disabled:opacity-60 transition-colors"
                      >
                        {uploading ? (
                          <>
                            <ClockIcon className="h-6 sm:h-8 w-6 sm:w-8 mx-auto mb-2" />
                            <div>{t('dashboard.uploading')}</div>
                          </>
                        ) : (
                          <>
                            <UploadCloudIcon className="h-6 sm:h-8 w-6 sm:w-8 mx-auto mb-2" />
                            <div>{t('dashboard.clickToUploadOrDragDrop')}</div>
                            <div className="text-xs text-indigo-500 dark:text-indigo-400 mt-1">{t('dashboard.pngJpgOrWebpMax5mb')}</div>
                          </>
                        )}
                      </button>
                    </div>

                    {logo_url && (
                      <button
                        type="button"
                        onClick={handleRemoveLogo}
                        disabled={uploading}
                        className="w-full px-3 sm:px-4 py-2 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-400/20 text-xs sm:text-sm text-red-700 dark:text-red-200 font-semibold hover:bg-red-100 dark:hover:bg-red-500/15 disabled:opacity-60 transition-colors"
                      >
                        {uploading ? t('dashboard.removing') : <><DeleteIcon className="h-4 w-4 inline mr-2" /> {t('dashboard.removeLogo')}</> }
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Public Page Design Section */}
            <div className="pt-4 sm:pt-6 border-t border-slate-200 dark:border-white/10">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-4 sm:mb-6 flex items-center gap-2">
                <SparkIcon className="h-5 sm:h-6 w-5 sm:w-6" /> {t('dashboard.publicPageDesign')}
              </h2>
              
              {/* Theme Selector */}
              <div className="mb-6 sm:mb-8">
                <label className="block text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-300 mb-3 sm:mb-4">{t('dashboard.pageTheme')}</label>
                <div className="grid gap-3 sm:gap-4 md:grid-cols-3">
                  {[
                    { value: "luxury_dark", label: t('dashboard.luxuryDark'), icon: "🌙" },
                    { value: "elegant_light", label: t('dashboard.elegantLight'), icon: "☀️" },
                    { value: "modern_gradient", label: t('dashboard.modernGradient'), icon: "" }
                  ].map((theme) => (
                    <button
                      key={theme.value}
                      type="button"
                      onClick={() => setPublicTheme(theme.value)}
                      className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 transition-all text-xs sm:text-sm ${
                        public_theme === theme.value
                          ? "border-indigo-600 dark:border-indigo-400 bg-indigo-50 dark:bg-indigo-500/10"
                          : "border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 hover:border-slate-300 dark:hover:border-white/20"
                      }`}
                    >
                      <div className="text-2xl mb-2">{theme.icon}</div>
                      <div className="font-semibold text-slate-900 dark:text-white">{theme.label}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {theme.value === "luxury_dark" && t('dashboard.darkAndGold')}
                        {theme.value === "elegant_light" && t('dashboard.cleanAndSimple')}
                        {theme.value === "modern_gradient" && t('dashboard.blueAndGradient')}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Customization */}
              <div className="grid gap-4 sm:gap-6 md:grid-cols-2 mb-6 sm:mb-8">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-900 dark:text-white mb-2 sm:mb-3">{t('dashboard.brandColor')}</label>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <input
                      type="color"
                      value={brand_color}
                      onChange={(e) => setBrandColor(e.target.value)}
                      className="w-12 sm:w-16 h-12 sm:h-16 rounded-lg sm:rounded-xl border-2 border-slate-300 dark:border-white/20 cursor-pointer"
                    />
                    <div className="flex-1 min-w-0">
                      <input
                        type="text"
                        value={brand_color}
                        onChange={(e) => setBrandColor(e.target.value)}
                        placeholder="#4f46e5"
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl border border-slate-300 dark:border-white/10 bg-white/50 dark:bg-slate-950/40 text-slate-900 dark:text-slate-100 font-mono text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t('dashboard.usedForButtonsAndAccents')}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-900 dark:text-white mb-2 sm:mb-3">{t('dashboard.accentColor')}</label>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <input
                      type="color"
                      value={accent_color}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="w-12 sm:w-16 h-12 sm:h-16 rounded-lg sm:rounded-xl border-2 border-slate-300 dark:border-white/20 cursor-pointer"
                    />
                    <div className="flex-1 min-w-0">
                      <input
                        type="text"
                        value={accent_color}
                        onChange={(e) => setAccentColor(e.target.value)}
                        placeholder="#06b6d4"
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl border border-slate-300 dark:border-white/10 bg-white/50 dark:bg-slate-950/40 text-slate-900 dark:text-slate-100 font-mono text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t('dashboard.forHighlightsAndSecondaryElements')}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cover Image */}
              <div className="mb-6 sm:mb-8">
                <label className="block text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-300 mb-2 sm:mb-3">{t('dashboard.coverImageUrlOptional')} <span className="text-xs text-slate-500 dark:text-slate-400"></span></label>
                <div className="space-y-3">
                  {/* Upload Option */}
                  <div>
                    <label className="flex flex-col items-center justify-center gap-2 p-4 sm:p-6 rounded-xl border-2 border-dashed border-slate-300 dark:border-white/20 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 cursor-pointer transition-all">
                      <span className="text-2xl">📸</span>
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        {uploading ? t('dashboard.uploadingProcessing') : "Click to upload cover image"}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">or paste a URL below</span>
                      <input 
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleCoverImageUpload(file);
                        }}
                        disabled={uploading}
                        className="hidden"
                      />
                    </label>
                  </div>
                  
                  {/* Or paste URL */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center px-3">
                      <span className="text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-950 px-2">or</span>
                    </div>
                    <div className="border-t border-slate-300 dark:border-white/10"></div>
                  </div>
                  
                  <input
                    type="url"
                    value={cover_image_url}
                    onChange={(e) => setCoverImageUrl(e.target.value)}
                    placeholder="https://example.com/cover-image.jpg"
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl border border-slate-300 dark:border-white/10 bg-white/50 dark:bg-slate-950/40 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">{t('dashboard.appearsAsHeroBackground')}</p>
              </div>

              {/* Preview Card */}
              <div className="bg-gradient-to-br from-slate-50 dark:from-white/5 to-slate-100 dark:to-white/10 rounded-2xl p-6 border border-slate-200 dark:border-white/10">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2"><EyeIcon className="h-4 w-4" /> {t('dashboard.livePreviewTheme').replace('{theme}', public_theme === "luxury_dark" ? t('dashboard.luxuryDark') : public_theme === "elegant_light" ? t('dashboard.elegantLight') : t('dashboard.modernGradient'))}</p>
                <div 
                  className="rounded-xl overflow-hidden h-48"
                  style={{
                    backgroundColor: public_theme === "luxury_dark" ? "#1a1a2e" : public_theme === "elegant_light" ? "#f5f5f5" : "#f0f4ff"
                  }}
                >
                  <div className="h-full flex items-center justify-center flex-col gap-3 p-4">
                    {cover_image_url ? (
                      <img src={cover_image_url} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <>
                        <div className="w-16 h-16 rounded-lg" style={{ backgroundColor: brand_color, opacity: 0.8 }}></div>
                        <div className="text-sm font-bold" style={{ color: public_theme === "luxury_dark" ? "white" : "#1a1a2e" }}>
                        {name || t('dashboard.yourBusiness')}
                      </div>
                      <div className="text-xs" style={{ color: public_theme === "luxury_dark" ? "#cccccc" : "#666666" }}>
                        {category || t('dashboard.categoryLabel')}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Business Basics Section */}
            <div className="pt-4 sm:pt-6 border-t border-slate-200 dark:border-white/10">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-4 sm:mb-6 flex items-center gap-2">
                <BusinessIcon className="h-5 sm:h-6 w-5 sm:w-6" /> {t('dashboard.businessBasics')}
              </h2>
              <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-300 mb-2">{t('dashboard.businessNameLabel')}</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t('dashboard.businessNamePlaceholder')}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl border border-slate-300 dark:border-white/10 bg-white/50 dark:bg-slate-950/40 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-300 mb-2">{t('dashboard.slugLabel')}</label>
                  <input
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder={t('dashboard.slugPlaceholder')}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl border border-slate-300 dark:border-white/10 bg-white/50 dark:bg-slate-950/40 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-300 mb-2">{t('dashboard.categoryLabel')}</label>
                  <input
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder={t('dashboard.categoryPlaceholder')}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl border border-slate-300 dark:border-white/10 bg-white/50 dark:bg-slate-950/40 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-300 mb-2">{t('dashboard.descriptionLabel')}</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={t('dashboard.descriptionPlaceholder')}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl border border-slate-300 dark:border-white/10 bg-white/50 dark:bg-slate-950/40 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                    rows={4}
                  />
                </div>
              </div>
            </div>

            {/* Contact Information Section */}
            <div className="pt-4 sm:pt-6 border-t border-slate-200 dark:border-white/10">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-4 sm:mb-6 flex items-center gap-2">
                <PhoneIcon className="h-5 sm:h-6 w-5 sm:w-6" /> {t('dashboard.contactInformation')}
              </h2>
              <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-300 mb-2">{t('dashboard.phoneLabel')}</label>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={t('dashboard.phonePlaceholder')}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl border border-slate-300 dark:border-white/10 bg-white/50 dark:bg-slate-950/40 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-300 mb-2">{t('dashboard.whatsappLabel')}</label>
                  <input
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder={t('dashboard.whatsappPlaceholder')}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl border border-slate-300 dark:border-white/10 bg-white/50 dark:bg-slate-950/40 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-300 mb-2">{t('dashboard.addressLabel')}</label>
                  <input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder={t('dashboard.addressPlaceholder')}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl border border-slate-300 dark:border-white/10 bg-white/50 dark:bg-slate-950/40 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Online Presence Section */}
            <div className="pt-4 sm:pt-6 border-t border-slate-200 dark:border-white/10">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-4 sm:mb-6 flex items-center gap-2">
                <WebsiteIcon className="h-5 sm:h-6 w-5 sm:w-6" /> {t('dashboard.onlinePresence')}
              </h2>
              <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-300 mb-2">{t('dashboard.websiteLabel')}</label>
                  <input
                    value={website_url}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder={t('dashboard.websitePlaceholder')}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl border border-slate-300 dark:border-white/10 bg-white/50 dark:bg-slate-950/40 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-300 mb-2">{t('dashboard.instagramLabel')}</label>
                  <input
                    value={instagram_url}
                    onChange={(e) => setInstagramUrl(e.target.value)}
                    placeholder={t('dashboard.instagramPlaceholder')}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl border border-slate-300 dark:border-white/10 bg-white/50 dark:bg-slate-950/40 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-300 mb-2">{t('dashboard.googleReviewLinkLabel')}</label>
                  <input
                    value={google_review_url}
                    onChange={(e) => setGoogleReviewUrl(e.target.value)}
                    placeholder={t('dashboard.googleReviewLinkPlaceholder')}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl border border-slate-300 dark:border-white/10 bg-white/50 dark:bg-slate-950/40 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Notification Preferences Section */}
            <div className="pt-4 sm:pt-6 border-t border-slate-200 dark:border-white/10">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-6 sm:mb-8 flex items-center gap-3">
                <BellIcon className="h-6 sm:h-7 w-6 sm:w-7" /> {t('dashboard.emailNotifications')}
              </h2>

              {/* Master Toggle - Separated */}
              <div className="mb-8 p-4 sm:p-5 rounded-xl bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/30 dark:to-blue-900/30 border border-indigo-200 dark:border-indigo-500/30">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-base sm:text-lg text-slate-900 dark:text-white">{t('dashboard.allEmailNotifications')}</p>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1">{t('dashboard.masterControlAllEmailNotifications')}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEmailNotificationsEnabled(!emailNotificationsEnabled)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      emailNotificationsEnabled
                        ? "bg-emerald-500"
                        : "bg-slate-300 dark:bg-slate-600"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        emailNotificationsEnabled ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Individual Notification Types */}
              {emailNotificationsEnabled && (
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center justify-between p-4 sm:p-5 rounded-lg sm:rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 hover:border-indigo-300 dark:hover:border-indigo-500/50 transition-colors">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/40">
                        <CalendarIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm sm:text-base text-slate-900 dark:text-white">{t('dashboard.newBookings')}</p>
                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">{t('dashboard.whenClientsRequestBooking')}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEmailBookingNotifications(!emailBookingNotifications)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        emailBookingNotifications
                          ? "bg-indigo-500"
                          : "bg-slate-300 dark:bg-slate-600"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          emailBookingNotifications ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 sm:p-5 rounded-lg sm:rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 hover:border-emerald-300 dark:hover:border-emerald-500/50 transition-colors">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/40">
                        <RefreshIcon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm sm:text-base text-slate-900 dark:text-white">{t('dashboard.statusUpdates')}</p>
                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">{t('dashboard.whenBookingsAcceptedOrCompleted')}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEmailStatusNotifications(!emailStatusNotifications)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        emailStatusNotifications
                          ? "bg-emerald-500"
                          : "bg-slate-300 dark:bg-slate-600"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          emailStatusNotifications ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 sm:p-5 rounded-lg sm:rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 hover:border-amber-300 dark:hover:border-amber-500/50 transition-colors">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/40">
                        <ReviewsIcon className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm sm:text-base text-slate-900 dark:text-white">{t('dashboard.newReviews')}</p>
                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">{t('dashboard.whenClientsLeaveReviews')}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEmailReviewNotifications(!emailReviewNotifications)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        emailReviewNotifications
                          ? "bg-amber-500"
                          : "bg-slate-300 dark:bg-slate-600"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          emailReviewNotifications ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Save Button */}
            <div className="pt-4 sm:pt-6 border-t border-slate-200 flex gap-2 sm:gap-3">
              <button
                disabled={saving || loading}
                type="submit"
                className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold text-xs sm:text-sm hover:shadow-lg hover:-translate-y-1 active:scale-95 disabled:opacity-60 transition-all"
              >
                {saving ? <><SaveIcon className="h-3 sm:h-4 w-3 sm:w-4 inline mr-2" /> {t('common.saving')}</> : <><SaveIcon className="h-3 sm:h-4 w-3 sm:w-4 inline mr-2" /> {t('common.save')}</>}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

