import PublicHeader from "../../components/public/PublicHeader";
import PublicFooter from "../../components/public/PublicFooter";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex flex-col">
      <PublicHeader />
      
      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="rounded-3xl bg-white/80 backdrop-blur border border-white/60 shadow-xl p-8 sm:p-12">
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-slate-100 mb-4">Privacy Policy</h1>
            <p className="text-slate-600 mb-8">Last updated: June 2026</p>

            <div className="prose prose-slate max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">1. Data We Collect</h2>
              <p className="text-slate-700 leading-relaxed">Bookorvia collects the following information:</p>
              <ul className="list-disc list-inside text-slate-700 space-y-2 mt-4">
                <li>
                  <strong>Account Information:</strong> Email address, password, and profile details (name, phone, address)
                </li>
                <li>
                  <strong>Business Profile:</strong> Business name, category, description, phone, WhatsApp number, and address
                </li>
                <li>
                  <strong>Client Data:</strong> Client names, phone numbers, booking history, and service preferences
                </li>
                <li>
                  <strong>Booking Information:</strong> Dates, times, services, and booking status
                </li>
                <li>
                  <strong>Reviews and Ratings:</strong> Customer ratings and review text
                </li>
                <li>
                  <strong>Loyalty Program Data:</strong> Stamp count, rewards, and customer preferences
                </li>
                <li>
                  <strong>Support Messages:</strong> Messages and attachments submitted through support tickets
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">2. How We Use Your Data</h2>
              <p className="text-slate-700 leading-relaxed">We use your data to:</p>
              <ul className="list-disc list-inside text-slate-700 space-y-2 mt-4">
                <li>Provide and improve the Bookorvia service</li>
                <li>Manage your account and process subscriptions</li>
                <li>Respond to support requests</li>
                <li>Send service updates and notifications</li>
                <li>Analyze usage and improve features</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">3. Data Storage and Security</h2>
              <p className="text-slate-700 leading-relaxed">
                Your data is stored securely using industry-standard encryption. Bookorvia uses Supabase (PostgreSQL-based) for data storage. We implement appropriate technical and organizational measures to protect your data against unauthorized access.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">4. Your Rights</h2>
              <p className="text-slate-700 leading-relaxed">You have the right to:</p>
              <ul className="list-disc list-inside text-slate-700 space-y-2 mt-4">
                <li>Access your personal data</li>
                <li>Request correction of inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Export your data</li>
                <li>Opt-out of non-essential communications</li>
              </ul>
              <p className="text-slate-700 leading-relaxed mt-4">
                To exercise these rights, please contact us through our{" "}
                <a href="/contact" className="text-indigo-600 hover:text-blue-600 font-bold">
                  contact page
                </a>
                .
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">5. Third-Party Sharing</h2>
              <p className="text-slate-700 leading-relaxed">
                We do not sell your personal data to third parties. We only share data with service providers necessary to operate Bookorvia (hosting, payment processing, etc.), and they are bound by confidentiality agreements.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">6. Contact Us</h2>
              <p className="text-slate-700 leading-relaxed">
                For privacy-related questions, please contact us at{" "}
                <a href="/contact" className="text-indigo-600 hover:text-blue-600 font-bold">
                  our contact page
                </a>
                .
              </p>
            </section>
            <div className="mt-12 p-6 rounded-xl bg-amber-50 border border-amber-200">
              <p className="text-sm text-amber-900">
                <strong>Note:</strong> This is a general privacy policy template. Before launch, please have a legal professional review and customize this policy according to applicable data protection regulations in your jurisdiction (GDPR, CCPA, etc.).
              </p>
            </div>
            </div> {/* End of prose div */}
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
