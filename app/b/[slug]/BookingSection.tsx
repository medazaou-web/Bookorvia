"use client";
import BookingForm from "./BookingForm";
import { useTranslations } from "@/lib/i18n";

type ThemeStyles = {
  sectionCard: string;
  innerCard: string;
  input: string;
  label: string;
  mutedText: string;
  buttonPrimary: string;
  buttonSecondary: string;
  timeSlot: string;
  timeSlotSelected: string;
  emptyState: string;
  success: string;
  error: string;
  progressBar: string;
};

export default function BookingSection({ 
  businessId, 
  services, 
  businessSlug, 
  themeStyles,
  language = 'en'
}: { 
  businessId: string;
  services: any[];
  businessSlug: string;
  themeStyles: ThemeStyles;
  language?: string;
}) {
  const t = useTranslations(language as any);

  return (
    <section id="book" className="mb-8 sm:mb-12 scroll-mt-24">
      <div className="mb-6 sm:mb-8">
        <h2 className="text-3xl sm:text-4xl font-bold">{t('booking.requestBooking')}</h2>
        <p className="opacity-70 mt-2">{t('booking.selectServiceTime')}</p>
      </div>
      <div className={`rounded-3xl ${themeStyles.sectionCard} backdrop-blur border shadow-lg p-6 sm:p-8`}>
        <BookingForm 
          businessId={businessId} 
          services={services} 
          businessSlug={businessSlug} 
          themeStyles={themeStyles}
          language={language}
        />
      </div>
    </section>
  );
}
