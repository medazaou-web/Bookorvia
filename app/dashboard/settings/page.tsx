"use client";
import { useEffect, useState, useRef } from "react";
import supabase from "../../../lib/supabase/browserClient";

export default function DashboardSettings() {
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
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const { data: userData } = await supabase.auth.getUser();
        const user = (userData as any)?.user ?? null;
        if (!user) {
          setError("You must be logged in to edit your business profile.");
          setLoading(false);
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
        setError("You must be logged in to save the business profile.");
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
        setSuccess("Business profile updated.");
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
        setSuccess("Business profile created.");
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
        setUploadError("Please upload a PNG, JPG, or WEBP image.");
        setUploading(false);
        return;
      }

      if (file.size > maxSizeBytes) {
        setUploadError(`Please upload an image under ${maxSizeMB}MB.`);
        setUploading(false);
        return;
      }

      if (!businessId || !userId) {
        setUploadError("Business ID or User ID not found. Please refresh and try again.");
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
          throw new Error("Logo storage is not ready yet. Please create the business-logos bucket in Supabase Storage.");
        }
        
        throw uploadErr;
      }

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from("business-logos")
        .getPublicUrl(storagePath);

      const publicUrl = publicUrlData?.publicUrl;

      if (!publicUrl) {
        throw new Error("Could not get public URL for uploaded file.");
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
      setSuccess("Logo uploaded successfully!");
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
      setSuccess("Logo removed successfully!");
    } catch (e: any) {
      setUploadError(e?.message || "Failed to remove logo. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Settings</h1>
        <p className="text-lg text-slate-600">Manage your business profile and preferences</p>
      </div>

      {loading ? (
        <div className="rounded-3xl bg-white/80 backdrop-blur border border-white/60 shadow-lg p-12 text-center text-slate-600">
          Loading your settings…
        </div>
      ) : (
        <div className="rounded-3xl bg-white/80 backdrop-blur border border-white/60 shadow-lg p-8">
          <form onSubmit={handleSave} className="space-y-8">
            {error && (
              <div className="rounded-2xl bg-red-50 border border-red-200 p-6 text-red-700 font-medium">
                ⚠️ {error}
              </div>
            )}
            {uploadError && (
              <div className="rounded-2xl bg-red-50 border border-red-200 p-6 text-red-700 font-medium">
                ⚠️ {uploadError}
              </div>
            )}
            {success && (
              <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-6 text-emerald-700 font-medium">
                ✓ {success}
              </div>
            )}

            {/* Business Logo Section */}
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <span>🎨</span> Business Logo
              </h2>
              <div className="grid gap-6 md:grid-cols-2">
                {/* Logo Preview */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-3">Current Logo</label>
                  <div className="h-40 w-40 rounded-2xl bg-gradient-to-br from-indigo-100 to-blue-100 flex items-center justify-center border-2 border-indigo-200 overflow-hidden">
                    {logo_url ? (
                      <img src={logo_url} alt="Business logo" className="h-full w-full object-cover" />
                    ) : (
                      <div className="text-3xl font-bold text-indigo-600">{name ? name.split(" ").map(s => s[0]).slice(0, 2).join("") : "?"}</div>
                    )}
                  </div>
                </div>

                {/* Logo Upload */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-3">Upload Logo</label>
                  <div className="space-y-3">
                    <div
                      className="rounded-xl border-2 border-dashed border-indigo-300 bg-indigo-50/30 p-6 text-center hover:bg-indigo-50 transition-colors cursor-pointer"
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
                        className="w-full text-center px-4 py-8 rounded-xl text-indigo-600 font-semibold hover:text-indigo-700 disabled:opacity-60 transition-colors"
                      >
                        {uploading ? (
                          <>
                            <div className="text-2xl mb-2">⏳</div>
                            <div>Uploading…</div>
                          </>
                        ) : (
                          <>
                            <div className="text-2xl mb-2">📤</div>
                            <div>Click to upload or drag and drop</div>
                            <div className="text-xs text-indigo-500 mt-1">PNG, JPG, or WEBP (max 5MB)</div>
                          </>
                        )}
                      </button>
                    </div>

                    {logo_url && (
                      <button
                        type="button"
                        onClick={handleRemoveLogo}
                        disabled={uploading}
                        className="w-full px-4 py-2 rounded-lg bg-red-50 border border-red-200 text-red-700 font-semibold hover:bg-red-100 disabled:opacity-60 transition-colors"
                      >
                        {uploading ? "Removing…" : "🗑️ Remove Logo"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Public Page Design Section */}
            <div className="pt-6 border-t border-slate-200">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <span>✨</span> Public Page Design
              </h2>
              
              {/* Theme Selector */}
              <div className="mb-8">
                <label className="block text-sm font-semibold text-slate-900 mb-4">Page Theme</label>
                <div className="grid gap-4 md:grid-cols-3">
                  {[
                    { value: "luxury_dark", label: "Luxury Dark", icon: "🌙" },
                    { value: "elegant_light", label: "Elegant Light", icon: "☀️" },
                    { value: "modern_gradient", label: "Modern Gradient", icon: "🎨" }
                  ].map((theme) => (
                    <button
                      key={theme.value}
                      type="button"
                      onClick={() => setPublicTheme(theme.value)}
                      className={`p-4 rounded-2xl border-2 transition-all ${
                        public_theme === theme.value
                          ? "border-indigo-600 bg-indigo-50"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <div className="text-2xl mb-2">{theme.icon}</div>
                      <div className="font-semibold text-slate-900">{theme.label}</div>
                      <div className="text-xs text-slate-500 mt-1">
                        {theme.value === "luxury_dark" && "Dark & Gold"}
                        {theme.value === "elegant_light" && "Clean & Simple"}
                        {theme.value === "modern_gradient" && "Blue & Gradient"}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Customization */}
              <div className="grid gap-6 md:grid-cols-2 mb-8">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-3">Brand Color</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={brand_color}
                      onChange={(e) => setBrandColor(e.target.value)}
                      className="w-16 h-16 rounded-xl border-2 border-slate-300 cursor-pointer"
                    />
                    <div className="flex-1">
                      <input
                        type="text"
                        value={brand_color}
                        onChange={(e) => setBrandColor(e.target.value)}
                        placeholder="#4f46e5"
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white/50 text-slate-900 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <p className="text-xs text-slate-500 mt-1">Used for buttons & accents</p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-3">Accent Color</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={accent_color}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="w-16 h-16 rounded-xl border-2 border-slate-300 cursor-pointer"
                    />
                    <div className="flex-1">
                      <input
                        type="text"
                        value={accent_color}
                        onChange={(e) => setAccentColor(e.target.value)}
                        placeholder="#06b6d4"
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white/50 text-slate-900 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <p className="text-xs text-slate-500 mt-1">For highlights & secondary elements</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cover Image */}
              <div className="mb-8">
                <label className="block text-sm font-semibold text-slate-900 mb-3">Cover Image URL <span className="text-xs text-slate-500">(optional)</span></label>
                <input
                  type="url"
                  value={cover_image_url}
                  onChange={(e) => setCoverImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white/50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
                <p className="text-xs text-slate-500 mt-2">Appears as hero background image on your public page</p>
              </div>

              {/* Preview Card */}
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-6 border border-slate-200">
                <p className="text-sm font-semibold text-slate-700 mb-4">📱 Live Preview (Theme: {public_theme === "luxury_dark" ? "Luxury Dark" : public_theme === "elegant_light" ? "Elegant Light" : "Modern Gradient"})</p>
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
                          {name || "Your Business"}
                        </div>
                        <div className="text-xs" style={{ color: public_theme === "luxury_dark" ? "#cccccc" : "#666666" }}>
                          {category || "Category"}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Business Basics Section */}
            <div className="pt-6 border-t border-slate-200">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <span>🏢</span> Business Basics
              </h2>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Business Name *</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your business name"
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white/50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Slug *</label>
                  <input
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="yourname (for URL)"
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white/50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Category</label>
                  <input
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g., Salon, Fitness, Consulting"
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white/50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Tell customers about your business..."
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white/50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                    rows={4}
                  />
                </div>
              </div>
            </div>

            {/* Contact Information Section */}
            <div className="pt-6 border-t border-slate-200">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <span>📞</span> Contact Information
              </h2>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Phone</label>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g., +1 (555) 123-4567"
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white/50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">WhatsApp</label>
                  <input
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="e.g., +1 (555) 123-4567"
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white/50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Address</label>
                  <input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Street address"
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white/50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Online Presence Section */}
            <div className="pt-6 border-t border-slate-200">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <span>🌐</span> Online Presence
              </h2>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Website</label>
                  <input
                    value={website_url}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder="https://yourwebsite.com"
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white/50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Instagram</label>
                  <input
                    value={instagram_url}
                    onChange={(e) => setInstagramUrl(e.target.value)}
                    placeholder="https://instagram.com/yourprofile"
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white/50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Google Review Link</label>
                  <input
                    value={google_review_url}
                    onChange={(e) => setGoogleReviewUrl(e.target.value)}
                    placeholder="https://g.page/yourpage"
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white/50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-6 border-t border-slate-200 flex gap-3">
              <button
                disabled={saving || loading}
                type="submit"
                className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold hover:shadow-lg hover:-translate-y-1 active:scale-95 disabled:opacity-60 transition-all"
              >
                {saving ? '💾 Saving…' : '💾 Save Changes'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

