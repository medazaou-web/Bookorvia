"use client";
import { useEffect, useState } from "react";
import supabase from "../../../lib/supabase/browserClient";

type Service = {
  id: string;
  name: string;
  description?: string | null;
  price?: number | null;
  currency?: string | null;
  duration_minutes?: number | null;
  is_active?: boolean;
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

export default function BookingForm({ businessId, services, businessSlug, themeStyles }: { businessId: string; services?: Service[]; businessSlug?: string; themeStyles?: ThemeStyles }) {
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
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [requested_date, setRequestedDate] = useState("");
  const [requestedTime, setRequestedTime] = useState("");
  const [message, setMessage] = useState("");
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load available slots when service and date change
  useEffect(() => {
    if (selectedServiceId && requested_date && businessSlug) {
      loadAvailableSlots();
    } else {
      setAvailableSlots([]);
    }
  }, [selectedServiceId, requested_date, businessSlug]);

  // Update selected service when service ID changes
  useEffect(() => {
    if (selectedServiceId && services) {
      const svc = services.find((s) => s.id === selectedServiceId);
      setSelectedService(svc || null);
      console.log("Selected service ID:", selectedServiceId);
    } else {
      setSelectedService(null);
    }
  }, [selectedServiceId, services]);

  async function loadAvailableSlots() {
    setLoadingSlots(true);
    setAvailableSlots([]);
    setRequestedTime("");

    try {
      const url = `/api/public/availability?slug=${businessSlug}&serviceId=${selectedServiceId}&date=${requested_date}`;
      console.log("Fetching availability from:", url);
      
      const response = await fetch(url);
      const data = await response.json();

      console.log("Availability response:", data);

      // API returns 'slots' key
      if (data.slots && Array.isArray(data.slots)) {
        console.log("Found slots:", data.slots.length);
        setAvailableSlots(data.slots);
      } else if (data.availableSlots && Array.isArray(data.availableSlots)) {
        // Fallback for older API response format
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (!selectedService) {
        throw new Error("Please select a service");
      }

      if (!requestedTime) {
        throw new Error("Please select a time slot");
      }

      // Find the selected slot to get starts_at and ends_at
      const selectedSlot = availableSlots.find((slot) => slot.label === requestedTime);
      if (!selectedSlot) {
        throw new Error("Invalid time slot selected");
      }

      const payload = {
        business_id: businessId,
        service_id: selectedService.id,
        client_name,
        client_phone,
        service: selectedService.name,
        requested_date,
        requested_time: requestedTime,
        duration_minutes: selectedService.duration_minutes || 0,
        starts_at: selectedSlot.starts_at,
        ends_at: selectedSlot.ends_at,
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

      setSuccess("Your request has been sent! The business will confirm shortly.");
      // clear form
      setClientName("");
      setClientPhone("");
      setSelectedServiceId("");
      setSelectedService(null);
      setRequestedDate("");
      setRequestedTime("");
      setMessage("");
      setAvailableSlots([]);
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

      {/* Name */}
      <div>
        <label className={`block text-sm font-medium ${theme.label} mb-2`}>Your Name</label>
        <input
          value={client_name}
          onChange={(e) => setClientName(e.target.value)}
          className={`w-full px-4 py-2 rounded-lg border ${theme.input} focus:border-transparent focus:ring-2 transition-all`}
          placeholder="John Doe"
          required
        />
      </div>

      {/* Phone */}
      <div>
        <label className={`block text-sm font-medium ${theme.label} mb-2`}>Phone / WhatsApp</label>
        <input
          value={client_phone}
          onChange={(e) => setClientPhone(e.target.value)}
          className={`w-full px-4 py-2 rounded-lg border ${theme.input} focus:border-transparent focus:ring-2 transition-all`}
          placeholder="+212 6 12 34 56 78"
          required
        />
      </div>

      {/* Service Selection */}
      <div>
        <label className={`block text-sm font-medium ${theme.label} mb-2`}>Service</label>
        {services && services.length > 0 ? (
          <select
            value={selectedServiceId}
            onChange={(e) => setSelectedServiceId(e.target.value)}
            className={`w-full px-4 py-2 rounded-lg border ${theme.input} focus:border-transparent focus:ring-2 transition-all appearance-none`}
            required
          >
            <option value="">Select a service...</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
                {s.duration_minutes ? ` (${s.duration_minutes} min)` : ''}
                {s.price ? ` — ${s.price} ${s.currency || 'MAD'}` : ''}
              </option>
            ))}
          </select>
        ) : (
          <input
            value={selectedService?.name || ''}
            disabled
            className={`w-full px-4 py-2 rounded-lg border ${theme.input} opacity-50`}
            placeholder="No services available"
          />
        )}
        {selectedService && !selectedService.duration_minutes && (
          <p className={`mt-2 text-sm ${theme.mutedText} ${theme.emptyState} px-3 py-2 rounded-lg`}>
            This service doesn't have a duration set, so automatic availability isn't available. Please contact the business.
          </p>
        )}
      </div>

      {/* Date Selection */}
      <div>
        <label className={`block text-sm font-medium ${theme.label} mb-2`}>Preferred Date</label>
        <input
          value={requested_date}
          onChange={(e) => setRequestedDate(e.target.value)}
          type="date"
          className={`w-full px-4 py-2 rounded-lg border ${theme.input} focus:border-transparent focus:ring-2 transition-all`}
          min={new Date().toISOString().split('T')[0]}
          required={!!selectedService?.duration_minutes}
          disabled={!selectedService?.duration_minutes}
        />
      </div>

      {/* Time Slots */}
      {selectedService?.duration_minutes && requested_date && (
        <div>
          <label className={`block text-sm font-medium ${theme.label} mb-3`}>Available Times</label>
          {loadingSlots ? (
            <div className={`text-center py-6 ${theme.mutedText}`}>Loading available times...</div>
          ) : availableSlots.length > 0 ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
              {availableSlots.map((slot) => (
                <button
                  key={slot.starts_at}
                  type="button"
                  onClick={() => setRequestedTime(slot.label)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all border ${
                    requestedTime === slot.label
                      ? `${theme.timeSlotSelected} shadow-lg`
                      : `${theme.timeSlot}`
                  }`}
                >
                  {slot.label}
                </button>
              ))}
            </div>
          ) : (
            <div className={`text-center py-6 ${theme.emptyState} rounded-lg`}>
              No available times on this date. Try another day.
            </div>
          )}
        </div>
      )}

      {/* Message */}
      <div>
        <label className={`block text-sm font-medium ${theme.label} mb-2`}>Message (optional)</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className={`w-full px-4 py-2 rounded-lg border ${theme.input} focus:border-transparent focus:ring-2 transition-all`}
          rows={3}
          placeholder="Any special requests or details..."
        />
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading || !selectedService?.duration_minutes || !requestedTime}
          className={`px-6 py-3 rounded-lg ${theme.buttonPrimary} shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all`}
        >
          {loading ? 'Booking...' : 'Book Now'}
        </button>
      </div>
    </form>
  );
}
