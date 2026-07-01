"use client";
import { useEffect, useState, useRef } from "react";
import supabase from "../../../lib/supabase/browserClient";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const currentUser = (userData as any)?.user ?? null;

      if (!currentUser) {
        router.push("/login");
        return;
      }

      setUser(currentUser);
      setEmail(currentUser.email || "");

      const { data: prof } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", currentUser.id)
        .single();

      if (prof) {
        setProfile(prof);
        setFullName(prof.full_name || "");
        setAvatarUrl(prof.avatar_url || "");
        if (prof.avatar_url) {
          setAvatarPreview(prof.avatar_url);
        }
      } else {
        setProfile(null);
        setFullName("");
      }
    } catch (e: any) {
      console.error("Failed to load profile:", e);
      setMessage({ type: "error", text: "Failed to load profile" });
    } finally {
      setLoading(false);
    }
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: "error", text: "File size must be less than 5MB" });
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setMessage({ type: "error", text: "File must be an image" });
      return;
    }

    setAvatarFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  async function handleSave() {
    if (!user) return;

    setSaving(true);
    setMessage(null);

    try {
      let newAvatarUrl = avatarUrl;

      // Upload avatar if changed
      if (avatarFile) {
        const timestamp = Date.now();
        const fileName = `avatar-${timestamp}.png`;
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(filePath, avatarFile, { upsert: true });

        if (uploadError) {
          throw new Error(`Avatar upload failed: ${uploadError.message}`);
        }

        // Get public URL
        const { data } = supabase.storage
          .from("avatars")
          .getPublicUrl(filePath);

        newAvatarUrl = data.publicUrl;
      }

      // Create or update profile
      if (profile) {
        const { error } = await supabase
          .from("profiles")
          .update({
            full_name: fullName,
            avatar_url: newAvatarUrl,
            updated_at: new Date().toISOString(),
          })
          .eq("id", user.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("profiles")
          .insert({
            id: user.id,
            full_name: fullName,
            avatar_url: newAvatarUrl,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

        if (error) throw error;
      }

      setAvatarUrl(newAvatarUrl);
      setAvatarFile(null);
      setMessage({ type: "success", text: "Profile updated successfully!" });

      // Reload profile
      setTimeout(() => {
        loadProfile();
      }, 500);
    } catch (e: any) {
      console.error("Failed to save profile:", e);
      setMessage({
        type: "error",
        text: e.message || "Failed to save profile",
      });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
          <p className="text-slate-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Profile Settings</h1>
        <p className="text-slate-600">Manage your account information and profile picture</p>
      </div>

      {/* Messages */}
      {message && (
        <div
          className={`mb-6 p-4 rounded-xl border ${
            message.type === "success"
              ? "bg-emerald-50 border-emerald-200/60 text-emerald-800"
              : "bg-red-50 border-red-200/60 text-red-800"
          }`}
        >
          {message.type === "success" ? "✓" : "✕"} {message.text}
        </div>
      )}

      {/* Profile Card */}
      <div className="rounded-3xl bg-white/70 backdrop-blur border border-slate-200/60 p-8 max-w-2xl">
        <div className="space-y-8">
          {/* Avatar Section */}
          <div>
            <label className="block text-sm font-bold text-slate-900 mb-4">
              Profile Picture
            </label>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              {/* Avatar Preview */}
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-400 to-blue-400 flex items-center justify-center text-white font-bold text-2xl flex-shrink-0 overflow-hidden border-4 border-white shadow-lg">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Avatar preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>
                    {fullName
                      ? fullName
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)
                      : email[0].toUpperCase()}
                  </span>
                )}
              </div>

              {/* Upload Button */}
              <div className="flex-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 active:scale-[0.98] transition-all duration-200"
                >
                  Upload Photo
                </button>

                <p className="text-xs text-slate-600 mt-2">
                  JPG, PNG or GIF (max. 5MB)
                </p>

                {avatarFile && (
                  <p className="text-sm text-indigo-600 font-medium mt-2">
                    ✓ {avatarFile.name} selected
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-slate-200/40" />

          {/* Full Name */}
          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
              className="w-full px-4 py-3 rounded-xl border border-slate-200/60 bg-white/50 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>

          {/* Email (Read-only) */}
          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              disabled
              className="w-full px-4 py-3 rounded-xl border border-slate-200/60 bg-slate-50 text-slate-600 cursor-not-allowed"
            />
            <p className="text-xs text-slate-600 mt-2">
              Contact support to change your email
            </p>
          </div>

          {/* Save Button */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                <>✓ Save Changes</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
