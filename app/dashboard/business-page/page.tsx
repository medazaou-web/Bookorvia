"use client";
import { useEffect, useState } from "react";
import supabase from "../../../lib/supabase/browserClient";
import QRCode from "qrcode";

export default function DashboardBusinessPage() {
  const [loading, setLoading] = useState(true);
  const [business, setBusiness] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const { data: userData } = await supabase.auth.getUser();
        const user = (userData as any)?.user ?? null;
        if (!user) {
          setError("Please log in to view your business page.");
          setLoading(false);
          return;
        }

        const { data, error: fetchErr } = await supabase
          .from("businesses")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (fetchErr) {
          // if no business found, data will be null
          if ((fetchErr as any).code === "PGRST116") {
            if (mounted) setBusiness(null);
          } else {
            throw fetchErr;
          }
        } else {
          if (mounted) setBusiness(data ?? null);
        }
      } catch (e: any) {
        if (mounted) setError(e?.message || String(e));
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const publicLink = business ? `${location.origin}/b/${business.slug}` : "/b/demo";
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [qrLoading, setQrLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function gen() {
      if (!business) {
        setQrDataUrl(null);
        return;
      }
      const url = `${location.origin}/b/${business.slug}`;
      setQrLoading(true);
      try {
        const dataUrl = await QRCode.toDataURL(url, { margin: 2, width: 300 });
        if (mounted) setQrDataUrl(dataUrl);
      } catch (e: any) {
        if (mounted) setQrDataUrl(null);
      } finally {
        if (mounted) setQrLoading(false);
      }
    }
    gen();
    return () => { mounted = false; };
  }, [business]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(publicLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      // fallback: select and copy
      const ta = document.createElement("textarea");
      ta.value = publicLink;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-12">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Business Page</h1>
          <p className="text-lg text-slate-600">Your public business page and QR/NFC settings</p>
        </div>
      </div>

      {loading ? (
        <div className="rounded-3xl bg-white/80 backdrop-blur border border-white/60 shadow-lg p-12 text-center text-slate-600">
          Loading your business…
        </div>
      ) : !business ? (
        <div className="rounded-3xl bg-blue-50 border border-blue-200 shadow-lg p-12 text-center">
          <div className="text-5xl mb-4">🏢</div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">No business profile yet</h3>
          <p className="text-slate-600 mb-6">Create your business profile first in Settings to generate your public page</p>
          <a href="/dashboard/settings" className="inline-block px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold hover:shadow-lg hover:-translate-y-1 transition-all">
            Go to Settings
          </a>
        </div>
      ) : error ? (
        <div className="rounded-3xl bg-red-50 border border-red-200 shadow-lg p-6 text-red-700 font-medium">
          ⚠️ {error}
        </div>
      ) : (
        <div className="space-y-8">
          {/* Public Link Section */}
          <div className="rounded-3xl bg-white/80 backdrop-blur border border-white/60 shadow-lg p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">🔗 Your Public Link</h2>
            
            <div className="mb-6 p-6 rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200">
              <p className="text-sm font-semibold text-indigo-700 uppercase tracking-wide mb-3">Public Page URL</p>
              <div className="font-mono text-lg text-indigo-900 break-all mb-4">{publicLink}</div>
              <div className="flex gap-3 flex-wrap">
                <button
                  onClick={handleCopy}
                  className="px-6 py-2 rounded-xl bg-indigo-600 text-white font-bold hover:shadow-lg active:scale-95 transition-all"
                >
                  {copied ? '✓ Copied!' : '📋 Copy Link'}
                </button>
                <a
                  href={business ? `/b/${business.slug}` : '/b/demo'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-2 rounded-xl border-2 border-indigo-600 text-indigo-600 font-bold hover:bg-indigo-50 transition-all"
                >
                  👁 View Page
                </a>
              </div>
            </div>

            <p className="text-slate-600">
              Share this link with your customers so they can view your services, book appointments, and leave reviews.
            </p>
          </div>

          {/* QR Code Section */}
          <div className="rounded-3xl bg-white/80 backdrop-blur border border-white/60 shadow-lg p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">📱 QR Code</h2>

            <div className="grid md:grid-cols-2 gap-8">
              {/* QR Code Display */}
              <div className="flex flex-col items-center">
                <div className="w-64 h-64 rounded-2xl bg-white p-4 shadow-xl border border-slate-200 flex items-center justify-center mb-6">
                  {qrLoading ? (
                    <div className="text-slate-500">Generating QR code…</div>
                  ) : qrDataUrl ? (
                    <img src={qrDataUrl} alt="QR code" className="max-w-full max-h-full" />
                  ) : (
                    <div className="text-slate-500">QR unavailable</div>
                  )}
                </div>
                
                {qrDataUrl && (
                  <button
                    onClick={() => {
                      const a = document.createElement('a');
                      a.href = qrDataUrl;
                      a.download = `${business?.slug || 'business'}-qr.png`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                    }}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-bold hover:shadow-lg active:scale-95 transition-all"
                  >
                    ⬇ Download QR
                  </button>
                )}
              </div>

              {/* QR Code Info */}
              <div>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">💡 What is a QR Code?</h3>
                    <p className="text-slate-600">
                      A QR code is a scannable image that links directly to your business page. Customers can scan it with their phone camera to instantly access your services and booking form.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">🎯 How to Use</h3>
                    <ul className="text-slate-600 space-y-2 list-disc list-inside">
                      <li>Print the QR code on business cards</li>
                      <li>Display it in your storefront or window</li>
                      <li>Add it to invoices and receipts</li>
                      <li>Write it on an NFC card</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">📌 Tips</h3>
                    <ul className="text-slate-600 space-y-2 list-disc list-inside">
                      <li>Make the QR code at least 2cm × 2cm</li>
                      <li>Ensure good contrast and clear printing</li>
                      <li>Test by scanning it before printing</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

