"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "../../lib/supabase/browserClient";

export default function ClientAuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function check() {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          // treat as no session
          if (mounted) {
            router.replace("/login");
          }
          return;
        }

        const session = data?.session ?? null;
        if (!session) {
          // no session
          if (mounted) router.replace("/login");
        } else {
          // session exists; render children
          if (mounted) setLoading(false);
        }
      } catch (e) {
        if (mounted) router.replace("/login");
      }
    }

    check();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
  <div className="text-sm text-slate-500">Checking authentication…</div>
      </div>
    );
  }

  return <>{children}</>;
}
