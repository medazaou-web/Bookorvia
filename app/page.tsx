'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Space_Grotesk, JetBrains_Mono } from 'next/font/google';
import { ThemeToggle } from './components/ThemeToggle';
import { useLanguage } from '@/lib/context/LanguageContext';
import { useTranslations } from '@/lib/i18n';
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
  AlertIcon,
  PhoneIcon,
  InstagramIcon,
  UserIcon,
} from '@/components/icons';

const headingFont = Space_Grotesk({ subsets: ['latin'], weight: ['500', '600', '700'] });
const monoFont = JetBrains_Mono({ subsets: ['latin'], weight: ['500', '700'] });

export default function Home() {
  const { language, setLanguage } = useLanguage();
  const t = useTranslations(language);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);

  const languages = [{ code: 'en' }, { code: 'es' }, { code: 'fr' }];

  const featureCards = [
    {
      Icon: CalendarIcon,
      title: t('public.featureSmartBookingTitle'),
      desc: t('public.featureSmartBookingDesc'),
      visual: t('public.featureSmartBookingVisual'),
      tone: 'from-cyan-500/15 to-sky-500/10 border-cyan-400/30 dark:border-cyan-400/20',
      colSpan: 'lg:col-span-2',
    },
    {
      Icon: ClientsIcon,
      title: t('public.featureClientDatabaseTitle'),
      desc: t('public.featureClientDatabaseDesc'),
      visual: t('public.featureClientDatabaseVisual'),
      tone: 'from-emerald-500/15 to-teal-500/10 border-emerald-400/30 dark:border-emerald-400/20',
      colSpan: '',
    },
    {
      Icon: ReviewsIcon,
      title: t('public.featureReviewBoosterTitle'),
      desc: t('public.featureReviewBoosterDesc'),
      visual: t('public.featureReviewBoosterVisual'),
      tone: 'from-amber-500/15 to-orange-500/10 border-amber-400/30 dark:border-amber-400/20',
      colSpan: '',
    },
    {
      Icon: FollowUpsIcon,
      title: t('public.featureWhatsappFollowupsTitle'),
      desc: t('public.featureWhatsappFollowupsDesc'),
      visual: t('public.featureWhatsappFollowupsVisual'),
      tone: 'from-pink-500/15 to-rose-500/10 border-pink-400/30 dark:border-pink-400/20',
      colSpan: '',
    },
    {
      Icon: LoyaltyIcon,
      title: t('public.featureLoyaltyCardsTitle'),
      desc: t('public.featureLoyaltyCardsDesc'),
      visual: t('public.featureLoyaltyCardsVisual'),
      tone: 'from-indigo-500/15 to-blue-500/10 border-indigo-400/30 dark:border-indigo-400/20',
      colSpan: '',
    },
    {
      Icon: QRIcon,
      title: t('public.featureQRPageTitle'),
      desc: t('public.featureQRPageDesc'),
      visual: t('public.featureQRPageVisual'),
      tone: 'from-violet-500/15 to-fuchsia-500/10 border-violet-400/30 dark:border-violet-400/20',
      colSpan: 'lg:col-span-2',
    },
  ];

  const beforeItems = [
    t('public.comparisonBeforeItem1'),
    t('public.comparisonBeforeItem2'),
    t('public.comparisonBeforeItem3'),
    t('public.comparisonBeforeItem4'),
    t('public.comparisonBeforeItem5'),
  ];

  const afterItems = [
    t('public.comparisonAfterItem1'),
    t('public.comparisonAfterItem2'),
    t('public.comparisonAfterItem3'),
    t('public.comparisonAfterItem4'),
    t('public.comparisonAfterItem5'),
  ];

  const timeline = [
    { icon: CalendarIcon, label: t('public.problemMissedBookingsLabel'), tone: 'bg-amber-500', stat: '-22%' },
    { icon: MessageIcon, label: t('public.problemWhatsappLabel'), tone: 'bg-cyan-500', stat: '+31%' },
    { icon: GiftIcon, label: t('public.problemLoyaltyTitle'), tone: 'bg-emerald-500', stat: '+48%' },
    { icon: StarIcon, label: t('public.problemReviewsLabel'), tone: 'bg-pink-500', stat: '+64%' },
  ];

  return (
    <div className={`relative min-h-screen overflow-x-clip bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100 ${headingFont.className}`}>
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-cyan-400/25 blur-3xl dark:bg-cyan-500/20" />
        <div className="absolute right-0 top-40 h-[26rem] w-[26rem] rounded-full bg-emerald-300/25 blur-3xl dark:bg-emerald-500/20" />
        <div className="absolute left-1/3 top-[38rem] h-[24rem] w-[24rem] rounded-full bg-amber-300/25 blur-3xl dark:bg-amber-500/15" />
        <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(to_right,rgba(100,116,139,0.15)_1px,transparent_1px),linear-gradient(to_bottom,rgba(100,116,139,0.15)_1px,transparent_1px)] [background-size:42px_42px] dark:[background-image:linear-gradient(to_right,rgba(51,65,85,0.28)_1px,transparent_1px),linear-gradient(to_bottom,rgba(51,65,85,0.28)_1px,transparent_1px)]" />
      </div>

      <nav className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/70 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Image src="/bookorvia-logo.png" alt="Bookorvia" width={40} height={40} className="h-10 w-10 rounded-xl" />
            <a href="/" className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Bookorvia
            </a>
          </div>

          <div className="hidden items-center gap-8 lg:flex">
            <a href="#features" className="text-sm font-semibold text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white">{t('public.features')}</a>
            <a href="#pricing" className="text-sm font-semibold text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white">{t('public.pricing')}</a>
            <a href="/help" className="text-sm font-semibold text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white">{t('public.help')}</a>
            <a href="/login" className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800/70">{t('common.signIn')}</a>

            <div className="relative">
              <button
                onClick={() => setShowLanguageMenu((v) => !v)}
                className={`rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 ${monoFont.className}`}
                title={t('public.changeLanguageTitle')}
              >
                {languages.find((l) => l.code === language)?.code.toUpperCase()}
              </button>
              {showLanguageMenu && (
                <div className="absolute right-0 mt-2 w-20 rounded-xl border border-slate-200 bg-white p-1 shadow-xl dark:border-slate-700 dark:bg-slate-900">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code as any);
                        setShowLanguageMenu(false);
                      }}
                      className={`w-full rounded-md px-2 py-1.5 text-left text-xs font-semibold transition-colors ${
                        language === lang.code
                          ? 'bg-cyan-50 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-200'
                          : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                      }`}
                    >
                      {lang.code.toUpperCase()}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <ThemeToggle />
            <a href="/register" className="rounded-xl bg-slate-900 px-6 py-2 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-lg dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100">{t('public.startFree')}</a>
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <a href="/login" className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">{t('common.signIn')}</a>
            <a href="/register" className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white dark:bg-white dark:text-slate-900">{t('public.start')}</a>
          </div>
        </div>
      </nav>

      <main className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <section className="py-14 sm:py-18 lg:py-24">
          <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-300/60 bg-cyan-50/70 px-4 py-2 text-xs font-semibold text-cyan-800 dark:border-cyan-500/30 dark:bg-cyan-500/10 dark:text-cyan-200">
                <SparkIcon className="h-4 w-4" /> {t('public.saasForLocalServices')}
              </div>
              <h1 className="text-4xl font-bold leading-[1.05] tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-7xl">
                {t('public.turnFirstTimeClients')} <span className="text-cyan-600 dark:text-cyan-300">{t('public.loyalRegulars')}</span>
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300 sm:text-lg">
                {t('public.manageBookingsCalendarReviewsLoyalty')}
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a href="/register" className="rounded-xl bg-slate-900 px-7 py-4 text-center text-sm font-bold text-white transition-all hover:-translate-y-1 hover:shadow-2xl dark:bg-white dark:text-slate-900">
                  {t('public.start14DayFreeTrial')}
                </a>
                <a href="/b/demo" className="rounded-xl border border-slate-300 bg-white/70 px-7 py-4 text-center text-sm font-bold text-slate-800 backdrop-blur transition-all hover:bg-white dark:border-white/20 dark:bg-slate-900/40 dark:text-slate-100 dark:hover:bg-slate-900/70">
                  {t('public.viewDemo')}
                </a>
              </div>

              <div className="mt-8 grid gap-2 sm:grid-cols-3">
                {[t('public.fourteenDaysFreeNoCard'), t('public.setupInFiveMinutes'), t('public.trustedByFiveHundredBusinesses')].map((point) => (
                  <div key={point} className="rounded-lg border border-slate-200 bg-white/70 px-3 py-2 text-xs font-semibold text-slate-700 dark:border-white/10 dark:bg-slate-900/50 dark:text-slate-200">
                    ✓ {point}
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-6 rounded-[2rem] bg-gradient-to-br from-cyan-400/25 via-transparent to-emerald-400/25 blur-2xl" />
              <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white/85 p-5 shadow-2xl backdrop-blur dark:border-white/10 dark:bg-slate-900/80 sm:p-6">
                <div className="mb-4 flex items-center justify-between border-b border-slate-200/80 pb-4 dark:border-slate-700/70">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900" />
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{t('public.mockupClinicName')}</p>
                      <p className={`text-[11px] text-slate-500 dark:text-slate-400 ${monoFont.className}`}>LIVE SYSTEM</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-bold text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200">{t('public.statusLive')}</span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/70">
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{t('public.mockupPatientsLabel')}</p>
                    <p className="mt-1 text-xl font-bold text-slate-900 dark:text-white">652</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/70">
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{t('public.mockupAppointmentsLabel')}</p>
                    <p className="mt-1 text-xl font-bold text-slate-900 dark:text-white">89</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/70">
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{t('public.mockupRatingLabel')}</p>
                    <p className="mt-1 flex items-center gap-1 text-xl font-bold text-slate-900 dark:text-white">4.9 <StarIcon className="h-4 w-4" /></p>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  <div className="rounded-xl border border-cyan-200 bg-cyan-50 p-3 dark:border-cyan-500/30 dark:bg-cyan-500/10">
                    <p className="mb-1 flex items-center gap-2 text-xs font-bold text-cyan-800 dark:text-cyan-200"><CalendarIcon className="h-4 w-4" /> {t('public.mockupBookingRequest')}</p>
                    <p className="text-xs text-slate-700 dark:text-slate-200">{t('public.mockupClientConsultation')}</p>
                  </div>
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-500/30 dark:bg-emerald-500/10">
                    <p className="mb-1 flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-200"><MessageIcon className="h-4 w-4" /> {t('public.mockupHealthReminder')}</p>
                    <p className="text-xs text-slate-700 dark:text-slate-200">{t('public.mockupReminderStatus')}</p>
                  </div>
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-500/30 dark:bg-amber-500/10">
                    <p className="mb-1 flex items-center gap-2 text-xs font-bold text-amber-800 dark:text-amber-200"><GiftIcon className="h-4 w-4" /> {t('public.mockupCarePlanProgress')}</p>
                    <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-700">
                      <div className="h-1.5 w-3/4 rounded-full bg-gradient-to-r from-amber-500 to-emerald-500" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-14 sm:py-18 lg:py-24">
          <div className="mb-10 text-center sm:mb-14">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl lg:text-5xl">{t('public.mostBusinessesLoseClients')}</h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm text-slate-600 dark:text-slate-300 sm:text-base">{t('public.lackToolsStayConnected')}</p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-red-300/40 bg-white/80 p-6 shadow-lg backdrop-blur dark:border-red-500/20 dark:bg-slate-900/70 sm:p-8">
              <h3 className="mb-5 flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white">
                <AlertIcon className="h-5 w-5 text-red-500" /> {t('public.comparisonBefore')}
              </h3>
              <ul className="space-y-3 text-sm text-slate-700 dark:text-slate-300 sm:text-base">
                {beforeItems.map((item) => (
                  <li key={item} className="rounded-xl border border-red-200/60 bg-red-50/70 px-3 py-2 dark:border-red-500/20 dark:bg-red-500/10">✕ {item}</li>
                ))}
              </ul>
            </div>

            <div className="rounded-3xl border border-emerald-300/40 bg-white/80 p-6 shadow-lg backdrop-blur dark:border-emerald-500/20 dark:bg-slate-900/70 sm:p-8">
              <h3 className="mb-5 flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white">
                <SparkIcon className="h-5 w-5 text-emerald-500" /> {t('public.comparisonAfter')}
              </h3>
              <ul className="space-y-3 text-sm text-slate-700 dark:text-slate-300 sm:text-base">
                {afterItems.map((item) => (
                  <li key={item} className="rounded-xl border border-emerald-200/60 bg-emerald-50/70 px-3 py-2 dark:border-emerald-500/20 dark:bg-emerald-500/10">✓ {item}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-8 rounded-3xl border border-slate-200 bg-white/80 p-6 backdrop-blur dark:border-white/10 dark:bg-slate-900/60 sm:p-8">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {timeline.map((item) => (
                <div key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/60">
                  <div className="mb-3 flex items-center justify-between">
                    <item.icon className="h-5 w-5 text-slate-700 dark:text-slate-100" />
                    <span className={`${item.tone} rounded-full px-2 py-0.5 text-xs font-bold text-white ${monoFont.className}`}>{item.stat}</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="features" className="py-14 sm:py-18 lg:py-24">
          <div className="mb-10 text-center sm:mb-14">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl lg:text-5xl">{t('public.featuresHeading')}</h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm text-slate-600 dark:text-slate-300 sm:text-base">{t('public.featuresSubheading')}</p>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            {featureCards.map((feature, i) => (
              <div
                key={feature.title}
                className={`group rounded-3xl border bg-gradient-to-br p-6 shadow-lg backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl dark:bg-slate-900/65 ${feature.tone} ${feature.colSpan} ${i % 2 === 0 ? 'animate-in' : 'animate-slide-in-left'}`}
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="mb-4 flex items-center gap-3">
                  <div className="rounded-xl border border-slate-300/70 bg-white/80 p-2.5 dark:border-white/15 dark:bg-slate-900/70">
                    <feature.Icon className="h-6 w-6 text-slate-800 dark:text-slate-100" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">{feature.title}</h3>
                </div>
                <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 sm:text-base">{feature.desc}</p>
                <div className={`mt-5 rounded-xl border border-slate-300/70 bg-white/70 p-3 text-xs leading-relaxed text-slate-700 dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-200 ${monoFont.className}`}>
                  {feature.visual}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="py-14 sm:py-18 lg:py-24">
          <div className="mb-10 text-center sm:mb-14">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl lg:text-5xl">{t('public.howItWorksHeading')}</h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {[
              { num: '1', title: t('public.stepCreateAccount'), desc: t('public.stepCreateAccountDesc') },
              { num: '2', title: t('public.stepAddServices'), desc: t('public.stepAddServicesDesc') },
              { num: '3', title: t('public.stepSetHours'), desc: t('public.stepSetHoursDesc') },
              { num: '4', title: t('public.stepShareQR'), desc: t('public.stepShareQRDesc') },
              { num: '5', title: t('public.stepGetBookings'), desc: t('public.stepGetBookingsDesc') },
            ].map((step) => (
              <div key={step.num} className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-900/60">
                <div className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-lg font-bold text-white dark:bg-white dark:text-slate-900 ${monoFont.className}`}>
                  {step.num}
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">{step.title}</h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="pricing" className="py-14 sm:py-18 lg:py-24">
          <div className="mb-10 text-center sm:mb-14">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl lg:text-5xl">{t('public.pricingHeading')}</h2>
            <p className="mt-4 text-sm text-slate-600 dark:text-slate-300 sm:text-base">{t('public.pricingSubheading')}</p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                name: t('public.planStarter'),
                price: '19€',
                period: t('public.pricingPeriod'),
                desc: t('public.planStarterDesc'),
                features: [t('public.featureBookingCalendar'), t('public.featureBookingsLimit'), t('public.featureClientDatabase'), t('public.featureEmailSupport')],
                button: t('public.pricingCTA'),
                style: 'border-slate-300/80 bg-white/85 dark:border-white/10 dark:bg-slate-900/70',
              },
              {
                name: t('public.planPro'),
                price: '39€',
                period: t('public.pricingPeriod'),
                desc: t('public.planProDesc'),
                features: [t('public.featureEverythingInStarter'), t('public.featureUnlimitedBookings'), t('public.featureReviewsRatings'), t('public.featureWhatsappFollowups'), t('public.featureLoyaltyCards'), t('public.featureQRPage'), t('public.featurePrioritySupport')],
                button: t('public.pricingCTA'),
                popular: true,
                style: 'border-cyan-400/40 bg-gradient-to-b from-cyan-50 to-white dark:border-cyan-400/25 dark:from-cyan-500/10 dark:to-slate-900/80',
              },
              {
                name: t('public.planBusiness'),
                price: '79€',
                period: t('public.pricingPeriod'),
                desc: t('public.planBusinessDesc'),
                features: [t('public.featureEverythingInPro'), t('public.featureAdvancedAnalytics'), t('public.featureMultiUserAccess'), t('public.featureCustomBranding'), t('public.featureAPIAccess'), t('public.featureDedicatedSupport')],
                button: t('public.pricingCTA'),
                style: 'border-slate-300/80 bg-white/85 dark:border-white/10 dark:bg-slate-900/70',
              },
            ].map((plan) => (
              <div key={plan.name} className={`rounded-3xl border p-6 shadow-lg backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl sm:p-8 ${plan.style} ${plan.popular ? 'md:scale-[1.02]' : ''}`}>
                <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{plan.name}</h3>
                {plan.popular && <div className="mt-3 inline-block rounded-full bg-slate-900 px-3 py-1 text-xs font-bold text-white dark:bg-white dark:text-slate-900">{t('public.planPopularBadge')}</div>}
                <div className="mt-5">
                  <div className={`text-5xl font-bold text-slate-900 dark:text-white ${monoFont.className}`}>{plan.price}</div>
                  <div className="mt-1 text-sm text-slate-600 dark:text-slate-400">{plan.period}</div>
                  <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">{plan.desc}</p>
                </div>
                <ul className="mt-6 space-y-2 text-sm text-slate-700 dark:text-slate-300">
                  {plan.features.map((feature) => (
                    <li key={feature}>✓ {feature}</li>
                  ))}
                </ul>
                <a href="/register" className="mt-8 block rounded-xl bg-slate-900 px-5 py-3 text-center text-sm font-bold text-white transition-all hover:shadow-lg dark:bg-white dark:text-slate-900">
                  {plan.button}
                </a>
              </div>
            ))}
          </div>
        </section>

        <section className="py-16 sm:py-20 lg:py-28">
          <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-900 p-8 text-center text-white shadow-2xl dark:border-white/10 sm:p-12 lg:p-16">
            <div className="absolute -top-24 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-cyan-400/30 blur-3xl" />
            <div className="absolute bottom-0 left-0 h-44 w-44 rounded-full bg-emerald-400/20 blur-3xl" />
            <div className="absolute right-0 top-1/3 h-52 w-52 rounded-full bg-amber-400/20 blur-3xl" />
            <div className="relative z-10 mx-auto max-w-3xl">
              <h2 className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">{t('public.finalCTAHeading')}</h2>
              <p className="mx-auto mt-5 max-w-2xl text-base text-slate-200 sm:text-lg">{t('public.finalCTASubheading')}</p>
              <a href="/register" className="mt-8 inline-block rounded-xl bg-white px-8 py-4 text-base font-bold text-slate-900 transition-all hover:-translate-y-1 hover:shadow-2xl">
                {t('public.finalCTAButton')}
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white/70 backdrop-blur dark:border-white/10 dark:bg-slate-950/50">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-10 md:grid-cols-2">
            <div>
              <div className="mb-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900" />
                <span className="text-xl font-bold text-slate-900 dark:text-white">Bookorvia</span>
              </div>
              <p className="max-w-sm text-sm leading-relaxed text-slate-700 dark:text-slate-300">{t('public.footerAbout')}</p>
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div>
                <h4 className="mb-4 text-sm font-bold text-slate-900 dark:text-white">{t('public.footerProductHeading')}</h4>
                <ul className="space-y-2 text-sm">
                  <li><a href="/#features" className="text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white">{t('public.features')}</a></li>
                  <li><a href="/#pricing" className="text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white">{t('public.pricing')}</a></li>
                  <li><a href="/b/demo" className="text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white">{t('public.demo')}</a></li>
                </ul>
              </div>
              <div>
                <h4 className="mb-4 text-sm font-bold text-slate-900 dark:text-white">{t('public.footerLegalHeading')}</h4>
                <ul className="space-y-2 text-sm">
                  <li><a href="/terms" className="text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white">{t('public.terms')}</a></li>
                  <li><a href="/privacy" className="text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white">{t('public.privacy')}</a></li>
                  <li><a href="/cookies" className="text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white">{t('public.cookies')}</a></li>
                  <li><a href="/refund-policy" className="text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white">{t('public.refunds')}</a></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-8 text-sm dark:border-white/10 sm:flex-row">
            <div className="text-center text-slate-600 dark:text-slate-400 sm:text-left">© {new Date().getFullYear()} Bookorvia - {t('public.footerTagline')}</div>
            <div className="flex items-center gap-4">
              <a href="/contact" className="text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white">{t('public.contact')}</a>
              <a href="/help" className="text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white">{t('public.help')}</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
