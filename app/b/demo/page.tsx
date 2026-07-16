import Image from 'next/image';
import { MapPinIcon } from '@/components/icons';

export default function DemoBusinessPage() {
  const brandColor = "#f59e0b"; // Amber for dark mode
  const accentColor = "#fbbf24"; // Light amber accent
  
  return (
  <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white transition-colors duration-300">
    {/* Decorative elements */}
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 -left-40 w-96 h-96 bg-amber-500/3 rounded-full blur-3xl"></div>
    </div>

    {/* Header */}
    <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur border-b border-slate-700/50 transition-colors px-4 sm:px-6 py-4 shadow-sm">
      <div className="mx-auto max-w-7xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image 
            src="/bookorvia-logo.png" 
            alt="Bookorvia" 
            width={32} 
            height={32} 
            className="h-8 w-8 rounded-lg"
          />
          <div className="text-2xl font-bold text-white">Dr. Sarah's Clinic</div>
        </div>
        <a href="/" className="text-sm font-medium text-slate-300 hover:text-white transition-opacity">← Back</a>
      </div>
    </header>

    <main className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-12 relative z-10">
      {/* Premium Hero Section */}
      <div className="rounded-3xl bg-slate-800/40 border border-slate-700/50 shadow-xl overflow-hidden mb-8 sm:mb-12">
        {/* Cover Image Area */}
        <div 
          className="h-64 sm:h-80 md:h-96 bg-cover bg-center relative overflow-hidden"
          style={{
            backgroundImage: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-950/40"></div>
        </div>

        {/* Hero Content */}
        <div className="px-6 sm:px-8 md:px-12 pb-8 sm:pb-12 -mt-24 relative z-10">
          {/* Logo */}
          <div className="mb-6 sm:mb-8">
            <div 
              className="w-32 sm:w-40 h-32 sm:h-40 rounded-2xl shadow-2xl overflow-hidden border-4 flex items-center justify-center"
              style={{
                backgroundColor: 'white',
                borderColor: accentColor,
              }}
            >
              <Image 
                src="/bookorvia-logo.png" 
                alt="Dr. Sarah's Clinic" 
                width={120} 
                height={120} 
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Business Info */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-3 text-white">Dr. Sarah's Medical Clinic</h1>
            <p className="text-lg sm:text-xl font-semibold text-amber-400 mb-3">General Medicine & Family Health</p>
            <p className="text-base sm:text-lg leading-relaxed max-w-2xl text-slate-300">
              Professional medical care with a focus on patient wellness, preventive care, and personalized treatment plans. 
            </p>
            <p className="mt-4 text-sm sm:text-base text-slate-400 flex items-center gap-2">
              <MapPinIcon className="h-5 w-5 flex-shrink-0" /> 123 Healthcare Avenue, Medical Plaza, Downtown
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-3 sm:gap-4">
            <a 
              href="#book" 
              className="inline-flex items-center justify-center rounded-xl px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-bold text-slate-950 shadow-lg hover:shadow-xl hover:-translate-y-1 active:scale-95 transition-all"
              style={{ backgroundColor: brandColor }}
            >
              Book Appointment
            </a>
            <a 
              href="#services"
              className="inline-flex items-center justify-center rounded-xl px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-bold border-2 shadow-lg hover:shadow-xl hover:-translate-y-1 active:scale-95 transition-all"
              style={{ borderColor: accentColor, color: accentColor }}
            >
              Our Services
            </a>
            <a 
              href="#reviews"
              className="inline-flex items-center justify-center rounded-xl px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-bold border-2 shadow-lg hover:shadow-xl hover:-translate-y-1 active:scale-95 transition-all"
              style={{ borderColor: accentColor, color: accentColor }}
            >
              Reviews
            </a>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <section id="services" className="mb-8 sm:mb-12 scroll-mt-24">
        <div className="mb-6 sm:mb-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">Our Services</h2>
          <p className="text-slate-400 mt-2">Professional medical services for your health</p>
        </div>
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[
            { name: "General Checkup", price: "$60", duration: "30", desc: "Comprehensive health assessment" },
            { name: "Follow-up Visit", price: "$45", duration: "20", desc: "Monitor treatment progress" },
            { name: "Consultation", price: "$75", duration: "45", desc: "In-depth medical advice" },
            { name: "Treatment", price: "$120", duration: "60", desc: "Specialized treatment session" },
            { name: "Lab Work", price: "$50", duration: "15", desc: "Blood tests and screenings" },
            { name: "Health Counseling", price: "$55", duration: "30", desc: "Wellness and prevention guidance" }
          ].map((service, idx) => (
            <div 
              key={idx} 
              className="relative rounded-2xl overflow-hidden border border-slate-700/50 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all group bg-slate-800/40"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-amber-600/20 via-amber-600/10 to-slate-900/40"></div>
              <div className="relative p-6 sm:p-8">
                <h3 className="text-xl font-bold text-white mb-2">{service.name}</h3>
                <p className="text-slate-300 text-sm mb-6">{service.desc}</p>

                <div className="my-6 pt-6 border-t border-slate-700/50">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase text-slate-400">Price</p>
                      <p className="text-2xl font-bold mt-1 text-amber-400">{service.price}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase text-slate-400">Duration</p>
                      <p className="text-2xl font-bold mt-1 text-amber-400">{service.duration}</p>
                      <p className="text-xs text-slate-400 mt-1">min</p>
                    </div>
                  </div>
                </div>

                <a 
                  href="#book" 
                  className="block w-full text-center rounded-lg py-3 text-base font-bold shadow-md hover:shadow-lg transition-all active:scale-95 text-slate-950"
                  style={{ backgroundColor: brandColor }}
                >
                  Book Service
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Booking Section */}
      <section id="book" className="mb-8 sm:mb-12 scroll-mt-24">
        <div className="mb-6 sm:mb-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">Book an Appointment</h2>
          <p className="text-slate-400 mt-2">Choose your preferred date and time</p>
        </div>
        
        <div className="rounded-2xl bg-slate-800/40 border border-slate-700/50 p-6 sm:p-8 shadow-lg">
          <form className="space-y-6">
            <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Full Name</label>
                <input 
                  type="text"
                  placeholder="Your full name"
                  className="w-full rounded-lg border border-slate-700/50 bg-white/10 px-4 py-3 text-white placeholder:text-slate-400 focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400/50 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Email</label>
                <input 
                  type="email"
                  placeholder="your.email@example.com"
                  className="w-full rounded-lg border border-slate-700/50 bg-white/10 px-4 py-3 text-white placeholder:text-slate-400 focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400/50 transition-all"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Service</label>
                <select className="w-full rounded-lg border border-slate-700/50 bg-white/10 px-4 py-3 text-white focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400/50 transition-all">
                  <option className="bg-slate-950 text-white">General Checkup</option>
                  <option className="bg-slate-950 text-white">Follow-up Visit</option>
                  <option className="bg-slate-950 text-white">Consultation</option>
                  <option className="bg-slate-950 text-white">Treatment</option>
                  <option className="bg-slate-950 text-white">Lab Work</option>
                  <option className="bg-slate-950 text-white">Health Counseling</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Preferred Date</label>
                <input 
                  type="date"
                  className="w-full rounded-lg border border-slate-700/50 bg-white/10 px-4 py-3 text-white focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400/50 transition-all"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Preferred Time</label>
                <select className="w-full rounded-lg border border-slate-700/50 bg-white/10 px-4 py-3 text-white focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400/50 transition-all">
                  <option className="bg-slate-950 text-white">09:00 AM</option>
                  <option className="bg-slate-950 text-white">10:00 AM</option>
                  <option className="bg-slate-950 text-white">11:00 AM</option>
                  <option className="bg-slate-950 text-white">02:00 PM</option>
                  <option className="bg-slate-950 text-white">03:00 PM</option>
                  <option className="bg-slate-950 text-white">04:00 PM</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Phone</label>
                <input 
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  className="w-full rounded-lg border border-slate-700/50 bg-white/10 px-4 py-3 text-white placeholder:text-slate-400 focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400/50 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-white mb-2">Notes</label>
              <textarea 
                placeholder="Any additional information..."
                className="w-full rounded-lg border border-slate-700/50 bg-white/10 px-4 py-3 text-white placeholder:text-slate-400 focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400/50 transition-all"
                rows={4}
              />
            </div>

            <div className="flex justify-end gap-4">
              <button 
                type="button"
                className="inline-flex items-center justify-center rounded-lg px-6 py-3 text-base font-semibold border border-amber-500/30 text-amber-400 hover:bg-amber-500/10 transition-all active:scale-95"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="inline-flex items-center justify-center rounded-lg px-8 py-3 text-base font-semibold text-slate-950 shadow-lg hover:shadow-xl hover:-translate-y-1 active:scale-95 transition-all"
                style={{ backgroundColor: brandColor }}
              >
                Confirm Booking
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Reviews Section */}
      <section id="reviews" className="mb-8 sm:mb-12 scroll-mt-24">
        <div className="mb-6 sm:mb-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">Patient Reviews</h2>
          <p className="text-slate-400 mt-2">Real feedback from our patients</p>
        </div>

        <div className="rounded-3xl bg-slate-800/40 border border-slate-700/50 shadow-lg p-6 sm:p-8">
          <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              { name: "Emma S.", rating: 5, comment: "Dr. Sarah is incredibly professional and caring. She took time to listen to all my concerns and provided excellent care." },
              { name: "James M.", rating: 5, comment: "Best medical clinic I've visited. Very clean, modern, and the staff is very friendly and helpful." },
              { name: "Sarah T.", rating: 4, comment: "Great service and professional team. Would recommend to anyone looking for quality healthcare." },
              { name: "Michael P.", rating: 5, comment: "Outstanding care! Dr. Sarah explained everything clearly and made me feel comfortable." },
              { name: "Lisa R.", rating: 5, comment: "Highly satisfied with the treatment and follow-up care. Very attentive to patient needs." },
              { name: "David L.", rating: 4, comment: "Professional staff and modern facilities. Great experience overall." }
            ].map((review, idx) => (
              <div key={idx} className="rounded-xl bg-white/5 border border-white/10 p-6 hover:shadow-lg transition-all">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-white">{review.name}</h3>
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className={i < review.rating ? "text-amber-400" : "text-slate-600"}>★</span>
                    ))}
                  </div>
                </div>
                <p className="text-slate-300 text-sm">{review.comment}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="mb-8 sm:mb-12">
        <div className="mb-6 sm:mb-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">Get In Touch</h2>
        </div>
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
          <a 
            href="tel:+1234567890"
            className="rounded-2xl bg-slate-800/40 border border-slate-700/50 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all p-6 text-center group"
          >
            <p className="text-lg font-bold text-white mb-2">Phone</p>
            <p className="text-slate-400">+1 (234) 567-8900</p>
          </a>
          <a 
            href="https://wa.me/1234567890"
            target="_blank"
            rel="noreferrer"
            className="rounded-2xl bg-slate-800/40 border border-slate-700/50 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all p-6 text-center group"
          >
            <p className="text-lg font-bold text-white mb-2">WhatsApp</p>
            <p className="text-slate-400">+1 (234) 567-8900</p>
          </a>
          <a 
            href="https://instagram.com/sarahsclinic"
            target="_blank"
            rel="noreferrer"
            className="rounded-2xl bg-slate-800/40 border border-slate-700/50 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all p-6 text-center group"
          >
            <p className="text-lg font-bold text-white mb-2">Instagram</p>
            <p className="text-slate-400">@sarahsclinic</p>
          </a>
          <a 
            href="https://sarahsclinic.com"
            target="_blank"
            rel="noreferrer"
            className="rounded-2xl bg-slate-800/40 border border-slate-700/50 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all p-6 text-center group"
          >
            <p className="text-lg font-bold text-white mb-2">Website</p>
            <p className="text-slate-400">sarahsclinic.com</p>
          </a>
        </div>
      </section>
    </main>

    <footer className="bg-slate-950/80 backdrop-blur border-t border-slate-700/50 px-4 sm:px-6 py-8 mt-12 relative z-10">
      <div className="mx-auto max-w-7xl text-center">
        <p className="text-slate-400 text-sm">
          Powered by <span className="font-semibold text-white">Bookorvia</span> © {new Date().getFullYear()}
        </p>
        <p className="text-slate-500 text-xs mt-2">Professional booking & loyalty management</p>
      </div>
    </footer>
  </div>
  );
}
