"use client";
import { useEffect, useMemo, useState } from "react";
import supabase from "../../../lib/supabase/browserClient";
import ConfirmDialog from "../../../components/ui/ConfirmDialog";
import { LocationIcon, CheckIcon, LoyaltyCardIcon, AlertIcon, DeleteIcon } from "@/components/icons";
import { useLanguage } from '@/lib/context/LanguageContext';
import { useTranslations } from '@/lib/i18n';

export default function DashboardLoyalty() {
  const { language } = useLanguage();
  const t = useTranslations(language);
  const [loading, setLoading] = useState(true);
  const [allCards, setAllCards] = useState<any[]>([]); // All cards from DB
  const [displayedCards, setDisplayedCards] = useState<any[]>([]); // Cards currently showing
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "active" | "ready" | "used">("all");
  const [loadingMore, setLoadingMore] = useState(false);
  const cardsPerLoad = 20; // Load 20 cards at a time

  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newTarget, setNewTarget] = useState<number>(5);
  const [newReward, setNewReward] = useState<string>("20% off your next visit");

  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [editReward, setEditReward] = useState<string>("");
  const [savingReward, setSavingReward] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Confirmation dialog states
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    cardId: string | null;
  }>({ open: false, cardId: null });
  const [confirmLoading, setConfirmLoading] = useState(false);

  useEffect(() => {
    loadCards();
  }, []);

  async function loadCards() {
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
        setAllCards([]);
        setDisplayedCards([]);
        setLoading(false);
        return;
      }

      // Fetch all cards from DB (now much faster with index!)
      const { data, error: cErr } = await supabase
        .from("loyalty_cards")
        .select("id, client_name, client_phone, stamps, target_stamps, reward, status, created_at")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false });

      if (cErr) throw cErr;
      setAllCards(data ?? []);
      // Show first 20 cards
      setDisplayedCards((data ?? []).slice(0, cardsPerLoad));
    } catch (e: any) {
      setError(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  // Filter the displayed cards
  const filtered = useMemo(() => {
    return displayedCards.filter((c) => {
      // Filter by status
      if (filter === "all") {
        // proceed
      } else if (filter === "active" && c.status !== "active") {
        return false;
      } else if (filter === "ready" && c.status !== "reward_ready") {
        return false;
      } else if (filter === "used" && c.status !== "reward_used") {
        return false;
      }
      
      // Filter by search term (name or phone)
      if (searchTerm.trim()) {
        const search = searchTerm.toLowerCase();
        const nameMatch = (c.client_name || "").toLowerCase().includes(search);
        const phoneMatch = (c.client_phone || "").toLowerCase().includes(search);
        return nameMatch || phoneMatch;
      }
      
      return true;
    });
  }, [displayedCards, filter, searchTerm]);

  // Load more cards
  function loadMore() {
    setLoadingMore(true);
    setTimeout(() => {
      const currentCount = displayedCards.length;
      const newCards = allCards.slice(currentCount, currentCount + cardsPerLoad);
      setDisplayedCards([...displayedCards, ...newCards]);
      setLoadingMore(false);
    }, 300); // Small delay for better UX
  }

  // Check if there are more cards to load
  const hasMore = displayedCards.length < allCards.length;

  async function createCard(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
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
        client_name: newName,
        client_phone: newPhone,
        stamps: 0,
        target_stamps: newTarget,
        reward: newReward,
        status: "active",
      };

      const { error: insErr } = await supabase.from("loyalty_cards").insert(payload);
      if (insErr) {
        // detect Postgres unique violation or duplicate key messages
        const msg = (insErr as any)?.message || "";
        const code = (insErr as any)?.code || (insErr as any)?.status || null;
        const isDuplicate =
          String(code) === "23505" ||
          /unique|duplicate|already exists/i.test(msg) ||
          /duplicate key/i.test(msg);
        if (isDuplicate) {
          throw new Error(t('dashboardUI.loyaltyErrors.clientAlreadyHasCard'));
        }
        throw insErr;
      }
      setNewName("");
      setNewPhone("");
      setNewTarget(5);
      setNewReward("20% off your next visit");
      setShowCreate(false);
      await loadCards();
    } catch (e: any) {
      setError(e?.message || String(e));
    } finally {
      setCreating(false);
    }
  }

  async function addStamp(card: any) {
    try {
      const next = (card.stamps || 0) + 1;
      const status = next >= (card.target_stamps || 5) ? "reward_ready" : "active";
      await supabase.from("loyalty_cards").update({ stamps: next, status }).eq("id", card.id);
      await loadCards();
    } catch (e: any) {
      setError(e?.message || String(e));
    }
  }

  async function removeStamp(card: any) {
    try {
      const next = Math.max(0, (card.stamps || 0) - 1);
      const status = "active";
      await supabase.from("loyalty_cards").update({ stamps: next, status }).eq("id", card.id);
      await loadCards();
    } catch (e: any) {
      setError(e?.message || String(e));
    }
  }

  async function markRewardUsed(card: any) {
    try {
      await supabase.from("loyalty_cards").update({ status: "reward_used" }).eq("id", card.id);
      await loadCards();
    } catch (e: any) {
      setError(e?.message || String(e));
    }
  }

  async function resetCard(card: any) {
    try {
      await supabase.from("loyalty_cards").update({ stamps: 0, status: "active" }).eq("id", card.id);
      await loadCards();
    } catch (e: any) {
      setError(e?.message || String(e));
    }
  }

  async function deleteCard(card: any) {
    setConfirmDialog({ open: true, cardId: card.id });
  }

  async function confirmDeleteCard() {
    if (!confirmDialog.cardId) return;
    setConfirmLoading(true);
    try {
      await supabase.from("loyalty_cards").delete().eq("id", confirmDialog.cardId);
      await loadCards();
      setConfirmDialog({ open: false, cardId: null });
    } catch (e: any) {
      setError(e?.message || String(e));
      setConfirmDialog({ open: false, cardId: null });
    } finally {
      setConfirmLoading(false);
    }
  }

  async function updateReward(cardId: string) {
    if (!editReward.trim()) {
      setError(t('dashboardUI.loyaltyErrors.rewardCannotBeEmpty'));
      return;
    }
    setSavingReward(true);
    setError(null);
    try {
      const { error: updErr } = await supabase
        .from("loyalty_cards")
        .update({ reward: editReward })
        .eq("id", cardId);
      if (updErr) throw updErr;
      setEditingCardId(null);
      setEditReward("");
      await loadCards();
    } catch (e: any) {
      setError(e?.message || String(e));
    } finally {
      setSavingReward(false);
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-12">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">{t('dashboardUI.loyalty')}</h1>
          <p className="text-lg text-slate-600 dark:text-slate-300">{t('dashboardUI.loyaltyDigitalCards')}</p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)} className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold hover:shadow-lg hover:-translate-y-1 transition-all">{t('dashboardUI.loyaltyNewCard')}</button>
      </div>

      {/* Search Bar */}
      <div className="mb-8">
        <input
          type="text"
          placeholder={t('dashboardUI.loyaltySearchPlaceholder')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-5 py-3 rounded-xl border border-slate-300 dark:border-white/10 bg-white/70 dark:bg-white/5 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm"
        />
      </div>

      {/* Create Form Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50 mb-12">
          <div className="w-full max-w-2xl rounded-3xl bg-white/90 dark:bg-slate-900 backdrop-blur border border-white/60 dark:border-white/10 shadow-2xl p-8">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">{t('dashboardUI.loyaltyCreateCard')}</h2>

            <form onSubmit={createCard} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-900 dark:text-slate-300 mb-2">{t('dashboardUI.loyaltyCardForm.clientNameLabel')}</label>
                <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder={t('dashboardUI.loyaltyCardForm.clientNamePlaceholder')} className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-white/10 bg-white/50 dark:bg-white/5 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" required />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 dark:text-slate-300 mb-2">{t('dashboardUI.loyaltyCardForm.phoneNumberLabel')}</label>
                <input value={newPhone} onChange={(e) => setNewPhone(e.target.value)} placeholder={t('dashboardUI.loyaltyCardForm.phoneNumberPlaceholder')} className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-white/10 bg-white/50 dark:bg-white/5 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" required />
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-slate-300 mb-2">{t('dashboardUI.loyaltyCardForm.stampsTargetLabel')}</label>
                  <input type="number" value={newTarget} onChange={(e) => setNewTarget(Number(e.target.value))} placeholder={t('dashboardUI.loyaltyCardForm.stampsTargetPlaceholder')} className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-white/10 bg-white/50 dark:bg-white/5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-slate-300 mb-2">{t('dashboardUI.loyaltyCardForm.rewardDescriptionLabel')}</label>
                  <input value={newReward} onChange={(e) => setNewReward(e.target.value)} placeholder={t('dashboardUI.loyaltyCardForm.rewardDescriptionPlaceholder')} className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-white/10 bg-white/50 dark:bg-white/5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button disabled={creating} type="submit" className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold hover:shadow-lg hover:-translate-y-1 active:scale-95 disabled:opacity-60 transition-all">
                  {creating ? t('dashboardUI.loyaltyCardForm.creatingButton') : t('dashboardUI.loyaltyCardForm.submitButton')}
                </button>
                <button type="button" onClick={() => setShowCreate(false)} className="flex-1 px-6 py-3 rounded-xl border-2 border-slate-300 dark:border-white/10 bg-white dark:bg-white/5 text-slate-700 dark:text-slate-200 font-bold hover:bg-slate-50 dark:hover:bg-white/10 transition-all">
                  {t('dashboardUI.loyaltyCardForm.cancelButton')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-3 mb-12">
        {[
          { value: 'all' as const, label: t('dashboardUI.loyaltyFilterButtons.all'), color: 'from-indigo-600 to-blue-600' },
          { value: 'active' as const, label: t('dashboardUI.loyaltyFilterButtons.active'), color: 'from-emerald-500 to-emerald-600' },
          { value: 'ready' as const, label: t('dashboardUI.loyaltyFilterButtons.rewardReady'), color: 'from-amber-500 to-amber-600' },
          { value: 'used' as const, label: t('dashboardUI.loyaltyFilterButtons.used'), color: 'from-slate-600 to-slate-700' },
        ].map((btn) => (
          <button
            key={btn.value}
            onClick={() => setFilter(btn.value)}
            className={`px-5 py-3 rounded-xl font-bold transition-all ${
              filter === btn.value
                ? `bg-gradient-to-r ${btn.color} text-white shadow-lg hover:-translate-y-1`
                : 'bg-white/80 dark:bg-slate-900 border-2 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:border-indigo-300 dark:hover:border-indigo-500/30 hover:shadow-md'
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Loyalty Cards Grid */}
      {loading ? (
        <div className="rounded-3xl bg-white/80 dark:bg-slate-900 backdrop-blur border border-white/60 dark:border-white/10 shadow-lg p-12 text-center text-slate-600 dark:text-slate-300">
          {t('dashboardUI.loyaltyLoading.loadingCards')}
        </div>
      ) : error ? (
        <div className="rounded-3xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-400/20 shadow-lg p-6 text-red-700 dark:text-red-200 font-medium flex items-center gap-2">
          <AlertIcon className="h-5 w-5" /> {error}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-3xl bg-white/80 dark:bg-slate-900 backdrop-blur border border-white/60 dark:border-white/10 shadow-lg p-12 text-center">
          <div className="text-5xl mb-4"></div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{t('dashboardUI.loyaltyNoCards')}</h3>
          <p className="text-slate-600 dark:text-slate-300">{t('dashboardUI.loyaltyNoCardsHint')}</p>
        </div>
      ) : (
        <div>
          <div className="grid gap-6 md:grid-cols-2">
            {filtered.map((c) => {
              const progress = Math.min(100, (c.stamps / c.target_stamps) * 100);
              const isReady = c.status === 'reward_ready';
              const isUsed = c.status === 'reward_used';

            return (
              <div
                key={c.id}
                className={`rounded-3xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all p-8 border ${
                  isUsed
                    ? 'bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-slate-200 dark:border-white/10'
                    : isReady
                    ? 'bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/40 dark:to-amber-900/30 border-amber-300 dark:border-amber-400/20'
                    : 'bg-gradient-to-br from-indigo-50 to-blue-100 dark:from-indigo-950/40 dark:to-blue-900/30 border-indigo-300 dark:border-indigo-400/20'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                      <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{c.client_name}</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{c.client_phone || t('dashboardUI.loyaltyCardSectionLabels.noPhone')}</p>
                  </div>
                  <div className={`inline-flex items-center px-4 py-2 rounded-full text-xs font-bold text-white ${
                    isUsed ? 'bg-slate-600' : isReady ? 'bg-amber-600' : 'bg-indigo-600'
                  }`}>
                    {isUsed ? t('dashboardUI.loyaltyCardStatuses.used') : isReady ? <><LoyaltyCardIcon className="h-4 w-4" /> {t('dashboardUI.loyaltyCardStatuses.ready')}</> : t('dashboardUI.loyaltyCardStatuses.active')}
                  </div>
                </div>

                {/* Stamps Progress */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t('dashboardUI.loyaltyCardSectionLabels.progress')}</span>
                    <span className={`text-lg font-bold ${isReady ? 'text-amber-700 dark:text-amber-400' : 'text-indigo-700 dark:text-indigo-400'}`}>
                      {c.stamps}/{c.target_stamps}
                    </span>
                  </div>
                  <div className="w-full h-4 bg-white/60 dark:bg-white/20 rounded-full overflow-hidden border border-white/40 dark:border-white/10">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isReady
                          ? 'bg-gradient-to-r from-amber-500 to-amber-600'
                          : 'bg-gradient-to-r from-indigo-500 to-blue-600'
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Reward */}
                <div className="mb-6 p-4 rounded-xl bg-white/60 dark:bg-slate-900/60 border border-white/40 dark:border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2"><LoyaltyCardIcon className="h-5 w-5" /> {t('dashboardUI.loyaltyCardSectionLabels.reward')}</p>
                    {!isUsed && (
                      <button
                        onClick={() => {
                          setEditingCardId(c.id);
                          setEditReward(c.reward);
                        }}
                        className="text-xs px-2 py-1 rounded-md bg-indigo-100 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 font-bold hover:bg-indigo-200 dark:hover:bg-indigo-500/25 transition-all"
                      >
                        {t('dashboardUI.loyaltyCardActions.edit')}
                      </button>
                    )}
                  </div>
                  {editingCardId === c.id ? (
                    <div className="flex flex-col gap-2">
                      <textarea
                        value={editReward}
                        onChange={(e) => setEditReward(e.target.value)}
                        placeholder={t('dashboardUI.loyaltyCardActions.enterRewardDescription')}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-indigo-300 dark:border-indigo-500/30 bg-white dark:bg-slate-950/40 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                        rows={2}
                      />
                      <div className="flex gap-2">
                        <button
                          disabled={savingReward}
                          onClick={() => updateReward(c.id)}
                          className="flex-1 px-3 py-2 text-xs rounded-lg bg-emerald-600 text-white font-bold hover:shadow-md active:scale-95 disabled:opacity-60 transition-all"
                        >
                          {savingReward ? t('dashboardUI.loyaltyCardActions.saving') : t('dashboardUI.loyaltyCardActions.save')}
                        </button>
                        <button
                          onClick={() => setEditingCardId(null)}
                          className="flex-1 px-3 py-2 text-xs rounded-lg bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-300 dark:hover:bg-white/20 transition-all"
                        >
                          {t('dashboardUI.loyaltyCardForm.cancelButton')}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-base font-bold text-slate-900 dark:text-slate-100">{c.reward}</p>
                  )}
                </div>

                {/* Metadata */}
                <div className="text-xs text-slate-600 dark:text-slate-400 mb-6">
                  Created {new Date(c.created_at).toLocaleDateString()}
                </div>

                {/* Actions */}
                <div className="flex gap-2 flex-wrap">
                  {!isUsed && (
                    <>
                      <button
                        onClick={() => addStamp(c)}
                        className="flex-1 px-4 py-2 rounded-lg bg-emerald-600 text-white font-bold hover:shadow-lg active:scale-95 transition-all"
                      >
                        {t('dashboardUI.loyaltyCardActions.addStamp')}
                      </button>
                      {c.stamps > 0 && (
                        <button
                          onClick={() => removeStamp(c)}
                          className="flex-1 px-4 py-2 rounded-lg bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-300 dark:hover:bg-white/20 active:scale-95 transition-all"
                        >
                          {t('dashboardUI.loyaltyCardActions.removeStamp')}
                        </button>
                      )}
                    </>
                  )}
                  
                  {isReady && !isUsed && (
                    <button
                      onClick={() => markRewardUsed(c)}
                      className="flex-1 px-4 py-2 rounded-lg bg-amber-600 text-white font-bold hover:shadow-lg active:scale-95 transition-all"
                    >
                      {t('dashboardUI.loyaltyCardActions.markUsed')}
                    </button>
                  )}

                  {(isReady || c.stamps > 0) && (
                    <button
                      onClick={() => resetCard(c)}
                      className="flex-1 px-4 py-2 rounded-lg bg-slate-300 dark:bg-white/20 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-400 dark:hover:bg-white/30 active:scale-95 transition-all"
                    >
                      {t('dashboardUI.loyaltyCardActions.reset')}
                    </button>
                  )}

                  <button
                    onClick={() => deleteCard(c)}
                    className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white font-bold hover:shadow-lg active:scale-95 transition-all"
                  >
                    <DeleteIcon className="h-4 w-4 inline mr-2" /> {t('dashboardUI.loyaltyCardActions.delete')}
                  </button>
                </div>
              </div>
            );
          })}
          </div>

          {/* Load More Button */}
          {hasMore && (
            <div className="mt-8 sm:mt-12 flex justify-center">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold hover:shadow-lg hover:-translate-y-1 active:scale-95 disabled:opacity-60 transition-all"
              >
                {loadingMore ? t('dashboardUI.loyaltyLoading.loadingMore') : t('dashboardUI.loyaltyLoading.loadMoreButton')}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Confirm Delete Loyalty Card Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        title={t('dashboardUI.loyaltyConfirmDelete.title')}
        description={t('dashboardUI.loyaltyConfirmDelete.description')}
        confirmLabel={t('dashboardUI.loyaltyConfirmDelete.confirmButton')}
        cancelLabel={t('dashboardUI.loyaltyConfirmDelete.cancelButton')}
        variant="danger"
        loading={confirmLoading}
        onConfirm={confirmDeleteCard}
        onCancel={() => setConfirmDialog({ open: false, cardId: null })}
      />
    </div>
  );
}

