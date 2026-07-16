"use client";
import { useEffect, useState } from "react";
import { use } from "react";
import supabase from "../../../lib/supabase/browserClient";
import { CheckIcon, CloseIcon, ClockIcon } from "@/components/icons";
import { useLanguage } from '../../../lib/context/LanguageContext';
import { useTranslations } from '../../../lib/i18n';

type BookingStatus = "pending" | "accepted" | "completed" | "refused";

export default function BookingStatusPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const bookingId = id;
  const { language } = useLanguage();
  const t = useTranslations(language);
  
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!bookingId) {
      setError("No booking ID provided");
      setLoading(false);
      return;
    }

    const fetchBooking = async () => {
      try {
        console.log("🔍 Fetching booking:", bookingId);
        
        // First fetch booking_requests
        const { data, error: fetchError } = await supabase
          .from("booking_requests")
          .select("*")
          .eq("id", bookingId)
          .single();

        console.log("🔍 Booking fetch result:", { data, error: fetchError?.message });

        if (fetchError) throw fetchError;
        if (!data) throw new Error("Booking not found");

        // Then fetch business separately if needed
        let bookingWithBusiness = data;
        if (data.business_id) {
          const { data: business, error: businessError } = await supabase
            .from("businesses")
            .select("name, logo_url")
            .eq("id", data.business_id)
            .single();
          
          if (business) {
            bookingWithBusiness = { ...data, businesses: business };
          }
        }

        console.log("✅ Booking loaded:", bookingWithBusiness);
        setBooking(bookingWithBusiness);
      } catch (err: any) {
        console.error("❌ Error fetching booking:", err);
        setError(err?.message || "Failed to load booking");
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();

    // Subscribe to real-time updates
    const subscription = supabase
      .channel(`booking_${bookingId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "booking_requests",
          filter: `id=eq.${bookingId}`,
        },
        (payload: any) => {
          setBooking(payload.new);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [bookingId]);

  const getStatusIcon = (status: BookingStatus) => {
    switch (status) {
      case "pending":
        return <ClockIcon className="h-8 w-8 text-amber-500" />;
      case "accepted":
        return <CheckIcon className="h-8 w-8 text-emerald-500" />;
      case "completed":
        return <CheckIcon className="h-8 w-8 text-blue-500" />;
      case "refused":
        return <CloseIcon className="h-8 w-8 text-red-500" />;
      default:
        return <ClockIcon className="h-8 w-8 text-slate-500" />;
    }
  };

  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case "pending":
        return {
          bg: "bg-amber-50 dark:bg-amber-950/20",
          border: "border-amber-200 dark:border-amber-900/50",
          text: "text-amber-800 dark:text-amber-200",
          badge: "bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200",
        };
      case "accepted":
        return {
          bg: "bg-emerald-50 dark:bg-emerald-950/20",
          border: "border-emerald-200 dark:border-emerald-900/50",
          text: "text-emerald-800 dark:text-emerald-200",
          badge: "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200",
        };
      case "completed":
        return {
          bg: "bg-blue-50 dark:bg-blue-950/20",
          border: "border-blue-200 dark:border-blue-900/50",
          text: "text-blue-800 dark:text-blue-200",
          badge: "bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200",
        };
      case "refused":
        return {
          bg: "bg-red-50 dark:bg-red-950/20",
          border: "border-red-200 dark:border-red-900/50",
          text: "text-red-800 dark:text-red-200",
          badge: "bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200",
        };
      default:
        return {
          bg: "bg-slate-50 dark:bg-slate-950/20",
          border: "border-slate-200 dark:border-slate-900/50",
          text: "text-slate-800 dark:text-slate-200",
          badge: "bg-slate-100 dark:bg-slate-900/50 text-slate-800 dark:text-slate-200",
        };
    }
  };

  const getStatusLabel = (status: BookingStatus) => {
    switch (status) {
      case "pending":
        return t('bookingStatus.pendingConfirmation');
      case "accepted":
        return t('bookingStatus.confirmed');
      case "completed":
        return t('bookingStatus.completed');
      case "refused":
        return t('bookingStatus.notAvailable');
      default:
        return t('bookingStatus.unknown');
    }
  };

  const getStatusMessage = (status: BookingStatus) => {
    switch (status) {
      case "pending":
        return t('bookingStatus.bookingRequestBeingReviewed');
      case "accepted":
        return t('bookingStatus.bookingConfirmed');
      case "completed":
        return t('bookingStatus.bookingCompleted');
      case "refused":
        return t('bookingStatus.timeSlotNotAvailable');
      default:
        return t('bookingStatus.bookingStatusUnknown');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">{t('bookingStatus.loadingYourBooking')}</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center p-4">
        <div className="rounded-3xl bg-white/80 dark:bg-slate-900/50 backdrop-blur border border-white/60 dark:border-white/10 shadow-lg p-8 max-w-md w-full text-center">
          <CloseIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">{t('bookingStatus.bookingNotFound')}</h1>
          <p className="text-slate-600 dark:text-slate-400">{error || t('bookingStatus.couldntFindBooking')}</p>
        </div>
      </div>
    );
  }

  const status = booking.status as BookingStatus;
  const colors = getStatusColor(status);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4 sm:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-slate-100 mb-2">{t('bookingStatus.bookingStatus')}</h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">{t('bookingStatus.trackYourAppointmentInRealTime')}</p>
        </div>

        {/* Status Card */}
        <div className={`rounded-3xl border-2 ${colors.border} ${colors.bg} backdrop-blur p-8 sm:p-12 mb-8`}>
          <div className="flex flex-col items-center text-center">
            <div className="mb-6">{getStatusIcon(status)}</div>
            <h2 className={`text-3xl sm:text-4xl font-bold ${colors.text} mb-2`}>{getStatusLabel(status)}</h2>
            <p className={`text-lg ${colors.text} opacity-90`}>{getStatusMessage(status)}</p>
            <div className={`mt-6 inline-block px-6 py-3 rounded-full font-bold ${colors.badge} text-sm uppercase tracking-wide`}>
              {status}
            </div>
          </div>
        </div>

        {/* Booking Details */}
        <div className="rounded-3xl bg-white/80 dark:bg-slate-900/50 backdrop-blur border border-white/60 dark:border-white/10 shadow-lg p-6 sm:p-8 mb-8">
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-6">{t('bookingStatus.bookingDetails')}</h3>

          <div className="space-y-4">
            {/* Client Name */}
            <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-slate-700/50">
              <span className="text-slate-600 dark:text-slate-400 font-medium">{t('bookingStatus.name')}</span>
              <span className="text-slate-900 dark:text-slate-100 font-semibold">{booking.client_name}</span>
            </div>

            {/* Business */}
            {booking.businesses?.name && (
              <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-slate-700/50">
                <span className="text-slate-600 dark:text-slate-400 font-medium">{t('bookingStatus.business')}</span>
                <span className="text-slate-900 dark:text-slate-100 font-semibold">{booking.businesses.name}</span>
              </div>
            )}

            {/* Service(s) */}
            {booking.service && (
              <div className="flex justify-between items-start pb-4 border-b border-slate-200 dark:border-slate-700/50">
                <span className="text-slate-600 dark:text-slate-400 font-medium">{t('bookingStatus.services')}</span>
                <div className="text-slate-900 dark:text-slate-100 font-semibold text-right">
                  {booking.services_json ? (
                    <div className="space-y-1">
                      {JSON.parse(booking.services_json).map((svc: any, idx: number) => (
                        <div key={idx} className="text-sm">
                          {svc.name} <span className="text-slate-500 dark:text-slate-400 font-normal">({svc.duration_minutes} min)</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    booking.service
                  )}
                </div>
              </div>
            )}

            {/* Date */}
            {booking.requested_date && (
              <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-slate-700/50">
                <span className="text-slate-600 dark:text-slate-400 font-medium">{t('bookingStatusPage.date')}</span>
                <span className="text-slate-900 dark:text-slate-100 font-semibold">{booking.requested_date}</span>
              </div>
            )}

            {/* Time */}
            {booking.requested_time && (
              <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-slate-700/50">
                <span className="text-slate-600 dark:text-slate-400 font-medium">{t('bookingStatusPage.time')}</span>
                <span className="text-slate-900 dark:text-slate-100 font-semibold">{booking.requested_time}</span>
              </div>
            )}

            {/* Duration */}
            {booking.duration_minutes && (
              <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-slate-700/50">
                <span className="text-slate-600 dark:text-slate-400 font-medium">{t('bookingStatusPage.duration')}</span>
                <span className="text-slate-900 dark:text-slate-100 font-semibold">
                  {booking.duration_minutes < 60 ? `${booking.duration_minutes} min` : `${Math.floor(booking.duration_minutes / 60)}h ${booking.duration_minutes % 60}m`}
                </span>
              </div>
            )}

            {/* Booking ID */}
            <div className="flex justify-between items-center">
              <span className="text-slate-600 dark:text-slate-400 font-medium">{t('bookingStatusPage.bookingId')}</span>
              <span className="text-slate-900 dark:text-slate-100 font-mono text-sm">{booking.id}</span>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="rounded-2xl bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/50 p-6 text-center">
          <p className="text-indigo-800 dark:text-indigo-200">
            {t('bookingStatusPage.tipPageUpdatesAutomatically')}
          </p>
        </div>
      </div>
    </div>
  );
}
