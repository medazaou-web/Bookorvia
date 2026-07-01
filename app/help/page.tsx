"use client";
import { useEffect, useState } from "react";
import supabase from "../../lib/supabase/browserClient";
import PublicHeader from "../../components/public/PublicHeader";
import PublicFooter from "../../components/public/PublicFooter";

export default function HelpPage() {
  const [userAuth, setUserAuth] = useState<boolean | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const user = (userData as any)?.user;
      setUserAuth(!!user);
    } catch (e) {
      setUserAuth(false);
    }
  }

  const handleSupportClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (userAuth === false) {
      e.preventDefault();
      window.location.href = "/login?next=/dashboard/support";
    } else if (userAuth === null) {
      // Still loading, let default behavior handle it
      e.preventDefault();
      // Give auth check a moment to complete
      setTimeout(() => {
        if (!userAuth) {
          window.location.href = "/login?next=/dashboard/support";
        } else {
          window.location.href = "/dashboard/support";
        }
      }, 500);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex flex-col">
      <PublicHeader />
      
      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="rounded-3xl bg-white/80 backdrop-blur border border-white/60 shadow-xl p-8 sm:p-12">
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-slate-100 mb-4">Help & FAQ</h1>
            <p className="text-slate-600 mb-12">Find answers to common questions about Bookorvia and how to use it effectively.</p>

            <div className="space-y-6">
              {/* Getting Started */}
              <section>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-3">
                <span className="text-3xl">🚀</span> Getting Started
              </h2>
              <div className="space-y-4">
                <details className="group rounded-lg border border-slate-200 bg-white/50 p-5 cursor-pointer hover:border-indigo-300 transition-colors">
                  <summary className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    How do I create my business profile?
                    <span className="ml-auto group-open:rotate-180 transition-transform text-slate-400">🔽</span>
                  </summary>
                  <div className="text-slate-700 mt-4 space-y-2">
                    <p>1. Sign in to your Bookorvia account</p>
                    <p>2. Click on "Setup Business" or navigate to the onboarding section</p>
                    <p>3. Fill in your business details:
                      <ul className="list-disc list-inside ml-4 mt-2">
                        <li>Business name</li>
                        <li>Category (Salon, Barber, Spa, Clinic, Fitness, etc.)</li>
                        <li>Description and services offered</li>
                        <li>Contact information (phone, WhatsApp, address)</li>
                      </ul>
                    </p>
                    <p>4. Add your business logo or cover image</p>
                    <p>5. Review and publish your public business page</p>
                  </div>
                </details>

                <details className="group rounded-lg border border-slate-200 bg-white/50 p-5 cursor-pointer hover:border-indigo-300 transition-colors">
                  <summary className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    How do I set up my business services?
                    <span className="ml-auto group-open:rotate-180 transition-transform text-slate-400">🔽</span>
                  </summary>
                  <div className="text-slate-700 mt-4 space-y-2">
                    <p>1. Go to your business dashboard</p>
                    <p>2. Click on "Services" in the left menu</p>
                    <p>3. Click "Add Service" to create a new service</p>
                    <p>4. Fill in service details:
                      <ul className="list-disc list-inside ml-4 mt-2">
                        <li>Service name (e.g., "Haircut", "Facial", "Personal Training")</li>
                        <li>Duration in minutes</li>
                        <li>Price or rate</li>
                        <li>Description</li>
                      </ul>
                    </p>
                    <p>5. Save the service</p>
                    <p>6. Repeat for all your services</p>
                  </div>
                </details>

                <details className="group rounded-lg border border-slate-200 bg-white/50 p-5 cursor-pointer hover:border-indigo-300 transition-colors">
                  <summary className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    What's the difference between a public profile and a private one?
                    <span className="ml-auto group-open:rotate-180 transition-transform text-slate-400">🔽</span>
                  </summary>
                  <div className="text-slate-700 mt-4 space-y-2">
                    <p><strong>Public Profile:</strong> Your business page is visible to anyone with the link. Customers can view your services, leave reviews, and request bookings through your public page.</p>
                    <p><strong>Private Profile:</strong> Your business is only visible to you. Use this while you're setting up and don't want the public to see your page yet.</p>
                  </div>
                </details>
              </div>
            </section>

            {/* Bookings & Scheduling */}
            <section>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-3">
                <span className="text-3xl">📅</span> Bookings & Scheduling
              </h2>
              <div className="space-y-4">
                <details className="group rounded-lg border border-slate-200 bg-white/50 p-5 cursor-pointer hover:border-indigo-300 transition-colors">
                  <summary className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    How do customers book appointments?
                    <span className="ml-auto group-open:rotate-180 transition-transform text-slate-400">🔽</span>
                  </summary>
                  <div className="text-slate-700 mt-4 space-y-2">
                    <p>Customers can book appointments in several ways:</p>
                    <ul className="list-disc list-inside ml-4 space-y-2 mt-2">
                      <li><strong>Public Page:</strong> Visit your public business page and click "Book Now"</li>
                      <li><strong>QR Code:</strong> Scan your business QR code to access your booking page</li>
                      <li><strong>NFC Tag:</strong> If you have an NFC tag, tap it with an NFC-enabled phone</li>
                      <li><strong>Direct Link:</strong> Share your booking link via WhatsApp, email, or social media</li>
                    </ul>
                  </div>
                </details>

                <details className="group rounded-lg border border-slate-200 bg-white/50 p-5 cursor-pointer hover:border-indigo-300 transition-colors">
                  <summary className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    How do I manage my bookings calendar?
                    <span className="ml-auto group-open:rotate-180 transition-transform text-slate-400">🔽</span>
                  </summary>
                  <div className="text-slate-700 mt-4 space-y-2">
                    <p>1. Go to your business dashboard</p>
                    <p>2. Click on "Bookings" or "Calendar"</p>
                    <p>3. You can:
                      <ul className="list-disc list-inside ml-4 mt-2">
                        <li>View all upcoming bookings</li>
                        <li>Accept or decline booking requests</li>
                        <li>Mark bookings as completed</li>
                        <li>Add notes to bookings</li>
                        <li>Cancel bookings (with customer notification)</li>
                      </ul>
                    </p>
                  </div>
                </details>

                <details className="group rounded-lg border border-slate-200 bg-white/50 p-5 cursor-pointer hover:border-indigo-300 transition-colors">
                  <summary className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    Can I set my availability?
                    <span className="ml-auto group-open:rotate-180 transition-transform text-slate-400">🔽</span>
                  </summary>
                  <div className="text-slate-700 mt-4 space-y-2">
                    <p>Yes! You can manage your availability through your business settings:</p>
                    <ul className="list-disc list-inside ml-4 space-y-2 mt-2">
                      <li>Set your business hours for each day of the week</li>
                      <li>Add holidays or days off</li>
                      <li>Block out specific time slots</li>
                      <li>Set buffer time between bookings</li>
                    </ul>
                    <p className="mt-2">Customers can only book during your available time slots.</p>
                  </div>
                </details>
              </div>
            </section>

            {/* Clients & Follow-ups */}
            <section>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-3">
                <span className="text-3xl">👥</span> Clients & Follow-ups
              </h2>
              <div className="space-y-4">
                <details className="group rounded-lg border border-slate-200 bg-white/50 p-5 cursor-pointer hover:border-indigo-300 transition-colors">
                  <summary className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    How do I manage my client list?
                    <span className="ml-auto group-open:rotate-180 transition-transform text-slate-400">🔽</span>
                  </summary>
                  <div className="text-slate-700 mt-4 space-y-2">
                    <p>1. Go to your business dashboard</p>
                    <p>2. Click on "Clients"</p>
                    <p>3. You can:
                      <ul className="list-disc list-inside ml-4 mt-2">
                        <li>View all clients who have booked with you</li>
                        <li>Add notes about each client (preferences, allergies, etc.)</li>
                        <li>View their booking history</li>
                        <li>See their reviews and ratings</li>
                        <li>Add to loyalty program</li>
                      </ul>
                    </p>
                  </div>
                </details>

                <details className="group rounded-lg border border-slate-200 bg-white/50 p-5 cursor-pointer hover:border-indigo-300 transition-colors">
                  <summary className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    What are follow-up tasks?
                    <span className="ml-auto group-open:rotate-180 transition-transform text-slate-400">🔽</span>
                  </summary>
                  <div className="text-slate-700 mt-4 space-y-2">
                    <p>Follow-up tasks help you stay connected with your clients:</p>
                    <ul className="list-disc list-inside ml-4 space-y-2 mt-2">
                      <li>Create reminders to follow up with clients after their appointment</li>
                      <li>Send personalized messages via WhatsApp or email</li>
                      <li>Ask for feedback and reviews</li>
                      <li>Offer loyalty rewards or special discounts</li>
                      <li>Track follow-up completion</li>
                    </ul>
                    <p className="mt-2">Set up follow-up templates to save time with recurring messages.</p>
                  </div>
                </details>
              </div>
            </section>

            {/* Reviews & Ratings */}
            <section>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-3">
                <span className="text-3xl">⭐</span> Reviews & Ratings
              </h2>
              <div className="space-y-4">
                <details className="group rounded-lg border border-slate-200 bg-white/50 p-5 cursor-pointer hover:border-indigo-300 transition-colors">
                  <summary className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    How do customers leave reviews?
                    <span className="ml-auto group-open:rotate-180 transition-transform text-slate-400">🔽</span>
                  </summary>
                  <div className="text-slate-700 mt-4 space-y-2">
                    <p>After a booking is completed, customers receive:</p>
                    <ul className="list-disc list-inside ml-4 space-y-2 mt-2">
                      <li>An automatic review request via email or WhatsApp</li>
                      <li>A link to your review page on your public business profile</li>
                      <li>They can rate (1-5 stars) and leave written feedback</li>
                    </ul>
                    <p className="mt-2">You can also manually request reviews from within the dashboard.</p>
                  </div>
                </details>

                <details className="group rounded-lg border border-slate-200 bg-white/50 p-5 cursor-pointer hover:border-indigo-300 transition-colors">
                  <summary className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    How do I respond to reviews?
                    <span className="ml-auto group-open:rotate-180 transition-transform text-slate-400">🔽</span>
                  </summary>
                  <div className="text-slate-700 mt-4 space-y-2">
                    <p>1. Go to "Reviews" in your business dashboard</p>
                    <p>2. Click on a review to open it</p>
                    <p>3. Click "Reply" to respond publicly</p>
                    <p>4. Write your response thanking the customer or addressing their feedback</p>
                    <p>5. Your response will appear on your public page</p>
                  </div>
                </details>
              </div>
            </section>

            {/* Loyalty Program */}
            <section>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-3">
                <span className="text-3xl">🎁</span> Loyalty Program
              </h2>
              <div className="space-y-4">
                <details className="group rounded-lg border border-slate-200 bg-white/50 p-5 cursor-pointer hover:border-indigo-300 transition-colors">
                  <summary className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    How do I set up a loyalty program?
                    <span className="ml-auto group-open:rotate-180 transition-transform text-slate-400">🔽</span>
                  </summary>
                  <div className="text-slate-700 mt-4 space-y-2">
                    <p>1. Go to your business dashboard</p>
                    <p>2. Click on "Loyalty Program"</p>
                    <p>3. Set up your loyalty card:
                      <ul className="list-disc list-inside ml-4 mt-2">
                        <li>Choose how many stamps = reward (e.g., 10 appointments = 1 free service)</li>
                        <li>Set the reward description</li>
                        <li>Customize the card appearance</li>
                      </ul>
                    </p>
                    <p>4. Share the loyalty card QR code with customers</p>
                    <p>5. Manually stamp cards or let customers track digitally</p>
                  </div>
                </details>

                <details className="group rounded-lg border border-slate-200 bg-white/50 p-5 cursor-pointer hover:border-indigo-300 transition-colors">
                  <summary className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    How do customers use loyalty cards?
                    <span className="ml-auto group-open:rotate-180 transition-transform text-slate-400">🔽</span>
                  </summary>
                  <div className="text-slate-700 mt-4 space-y-2">
                    <p>Customers can:</p>
                    <ul className="list-disc list-inside ml-4 space-y-2 mt-2">
                      <li>Scan your QR code to access their digital loyalty card</li>
                      <li>See their current stamp count and progress</li>
                      <li>Get notified when they're close to earning a reward</li>
                      <li>Use printed cards if you prefer physical stamps</li>
                      <li>Redeem rewards when they reach the stamp goal</li>
                    </ul>
                  </div>
                </details>
              </div>
            </section>

            {/* QR Codes & NFC */}
            <section>
              <h2 className="text-3xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                <span className="text-3xl">📲</span> QR Codes & NFC
              </h2>
              <div className="space-y-4">
                <details className="group rounded-lg border border-slate-200 bg-white/50 p-5 cursor-pointer hover:border-indigo-300 transition-colors">
                  <summary className="font-bold text-slate-900 flex items-center gap-2">
                    How do I use QR codes for my business?
                    <span className="ml-auto group-open:rotate-180 transition-transform text-slate-400">🔽</span>
                  </summary>
                  <div className="text-slate-700 mt-4 space-y-2">
                    <p>Bookorvia generates unique QR codes for your business:</p>
                    <ul className="list-disc list-inside ml-4 space-y-2 mt-2">
                      <li>Business QR Code: Links to your public business page and booking system</li>
                      <li>Loyalty Card QR Code: Links to your loyalty program</li>
                      <li>Custom QR Codes: Print them on business cards, posters, or in-store displays</li>
                    </ul>
                    <p className="mt-2">Customers simply scan with their phone camera to access your services.</p>
                  </div>
                </details>

                <details className="group rounded-lg border border-slate-200 bg-white/50 p-5 cursor-pointer hover:border-indigo-300 transition-colors">
                  <summary className="font-bold text-slate-900 flex items-center gap-2">
                    What is NFC and how does it work?
                    <span className="ml-auto group-open:rotate-180 transition-transform text-slate-400">🔽</span>
                  </summary>
                  <div className="text-slate-700 mt-4 space-y-2">
                    <p><strong>NFC (Near Field Communication)</strong> is a wireless technology that lets customers tap your phone or device with theirs.</p>
                    <ul className="list-disc list-inside ml-4 space-y-2 mt-2">
                      <li>Order NFC tags or stickers from Bookorvia</li>
                      <li>We'll program them to link to your business page</li>
                      <li>Place them in your store or on business cards</li>
                      <li>Customers tap with their NFC-enabled phone</li>
                      <li>They're instantly taken to your booking page</li>
                    </ul>
                    <p className="mt-2">NFC is faster than QR codes and works without opening a camera app.</p>
                  </div>
                </details>
              </div>
            </section>

            {/* Account & Settings */}
            <section>
              <h2 className="text-3xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                <span className="text-3xl">⚙️</span> Account & Settings
              </h2>
              <div className="space-y-4">
                <details className="group rounded-lg border border-slate-200 bg-white/50 p-5 cursor-pointer hover:border-indigo-300 transition-colors">
                  <summary className="font-bold text-slate-900 flex items-center gap-2">
                    How do I update my profile?
                    <span className="ml-auto group-open:rotate-180 transition-transform text-slate-400">🔽</span>
                  </summary>
                  <div className="text-slate-700 mt-4 space-y-2">
                    <p>1. Click on your profile icon in the top right corner</p>
                    <p>2. Select "Profile Settings"</p>
                    <p>3. You can update:
                      <ul className="list-disc list-inside ml-4 mt-2">
                        <li>Your name and email</li>
                        <li>Profile picture/avatar</li>
                        <li>Password (with verification)</li>
                      </ul>
                    </p>
                    <p>4. Click "Save Changes"</p>
                  </div>
                </details>

                <details className="group rounded-lg border border-slate-200 bg-white/50 p-5 cursor-pointer hover:border-indigo-300 transition-colors">
                  <summary className="font-bold text-slate-900 flex items-center gap-2">
                    How do I delete my account?
                    <span className="ml-auto group-open:rotate-180 transition-transform text-slate-400">🔽</span>
                  </summary>
                  <div className="text-slate-700 mt-4 space-y-2">
                    <p>1. Go to Account Settings → "Danger Zone" or "Account Management"</p>
                    <p>2. Click "Delete Account"</p>
                    <p>3. Confirm your password</p>
                    <p>4. Your account and all associated data will be permanently deleted</p>
                    <p className="text-amber-700 font-semibold mt-2">⚠️ Warning: This action cannot be undone. Back up any important data first.</p>
                  </div>
                </details>
              </div>
            </section>

            {/* Still Need Help? */}
            <section className="mt-12 p-6 rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200">
              <h2 className="text-2xl font-bold text-indigo-900 mb-4 flex items-center gap-2">
                <span>🆘</span> Still Need Help?
              </h2>
              <p className="text-slate-700 mb-4">
                Can't find the answer you're looking for? Our support team is here to help!
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href="/dashboard/support"
                  onClick={handleSupportClick}
                  className="px-6 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-all hover:shadow-lg active:scale-95"
                >
                  Submit a Support Ticket
                </a>
                <a
                  href="/contact"
                  className="px-6 py-3 rounded-lg border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 font-semibold transition-all"
                >
                  Contact Us
                </a>
              </div>
            </section>
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
