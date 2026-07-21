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
  language = 'en',
  brandColor,
  accentColor
}: { 
  businessId: string;
  services: any[];
  businessSlug: string;
  themeStyles: ThemeStyles;
  language?: string;
  brandColor?: string;
  accentColor?: string;
}) {
  const t = useTranslations(language as any);

  return (
    <div className="rounded-3xl border p-3 sm:p-4 bg-white/10 backdrop-blur-sm">
      <div className={`rounded-3xl ${themeStyles.sectionCard} backdrop-blur border shadow-lg p-6 sm:p-8`}>
        <BookingForm 
          businessId={businessId} 
          services={services} 
          businessSlug={businessSlug} 
          themeStyles={themeStyles}
          language={language}
          brandColor={brandColor}
          accentColor={accentColor}
        />
      </div>
    </div>
  );
}
