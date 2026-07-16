"use client";
import { useEffect, useMemo, useState } from "react";
import supabase from "../../../lib/supabase/browserClient";
import ConfirmDialog from "../../../components/ui/ConfirmDialog";
import { CheckIcon, AlertIcon, ClockIcon, FollowUpMessageIcon, SettingsIcon, CalendarIcon, DeleteIcon, EditIcon, BookingIcon } from "@/components/icons";
import { useLanguage } from '@/lib/context/LanguageContext';
import { useTranslations } from '@/lib/i18n';

interface FollowUpType {
  id: string;
  business_id: string;
  name: string;
  color: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

interface FollowUpTask {
  id: string;
  client_name: string;
  client_phone: string;
  type: string;
  message: string;
  due_date: string | null;
  status: "pending" | "done";
  created_at: string;
}

const DEFAULT_TYPES = [
  { name: "Review request", color: "indigo" },
  { name: "Rebooking reminder", color: "emerald" },
  { name: "Loyalty reward", color: "amber" },
  { name: "Custom follow-up", color: "slate" },
];

const COLOR_PALETTE = {
  indigo: {
    light: "bg-indigo-50 text-indigo-700 border-indigo-200",
    dark: "dark:bg-indigo-500/15 dark:text-indigo-200 dark:border-indigo-400/20",
  },
  emerald: {
    light: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dark: "dark:bg-emerald-500/15 dark:text-emerald-200 dark:border-emerald-400/20",
  },
  amber: {
    light: "bg-amber-50 text-amber-700 border-amber-200",
    dark: "dark:bg-amber-500/15 dark:text-amber-200 dark:border-amber-400/20",
  },
  rose: {
    light: "bg-rose-50 text-rose-700 border-rose-200",
    dark: "dark:bg-rose-500/15 dark:text-rose-200 dark:border-rose-400/20",
  },
  slate: {
    light: "bg-slate-100 text-slate-700 border-slate-200",
    dark: "dark:bg-white/10 dark:text-slate-300 dark:border-white/10",
  },
};

export default function DashboardFollowUps() {
  const { language } = useLanguage();
  const t = useTranslations(language);
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<FollowUpTask[]>([]);
  const [followUpTypes, setFollowUpTypes] = useState<FollowUpType[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "done">("all");
  const [showCreate, setShowCreate] = useState(false);
  const [showManageTypes, setShowManageTypes] = useState(false);
  const [creating, setCreating] = useState(false);
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Form states
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newType, setNewType] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [newDueDate, setNewDueDate] = useState("");

  // Manage types states
  const [newTypeName, setNewTypeName] = useState("");
  const [newTypeColor, setNewTypeColor] = useState("indigo");
  const [editingTypeId, setEditingTypeId] = useState<string | null>(null);
  const [editingTypeName, setEditingTypeName] = useState("");
  const [editingTypeColor, setEditingTypeColor] = useState("indigo");
  const [managingError, setManagingError] = useState<string | null>(null);

  // Confirmation dialog states
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    type: "delete-task" | "delete-type" | null;
    itemId: string | null;
  }>({ open: false, type: null, itemId: null });
  const [confirmLoading, setConfirmLoading] = useState(false);

  useEffect(() => {
    initializeData();
  }, []);

