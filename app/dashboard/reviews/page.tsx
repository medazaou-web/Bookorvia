"use client";
import React, { useEffect, useMemo, useState } from "react";
import supabase from "../../../lib/supabase/browserClient";

export default function DashboardReviews() {
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "google" | "private" | "low" | "high">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    loadReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadReviews() {
    setLoading(true);
    setError(null);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const user = (userData as any)?.user ?? null;
      if (!user) {
        setError("You must be logged in to view reviews.");
        setLoading(false);
        return;
      }

      const { data: biz } = await supabase.from("businesses").select("id").eq("user_id", user.id).single();
      const businessId = (biz as any)?.id ?? null;
      if (!businessId) {
        setReviews([]);
        setLoading(false);
        return;
      }

      const { data: revs, error: revErr } = await supabase
        .from("reviews")
        .select("id, client_name, client_phone, rating, type, google_clicked, comment, created_at")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false });

      if (revErr) throw revErr;
      setReviews(revs ?? []);
    } catch (e: any) {
      setError(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  const stats = useMemo(() => {
    const total = reviews.length;
    const avg = total ? reviews.reduce((s, r) => s + (r.rating || 0), 0) / total : 0;
    const googleClicks = reviews.filter((r) => r.type === "google_redirect" && r.google_clicked).length;
    const privateCount = reviews.filter((r) => r.type === "private_feedback").length;
    return { total, avg, googleClicks, privateCount };
  }, [reviews]);

  const filtered = useMemo(() => {
    return reviews.filter((r) => {
      if (filter === "all") return true;
      if (filter === "google") return r.type === "google_redirect";
      if (filter === "private") return r.type === "private_feedback";
      if (filter === "low") return (r.rating ?? 0) <= 3;
      if (filter === "high") return (r.rating ?? 0) >= 4;
      return true;
    });
  }, [reviews, filter]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedReviews = filtered.slice(startIndex, endIndex);

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(i <= rating ? '⭐' : '☆');
    }
    return stars.join('');
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-12">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Reviews</h1>
          <p className="text-lg text-slate-600">Customer feedback and ratings</p>
        </div>
        <button onClick={() => loadReviews()} className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold hover:shadow-lg hover:-translate-y-1 transition-all">🔄 Refresh</button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-3 mb-12">
        <div className="rounded-3xl bg-gradient-to-br from-indigo-600 to-indigo-700 text-white shadow-lg p-8 hover:shadow-xl hover:-translate-y-1 transition-all">
          <div className="text-sm font-semibold uppercase tracking-wide opacity-90">Total Reviews</div>
          <div className="text-5xl font-bold mt-3">{stats.total}</div>
          <div className="text-sm opacity-75 mt-2">{stats.total === 1 ? '1 review' : `${stats.total} reviews`}</div>
        </div>

        <div className="rounded-3xl bg-gradient-to-br from-amber-600 to-amber-700 text-white shadow-lg p-8 hover:shadow-xl hover:-translate-y-1 transition-all">
          <div className="text-sm font-semibold uppercase tracking-wide opacity-90">Average Rating</div>
          <div className="text-5xl font-bold mt-3">{stats.total ? stats.avg.toFixed(1) : '—'}</div>
          <div className="text-sm opacity-75 mt-2">{stats.total ? renderStars(Math.round(stats.avg)) : 'No ratings'}</div>
        </div>

        <div className="rounded-3xl bg-gradient-to-br from-emerald-600 to-emerald-700 text-white shadow-lg p-8 hover:shadow-xl hover:-translate-y-1 transition-all">
          <div className="text-sm font-semibold uppercase tracking-wide opacity-90">Google Clicks</div>
          <div className="text-5xl font-bold mt-3">{stats.googleClicks}</div>
          <div className="text-sm opacity-75 mt-2">Private: {stats.privateCount}</div>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-3 mb-12">
        {[
          { value: 'all' as const, label: 'All Reviews' },
          { value: 'google' as const, label: '🔍 Google' },
          { value: 'private' as const, label: '💬 Private' },
          { value: 'high' as const, label: '⭐ High Ratings' },
          { value: 'low' as const, label: '⚠️ Low Ratings' },
        ].map((btn) => (
          <button
            key={btn.value}
            onClick={() => setFilter(btn.value)}
            className={`px-5 py-3 rounded-xl font-bold transition-all ${
              filter === btn.value
                ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg hover:-translate-y-1'
                : 'bg-white/80 border-2 border-slate-200 text-slate-700 hover:border-indigo-300 hover:shadow-md'
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Reviews List */}
      {loading ? (
        <div className="rounded-3xl bg-white/80 backdrop-blur border border-white/60 shadow-lg p-12 text-center text-slate-600">
          Loading reviews…
        </div>
      ) : error ? (
        <div className="rounded-3xl bg-red-50 border border-red-200 shadow-lg p-6 text-red-700 font-medium">
          ⚠️ {error}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-3xl bg-white/80 backdrop-blur border border-white/60 shadow-lg p-12 text-center">
          <div className="text-5xl mb-4">📭</div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">No reviews yet</h3>
          <p className="text-slate-600">Reviews will appear here as your customers leave feedback</p>
        </div>
      ) : (
        <div>
          <div className="space-y-4">
            {paginatedReviews.map((r) => (
            <div
              key={r.id}
              className="rounded-2xl bg-white/80 backdrop-blur border border-white/60 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all p-6"
            >
              {/* Review Header */}
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-bold text-slate-900">{r.client_name || 'Anonymous'}</h3>
                    {r.rating && (
                      <div className="flex items-center gap-1">
                        <span className="text-2xl">{renderStars(r.rating)}</span>
                        <span className="text-sm font-bold text-slate-700 ml-1">({r.rating}/5)</span>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-slate-500">{r.client_phone || 'No phone'}</p>
                </div>
                <div className="flex gap-2">
                  <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold ${r.type === 'google_redirect' ? 'bg-sky-100 text-sky-900 border border-sky-200' : 'bg-purple-100 text-purple-900 border border-purple-200'}`}>
                    {r.type === 'google_redirect' ? '🔍 Google' : '💬 Private'}
                  </div>
                  {r.type === 'google_redirect' && (
                    <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold ${r.google_clicked ? 'bg-emerald-100 text-emerald-900 border border-emerald-200' : 'bg-slate-100 text-slate-700 border border-slate-200'}`}>
                      {r.google_clicked ? '✓ Clicked' : '○ Pending'}
                    </div>
                  )}
                </div>
              </div>

              {/* Review Comment */}
              {r.comment && (
                <div className="mb-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <p className="text-slate-800">{r.comment}</p>
                </div>
              )}

              {/* Timestamp */}
              <div className="text-xs text-slate-500">
                📅 {new Date(r.created_at).toLocaleString()}
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