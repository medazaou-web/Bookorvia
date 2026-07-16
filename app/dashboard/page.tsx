"use client";
import Sidebar from "./Sidebar";
import NewBookingModal from "./NewBookingModal";
import { ChevronRightIcon, ClockIcon, UsersIcon, CalendarIcon, StarIcon, MessageIcon } from "@/components/icons";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/context/LanguageContext";
import { useTranslations } from "@/lib/i18n";
import supabase from "../../lib/supabase/browserClient";

export default function DashboardPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const t = useTranslations(language);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [business, setBusiness] = useState<any | null>(null);
  const [noBusinessSetup, setNoBusinessSetup] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [services, setServices] = useState<any[]>([]);

  const [clientsCount, setClientsCount] = useState(0);
  const [bookingsCount, setBookingsCount] = useState(0);
  const [pendingBookings, setPendingBookings] = useState(0);
  const [reviewsCount, setReviewsCount] = useState(0);
  const [avgRating, setAvgRating] = useState<number | null>(null);
  const [pendingFollowUps, setPendingFollowUps] = useState(0);
  const [loyaltyReady, setLoyaltyReady] = useState(0);

  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [recentClients, setRecentClients] = useState<any[]>([]);
  const [recentFollowUps, setRecentFollowUps] = useState<any[]>([]);

  useEffect(() => {
    loadOverview();
  }, []);

  async function loadOverview() {
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

      const { data: biz } = await supabase.from("businesses").select("id, name, slug").eq("user_id", user.id).single();
      const businessId = (biz as any)?.id ?? null;
      setBusiness(biz ?? null);
      if (!businessId) {
        // No business - show setup prompt instead of redirecting
        setNoBusinessSetup(true);
        setLoading(false);
        return;
      }

      // Load services
      const { data: svc } = await supabase
        .from("services")
        .select("id, name")
        .eq("business_id", businessId)
        .eq("is_active", true);
      setServices(svc ?? []);

      // counts and stats
      const [{ count: clientsCnt }, { count: bookingsCnt }, { count: pendingBk }, { count: reviewsCnt }] = await Promise.all([
        supabase.from("clients").select("id", { count: "exact", head: true }).eq("business_id", businessId),
        supabase.from("booking_requests").select("id", { count: "exact", head: true }).eq("business_id", businessId),
        supabase.from("booking_requests").select("id", { count: "exact", head: true }).eq("business_id", businessId).eq("status", "pending"),
        supabase.from("reviews").select("id", { count: "exact", head: true }).eq("business_id", businessId),
      ]).then((res) => res.map((r) => ({ count: (r as any)?.count ?? 0 })));

      setClientsCount(Number(clientsCnt));
      setBookingsCount(Number(bookingsCnt));
      setPendingBookings(Number(pendingBk));
      setReviewsCount(Number(reviewsCnt));

      // average rating
      const { data: ratings } = await supabase.from("reviews").select("rating").eq("business_id", businessId);
      const ratingsArr = ratings ?? [];
      const avg = ratingsArr.length ? ratingsArr.reduce((s: number, r: any) => s + (r.rating || 0), 0) / ratingsArr.length : null;
      setAvgRating(avg);

      // pending follow-ups
      const { count: pendingFu } = await supabase.from("follow_up_tasks").select("id", { count: "exact", head: true }).eq("business_id", businessId).eq("status", "pending");
      setPendingFollowUps(Number(pendingFu));

      // loyalty ready
      const { count: loyaltyCnt } = await supabase.from("loyalty_cards").select("id", { count: "exact", head: true }).eq("business_id", businessId).eq("status", "reward_ready");
      setLoyaltyReady(Number(loyaltyCnt));

      // recent lists
      const [{ data: recentBks }, { data: recentCl }, { data: recentFu }] = await Promise.all([
        supabase.from("booking_requests").select("id, client_name, client_phone, service, requested_at, status").eq("business_id", businessId).order("requested_at", { ascending: false }).limit(5),
        supabase.from("clients").select("id, name, phone, last_visit_at, created_at").eq("business_id", businessId).order("created_at", { ascending: false }).limit(5),
        supabase.from("follow_up_tasks").select("id, client_name, client_phone, type, message, due_date, status, created_at").eq("business_id", businessId).order("created_at", { ascending: false }).limit(5),
      ]);

      setRecentBookings(recentBks ?? []);
      setRecentClients(recentCl ?? []);
      setRecentFollowUps(recentFu ?? []);
    } catch (e: any) {
      setError(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  const handleBookingSuccess = () => {
    loadOverview();
  };

  return (
    <div>
      {/* Setup Prompt - No Business */}
      {noBusinessSetup && !loading && (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-white flex items-center justify-center px-4 py-8">
          <div className="text-center max-w-2xl">
            <div className="text-5xl sm:text-6xl mb-6">🚀</div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-slate-100 mb-4">{t('dashboard.dashboardWelcomeTitle')}</h2>
            <p className="text-base sm:text-lg lg:text-xl text-slate-600 dark:text-slate-400 mb-8">{t('dashboard.dashboardWelcomeMessage')}</p>
            
            <button
              onClick={() => router.push("/dashboard/onboarding")}
              className="inline-block px-6 sm:px-8 py-3 sm:py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold text-base sm:text-lg hover:shadow-lg hover:-translate-y-1 active:scale-95 transition-all"
            >
              {t('dashboard.startSetup')}
            </button>
            
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-8">
              {t('dashboard.orCreateManually')}{" "}
              <a href="/dashboard/settings" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-bold underline">
                {t('dashboard.createBusinessManually')}
              </a>
            </p>
          </div>
        </div>
      )}

      {/* Modal */}
      {business && (
        <NewBookingModal
          businessId={business.id}
          isOpen={isBookingModalOpen}
          onClose={() => setIsBookingModalOpen(false)}
          onSuccess={handleBookingSuccess}
          services={services}
        />
      )}

      {!noBusinessSetup && (
        <>
          {/* Dashboard Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6 mb-8 sm:mb-12">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">{t('dashboard.dashboardHeaderTitle')}</h1>
              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400">{business?.name ?? t('dashboard.yourBusinessLabel')}</p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
              <button onClick={() => setIsBookingModalOpen(true)} className="hidden rounded-lg bg-gradient-to-r from-indigo-600 to-blue-600 px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-white hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98] focus:ring-2 focus:ring-indigo-500 transition-all duration-200 ease-out md:inline-block">{t('dashboard.newBookingButton')}</button>
              <div className="rounded-full bg-gradient-to-r from-indigo-50 to-blue-50 px-3 py-1.5 text-xs sm:text-sm font-semibold text-indigo-700 border border-indigo-200 text-center">{t('dashboard.ownerBadge')}</div>
            </div>
          </div>

          {loading ? (
            <div className="mt-6 text-slate-600">{t('dashboard.loadingDashboard')}</div>
          ) : error ? (
            <div className="mt-6 text-sm text-red-600 dark:text-red-400 font-medium">{error}</div>
          ) : (
            <>
              {/* Key Stats Section */}
              <section className="mb-8 sm:mb-12">
                <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div className="group rounded-2xl sm:rounded-3xl bg-gradient-to-br from-indigo-600 to-blue-600 text-white p-6 sm:p-8 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="text-xs sm:text-sm font-semibold text-white/80 uppercase tracking-wide">{t('dashboard.totalClientsLabel')}</div>
                  <UsersIcon className="h-6 sm:h-8 w-6 sm:w-8" />
                </div>
                <div className="text-3xl sm:text-4xl font-bold mb-2">{ clientsCount}</div>
                <div className="text-xs sm:text-sm text-white/80">{t('dashboard.trackedCustomersLabel')}</div>
              </div>

              <div className="group rounded-2xl sm:rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-600 text-white p-6 sm:p-8 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="text-xs sm:text-sm font-semibold text-white/80 uppercase tracking-wide">{t('dashboard.bookingsLabel')}</div>
                  <CalendarIcon className="h-6 sm:h-8 w-6 sm:w-8" />
                </div>
                <div className="text-3xl sm:text-4xl font-bold mb-2">{bookingsCount}</div>
                <div className="text-xs sm:text-sm text-white/80">{pendingBookings} {t('dashboard.pendingLabel')}</div>
              </div>

              <div className="group rounded-2xl sm:rounded-3xl bg-gradient-to-br from-amber-600 to-orange-600 text-white p-6 sm:p-8 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="text-xs sm:text-sm font-semibold text-white/80 uppercase tracking-wide">{t('dashboard.reviewsLabel')}</div>
                  <StarIcon className="h-6 sm:h-8 w-6 sm:w-8" />
                </div>
                <div className="text-3xl sm:text-4xl font-bold mb-2">{reviewsCount}</div>
                <div className="text-xs sm:text-sm text-white/80">{avgRating ? `${avgRating.toFixed(2)} ${t('dashboard.avgLabel')}` : t('dashboard.noRatingsYet')}</div>
              </div>

              <div className="group rounded-2xl sm:rounded-3xl bg-gradient-to-br from-purple-600 to-pink-600 text-white p-6 sm:p-8 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="text-xs sm:text-sm font-semibold text-white/80 uppercase tracking-wide">{t('dashboard.followUpsLabel')}</div>
                  <MessageIcon className="h-6 sm:h-8 w-6 sm:w-8" />
                </div>
                <div className="text-3xl sm:text-4xl font-bold mb-2">{pendingFollowUps}</div>
                <div className="text-xs sm:text-sm text-white/80">{loyaltyReady} {t('dashboard.readyForRewardsLabel')}</div>
              </div>
            </div>
          </section>

          {/* Data Tables Section */}
          <div className="grid gap-6 sm:gap-8 lg:grid-cols-2">
            {/* Recent Bookings */}
            <section className="rounded-2xl sm:rounded-3xl bg-white/80 dark:bg-slate-900/50 backdrop-blur border border-white/60 dark:border-white/10 p-6 sm:p-8 shadow-lg">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">{t('dashboard.recentBookingsTitle')}</h2>
                <a href="/dashboard/bookings" className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-blue-600 dark:hover:text-blue-300 transition-colors whitespace-nowrap">
                  {t('dashboard.viewAllLink')}
                  <ChevronRightIcon className="h-4 w-4" />
                </a>
              </div>

              {recentBookings.length === 0 ? (
                <div className="py-8 sm:py-12 text-center text-sm sm:text-base text-slate-600 dark:text-slate-400">{t('dashboard.noBookingsYetMessage')}</div>
              ) : (
                <div className="overflow-x-auto -mx-6 sm:-mx-8 px-6 sm:px-8">
                  <table className="w-full text-xs sm:text-sm">
                    <thead>
                      <tr className="text-left text-xs font-bold text-slate-700 dark:text-slate-300 border-b-2 border-slate-200 dark:border-slate-700 pb-4">
                        <th className="pb-4 min-w-32 sm:min-w-36">{t('dashboard.clientTableHeader')}</th>
                        <th className="pb-4 min-w-24">{t('dashboard.serviceTableHeader')}</th>
                        <th className="pb-4 min-w-28 sm:min-w-32">{t('dashboard.dateTableHeader')}</th>
                        <th className="pb-4 min-w-20">{t('dashboard.statusTableHeader')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                      {recentBookings.map((b) => (
                        <tr key={b.id} className="hover:bg-indigo-50 dark:hover:bg-slate-800/50 transition-colors group">
                          <td className="py-4 text-slate-900 dark:text-slate-100 font-semibold text-xs sm:text-sm">{b.client_name}</td>
                          <td className="py-4 text-slate-700 dark:text-slate-300 text-xs sm:text-sm">{b.service}</td>
                          <td className="py-4 text-slate-600 dark:text-slate-400 text-xs">{b.requested_at ? new Date(b.requested_at).toLocaleString() : '-'}</td>
                          <td className="py-4"><StatusPill status={b.status} t={t} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            {/* Right Column: Clients & Reminders */}
            <div className="space-y-6 sm:space-y-8">
              {/* Recent Clients */}
              <section className="rounded-2xl sm:rounded-3xl bg-white/80 dark:bg-slate-900/50 backdrop-blur border border-white/60 dark:border-white/10 p-6 sm:p-8 shadow-lg">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">{t('dashboard.recentClientsTitle')}</h3>
                  <a href="/dashboard/clients" className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:text-teal-600 dark:hover:text-teal-300 transition-colors">
                    {t('dashboard.seeAllLink')}
                    <ChevronRightIcon className="h-4 w-4" />
                  </a>
                </div>

                {recentClients.length === 0 ? (
                  <div className="py-6 sm:py-8 text-center text-xs sm:text-sm text-slate-600 dark:text-slate-400">{t('dashboard.noClientsYetMessage')}</div>
                ) : (
                  <ul className="space-y-2 sm:space-y-3">
                    {recentClients.map((c) => (
                      <li key={c.id} className="group flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800/30 dark:to-slate-800/50 hover:from-emerald-50 hover:to-teal-50 dark:hover:from-slate-800 dark:hover:to-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-600 transition-all">
                        <div className="flex-1 min-w-0">
                          <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{c.name}</div>
                          <div className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-1">{c.phone || t('dashboard.noPhoneLabel')} • {c.last_visit_at ? `${t('dashboard.lastVisitLabel')}${new Date(c.last_visit_at).toLocaleDateString()}` : t('dashboard.neverVisitedLabel')}</div>
                        </div>
                        <a href="/dashboard/clients" className="ml-0 sm:ml-4 px-3 sm:px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 text-xs font-semibold text-white hover:shadow-lg active:scale-[0.98] transition-all text-center">{t('dashboard.viewButton')}</a>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              {/* Follow-up Reminders */}
              <section className="rounded-2xl sm:rounded-3xl bg-white/80 dark:bg-slate-900/50 backdrop-blur border border-white/60 dark:border-white/10 p-6 sm:p-8 shadow-lg">
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6 sm:mb-8">{t('dashboard.followUpRemindersTitle')}</h3>
                {recentFollowUps.length === 0 ? (
                  <div className="py-6 sm:py-8 text-center text-xs sm:text-sm text-slate-600 dark:text-slate-400">{t('dashboard.allCaughtUpMessage')}</div>
                ) : (
                  <ul className="space-y-2 sm:space-y-3">
                    {recentFollowUps.map((f) => (
                      <li key={f.id} className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-purple-50 to-pink-50 dark:from-slate-800/30 dark:to-slate-800/30 border border-purple-200 dark:border-slate-700 hover:border-purple-300 dark:hover:border-slate-600 transition-all">
                        <div className="mt-0.5 flex-shrink-0"><MessageIcon className="h-4 sm:h-6 w-4 sm:w-6" /></div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 line-clamp-2">{f.message}</div>
                          <div className="text-xs text-slate-600 dark:text-slate-400 mt-1 truncate">{f.client_name}</div>
                        </div>
                        <div className="text-xs font-semibold text-purple-700 dark:text-purple-400 flex-shrink-0 whitespace-nowrap">
                          {t('dashboard.dueLabel')}{f.due_date ? new Date(f.due_date).toLocaleDateString() : t('dashboard.naLabel')}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>
          </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

function StatusPill({ status, t }: { status: string; t: any }) {
  
  if (status === "pending") return <span className="inline-flex items-center rounded-full bg-amber-100 dark:bg-amber-950 px-3 py-1.5 text-xs font-bold text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-700"><ClockIcon className="h-3.5 w-3.5 mr-1.5" /> {t('dashboard.pendingStatusLabel')}</span>;
  if (status === "accepted") return <span className="inline-flex items-center rounded-full bg-emerald-100 dark:bg-emerald-950 px-3 py-1.5 text-xs font-bold text-emerald-900 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">✓ {t('dashboard.acceptedStatusLabel')}</span>;
  if (status === "completed") return <span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-600">✓✓ {t('dashboard.completedStatusLabel')}</span>;
  return <span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-600">{status}</span>;
}
