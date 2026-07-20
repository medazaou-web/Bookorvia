"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertIcon } from "@/components/icons";
import supabase from "../../../lib/supabase/browserClient";
import { useLanguage } from '@/lib/context/LanguageContext';
import { useTranslations } from '@/lib/i18n';
import AdminGuard from "../AdminGuard";

interface UserProfile {
  id: string;
  email?: string;
  name?: string;
  role?: string;
  avatar_url?: string;
  created_at?: string;
}

export default function AdminUsersPage() {
  const { language } = useLanguage();
  const t = useTranslations(language);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [currentRole, setCurrentRole] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    setLoading(true);
    try {
      // Get current user's role
      const { data: authData } = await supabase.auth.getUser();
      const currentUser = (authData as any)?.user ?? null;

      if (currentUser) {
        const { data: profile } = await supabase.from("profiles").select("role").eq("id", currentUser.id).single();
        setCurrentRole((profile as any)?.role ?? "user");
      }

      // Get all users from API endpoint
      const response = await fetch('/api/admin/get-users', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.statusText}`);
      }

      const data = await response.json();
      setUsers(data.users || []);
    } catch (e: any) {
      console.error("Error loading users:", e);
      setError(e.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  }

  async function updateUserRole(userId: string, newRole: string) {
    setError(null);
    if (!currentRole || currentRole !== "admin") {
      setError(t('adminUsers.onlyAdminsCanChangeRoles'));
      return;
    }

    try {
      const { error: err } = await supabase.from("profiles").update({ role: newRole }).eq("id", userId);

      if (err) throw err;

      await loadUsers();
    } catch (e: any) {
      setError(t('adminUsers.errorUpdatingRole') + " " + e.message);
    }
  }

  const getRoleColor = (role?: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 dark:bg-red-500/15 text-red-700 dark:text-red-200 border border-red-300 dark:border-red-400/30";
      case "support":
        return "bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-200 border border-amber-300 dark:border-amber-400/30";
      default:
        return "bg-slate-100 dark:bg-slate-500/15 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-400/30";
    }
  };

  return (
    <AdminGuard>
      <div>
        <div className="mb-8">
          <Link href="/admin" className="text-indigo-600 dark:text-indigo-400 hover:text-blue-600 dark:hover:text-blue-300 font-bold text-sm mb-4 inline-block transition-colors">
            {t('adminUsers.backToAdmin')}
          </Link>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">{t('adminUsers.users')}</h1>
          <p className="text-lg text-slate-600 dark:text-slate-300">{t('adminUsers.totalUsers')} {users.length}</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 rounded-full border-4 border-slate-200 dark:border-slate-700 border-t-indigo-600 animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600 dark:text-slate-400">{t('adminUsers.loadingUsers')}</p>
          </div>
        ) : (
          <div className="rounded-2xl bg-white/80 dark:bg-slate-900/50 backdrop-blur border border-white/60 dark:border-white/10 shadow-lg overflow-hidden">
            {error && (
              <div className="bg-red-50 dark:bg-red-500/10 border-l-4 border-red-500 p-4 m-4 rounded text-red-700 dark:text-red-300 text-sm">
                {error}
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                    <th className="px-6 py-3 text-left text-sm font-bold text-slate-700 dark:text-slate-300">{t('adminUsers.email')}</th>
                    <th className="px-6 py-3 text-left text-sm font-bold text-slate-700 dark:text-slate-300">{t('adminUsers.name')}</th>
                    <th className="px-6 py-3 text-left text-sm font-bold text-slate-700 dark:text-slate-300">{t('adminUsers.role')}</th>
                    <th className="px-6 py-3 text-left text-sm font-bold text-slate-700 dark:text-slate-300">{t('adminUsers.joined')}</th>
                    <th className="px-6 py-3 text-left text-sm font-bold text-slate-700 dark:text-slate-300">{t('adminUsers.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4 text-sm text-slate-900 dark:text-white font-medium">{user.email}</td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{user.name || '—'}</td>
                      <td className="px-6 py-4">
                        <select
                          value={user.role || 'user'}
                          onChange={(e) => updateUserRole(user.id, e.target.value)}
                          disabled={currentRole !== 'admin'}
                          className={`px-2 py-1 rounded text-xs font-bold border ${getRoleColor(user.role)} ${
                            currentRole !== 'admin' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                          }`}
                        >
                          <option value="user">{t('adminUsers.user')}</option>
                          <option value="support">{t('adminUsers.support')}</option>
                          <option value="admin">{t('adminUsers.admin')}</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{new Date(user.created_at || '').toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-sm">
                        <button className="text-indigo-600 dark:text-indigo-400 hover:text-blue-600 dark:hover:text-blue-300 font-bold transition-colors">
                          {t('adminUsers.view')}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminGuard>
  );
}
