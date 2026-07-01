"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import supabase from "../../../lib/supabase/browserClient";
import AdminGuard from "../AdminGuard";

interface UserProfile {
  id: string;
  email?: string;
  full_name?: string;
  role?: string;
  avatar_url?: string;
  created_at?: string;
}

export default function AdminUsersPage() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [currentRole, setCurrentRole] = useState<string | null>(null);

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

      // Get all profiles
      const { data: profiles } = await supabase.from("profiles").select("id, full_name, role, avatar_url, created_at");

      // Fetch emails from auth for each profile
      const usersWithEmails = await Promise.all(
        (profiles ?? []).map(async (profile: any) => {
          let email = "";
          try {
            const { data: authData } = await supabase.auth.admin.getUserById(profile.id);
            email = (authData?.user?.email) ?? "";
          } catch (e) {
            // If admin API not available, we can't get email
            email = "N/A";
          }
          return {
            ...profile,
            email,
          };
        })
      );

      setUsers(usersWithEmails);
    } catch (e: any) {
      console.error("Error loading users:", e);
    } finally {
      setLoading(false);
    }
  }

  async function updateUserRole(userId: string, newRole: string) {
    if (!currentRole || currentRole !== "admin") {
      alert("Only admins can change roles");
      return;
    }

    try {
      const { error } = await supabase.from("profiles").update({ role: newRole }).eq("id", userId);

      if (error) throw error;

      await loadUsers();
    } catch (e: any) {
      alert("Error updating role: " + e.message);
    }
  }

  const getRoleColor = (role?: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-700 border-red-300";
      case "support":
        return "bg-amber-100 text-amber-700 border-amber-300";
      default:
        return "bg-slate-100 text-slate-700 border-slate-300";
    }
  };

  return (
    <AdminGuard>
      <div>
        <div className="mb-8">
          <Link href="/admin" className="text-indigo-600 hover:text-blue-600 dark:text-indigo-400 dark:hover:text-blue-300 font-bold text-sm mb-4 inline-block">
            ← Back to Admin
          </Link>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">Users</h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">Total users: {users.length}</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 rounded-full border-4 border-slate-200 dark:border-slate-700 border-t-indigo-600 animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600 dark:text-slate-400">Loading users...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-bold text-slate-700 dark:text-slate-300 border-b-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-indigo-50 dark:hover:bg-slate-800/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {user.avatar_url && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={user.avatar_url} alt={user.full_name} className="w-8 h-8 rounded-full" />
                        )}
                        <span className="font-mono text-sm text-slate-900 dark:text-slate-100">{user.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-900 dark:text-slate-100 font-medium">{user.full_name || "—"}</td>
                    <td className="px-6 py-4">
                      {currentRole === "admin" ? (
                        <select
                          value={user.role || "user"}
                          onChange={(e) => updateUserRole(user.id, e.target.value)}
                          className={`px-3 py-1 rounded-lg text-xs font-bold border cursor-pointer ${getRoleColor(user.role)}`}
                        >
                          <option value="user">User</option>
                          <option value="support">Support</option>
                          <option value="admin">Admin</option>
                        </select>
                      ) : (
                        <span className={`px-3 py-1 rounded-lg text-xs font-bold border inline-block ${getRoleColor(user.role)}`}>
                          {(user.role || "user").charAt(0).toUpperCase() + (user.role || "user").slice(1)}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                      {user.created_at ? new Date(user.created_at).toLocaleDateString() : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {users.length === 0 && (
              <div className="rounded-2xl bg-white/80 dark:bg-slate-900/50 backdrop-blur border border-white/60 dark:border-white/10 shadow-lg p-12 text-center mt-4">
                <p className="text-slate-600 dark:text-slate-400">No users found</p>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminGuard>
  );
}
