"use client";
import React, { useState } from "react";
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
  businessId: string;
  themeStyles?: ThemeStyles;
};

function cleanPhone(p: string | null | undefined) {
  if (!p) return "";
  return p.toString().replace(/[+\s\-()]/g, "");
}

export default function LoyaltyLookup({ businessId, themeStyles }: Props) {
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
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [card, setCard] = useState<any | null>(null);

  async function check(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setError(null);
    setCard(null);
    const cleaned = cleanPhone(phone);
    if (!cleaned) {
      setError(t('booking.enterPhoneNumber'));
      return;
    }

    setLoading(true);
    try {
      const { data, error: qErr } = await supabase
        .from("loyalty_cards")
        .select("id, client_name, client_phone, stamps, target_stamps, reward, status")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false });

      if (qErr) throw qErr;
      const cards = data ?? [];
      const found = cards.find((c: any) => cleanPhone(c.client_phone) === cleaned);
      if (!found) {
        setCard(null);
        setError(t('booking.noLoyaltyCard'));
      } else {
        setCard(found);
      }
    } catch (err: any) {
      setError(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className={`rounded-2xl border p-5 ${theme.innerCard}`}>
        <div className={`text-xs font-bold uppercase tracking-[0.18em] ${theme.mutedText}`}>Loyalty Wallet</div>
        <h3 className={`mt-2 text-2xl font-bold ${theme.label}`}>{t('booking.checkLoyalty')}</h3>
        <p className={`mt-2 text-sm ${theme.mutedText}`}>Enter your phone number to see your reward progress instantly.</p>
      </div>

      <form onSubmit={check} className={`rounded-2xl border p-5 ${theme.innerCard} flex flex-col gap-3 sm:flex-row sm:items-center`}>
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder={t('booking.phoneNumber')}
          className={`rounded-xl border p-3 text-sm w-full sm:w-64 focus:border-transparent focus:ring-2 transition-all ${theme.input}`}
        />
        <div className="flex items-center">
          <button
            type="submit"
            disabled={loading}
            className={`ml-0 sm:ml-3 rounded-xl px-4 py-3 text-sm font-semibold shadow-lg hover:shadow-md active:scale-[0.98] focus:ring-2 disabled:opacity-60 transition-all ${theme.buttonPrimary}`}
          >
            {loading ? t('booking.checkingLoyalty') : t('booking.checkLoyalty')}
          </button>
        </div>
      </form>

      <div className="mt-4">
        {error && <div className={`text-sm ${theme.error} border rounded-lg p-3`}>{error}</div>}

        {card && (
          <div className={`mt-2 rounded-2xl border p-4 ${theme.innerCard}`}>
            <div className="flex items-center justify-between">
              <div>
                <div className={`text-sm font-semibold ${theme.label}`}>{card.client_name || 'Unnamed'}</div>
                <div className={`text-xs ${theme.mutedText}`}>{card.client_phone}</div>
              </div>
              <div className={`text-sm ${theme.mutedText}`}>Status: <span className={`font-semibold ${theme.label}`}>{card.status}</span></div>
            </div>

            <div className="mt-3">
              <div className={`text-xs ${theme.mutedText}`}>Progress</div>
              <div className="mt-2 h-3 w-full rounded-full bg-gray-200 overflow-hidden">
                <div className={`h-full ${theme.progressBar}`} style={{ width: `${Math.min(100, Math.round(((card.stamps ?? 0) / (card.target_stamps ?? 1)) * 100))}%` }} />
              </div>
              <div className={`mt-2 text-sm ${theme.label}`}>{card.stamps ?? 0} / {card.target_stamps ?? 0} stamps</div>
              <div className={`mt-1 text-sm ${theme.mutedText}`}>Reward: {card.reward || '-'}</div>
              {card.status === 'reward_ready' && (
                <div className={`mt-3 rounded-lg border p-3 text-sm font-semibold ${theme.success}`}>{t('booking.yourRewardReady')}</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
