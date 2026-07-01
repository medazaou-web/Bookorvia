"use client";
import { useEffect, useMemo, useState } from "react";
import supabase from "../../../lib/supabase/browserClient";

export default function DashboardLoyalty() {
  const [loading, setLoading] = useState(true);
  const [cards, setCards] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "active" | "ready" | "used">("all");

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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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
        setError("You must be logged in to view loyalty cards.");
        setLoading(false);
        return;
      }

      const { data: biz } = await supabase.from("businesses").select("id").eq("user_id", user.id).single();
      const businessId = (biz as any)?.id ?? null;
      if (!businessId) {
        setCards([]);
        setLoading(false);
        return;
      }

      const { data, error: cErr } = await supabase
        .from("loyalty_cards")
        .select("id, client_name, client_phone, stamps, target_stamps, reward, status, created_at")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false });

      if (cErr) throw cErr;
      setCards(data ?? []);
    } catch (e: any) {
      setError(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() => {
    return cards.filter((c) => {
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
  }, [cards, filter, searchTerm]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCards = filtered.slice(startIndex, endIndex);

  // Reset to page 1 when filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, searchTerm]);

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
          throw new Error("This client already has a loyalty card.");
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
    if (!confirm("Delete this loyalty card?")) return;
    try {
      await supabase.from("loyalty_cards").delete().eq("id", card.id);
      await loadCards();
    } catch (e: any) {
      setError(e?.message || String(e));
    }
  }

  async function updateReward(cardId: string) {
    if (!editReward.trim()) {
      setError("Reward cannot be empty");
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
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Loyalty Cards</h1>
          <p className="text-lg text-slate-600">Digital loyalty cards and rewards</p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)} className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold hover:shadow-lg hover:-translate-y-1 transition-all">+ New Card</button>
      </div>

      {/* Search Bar */}
      <div className="mb-8">
        <input
          type="text"
          placeholder="🔍 Search by client name or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-5 py-3 rounded-xl border border-slate-300 bg-white/70 text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm"
        />
      </div>

      {/* Create Form Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50 mb-12">
          <div className="w-full max-w-2xl rounded-3xl bg-white/90 backdrop-blur border border-white/60 shadow-2xl p-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-8">Create Loyalty Card</h2>

            <form onSubmit={createCard} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Client Name *</label>
                <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g., John Smith" className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white/50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" required />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Phone Number *</label>
                <input value={newPhone} onChange={(e) => setNewPhone(e.target.value)} placeholder="e.g., +1 (555) 123-4567" className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white/50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" required />
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Stamps Target</label>
                  <input type="number" value={newTarget} onChange={(e) => setNewTarget(Number(e.target.value))} placeholder="5" className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white/50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Reward Description</label>
                  <input value={newReward} onChange={(e) => setNewReward(e.target.value)} placeholder="e.g., 20% off next visit" className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white/50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button disabled={creating} type="submit" className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold hover:shadow-lg hover:-translate-y-1 active:scale-95 disabled:opacity-60 transition-all">
                  {creating ? 'Creating...' : 'Create Card'}
                </button>
                <button type="button" onClick={() => setShowCreate(false)} className="flex-1 px-6 py-3 rounded-xl border-2 border-slate-300 bg-white text-slate-700 font-bold hover:bg-slate-50 transition-all">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-3 mb-12">
        {[
          { value: 'all' as const, label: '📋 All', color: 'from-indigo-600 to-blue-600' },
          { value: 'active' as const, label: '📍 Active', color: 'from-emerald-500 to-emerald-600' },
          { value: 'ready' as const, label: '🎁 Reward Ready', color: 'from-amber-500 to-amber-600' },
          { value: 'used' as const, label: '✓ Used', color: 'from-slate-600 to-slate-700' },
        ].map((btn) => (
          <button
            key={btn.value}
            onClick={() => setFilter(btn.value)}
            className={`px-5 py-3 rounded-xl font-bold transition-all ${
              filter === btn.value
                ? `bg-gradient-to-r ${btn.color} text-white shadow-lg hover:-translate-y-1`
                : 'bg-white/80 border-2 border-slate-200 text-slate-700 hover:border-indigo-300 hover:shadow-md'
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Loyalty Cards Grid */}
      {loading ? (
        <div className="rounded-3xl bg-white/80 backdrop-blur border border-white/60 shadow-lg p-12 text-center text-slate-600">
          Loading loyalty cards…
        </div>
      ) : error ? (
        <div className="rounded-3xl bg-red-50 border border-red-200 shadow-lg p-6 text-red-700 font-medium">
          ⚠️ {error}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-3xl bg-white/80 backdrop-blur border border-white/60 shadow-lg p-12 text-center">
          <div className="text-5xl mb-4">🎫</div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">No loyalty cards</h3>
          <p className="text-slate-600">Create loyalty cards to reward your repeat customers</p>
        </div>
      ) : (
        <div>
          <div className="grid gap-6 md:grid-cols-2">
            {paginatedCards.map((c) => {
              const progress = Math.min(100, (c.stamps / c.target_stamps) * 100);
              const isReady = c.status === 'reward_ready';
              const isUsed = c.status === 'reward_used';

            return (
              <div
                key={c.id}
                className={`rounded-3xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all p-8 border ${
                  isUsed
                    ? 'bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200'
                    : isReady
                    ? 'bg-gradient-to-br from-amber-50 to-amber-100 border-amber-300'
                    : 'bg-gradient-to-br from-indigo-50 to-blue-100 border-indigo-300'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-slate-900">{c.client_name}</h3>
                    <p className="text-sm text-slate-600 mt-1">{c.client_phone || 'No phone'}</p>
                  </div>
                  <div className={`inline-flex items-center px-4 py-2 rounded-full text-xs font-bold text-white ${
                    isUsed ? 'bg-slate-600' : isReady ? 'bg-amber-600' : 'bg-indigo-600'
                  }`}>
                    {isUsed ? '✓ Used' : isReady ? '🎁 Ready' : '📍 Active'}
                  </div>
                </div>

                {/* Stamps Progress */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-slate-700">Progress</span>
                    <span className={`text-lg font-bold ${isReady ? 'text-amber-700' : 'text-indigo-700'}`}>
                      {c.stamps}/{c.target_stamps}
                    </span>
                  </div>
                  <div className="w-full h-4 bg-white/60 rounded-full overflow-hidden border border-white/40">
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
                <div className="mb-6 p-4 rounded-xl bg-white/60 border border-white/40">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-slate-700">🎁 Reward</p>
                    {!isUsed && (
                      <button
                        onClick={() => {
                          setEditingCardId(c.id);
                          setEditReward(c.reward);
                        }}
                        className="text-xs px-2 py-1 rounded-md bg-indigo-100 text-indigo-700 font-bold hover:bg-indigo-200 transition-all"
                      >
                        ✎ Edit
                      </button>
                    )}
                  </div>
                  {editingCardId === c.id ? (
                    <div className="flex flex-col gap-2">
                      <textarea
                        value={editReward}
                        onChange={(e) => setEditReward(e.target.value)}
                        placeholder="Enter reward description"
                        className="w-full px-3 py-2 text-sm rounded-lg border border-indigo-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                        rows={2}
                      />
                      <div className="flex gap-2">
                        <button
                          disabled={savingReward}
                          onClick={() => updateReward(c.id)}
                          className="flex-1 px-3 py-2 text-xs rounded-lg bg-emerald-600 text-white font-bold hover:shadow-md active:scale-95 disabled:opacity-60 transition-all"
                        >
                          {savingReward ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          onClick={() => setEditingCardId(null)}
                          className="flex-1 px-3 py-2 text-xs rounded-lg bg-slate-200 text-slate-700 font-bold hover:bg-slate-300 transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-base font-bold text-slate-900">{c.reward}</p>
                  )}
                </div>

                {/* Metadata */}
                <div className="text-xs text-slate-600 mb-6">
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
                        + Stamp
                      </button>
                      {c.stamps > 0 && (
                        <button
                          onClick={() => removeStamp(c)}
                          className="flex-1 px-4 py-2 rounded-lg bg-slate-200 text-slate-700 font-bold hover:bg-slate-300 active:scale-95 transition-all"
                        >
                          − Remove
                        </button>
                      )}
                    </>
                  )}
                  
                  {isReady && !isUsed && (
                    <button
                      onClick={() => markRewardUsed(c)}
                      className="flex-1 px-4 py-2 rounded-lg bg-amber-600 text-white font-bold hover:shadow-lg active:scale-95 transition-all"
                    >
                      ✓ Mark Used
                    </button>
                  )}

                  {(isReady || c.stamps > 0) && (
                    <button
                      onClick={() => resetCard(c)}
                      className="flex-1 px-4 py-2 rounded-lg bg-slate-300 text-slate-700 font-bold hover:bg-slate-400 active:scale-95 transition-all"
                    >
                      ↻ Reset
                    </button>
                  )}

                  <button
                    onClick={() => deleteCard(c)}
                    className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white font-bold hover:shadow-lg active:scale-95 transition-all"
                  >
                    🗑 Delete
                  </button>
                </div>
              </div>
            );
          })}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-12 flex items-center justify-center gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 font-semibold hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                ← Previous
              </button>
              
              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-10 h-10 rounded-lg font-semibold transition-all ${
                      currentPage === page
                        ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white'
                        : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 font-semibold hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Next →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

