"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import supabase from "../../../lib/supabase/browserClient";
import AdminGuard from "../AdminGuard";

interface Business {
  id: string;
  name: string;
  slug: string;
  category?: string;
  user_id: string;
  phone?: string;
  created_at: string;
  owner_email?: string;
}

export default function AdminBusinessesPage() {
  const [loading, setLoading] = useState(true);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadBusinesses();
  }, []);

  async function loadBusinesses() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("businesses")
        .select("id, name, slug, category, user_id, phone, created_at")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch owner emails
      const bizWithOwners = await Promise.all(
        (data ?? []).map(async (biz: any) => {
          let owner_email = "";
          try {
            const { data: authData } = await supabase.auth.admin.getUserById(biz.user_id);
            owner_email = (authData?.user?.email) ?? "";
          } catch (e) {
            owner_email = "N/A";
          }
          return {
            ...biz,
            owner_email,
          };
        })
      );

      setBusinesses(bizWithOwners);
    } catch (e: any) {
      console.error("Error loading businesses:", e);
    } finally {
      setLoading(false);
    }
  }

  const filteredBusinesses = businesses.filter((biz) => {
    const term = searchTerm.toLowerCase();
    return biz.name.toLowerCase().includes(term) || biz.slug.toLowerCase().includes(term) || (biz.owner_email?.toLowerCase().includes(term) ?? false);
  });

  const getCategoryColor = (category?: string) => {
    const colors: Record<string, string> = {
      salon: "bg-pink-100 text-pink-700",
      barber: "bg-blue-100 text-blue-700",
      spa: "bg-purple-100 text-purple-700",
      clinic: "bg-green-100 text-green-700",
      fitness: "bg-orange-100 text-orange-700",
    };
    return colors[category ?? ""] || "bg-slate-100 text-slate-700";
  };

  return (
    <AdminGuard>
      <div>
        <div className="mb-8">
          <Link href="/admin" className="text-indigo-600 hover:text-blue-600 dark:text-indigo-400 dark:hover:text-blue-300 font-bold text-sm mb-4 inline-block">
            ← Back to Admin
          </Link>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">Businesses</h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">Total businesses: {businesses.length}</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 rounded-full border-4 border-slate-200 dark:border-slate-700 border-t-indigo-600 animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600 dark:text-slate-400">Loading businesses...</p>
          </div>
        ) : (
          <>
            {/* Search */}
            <div className="mb-8">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, slug, or owner email..."
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs font-bold text-slate-700 dark:text-slate-300 border-b-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                    <th className="px-6 py-4">Business Name</th>
                    <th className="px-6 py-4">Slug / URL</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Owner</th>
                    <th className="px-6 py-4">Phone</th>
                    <th className="px-6 py-4">Created</th>
                    <th className="px-6 py-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                  {filteredBusinesses.map((biz) => (
                    <tr key={biz.id} className="hover:bg-indigo-50 dark:hover:bg-slate-800/50 transition-colors group">
                      <td className="px-6 py-4 text-slate-900 dark:text-slate-100 font-bold">{biz.name}</td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400 font-mono text-sm">{biz.slug}</td>
                      <td className="px-6 py-4">
                        {biz.category && (
                          <span className={`px-3 py-1 rounded-lg text-xs font-bold inline-block ${getCategoryColor(biz.category)}`}>
                            {biz.category.charAt(0).toUpperCase() + biz.category.slice(1)}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400 text-sm font-mono">{biz.owner_email}</td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{biz.phone || "—"}</td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400 text-sm">{new Date(biz.created_at).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <Link
                          href={`/b/${biz.slug}`}
                          target="_blank"
                          className="px-3 py-1 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-all"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredBusinesses.length === 0 && (
                <div className="rounded-2xl bg-white/80 dark:bg-slate-900/50 backdrop-blur border border-white/60 dark:border-white/10 shadow-lg p-12 text-center mt-4">
                  <p className="text-slate-600 dark:text-slate-400">{searchTerm ? "No businesses match your search" : "No businesses found"}</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </AdminGuard>
  );
}
