export default function DemoBusinessPage() {
  return (
  <div className="min-h-screen bg-gray-50 text-slate-900 dark:text-slate-100 dark:bg-slate-950">
      <header className="border-b bg-white px-6 py-4">
        <div className="mx-auto max-w-5xl flex items-center justify-between">
          <div className="text-xl font-semibold text-indigo-600">Bookorvia</div>
          <a href="/" className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100">Back to Home</a>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-12">
        <section className="grid gap-8 md:grid-cols-2 md:items-center">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">Demo: The Local Coffee Shop</h1>
            <p className="mt-3 text-slate-700">Explore an example business page made with Bookorvia — quick bookings, review prompts, loyalty cards and a QR/NFC contact point.</p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <a href="#book" className="inline-flex items-center rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700">Request booking</a>
              <a href="#loyalty" className="inline-flex items-center rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700">View loyalty card</a>
            </div>
          </div>

          <div>
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold">Open slots today</h3>
              <ul className="mt-3 space-y-2 text-sm text-slate-700 dark:text-slate-200">
                <li>10:00 AM — 10:30 AM <button className="ml-3 inline-block rounded-full bg-indigo-600 px-3 py-1 text-xs text-white">Request</button></li>
                <li>11:30 AM — 12:00 PM <button className="ml-3 inline-block rounded-full bg-indigo-600 px-3 py-1 text-xs text-white">Request</button></li>
                <li>02:00 PM — 02:30 PM <button className="ml-3 inline-block rounded-full bg-indigo-600 px-3 py-1 text-xs text-white">Request</button></li>
              </ul>
            </div>
          </div>
        </section>

        <section id="book" className="mt-10">
          <h2 className="text-xl font-semibold">Booking request</h2>
          <p className="mt-2 text-slate-700">This demo shows a simple, friendly booking request flow. In the real product this would open a form or send a WhatsApp invite.</p>

          <div className="mt-4 rounded-lg bg-white p-6 shadow-sm">
            <label className="block text-sm font-medium text-slate-700">Name</label>
            <input className="mt-1 w-full rounded-md border-gray-200 bg-gray-50 p-2" placeholder="Your name" />

            <label className="mt-4 block text-sm font-medium text-slate-700">Preferred time</label>
            <select className="mt-1 w-full rounded-md border-gray-200 bg-white p-2">
              <option>10:00 AM</option>
              <option>11:30 AM</option>
              <option>02:00 PM</option>
            </select>

            <div className="mt-4 flex justify-end">
              <button className="inline-flex items-center rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">Send request</button>
            </div>
          </div>
        </section>

        <section id="reviews" className="mt-10">
          <h2 className="text-xl font-semibold">Review booster (demo)</h2>
          <p className="mt-2 text-slate-700">After a visit, the business can ask for a review. This demo simulates an automated message.</p>

          <div className="mt-4 rounded-lg bg-white p-6 shadow-sm">
            <div className="text-sm text-slate-800 dark:text-slate-200">Hi Alex — thanks for visiting! Would you mind leaving a quick review?</div>
            <div className="mt-3 flex gap-2">
              <button className="inline-flex items-center rounded-full bg-green-500 px-3 py-1 text-sm font-semibold text-white">Leave a review</button>
              <button className="inline-flex items-center rounded-full border border-gray-200 bg-white px-3 py-1 text-sm font-semibold text-slate-700">Maybe later</button>
            </div>
          </div>
        </section>

        <section id="loyalty" className="mt-10">
          <h2 className="text-xl font-semibold">Loyalty card</h2>
          <p className="mt-2 text-slate-700">Digital punchcard: collect stamps and redeem a free item.</p>

          <div className="mt-4 flex gap-4">
            <div className="rounded-lg bg-white p-4 shadow-sm">
              <div className="grid grid-cols-5 gap-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-10 w-10 rounded bg-indigo-50" />
                ))}
              </div>
              <div className="mt-3 text-sm text-slate-500">0 / 5 stamps</div>
            </div>

            <div className="rounded-lg bg-white p-4 shadow-sm flex-1">
              <div className="text-sm text-slate-800">Show this page to the barista or scan the QR to add a stamp.</div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t bg-white px-6 py-6">
  <div className="mx-auto max-w-5xl text-sm text-slate-500">Demo page — not connected to backend. © {new Date().getFullYear()} Bookorvia</div>
      </footer>
    </div>
  );
}
