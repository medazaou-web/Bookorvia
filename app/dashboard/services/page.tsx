"use client";
import { useEffect, useState } from "react";
import supabase from "../../../lib/supabase/browserClient";
import ConfirmDialog from "../../../components/ui/ConfirmDialog";
import { CheckIcon, EditIcon, DeleteIcon, PlusIcon } from "@/components/icons";
import { useLanguage } from '@/lib/context/LanguageContext';
import { useTranslations } from '@/lib/i18n';

interface Service {
  id: string;
  name: string;
  description?: string | null;
  price?: number | null;
  currency?: string | null;
  duration_minutes?: number | null;
  is_active?: boolean;
  created_at?: string;
  background_image_url?: string | null;
}

export default function DashboardServices() {
  const { language } = useLanguage();
  const t = useTranslations(language);
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<Service[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [saving, setSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [currency, setCurrency] = useState("MAD");
  const [duration, setDuration] = useState<number | "">(30);
  const [is_active, setIs_active] = useState(true);
  const [backgroundImageUrl, setBackgroundImageUrl] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Confirmation dialog states
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    serviceId: string | null;
  }>({ open: false, serviceId: null });
  const [confirmLoading, setConfirmLoading] = useState(false);

  useEffect(() => {
    loadServices();
  }, []);

  async function loadServices() {
    setLoading(true);
    setError(null);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const user = (userData as any)?.user ?? null;
      if (!user) {
        setError(t('errors.unauthorized'));
        setLoading(false);
        return;
      }

      const { data: biz } = await supabase.from("businesses").select("id").eq("user_id", user.id).single();
      const businessId = (biz as any)?.id ?? null;
      if (!businessId) {
        setServices([]);
        setLoading(false);
        return;
      }

  const { data, error: srvErr } = await supabase.from("services").select("id, name, description, price, currency, duration_minutes, is_active, created_at, background_image_url").eq("business_id", businessId).order("created_at", { ascending: false });
      if (srvErr) throw srvErr;
      setServices(data ?? []);
    } catch (e: any) {
      setError(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditing(null);
    setName(""); setDescription(""); setPrice(""); setCurrency("MAD"); setDuration(30); setIs_active(true); setBackgroundImageUrl(null); setFormError(null);
    setShowForm(true);
  }

  function openEdit(s: Service) {
    setEditing(s);
    setName(s.name || ""); setDescription(s.description || ""); setPrice(s.price ?? ""); setCurrency(s.currency || "MAD"); setDuration(s.duration_minutes ?? 30); setIs_active(!!s.is_active); setBackgroundImageUrl(s.background_image_url || null); setFormError(null);
    setShowForm(true);
  }

  async function saveService(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const user = (userData as any)?.user ?? null;
      if (!user) throw new Error("Not authenticated");
      const { data: biz } = await supabase.from("businesses").select("id").eq("user_id", user.id).single();
      const businessId = (biz as any)?.id ?? null;
      if (!businessId) throw new Error("Create a business first in Settings");

      const payload: any = {
        business_id: businessId,
        name,
        description,
        price: price === "" ? null : Number(price),
        currency,
        duration_minutes: duration === "" ? null : Number(duration),
        is_active,
      };

      if (editing) {
        const { error: upErr } = await supabase.from("services").update(payload).eq("id", editing.id);
        if (upErr) throw upErr;
      } else {
        const { error: insErr } = await supabase.from("services").insert(payload);
        if (insErr) throw insErr;
      }

      setShowForm(false);
      await loadServices();
    } catch (e: any) {
      setError(e?.message || String(e));
    } finally {
      setSaving(false);
    }
  }

  async function removeService(id: any) {
    setConfirmDialog({ open: true, serviceId: id });
  }

  async function confirmRemoveService() {
    if (!confirmDialog.serviceId) return;
    setConfirmLoading(true);
    try {
      const { error } = await supabase.from("services").delete().eq("id", confirmDialog.serviceId);
      if (error) throw error;
      await loadServices();
      setConfirmDialog({ open: false, serviceId: null });
    } catch (e: any) {
      setError(e?.message || String(e));
      setConfirmDialog({ open: false, serviceId: null });
    } finally {
      setConfirmLoading(false);
    }
  }

  async function toggleActive(s: Service) {
    try {
      const { error } = await supabase.from("services").update({ is_active: !s.is_active }).eq("id", s.id);
      if (error) throw error;
      await loadServices();
    } catch (e: any) {
      setError(e?.message || String(e));
    }
  }

  // Resize image to square and return as blob
  function resizeImage(file: File, size: number = 500): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext('2d');
            if (!ctx) throw new Error('Failed to get canvas context');

            // Calculate crop dimensions to fit square
            const sourceSize = Math.min(img.width, img.height);
            const sourceX = (img.width - sourceSize) / 2;
            const sourceY = (img.height - sourceSize) / 2;

            // Draw cropped and resized image
            ctx.drawImage(img, sourceX, sourceY, sourceSize, sourceSize, 0, 0, size, size);
            
            canvas.toBlob((blob) => {
              if (blob) resolve(blob);
              else reject(new Error('Failed to resize image'));
            }, 'image/jpeg', 0.85);
          };
          img.onerror = () => reject(new Error('Failed to load image'));
          img.src = e.target?.result as string;
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>, serviceId: string) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setFormError(null);
    try {
      // Get user ID from browser client
      const { data: userData } = await supabase.auth.getUser();
      const user = (userData as any)?.user;
      if (!user) throw new Error("Not authenticated. Please log in again.");

      // Resize image to 500x500 square
      const resizedBlob = await resizeImage(file, 500);
      const resizedFile = new File([resizedBlob], 'service-background.jpg', { type: 'image/jpeg' });
      
      // Upload via server endpoint (uses admin client, bypasses RLS)
      const formData = new FormData();
      formData.append('file', resizedFile);
      formData.append('serviceId', serviceId);
      formData.append('userId', user.id);

      const response = await fetch('/api/services/upload-image', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to upload image');
      }

      const uploadResult = await response.json();
      if (!uploadResult.imageUrl) {
        throw new Error('No image URL returned from server');
      }

      setBackgroundImageUrl(uploadResult.imageUrl);
      setFormError(null);
      e.target.value = '';
    } catch (e: any) {
      console.error('❌ Upload error:', e.message);
      setFormError(e?.message || 'Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  }

  const totalPages = Math.ceil(services.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedServices = services.slice(startIndex, endIndex);

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-12">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">{t('dashboard.services')}</h1>
          <p className="text-lg text-slate-600 dark:text-slate-300">{t('dashboard.manageServices')}</p>
        </div>
        <button onClick={openCreate} className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold hover:shadow-lg hover:-translate-y-1 transition-all">+ {t('dashboard.addService')}</button>
      </div>

      {/* Services List */}
      {loading ? (
        <div className="text-center py-12 text-slate-600 dark:text-slate-300">{t('common.loading')}</div>
      ) : error ? (
        <div className="p-6 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-400/20 text-red-700 dark:text-red-200 font-medium">{error}</div>
      ) : services.length === 0 ? (
        <div className="rounded-3xl bg-white/80 dark:bg-slate-900 backdrop-blur border border-white/60 dark:border-white/10 shadow-lg p-12 text-center">
          <div className="text-5xl mb-4"></div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{t('dashboard.noServices')}</h3>
          <p className="text-slate-600 dark:text-slate-300 mb-6">{t('dashboard.addFirstServiceHint')}</p>
          <button onClick={openCreate} className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:shadow-lg transition-all">{t('dashboard.createFirstService')}</button>
        </div>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2">
            {paginatedServices.map((s) => (
            <div key={s.id} className="rounded-3xl bg-white/80 dark:bg-slate-900 backdrop-blur border border-white/60 dark:border-white/10 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all overflow-hidden">
              {/* Background Image with Fade */}
              {s.background_image_url && (
                <div className="relative h-40 overflow-hidden">
                  <img 
                    src={s.background_image_url} 
                    alt={s.name}
                    className="w-full h-full object-cover"
                  />
                  {/* Fade overlay */}
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/80 dark:to-slate-900/80"></div>
                </div>
              )}

              <div className="p-8">
              {/* Service Name & Status Badge */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">{s.name}</h3>
                  {s.description && <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">{s.description}</p>}
                </div>
                <div className="flex flex-col gap-2 items-end">
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${s.is_active ? 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-900 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-400/20' : 'bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-white/10'}`}>
                    {s.is_active ? <><CheckIcon className="h-4 w-4" /> {t('common.active')}</> : <>{t('common.inactive')}</>}
                  </div>
                  {!s.duration_minutes && s.is_active && (
                    <div className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-500/15 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-400/20 whitespace-nowrap">
                      {t('dashboard.noDuration')}
                    </div>
                  )}
                </div>
              </div>

              {/* Pricing & Duration */}
              <div className="grid grid-cols-2 gap-4 py-6 border-y border-slate-200 dark:border-white/10 mb-6">
                <div>
                  <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1">{t('common.price')}</div>
                  <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                    {s.price ? `${s.price} ${s.currency || 'MAD'}` : '—'}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1">{t('common.duration')}</div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">
                    {s.duration_minutes ? `${s.duration_minutes} ${t('common.minutes')}` : '—'}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {s.duration_minutes 
                      ? t('dashboard.availableForOnlineBooking')
                      : t('dashboard.addDurationForOnlineBooking')}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button 
                  onClick={() => openEdit(s)} 
                  className="flex-1 px-4 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <EditIcon className="h-4 w-4" /> {t('common.edit')}
                </button>
                <button 
                  onClick={() => toggleActive(s)} 
                  className={`flex-1 px-4 py-3 rounded-xl font-bold transition-all ${s.is_active ? 'bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-white/15' : 'bg-emerald-600 text-white hover:shadow-lg'}`}
                >
                  {s.is_active ? t('common.deactivate') : t('common.activate')}
                </button>
                <button 
                  onClick={() => removeService(s.id)} 
                  className="flex-1 px-4 py-3 rounded-xl bg-red-600 text-white font-bold hover:shadow-lg active:scale-95 transition-all"
                >
                  <DeleteIcon className="h-4 w-4 inline mr-2" /> {t('common.delete')}
                </button>
              </div>
              </div>
            </div>
          ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-8 sm:mt-12 flex flex-wrap items-center justify-center gap-1 sm:gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                ← {t('common.previous')}
              </button>
              
              <div className="flex flex-wrap gap-1">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 sm:w-10 h-8 sm:h-10 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                      currentPage === page
                        ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white'
                        : 'border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {t('common.next')} →
              </button>
            </div>
          )}
        </>
      )}

      {/* Service Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50">
          <div className="w-full max-w-2xl max-h-[90vh] rounded-3xl bg-white/90 dark:bg-slate-900 backdrop-blur border border-white/60 dark:border-white/10 shadow-2xl overflow-y-auto">
            <div className="sticky top-0 bg-white/90 dark:bg-slate-900 border-b border-white/60 dark:border-white/10 p-4 sm:p-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">{editing ? t('dashboard.editService') : t('dashboard.addNewService')}</h2>
            </div>

            <div className="p-4 sm:p-8">
              {formError && (
                <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-800 dark:text-red-200">
                  <div className="flex gap-3 items-start">
                    <span className="text-xl">⚠️</span>
                    <div>
                      <p className="font-semibold">{t('dashboard.uploadFailed')}</p>
                      <p className="text-sm mt-1">{formError}</p>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={saveService} className="space-y-4 sm:space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 dark:text-slate-300 mb-2">{t('common.serviceName')} *</label>
                <input 
                  required
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder={t('dashboard.serviceNamePlaceholder')} 
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-white/10 bg-white/50 dark:bg-white/5 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm sm:text-base" 
                />
              </div>

              {/* Price & Currency */}
              <div className="grid sm:grid-cols-2 gap-3 sm:gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-slate-300 mb-2">{t('common.price')}</label>
                  <input 
                    type="number"
                    step="0.01"
                    value={price as any} 
                    onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))} 
                    placeholder="0.00" 
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-white/10 bg-white/50 dark:bg-white/5 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm sm:text-base" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-slate-300 mb-2">{t('common.currency')}</label>
                  <select 
                    value={currency} 
                    onChange={(e) => setCurrency(e.target.value)} 
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-white/10 bg-white/50 dark:bg-white/5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm sm:text-base"
                  >
                    <option value="MAD">MAD - Moroccan Dirham</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="USD">USD - US Dollar</option>
                  </select>
                </div>
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 dark:text-slate-300 mb-2">{t('common.duration')} ({t('common.minutes')})</label>
                <input 
                  type="number"
                  value={duration as any} 
                  onChange={(e) => setDuration(e.target.value === '' ? '' : Number(e.target.value))} 
                  placeholder="30" 
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-white/10 bg-white/50 dark:bg-white/5 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm sm:text-base" 
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 dark:text-slate-300 mb-2">{t('common.description')}</label>
                <textarea 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  placeholder={t('dashboard.serviceDescriptionPlaceholder')} 
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-white/10 bg-white/50 dark:bg-white/5 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none text-sm sm:text-base" 
                  rows={3}
                />
              </div>

              {/* Background Image Upload */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 dark:text-slate-300 mb-2">{t('dashboard.backgroundImage')}</label>
                <div className="space-y-3">
                  {backgroundImageUrl && (
                    <div className="relative rounded-xl overflow-hidden h-24 sm:h-32 bg-slate-100 dark:bg-slate-800">
                      <img 
                        src={backgroundImageUrl} 
                        alt="Background preview"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20"></div>
                      <button
                        type="button"
                        onClick={() => setBackgroundImageUrl(null)}
                        className="absolute top-2 right-2 px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-all"
                      >
                        {t('common.remove')}
                      </button>
                    </div>
                  )}
                  <div className="p-3 sm:p-4 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/30">
                    <p className="text-xs font-semibold text-blue-900 dark:text-blue-200">{t('dashboard.imageWillBeResized')}</p>
                    <p className="text-xs text-blue-800 dark:text-blue-300 mt-1">{t('dashboard.croppedToFitPerfectly')}</p>
                  </div>
                  <label className="flex flex-col items-center justify-center gap-2 p-4 sm:p-6 rounded-xl border-2 border-dashed border-slate-300 dark:border-white/20 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 cursor-pointer transition-all">
                    <span className="text-2xl">📸</span>
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      {uploadingImage ? t('dashboard.uploadingProcessing') : t('dashboard.clickToUploadImage')}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">{t('dashboard.jpgPngOrWebp')}</span>
                    <input 
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(e) => editing && handleImageUpload(e, editing.id)}
                      disabled={uploadingImage || !editing}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Active Checkbox */}
              <label className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 cursor-pointer hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
                <input 
                  type="checkbox" 
                  checked={is_active} 
                  onChange={(e) => setIs_active(e.target.checked)} 
                  className="w-5 h-5 rounded accent-indigo-600 cursor-pointer"
                />
                <span className="text-sm font-semibold text-slate-900 dark:text-slate-300">{t('dashboard.serviceIsActiveAndAvailable')}</span>
              </label>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button 
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold hover:shadow-lg hover:-translate-y-1 active:scale-95 disabled:opacity-60 transition-all text-sm sm:text-base"
                >
                  {saving ? t('common.saving') : (editing ? t('dashboard.updateService') : t('dashboard.createService'))}
                </button>
                <button 
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 px-6 py-3 rounded-xl border-2 border-slate-300 dark:border-white/10 bg-white dark:bg-white/5 text-slate-700 dark:text-slate-200 font-bold hover:bg-slate-50 dark:hover:bg-white/10 transition-all text-sm sm:text-base"
                >
                  {t('common.cancel')}
                </button>
              </div>
            </form>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Service Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        title={t('dashboard.confirmDeleteService')}
        description={t('dashboard.serviceWillNoLongerAppear')}
        confirmLabel={t('dashboard.deleteService')}
        cancelLabel={t('common.cancel')}
        variant="danger"
        loading={confirmLoading}
        onConfirm={confirmRemoveService}
        onCancel={() => setConfirmDialog({ open: false, serviceId: null })}
      />
    </div>
  );
}