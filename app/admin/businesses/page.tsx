"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import supabase from "../../../lib/supabase/browserClient";
import { useLanguage } from '../../../lib/context/LanguageContext';
import { useTranslations } from '../../../lib/i18n';
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
  const { language } = useLanguage();
  const t = useTranslations(language);
  
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
      salon: "bg-pink-100 dark:bg-pink-500/15 text-pink-700 dark:text-pink-200 border border-pink-300 dark:border-pink-400/30",
      barber: "bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-200 border border-blue-300 dark:border-blue-400/30",
      spa: "bg-purple-100 dark:bg-purple-500/15 text-purple-700 dark:text-purple-200 border border-purple-300 dark:border-purple-400/30",
      clinic: "bg-green-100 dark:bg-green-500/15 text-green-700 dark:text-green-200 border border-green-300 dark:border-green-400/30",
      fitness: "bg-orange-100 dark:bg-orange-500/15 text-orange-700 dark:text-orange-200 border border-orange-300 dark:border-orange-400/30",
    };
    return colors[category ?? ""] || "bg-slate-100 dark:bg-slate-500/15 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-400/30";
  };

  return (
    <AdminGuard>
      <div>
        <div className="mb-8">
          <Link href="/admin" className="text-indigo-600 dark:text-indigo-400 hover:text-blue-600 dark:hover:text-blue-300 font-bold text-sm mb-4 inline-block transition-colors">
            {t('admin.backToAdmin')}
          </Link>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">{t('admin.businesses')}</h1>
          <p className="text-lg text-slate-600 dark:text-slate-300">{t('admin.totalBusinesses')} {businesses.length}</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 rounded-full border-4 border-slate-200 dark:border-slate-700 border-t-indigo-600 animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600 dark:text-slate-400">{t('admin.loadingBusinesses')}</p>
          </div>
        ) : (
          <>
            {/* Search */}
            <div className="mb-8">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('admin.searchByNameSlugEmail')}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs font-bold text-slate-700 dark:text-slate-300 border-b-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                    <th className="px-6 py-4">{t('admin.businessName')}</th>
                    <th className="px-6 py-4">{t('admin.slugUrl')}</th>
                    <th className="px-6 py-4">{t('admin.category')}</th>
                    <th className="px-6 py-4">{t('admin.owner')}</th>
                    <th className="px-6 py-4">{t('admin.phone')}</th>
                    <th className="px-6 py-4">{t('admin.created')}</th>
                    <th className="px-6 py-4">{t('admin.action')}</th>
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
                          {t('admin.view')}
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredBusinesses.length === 0 && (
                <div className="rounded-2xl bg-white/80 dark:bg-slate-900/50 backdrop-blur border border-white/60 dark:border-white/10 shadow-lg p-12 text-center mt-4">
                  <p className="text-slate-600 dark:text-slate-400">{searchTerm ? t('admin.noSearchResults') : t('admin.noBusinesses')}</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </AdminGuard>
  );
}
