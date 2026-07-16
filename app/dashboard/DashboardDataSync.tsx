"use client";
import { useEffect } from "react";

export default function DashboardDataSync() {
  useEffect(() => {
    // Set up background data sync intervals for real-time updates
    
    // Sync bookings/notifications frequently (every 30 seconds)
    const bookingInterval = setInterval(async () => {
      try {
        // This will trigger any notifications updates silently
        await fetch("/api/notifications/create", { 
          method: "GET",
          headers: { "X-Background-Sync": "true" }
        }).catch(() => {
          // Silently ignore fetch errors
        });
      } catch (error) {
        // Continue silently
      }
    }, 30 * 1000); // Every 30 seconds

    // Sync general data (every 2 minutes)
    const generalInterval = setInterval(async () => {
      try {
        // Trigger a page revalidation in the background
        await fetch("/api/auth/refresh", { 
          method: "POST",
          headers: { "X-Background-Sync": "true" }
        }).catch(() => {
          // Silently ignore fetch errors
        });
      } catch (error) {
        // Continue silently
      }
    }, 2 * 60 * 1000); // Every 2 minutes

    // Also listen for visibility changes to sync more aggressively when user returns to tab
    const handleVisibilityChange = async () => {
      if (document.visibilityState === "visible") {
        try {
          // Immediately refresh when user returns to the tab
          await fetch("/api/auth/refresh", { 
            method: "POST",
            headers: { "X-Background-Sync": "true" }
          }).catch(() => {
            // Silently ignore
          });
        } catch (error) {
          // Continue silently
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(bookingInterval);
      clearInterval(generalInterval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return null;
}
