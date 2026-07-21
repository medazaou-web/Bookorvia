"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import supabase from "../../../lib/supabase/browserClient";
import { useTranslations } from "@/lib/i18n";
import DatePicker from "@/components/ui/DatePicker";
import { CalendarIcon, ClockIcon } from "@/components/icons";

type Service = {
  id: string;
  name: string;
  description?: string | null;
  price?: number | null;
  currency?: string | null;
  duration_minutes?: number | null;
  is_active?: boolean;
  background_image_url?: string | null;
};

type AvailableSlot = {
  label: string;
  starts_at: string;
  ends_at: string;
};

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

export default function BookingForm({ businessId, services, businessSlug, themeStyles, language = 'en', brandColor = '#4f46e5', accentColor = '#06b6d4' }: { businessId: string; services?: Service[]; businessSlug?: string; themeStyles?: ThemeStyles; language?: string; brandColor?: string; accentColor?: string }) {
  const searchParams = useSearchParams();
  const preSelectedServiceId = searchParams.get("service");
  const t = useTranslations(language as any);

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
  const [client_name, setClientName] = useState("");
  const [client_phone, setClientPhone] = useState("");
  const [client_email, setClientEmail] = useState("");
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>(() => {
    return preSelectedServiceId ? [preSelectedServiceId] : [];
  });
  const [requested_date, setRequestedDate] = useState("");
  const [requestedTime, setRequestedTime] = useState("");
  const [message, setMessage] = useState("");
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Get selected services
  const selectedServices = selectedServiceIds
    .map(id => services?.find(s => s.id === id))
    .filter((s): s is Service => !!s);

  // Load available slots when service and date change
  useEffect(() => {
    if (selectedServiceIds.length > 0 && requested_date && businessSlug) {
      // Use the first selected service for time slot availability
      const firstServiceId = selectedServiceIds[0];
      loadAvailableSlots(firstServiceId);
    } else {
      setAvailableSlots([]);
    }
  }, [selectedServiceIds, requested_date, businessSlug]);

  async function loadAvailableSlots(serviceId: string) {
    setLoadingSlots(true);
    setAvailableSlots([]);
    setRequestedTime("");

    try {
      const url = `/api/public/availability?slug=${businessSlug}&serviceId=${serviceId}&date=${requested_date}`;
      console.log("Fetching availability from:", url);
      
      const response = await fetch(url);
      const data = await response.json();

      console.log("Availability response:", data);

      if (data.slots && Array.isArray(data.slots)) {
        console.log("Found slots:", data.slots.length);
        setAvailableSlots(data.slots);
      } else if (data.availableSlots && Array.isArray(data.availableSlots)) {
        console.log("Found availableSlots (legacy):", data.availableSlots.length);
        setAvailableSlots(data.availableSlots);
      } else {
        console.log("No slots in response");
        setAvailableSlots([]);
      }
    } catch (err) {
      console.error("Error loading slots:", err);
    } finally {
      setLoadingSlots(false);
    }
  }

  function toggleService(serviceId: string) {
    setSelectedServiceIds(prev => {
      if (prev.includes(serviceId)) {
        return prev.filter(id => id !== serviceId);
      } else {
        return [...prev, serviceId];
      }
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (selectedServices.length === 0) {
        throw new Error("Please select at least one service");
      }

      if (!requestedTime) {
        throw new Error("Please select a time slot");
      }

      // Find the selected slot to get starts_at
      const selectedSlot = availableSlots.find((slot) => slot.label === requestedTime);
      if (!selectedSlot) {
        throw new Error("Invalid time slot selected");
      }

      // Calculate combined duration and end time
      const totalDurationMinutes = selectedServices.reduce((sum, s) => sum + (s.duration_minutes || 0), 0);
      const startDate = new Date(selectedSlot.starts_at);
      const endDate = new Date(startDate.getTime() + totalDurationMinutes * 60000);
      
      // Create service list and names
      const serviceNames = selectedServices.map(s => s.name).join(", ");
      const servicesJson = JSON.stringify(selectedServices.map(s => ({
        id: s.id,
        name: s.name,
        duration_minutes: s.duration_minutes,
        price: s.price,
      })));

      // Create ONE booking with all services
      const payload = {
        business_id: businessId,
        service_id: selectedServices[0].id, // Primary service (for filtering)
        client_name,
        client_phone,
        client_email,
        service: serviceNames, // All services comma-separated
        services_json: servicesJson, // JSON for parsing
        requested_date,
        requested_time: requestedTime,
        duration_minutes: totalDurationMinutes, // Combined duration
        starts_at: selectedSlot.starts_at,
        ends_at: endDate.toISOString(), // Updated end time based on combined duration
        message,
        status: "pending",
      };

      const { data, error: insertErr } = await supabase
        .from("booking_requests")
        .insert(payload)
        .select()
        .single();

      if (insertErr) {
        throw insertErr;
      }

      // Send owner + client emails from a server-side verified route
      const emailResponse = await fetch('/api/public/send-booking-emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: data?.id }),
      }).catch((emailErr) => {
        console.error('Failed to trigger booking emails:', emailErr);
        return null;
      });

      if (emailResponse) {
        const emailPayload = await emailResponse.json().catch(() => ({}));
        if (!emailResponse.ok) {
          console.error('Booking created but email delivery failed:', emailPayload);
          const detailedErrors = Array.isArray(emailPayload?.errors) ? emailPayload.errors.join(' | ') : '';
          const apiError = emailPayload?.error || 'email delivery failed';
          setError(`Booking created successfully, but ${apiError}${detailedErrors ? ` (${detailedErrors})` : ''}.`);
        } else if (emailPayload?.success === true && Array.isArray(emailPayload?.errors) && emailPayload.errors.length > 0) {
          console.warn('Partial email delivery:', emailPayload);
          setError(`Booking created. Partial email delivery: ${emailPayload.errors.join(' | ')}`);
        }
      }


      setSuccess(`✅ Your booking has been confirmed! Opening booking status in a new tab...`);
      
      // Open booking status page in new tab
      window.open(`/booking-status/${data?.id}`, '_blank');
      
      // Clear form after a short delay so success message is visible
      setTimeout(() => {
        setClientName("");
        setClientPhone("");
        setClientEmail("");
        setSelectedServiceIds([]);
        setRequestedDate("");
        setRequestedTime("");
        setMessage("");
        setAvailableSlots([]);
        setSuccess(null);
      }, 2000);
    } catch (err: any) {
      setError(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <div className={`mb-4 rounded-lg border p-4 text-sm ${theme.error}`}>{error}</div>}
      {success && <div className={`mb-4 rounded-lg border p-4 text-sm ${theme.success}`}>{success}</div>}

      <div className={`rounded-2xl border p-4 sm:p-5 ${theme.innerCard}`}>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className={`block text-sm font-medium ${theme.label} mb-2`}>{t('booking.yourName')}</label>
            <input
              value={client_name}
              onChange={(e) => setClientName(e.target.value)}
              className={`w-full px-4 py-3 rounded-xl border ${theme.input} focus:border-transparent focus:ring-2 transition-all`}
              placeholder="John Doe"
              required
            />
          </div>

          <div>
            <label className={`block text-sm font-medium ${theme.label} mb-2`}>{t('booking.phoneWhatsapp')}</label>
            <input
              value={client_phone}
              onChange={(e) => setClientPhone(e.target.value)}
              className={`w-full px-4 py-3 rounded-xl border ${theme.input} focus:border-transparent focus:ring-2 transition-all`}
              placeholder="+212 6 12 34 56 78"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className={`block text-sm font-medium ${theme.label} mb-2`}>{t('booking.emailUpdates')}</label>
            <input
              value={client_email}
              onChange={(e) => setClientEmail(e.target.value)}
              type="email"
              className={`w-full px-4 py-3 rounded-xl border ${theme.input} focus:border-transparent focus:ring-2 transition-all`}
              placeholder="you@example.com"
              required
            />
          </div>
        </div>
      </div>

      {/* Service Selection - Multi-select Grid */}
      <div className={`rounded-2xl border p-4 sm:p-5 ${theme.innerCard}`}>
        <label className={`block text-sm font-medium ${theme.label} mb-3`}>{t('booking.selectServices')}</label>
        {services && services.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {services.map((service) => (
              <button
                key={service.id}
                type="button"
                onClick={() => toggleService(service.id)}
                className={`relative rounded-2xl border-2 transition-all text-left overflow-hidden ${
                  selectedServiceIds.includes(service.id)
                    ? `shadow-lg scale-[1.01]`
                    : `border-slate-300 dark:border-slate-600 hover:shadow-md`
                }`}
                style={selectedServiceIds.includes(service.id) ? { borderColor: brandColor, boxShadow: `0 10px 25px ${brandColor}33` } : {}}
              >
                {/* Background Image */}
                {service.background_image_url && (
                  <div className="absolute inset-0">
                    <img
                      src={service.background_image_url}
                      alt={service.name}
                      className="w-full h-full object-cover"
                    />
                    {/* Strong gradient overlay for text readability */}
                    <div className={`absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-black/80 ${
                      selectedServiceIds.includes(service.id) ? 'via-indigo-600/50 to-indigo-900/80' : ''
                    }`}></div>
                  </div>
                )}

                {/* Content */}
                <div className={`relative p-4 sm:p-5 ${service.background_image_url ? 'min-h-36' : ''}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                      service.background_image_url ? 'bg-white/20 backdrop-blur border-white/40' : 'border-slate-400 dark:border-slate-500'
                    }`}
                    style={selectedServiceIds.includes(service.id) && !service.background_image_url ? { backgroundColor: brandColor, borderColor: brandColor } : {}}>
                      {selectedServiceIds.includes(service.id) && (
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className={`font-semibold ${
                        service.background_image_url 
                          ? 'text-white'
                          : theme.label
                      }`}
                      style={service.background_image_url ? {textShadow: "0 2px 6px rgba(0,0,0,0.5)"} : {}}>
                        {service.name}
                      </div>
                      <div className={`text-sm ${
                        service.background_image_url 
                          ? 'text-white/90'
                          : selectedServiceIds.includes(service.id) ? 'text-white/80' : theme.mutedText
                      }`}
                      style={service.background_image_url ? {textShadow: "0 1px 4px rgba(0,0,0,0.5)"} : {}}>
                        {service.duration_minutes && `${service.duration_minutes} min`}
                        {service.duration_minutes && service.price && ' • '}
                        {service.price && `${service.price} ${service.currency || 'MAD'}`}
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className={`p-4 rounded-lg text-center ${theme.emptyState}`}>
            {t('booking.noServicesAvailable')}
          </div>
        )}
        {selectedServices.length > 0 && selectedServices.some(s => !s.duration_minutes) && (
          <p className={`mt-3 text-sm ${theme.mutedText} ${theme.emptyState} px-3 py-2 rounded-lg`}>
            {t('booking.someServicesNoDuration')}
          </p>
        )}
      </div>

      {/* Date Selection */}
      <div className={`rounded-2xl border p-4 sm:p-5 ${theme.innerCard}`}>
        <label className={`block text-sm font-medium ${theme.label} mb-3 flex items-center gap-2`}>
          <CalendarIcon className="h-4 w-4" />
          {t('booking.preferredDate')}
        </label>
        <DatePicker
          value={requested_date}
          onChange={setRequestedDate}
          minDate={new Date().toISOString().split('T')[0]}
          disabled={selectedServices.length === 0 || !selectedServices.some(s => s.duration_minutes)}
          theme={{ input: theme.input, label: theme.label }}
        />
      </div>

      {/* Time Slots */}
      {selectedServices.some(s => s.duration_minutes) && requested_date && (
        <div className={`rounded-2xl border p-4 sm:p-5 ${theme.innerCard}`}>
          <label className={`block text-sm font-medium ${theme.label} mb-3 flex items-center gap-2`}>
            <ClockIcon className="h-4 w-4" />
            {t('booking.availableTimes')}
          </label>
          {loadingSlots ? (
            <div className={`text-center py-6 ${theme.mutedText}`}>{t('booking.loadingTimes')}</div>
          ) : availableSlots.length > 0 ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
              {availableSlots.map((slot) => (
                <button
                  key={slot.starts_at}
                  type="button"
                  onClick={() => setRequestedTime(slot.label)}
                  className={`px-3 py-3 rounded-xl text-sm font-semibold transition-all border-2 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 text-white ${
                    requestedTime === slot.label
                      ? `shadow-lg scale-105`
                      : `${theme.timeSlot}`
                  }`}
                  style={requestedTime === slot.label ? { backgroundColor: brandColor, borderColor: brandColor, boxShadow: `0 8px 20px ${brandColor}44` } : {}}
                >
                  {slot.label}
                </button>
              ))}
            </div>
          ) : (
            <div className={`text-center py-6 ${theme.emptyState} rounded-lg`}>
              {t('booking.noAvailableTimes')}
            </div>
          )}
        </div>
      )}

      {/* Message */}
      <div className={`rounded-2xl border p-4 sm:p-5 ${theme.innerCard}`}>
        <label className={`block text-sm font-medium ${theme.label} mb-2`}>{t('booking.messageOptional')}</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className={`w-full px-4 py-3 rounded-xl border ${theme.input} focus:border-transparent focus:ring-2 transition-all`}
          rows={3}
          placeholder={t('booking.specialRequests')}
        />
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading || selectedServices.length === 0 || !selectedServices.some(s => s.duration_minutes) || !requestedTime}
          className={`px-6 py-3 rounded-lg text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all`}
          style={{ background: `linear-gradient(135deg, ${brandColor}, ${accentColor})` }}
        >
          {loading ? t('booking.booking') : t('booking.bookNow')}
        </button>
      </div>
    </form>
  );
}
