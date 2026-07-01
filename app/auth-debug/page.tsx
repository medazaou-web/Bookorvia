"use client";
import { useEffect, useState } from "react";
import supabase from "../../lib/supabase/browserClient";

export default function AuthDebugPage() {
  const [user, setUser] = useState<any>(null);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    let mounted = true;
    async function check() {
      try {
        const { data } = await supabase.auth.getUser();
        if (!mounted) return;
        setUser(data?.user ?? null);
      } catch (e) {
        // ignore
      }

      try {
        const { data } = await supabase.auth.getSession();
        if (!mounted) return;
        setSession(data?.session ?? null);
      } catch (e) {
        // ignore
      }
    }
    check();
    return () => {
      mounted = false;
    };
  }, []);

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || null;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || null;

  return (
    <div className="p-6">
      <h1 className="text-lg font-semibold">Auth debug</h1>
      <div className="mt-4 space-y-2 text-sm">
        <div>
          <strong>NEXT_PUBLIC_SUPABASE_URL:</strong> {url ? <span className="text-emerald-700">Loaded</span> : <span className="text-red-600">Missing</span>}
        </div>
        <div>
          <strong>NEXT_PUBLIC_SUPABASE_ANON_KEY:</strong> {key ? <span className="text-emerald-700">Loaded</span> : <span className="text-red-600">Missing</span>}
        </div>
        <div className="mt-3">
          <strong>Browser getUser():</strong>
          <pre className="mt-2 max-h-48 overflow-auto rounded-md bg-gray-50 p-2 text-xs text-slate-700">{JSON.stringify(user, null, 2)}</pre>
        </div>
        <div className="mt-3">
          <strong>Browser getSession():</strong>
          <pre className="mt-2 max-h-48 overflow-auto rounded-md bg-gray-50 p-2 text-xs text-slate-700">{JSON.stringify(session, null, 2)}</pre>
        </div>
      </div>
    </div>
  );
}
