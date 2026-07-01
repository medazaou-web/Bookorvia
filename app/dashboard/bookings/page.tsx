"use client";
import { useEffect, useState } from "react";
import supabase from "../../../lib/supabase/browserClient";

export default function DashboardBookings() {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Helper to format time from ISO string
  function formatTime(isoString?: string) {
    if (!isoString) return '—';
    try {
      return new Date(isoString).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '—';
    }
  }

  // Helper to format duration
  function formatDuration(minutes?: number) {
    if (!minutes) return '—';
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const user = (userData as any)?.user ?? null;
      if (!user) {
        setError("You must be logged in to see booking requests.");
        setLoading(false);
        return;
      }

      const { data: biz } = await supabase.from("businesses").select("id").eq("user_id", user.id).single();
      const businessId = (biz as any)?.id ?? null;
      if (!businessId) {
        setRequests([]);
        setLoading(false);
        return;
      }

      const { data, error: reqErr } = await supabase.from("booking_requests").select("id, client_name, client_phone, service, requested_date, requested_time, status, created_at, duration_minutes, starts_at, ends_at").eq("business_id", businessId).order("created_at", { ascending: false });
      if (reqErr) throw reqErr;
      setRequests(data ?? []);
    } catch (e: any) {
      setError(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function updateStatus(id: string, status: string) {
    setRefreshing(true);
    setError(null);
    try {
      const { error: upErr } = await supabase.from("booking_requests").update({ status }).eq("id", id);
      if (upErr) throw upErr;
      await load();
    } catch (e: any) {
      setError(e?.message || String(e));
    } finally {
      setRefreshing(false);
    }
  }

  const totalPages = Math.ceil(requests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedRequests = requests.slice(startIndex, endIndex);

  return (
    <div>
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">Bookings</h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">Manage all booking requests from your customers</p>
      </div>

      {/* Bookings Table / Cards */}
      {loading ? (
        <div className="p-12 text-center text-slate-600 dark:text-slate-400">Loading booking requests…</div>
      ) : error ? (
        <div className="p-6 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 font-medium">⚠️ {error}</div>
      ) : requests.length === 0 ? (
        <div className="rounded-3xl bg-white/80 dark:bg-slate-900/50 backdrop-blur border border-white/60 dark:border-white/10 shadow-lg p-12 text-center">
          <div className="text-5xl mb-4">📅</div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">No booking requests yet</h3>
          <p className="text-slate-600 dark:text-slate-400">When clients scan your QR code and request bookings, they'll appear here</p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden lg:block rounded-3xl bg-white/80 dark:bg-slate-900/50 backdrop-blur border border-white/60 dark:border-white/10 shadow-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                  <th className="px-6 py-4">Client</th>
                  <th className="px-6 py-4">Phone</th>
                  <th className="px-6 py-4">Service</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Time</th>
                  <th className="px-6 py-4">Duration</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700/50">
                {paginatedRequests.map((r) => (
                  <tr key={r.id} className="hover:bg-indigo-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 text-slate-900 dark:text-slate-100 font-semibold">{r.client_name}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400 font-mono">{r.client_phone}</td>
                    <td className="px-6 py-4 text-slate-700 dark:text-slate-300">{r.service}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{r.requested_date}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{r.starts_at ? formatTime(r.starts_at) : r.requested_time}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{formatDuration(r.duration_minutes)}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {r.status !== 'accepted' && (
                          <button 
                            disabled={refreshing} 
                            onClick={() => updateStatus(r.id, 'accepted')} 
                            className="px-3 py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:shadow-lg active:scale-95 disabled:opacity-60 transition-all"
                          >
                            ✓ Accept
                          </button>
                        )}
                        {r.status !== 'refused' && (
                          <button 
                            disabled={refreshing} 
                            onClick={() => updateStatus(r.id, 'refused')} 
                            className="px-3 py-2 rounded-lg bg-red-600 text-white text-xs font-bold hover:shadow-lg active:scale-95 disabled:opacity-60 transition-all"
                          >
                            ✕ Refuse
                          </button>
                        )}
                        {r.status !== 'completed' && (
                          <button 
                            disabled={refreshing} 
                            onClick={() => updateStatus(r.id, 'completed')} 
                            className="px-3 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold hover:shadow-lg active:scale-95 disabled:opacity-60 transition-all"
                          >
                            ✓✓ Complete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden space-y-4">
            {paginatedRequests.map((r) => (
              <div key={r.id} className="rounded-2xl bg-white/80 dark:bg-slate-900/50 backdrop-blur border border-white/60 dark:border-white/10 shadow-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{r.client_name}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 font-mono">{r.client_phone}</p>
                  </div>
                  <StatusBadge status={r.status} />
                </div>

                <div className="grid grid-cols-3 gap-3 mb-6 text-sm">
                  <div>
                    <div className="text-slate-600 dark:text-slate-400 text-xs font-semibold">Service</div>
                    <div className="text-slate-900 dark:text-slate-100 font-semibold mt-1">{r.service}</div>
                  </div>
                  <div>
                    <div className="text-slate-600 dark:text-slate-400 text-xs font-semibold">Date</div>
                    <div className="text-slate-900 dark:text-slate-100 font-semibold mt-1">{r.requested_date}</div>
                  </div>
                  <div>
                    <div className="text-slate-600 dark:text-slate-400 text-xs font-semibold">Time</div>
                    <div className="text-slate-900 dark:text-slate-100 font-semibold mt-1">{r.starts_at ? formatTime(r.starts_at) : r.requested_time}</div>
                  </div>
                  <div>
                    <div className="text-slate-600 dark:text-slate-400 text-xs font-semibold">Duration</div>
                    <div className="text-slate-900 dark:text-slate-100 font-semibold mt-1">{formatDuration(r.duration_minutes)}</div>
                  </div>
                </div>

                <div className="flex gap-2">
                  {r.status !== 'accepted' && (
                    <button 
                      disabled={refreshing} 
                      onClick={() => updateStatus(r.id, 'accepted')} 
                      className="flex-1 px-3 py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:shadow-lg active:scale-95 disabled:opacity-60 transition-all"
                    >
                      Accept
                    </button>
                  )}
                  {r.status !== 'refused' && (
                    <button 
                      disabled={refreshing} 
                      onClick={() => updateStatus(r.id, 'refused')} 
                      className="flex-1 px-3 py-2 rounded-lg bg-red-600 text-white text-xs font-bold hover:shadow-lg active:scale-95 disabled:opacity-60 transition-all"
                    >
                      Refuse
                    </button>
                  )}
                  {r.status !== 'completed' && (
                    <button 
                      disabled={refreshing} 
                      onClick={() => updateStatus(r.id, 'completed')} 
                      className="flex-1 px-3 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold hover:shadow-lg active:scale-95 disabled:opacity-60 transition-all"
                    >
                      Complete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-12 flex items-center justify-center gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
                className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles = {
    pending: 'bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-700',
    accepted: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700',
    completed: 'bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-300 border-blue-300 dark:border-blue-700',
    refused: 'bg-red-100 dark:bg-red-950 text-red-900 dark:text-red-300 border-red-300 dark:border-red-700',
  };
  const style = (styles as any)[status] || 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-300 border-slate-300 dark:border-slate-600';
  const icon = status === 'pending' ? '⏳' : status === 'accepted' ? '✓' : status === 'completed' ? '✓✓' : '✕';
  
  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border ${style}`}>
      {icon} {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
