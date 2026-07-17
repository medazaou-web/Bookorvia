'use client';

import { ThemeToggle } from './components/ThemeToggle';
import { useLanguage } from '@/lib/context/LanguageContext';
import { useTranslations } from '@/lib/i18n';
import { useState } from 'react';
import Image from 'next/image';
import {
  CalendarIcon,
  ClientsIcon,
  ReviewsIcon,
  FollowUpsIcon,
  LoyaltyIcon,
  QRIcon,
  SparkIcon,
  StarIcon,
  MessageIcon,
  GiftIcon,
  UserIcon,
  PhoneIcon,
  InstagramIcon,
  AlertIcon,
} from '@/components/icons';

export default function Home() {
  const { language, setLanguage } = useLanguage();
  const t = useTranslations(language);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);

  const languages = [
    { code: 'en' },
    { code: 'es' },
    { code: 'fr' },
  ];
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 text-slate-900 dark:text-slate-100 font-sans overflow-hidden transition-colors duration-200">
      <nav className="sticky top-0 z-50 border-b border-slate-200 dark:border-white/10 backdrop-blur-xl bg-white/60 dark:bg-slate-950/40 supports-[backdrop-filter]:bg-white/30 transition-colors duration-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between min-h-16 py-3">
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <Image 
              src="/bookorvia-logo.png" 
              alt="Bookorvia" 
              width={40} 
              height={40} 
              className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl"
            />
            <a href="/" className="text-lg sm:text-xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent hover:opacity-80 transition-opacity">Bookorvia</a>
          </div>
          <div className="hidden lg:flex items-center gap-6 lg:gap-8">
            <a href="#features" className="text-sm text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 font-medium transition-colors">{t('public.features')}</a>
            <a href="#pricing" className="text-sm text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 font-medium transition-colors">{t('public.pricing')}</a>
            <a href="/help" className="text-sm text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 font-medium transition-colors">{t('public.help')}</a>
            <a href="/login" className="px-4 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-800/50 text-sm font-semibold transition-colors">{t('common.signIn')}</a>
            
            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/50 dark:hover:bg-slate-800/50 transition-colors font-medium text-sm"
                title={t('public.changeLanguageTitle')}
              >
                {languages.find(l => l.code === language)?.code.toUpperCase()}
              </button>
              
              {showLanguageMenu && (
                <div className="absolute right-0 mt-2 w-max bg-white dark:bg-slate-900 rounded-lg shadow-xl border border-slate-200 dark:border-white/10 py-2 z-50">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code as any);
                        setShowLanguageMenu(false);
                      }}
                      className={`w-full px-4 py-2 text-left text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
                        language === lang.code
                          ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                          : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {lang.code.toUpperCase()}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <ThemeToggle />
            <a href="/register" className="px-6 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-sm font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all">{t('public.startFree')}</a>
          </div>
          <div className="lg:hidden flex items-center gap-1 sm:gap-2">
            <a href="#features" className="hidden sm:inline-block px-3 py-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-800/50 text-xs sm:text-sm font-semibold transition-colors">{t('public.features')}</a>
            
            {/* Mobile Language Selector */}
            <div className="relative">
              <button
                onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                className="px-2.5 sm:px-3 py-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-800/50 text-xs sm:text-sm font-semibold transition-colors"
                title="Change language"
              >
                {languages.find(l => l.code === language)?.code.toUpperCase()}
              </button>
              
              {showLanguageMenu && (
                <div className="absolute right-0 mt-2 w-max bg-white dark:bg-slate-900 rounded-lg shadow-xl border border-slate-200 dark:border-white/10 py-2 z-50">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code as any);
                        setShowLanguageMenu(false);
                      }}
                      className={`px-3 py-2 text-xs sm:text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors whitespace-nowrap ${
                        language === lang.code
                          ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                          : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {lang.code.toUpperCase()}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <a href="/login" className="px-2.5 sm:px-3 py-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-800/50 text-xs sm:text-sm font-semibold transition-colors">{t('common.signIn')}</a>
            <ThemeToggle />
            <a href="/register" className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-xs sm:text-sm font-semibold hover:shadow-lg transition-all">{t('public.start')}</a>
          </div>
        </div>
      </nav>

      <main className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <section className="py-12 sm:py-16 md:py-32">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 md:gap-16 items-center">
            {/* Left: Hero Content */}
            <div>
              <div className="inline-block mb-4 px-3 sm:px-4 py-2 rounded-full bg-blue-100/50 dark:bg-blue-900/30 border border-blue-200/60 dark:border-blue-800/40 flex items-center gap-2">
                <SparkIcon className="h-4 w-4 text-blue-700 dark:text-blue-200" />
                <span className="text-xs font-semibold text-blue-700 dark:text-blue-200">{t('public.saasForLocalServices')}</span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-slate-50 leading-tight mb-4 sm:mb-6">
                {t('public.turnFirstTimeClients')} <span className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">{t('public.loyalRegulars')}</span>.
              </h1>

              <p className="text-base sm:text-lg text-slate-700 dark:text-slate-300 leading-relaxed mb-6 sm:mb-8 max-w-lg">
                {t('public.manageBookingsCalendarReviewsLoyalty')}
              </p>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8 sm:mb-12">
                <a href="/register" className="px-6 sm:px-8 py-3 sm:py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold text-sm sm:text-base text-center hover:shadow-2xl hover:-translate-y-1 transition-all active:scale-95">
                  {t('public.start14DayFreeTrial')}
                </a>
                <a href="/b/demo" className="px-6 sm:px-8 py-3 sm:py-4 rounded-xl border-2 border-indigo-200 dark:border-indigo-800 bg-white/40 dark:bg-slate-900/40 backdrop-blur text-indigo-600 dark:text-indigo-300 font-semibold text-sm sm:text-base text-center hover:bg-white/60 dark:hover:bg-slate-900/60 transition-all">
                  {t('public.viewDemo')}
                </a>
              </div>

              <div className="flex flex-col gap-2 sm:gap-3">
                <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-700">
                  <span className="text-green-600 flex-shrink-0">✓</span> <span>{t('public.fourteenDaysFreeNoCard')}</span>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-700">
                  <span className="text-green-600 flex-shrink-0">✓</span> <span>{t('public.setupInFiveMinutes')}</span>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-700">
                  <span className="text-green-600 flex-shrink-0">✓</span> <span>{t('public.trustedByFiveHundredBusinesses')}</span>
                </div>
              </div>
            </div>

            {/* Right: Hero Visual Mockup */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-200 to-blue-200 rounded-3xl blur-3xl opacity-30"></div>
              <div className="relative bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl border border-white/60 overflow-hidden">
                {/* Mockup Header */}
                <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl p-4 mb-4 border border-indigo-100">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-blue-600"></div>
                      <span className="font-semibold text-sm text-slate-900">{t('public.mockupClinicName')}</span>
                    </div>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold">{t('public.statusLive')}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white rounded-lg p-2">
                      <div className="text-xs text-slate-600">{t('public.mockupPatientsLabel')}</div>
                      <div className="text-lg font-bold text-slate-900">652</div>
                    </div>
                    <div className="bg-white rounded-lg p-2">
                      <div className="text-xs text-slate-600">{t('public.mockupAppointmentsLabel')}</div>
                      <div className="text-lg font-bold text-slate-900">89</div>
                    </div>
                    <div className="bg-white rounded-lg p-2">
                      <div className="text-xs text-slate-600">{t('public.mockupRatingLabel')}</div>
                      <div className="text-lg font-bold text-slate-900">4.9 <StarIcon className="h-5 w-5 inline" /></div>
                    </div>
                  </div>
                </div>

                {/* Mockup Content */}
                <div className="space-y-3">
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-3 border border-amber-100">
                    <div className="text-xs font-semibold text-amber-900 mb-1 flex items-center gap-1"><CalendarIcon className="h-4 w-4" /> {t('public.mockupBookingRequest')}</div>
                    <div className="text-sm text-slate-700">{t('public.mockupClientConsultation')}</div>
                  </div>

                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-3 border border-blue-100">
                    <div className="text-xs font-semibold text-blue-900 mb-1 flex items-center gap-1"><StarIcon className="h-4 w-4" /> {t('public.mockupNewReview')}</div>
                    <div className="text-sm text-slate-700">{t('public.mockupReviewExample')}</div>
                  </div>

                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-3 border border-purple-100">
                    <div className="text-xs font-semibold text-purple-900 mb-1 flex items-center gap-1"><GiftIcon className="h-4 w-4" /> {t('public.mockupCarePlanProgress')}</div>
                    <div className="w-full bg-slate-200 rounded-full h-1.5 mb-1">
                      <div className="bg-gradient-to-r from-purple-600 to-pink-600 h-1.5 rounded-full" style={{width: '75%'}}></div>
                    </div>
                    <div className="text-xs text-slate-600">{t('public.mockupFollowUpsStatus')}</div>
                  </div>

                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-3 border border-green-100">
                    <div className="text-xs font-semibold text-green-900 mb-1 flex items-center gap-1"><MessageIcon className="h-4 w-4" /> {t('public.mockupHealthReminder')}</div>
                    <div className="text-sm text-slate-700">{t('public.mockupReminderStatus')}</div>
                  </div>

                  <div className="bg-indigo-900 text-white rounded-xl p-3 text-center">
                    <div className="text-xs font-semibold mb-1 flex items-center justify-center gap-1"><QRIcon className="h-4 w-4" /> {t('public.mockupCheckInsLabel')}</div>
                    <div className="text-2xl font-bold">+47%</div>
                    <div className="text-xs">{t('public.mockupCheckInsDesc')}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Problem Section */}
        <section className="py-16 sm:py-20 md:py-32">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-3 sm:mb-4">
              {t('public.mostBusinessesLoseClients')}
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto px-2">{t('public.lackToolsStayConnected')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12">
            {/* Card 1: Missed Repeat Bookings */}
            <div className="bg-white/50 dark:bg-slate-900/70 backdrop-blur rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-white/60 dark:border-white/10 hover:border-amber-200 dark:hover:border-amber-500/30 hover:shadow-lg dark:hover:shadow-black/20 transition-all hover:-translate-y-1">
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl p-4 sm:p-6 mb-6 border border-amber-100 dark:border-amber-800/30">
                <div className="text-xs sm:text-sm font-bold text-amber-900 dark:text-amber-200 mb-3 flex items-center gap-2"><CalendarIcon className="h-5 w-5" /> {t('public.problemMissedBookingsLabel')}</div>
                <div className="space-y-2 text-xs sm:text-sm">
                  <div className="flex justify-between items-center bg-white/70 dark:bg-white/5 px-3 py-2 rounded-lg dark:text-slate-300">
                    <span>{t('public.problemMockupMondayTime')}</span>
                    <span className="text-amber-700 dark:text-amber-400">✓ {t('public.mockupStatusDone')}</span>
                  </div>
                  <div className="flex justify-between items-center bg-white/70 dark:bg-white/5 px-3 py-2 rounded-lg dark:text-slate-300">
                    <span>{t('public.problemFollowUpNeeded')}</span>
                    <span className="text-red-600 dark:text-red-400 font-bold">✗ {t('public.mockupStatusMissed')}</span>
                  </div>
                </div>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-2">{t('public.problemForgottenFollowUpsDesc')}</h3>
              <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed mb-4">{t('public.problemMissedBookingsExplain')}</p>
              <div className="inline-block bg-red-100 dark:bg-red-500/15 text-red-700 dark:text-red-200 text-xs sm:text-sm px-3 py-1 rounded-full font-semibold dark:border dark:border-red-400/20">{t('public.problemMissedBookingsExplain')}</div>
            </div>

            {/* Card 2: Forgotten Follow-ups */}
            <div className="bg-white/50 dark:bg-slate-900/70 backdrop-blur rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-white/60 dark:border-white/10 hover:border-green-200 dark:hover:border-green-500/30 hover:shadow-lg dark:hover:shadow-black/20 transition-all hover:-translate-y-1">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-4 sm:p-6 mb-6 border border-green-100 dark:border-green-800/30">
                <div className="text-xs sm:text-sm font-bold text-green-900 dark:text-green-200 mb-3 flex items-center gap-2"><MessageIcon className="h-5 w-5" /> {t('public.problemWhatsappLabel')}</div>
                <div className="space-y-2 text-xs sm:text-sm">
                  <div className="bg-white/70 dark:bg-white/5 px-3 py-2 rounded-lg text-slate-700 dark:text-slate-300">
                    <span className="font-semibold">{t('public.problemLastVisit')}:</span> 28 {t('public.problemDaysAgo')}
                  </div>
                  <div className="bg-white/70 dark:bg-white/5 px-3 py-2 rounded-lg">
                    <span className="text-red-600 dark:text-red-400 font-bold">⚠ {t('public.problemFollowUpOverdue')}</span>
                  </div>
                </div>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-2">{t('public.problemForgottenFollowUpsDesc')}</h3>
              <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed mb-4">{t('public.problemForgottenFollowUpsExplain')}</p>
              <div className="inline-block bg-yellow-100 dark:bg-yellow-500/15 text-yellow-700 dark:text-yellow-200 text-xs sm:text-sm px-3 py-1 rounded-full font-semibold dark:border dark:border-yellow-400/20">{t('public.problemForgottenFollowUpsTag')}</div>
            </div>

            {/* Card 3: No Review System */}
            <div className="bg-white/50 dark:bg-slate-900/70 backdrop-blur rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-white/60 dark:border-white/10 hover:border-blue-200 dark:hover:border-blue-500/30 hover:shadow-lg dark:hover:shadow-black/20 transition-all hover:-translate-y-1">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-4 sm:p-6 mb-6 border border-blue-100 dark:border-blue-800/30">
                <div className="text-xs sm:text-sm font-bold text-blue-900 dark:text-blue-200 mb-3 flex items-center gap-2"><StarIcon className="h-5 w-5" /> {t('public.problemReviewsLabel')}</div>
                <div className="space-y-2 text-xs sm:text-sm">
                  <div className="flex items-center gap-2 bg-white/70 dark:bg-white/5 px-3 py-2 rounded-lg dark:text-slate-300">
                    <span>{t('public.mockupHappyClientsLabel')}:</span>
                    <span className="font-bold text-blue-700 dark:text-blue-400">5/5 <StarIcon className="h-4 w-4 inline" /></span>
                  </div>
                  <div className="bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg text-red-700 dark:text-red-300 text-xs font-semibold">
                    ✗ {t('public.problemNoGoogleReviews')}
                  </div>
                </div>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-2">{t('public.problemNoReviewSystemDesc')}</h3>
              <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed mb-4">{t('public.problemNoReviewSystemExplain')}</p>
              <div className="inline-block bg-orange-100 dark:bg-orange-500/15 text-orange-700 dark:text-orange-200 text-xs sm:text-sm px-3 py-1 rounded-full font-semibold dark:border dark:border-orange-400/20">{t('public.problemNoReviewSystemTag')}</div>
            </div>

            {/* Card 4: Messy Booking Flow */}
            <div className="bg-white/50 dark:bg-slate-900/70 backdrop-blur rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-white/60 dark:border-white/10 hover:border-purple-200 dark:hover:border-purple-500/30 hover:shadow-lg dark:hover:shadow-black/20 transition-all hover:-translate-y-1">
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-4 sm:p-6 mb-6 border border-purple-100 dark:border-purple-800/30">
                <div className="text-xs sm:text-sm font-bold text-purple-900 dark:text-purple-200 mb-3 flex items-center gap-1"><PhoneIcon className="h-5 w-5" /> {t('public.problemBookingSourcesTitle')}</div>
                <div className="flex flex-wrap gap-2 text-xs sm:text-sm">
                  <span className="bg-white/70 dark:bg-white/5 px-2 py-1 rounded-lg dark:text-slate-300 flex items-center gap-1"><PhoneIcon className="h-4 w-4" /> {t('public.bookingSourceCall')}</span>
                  <span className="bg-white/70 dark:bg-white/5 px-2 py-1 rounded-lg dark:text-slate-300 flex items-center gap-1"><MessageIcon className="h-4 w-4" /> {t('public.bookingSourceWhatsapp')}</span>
                  <span className="bg-white/70 dark:bg-white/5 px-2 py-1 rounded-lg dark:text-slate-300 flex items-center gap-1"><InstagramIcon className="h-4 w-4" /> {t('public.bookingSourceInstagram')}</span>
                  <span className="bg-white/70 dark:bg-white/5 px-2 py-1 rounded-lg text-red-600 dark:text-red-400 font-bold flex items-center gap-1"><AlertIcon className="h-4 w-4" /> {t('public.mockupDoubleBooking')}</span>
                </div>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-2">{t('public.problemMessyBookingDesc')}</h3>
              <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed mb-4">{t('public.problemMessyBookingExplain')}</p>
              <div className="inline-block bg-red-100 dark:bg-red-500/15 text-red-700 dark:text-red-200 text-xs sm:text-sm px-3 py-1 rounded-full font-semibold dark:border dark:border-red-400/20">{t('public.problemMessyBookingTag')}</div>
            </div>

            {/* Card 5: No Loyalty Tracking */}
            <div className="bg-white/50 dark:bg-slate-900/70 backdrop-blur rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-white/60 dark:border-white/10 hover:border-pink-200 dark:hover:border-pink-500/30 hover:shadow-lg dark:hover:shadow-black/20 transition-all hover:-translate-y-1">
              <div className="bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 rounded-2xl p-4 sm:p-6 mb-6 border border-pink-100 dark:border-pink-800/30">
                <div className="text-xs sm:text-sm font-bold text-pink-900 dark:text-pink-200 mb-3 flex items-center gap-2"><GiftIcon className="h-5 w-5" /> {t('public.problemLoyaltyTitle')}</div>
                <div className="space-y-2 text-xs sm:text-sm">
                  <div className="bg-white/70 dark:bg-white/5 px-3 py-2 rounded-lg flex justify-between dark:text-slate-300">
                    <span>{t('public.mockupVisitsLabel')}:</span>
                    <span>3/5 ✓✓✓</span>
                  </div>
                  <div className="bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg text-red-700 dark:text-red-300 font-semibold">
                    {t('public.problemRewardNotTracked')}
                  </div>
                </div>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-2">{t('public.problemNoLoyaltyDesc')}</h3>
              <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed mb-4">{t('public.problemNoLoyaltyExplain')}</p>
              <div className="inline-block bg-pink-100 dark:bg-pink-500/15 text-pink-700 dark:text-pink-200 text-xs sm:text-sm px-3 py-1 rounded-full font-semibold dark:border dark:border-pink-400/20">{t('public.problemNoLoyaltyTag')}</div>
            </div>

            {/* Card 6: No Customer History */}
            <div className="bg-white/50 dark:bg-slate-900/70 backdrop-blur rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-white/60 dark:border-white/10 hover:border-indigo-200 dark:hover:border-indigo-500/30 hover:shadow-lg dark:hover:shadow-black/20 transition-all hover:-translate-y-1">
              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-2xl p-4 sm:p-6 mb-6 border border-indigo-100 dark:border-indigo-800/30">
                <div className="text-xs sm:text-sm font-bold text-indigo-900 dark:text-indigo-200 mb-3 flex items-center gap-2"><UserIcon className="h-5 w-5" /> {t('public.problemClientProfileTitle')}</div>
                <div className="space-y-2 text-xs sm:text-sm">
                  <div className="bg-white/70 dark:bg-white/5 px-3 py-2 rounded-lg dark:text-slate-300">
                    <span className="font-semibold">{t('public.mockupLastServiceLabel')}:</span> 21 {t('public.problemDaysAgo')}

                  </div>
                  <div className="bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg text-red-700 dark:text-red-300 font-semibold">
                    ✗ {t('public.mockupNotesHistoryMissing')}
                  </div>
                </div>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-2">{t('public.problemNoHistoryDesc')}</h3>
              <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed mb-4">{t('public.problemNoHistoryExplain')}</p>
              <div className="inline-block bg-indigo-100 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-200 text-xs sm:text-sm px-3 py-1 rounded-full font-semibold dark:border dark:border-indigo-400/20">{t('public.problemNoHistoryTag')}</div>
            </div>
          </div>

          {/* Before/After Comparison */}
          <div className="bg-gradient-to-r from-slate-50 to-slate-100/50 dark:from-slate-900/30 dark:to-slate-950/30 rounded-2xl sm:rounded-3xl p-8 sm:p-12 border border-slate-200 dark:border-white/10">
            <div className="grid md:grid-cols-2 gap-8 sm:gap-12">
              <div>
                <h4 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <span className="text-red-500">✗</span> {t('public.comparisonBefore')}
                </h4>
                <ul className="space-y-3 text-sm sm:text-base text-slate-700 dark:text-slate-300">
                  <li className="flex items-start gap-3">
                    <span className="text-red-500 font-bold mt-0.5">•</span>
                    <span>{t('public.comparisonBeforeItem1')}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-500 font-bold mt-0.5">•</span>
                    <span>{t('public.comparisonBeforeItem2')}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-500 font-bold mt-0.5">•</span>
                    <span>{t('public.comparisonBeforeItem3')}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-500 font-bold mt-0.5">•</span>
                    <span>{t('public.comparisonBeforeItem4')}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-500 font-bold mt-0.5">•</span>
                    <span>{t('public.comparisonBeforeItem5')}</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <span className="text-green-600">✓</span> {t('public.comparisonAfter')}
                </h4>
                <ul className="space-y-3 text-sm sm:text-base text-slate-700 dark:text-slate-300">
                  <li className="flex items-start gap-3">
                    <span className="text-green-600 font-bold mt-0.5">•</span>
                    <span>{t('public.comparisonAfterItem1')}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-600 font-bold mt-0.5">•</span>
                    <span>{t('public.comparisonAfterItem2')}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-600 font-bold mt-0.5">•</span>
                    <span>{t('public.comparisonAfterItem3')}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-600 font-bold mt-0.5">•</span>
                    <span>{t('public.comparisonAfterItem4')}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-600 font-bold mt-0.5">•</span>
                    <span>{t('public.comparisonAfterItem5')}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16 sm:py-20 md:py-32">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-3 sm:mb-4">{t('public.featuresHeading')}</h2>
            <p className="text-sm sm:text-base md:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto px-2">{t('public.featuresSubheading')}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {[
              {
                Icon: CalendarIcon,
                title: t('public.featureSmartBookingTitle'),
                desc: t('public.featureSmartBookingDesc'),
                visual: t('public.featureSmartBookingVisual')
              },
              {
                Icon: ClientsIcon,
              title: t('public.featureClientDatabaseTitle'),
              desc: t('public.featureClientDatabaseDesc'),
                visual: t('public.featureClientDatabaseVisual')
              },
              {
                Icon: ReviewsIcon,
              title: t('public.featureReviewBoosterTitle'),
              desc: t('public.featureReviewBoosterDesc'),
                visual: t('public.featureReviewBoosterVisual')
              },
              {
                Icon: FollowUpsIcon,
              title: t('public.featureWhatsappFollowupsTitle'),
              desc: t('public.featureWhatsappFollowupsDesc'),
                visual: t('public.featureWhatsappFollowupsVisual')
              },
              {
                Icon: LoyaltyIcon,
              title: t('public.featureLoyaltyCardsTitle'),
              desc: t('public.featureLoyaltyCardsDesc'),
                visual: t('public.featureLoyaltyCardsVisual')
              },
              {
                Icon: QRIcon,
              title: t('public.featureQRPageTitle'),
              desc: t('public.featureQRPageDesc'),
                visual: t('public.featureQRPageVisual')
              },
            ].map((feature, i) => {
              const { Icon, title, desc, visual } = feature;
              return (
              <div key={i} className="bg-white/50 dark:bg-slate-900/70 backdrop-blur rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-white/60 dark:border-white/10 hover:border-indigo-300 dark:hover:border-indigo-500/30 hover:shadow-xl dark:hover:shadow-black/20 transition-all hover:-translate-y-2">
                <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-4">
                  <Icon className="h-12 w-12 flex-shrink-0 text-indigo-600 dark:text-indigo-400" />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2">{title}</h3>
                    <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 mb-4 leading-relaxed">{desc}</p>
                    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-xl p-3 sm:p-4 border border-indigo-100 dark:border-indigo-800/30 text-xs sm:text-sm font-mono text-slate-700 dark:text-slate-300 whitespace-pre-wrap break-words overflow-hidden">
                      {visual}
                    </div>
                  </div>
                </div>
              </div>
            );
            })}
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 sm:py-20 md:py-32">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">{t('public.howItWorksHeading')}</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6 md:gap-4">
            {[
              { num: '1', title: t('public.stepCreateAccount'), desc: t('public.stepCreateAccountDesc') },
              { num: '2', title: t('public.stepAddServices'), desc: t('public.stepAddServicesDesc') },
              { num: '3', title: t('public.stepSetHours'), desc: t('public.stepSetHoursDesc') },
              { num: '4', title: t('public.stepShareQR'), desc: t('public.stepShareQRDesc') },
              { num: '5', title: t('public.stepGetBookings'), desc: t('public.stepGetBookingsDesc') },
            ].map((step, i) => (
              <div key={i} className="text-center">
                <div className="bg-gradient-to-br from-indigo-600 to-blue-600 text-white w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-xl sm:text-2xl font-bold mx-auto mb-3 sm:mb-4">{step.num}</div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-1 text-sm sm:text-base">{step.title}</h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-16 sm:py-20 md:py-32">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-3 sm:mb-4">{t('public.pricingHeading')}</h2>
            <p className="text-sm sm:text-base md:text-lg text-slate-600 dark:text-slate-300">{t('public.pricingSubheading')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 auto-rows-max">
            {[
              {
                name: t('public.planStarter'),
                price: '19€',
                period: t('public.pricingPeriod'),
                desc: t('public.planStarterDesc'),
                features: [t('public.featureBookingCalendar'), t('public.featureBookingsLimit'), t('public.featureClientDatabase'), t('public.featureEmailSupport')],
                button: t('public.pricingCTA'),
              },
              {
                name: t('public.planPro'),
                price: '39€',
                period: t('public.pricingPeriod'),
                desc: t('public.planProDesc'),
                features: [t('public.featureEverythingInStarter'), t('public.featureUnlimitedBookings'), t('public.featureReviewsRatings'), t('public.featureWhatsappFollowups'), t('public.featureLoyaltyCards'), t('public.featureQRPage'), t('public.featurePrioritySupport')],
                button: t('public.pricingCTA'),
                popular: true,
              },
              {
                name: t('public.planBusiness'),
                price: '79€',
                period: t('public.pricingPeriod'),
                desc: t('public.planBusinessDesc'),
                features: [t('public.featureEverythingInPro'), t('public.featureAdvancedAnalytics'), t('public.featureMultiUserAccess'), t('public.featureCustomBranding'), t('public.featureAPIAccess'), t('public.featureDedicatedSupport')],
                button: t('public.pricingCTA'),
              },
            ].map((plan, i) => (
              <div key={i} className={`rounded-2xl sm:rounded-3xl p-6 sm:p-8 transition-all flex flex-col ${plan.popular ? 'md:scale-105 md:shadow-2xl bg-gradient-to-br from-indigo-600 to-blue-600 text-white border-2 border-indigo-600' : 'bg-white/50 dark:bg-slate-900/70 border border-white/60 dark:border-white/10 hover:border-indigo-200 dark:hover:border-indigo-500/30 hover:shadow-lg dark:hover:shadow-black/20'}`}>
                <div className="mb-4 sm:mb-6">
                  <h3 className={`text-2xl sm:text-3xl font-bold mb-2 ${plan.popular ? '' : 'text-slate-900 dark:text-white'}`}>{plan.name}</h3>
                  {plan.popular && <div className="inline-block bg-indigo-700 text-xs px-3 py-1 rounded-full font-semibold mb-4">{t('public.planPopularBadge')}</div>}
                </div>
                <div className="mb-6 sm:mb-8">
                  <div className={`text-4xl sm:text-5xl font-bold ${plan.popular ? '' : 'text-slate-900 dark:text-white'}`}>{plan.price}</div>
                  <div className={`text-sm ${plan.popular ? 'text-indigo-200' : 'text-slate-600 dark:text-slate-400'}`}>{plan.period}</div>
                  <p className={`text-sm sm:text-base mt-2 leading-relaxed ${plan.popular ? 'text-indigo-100' : 'text-slate-700 dark:text-slate-300'}`}>{plan.desc}</p>
                </div>
                <ul className={`space-y-2 sm:space-y-3 mb-8 sm:mb-8 flex-grow ${plan.popular ? '' : 'text-slate-700 dark:text-slate-300'}`}>
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-start gap-2 text-xs sm:text-sm leading-relaxed">
                      <span className="flex-shrink-0 mt-0.5">✓</span> <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <a href="/register" className={`block text-center py-3 sm:py-4 rounded-lg font-semibold transition-all text-sm sm:text-base ${plan.popular ? 'bg-white text-indigo-600 hover:shadow-lg' : 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white hover:shadow-lg'}`}>
                  {plan.button}
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-16 sm:py-20 md:py-32 text-center">
          <div className="max-w-3xl mx-auto px-2">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white mb-4 sm:mb-6">{t('public.finalCTAHeading')}</h2>
            <p className="text-base sm:text-lg md:text-xl text-slate-700 dark:text-slate-300 mb-6 sm:mb-8 leading-relaxed">{t('public.finalCTASubheading')}</p>
            <a href="/register" className="inline-block px-6 sm:px-8 py-3 sm:py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold text-sm sm:text-lg hover:shadow-2xl hover:-translate-y-1 transition-all active:scale-95">
              {t('public.finalCTAButton')}
            </a>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/40 dark:border-white/10 backdrop-blur-xl bg-white/30 dark:bg-slate-950/40 mt-16 sm:mt-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center text-white font-bold">B</div>
                <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">Bookorvia</span>
              </div>
              <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 max-w-xs leading-relaxed">{t('public.footerAbout')}</p>
            </div>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-white mb-4 text-sm sm:text-base">{t('public.footerProductHeading')}</h4>
                <ul className="space-y-2 text-xs sm:text-sm">
                  <li><a href="/#features" className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">{t('public.features')}</a></li>
                  <li><a href="/#pricing" className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">{t('public.pricing')}</a></li>
                  <li><a href="/b/demo" className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">{t('public.demo')}</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-white mb-4 text-sm sm:text-base">{t('public.footerLegalHeading')}</h4>
                <ul className="space-y-2 text-xs sm:text-sm">
                  <li><a href="/terms" className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">{t('public.terms')}</a></li>
                  <li><a href="/privacy" className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">{t('public.privacy')}</a></li>
                  <li><a href="/cookies" className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">{t('public.cookies')}</a></li>
                  <li><a href="/refund-policy" className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">{t('public.refunds')}</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="border-t border-white/40 dark:border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm">
            <div className="text-slate-600 dark:text-slate-400 text-center sm:text-left">© {new Date().getFullYear()} Bookorvia — {t('public.footerTagline')}</div>
            <div className="flex items-center gap-4 flex-wrap justify-center">
              <a href="/contact" className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">{t('public.contact')}</a>
              <a href="/help" className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">{t('public.help')}</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
