export default function TestSupabasePage() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || null;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || null;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-3xl rounded-xl bg-white p-6 shadow-sm border border-gray-100">
  <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Supabase environment check</h1>
  <p className="mt-3 text-sm text-slate-700">This page verifies that your public Supabase environment variables are available to the app.</p>

        <div className="mt-6 space-y-3 text-sm">
          <div>
            <strong>NEXT_PUBLIC_SUPABASE_URL:</strong> {url ? <span className="text-emerald-700">Loaded</span> : <span className="text-red-600">Missing</span>}
          </div>
          <div>
            <strong>NEXT_PUBLIC_SUPABASE_ANON_KEY:</strong> {key ? <span className="text-emerald-700">Loaded</span> : <span className="text-red-600">Missing</span>}
          </div>
        </div>

        {url && key ? (
          <div className="mt-6 rounded-md bg-emerald-50 p-3 text-sm text-emerald-700">Success — public Supabase variables are available.</div>
        ) : (
          <div className="mt-6 rounded-md bg-amber-50 p-3 text-sm text-amber-700">One or more public Supabase variables are missing. Check your .env.local.</div>
        )}
      </div>
    </div>
  );
}
