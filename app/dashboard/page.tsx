"use client";
import Sidebar from "./Sidebar";
import NewBookingModal from "./NewBookingModal";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "../../lib/supabase/browserClient";

export default function DashboardPage() {
  const router = useRouter();
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
        setError("You must be logged in to view the dashboard.");
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
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-white flex items-center justify-center p-4">
          <div className="text-center max-w-2xl">
            <div className="text-6xl mb-6">🚀</div>
            <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-slate-100 mb-4">Welcome to Bookorvia!</h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 mb-8">Let's set up your business to get started. It only takes 5 minutes.</p>
            
            <button
              onClick={() => router.push("/dashboard/onboarding")}
              className="inline-block px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold text-lg hover:shadow-lg hover:-translate-y-1 active:scale-95 transition-all"
            >
              Start Setup →
            </button>
            
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-8">
              Or{" "}
              <a href="/dashboard/settings" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-bold underline">
                create your business manually in Settings
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-12">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">Dashboard</h1>
              <p className="text-lg text-slate-600 dark:text-slate-400">{business?.name ?? "Your business"}</p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button onClick={() => setIsBookingModalOpen(true)} className="hidden rounded-lg bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-3 text-sm font-semibold text-white hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98] focus:ring-2 focus:ring-indigo-500 transition-all duration-200 ease-out md:inline-block">+ New booking</button>
              <div className="rounded-full bg-gradient-to-r from-indigo-50 to-blue-50 px-3 py-1.5 text-sm font-semibold text-indigo-700 border border-indigo-200 text-center">Owner</div>
            </div>
          </div>

          {loading ? (
            <div className="mt-6 text-slate-600">Loading dashboard…</div>
          ) : error ? (
            <div className="mt-6 text-sm text-red-600 dark:text-red-400 font-medium">{error}</div>
          ) : (
            <>
              {/* Key Stats Section */}
              <section className="mb-12">
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div className="group rounded-3xl bg-gradient-to-br from-indigo-600 to-blue-600 text-white p-8 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm font-semibold text-white/80 uppercase tracking-wide">Total Clients</div>
                  <div className="text-3xl">👥</div>
                </div>
                <div className="text-4xl font-bold mb-2">{clientsCount}</div>
                <div className="text-sm text-white/80">Tracked customers</div>
              </div>

              <div className="group rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-600 text-white p-8 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm font-semibold text-white/80 uppercase tracking-wide">Bookings</div>
                  <div className="text-3xl">📅</div>
                </div>
                <div className="text-4xl font-bold mb-2">{bookingsCount}</div>
                <div className="text-sm text-white/80">{pendingBookings} pending</div>
              </div>

              <div className="group rounded-3xl bg-gradient-to-br from-amber-600 to-orange-600 text-white p-8 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm font-semibold text-white/80 uppercase tracking-wide">Reviews</div>
                  <div className="text-3xl">⭐</div>
                </div>
                <div className="text-4xl font-bold mb-2">{reviewsCount}</div>
                <div className="text-sm text-white/80">{avgRating ? `${avgRating.toFixed(2)} avg` : 'No ratings yet'}</div>
              </div>

              <div className="group rounded-3xl bg-gradient-to-br from-purple-600 to-pink-600 text-white p-8 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm font-semibold text-white/80 uppercase tracking-wide">Follow-ups</div>
                  <div className="text-3xl">💬</div>
                </div>
                <div className="text-4xl font-bold mb-2">{pendingFollowUps}</div>
                <div className="text-sm text-white/80">{loyaltyReady} ready for rewards</div>
              </div>
            </div>
          </section>

          {/* Data Tables Section */}
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Recent Bookings */}
            <section className="rounded-3xl bg-white/80 dark:bg-slate-900/50 backdrop-blur border border-white/60 dark:border-white/10 p-8 shadow-lg">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Recent Bookings</h2>
                <a href="/dashboard/bookings" className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-blue-600 dark:hover:text-blue-300 transition-colors">
                  View all
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </a>
              </div>

              {recentBookings.length === 0 ? (
                <div className="py-12 text-center text-slate-600 dark:text-slate-400">No bookings yet. Start collecting!</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs font-bold text-slate-700 dark:text-slate-300 border-b-2 border-slate-200 dark:border-slate-700 pb-4">
                        <th className="pb-4 min-w-36">Client</th>
                        <th className="pb-4 min-w-24">Service</th>
                        <th className="pb-4 min-w-32">Date</th>
                        <th className="pb-4 min-w-20">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                      {recentBookings.map((b) => (
                        <tr key={b.id} className="hover:bg-indigo-50 dark:hover:bg-slate-800/50 transition-colors group">
                          <td className="py-4 text-slate-900 dark:text-slate-100 font-semibold">{b.client_name}</td>
                          <td className="py-4 text-slate-700 dark:text-slate-300">{b.service}</td>
                          <td className="py-4 text-slate-600 dark:text-slate-400 text-xs">{b.requested_at ? new Date(b.requested_at).toLocaleString() : '-'}</td>
                          <td className="py-4"><StatusPill status={b.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            {/* Right Column: Clients & Reminders */}
            <div className="space-y-8">
              {/* Recent Clients */}
              <section className="rounded-3xl bg-white/80 dark:bg-slate-900/50 backdrop-blur border border-white/60 dark:border-white/10 p-8 shadow-lg">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Recent Clients</h3>
                  <a href="/dashboard/clients" className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:text-teal-600 dark:hover:text-teal-300 transition-colors">
                    See all
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </a>
                </div>

                {recentClients.length === 0 ? (
                  <div className="py-8 text-center text-slate-600 dark:text-slate-400">No clients yet</div>
                ) : (
                  <ul className="space-y-3">
                    {recentClients.map((c) => (
                      <li key={c.id} className="group flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800/30 dark:to-slate-800/50 hover:from-emerald-50 hover:to-teal-50 dark:hover:from-slate-800 dark:hover:to-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-600 transition-all">
                        <div className="flex-1">
                          <div className="text-sm font-bold text-slate-900 dark:text-slate-100">{c.name}</div>
                          <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">{c.phone || 'No phone'} • {c.last_visit_at ? `Last: ${new Date(c.last_visit_at).toLocaleDateString()}` : 'Never visited'}</div>
                        </div>
                        <a href="/dashboard/clients" className="ml-4 px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 text-xs font-semibold text-white hover:shadow-lg active:scale-[0.98] transition-all">View</a>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              {/* Follow-up Reminders */}
              <section className="rounded-3xl bg-white/80 dark:bg-slate-900/50 backdrop-blur border border-white/60 dark:border-white/10 p-8 shadow-lg">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-8">Follow-up Reminders</h3>
                {recentFollowUps.length === 0 ? (
                  <div className="py-8 text-center text-slate-600 dark:text-slate-400">All caught up!</div>
                ) : (
                  <ul className="space-y-3">
                    {recentFollowUps.map((f) => (
                      <li key={f.id} className="flex items-start gap-4 p-4 rounded-2xl bg-gradient-to-r from-purple-50 to-pink-50 dark:from-slate-800/30 dark:to-slate-800/30 border border-purple-200 dark:border-slate-700 hover:border-purple-300 dark:hover:border-slate-600 transition-all">
                        <div className="text-xl mt-1">💬</div>
                        <div className="flex-1">
                          <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{f.message}</div>
                          <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">{f.client_name}</div>
                        </div>
                        <div className="text-xs font-semibold text-purple-700 dark:text-purple-400 flex-shrink-0 whitespace-nowrap">
                          Due: {f.due_date ? new Date(f.due_date).toLocaleDateString() : 'N/A'}
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

function StatusPill({ status }: { status: string }) {
  if (status === "pending") return <span className="inline-flex items-center rounded-full bg-amber-100 dark:bg-amber-950 px-3 py-1.5 text-xs font-bold text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-700">⏳ Pending</span>;
  if (status === "accepted") return <span className="inline-flex items-center rounded-full bg-emerald-100 dark:bg-emerald-950 px-3 py-1.5 text-xs font-bold text-emerald-900 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">✓ Accepted</span>;
  if (status === "completed") return <span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-600">✓✓ Completed</span>;
  return <span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-600">{status}</span>;
}
