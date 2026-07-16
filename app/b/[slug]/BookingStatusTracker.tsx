"use client";
import { useEffect, useState } from "react";
import supabase from "../../../lib/supabase/browserClient";
import { CheckIcon, CloseIcon, ClockIcon, BellIcon } from "@/components/icons";

type BookingStatus = "pending" | "accepted" | "completed" | "refused";

type ThemeStyles = {
  sectionCard: string;
  innerCard: string;
  input: string;
  label: string;
  mutedText: string;
  buttonPrimary: string;
  buttonSecondary: string;
  timeSlot: string;
  timeSlotSelected: string;
  emptyState: string;
  success: string;
  error: string;
  progressBar: string;
};

export default function BookingStatusTracker({
  bookingId,
  clientName,
  clientPhone,
  themeStyles,
  businessSlug,
}: {
  bookingId: string;
  clientName: string;
  clientPhone: string;
  themeStyles?: ThemeStyles;
  businessSlug?: string;
}) {
  const defaultTheme: ThemeStyles = {
    sectionCard: "bg-white/60 border-slate-200",
    innerCard: "bg-white border-slate-200",
    input: "bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:ring-indigo-500 focus:border-indigo-500",
    label: "text-slate-900",
    mutedText: "text-slate-600",
    buttonPrimary: "bg-indigo-600 hover:bg-indigo-700 text-white font-bold",
    buttonSecondary: "border-slate-300 text-slate-900 hover:bg-slate-50",
    timeSlot: "bg-white border-slate-300 text-slate-900 hover:bg-slate-50",
    timeSlotSelected: "bg-indigo-600 border-indigo-600 text-white font-bold",
    emptyState: "bg-slate-50 border-slate-200 text-slate-600",
    success: "bg-emerald-50 border-emerald-200 text-emerald-800",
    error: "bg-red-50 border-red-200 text-red-800",
    progressBar: "bg-indigo-600"
  };

  const theme = themeStyles || defaultTheme;
  const [bookingStatus, setBookingStatus] = useState<BookingStatus>("pending");
  const [clientEmail, setClientEmail] = useState("");
  const [isNotificationEnabled, setIsNotificationEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch current booking status
  useEffect(() => {
    const fetchBookingStatus = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from("booking_requests")
          .select("status, client_email, notification_enabled")
          .eq("id", bookingId)
          .single();

        if (fetchError) throw fetchError;

        if (data) {
          setBookingStatus(data.status || "pending");
          if (data.client_email) setClientEmail(data.client_email);
          if (data.notification_enabled) setIsNotificationEnabled(data.notification_enabled);
        }
      } catch (err) {
        console.error("Error fetching booking status:", err);
      }
    };

    fetchBookingStatus();

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
          setBookingStatus(payload.new.status || "pending");
          if (payload.new.status !== "pending") {
            setMessage(`🎉 Your booking status has been updated to: ${payload.new.status}`);
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [bookingId]);

  const handleEmailSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!clientEmail || !clientEmail.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const { error: updateError } = await supabase
        .from("booking_requests")
        .update({
          client_email: clientEmail,
          notification_enabled: true,
        })
        .eq("id", bookingId);

      if (updateError) throw updateError;

      // Send confirmation email
      try {
        await fetch("/api/send-booking-notification", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bookingId,
            clientEmail,
            clientName,
            status: bookingStatus,
          }),
        });
      } catch (emailErr) {
        console.error("Failed to send confirmation email:", emailErr);
        // Don't fail the whole operation if email fails
      }

      setIsNotificationEnabled(true);
      setMessage("✅ Email notifications enabled! We'll notify you of any status changes.");
    } catch (err: any) {
      setError(err?.message || "Failed to enable notifications");
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = () => {
    switch (bookingStatus) {
      case "accepted":
        return <CheckIcon className="h-6 w-6 text-emerald-600" />;
      case "refused":
        return <CloseIcon className="h-6 w-6 text-red-600" />;
      case "completed":
        return <CheckIcon className="h-6 w-6 text-blue-600" />;
      default:
        return <ClockIcon className="h-6 w-6 text-amber-600" />;
    }
  };

  const getStatusColor = () => {
    switch (bookingStatus) {
      case "accepted":
        return "bg-emerald-50 border-emerald-200 text-emerald-800";
      case "refused":
        return "bg-red-50 border-red-200 text-red-800";
      case "completed":
        return "bg-blue-50 border-blue-200 text-blue-800";
      default:
        return "bg-amber-50 border-amber-200 text-amber-800";
    }
  };

  const getStatusLabel = () => {
    switch (bookingStatus) {
      case "accepted":
        return "✓ Confirmed";
      case "refused":
        return "✗ Not Available";
      case "completed":
        return "✓ Completed";
      default:
        return "⏳ Pending Review";
    }
  };

  return (
    <div className={`mt-8 rounded-2xl ${theme.sectionCard} backdrop-blur border shadow-lg p-6 sm:p-8 space-y-6`}>
      {/* Header */}
      <div>
        <h3 className={`text-2xl font-bold ${theme.label} mb-2`}>Booking Status</h3>
        <p className={`${theme.mutedText} text-sm`}>Track your booking and receive updates</p>
      </div>

      {/* Status Display */}
      <div className={`rounded-xl border p-6 sm:p-8 flex items-center gap-4 ${getStatusColor()}`}>
        <div className="flex-shrink-0">
          {getStatusIcon()}
        </div>
        <div className="flex-1">
          <p className="font-semibold text-lg">{getStatusLabel()}</p>
          <p className="text-sm opacity-75 mt-1">
            {bookingStatus === "pending" && "The business will review your request and confirm soon."}
            {bookingStatus === "accepted" && "Great! Your booking has been confirmed. Check your phone for details."}
            {bookingStatus === "refused" && "Unfortunately, this time slot is no longer available. Please try booking another time."}
            {bookingStatus === "completed" && "Your service has been completed. Thank you for booking with us!"}
          </p>
        </div>
      </div>

      {/* Email Notification Section */}
      {!isNotificationEnabled ? (
        <div className={`rounded-xl border p-6 sm:p-8 ${theme.innerCard}`}>
          <div className="flex items-start gap-3 mb-4">
            <BellIcon className="h-5 w-5 flex-shrink-0 mt-0.5 opacity-60" />
            <div>
              <p className={`font-semibold ${theme.label}`}>Stay Updated</p>
              <p className={`text-sm ${theme.mutedText} mt-1`}>
                Add your email to receive notifications when your booking status changes
              </p>
            </div>
          </div>

          <form onSubmit={handleEmailSubscription} className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                placeholder="your@email.com"
                className={`flex-1 px-4 py-2.5 rounded-lg border ${theme.input} focus:border-transparent focus:ring-2 transition-all text-sm`}
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !clientEmail}
                className={`px-4 sm:px-6 py-2.5 rounded-lg ${theme.buttonPrimary} shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-semibold whitespace-nowrap`}
              >
                {loading ? "Saving..." : "Enable Notifications"}
              </button>
            </div>
          </form>

          {error && (
            <p className={`text-sm ${theme.error} mt-3 px-3 py-2 rounded-lg`}>
              {error}
            </p>
          )}

          {message && (
            <p className={`text-sm ${theme.success} mt-3 px-3 py-2 rounded-lg`}>
              {message}
            </p>
          )}
        </div>
      ) : (
        <div className={`rounded-xl border p-4 sm:p-6 ${theme.success} flex items-center gap-3`}>
          <CheckIcon className="h-5 w-5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-sm">Notifications Active</p>
            <p className="text-xs opacity-75 mt-0.5">Updates will be sent to {clientEmail}</p>
          </div>
        </div>
      )}

      {/* Booking Details */}
      <div className={`rounded-xl border p-4 sm:p-6 ${theme.innerCard} space-y-3 text-sm`}>
        <div className="flex justify-between items-center">
          <span className={theme.mutedText}>Name:</span>
          <span className={`font-semibold ${theme.label}`}>{clientName}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className={theme.mutedText}>Phone:</span>
          <span className={`font-semibold ${theme.label}`}>{clientPhone}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className={theme.mutedText}>Booking ID:</span>
          <span className={`font-mono text-xs ${theme.label}`}>{bookingId.slice(0, 8)}...</span>
        </div>
      </div>

      {/* Help Section */}
      <div className={`rounded-xl border p-4 sm:p-6 ${theme.emptyState} space-y-2 text-sm`}>
        <p className="font-semibold">Questions?</p>
        <p className={theme.mutedText}>
          If you don't see an email from us within 24 hours, or need immediate assistance, please contact the business directly using their phone or WhatsApp.
        </p>
      </div>
    </div>
  );
}
