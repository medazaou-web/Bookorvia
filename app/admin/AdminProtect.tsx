"use client";
import { useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import supabase from "../../lib/supabase/browserClient";

export default function AdminProtect({ children }: { children: ReactNode }) {
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
        // Not logged in - redirect to login
        router.push(`/login?next=${encodeURIComponent("/admin")}`);
        return;
      }

      // Check if user is admin/support/support_manager
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      const role = (profile as any)?.role;
      const isAuthorized = role === "admin" || role === "support" || role === "support_manager";

      if (!isAuthorized) {
        // Not authorized - redirect to dashboard
        router.push("/dashboard");
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
