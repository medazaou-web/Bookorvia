"use client";
import { useEffect, useState } from "react";
import supabase from "../../../lib/supabase/browserClient";
import { CheckIcon, CloseIcon, CalendarIcon } from "@/components/icons";
import { useLanguage } from '@/lib/context/LanguageContext';
import { useTranslations } from '@/lib/i18n';

export default function DashboardBookings() {
  const { language } = useLanguage();
  const t = useTranslations(language);
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Helper to format time from ISO string
  function formatTime(isoString?: string) {
    if (!isoString) return '—';
    try {
      return new Date(isoString).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '—';
    }
  }

  // Helper to format duration
  function formatDuration(minutes?: number) {
    if (!minutes) return '—';
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }

  async function load() {
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
        setRequests([]);
        setLoading(false);
        return;
      }

      const { data, error: reqErr } = await supabase.from("booking_requests").select("id, client_name, client_phone, service, services_json, requested_date, requested_time, status, created_at, duration_minutes, starts_at, ends_at").eq("business_id", businessId).order("created_at", { ascending: false });
      if (reqErr) throw reqErr;
      setRequests(data ?? []);
    } catch (e: any) {
      setError(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    
    // Subscribe to real-time booking updates
    let channel: any = null;
    
    async function setupSubscription() {
      try {
        const { data: userData } = await supabase.auth.getUser();
        const user = (userData as any)?.user ?? null;
        if (!user) return;

        const { data: biz } = await supabase.from("businesses").select("id").eq("user_id", user.id).single();
        const businessIdForSubscription = (biz as any)?.id ?? null;
        
        if (!businessIdForSubscription) return;

        console.log("📡 Setting up real-time subscription for bookings:", businessIdForSubscription);
        
        // Remove any existing channel before creating new one
        const existingChannel = supabase.getChannels().find(ch => ch.topic === `realtime:bookings:${businessIdForSubscription}`);
        if (existingChannel) {
          await supabase.removeChannel(existingChannel);
        }
        
        channel = supabase
          .channel(`bookings:${businessIdForSubscription}`, { config: { broadcast: { self: true } } })
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "booking_requests",
              filter: `business_id=eq.${businessIdForSubscription}`,
            },
            (payload) => {
              console.log("📡 Booking update received:", payload);
              // Silently update the requests without showing loading indicator
              load();
            }
          )
          .subscribe((status) => {
            console.log("📡 Booking subscription status:", status);
          });
      } catch (err) {
        console.error("📡 Error setting up booking subscription:", err);
      }
    }

    setupSubscription();
    
    // Proper cleanup on unmount
    return () => {
      if (channel) {
        console.log("📡 Cleaning up booking subscription");
        supabase.removeChannel(channel);
      }
    };
  }, []);

  async function updateStatus(id: string, status: string) {
    setRefreshing(true);
    setError(null);
    try {
      const { error: upErr } = await supabase.from("booking_requests").update({ status }).eq("id", id);
      if (upErr) throw upErr;
      
      // Send email notification
      try {
        console.log("📧 Sending status update for booking:", { bookingId: id, newStatus: status });
        const emailRes = await fetch("/api/send-booking-status-update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bookingId: id, newStatus: status }),
        });
        console.log("📧 Email API response:", emailRes.status, emailRes.statusText);
        if (!emailRes.ok) {
          const errorText = await emailRes.text();
          console.error("❌ Email API error:", errorText);
        }
      } catch (emailErr) {
        console.error("❌ Failed to send notification email:", emailErr);
        // Don't fail the operation if email fails
      }

      // Create in-app notification
      try {
        const booking = requests.find(r => r.id === id);
        const statusEmojis: { [key: string]: string } = {
          accepted: "✅",
          pending: "⏳",
          completed: "🎉",
          refused: "❌"
        };

        const statusTexts: { [key: string]: string } = {
          accepted: t('dashboardUI.bookingsStatusAccepted'),
          pending: t('dashboardUI.bookingsStatusPending'),
          completed: t('dashboardUI.bookingsStatusCompleted'),
          refused: t('dashboardUI.bookingsStatusRefused')
        };

        const statusEmoji = statusEmojis[status] || "🔔";
        const statusText = statusTexts[status] || status;

        const { data: bizData } = await supabase
          .from("businesses")
          .select("id, name, user_id")
          .eq("user_id", (await supabase.auth.getUser()).data.user?.id)
          .single();

        if (bizData?.id) {
          await fetch("/api/notifications/create", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              businessId: bizData.id,
              type: "update",
              title: `Booking Status Updated ${statusEmoji}`,
              message: `${booking?.client_name}'s booking for ${booking?.service} has been ${statusText}`,
              data: {
                bookingId: id,
                newStatus: status,
                clientName: booking?.client_name,
                service: booking?.service,
              },
            }),
          }).catch(err => console.error("Failed to create in-app notification:", err));

          // Send email to business owner
          try {
            // Get business owner email using server-side endpoint
            const emailRes = await fetch(`/api/get-business-owner-email?businessId=${bizData.id}`);
            const emailData = await emailRes.json();
            const businessOwnerEmail = emailData?.email || null;

            if (businessOwnerEmail) {
              const statusColorMap: { [key: string]: string } = {
                accepted: "#10b981",
                pending: "#f59e0b",
                completed: "#3b82f6",
                refused: "#ef4444"
              };

              const emailHtml = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <div style="background: linear-gradient(to right, #4f46e5, #2563eb); color: white; padding: 24px; border-radius: 12px 12px 0 0;">
                    <h1 style="margin: 0; font-size: 24px;">🔔 Booking Status Updated</h1>
                  </div>
                  <div style="background: #f8f9fa; padding: 24px; border-radius: 0 0 12px 12px;">
                    <p style="margin: 0 0 16px 0; font-size: 16px;">
                      You have updated a booking status:
                    </p>
                    
                    <div style="background: white; padding: 16px; border-left: 4px solid ${statusColorMap[status] || '#4f46e5'}; margin: 16px 0; border-radius: 4px;">
                      <p style="margin: 8px 0;"><strong>Client Name:</strong> ${booking?.client_name}</p>
                      <p style="margin: 8px 0;"><strong>Service(s):</strong> ${booking?.service}</p>
                      <p style="margin: 8px 0;"><strong>Booking Date:</strong> ${booking?.requested_date}</p>
                      <p style="margin: 8px 0;"><strong>Booking Time:</strong> ${booking?.requested_time}</p>
                      <p style="margin: 12px 0 0 0;">
                        <strong>New Status:</strong> 
                        <span style="display: inline-block; background: ${statusColorMap[status] || '#4f46e5'}; color: white; padding: 6px 12px; border-radius: 4px; font-weight: bold;">
                          ${statusText}
                        </span>
                      </p>
                    </div>

                    <p style="margin: 16px 0; text-align: center;">
                      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/bookings" style="display: inline-block; background: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                        View in Dashboard
                      </a>
                    </p>

                    <p style="margin: 16px 0 0 0; font-size: 12px; color: #666; text-align: center;">
                      Status has been updated in your system.
                    </p>
                  </div>
                </div>
              `;

              await fetch("/api/send-notification-email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  businessOwnerEmail,
                  businessName: bizData.name,
                  type: "status_update",
                  subject: `Booking Status Updated: ${booking?.client_name} - ${statusText}`,
                  html: emailHtml,
                }),
              }).catch(err => console.error("Failed to send email notification:", err));
            }
          } catch (emailErr) {
            console.error("Failed to send email to business owner:", emailErr);
          }
        }
      } catch (err) {
        console.error("Failed to create in-app notification:", err);
      }
      
      await load();
    } catch (e: any) {
      setError(e?.message || String(e));
    } finally {
      setRefreshing(false);
    }
  }

  const totalPages = Math.ceil(requests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedRequests = requests.slice(startIndex, endIndex);

  return (
    <div>
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">{t('dashboard.bookings')}</h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">{t('dashboard.manageBookingRequests')}</p>
      </div>

      {/* Bookings Table / Cards */}
      {loading ? (
        <div className="p-12 text-center text-slate-600 dark:text-slate-400">{t('common.loading')}</div>
      ) : error ? (
        <div className="p-6 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 font-medium">⚠️ {error}</div>
      ) : requests.length === 0 ? (
        <div className="rounded-3xl bg-white/80 dark:bg-slate-900/50 backdrop-blur border border-white/60 dark:border-white/10 shadow-lg p-12 text-center">
          <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-40" />
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">{t('dashboard.noBookingRequests')}</h3>
          <p className="text-slate-600 dark:text-slate-400">{t('dashboard.bookingsHelpText')}</p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden lg:block rounded-3xl bg-white/80 dark:bg-slate-900/50 backdrop-blur border border-white/60 dark:border-white/10 shadow-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                  <th className="px-6 py-4">{t('common.client')}</th>
                  <th className="px-6 py-4">{t('common.phone')}</th>
                  <th className="px-6 py-4">{t('common.service')}</th>
                  <th className="px-6 py-4">{t('common.date')}</th>
                  <th className="px-6 py-4">{t('common.time')}</th>
                  <th className="px-6 py-4">{t('common.duration')}</th>
                  <th className="px-6 py-4">{t('common.status')}</th>
                  <th className="px-6 py-4 text-right">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700/50">
                {paginatedRequests.map((r) => (
                  <tr key={r.id} className="hover:bg-indigo-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 text-slate-900 dark:text-slate-100 font-semibold">{r.client_name}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400 font-mono">{r.client_phone}</td>
                    <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                      {r.services_json ? (
                        <div className="text-sm space-y-1">
                          {JSON.parse(r.services_json).map((svc: any, idx: number) => (
                            <div key={idx}>{svc.name}</div>
                          ))}
                        </div>
                      ) : (
                        r.service
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{r.requested_date}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{r.starts_at ? formatTime(r.starts_at) : r.requested_time}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{formatDuration(r.duration_minutes)}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={r.status} t={t} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className={`flex justify-end ${r.status === 'completed' ? '' : 'gap-2'}`}>
                        {r.status === 'completed' ? (
                          <button 
                            disabled={refreshing} 
                            onClick={() => updateStatus(r.id, 'refused')} 
                            className="px-4 py-2 rounded-lg bg-red-600 text-white text-xs font-bold hover:shadow-lg active:scale-95 disabled:opacity-60 transition-all"
                          >
                            ✕ {t('common.refuse')}
                          </button>
                        ) : (
                          <>
                            {r.status !== 'accepted' && (
                              <button 
                                disabled={refreshing} 
                                onClick={() => updateStatus(r.id, 'accepted')} 
                                className="px-3 py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:shadow-lg active:scale-95 disabled:opacity-60 transition-all"
                              >
                                ✓ {t('common.accept')}
                              </button>
                            )}
                            {r.status !== 'refused' && (
                              <button 
                                disabled={refreshing} 
                                onClick={() => updateStatus(r.id, 'refused')} 
                                className="px-3 py-2 rounded-lg bg-red-600 text-white text-xs font-bold hover:shadow-lg active:scale-95 disabled:opacity-60 transition-all"
                              >
                                ✕ {t('common.refuse')}
                              </button>
                            )}
                            {r.status !== 'completed' && (
                              <button 
                                disabled={refreshing} 
                                onClick={() => updateStatus(r.id, 'completed')} 
                                className="px-3 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold hover:shadow-lg active:scale-95 disabled:opacity-60 transition-all"
                              >
                                ✓✓ {t('common.complete')}
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden space-y-4">
            {paginatedRequests.map((r) => (
              <div key={r.id} className="rounded-2xl bg-white/80 dark:bg-slate-900/50 backdrop-blur border border-white/60 dark:border-white/10 shadow-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{r.client_name}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 font-mono">{r.client_phone}</p>
                  </div>
                  <StatusBadge status={r.status} t={t} />
                </div>

                <div className="grid grid-cols-3 gap-3 mb-6 text-sm">
                  <div>
                    <div className="text-slate-600 dark:text-slate-400 text-xs font-semibold">Service(s)</div>
                    <div className="text-slate-900 dark:text-slate-100 font-semibold mt-1 text-xs space-y-1">
                      {r.services_json ? (
                        <>
                          {JSON.parse(r.services_json).map((svc: any, idx: number) => (
                            <div key={idx}>{svc.name}</div>
                          ))}
                        </>
                      ) : (
                        r.service
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-600 dark:text-slate-400 text-xs font-semibold">Date</div>
                    <div className="text-slate-900 dark:text-slate-100 font-semibold mt-1">{r.requested_date}</div>
                  </div>
                  <div>
                    <div className="text-slate-600 dark:text-slate-400 text-xs font-semibold">Time</div>
                    <div className="text-slate-900 dark:text-slate-100 font-semibold mt-1">{r.starts_at ? formatTime(r.starts_at) : r.requested_time}</div>
                  </div>
                  <div>
                    <div className="text-slate-600 dark:text-slate-400 text-xs font-semibold">Duration</div>
                    <div className="text-slate-900 dark:text-slate-100 font-semibold mt-1">{formatDuration(r.duration_minutes)}</div>
                  </div>
                </div>

                <div className={r.status === 'completed' ? 'flex' : 'flex gap-2'}>
                  {r.status === 'completed' ? (
                    <button 
                      disabled={refreshing} 
                      onClick={() => updateStatus(r.id, 'refused')} 
                      className="w-full px-3 py-2 rounded-lg bg-red-600 text-white text-xs font-bold hover:shadow-lg active:scale-95 disabled:opacity-60 transition-all"
                    >
                      {t('common.refuse')}
                    </button>
                  ) : (
                    <>
                      {r.status !== 'accepted' && (
                        <button 
                          disabled={refreshing} 
                          onClick={() => updateStatus(r.id, 'accepted')} 
                          className="flex-1 px-3 py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:shadow-lg active:scale-95 disabled:opacity-60 transition-all"
                        >
                          {t('common.accept')}
                        </button>
                      )}
                      {r.status !== 'refused' && (
                        <button 
                          disabled={refreshing} 
                          onClick={() => updateStatus(r.id, 'refused')} 
                          className="flex-1 px-3 py-2 rounded-lg bg-red-600 text-white text-xs font-bold hover:shadow-lg active:scale-95 disabled:opacity-60 transition-all"
                        >
                          {t('common.refuse')}
                        </button>
                      )}
                      {r.status !== 'completed' && (
                        <button 
                          disabled={refreshing} 
                          onClick={() => updateStatus(r.id, 'completed')} 
                          className="flex-1 px-3 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold hover:shadow-lg active:scale-95 disabled:opacity-60 transition-all"
                        >
                          {t('common.complete')}
                        </button>
                      )}
                    </>
                  )}
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
                ← {t('common.previous')}
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
                {t('common.next')} →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function StatusBadge({ status, t }: { status: string, t: any }) {
  const styles = {
    pending: 'bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-700',
    accepted: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700',
    completed: 'bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-300 border-blue-300 dark:border-blue-700',
    refused: 'bg-red-100 dark:bg-red-950 text-red-900 dark:text-red-300 border-red-300 dark:border-red-700',
  };
  const style = (styles as any)[status] || 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-300 border-slate-300 dark:border-slate-600';
  
  const statusTexts: { [key: string]: string } = {
    accepted: t('dashboardUI.bookingsStatusAccepted'),
    pending: t('dashboardUI.bookingsStatusPending'),
    completed: t('dashboardUI.bookingsStatusCompleted'),
    refused: t('dashboardUI.bookingsStatusRefused')
  };

  const displayText = statusTexts[status] || status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border ${style}`}>
      {status === 'accepted' && <CheckIcon className="h-4 w-4" />}
      {status === 'completed' && <CheckIcon className="h-4 w-4" />}
      {status === 'refused' && <CloseIcon className="h-4 w-4" />}
      {displayText}
    </span>
  );
}
