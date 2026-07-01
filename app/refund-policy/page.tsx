import PublicHeader from "../../components/public/PublicHeader";
import PublicFooter from "../../components/public/PublicFooter";

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex flex-col">
      <PublicHeader />
      
      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="rounded-3xl bg-white/80 backdrop-blur border border-white/60 shadow-xl p-8 sm:p-12">
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-slate-100 mb-4">Refund & Cancellation Policy</h1>
            <p className="text-slate-600 mb-8">Last updated: June 2026</p>

            <div className="prose prose-slate max-w-none space-y-8">
              <section>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">1. Overview</h2>
              <p className="text-slate-700 leading-relaxed">
                Bookorvia is committed to fair and transparent billing practices. This policy outlines how subscription cancellations and refunds are handled.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">2. Subscription Cancellation</h2>
              <p className="text-slate-700 leading-relaxed">
                You can cancel your subscription at any time through your account settings. Upon cancellation:
              </p>
              <ul className="list-disc list-inside text-slate-700 space-y-2 mt-4">
                <li>Your access to premium features will end at the end of the current billing cycle</li>
                <li>No further charges will be applied</li>
                <li>Your business data will remain available for 30 days for export</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">3. Refund Eligibility</h2>
              <p className="text-slate-700 leading-relaxed">
                Refunds are available under the following circumstances:
              </p>
              <ul className="list-disc list-inside text-slate-700 space-y-2 mt-4">
                <li><strong>Billing Errors:</strong> If you were charged in error, we will issue a refund</li>
                <li><strong>Service Interruption:</strong> If the service was unavailable for an extended period due to our fault</li>
                <li><strong>14-Day Trial:</strong> If you cancel within 14 days of your first subscription payment, you may be eligible for a refund</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">4. Non-Refundable Items</h2>
              <p className="text-slate-700 leading-relaxed">
                The following are not eligible for refunds:
              </p>
              <ul className="list-disc list-inside text-slate-700 space-y-2 mt-4">
                <li>Subscription fees after the 14-day trial period (except as noted above)</li>
                <li>Services already rendered or features already used</li>
                <li>Voluntary downgrades to lower tier plans during a billing cycle</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">5. How to Request a Refund</h2>
              <p className="text-slate-700 leading-relaxed">
                To request a refund:
              </p>
              <ol className="list-decimal list-inside text-slate-700 space-y-2 mt-4">
                <li>Contact our support team through the Support & Help section in your profile</li>
                <li>Provide details about your refund request, including order details and reason</li>
                <li>Our team will review your request within 3-5 business days</li>
                <li>If approved, the refund will be processed to your original payment method within 5-10 business days</li>
              </ol>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">6. Billing Disputes</h2>
              <p className="text-slate-700 leading-relaxed">
                If you believe you've been charged incorrectly:
              </p>
              <ul className="list-disc list-inside text-slate-700 space-y-2 mt-4">
                <li>Contact support immediately with your invoice details</li>
                <li>We will investigate the charge within 3 business days</li>
                <li>Disputed charges will be credited back while under investigation</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">7. Chargeback Policy</h2>
              <p className="text-slate-700 leading-relaxed">
                If you initiate a chargeback through your credit card or payment provider instead of contacting us first, your account may be suspended pending investigation. We encourage you to use our support channels for faster resolution.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">8. Contact Support</h2>
              <p className="text-slate-700 leading-relaxed">
                For refund requests or billing questions, please contact us:
              </p>
              <ul className="list-disc list-inside text-slate-700 space-y-2 mt-4">
                <li>Visit <a href="/dashboard/support" className="text-indigo-600 hover:text-indigo-800 font-semibold">Support & Help</a> (logged-in users)</li>
                <li>Visit <a href="/contact" className="text-indigo-600 hover:text-indigo-800 font-semibold">Contact Us</a> for general inquiries</li>
                <li>Response times: within 24 hours for urgent matters, 3-5 business days for general requests</li>
              </ul>
            </section>

            <div className="mt-12 p-6 rounded-xl bg-amber-50 border border-amber-200">
              <p className="text-sm text-amber-900">
                <strong>Note:</strong> This is a general template refund policy. Specific terms may be updated based on actual subscription plans offered. Please review our Terms of Service for complete details.
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
