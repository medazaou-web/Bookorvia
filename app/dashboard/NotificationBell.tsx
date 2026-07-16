"use client";
import { useEffect, useState, useRef } from "react";
import supabase from "@/lib/supabase/browserClient";
import { BellIcon } from "@/components/icons";
import { useLanguage } from "@/lib/context/LanguageContext";
import { useTranslations } from "@/lib/i18n";

interface Notification {
  id: string;
  business_id: string;
  type: "announcement" | "issue" | "update" | "maintenance";
  title: string;
  message: string;
  data?: any;
  read: boolean;
  created_at: string;
}

export default function NotificationBell() {
  const { language } = useLanguage();
  const t = useTranslations(language);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [businessId, setBusinessId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get business ID
  useEffect(() => {
    async function getBusinessId() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      console.log("🔔 NotificationBell: User fetched:", user?.id);
      if (user) {
        const { data: business, error } = await supabase
          .from("businesses")
          .select("id")
          .eq("user_id", user.id)
          .single();
        console.log("🔔 NotificationBell: Business query result:", { business, error });
        if (business) {
          setBusinessId(business.id);
          console.log("🔔 NotificationBell: Business ID set to:", business.id);
        }
      }
    }
    getBusinessId();
  }, []);

  // Subscribe to real-time notifications
  useEffect(() => {
    if (!businessId) {
      console.log("🔔 NotificationBell: Skipping subscription, no businessId");
      return;
    }

    console.log("🔔 NotificationBell: Setting up subscription for business:", businessId);

    // Load initial notifications
    loadNotifications();

    // Subscribe to new notifications
    const channel = supabase
      .channel(`notifications:${businessId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `business_id=eq.${businessId}`,
        },
        (payload) => {
          console.log("🔔 NotificationBell: New notification received:", payload);
          setNotifications((prev) => [payload.new as Notification, ...prev]);
          playNotificationSound();
        }
      )
      .subscribe((status) => {
        console.log("🔔 NotificationBell: Subscription status:", status);
      });

    return () => {
      console.log("🔔 NotificationBell: Cleaning up subscription");
      supabase.removeChannel(channel);
    };
  }, [businessId]);

  async function loadNotifications() {
    if (!businessId) {
      console.log("🔔 NotificationBell: Cannot load notifications, no businessId");
      return;
    }
    console.log("🔔 NotificationBell: Loading notifications for business:", businessId);
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("business_id", businessId)
      .order("created_at", { ascending: false })
      .limit(20);
    console.log("🔔 NotificationBell: Loaded notifications:", { count: data?.length, error });
    setNotifications(data || []);
  }

  async function markAsRead(id: string) {
    const { error } = await supabase.from("notifications").update({ read: true }).eq("id", id);
    if (error) {
      console.error("Error marking notification as read:", error);
      return;
    }
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }

  async function markAllAsRead() {
    const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id);
    if (unreadIds.length === 0) return;

    const { error } = await supabase.from("notifications").update({ read: true }).in("id", unreadIds);
    if (error) {
      console.error("Error marking all as read:", error);
      return;
    }
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  async function deleteNotification(id: string) {
    const { error } = await supabase.from("notifications").delete().eq("id", id);
    if (error) {
      console.error("Error deleting notification:", error);
      return;
    }
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }

  function playNotificationSound() {
    // Simple beep sound - you can replace with actual audio file
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = "sine";

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  }

  function getNotificationIconComponent(type: string) {
    const iconProps = "w-5 h-5";
    switch (type) {
      case "announcement":
        return <span className="text-xl">📢</span>;
      case "issue":
        return <span className="text-xl">⚠️</span>;
      case "update":
        return <span className="text-xl">✨</span>;
      case "maintenance":
        return <span className="text-xl">🔧</span>;
      default:
        return <BellIcon className={iconProps} />;
    }
  }

  function getNotificationColor(type: string) {
    switch (type) {
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

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
        title="Notifications"
      >
        <BellIcon className="w-6 h-6 text-slate-700 dark:text-slate-300" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {open && (
        <div className="absolute right-0 mt-2 w-96 max-h-96 overflow-y-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl z-50">
          {/* Header */}
          <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-4 py-3 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-slate-100">{t('notifications.title')}</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                {t('notifications.markAllAsRead')}
              </button>
            )}
          </div>

          {/* Notifications List */}
          {notifications.length > 0 ? (
            <div className="divide-y divide-slate-200 dark:divide-slate-700">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-l-4 cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 ${getNotificationColor(
                    notification.type
                  )}`}
                  onClick={() => !notification.read && markAsRead(notification.id)}
                >
                  <div className="flex gap-3">
                    <div className="text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-1">
                      {getNotificationIconComponent(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold text-sm ${!notification.read ? "text-slate-900 dark:text-slate-100" : "text-slate-700 dark:text-slate-300"}`}>
                        {notification.title}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{notification.message}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">
                        {new Date(notification.created_at).toLocaleString()}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 rounded-full bg-indigo-600 mt-2 flex-shrink-0"></div>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(notification.id);
                    }}
                    className="text-xs text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 mt-2"
                  >
                    {t('notifications.delete')}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-600 dark:text-slate-400">
              <p className="text-sm">{t('notifications.noNotifications')}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
