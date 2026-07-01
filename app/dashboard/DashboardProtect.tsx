"use client";
import { useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import supabase from "../../lib/supabase/browserClient";

export default function DashboardProtect({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

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
