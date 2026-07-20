"use client";

import { useState, useEffect } from "react";
import supabase from "@/lib/supabase/browserClient";
import { AnnouncementIcon, IssueIcon, CheckIcon, CloseIcon, AlertIcon } from "@/components/icons";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/context/LanguageContext";
import { useTranslations } from "@/lib/i18n";

export default function AdminNotificationsPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const t = useTranslations(language);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Form state
  const [sendToAll, setSendToAll] = useState(true);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [type, setType] = useState<"announcement" | "issue" | "update" | "maintenance">("announcement");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Check admin access
  useEffect(() => {
    async function checkAdmin() {
      try {
        const { data: userData } = await supabase.auth.getUser();
        const user = (userData as any)?.user ?? null;
        if (!user) {
          router.push("/login");
          return;
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        const userRole = (profile as any)?.role;
        if (!["admin", "support", "support_manager"].includes(userRole)) {
          router.push("/dashboard");
          return;
        }

        setIsAdmin(true);

        // Load available users from API (bypasses RLS)
        try {
          const { data: sessionData } = await supabase.auth.getSession();
          const accessToken = sessionData?.session?.access_token;

          console.log("🔍 [Admin Notifications] Fetching users from API...");
          const res = await fetch('/api/admin/get-users', {
            method: 'GET',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
              ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
            },
          });
          console.log("🔍 [Admin Notifications] API response status:", res.status);
          
          if (!res.ok) {
            const errPayload = await res.json().catch(() => ({}));
            console.error("🔍 [Admin Notifications] API error response:", errPayload);
            setErrorMessage(errPayload?.error || 'Failed to fetch users');
            return;
          }
          
          const data = await res.json();
          console.log("🔍 [Admin Notifications] API response data:", data);
          
          if (data.users && Array.isArray(data.users)) {
            console.log(`🔍 [Admin Notifications] Setting ${data.users.length} users`);
            setAvailableUsers(data.users);
          } else {
            console.warn("🔍 [Admin Notifications] No users array in response or users is not an array");
            setAvailableUsers([]);
          }
        } catch (err) {
          console.error("🔍 [Admin Notifications] Error loading users:", err);
          setErrorMessage('Failed to fetch users');
        }
      } catch (err) {
        console.error("Error checking admin:", err);
        router.push("/dashboard");
      } finally {
        setLoading(false);
      }
    }

    checkAdmin();
  }, []);

  async function handleSendNotification(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      if (!title.trim() || !message.trim()) {
        setErrorMessage(t('adminMessages.titleAndMessageRequired'));
        return;
      }

      const userIds = sendToAll ? [] : selectedUserIds;

      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      const res = await fetch("/api/admin/send-notification", {
        method: "POST",
        credentials: 'include',
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({
          userIds,
          sendToAll,
          type,
          title,
          message,
          icon: getTypeIcon(type),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || t('adminMessages.failedToSendNotification'));
        return;
      }

      const deliveredCount = data?.notificationsSent ?? 0;
      const usersWithoutBusiness = data?.usersWithoutBusiness ?? 0;
      let successText = t('adminMessages.notificationSent').replace('{count}', String(deliveredCount));
      if (usersWithoutBusiness > 0) {
        successText += ` (${usersWithoutBusiness} targeted user${usersWithoutBusiness > 1 ? 's' : ''} had no business inbox)`;
      }
      setSuccessMessage(successText);
      setTitle("");
      setMessage("");
      setSendToAll(true);
      setSelectedUserIds([]);
    } catch (err: any) {
      setErrorMessage(err.message || "An error occurred");
    } finally {
      setSending(false);
    }
  }

  function getTypeIcon(t: string) {
    switch (t) {
      case "announcement":
        return "📢";
      case "issue":
        return "⚠️";
      case "update":
        return "✨";
      case "maintenance":
        return "🔧";
      default:
        return "📬";
    }
  }

  function getTypeColor(t: string) {
    switch (t) {
      case "announcement":
        return "border-l-blue-600 bg-blue-50 dark:bg-blue-900/20";
      case "issue":
        return "border-l-red-600 bg-red-50 dark:bg-red-900/20";
      case "update":
        return "border-l-emerald-600 bg-emerald-50 dark:bg-emerald-900/20";
      case "maintenance":
        return "border-l-amber-600 bg-amber-50 dark:bg-amber-900/20";
      default:
        return "border-l-slate-600 bg-slate-50 dark:bg-slate-900/20";
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-slate-600 dark:text-slate-400">Loading...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600">Unauthorized access</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Send Notification</h1>
        <p className="text-slate-600 dark:text-slate-400">
          Send notifications to all business owners or select specific users
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main form */}
        <form onSubmit={handleSendNotification} className="lg:col-span-2 space-y-6">
          {/* Alert messages */}
          {successMessage && (
            <div className="p-4 rounded-lg border border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20">
              <div className="flex items-start gap-3">
                <CheckIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                <p className="text-emerald-800 dark:text-emerald-200 text-sm">{successMessage}</p>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="p-4 rounded-lg border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
              <div className="flex items-start gap-3">
                <AlertIcon className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
                <p className="text-red-800 dark:text-red-200 text-sm">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Notification Type */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
              Notification Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: "announcement", label: "Announcement", icon: "📢" },
                { value: "issue", label: "Issue", icon: "⚠️" },
                { value: "update", label: "Update", icon: "✨" },
                { value: "maintenance", label: "Maintenance", icon: "🔧" },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setType(option.value as any)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    type === option.value
                      ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20"
                      : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                  }`}
                >
                  <span className="text-2xl mb-1">{option.icon}</span>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{option.label}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter notification title"
              className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter notification message (supports multiple lines)"
              rows={6}
              className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Recipient Selection */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
              Send To
            </label>
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <input
                  type="radio"
                  checked={sendToAll}
                  onChange={() => {
                    setSendToAll(true);
                    setSearchQuery("");
                  }}
                  className="w-4 h-4"
                />
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">All Business Owners</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Send to all {availableUsers.length} users</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <input
                  type="radio"
                  checked={!sendToAll}
                  onChange={() => setSendToAll(false)}
                  className="w-4 h-4"
                />
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">Selected Users</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Send to {selectedUserIds.length} selected users</p>
                </div>
              </label>
            </div>

            {!sendToAll && (
              <div className="mt-4 space-y-3">
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {availableUsers
                    .filter((user) =>
                      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      user.email.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((user) => (
                      <label key={user.id} className="flex items-center gap-3 p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedUserIds.includes(user.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedUserIds([...selectedUserIds, user.id]);
                            } else {
                              setSelectedUserIds(selectedUserIds.filter((id) => id !== user.id));
                            }
                          }}
                          className="w-4 h-4"
                        />
                        <div className="text-sm">
                          <p className="font-medium text-slate-900 dark:text-white">{user.name}</p>
                          <p className="text-xs text-slate-600 dark:text-slate-400">{user.email}</p>
                        </div>
                      </label>
                    )).length === 0 && (
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {availableUsers.length === 0 ? "No users available" : "No users match your search"}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={sending || !title.trim() || !message.trim()}
            className="w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white font-semibold rounded-lg transition-colors"
          >
            {sending ? "Sending..." : "Send Notification"}
          </button>
        </form>

        {/* Preview */}
        <div>
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Preview</h3>
          <div className={`p-4 border-l-4 rounded-lg ${getTypeColor(type)}`}>
            <div className="flex items-start gap-3">
              <span className="text-2xl">{getTypeIcon(type)}</span>
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-white text-sm">
                  {title || "Notification Title"}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 whitespace-pre-wrap">
                  {message || "Notification message will appear here..."}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">Recipients</p>
            <p className="text-sm text-slate-900 dark:text-white">
              {sendToAll ? `All ${availableUsers.length} business owners` : `${selectedUserIds.length} selected user${selectedUserIds.length !== 1 ? "s" : ""}`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
