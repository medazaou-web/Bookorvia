"use client";

import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "@/lib/context/LanguageContext";
import { useTranslations } from "@/lib/i18n";
import { AlertIcon, CheckIcon, ExternalLinkIcon, SparkIcon } from "@/components/icons";
import supabase from "@/lib/supabase/browserClient";

type BillingStatus =
  | "free"
  | "trialing"
  | "active"
  | "past_due"
  | "canceled"
  | "incomplete"
  | "incomplete_expired"
  | "unpaid"
  | "paused";

interface SubscriptionState {
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  stripePriceId: string | null;
  status: BillingStatus;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  trialEndsAt: string | null;
}

interface StripePlanState {
  tier: "starter" | "growth" | "pro";
  name: string;
  description: string;
  monthly: {
    priceId: string;
    amountEur: number;
  };
  yearly: {
    priceId: string;
    amountEur: number;
  };
}

type BillingCycle = "monthly" | "yearly";

export default function BillingPage() {
  const { language } = useLanguage();
  const t = useTranslations(language);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyAction, setBusyAction] = useState<"checkout" | "portal" | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionState | null>(null);
  const [hasConfiguredPrice, setHasConfiguredPrice] = useState(false);
  const [plans, setPlans] = useState<StripePlanState[]>([]);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
  const [selectedPriceId, setSelectedPriceId] = useState<string | null>(null);
  const [yearlyDiscountPercent, setYearlyDiscountPercent] = useState<number>(15);

  useEffect(() => {
    void loadSubscription();
  }, []);

  async function getAuthHeaders(): Promise<Record<string, string>> {
    const { data } = await supabase.auth.getSession();
    const token = data?.session?.access_token;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  }

  function getPlanTitle(plan: StripePlanState) {
    if (plan.tier === "starter") {
      return t("dashboard.billingTierStarterName");
    }
    if (plan.tier === "growth") {
      return t("dashboard.billingTierGrowthName");
    }
    return t("dashboard.billingTierProName");
  }

  function getPlanDescription(plan: StripePlanState) {
    if (plan.tier === "starter") {
      return t("dashboard.billingTierStarterDescription");
    }
    if (plan.tier === "growth") {
      return t("dashboard.billingTierGrowthDescription");
    }
    return t("dashboard.billingTierProDescription");
  }

  async function loadSubscription() {
    setLoading(true);
    setError(null);

    try {
      const headers = await getAuthHeaders();
      const res = await fetch("/api/stripe/subscription", {
        method: "GET",
        credentials: "include",
        headers,
      });

      const payload = await res.json();

      if (!res.ok) {
        setError(payload?.error || t("dashboard.billingLoadError"));
        return;
      }

      setSubscription(payload.subscription);
      setHasConfiguredPrice(Boolean(payload.env?.hasConfiguredPrice));
      setPlans(payload.plans || []);
      setYearlyDiscountPercent(Number(payload.yearlyDiscountPercent || 15));

      const activePriceId = payload?.subscription?.stripePriceId || null;
      const firstPlan = (payload.plans || [])[0];

      if (activePriceId) {
        setSelectedPriceId(activePriceId);
        const foundYearly = (payload.plans || []).some(
          (p: StripePlanState) => p.yearly.priceId === activePriceId
        );
        setBillingCycle(foundYearly ? "yearly" : "monthly");
      } else if (firstPlan) {
        setSelectedPriceId(firstPlan.monthly.priceId);
      }
    } catch (e: any) {
      setError(e?.message || t("dashboard.billingLoadError"));
    } finally {
      setLoading(false);
    }
  }

  const isPaid = useMemo(() => {
    const status = subscription?.status;
    return status === "active" || status === "trialing";
  }, [subscription?.status]);

  const statusLabel = useMemo(() => {
    const status = subscription?.status || "free";
    return t(`dashboard.billingStatus_${status}`);
  }, [subscription?.status, t]);

  const periodEndText = useMemo(() => {
    if (!subscription?.currentPeriodEnd) {
      return t("dashboard.billingNoRenewalDate");
    }

    const date = new Date(subscription.currentPeriodEnd);
    return new Intl.DateTimeFormat(language, {
      year: "numeric",
      month: "short",
      day: "2-digit",
    }).format(date);
  }, [subscription?.currentPeriodEnd, language, t]);

  const selectedPlan = useMemo(() => {
    if (!selectedPriceId) {
      return null;
    }
    return (
      plans.find(
        (plan) => plan.monthly.priceId === selectedPriceId || plan.yearly.priceId === selectedPriceId
      ) || null
    );
  }, [plans, selectedPriceId]);

  const selectedPlanLabel = useMemo(() => {
    if (!selectedPlan) {
      return t("dashboard.billingPlanFree");
    }
    return `${getPlanTitle(selectedPlan)} ${
      billingCycle === "yearly" ? t("dashboard.billingYearly") : t("dashboard.billingMonthly")
    }`;
  }, [selectedPlan, billingCycle, t]);

  const priceFormatter = useMemo(
    () =>
      new Intl.NumberFormat(language, {
        style: "currency",
        currency: "EUR",
        minimumFractionDigits: 2,
      }),
    [language]
  );

  function pickPlanPrice(plan: StripePlanState, cycle: BillingCycle) {
    return cycle === "yearly" ? plan.yearly : plan.monthly;
  }

  function selectTier(plan: StripePlanState) {
    const chosen = pickPlanPrice(plan, billingCycle);
    setSelectedPriceId(chosen.priceId);
  }

  function handleCycleChange(cycle: BillingCycle) {
    setBillingCycle(cycle);

    if (!selectedPriceId) {
      const firstPlan = plans[0];
      if (!firstPlan) {
        return;
      }
      setSelectedPriceId(pickPlanPrice(firstPlan, cycle).priceId);
      return;
    }

    const existingPlan = plans.find(
      (plan) => plan.monthly.priceId === selectedPriceId || plan.yearly.priceId === selectedPriceId
    );
    if (existingPlan) {
      setSelectedPriceId(pickPlanPrice(existingPlan, cycle).priceId);
    }
  }

  async function startCheckout() {
    setBusyAction("checkout");
    setError(null);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        credentials: "include",
        headers,
        body: JSON.stringify({ priceId: selectedPriceId }),
      });

      const payload = await res.json();
      if (!res.ok || !payload.url) {
        setError(payload?.error || t("dashboard.billingCheckoutError"));
        return;
      }

      window.location.href = payload.url;
    } catch (e: any) {
      setError(e?.message || t("dashboard.billingCheckoutError"));
    } finally {
      setBusyAction(null);
    }
  }

  async function openPortal() {
    setBusyAction("portal");
    setError(null);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
        credentials: "include",
        headers,
        body: JSON.stringify({}),
      });

      const payload = await res.json();
      if (!res.ok || !payload.url) {
        setError(payload?.error || t("dashboard.billingPortalError"));
        return;
      }

      window.location.href = payload.url;
    } catch (e: any) {
      setError(e?.message || t("dashboard.billingPortalError"));
    } finally {
      setBusyAction(null);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">{t("dashboard.billingTitle")}</h1>
        <p className="text-slate-600 dark:text-slate-400">{t("dashboard.billingSubtitle")}</p>
      </div>

      {!loading && !error && !hasConfiguredPrice && (
        <div className="rounded-2xl border border-amber-300/70 bg-amber-50 dark:bg-amber-950/40 dark:border-amber-700/70 p-4 text-sm text-amber-900 dark:text-amber-200 flex items-start gap-3">
          <AlertIcon className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <div>{t("dashboard.billingMissingPriceConfig")}</div>
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-red-300/70 bg-red-50 dark:bg-red-950/40 dark:border-red-700/70 p-4 text-sm text-red-800 dark:text-red-200 flex items-start gap-3">
          <AlertIcon className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <div>{error}</div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <section className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm">
          {loading ? (
            <div className="text-slate-600 dark:text-slate-400">{t("dashboard.billingLoading")}</div>
          ) : (
            <>
              <div className="mb-6">
                <div className="inline-flex rounded-xl border border-slate-300 dark:border-slate-600 p-1 bg-white dark:bg-slate-900">
                  <button
                    type="button"
                    onClick={() => handleCycleChange("monthly")}
                    className={`px-4 py-2 text-sm rounded-lg font-semibold transition-colors ${
                      billingCycle === "monthly"
                        ? "bg-indigo-600 text-white"
                        : "text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {t("dashboard.billingMonthly")}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCycleChange("yearly")}
                    className={`px-4 py-2 text-sm rounded-lg font-semibold transition-colors ${
                      billingCycle === "yearly"
                        ? "bg-indigo-600 text-white"
                        : "text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {t("dashboard.billingYearly")}
                  </button>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                  {t("dashboard.billingYearlyDiscount").replace("{percent}", String(yearlyDiscountPercent))}
                </p>
              </div>

              <div className="grid gap-3 mb-6 sm:grid-cols-3">
                {plans.map((plan) => {
                  const chosen = pickPlanPrice(plan, billingCycle);
                  const selected = selectedPriceId === chosen.priceId;
                  return (
                    <button
                      key={plan.tier}
                      type="button"
                      onClick={() => selectTier(plan)}
                      className={`text-left rounded-2xl border p-4 transition-all ${
                        selected
                          ? "border-indigo-500 ring-2 ring-indigo-200 dark:ring-indigo-900 bg-indigo-50 dark:bg-indigo-950/30"
                          : "border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700"
                      }`}
                    >
                      <p className="font-bold text-slate-900 dark:text-slate-100">{getPlanTitle(plan)}</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{getPlanDescription(plan)}</p>
                      <p className="mt-3 text-lg font-semibold text-slate-900 dark:text-slate-100">
                        {priceFormatter.format(chosen.amountEur)}
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400 ml-1">
                          / {billingCycle === "yearly" ? t("dashboard.billingYear") : t("dashboard.billingMonth")}
                        </span>
                      </p>
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-wrap items-center gap-3 mb-6">
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200">
                  <SparkIcon className="h-4 w-4" />
                  {t("dashboard.billingCurrentStatus")}: {statusLabel}
                </span>
                {subscription?.cancelAtPeriodEnd && (
                  <span className="inline-flex items-center rounded-full bg-amber-100 dark:bg-amber-900/40 px-3 py-1 text-xs font-semibold text-amber-800 dark:text-amber-200">
                    {t("dashboard.billingCancelsAtPeriodEnd")}
                  </span>
                )}
              </div>

              <div className="grid sm:grid-cols-2 gap-4 mb-6">
                <div className="rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1">{t("dashboard.billingPlan")}</p>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">{isPaid ? selectedPlanLabel : t("dashboard.billingPlanFree")}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1">{t("dashboard.billingRenewsOn")}</p>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">{periodEndText}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={startCheckout}
                  disabled={busyAction !== null || !hasConfiguredPrice || !selectedPriceId}
                  className="px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold disabled:opacity-60 disabled:cursor-not-allowed hover:shadow-lg transition-all"
                >
                  {busyAction === "checkout" ? t("dashboard.billingRedirecting") : t("dashboard.billingStartSubscription")}
                </button>

                <button
                  onClick={openPortal}
                  disabled={busyAction !== null || !subscription?.stripeCustomerId}
                  className="px-5 py-3 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-semibold disabled:opacity-60 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-all inline-flex items-center gap-2"
                >
                  <ExternalLinkIcon className="h-4 w-4" />
                  {busyAction === "portal" ? t("dashboard.billingRedirecting") : t("dashboard.billingManageSubscription")}
                </button>
              </div>
            </>
          )}
        </section>

        <aside className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-3">{t("dashboard.billingIncludesTitle")}</h2>
          <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
            <li className="flex items-center gap-2"><CheckIcon className="h-4 w-4 text-emerald-500" /> {t("dashboard.billingFeatureBookings")}</li>
            <li className="flex items-center gap-2"><CheckIcon className="h-4 w-4 text-emerald-500" /> {t("dashboard.billingFeatureClients")}</li>
            <li className="flex items-center gap-2"><CheckIcon className="h-4 w-4 text-emerald-500" /> {t("dashboard.billingFeatureReviews")}</li>
            <li className="flex items-center gap-2"><CheckIcon className="h-4 w-4 text-emerald-500" /> {t("dashboard.billingFeatureLoyalty")}</li>
          </ul>
        </aside>
      </div>
    </div>
  );
}
