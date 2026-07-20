"use client";
import { useEffect, useState } from "react";
import supabase from "../../../lib/supabase/browserClient";
import ConfirmDialog from "../../../components/ui/ConfirmDialog";
import { CheckIcon, FollowUpMessageIcon, SearchIcon, GiftIcon, UsersIcon, DeleteIcon } from "@/components/icons";
import { useLanguage } from '@/lib/context/LanguageContext';
import { useTranslations } from '@/lib/i18n';

export default function DashboardClients() {
  const { language } = useLanguage();
  const t = useTranslations(language);
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [adding, setAdding] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newSource, setNewSource] = useState("");

  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [notesDraft, setNotesDraft] = useState("");

  // Confirmation dialog states
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    clientId: string | null;
  }>({ open: false, clientId: null });
  const [confirmLoading, setConfirmLoading] = useState(false);

  useEffect(() => {
    loadClients();
  }, []);

  async function loadClients() {
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
        setClients([]);
        setLoading(false);
        return;
      }

      // fetch all clients for the business and filter client-side for reliable
      // case-insensitive trimmed search across multiple columns
      const { data, error: clientsErr } = await supabase
        .from("clients")
        .select("id, name, phone, source, last_booking_at, last_visit_at, notes, created_at")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false });
      if (clientsErr) throw clientsErr;
      setClients(data ?? []);
    } catch (e: any) {
      setError(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setAdding(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const user = (userData as any)?.user ?? null;
      if (!user) throw new Error("Not authenticated");

      const { data: biz } = await supabase.from("businesses").select("id").eq("user_id", user.id).single();
      const businessId = (biz as any)?.id ?? null;
      if (!businessId) throw new Error("Create a business first in Settings");

      const payload = { business_id: businessId, name: newName, phone: newPhone, source: newSource } as any;
      const { error: insertErr } = await supabase.from("clients").insert(payload);
      if (insertErr) throw insertErr;
      setNewName(""); setNewPhone(""); setNewSource(""); setShowAdd(false);
      await loadClients();
    } catch (e: any) {
      setError(e?.message || String(e));
    } finally {
      setAdding(false);
    }
  }

  async function saveNotes(id: string) {
    try {
      const { error: upErr } = await supabase.from("clients").update({ notes: notesDraft }).eq("id", id);
      if (upErr) throw upErr;
      setEditingNotesId(null);
      setNotesDraft("");
      await loadClients();
    } catch (e: any) {
      setError(e?.message || String(e));
    }
  }

  async function deleteClient(id: string) {
    setConfirmDialog({ open: true, clientId: id });
  }

  async function confirmDeleteClient() {
    if (!confirmDialog.clientId) return;
    setConfirmLoading(true);
    try {
      const { error: delErr } = await supabase.from("clients").delete().eq("id", confirmDialog.clientId);
      if (delErr) throw delErr;
      await loadClients();
      setConfirmDialog({ open: false, clientId: null });
    } catch (e: any) {
      setError(e?.message || String(e));
      setConfirmDialog({ open: false, clientId: null });
    } finally {
      setConfirmLoading(false);
    }
  }

  async function createLoyaltyFromClient(client: any) {
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
        client_name: client.name,
        client_phone: client.phone,
        stamps: 0,
        target_stamps: 5,
        reward: "20% off your next visit",
        status: "active",
      };

      const { error: insErr } = await supabase.from("loyalty_cards").insert(payload);
      if (insErr) {
        const msg = (insErr as any)?.message || "";
        const code = (insErr as any)?.code || (insErr as any)?.status || null;
        const isDuplicate =
          String(code) === "23505" ||
          /unique|duplicate|already exists/i.test(msg) ||
          /duplicate key/i.test(msg);
        if (isDuplicate) {
          setError(t('clientsPageMessages.clientAlreadyHasLoyalty'));
          return;
        }
        throw insErr;
      }

      // success - reload cards in case user checks loyalty page
      await loadClients();
    } catch (e: any) {
      setError(e?.message || String(e));
    }
  }

  function sendWhatsApp(name: string, phone: string) {
    const message = encodeURIComponent(t('clientsPageMessages.whatsappTemplate'));
    const clean = phone.replace(/[^0-9]/g, "");
    window.open(`https://wa.me/${clean}?text=${message}`, "_blank");
  }

  const search = query.toLowerCase().trim();

  const filtered = clients.filter((client) => {
    if (!search) return true;
    const name = (client.name || "").toString().toLowerCase();
    const phone = (client.phone || "").toString().toLowerCase();
    const source = (client.source || "").toString().toLowerCase();
    const notes = (client.notes || "").toString().toLowerCase();
    return (
      name.includes(search) ||
      phone.includes(search) ||
      source.includes(search) ||
      notes.includes(search)
    );
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedClients = filtered.slice(startIndex, endIndex);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [query]);

  return (
    <div>
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">{t('dashboardUI.clients')}</h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">{t('dashboardUI.clientsManageRelationships')}</p>
      </div>

      {/* Search & Actions */}
      <div className="mb-8 flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <input 
            value={query} 
            onChange={(e) => setQuery(e.target.value)} 
            placeholder={t('dashboardUI.clientsSearchPlaceholder')} 
            className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" 
          />
          <div className="absolute right-4 top-3.5 text-slate-400 dark:text-slate-500"><SearchIcon className="h-5 w-5" /></div>
        </div>
        <button onClick={() => loadClients()} className="px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">{t('dashboardUI.clientsRefresh')}</button>
        <button onClick={() => setShowAdd(true)} className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold hover:shadow-lg hover:-translate-y-1 transition-all">{t('dashboardUI.clientsAddClient')}</button>
      </div>

      {/* Clients Table or Empty State */}
      <div className="rounded-3xl bg-white/80 dark:bg-slate-900/50 backdrop-blur border border-white/60 dark:border-white/10 shadow-lg overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-600 dark:text-slate-400">{t('dashboardUI.clientsLoading')}</div>
        ) : error ? (
          <div className="p-6 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 font-medium">⚠️ {error}</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <UsersIcon className="h-12 w-12 mx-auto mb-4 opacity-40" />
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">{t('dashboardUI.clientsNoClients')}</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">{t('dashboardUI.clientsNoClinetsHint')}</p>
            <button onClick={() => setShowAdd(true)} className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:shadow-lg transition-all">{t('dashboardUI.clientsAddFirstClient')}</button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                    <th className="px-6 py-4">{t('dashboardUI.clientsTableHeaders.name')}</th>
                    <th className="px-6 py-4">{t('dashboardUI.clientsTableHeaders.phone')}</th>
                    <th className="px-6 py-4">{t('dashboardUI.clientsTableHeaders.source')}</th>
                    <th className="px-6 py-4">{t('dashboardUI.clientsTableHeaders.lastBooking')}</th>
                    <th className="px-6 py-4">{t('dashboardUI.clientsTableHeaders.lastVisit')}</th>
                    <th className="px-6 py-4">{t('dashboardUI.clientsTableHeaders.notes')}</th>
                    <th className="px-6 py-4 text-right">{t('dashboardUI.clientsTableHeaders.actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {paginatedClients.map((c) => (
                    <tr key={c.id} className="hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20 transition-colors">
                    <td className="px-6 py-4 text-slate-900 dark:text-slate-100 font-semibold">{c.name}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400 font-mono">{c.phone || '-'}</td>
                    <td className="px-6 py-4">
                      {c.source ? <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">{c.source}</span> : <span className="text-slate-400">-</span>}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400 text-sm">{c.last_booking_at ? new Date(c.last_booking_at).toLocaleDateString() : '-'}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400 text-sm">{c.last_visit_at ? new Date(c.last_visit_at).toLocaleDateString() : '-'}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400 max-w-xs truncate">
                      {editingNotesId === c.id ? (
                        <div className="flex gap-2">
                          <textarea value={notesDraft} onChange={(e) => setNotesDraft(e.target.value)} className="flex-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                          <div className="flex gap-2">
                            <button onClick={() => saveNotes(c.id)} className="px-3 py-2 bg-emerald-600 dark:bg-emerald-700 text-white text-xs font-bold rounded-lg hover:shadow-lg dark:hover:bg-emerald-600 transition-all flex items-center gap-2"><CheckIcon className="h-4 w-4" /> {t('dashboardUI.clientsActions.save')}</button>
                            <button onClick={() => setEditingNotesId(null)} className="px-3 py-2 bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-lg hover:shadow-lg transition-all">✕</button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-slate-600 dark:text-slate-400 flex-1 truncate">{c.notes || '-'}</span>
                          <button onClick={() => {setEditingNotesId(c.id); setNotesDraft(c.notes || '');}} className="px-3 py-1 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-500/15 dark:text-indigo-200 dark:border-indigo-400/20 hover:bg-indigo-100 dark:hover:bg-indigo-500/25 transition-colors whitespace-nowrap">{t('dashboardUI.clientsActions.edit')}</button>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 flex-wrap">
                        <button 
                          onClick={() => sendWhatsApp(c.name, c.phone)}
                          title={t('dashboardUI.clientsActions.sendWhatsAppTitle')}
                          className="px-3 py-2 rounded-lg bg-emerald-600 dark:bg-emerald-700 text-white text-xs font-bold hover:shadow-lg dark:hover:bg-emerald-600 active:scale-95 transition-all flex items-center gap-2"
                        >
                          <FollowUpMessageIcon className="h-4 w-4" /> {t('dashboardUI.clientsActions.whatsapp')}
                        </button>
                        <button 
                          onClick={() => createLoyaltyFromClient(c)}
                          title={t('dashboardUI.clientsActions.createLoyaltyTitle')}
                          className="px-3 py-2 rounded-lg bg-amber-600 dark:bg-amber-700 text-white text-xs font-bold hover:shadow-lg dark:hover:bg-amber-600 active:scale-95 transition-all flex items-center gap-1"
                        >
                          <GiftIcon className="h-4 w-4" /> {t('dashboardUI.clientsActions.loyalty')}
                        </button>
                        <button 
                          onClick={() => deleteClient(c.id)}
                          title={t('dashboardUI.clientsActions.deleteClientTitle')}
                          className="px-3 py-2 rounded-lg bg-red-600 dark:bg-red-700 text-white text-xs font-bold hover:shadow-lg hover:bg-red-700 dark:hover:bg-red-600 active:scale-95 transition-all"
                          aria-label={t('dashboardUI.clientsActions.deleteClientTitle')}
                        >
                          <DeleteIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-8 sm:mt-12 flex flex-wrap items-center justify-center gap-1 sm:gap-2 px-3 sm:px-6 py-3 sm:py-4 border-t border-slate-200 dark:border-slate-700 bg-white/30 dark:bg-slate-800/20">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {t('dashboardUI.clientsPagination.previous')}
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
                  {t('dashboardUI.clientsPagination.next')}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add Client Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md rounded-3xl bg-white/90 dark:bg-slate-900/90 backdrop-blur border border-white/60 dark:border-white/10 shadow-2xl p-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">{t('dashboardUI.clientsModal.title')}</h2>
            
            <form onSubmit={handleAdd} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">{t('dashboardUI.clientsModal.fullName')}</label>
                <input 
                  required 
                  value={newName} 
                  onChange={(e) => setNewName(e.target.value)} 
                  placeholder={t('dashboardUI.clientsModal.fullNamePlaceholder')} 
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" 
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">{t('dashboardUI.clientsModal.phone')}</label>
                <input 
                  required 
                  value={newPhone} 
                  onChange={(e) => setNewPhone(e.target.value)} 
                  placeholder={t('dashboardUI.clientsModal.phonePlaceholder')} 
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-white/10 bg-white/50 dark:bg-slate-900/50 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" 
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">{t('dashboardUI.clientsModal.source')}</label>
                <input 
                  value={newSource} 
                  onChange={(e) => setNewSource(e.target.value)} 
                  placeholder={t('dashboardUI.clientsModal.sourcePlaceholder')} 
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-white/10 bg-white/50 dark:bg-slate-900/50 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" 
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="submit"
                  disabled={adding}
                  className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold hover:shadow-lg hover:-translate-y-1 active:scale-95 disabled:opacity-60 transition-all"
                >
                  {adding ? t('dashboardUI.clientsModal.adding') : t('dashboardUI.clientsModal.addButton')}
                </button>
                <button 
                  type="button"
                  onClick={() => setShowAdd(false)}
                  className="flex-1 px-4 py-3 rounded-xl border-2 border-slate-300 bg-white text-slate-700 font-bold hover:bg-slate-50 transition-all"
                >
                  {t('dashboardUI.clientsModal.cancelButton')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Client Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        title={t('dashboardUI.clientsDeleteDialog.title')}
        description={t('dashboardUI.clientsDeleteDialog.description')}
        confirmLabel={t('dashboardUI.clientsDeleteDialog.confirmButton')}
        cancelLabel={t('dashboardUI.clientsDeleteDialog.cancelButton')}
        variant="danger"
        loading={confirmLoading}
        onConfirm={confirmDeleteClient}
        onCancel={() => setConfirmDialog({ open: false, clientId: null })}
      />
    </div>
  );
}
 
