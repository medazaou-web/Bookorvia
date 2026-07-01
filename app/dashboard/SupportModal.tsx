"use client";
import { useState } from "react";
import supabase from "../../lib/supabase/browserClient";

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function SupportModal({ isOpen, onClose, onSuccess }: SupportModalProps) {
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("general");
  const [priority, setPriority] = useState("normal");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      setError("Subject and message are required");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const user = (userData as any)?.user ?? null;
      if (!user) throw new Error("Not authenticated");

      // Get user's business if available
      const { data: biz } = await supabase.from("businesses").select("id").eq("user_id", user.id).single();
      const businessId = (biz as any)?.id ?? null;

      // Create ticket
      const { error: insErr } = await supabase.from("support_tickets").insert({
        user_id: user.id,
        business_id: businessId,
        subject: subject.trim(),
        category: category,
        priority: priority,
        message: message.trim(),
        status: "open",
      });

      if (insErr) throw insErr;

      setSuccess(true);
      setSubject("");
      setMessage("");
      setPriority("normal");
      setCategory("general");

      setTimeout(() => {
        setSuccess(false);
        onClose();
        onSuccess?.();
      }, 1500);
    } catch (e: any) {
      setError(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-2xl rounded-3xl bg-white/90 backdrop-blur border border-white/60 shadow-2xl p-8">
        {success ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">✓</div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Ticket Created!</h3>
            <p className="text-slate-600">We'll review your message and get back to you soon.</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-slate-900">Create Support Ticket</h2>
              <button
                onClick={onClose}
                className="text-2xl text-slate-400 hover:text-slate-600 transition-colors"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 font-medium">
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Subject *</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Brief description of your issue"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white/50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  required
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white/50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  >
                    <option value="general">General Question</option>
                    <option value="billing">Billing</option>
                    <option value="technical">Technical Issue</option>
                    <option value="account">Account Problem</option>
                    <option value="feature_request">Feature Request</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white/50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Message *</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Please describe your issue in detail..."
                  rows={6}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white/50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  disabled={loading}
                  type="submit"
                  className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold hover:shadow-lg hover:-translate-y-1 active:scale-95 disabled:opacity-60 transition-all"
                >
                  {loading ? "Submitting..." : "Submit Ticket"}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-6 py-3 rounded-xl border-2 border-slate-300 bg-white text-slate-700 font-bold hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
