"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import supabase from "../../lib/supabase/browserClient";

export default function LoginForm({ nextPath = "/dashboard" }: { nextPath?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const resp = await supabase.auth.signInWithPassword({ email, password });
      const { data, error: err } = resp;
      if (err) {
        setError(err.message || "Login failed.");
      } else {
        const user = (data as any)?.user ?? null;
        const session = (data as any)?.session ?? null;
        if (user || session) {
          try {
            await fetch("/api/auth/refresh", { method: "POST", credentials: "include" });
          } catch (e) {
            // ignore
          }
          router.push(nextPath);
        } else {
          setInfo("Login succeeded but no session was returned. Check email/magic link or cookies.");
        }
      }
    } catch (e: any) {
      setError(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 flex items-center justify-center p-4 overflow-hidden transition-colors duration-200">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-600 text-white font-bold text-2xl mb-4">C</div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Welcome Back</h1>
          <p className="text-slate-600 dark:text-slate-400">Sign in to your Bookorvia dashboard</p>
        </div>

        {/* Main Card */}
        <div className="rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-white/60 dark:border-white/10 p-8 shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="rounded-2xl bg-gradient-to-r from-red-50 dark:from-red-950/30 to-red-100/50 dark:to-red-900/30 border border-red-200 dark:border-red-800/50 p-4 text-sm text-red-700 dark:text-red-300 font-medium">
                <div className="flex items-start gap-3">
                  <span className="text-lg">⚠️</span>
                  <div>{error}</div>
                </div>
              </div>
            )}

            {info && (
              <div className="rounded-2xl bg-gradient-to-r from-emerald-50 dark:from-emerald-950/30 to-emerald-100/50 dark:to-emerald-900/30 border border-emerald-200 dark:border-emerald-800/50 p-4 text-sm text-emerald-700 dark:text-emerald-300 font-medium">
                <div className="flex items-start gap-3">
                  <span className="text-lg">✓</span>
                  <div>{info}</div>
                </div>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Email Address</label>
              <input 
                required 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                type="email" 
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white/50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-all" 
                placeholder="you@example.com" 
              />
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-slate-900 dark:text-white">Password</label>
                <Link href="/forgot-password" className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-semibold hover:underline transition-colors">
                  Forgot?
                </Link>
              </div>
              <input 
                required 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                type="password" 
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white/50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-all" 
                placeholder="••••••••" 
              />
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={loading}
              className="w-full mt-8 px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold text-center hover:shadow-2xl hover:-translate-y-1 active:scale-95 disabled:opacity-60 transition-all duration-200"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white dark:bg-slate-900 px-2 text-slate-600 dark:text-slate-400">New to Bookorvia?</span>
            </div>
          </div>

          {/* Sign Up Link */}
          <a 
            href="/register" 
            className="block w-full px-4 py-3 rounded-xl border-2 border-indigo-200 dark:border-indigo-800 bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-bold text-center hover:bg-indigo-50 dark:hover:bg-slate-700 transition-colors"
          >
            Create Account
          </a>
        </div>

        {/* Footer */}
        <div className="mt-6 space-y-3">
          <div className="text-center text-sm text-slate-600 dark:text-slate-400">
            <p>By signing in, you agree to our <Link href="/terms" className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium">Terms of Service</Link></p>
          </div>
          <div className="flex gap-4 text-xs text-slate-600 dark:text-slate-400 justify-center flex-wrap">
            <Link href="/privacy" className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">Privacy</Link>
            <Link href="/cookies" className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">Cookies</Link>
            <Link href="/refund-policy" className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">Refund</Link>
            <Link href="/contact" className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">Contact</Link>
            <Link href="/help" className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">Help</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
