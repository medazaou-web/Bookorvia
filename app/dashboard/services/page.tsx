"use client";
import { useEffect, useState } from "react";
import supabase from "../../../lib/supabase/browserClient";

interface Service {
  id: string;
  name: string;
  description?: string | null;
  price?: number | null;
  currency?: string | null;
  duration_minutes?: number | null;
  is_active?: boolean;
  created_at?: string;
}

export default function DashboardServices() {
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<Service[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [currency, setCurrency] = useState("MAD");
  const [duration, setDuration] = useState<number | "">(30);
  const [is_active, setIs_active] = useState(true);

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
        setError("You must be logged in to manage services.");
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

  const { data, error: srvErr } = await supabase.from("services").select("id, name, description, price, currency, duration_minutes, is_active, created_at").eq("business_id", businessId).order("created_at", { ascending: false });
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
    setName(""); setDescription(""); setPrice(""); setCurrency("MAD"); setDuration(30); setIs_active(true);
    setShowForm(true);
  }

  function openEdit(s: Service) {
    setEditing(s);
    setName(s.name || ""); setDescription(s.description || ""); setPrice(s.price ?? ""); setCurrency(s.currency || "MAD"); setDuration(s.duration_minutes ?? 30); setIs_active(!!s.is_active);
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
    if (!confirm("Delete this service?")) return;
    try {
      const { error } = await supabase.from("services").delete().eq("id", id);
      if (error) throw error;
      await loadServices();
    } catch (e: any) {
      setError(e?.message || String(e));
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

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-12">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Services</h1>
          <p className="text-lg text-slate-600">Manage your service offerings and pricing</p>
        </div>
        <button onClick={openCreate} className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold hover:shadow-lg hover:-translate-y-1 transition-all">+ Add Service</button>
      </div>

      {/* Services List */}
      {loading ? (
        <div className="text-center py-12 text-slate-600">Loading services…</div>
      ) : error ? (
        <div className="p-6 rounded-2xl bg-red-50 border border-red-200 text-red-700 font-medium">⚠️ {error}</div>
      ) : services.length === 0 ? (
        <div className="rounded-3xl bg-white/80 backdrop-blur border border-white/60 shadow-lg p-12 text-center">
          <div className="text-5xl mb-4">🏷️</div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">No services yet</h3>
          <p className="text-slate-600 mb-6">Add your first service to get started</p>
          <button onClick={openCreate} className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:shadow-lg transition-all">Create First Service</button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {services.map((s) => (
            <div key={s.id} className="rounded-3xl bg-white/80 backdrop-blur border border-white/60 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all p-8">
              {/* Service Name & Status Badge */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-900">{s.name}</h3>
                  {s.description && <p className="text-sm text-slate-600 mt-2">{s.description}</p>}
                </div>
                <div className="flex flex-col gap-2 items-end">
                  <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold ${s.is_active ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'bg-slate-100 text-slate-700 border border-slate-300'}`}>
                    {s.is_active ? '✓ Active' : '○ Inactive'}
                  </div>
                  {!s.duration_minutes && s.is_active && (
                    <div className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 whitespace-nowrap">
                      ⚠️ No Duration
                    </div>
                  )}
                </div>
              </div>

              {/* Pricing & Duration */}
              <div className="grid grid-cols-2 gap-4 py-6 border-y border-slate-200 mb-6">
                <div>
                  <div className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">Price</div>
                  <div className="text-2xl font-bold text-indigo-600">
                    {s.price ? `${s.price} ${s.currency || 'MAD'}` : '—'}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">Duration</div>
                  <div className="text-2xl font-bold text-slate-900">
                    {s.duration_minutes ? `${s.duration_minutes} min` : '—'}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {s.duration_minutes 
                      ? '✓ Available for online booking' 
                      : '⚠️ Add duration for online booking'}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button 
                  onClick={() => openEdit(s)} 
                  className="flex-1 px-4 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:shadow-lg active:scale-95 transition-all"
                >
                  ✎ Edit
                </button>
                <button 
                  onClick={() => toggleActive(s)} 
                  className={`flex-1 px-4 py-3 rounded-xl font-bold transition-all ${s.is_active ? 'bg-slate-200 text-slate-700 hover:bg-slate-300' : 'bg-emerald-600 text-white hover:shadow-lg'}`}
                >
                  {s.is_active ? 'Deactivate' : 'Activate'}
                </button>
                <button 
                  onClick={() => removeService(s.id)} 
                  className="flex-1 px-4 py-3 rounded-xl bg-red-600 text-white font-bold hover:shadow-lg active:scale-95 transition-all"
                >
                  🗑 Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Service Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-2xl rounded-3xl bg-white/90 backdrop-blur border border-white/60 shadow-2xl p-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-8">{editing ? 'Edit Service' : 'Add New Service'}</h2>

            <form onSubmit={saveService} className="space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Service Name *</label>
                <input 
                  required
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="e.g., Haircut, Massage, Consultation" 
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white/50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" 
                />
              </div>

              {/* Price & Currency */}
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Price</label>
                  <input 
                    type="number"
                    step="0.01"
                    value={price as any} 
                    onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))} 
                    placeholder="0.00" 
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white/50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Currency</label>
                  <select 
                    value={currency} 
                    onChange={(e) => setCurrency(e.target.value)} 
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white/50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  >
                    <option value="MAD">MAD - Moroccan Dirham</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="USD">USD - US Dollar</option>
                  </select>
                </div>
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Duration (minutes)</label>
                <input 
                  type="number"
                  value={duration as any} 
                  onChange={(e) => setDuration(e.target.value === '' ? '' : Number(e.target.value))} 
                  placeholder="30" 
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white/50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" 
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Description</label>
                <textarea 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  placeholder="Add details about this service..." 
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white/50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none" 
                  rows={4}
                />
              </div>

              {/* Active Checkbox */}
              <label className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors">
                <input 
                  type="checkbox" 
                  checked={is_active} 
                  onChange={(e) => setIs_active(e.target.checked)} 
                  className="w-5 h-5 rounded accent-indigo-600 cursor-pointer"
                />
                <span className="text-sm font-semibold text-slate-900">Service is active and available for booking</span>
              </label>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button 
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold hover:shadow-lg hover:-translate-y-1 active:scale-95 disabled:opacity-60 transition-all"
                >
                  {saving ? 'Saving...' : (editing ? 'Update Service' : 'Create Service')}
                </button>
                <button 
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 px-6 py-3 rounded-xl border-2 border-slate-300 bg-white text-slate-700 font-bold hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}