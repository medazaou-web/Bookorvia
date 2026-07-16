"use client";
import { useState } from "react";
import supabase from "../../../lib/supabase/browserClient";
import { useLanguage } from "../../../lib/context/LanguageContext";
import { useTranslations } from "../../../lib/i18n";

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

type Props = {
  businessId: number | string;
  googleReviewUrl?: string | null;
  themeStyles?: ThemeStyles;
  preloadedReviews?: any[];
};

export default function ReviewBooster({ businessId, googleReviewUrl, themeStyles, preloadedReviews }: Props) {
  const { language } = useLanguage();
  const t = useTranslations(language);
  
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
  const [rating, setRating] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [reviewId, setReviewId] = useState<number | null>(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [comment, setComment] = useState("");
  const [privateLoading, setPrivateLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  async function handleSelectRating(r: number) {
    setError(null);
    setSuccessMessage(null);
    setRating(r);

    if (r >= 4) {
      // create a google_redirect review row
      setLoading(true);
      try {
        const payload: any = {
          business_id: businessId,
          rating: r,
          type: "google_redirect",
          google_clicked: false,
        };
        const { data, error: insertErr } = await supabase.from("reviews").insert(payload).select("id").limit(1).single();
        if (insertErr) throw insertErr;
        // depending on Supabase version data may be object
        const insertedId = (data as any)?.id ?? (Array.isArray(data) ? data[0]?.id : null);
        setReviewId(insertedId ?? null);
      } catch (e: any) {
        setError(e?.message || String(e));
      } finally {
        setLoading(false);
      }
    }
  }

  async function handleGoogleClick() {
    if (!googleReviewUrl) {
      setError(t('booking.noGoogleReviewUrl'));
      return;
    }
    // open link first
    try {
      window.open(googleReviewUrl, "_blank");
    } catch (e) {
      // ignore
    }

    // update google_clicked if we have a review id
    if (!reviewId) return;
    try {
      const { error: upErr } = await supabase.from("reviews").update({ google_clicked: true }).eq("id", reviewId);
      if (upErr) setError(upErr.message || String(upErr));
    } catch (e: any) {
      setError(e?.message || String(e));
    }
  }

  async function handlePrivateSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setPrivateLoading(true);
    try {
      const payload: any = {
        business_id: businessId,
        client_name: name,
        client_phone: phone,
        rating: rating,
        comment,
        type: "private_feedback",
        google_clicked: false,
      };
      const { error: insertErr } = await supabase.from("reviews").insert(payload);
      if (insertErr) throw insertErr;
      setSuccessMessage(t('booking.feedbackSentPrivately'));
      setName("");
      setPhone("");
      setComment("");
      setRating(null);
    } catch (e: any) {
      setError(e?.message || String(e));
    } finally {
      setPrivateLoading(false);
    }
  }

  return (
    <div className={`rounded-lg p-6 shadow-sm`}>
      <div className={`text-sm ${theme.mutedText}`}>Thanks for visiting — please consider leaving a quick review.</div>

      <div className="mt-4 flex items-center gap-2">
        {[1, 2, 3, 4, 5].map((n) => {
          const isSelected = rating === n;
          let btnClass = "inline-flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold focus:outline-none transition-all duration-200 ease-out hover:scale-110 active:scale-95";
          if (isSelected) {
            btnClass += n >= 4 ? ` bg-emerald-600 text-white shadow-md` : ` bg-amber-500 text-white shadow-md`;
          } else {
            if (n >= 4) btnClass += ` bg-emerald-50 text-emerald-700 hover:bg-emerald-100`;
            else if (n <= 3) btnClass += ` bg-amber-50 text-amber-700 hover:bg-amber-100`;
            else btnClass += ` bg-gray-100 text-slate-700 hover:bg-gray-200`;
          }

          return (
            <button key={n} onClick={() => handleSelectRating(n)} className={btnClass} aria-pressed={isSelected}>
              {n}
            </button>
          );
        })}
      </div>

      {loading && <div className={`mt-3 text-sm ${theme.mutedText}`}>{t('booking.processingFeedback')}</div>}

      {rating && rating >= 4 && (
        <div className="mt-3">
          <div className={`text-sm text-emerald-800`}>{t('booking.considerPublicReview')}</div>
          <div className="mt-2 flex gap-2">
            <button onClick={handleGoogleClick} className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold shadow hover:shadow-lg active:scale-[0.98] focus:ring-2 ring-1 transition-all duration-200 ease-out bg-emerald-600 text-white hover:bg-emerald-700 ring-emerald-200`}>{t('booking.leaveGoogleReview')}</button>
            <button onClick={() => { setRating(null); setReviewId(null); }} className={`inline-flex items-center rounded-full border px-4 py-2 text-sm font-semibold hover:active:scale-[0.98] transition-all duration-200 ease-out ${theme.buttonSecondary}`}>{t('booking.maybeLater')}</button>
          </div>
        </div>
      )}

      {rating && rating <= 3 && (
        <div className={`mt-4 rounded-lg border p-3 ${theme.innerCard}`}>
          <div className={`text-sm ${theme.mutedText}`}>{t('booking.sorryToHear')}</div>
          <form onSubmit={handlePrivateSubmit} className="mt-3 flex flex-col gap-2">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t('booking.yourName')} className={`rounded-lg border p-2 text-sm ${theme.input} focus:border-transparent focus:ring-2 transition-all duration-200 ease-out`} required />
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={t('booking.phoneNumber')} className={`rounded-lg border p-2 text-sm ${theme.input} focus:border-transparent focus:ring-2 transition-all duration-200 ease-out`} required />
            <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder={t('booking.comment')} className={`rounded-lg border p-2 text-sm ${theme.input} focus:border-transparent focus:ring-2 transition-all duration-200 ease-out`} rows={4} required />
            <div className="flex gap-2">
              <button type="submit" disabled={privateLoading} className={`rounded-lg px-3 py-2 text-sm font-semibold shadow-md active:scale-[0.98] disabled:opacity-60 transition-all duration-200 ease-out ${theme.buttonPrimary}`}>{t('booking.sendFeedback')}</button>
              <button type="button" onClick={() => { setRating(null); setName(""); setPhone(""); setComment(""); }} className={`rounded-lg border px-3 py-2 text-sm active:scale-[0.98] transition-all duration-200 ease-out ${theme.buttonSecondary}`}>{t('common.cancel')}</button>
            </div>
          </form>
        </div>
      )}

      {error && <div className={`mt-3 text-sm ${theme.error}`}>{error}</div>}
      {successMessage && <div className={`mt-3 text-sm ${theme.success}`}>{successMessage}</div>}
    </div>
  );
}
