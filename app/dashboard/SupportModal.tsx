"use client";
import { useState } from "react";
import supabase from "../../lib/supabase/browserClient";
import { useLanguage } from '@/lib/context/LanguageContext';
import { useTranslations } from '@/lib/i18n';
import { AlertIcon } from "@/components/icons";

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function SupportModal({ isOpen, onClose, onSuccess }: SupportModalProps) {
  const { language } = useLanguage();
  const t = useTranslations(language);
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
      setError(t('dashboard.subjectAndMessageRequired'));
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="w-full max-w-2xl rounded-3xl bg-white/90 backdrop-blur border border-white/60 shadow-2xl p-8 animate-in">
        {success ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">✓</div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">{t('dashboard.ticketCreated')}</h3>
            <p className="text-slate-600">We'll review your message and get back to you soon.</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-slate-900">{t('dashboard.createSupportTicket')}</h2>
              <button
                onClick={onClose}
                className="text-2xl text-slate-400 hover:text-slate-600 transition-colors"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 font-medium flex items-center gap-2">
                <AlertIcon className="h-5 w-5 flex-shrink-0" />
                 {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">{t('dashboard.subject')} *</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder={t('dashboard.briefDescription')}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-white/10 bg-white/50 dark:bg-slate-900/50 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  required
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">{t('dashboard.category')}</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-white/10 bg-white/50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  >
                    <option value="general">{t('dashboard.categoryGeneral')}</option>
                    <option value="billing">{t('dashboard.categoryBilling')}</option>
                    <option value="technical">{t('dashboard.categoryTechnical')}</option>
                    <option value="account">{t('dashboard.categoryAccount')}</option>
                    <option value="feature_request">{t('dashboard.categoryFeatureRequest')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">{t('dashboard.priority')}</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-white/10 bg-white/50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  >
                    <option value="low">{t('adminSupport.low')}</option>
                    <option value="normal">{t('adminSupport.normal')}</option>
                    <option value="high">{t('adminSupport.high')}</option>
                    <option value="urgent">{t('adminSupport.urgent')}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">{t('dashboard.message')} *</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={t('dashboard.describeIssueInDetail')}
                  rows={6}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-white/10 bg-white/50 dark:bg-slate-900/50 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  disabled={loading}
                  type="submit"
                  className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold hover:shadow-lg hover:-translate-y-1 active:scale-95 disabled:opacity-60 transition-all"
                >
                  {loading ? t('dashboard.submitting') : t('dashboard.submitTicket')}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-6 py-3 rounded-xl border-2 border-slate-300 bg-white text-slate-700 font-bold hover:bg-slate-50 transition-all"
                >
                  {t('common.cancel')}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
