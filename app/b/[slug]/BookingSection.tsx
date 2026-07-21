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
  const activeServices = services?.length || 0;

  return (
    <div className="grid gap-6 lg:grid-cols-[0.78fr_1.22fr]">
      <div className={`rounded-3xl border p-5 sm:p-6 ${themeStyles.innerCard}`}>
        <div className="mb-4">
          <p className={`text-xs font-bold uppercase tracking-[0.18em] ${themeStyles.mutedText}`}>Booking Flow</p>
          <h3 className={`mt-2 text-2xl font-bold ${themeStyles.label}`}>{t('booking.requestBooking')}</h3>
          <p className={`mt-2 text-sm ${themeStyles.mutedText}`}>{t('booking.selectServiceTime')}</p>
        </div>

        <div className="space-y-3">
          <div className={`rounded-2xl border p-4 ${themeStyles.innerCard}`}>
            <div className={`text-xs uppercase tracking-wide ${themeStyles.mutedText}`}>Step 1</div>
            <div className={`mt-1 font-semibold ${themeStyles.label}`}>Choose from {activeServices} available service{activeServices === 1 ? '' : 's'}</div>
          </div>
          <div className={`rounded-2xl border p-4 ${themeStyles.innerCard}`}>
            <div className={`text-xs uppercase tracking-wide ${themeStyles.mutedText}`}>Step 2</div>
            <div className={`mt-1 font-semibold ${themeStyles.label}`}>Pick date and live available time slots</div>
          </div>
          <div className={`rounded-2xl border p-4 ${themeStyles.innerCard}`}>
            <div className={`text-xs uppercase tracking-wide ${themeStyles.mutedText}`}>Step 3</div>
            <div className={`mt-1 font-semibold ${themeStyles.label}`}>Receive instant booking confirmation</div>
          </div>
        </div>
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
    </div>
  );
}
