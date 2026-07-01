import PublicHeader from "../../components/public/PublicHeader";
import PublicFooter from "../../components/public/PublicFooter";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex flex-col">
      <PublicHeader />
      
      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="rounded-3xl bg-white/80 backdrop-blur border border-white/60 shadow-xl p-8 sm:p-12">
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-slate-100 mb-4">Terms of Service</h1>
            <p className="text-slate-600 mb-8">Last updated: June 2026</p>

            <div className="prose prose-slate max-w-none space-y-8">
              <section>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">1. Use of Service</h2>
              <p className="text-slate-700 leading-relaxed">
                Bookorvia is a business management platform designed for service providers to manage bookings, clients, reviews, loyalty programs, and customer communications. By using Bookorvia, you agree to comply with these terms and use the service only for lawful purposes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">2. Account Responsibility</h2>
              <p className="text-slate-700 leading-relaxed">
                You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to provide accurate and complete information during registration and to update this information as needed.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">3. Payment and Billing</h2>
              <p className="text-slate-700 leading-relaxed">
                Bookorvia offers subscription plans with various pricing tiers. You agree to pay all fees according to the plan you select. Billing occurs on a recurring basis unless you cancel your subscription. Refund policies are detailed separately.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">4. Acceptable Use</h2>
              <p className="text-slate-700 leading-relaxed">
                You agree not to use Bookorvia for:
              </p>
              <ul className="list-disc list-inside text-slate-700 space-y-2 mt-4">
                <li>Illegal activities or violations of any laws</li>
                <li>Harassment, abuse, or threats toward other users</li>
                <li>Spamming or unsolicited communications</li>
                <li>Attempts to gain unauthorized access</li>
                <li>Any activity that disrupts or harms the service</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">5. Limitation of Liability</h2>
              <p className="text-slate-700 leading-relaxed">
                To the maximum extent permitted by law, Bookorvia is provided "as is" without warranties of any kind. We are not liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">6. Contact Us</h2>
              <p className="text-slate-700 leading-relaxed">
                For questions about these terms, please contact us at{" "}
                <a href="/contact" className="text-indigo-600 hover:text-blue-600 font-bold">
                  our contact page
                </a>
                .
              </p>
            </section>

            <div className="mt-12 p-6 rounded-xl bg-amber-50 border border-amber-200">
              <p className="text-sm text-amber-900">
                <strong>Note:</strong> This is a general template placeholder. Before launching Bookorvia, please have a legal professional review and customize these terms for your jurisdiction and specific business requirements.
              </p>
            </div>
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