  async function initializeData() {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const user = (userData as any)?.user ?? null;
      if (!user) {
        setError("You must be logged in to view follow-ups.");
        setLoading(false);
        return;
      }
      setUserId(user.id);

      const { data: biz } = await supabase
        .from("businesses")
        .select("id")
        .eq("user_id", user.id)
        .single();
      
      const bid = (biz as any)?.id ?? null;
      if (!bid) {
        setTasks([]);
        setLoading(false);
        return;
      }
      setBusinessId(bid);

      await ensureDefaultTypes(bid);
      await loadFollowUpTypes(bid);
      await loadTasks(bid);
    } catch (e: any) {
      setError(e?.message || String(e));
      setLoading(false);
    }
  }

  async function ensureDefaultTypes(bid: string) {
    try {
      const { data: existing } = await supabase
        .from("follow_up_types")
        .select("id")
        .eq("business_id", bid);

      if (!existing || existing.length === 0) {
        const defaultInserts = DEFAULT_TYPES.map((t, idx) => ({
          business_id: bid,
          name: t.name,
          color: t.color,
          is_active: true,
          sort_order: idx,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }));

        await supabase.from("follow_up_types").insert(defaultInserts);
      }
    } catch (e) {
      console.error("Error ensuring default types:", e);
    }
  }

  async function loadFollowUpTypes(bid: string) {
    try {
      const { data, error: err } = await supabase
        .from("follow_up_types")
        .select("*")
        .eq("business_id", bid)
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (err) throw err;
      setFollowUpTypes(data || []);
      if ((data || []).length > 0 && !newType) {
        setNewType(data![0].name);
      }
    } catch (e: any) {
      setError(e?.message || String(e));
    }
  }

  async function loadTasks(bid: string) {
    try {
      const { data, error: tErr } = await supabase
        .from("follow_up_tasks")
        .select("id, client_name, client_phone, type, message, due_date, status, created_at")
        .eq("business_id", bid)
        .order("due_date", { ascending: true });

      if (tErr) throw tErr;
      setTasks(data || []);
      setLoading(false);
    } catch (e: any) {
      setError(e?.message || String(e));
      setLoading(false);
    }
  }

  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      if (filter === "all") return true;
      if (filter === "pending") return t.status === "pending";
      if (filter === "done") return t.status === "done";
      return true;
    });
  }, [tasks, filter]);

  function getTypeBadgeClasses(typeName: string): string {
    const typeObj = followUpTypes.find((t) => t.name === typeName);
    if (!typeObj) {
      return `${COLOR_PALETTE.slate.light} ${COLOR_PALETTE.slate.dark}`;
    }
    const color = typeObj.color as keyof typeof COLOR_PALETTE;
    const palette = COLOR_PALETTE[color] || COLOR_PALETTE.slate;
    return `${palette.light} ${palette.dark}`;
  }

  function getTypeDisplayName(typeName: string): string {
    const typeObj = followUpTypes.find((t) => t.name === typeName);
    if (typeObj) return typeObj.name;
    
    // Handle legacy type names
    const legacyMap: Record<string, string> = {
      review_request: "Review request",
      come_back: "Rebooking reminder",
      birthday: "Birthday",
      custom: "Custom follow-up",
    };
    return legacyMap[typeName] || typeName;
  }

  function cleanPhone(phone: string) {
    return phone.replace(/[+\s\-()]/g, "");
  }

  function openWhatsApp(phone: string, message: string) {
    const cleaned = cleanPhone(phone);
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${cleaned}?text=${encoded}`, "_blank");
  }

  async function markDone(id: any) {
    try {
      await supabase.from("follow_up_tasks").update({ status: "done" }).eq("id", id);
      if (businessId) await loadTasks(businessId);
    } catch (e: any) {
      setError(e?.message || String(e));
    }
  }

  async function markPending(id: any) {
    try {
      await supabase.from("follow_up_tasks").update({ status: "pending" }).eq("id", id);
      if (businessId) await loadTasks(businessId);
    } catch (e: any) {
      setError(e?.message || String(e));
    }
  }

  async function removeTask(id: any) {
    setConfirmDialog({ open: true, type: "delete-task", itemId: id });
  }

  async function confirmRemoveTask() {
    if (!confirmDialog.itemId) return;
    setConfirmLoading(true);
    try {
      await supabase.from("follow_up_tasks").delete().eq("id", confirmDialog.itemId);
      if (businessId) await loadTasks(businessId);
      setConfirmDialog({ open: false, type: null, itemId: null });
    } catch (e: any) {
      setError(e?.message || String(e));
      setConfirmDialog({ open: false, type: null, itemId: null });
    } finally {
      setConfirmLoading(false);
    }
  }

  async function createTask(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!businessId) return;
    setCreating(true);
    setError(null);
    try {
      if (!newName || !newPhone || !newType) {
        throw new Error("Name, phone, and type are required");
      }

      const payload: any = {
        business_id: businessId,
        client_name: newName,
        client_phone: newPhone,
        type: newType,
        message: newMessage,
        due_date: newDueDate || null,
        status: "pending",
      };

      const { error: insErr } = await supabase.from("follow_up_tasks").insert(payload);
      if (insErr) throw insErr;
      setNewName("");
      setNewPhone("");
      setNewType(followUpTypes[0]?.name || "");
      setNewMessage("");
      setNewDueDate("");
      setShowCreate(false);
      await loadTasks(businessId);
    } catch (e: any) {
      setError(e?.message || String(e));
    } finally {
      setCreating(false);
    }
  }

  async function addFollowUpType() {
    if (!businessId || !newTypeName.trim()) {
      setManagingError("Type name is required");
      return;
    }

    try {
      const maxSort = followUpTypes.length > 0 
        ? Math.max(...followUpTypes.map((t) => t.sort_order)) 
        : 0;

      const { error: err } = await supabase.from("follow_up_types").insert({
        business_id: businessId,
        name: newTypeName,
        color: newTypeColor,
        is_active: true,
        sort_order: maxSort + 1,
      });

      if (err) throw err;
      setNewTypeName("");
      setNewTypeColor("indigo");
      await loadFollowUpTypes(businessId);
    } catch (e: any) {
      setManagingError(e?.message || String(e));
    }
  }

  async function updateFollowUpType() {
    if (!businessId || !editingTypeId || !editingTypeName.trim()) {
      setManagingError("Type name is required");
      return;
    }

    try {
      const { error: err } = await supabase
        .from("follow_up_types")
        .update({
          name: editingTypeName,
          color: editingTypeColor,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editingTypeId);

      if (err) throw err;
      setEditingTypeId(null);
      setEditingTypeName("");
      setEditingTypeColor("indigo");
      await loadFollowUpTypes(businessId);
    } catch (e: any) {
      setManagingError(e?.message || String(e));
    }
  }

  async function deleteFollowUpType(typeId: string) {
    setConfirmDialog({ open: true, type: "delete-type", itemId: typeId });
  }

  async function confirmDeleteFollowUpType() {
    if (!businessId || !confirmDialog.itemId) return;
    setConfirmLoading(true);
    try {
      const { error: err } = await supabase
        .from("follow_up_types")
        .update({ is_active: false })
        .eq("id", confirmDialog.itemId);

      if (err) throw err;
      await loadFollowUpTypes(businessId);
      setNewType(followUpTypes.find((t) => t.id !== confirmDialog.itemId)?.name || "");
      setConfirmDialog({ open: false, type: null, itemId: null });
    } catch (e: any) {
      setManagingError(e?.message || String(e));
      setConfirmDialog({ open: false, type: null, itemId: null });
    } finally {
      setConfirmLoading(false);
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-12">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">{t('dashboard.followUps')}</h1>
          <p className="text-lg text-slate-600 dark:text-slate-300">{t('dashboard.manageFollowUps')}</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button 
            onClick={() => setShowManageTypes(true)}
            className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl bg-white dark:bg-white/10 border border-slate-300 dark:border-white/10 text-xs sm:text-sm text-slate-700 dark:text-slate-200 font-bold hover:bg-slate-50 dark:hover:bg-white/15 transition-all flex items-center gap-2 whitespace-nowrap"
          >
            <SettingsIcon className="h-3 sm:h-4 w-3 sm:w-4" /> {t('dashboard.manageFollowUpTypes')}
          </button>
          <button 
            onClick={() => setShowCreate(!showCreate)} 
            className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-xs sm:text-sm text-white font-bold hover:shadow-lg hover:-translate-y-1 transition-all whitespace-nowrap"
          >
            {t('dashboard.newFollowUp')}
          </button>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2 sm:gap-3 mb-8 sm:mb-12">
        {[
          { value: 'all' as const, label: <><BookingIcon className="h-3 sm:h-4 w-3 sm:w-4" /> {t('common.all')}</> },
          { value: 'pending' as const, label: t('common.pending') },
          { value: 'done' as const, label: t('common.done') },
        ].map((btn) => (
          <button
            key={btn.value}
            onClick={() => setFilter(btn.value)}
            className={`px-3 sm:px-5 py-2 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1 sm:gap-2 whitespace-nowrap ${
              filter === btn.value
                ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg hover:-translate-y-1'
                : 'bg-white/80 dark:bg-white/5 border-2 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:border-indigo-300 dark:hover:border-indigo-500/30 hover:shadow-md'
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Create Form Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50 mb-12">
          <div className="w-full max-w-2xl rounded-3xl bg-white dark:bg-slate-900 backdrop-blur border border-white/60 dark:border-white/10 shadow-2xl p-8">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">{t('dashboard.createFollowUpTask')}</h2>

            <form onSubmit={createTask} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-900 dark:text-slate-300 mb-2">{t('dashboard.clientName')} *</label>
                <input 
                  value={newName} 
                  onChange={(e) => setNewName(e.target.value)} 
                  placeholder="e.g., John Smith" 
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-slate-950/70 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" 
                  required 
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 dark:text-slate-300 mb-2">{t('dashboard.phoneNumber')} *</label>
                <input 
                  value={newPhone} 
                  onChange={(e) => setNewPhone(e.target.value)} 
                  placeholder="e.g., +1 (555) 123-4567" 
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-slate-950/70 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" 
                  required 
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-slate-300 mb-2">{t('common.type')} *</label>
                  <select 
                    value={newType} 
                    onChange={(e) => setNewType(e.target.value)} 
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-slate-950/70 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" 
                    required
                  >
                    <option value="">{t('dashboard.selectAType')}</option>
                    {followUpTypes.map((t) => (
                      <option key={t.id} value={t.name}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-slate-300 mb-2">{t('dashboard.dueDate')}</label>
                  <input 
                    value={newDueDate} 
                    onChange={(e) => setNewDueDate(e.target.value)} 
                    type="date" 
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-slate-950/70 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 dark:text-slate-300 mb-2">{t('dashboard.message')}</label>
                <textarea 
                  value={newMessage} 
                  onChange={(e) => setNewMessage(e.target.value)} 
                  placeholder="What should the follow-up message say?" 
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-slate-950/70 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none" 
                  rows={4} 
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  disabled={creating} 
                  type="submit" 
                  className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold hover:shadow-lg hover:-translate-y-1 active:scale-95 disabled:opacity-60 transition-all"
                >
                  {creating ? t('dashboard.creating') : t('dashboard.createTask')}
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowCreate(false)} 
                  className="flex-1 px-6 py-3 rounded-xl border-2 border-slate-300 dark:border-white/10 bg-white dark:bg-white/5 text-slate-700 dark:text-slate-200 font-bold hover:bg-slate-50 dark:hover:bg-white/10 transition-all"
                >
                  {t('common.cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manage Types Modal */}
      {showManageTypes && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-2xl rounded-3xl bg-white dark:bg-slate-900 backdrop-blur border border-white/60 dark:border-white/10 shadow-2xl p-8">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">{t('dashboard.followUpTypes')}</h2>

            {managingError && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-400/20 text-red-700 dark:text-red-200">
                {managingError}
              </div>
            )}

            {/* Existing Types List */}
            <div className="mb-8 space-y-3 max-h-72 overflow-y-auto">
              {followUpTypes.map((followUpType) => (
                <div 
                  key={followUpType.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-white dark:bg-slate-950/50 border border-slate-200 dark:border-white/10"
                >
                  {editingTypeId === followUpType.id ? (
                    <>
                      <input
                        value={editingTypeName}
                        onChange={(e) => setEditingTypeName(e.target.value)}
                        className="flex-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder={t('dashboard.typeName')}
                      />
                      <select
                        value={editingTypeColor}
                        onChange={(e) => setEditingTypeColor(e.target.value)}
                        className="ml-3 px-3 py-2 rounded-lg border border-slate-300 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        {Object.keys(COLOR_PALETTE).map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                      <div className="flex gap-2 ml-3">
                        <button
                          onClick={updateFollowUpType}
                          className="px-3 py-2 rounded-lg bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-all text-sm"
                        >
                          ✓ {t('common.save')}
                        </button>
                        <button
                          onClick={() => setEditingTypeId(null)}
                          className="px-3 py-2 rounded-lg bg-slate-300 dark:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold hover:bg-slate-400 dark:hover:bg-slate-700 transition-all text-sm"
                        >
                          ✕ {t('common.cancel')}
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex-1">
                        <span className="font-semibold text-slate-900 dark:text-white">{followUpType.name}</span>
                        <span className="ml-3 text-sm text-slate-600 dark:text-slate-400">Color: {followUpType.color}</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingTypeId(followUpType.id);
                            setEditingTypeName(followUpType.name);
                            setEditingTypeColor(followUpType.color);
                          }}
                          className="px-3 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold hover:bg-slate-300 dark:hover:bg-slate-600 transition-all text-sm"
                        >
                          <EditIcon className="h-4 w-4 inline mr-1" /> {t('common.edit')}
                        </button>
                        <button
                          onClick={() => deleteFollowUpType(followUpType.id)}
                          className="px-3 py-2 rounded-lg bg-red-600 text-white font-bold hover:bg-red-700 transition-all text-sm"
                        >
                          <DeleteIcon className="h-4 w-4 inline mr-1" /> {t('common.delete')}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>

            {/* Add New Type */}
            <div className="mb-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/10">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-4">{t('dashboard.addNewType')}</h3>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  value={newTypeName}
                  onChange={(e) => setNewTypeName(e.target.value)}
                  placeholder={t('dashboard.typeName')}
                  className="flex-1 px-4 py-3 rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <select
                  value={newTypeColor}
                  onChange={(e) => setNewTypeColor(e.target.value)}
                  className="px-4 py-3 rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {Object.keys(COLOR_PALETTE).map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <button
                  onClick={addFollowUpType}
                  className="px-6 py-3 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-all"
                >
                  + {t('common.add')}
                </button>
              </div>
            </div>

            <button
              onClick={() => setShowManageTypes(false)}
              className="w-full px-6 py-3 rounded-xl border-2 border-slate-300 dark:border-white/10 bg-white dark:bg-white/5 text-slate-700 dark:text-slate-200 font-bold hover:bg-slate-50 dark:hover:bg-white/10 transition-all"
            >
              {t('common.close')}
            </button>
          </div>
        </div>
      )}

      {/* Follow-ups List */}
      {loading ? (
        <div className="rounded-3xl bg-white dark:bg-slate-900 backdrop-blur border border-white/60 dark:border-white/10 shadow-lg p-12 text-center text-slate-600 dark:text-slate-300">
          {t('dashboard.loadingFollowUps')}
        </div>
      ) : error ? (
        <div className="rounded-3xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-400/20 shadow-lg p-6 text-red-700 dark:text-red-200 font-medium">
          ⚠️ {error}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-3xl bg-white dark:bg-slate-900 backdrop-blur border border-white/60 dark:border-white/10 shadow-lg p-12 text-center">
          <div className="text-5xl mb-4">📭</div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{t('dashboard.noFollowUps')}</h3>
          <p className="text-slate-600 dark:text-slate-300">{t('dashboard.noFollowUpsDescription')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((task) => {
            const isOverdue = task.due_date && new Date(task.due_date) < new Date();
            
            return (
              <div
                key={task.id}
                className={`rounded-2xl bg-gradient-to-br border shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all p-6 ${
                  task.status === 'done'
                    ? 'from-emerald-50 to-emerald-100/50 dark:from-emerald-950/40 dark:to-emerald-900/30 border-emerald-200 dark:border-emerald-400/20'
                    : isOverdue
                    ? 'from-red-50 to-red-100/50 dark:from-red-950/40 dark:to-red-900/30 border-red-200 dark:border-red-400/20'
                    : 'from-amber-50 to-amber-100/50 dark:from-amber-950/40 dark:to-amber-900/30 border-amber-200 dark:border-amber-400/20'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">{task.client_name || t('common.client')}</h3>
                      <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold ${
                        task.status === 'done'
                          ? 'bg-emerald-200 dark:bg-emerald-500/15 text-emerald-900 dark:text-emerald-200'
                          : isOverdue
                          ? 'bg-red-200 dark:bg-red-500/15 text-red-900 dark:text-red-200'
                          : 'bg-amber-200 dark:bg-amber-500/15 text-amber-900 dark:text-amber-200'
                      }`}>
                        {task.status === 'done' ? <><CheckIcon className="h-4 w-4" /> {t('common.done')}</> : isOverdue ? <><AlertIcon className="h-4 w-4" /> {t('dashboard.overdue')}</> : <><ClockIcon className="h-4 w-4" /> {t('common.pending')}</>}
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{task.client_phone || t('dashboard.noPhone')}</p>
                  </div>
                  <div className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold border ${getTypeBadgeClasses(task.type)}`}>
                    {getTypeDisplayName(task.type)}
                  </div>
                </div>

                {/* Message & Due Date */}
                {task.message && (
                  <div className="mb-4 p-4 rounded-xl bg-white/60 dark:bg-slate-900/60 border border-white/40 dark:border-white/10">
                    <p className="text-slate-800 dark:text-slate-200">{task.message}</p>
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-1">
                    <CalendarIcon className="h-4 w-4" />
                    {task.due_date ? new Date(task.due_date).toLocaleDateString() : t('dashboard.noDueDate')}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 flex-wrap">
                    <button 
                      onClick={() => openWhatsApp(task.client_phone || '', task.message || '')}
                      className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold hover:shadow-lg active:scale-95 transition-all"
                    >
                       {t('dashboard.whatsApp')}
                    </button>
                    {task.status !== 'done' ? (
                      <button 
                        onClick={() => markDone(task.id)}
                        className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold hover:bg-slate-300 dark:hover:bg-slate-600 active:scale-95 transition-all"
                      >
                        {t('dashboard.markDone')}
                      </button>
                    ) : (
                      <button 
                        onClick={() => markPending(task.id)}
                        className="px-4 py-2 rounded-xl bg-slate-300 dark:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold hover:bg-slate-400 dark:hover:bg-slate-700 active:scale-95 transition-all"
                      >
                        {t('dashboard.reopen')}
                      </button>
                    )}
                    <button 
                      onClick={() => removeTask(task.id)}
                      className="px-4 py-2 rounded-xl bg-red-600 text-white font-bold hover:shadow-lg active:scale-95 transition-all"
                    >
                      <DeleteIcon className="h-4 w-4 inline mr-2" /> {t('common.delete')}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirm Delete Task Dialog */}
      <ConfirmDialog
        open={confirmDialog.open && confirmDialog.type === "delete-task"}
        title={t('dashboard.confirmDeleteFollowUpTask')}
        description={t('dashboard.followUpTaskWillBeRemoved')}
        confirmLabel={t('dashboard.deleteTask')}
        cancelLabel={t('common.cancel')}
        variant="danger"
        loading={confirmLoading}
        onConfirm={confirmRemoveTask}
        onCancel={() => setConfirmDialog({ open: false, type: null, itemId: null })}
      />

      {/* Confirm Delete Type Dialog */}
      <ConfirmDialog
        open={confirmDialog.open && confirmDialog.type === "delete-type"}
        title={t('dashboard.confirmDeleteFollowUpType')}
        description={t('dashboard.followUpTypeWillBeRemoved')}
        confirmLabel={t('dashboard.deleteType')}
        cancelLabel={t('common.cancel')}
        variant="danger"
        loading={confirmLoading}
        onConfirm={confirmDeleteFollowUpType}
        onCancel={() => setConfirmDialog({ open: false, type: null, itemId: null })}
      />
    </div>
  );
}
