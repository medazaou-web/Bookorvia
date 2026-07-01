"use client";
import { useState } from "react";
import supabase from "../../lib/supabase/browserClient";

interface NewBookingModalProps {
  businessId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  services?: { id: string; name: string }[];
}

export default function NewBookingModal({
  businessId,
  isOpen,
  onClose,
  onSuccess,
  services = [],
}: NewBookingModalProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [formData, setFormData] = useState({
    client_name: "",
    client_phone: "",
    service: "",
    requested_date: "",
    requested_time: "",
    message: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      // Validate required fields
      if (
        !formData.client_name.trim() ||
        !formData.client_phone.trim() ||
        !formData.requested_date
      ) {
        throw new Error("Please fill in all required fields");
      }

      const { error } = await supabase.from("booking_requests").insert({
        business_id: businessId,
        client_name: formData.client_name.trim(),
        client_phone: formData.client_phone.trim(),
        service: formData.service || null,
        requested_date: formData.requested_date,
        requested_time: formData.requested_time || null,
        message: formData.message.trim() || null,
        status: "pending",
        requested_at: new Date().toISOString(),
      });

      if (error) throw error;

      setMessage({
        type: "success",
        text: "Booking created successfully!",
      });

      // Reset form
      setFormData({
        client_name: "",
        client_phone: "",
        service: "",
        requested_date: "",
        requested_time: "",
        message: "",
      });

      // Close modal after a short delay
      setTimeout(() => {
        onClose();
        onSuccess();
      }, 1000);
    } catch (e: any) {
      console.error("Failed to create booking:", e);
      setMessage({
        type: "error",
        text: e.message || "Failed to create booking",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 border-b border-slate-200/60 bg-white/95 backdrop-blur px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold text-slate-900">New Booking Request</h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 text-2xl leading-none"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {message && (
            <div
              className={`mb-6 p-4 rounded-xl border ${
                message.type === "success"
                  ? "bg-emerald-50 border-emerald-200/60 text-emerald-800"
                  : "bg-red-50 border-red-200/60 text-red-800"
              }`}
            >
              {message.type === "success" ? "✓" : "✕"} {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Client Name */}
            <div>
              <label className="block text-sm font-bold text-slate-900 mb-2">
                Client Name *
              </label>
              <input
                type="text"
                name="client_name"
                value={formData.client_name}
                onChange={handleInputChange}
                placeholder="John Doe"
                className="w-full px-4 py-3 rounded-xl border border-slate-200/60 bg-white/50 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>

            {/* Client Phone */}
            <div>
              <label className="block text-sm font-bold text-slate-900 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                name="client_phone"
                value={formData.client_phone}
                onChange={handleInputChange}
                placeholder="+1 234 567 8900"
                className="w-full px-4 py-3 rounded-xl border border-slate-200/60 bg-white/50 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>

            {/* Service */}
            <div>
              <label className="block text-sm font-bold text-slate-900 mb-2">
                Service
              </label>
              {services.length > 0 ? (
                <select
                  name="service"
                  value={formData.service}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200/60 bg-white/50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                >
                  <option value="">Select a service...</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  name="service"
                  value={formData.service}
                  onChange={handleInputChange}
                  placeholder="e.g., Haircut, Massage"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200/60 bg-white/50 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              )}
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">
                  Requested Date *
                </label>
                <input
                  type="date"
                  name="requested_date"
                  value={formData.requested_date}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200/60 bg-white/50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">
                  Requested Time
                </label>
                <input
                  type="time"
                  name="requested_time"
                  value={formData.requested_time}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200/60 bg-white/50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-bold text-slate-900 mb-2">
                Additional Message
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                placeholder="Any notes or special requests..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-slate-200/60 bg-white/50 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 rounded-xl border border-slate-200/60 text-slate-900 font-semibold hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Creating...
                  </>
                ) : (
                  <>✓ Create Booking</>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
