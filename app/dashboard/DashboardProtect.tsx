"use client";
import { useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import supabase from "../../lib/supabase/browserClient";

export default function DashboardProtect({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  const billingEnforced = process.env.NEXT_PUBLIC_BILLING_ENFORCED === "true";

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const user = (userData as any)?.user;
      if (!user) {
        // Not logged in - redirect to login with next param
        const currentPath = typeof window !== "undefined" ? window.location.pathname : "/dashboard";
        router.push(`/login?next=${encodeURIComponent(currentPath)}`);
        return;
      }

      if (billingEnforced) {
        const currentPath = typeof window !== "undefined" ? window.location.pathname : "/dashboard";
        const canBypassBilling =
          currentPath.startsWith("/dashboard/billing") ||
          currentPath.startsWith("/dashboard/settings") ||
          currentPath.startsWith("/dashboard/support") ||
          currentPath.startsWith("/dashboard/onboarding");

        if (!canBypassBilling) {
          const billingRes = await fetch("/api/stripe/subscription", {
            method: "GET",
            credentials: "include",
          });

          if (billingRes.ok) {
            const payload = await billingRes.json();
            const status = payload?.subscription?.status;
            const active = status === "active" || status === "trialing";

            if (!active) {
              router.push("/dashboard/billing");
              return;
            }
          }
        }
      }

      setAuthorized(true);
    } catch (e) {
      console.error("Auth check failed:", e);
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }

  // Show nothing while checking auth - prevents flash
  if (loading || !authorized) {
    return null;
  }

  return <>{children}</>;
}
