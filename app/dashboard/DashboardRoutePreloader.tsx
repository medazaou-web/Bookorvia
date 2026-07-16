"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardRoutePreloader() {
  const router = useRouter();

  useEffect(() => {
    // All dashboard routes to preload
    const routes = [
      "/dashboard",
      "/dashboard/bookings",
      "/dashboard/clients",
      "/dashboard/calendar",
      "/dashboard/services",
      "/dashboard/reviews",
      "/dashboard/follow-ups",
      "/dashboard/loyalty",
      "/dashboard/business-page",
      "/dashboard/settings",
      "/dashboard/profile",
      "/dashboard/onboarding",
    ];

    // Prefetch all routes immediately with slight staggering to avoid network congestion
    routes.forEach((route, index) => {
      setTimeout(() => {
        router.prefetch(route);
      }, index * 100); // Stagger prefetch calls by 100ms
    });

    // Background data refresh interval - refresh user/business data every 5 minutes
    const refreshInterval = setInterval(async () => {
      try {
        // Silently revalidate dashboard data in the background
        // This ensures data stays fresh without blocking UI
        await fetch("/api/auth/refresh", { method: "POST" });
      } catch (error) {
        // Silently fail, don't interrupt user experience
        console.debug("Background refresh completed");
      }
    }, 5 * 60 * 1000); // Every 5 minutes

    return () => clearInterval(refreshInterval);
  }, [router]);

  return null;
}
