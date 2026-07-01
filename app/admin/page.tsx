"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import supabase from "../../lib/supabase/browserClient";
import AdminGuard from "./AdminGuard";

export default function AdminPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    users: 0,
    businesses: 0,
    openTickets: 0,
    recentTickets: [] as any[],
    recentBusinesses: [] as any[],
  });

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      // Total users (count profiles)
      const { count: userCount } = await supabase.from("profiles").select("id", { count: "exact", head: true });

      // Total businesses
      const { count: bizCount } = await supabase.from("businesses").select("id", { count: "exact", head: true });

      // Open tickets
      const { count: openCount } = await supabase
        .from("support_tickets")
        .select("id", { count: "exact", head: true })
        .eq("status", "open");

      // Recent tickets
      const { data: recentTickets } = await supabase
        .from("support_tickets")
        .select("id, subject, status, priority, user_id, created_at")
        .order("created_at", { ascending: false })
        .limit(5);

      // Recent businesses
      const { data: recentBusinesses } = await supabase
        .from("businesses")
        .select("id, name, slug, created_at")
        .order("created_at", { ascending: false })
        .limit(5);

      setStats({
        users: userCount ?? 0,
        businesses: bizCount ?? 0,
        openTickets: openCount ?? 0,
        recentTickets: recentTickets ?? [],
        recentBusinesses: recentBusinesses ?? [],
      });
    } catch (e: any) {
      console.error("Error loading admin stats:", e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AdminGuard>
      <div>
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">Admin Dashboard</h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">System overview and management</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 rounded-full border-4 border-slate-200 dark:border-slate-700 border-t-indigo-600 animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600 dark:text-slate-400">Loading stats...</p>
          </div>
        ) : (
          <>
            {/* Stats Section */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-12">
              <div className="rounded-3xl bg-gradient-to-br from-indigo-600 to-blue-600 text-white p-8 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm font-semibold text-white/80 uppercase">Total Users</div>
                  <div className="text-3xl">👥</div>
                </div>
                <div className="text-4xl font-bold">{stats.users}</div>
              </div>

              <div className="rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-600 text-white p-8 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm font-semibold text-white/80 uppercase">Businesses</div>
                  <div className="text-3xl">🏢</div>
                </div>
                <div className="text-4xl font-bold">{stats.businesses}</div>
              </div>

              <div className="rounded-3xl bg-gradient-to-br from-amber-600 to-orange-600 text-white p-8 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm font-semibold text-white/80 uppercase">Open Tickets</div>
                  <div className="text-3xl">🎫</div>
                </div>
                <div className="text-4xl font-bold">{stats.openTickets}</div>
              </div>
            </div>

            {/* Grid Section */}
            <div className="grid gap-8 lg:grid-cols-2">
              {/* Recent Tickets */}
              <div className="rounded-3xl bg-white/80 dark:bg-slate-900/50 backdrop-blur border border-white/60 dark:border-white/10 shadow-lg p-8">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Recent Support Tickets</h2>
                  <Link href="/admin/support" className="text-indigo-600 hover:text-blue-600 font-bold text-sm">
                    View all →
                  </Link>
                </div>

                {stats.recentTickets.length === 0 ? (
                  <p className="text-slate-600 dark:text-slate-400 text-center py-8">No tickets yet</p>
                ) : (
                  <div className="space-y-3">
                    {stats.recentTickets.map((ticket) => (
                      <div key={ticket.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-500/50 transition-all">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">{ticket.subject}</h3>
                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{new Date(ticket.created_at).toLocaleDateString()}</p>
                          </div>
                          <span
                            className={`px-2 py-1 rounded text-xs font-bold ${
                              ticket.status === "open"
                                ? "bg-blue-100 text-blue-700"
                                : ticket.status === "in_progress"
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-emerald-100 text-emerald-700"
                            }`}
                          >
                            {ticket.status === "in_progress" ? "In Progress" : ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Businesses */}
              <div className="rounded-3xl bg-white/80 dark:bg-slate-900/50 backdrop-blur border border-white/60 dark:border-white/10 shadow-lg p-8">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Recent Businesses</h2>
                  <Link href="/admin/businesses" className="text-emerald-600 hover:text-teal-600 font-bold text-sm">
                    View all →
                  </Link>
                </div>

                {stats.recentBusinesses.length === 0 ? (
                  <p className="text-slate-600 dark:text-slate-400 text-center py-8">No businesses yet</p>
                ) : (
                  <div className="space-y-3">
                    {stats.recentBusinesses.map((biz) => (
                      <div key={biz.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-500/50 transition-all">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">{biz.name}</h3>
                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{new Date(biz.created_at).toLocaleDateString()}</p>
                          </div>
                          <Link
                            href={`/b/${biz.slug}`}
                            target="_blank"
                            className="px-2 py-1 text-xs font-bold bg-emerald-100 text-emerald-700 rounded hover:bg-emerald-200 transition-all"
                          >
                            View
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Links */}
            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Link
                href="/admin/support"
                className="rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-slate-800 dark:to-slate-800 border-2 border-amber-200 dark:border-slate-700 p-6 hover:shadow-lg transition-all"
              >
                <div className="text-3xl mb-3">🎫</div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100">Support Tickets</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Manage support requests</p>
              </Link>

              <Link
                href="/admin/users"
                className="rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-800 border-2 border-blue-200 dark:border-slate-700 p-6 hover:shadow-lg transition-all"
              >
                <div className="text-3xl mb-3">👥</div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100">Users</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">View all users</p>
              </Link>

              <Link
                href="/admin/businesses"
                className="rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-slate-800 dark:to-slate-800 border-2 border-emerald-200 dark:border-slate-700 p-6 hover:shadow-lg transition-all"
              >
                <div className="text-3xl mb-3">🏢</div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100">Businesses</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">View all businesses</p>
              </Link>

              <Link
                href="/dashboard"
                className="rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-800 border-2 border-slate-300 dark:border-slate-700 p-6 hover:shadow-lg transition-all"
              >
                <div className="text-3xl mb-3">📊</div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100">Dashboard</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Back to user dashboard</p>
              </Link>
            </div>
          </>
        )}
      </div>
    </AdminGuard>
  );
}
