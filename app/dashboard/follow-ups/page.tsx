"use client";
import { useEffect, useMemo, useState } from "react";
import supabase from "../../../lib/supabase/browserClient";

export default function DashboardFollowUps() {
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "done" | "review" | "come_back" | "custom">("all");
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newType, setNewType] = useState<"review_request" | "come_back" | "birthday" | "custom">("review_request");
  const [newMessage, setNewMessage] = useState("");
  const [newDueDate, setNewDueDate] = useState("");

  useEffect(() => {
    loadTasks();
  }, []);

  async function loadTasks() {
    setLoading(true);
    setError(null);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const user = (userData as any)?.user ?? null;
      if (!user) {
        setError("You must be logged in to view follow-ups.");
        setLoading(false);
        return;
      }

      const { data: biz } = await supabase.from("businesses").select("id").eq("user_id", user.id).single();
      const businessId = (biz as any)?.id ?? null;
      if (!businessId) {
        setTasks([]);
        setLoading(false);
        return;
      }

      const { data, error: tErr } = await supabase
        .from("follow_up_tasks")
        .select("id, client_name, client_phone, type, message, due_date, status, created_at")
        .eq("business_id", businessId)
        .order("due_date", { ascending: true });

      if (tErr) throw tErr;
      setTasks(data ?? []);
    } catch (e: any) {
      setError(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      if (filter === "all") return true;
      if (filter === "pending") return t.status === "pending";
      if (filter === "done") return t.status === "done";
      if (filter === "review") return t.type === "review_request";
      if (filter === "come_back") return t.type === "come_back";
      if (filter === "custom") return t.type === "custom";
      return true;
    });
  }, [tasks, filter]);

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
      await loadTasks();
    } catch (e: any) {
      setError(e?.message || String(e));
    }
  }

  async function markPending(id: any) {
    try {
      await supabase.from("follow_up_tasks").update({ status: "pending" }).eq("id", id);
      await loadTasks();
    } catch (e: any) {
      setError(e?.message || String(e));
    }
  }

  async function removeTask(id: any) {
    if (!confirm("Delete this follow-up task?")) return;
    try {
      await supabase.from("follow_up_tasks").delete().eq("id", id);
      await loadTasks();
    } catch (e: any) {
      setError(e?.message || String(e));
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-12">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Follow-ups</h1>
          <p className="text-lg text-slate-600">Reminders to re-engage your clients</p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)} className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold hover:shadow-lg hover:-translate-y-1 transition-all">+ New Follow-up</button>
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-3 mb-12">
        {[
          { value: 'all' as const, label: '📋 All', color: 'from-indigo-600 to-blue-600' },
          { value: 'pending' as const, label: '⏳ Pending', color: 'from-amber-500 to-amber-600' },
          { value: 'done' as const, label: '✓ Done', color: 'from-emerald-500 to-emerald-600' },
          { value: 'review' as const, label: '⭐ Reviews', color: 'from-sky-500 to-sky-600' },
          { value: 'come_back' as const, label: '🔄 Come Back', color: 'from-purple-500 to-purple-600' },
          { value: 'custom' as const, label: '📝 Custom', color: 'from-slate-600 to-slate-700' },
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

      {/* Create Form Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50 mb-12">
          <div className="w-full max-w-2xl rounded-3xl bg-white/90 backdrop-blur border border-white/60 shadow-2xl p-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-8">Create Follow-up Task</h2>

            <form
              onSubmit={async (e) => {
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
                    type: newType,
                    message: newMessage,
                    due_date: newDueDate || null,
                    status: "pending",
                  };

                  const { error: insErr } = await supabase.from("follow_up_tasks").insert(payload);
                  if (insErr) throw insErr;
                  setNewName("");
                  setNewPhone("");
                  setNewType("review_request");
                  setNewMessage("");
                  setNewDueDate("");
                  setShowCreate(false);
                  await loadTasks();
                } catch (e: any) {
                  setError(e?.message || String(e));
                } finally {
                  setCreating(false);
                }
              }}
              className="space-y-6"
            >
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
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Type</label>
                  <select value={newType} onChange={(e) => setNewType(e.target.value as any)} className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white/50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all">
                    <option value="review_request">⭐ Review Request</option>
                    <option value="come_back">🔄 Come Back</option>
                    <option value="birthday">🎂 Birthday</option>
                    <option value="custom">📝 Custom</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Due Date</label>
                  <input value={newDueDate} onChange={(e) => setNewDueDate(e.target.value)} type="date" className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white/50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Message</label>
                <textarea value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="What should the follow-up message say?" className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white/50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none" rows={4} />
              </div>

              <div className="flex gap-3 pt-4">
                <button disabled={creating} type="submit" className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold hover:shadow-lg hover:-translate-y-1 active:scale-95 disabled:opacity-60 transition-all">
                  {creating ? 'Creating...' : 'Create Task'}
                </button>
                <button type="button" onClick={() => setShowCreate(false)} className="flex-1 px-6 py-3 rounded-xl border-2 border-slate-300 bg-white text-slate-700 font-bold hover:bg-slate-50 transition-all">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Follow-ups List */}
      {loading ? (
        <div className="rounded-3xl bg-white/80 backdrop-blur border border-white/60 shadow-lg p-12 text-center text-slate-600">
          Loading follow-ups…
        </div>
      ) : error ? (
        <div className="rounded-3xl bg-red-50 border border-red-200 shadow-lg p-6 text-red-700 font-medium">
          ⚠️ {error}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-3xl bg-white/80 backdrop-blur border border-white/60 shadow-lg p-12 text-center">
          <div className="text-5xl mb-4">📭</div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">No follow-ups</h3>
          <p className="text-slate-600">Create follow-up tasks to remind you to reach out to clients</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((t) => {
            const isOverdue = t.due_date && new Date(t.due_date) < new Date();
            const statusColor = t.status === 'done' ? 'emerald' : isOverdue ? 'red' : 'amber';
            
            return (
              <div
                key={t.id}
                className={`rounded-2xl bg-gradient-to-br border shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all p-6 ${
                  t.status === 'done'
                    ? 'from-emerald-50 to-emerald-100/50 border-emerald-200'
                    : isOverdue
                    ? 'from-red-50 to-red-100/50 border-red-200'
                    : 'from-amber-50 to-amber-100/50 border-amber-200'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-bold text-slate-900">{t.client_name || 'Client'}</h3>
                      <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold ${
                        t.status === 'done'
                          ? 'bg-emerald-200 text-emerald-900'
                          : isOverdue
                          ? 'bg-red-200 text-red-900'
                          : 'bg-amber-200 text-amber-900'
                      }`}>
                        {t.status === 'done' ? '✓ Done' : isOverdue ? '⚠ Overdue' : '⏳ Pending'}
                      </div>
                    </div>
                    <p className="text-sm text-slate-600">{t.client_phone || 'No phone'}</p>
                  </div>
                  <div className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold text-white ${
                    t.type === 'review_request' ? 'bg-sky-600' :
                    t.type === 'come_back' ? 'bg-purple-600' :
                    t.type === 'birthday' ? 'bg-pink-600' :
                    'bg-slate-600'
                  }`}>
                    {t.type === 'review_request' ? '⭐ Review' :
                     t.type === 'come_back' ? '🔄 Come Back' :
                     t.type === 'birthday' ? '🎂 Birthday' :
                     '📝 Custom'}
                  </div>
                </div>

                {/* Message & Due Date */}
                {t.message && (
                  <div className="mb-4 p-4 rounded-xl bg-white/60 border border-white/40">
                    <p className="text-slate-800">{t.message}</p>
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="text-sm text-slate-600">
                    📅 {t.due_date ? new Date(t.due_date).toLocaleDateString() : 'No due date'}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 flex-wrap">
                    <button 
                      onClick={() => openWhatsApp(t.client_phone || '', t.message || '')}
                      className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold hover:shadow-lg active:scale-95 transition-all"
                    >
                      💬 WhatsApp
                    </button>
                    {t.status !== 'done' ? (
                      <button 
                        onClick={() => markDone(t.id)}
                        className="px-4 py-2 rounded-xl bg-slate-200 text-slate-700 font-bold hover:bg-slate-300 active:scale-95 transition-all"
                      >
                        ✓ Mark Done
                      </button>
                    ) : (
                      <button 
                        onClick={() => markPending(t.id)}
                        className="px-4 py-2 rounded-xl bg-slate-300 text-slate-700 font-bold hover:bg-slate-400 active:scale-95 transition-all"
                      >
                        ◀ Reopen
                      </button>
                    )}
                    <button 
                      onClick={() => removeTask(t.id)}
                      className="px-4 py-2 rounded-xl bg-red-600 text-white font-bold hover:shadow-lg active:scale-95 transition-all"
                    >
                      🗑 Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

