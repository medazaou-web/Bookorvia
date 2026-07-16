"use client";
import React, { useEffect, useMemo, useState } from "react";
import supabase from "../../../lib/supabase/browserClient";
import { CheckIcon, SearchIcon, FollowUpMessageIcon, AlertIcon, RefreshIcon, GoogleIcon, LockIcon, CalendarIcon } from "@/components/icons";
import { useLanguage } from '@/lib/context/LanguageContext';
import { useTranslations } from '@/lib/i18n';

export default function DashboardReviews() {
  const { language } = useLanguage();
  const t = useTranslations(language);
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
        setError(t('errors.unauthorized'));
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-8 sm:mb-12">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-2">{t('dashboardUI.reviews')}</h1>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300">{t('dashboardUI.reviewsCustomerFeedback')}</p>
        </div>
        <button onClick={() => loadReviews()} className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-xs sm:text-sm font-bold hover:shadow-lg hover:-translate-y-1 transition-all flex items-center gap-2 whitespace-nowrap"><RefreshIcon className="h-3 sm:h-4 w-3 sm:w-4" /> {t('dashboardUI.reviewsRefreshButton')}</button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:gap-6 md:grid-cols-3 mb-8 sm:mb-12">
        <div className="rounded-2xl sm:rounded-3xl bg-gradient-to-br from-indigo-600 to-indigo-700 text-white shadow-lg p-6 sm:p-8 hover:shadow-xl hover:-translate-y-1 transition-all">
          <div className="text-xs sm:text-sm font-semibold uppercase tracking-wide opacity-90">{t('dashboardUI.reviewsTotalReviews')}</div>
          <div className="text-3xl sm:text-5xl font-bold mt-2 sm:mt-3">{stats.total}</div>
          <div className="text-xs sm:text-sm opacity-75 mt-2">{stats.total === 1 ? t('dashboardUI.reviewsOneReview') : `${stats.total} ${t('common.reviews')}`}</div>
        </div>

        <div className="rounded-2xl sm:rounded-3xl bg-gradient-to-br from-amber-600 to-amber-700 text-white shadow-lg p-6 sm:p-8 hover:shadow-xl hover:-translate-y-1 transition-all">
          <div className="text-xs sm:text-sm font-semibold uppercase tracking-wide opacity-90">{t('dashboardUI.reviewsAverageRating')}</div>
          <div className="text-3xl sm:text-5xl font-bold mt-2 sm:mt-3">{stats.total ? stats.avg.toFixed(1) : '—'}</div>
          <div className="text-xs sm:text-sm opacity-75 mt-2">{stats.total ? renderStars(Math.round(stats.avg)) : t('dashboardUI.reviewsNoRatings')}</div>
        </div>

        <div className="rounded-2xl sm:rounded-3xl bg-gradient-to-br from-emerald-600 to-emerald-700 text-white shadow-lg p-6 sm:p-8 hover:shadow-xl hover:-translate-y-1 transition-all">
          <div className="text-xs sm:text-sm font-semibold uppercase tracking-wide opacity-90">{t('dashboardUI.reviewsGoogleClicks')}</div>
          <div className="text-3xl sm:text-5xl font-bold mt-2 sm:mt-3">{stats.googleClicks}</div>
          <div className="text-xs sm:text-sm opacity-75 mt-2">{t('common.private')}: {stats.privateCount}</div>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2 sm:gap-3 mb-8 sm:mb-12">
        {[
          { value: 'all' as const, label: t('dashboardUI.reviewsFilters.allReviews') },
          { value: 'google' as const, label: <><GoogleIcon className="h-3 sm:h-4 w-3 sm:w-4" /> {t('dashboardUI.reviewsFilters.google')}</> },
          { value: 'private' as const, label: <><LockIcon className="h-3 sm:h-4 w-3 sm:w-4" /> {t('dashboardUI.reviewsFilters.private')}</> },
          { value: 'high' as const, label: `⭐ ${t('dashboardUI.reviewsFilters.highRatings')}` },
          { value: 'low' as const, label: t('dashboardUI.reviewsFilters.lowRatings'), icon: <AlertIcon className="h-3 sm:h-4 w-3 sm:w-4" /> },
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

      {/* Reviews List */}
      {loading ? (
        <div className="rounded-2xl sm:rounded-3xl bg-white/80 dark:bg-slate-900 backdrop-blur border border-white/60 dark:border-white/10 shadow-lg p-8 sm:p-12 text-center text-xs sm:text-base text-slate-600 dark:text-slate-300">
          {t('dashboardUI.reviewsLoadingMessage')}
        </div>
      ) : error ? (
        <div className="rounded-2xl sm:rounded-3xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-400/20 shadow-lg p-4 sm:p-6 text-xs sm:text-sm text-red-700 dark:text-red-200 font-medium">
           {error}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl sm:rounded-3xl bg-white/80 dark:bg-slate-900 backdrop-blur border border-white/60 dark:border-white/10 shadow-lg p-8 sm:p-12 text-center">
          <div className="text-4xl sm:text-5xl mb-4">📭</div>
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-2">{t('dashboardUI.reviewsNoReviews')}</h3>
          <p className="text-xs sm:text-base text-slate-600 dark:text-slate-300">{t('dashboardUI.reviewsNoReviewsHint')}</p>
        </div>
      ) : (
        <div>
          <div className="space-y-3 sm:space-y-4">
            {paginatedReviews.map((r) => (
            <div
              key={r.id}
              className="rounded-xl sm:rounded-2xl bg-white/80 dark:bg-slate-900 backdrop-blur border border-white/60 dark:border-white/10 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all p-4 sm:p-6"
            >
              {/* Review Header */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2 mb-1 sm:mb-2">
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate">{r.client_name || t('dashboardUI.reviewsAnonymous')}</h3>
                    {r.rating && (
                      <div className="flex items-center gap-1 mt-1 sm:mt-0">
                        <span className="text-lg sm:text-2xl">{renderStars(r.rating)}</span>
                        <span className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">({r.rating}/5)</span>
                      </div>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 truncate">{r.client_phone || t('dashboardUI.reviewsNoPhone')}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <div className={`inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-bold ${r.type === 'google_redirect' ? 'bg-sky-100 dark:bg-sky-500/15 text-sky-900 dark:text-sky-200 border border-sky-200 dark:border-sky-400/20' : 'bg-purple-100 dark:bg-purple-500/15 text-purple-900 dark:text-purple-200 border border-purple-200 dark:border-purple-400/20'}`}>
                    {r.type === 'google_redirect' ? <><SearchIcon className="h-3 sm:h-4 w-3 sm:w-4" /> <span className="hidden sm:inline">Google</span></> : <><FollowUpMessageIcon className="h-3 sm:h-4 w-3 sm:w-4" /> <span className="hidden sm:inline">Private</span></>}
                  </div>
                  {r.type === 'google_redirect' && (
                    <div className={`inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-bold ${r.google_clicked ? 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-900 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-400/20' : 'bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10'}`}>
                      {r.google_clicked ? <><CheckIcon className="h-3 sm:h-4 w-3 sm:w-4" /> <span className="hidden sm:inline">{t('dashboardUI.reviewsBadges.clicked')}</span></> : <><span className="hidden sm:inline">{t('dashboardUI.reviewsBadges.pending')}</span></>}
                    </div>
                  )}
                </div>
              </div>

              {/* Review Comment */}
              {r.comment && (
                <div className="mb-3 sm:mb-4 p-3 sm:p-4 rounded-lg sm:rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                  <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200">{r.comment}</p>
                </div>
              )}

              {/* Timestamp */}
              <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <CalendarIcon className="h-3 sm:h-4 w-3 sm:w-4" /> {new Date(r.created_at).toLocaleString()}
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
                ← Prev
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
                Next →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}