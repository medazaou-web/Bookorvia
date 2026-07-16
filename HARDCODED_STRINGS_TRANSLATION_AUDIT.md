# Hardcoded English Strings - Translation Audit

**Last Updated:** 2026-07-10  
**Total Files Found:** 25+  
**Total Hardcoded Strings:** 150+  

---

## Priority 1: PUBLIC-FACING PAGES (HIGHEST PRIORITY - User Visible)

### 1. [app/page.tsx](app/page.tsx) - Homepage
**Estimated Strings:** 25+

**Key Hardcoded Sections:**
- Hero Section:
  - "Most businesses lose clients after the first visit"
  - "They lack the tools to stay connected and bring customers back"
  
- Problem Cards (6 sections):
  - "Missed Repeat Bookings" → "A client visits once, loves the service..."
  - "Forgotten WhatsApp Follow-ups" → "Businesses rely on memory..."
  - "No Clear Review System" → "Happy clients don't know where..."
  - "Messy Booking Flow" → "Bookings come from calls, WhatsApp..."
  - "No Loyalty Tracking" → "Regular clients are your best asset..."
  - "No Customer History" → "Without a client database..."
  
- Before/After Comparison:
  - "Before Bookorvia" / "With Bookorvia"
  - All bullet points in comparison table

- Features Section:
  - "Everything you need to manage your business"
  - "Professional tools built for local service businesses"
  - Feature titles and descriptions

- Pricing Section:
  - "Simple, transparent pricing"
  - Plan names and features

- CTA Section:
  - "Ready to turn more clients into regulars?"

---

### 2. [app/help/page.tsx](app/help/page.tsx) - Help/FAQ Page
**Estimated Strings:** 40+

**Key Hardcoded Sections:**
- Getting Started FAQ:
  - "How do I create my business profile?"
  - "How do I set up my business services?"
  - All step descriptions and list items
  - "Business name", "Category (Salon, Barber...)"
  - "Contact information (phone, WhatsApp, address)"
  - "Add your business logo or cover image"

- Bookings & Scheduling:
  - "How do I receive bookings?"
  - "Customers can book appointments in several ways:"
  - "Public Page:", "QR Code:", "NFC Tag:", "Direct Link:"
  - "How do I manage bookings on my calendar?"
  - "Can I set business hours and availability?"

- Clients & Follow-ups:
  - "How do I manage my client list?"
  - "What is a follow-up task?"
  - All service descriptions and instructions

---

### 3. [app/terms/page.tsx](app/terms/page.tsx) - Terms of Service
**Estimated Strings:** 25+

**Key Hardcoded Sections:**
- Main Title: "Terms of Service"
- Section Headings:
  - "1. Use of Service"
  - "2. Account Responsibility"
  - "3. Payment and Billing"
  - "4. Acceptable Use"
  - "5. Limitation of Liability"
  - "6. Contact Us"
  
- Full section content (all paragraph text)
- Acceptable Use violations list:
  - "Illegal activities or violations of any laws"
  - "Harassment, abuse, or threats toward other users"
  - "Spamming or unsolicited communications"
  - "Attempts to gain unauthorized access"

---

### 4. [app/privacy/page.tsx](app/privacy/page.tsx) - Privacy Policy
**Estimated Strings:** 30+

**Key Hardcoded Sections:**
- Section Headings:
  - "1. Data We Collect"
  - "2. How We Use Your Data"
  - "3. Data Storage and Security"
  - "4. Your Rights"
  - "5. Third-Party Sharing"
  - "6. Contact Us"

- Data Collection Items:
  - "Account Information", "Business Profile", "Client Data"
  - "Booking Information", "Reviews and Ratings"
  - "Loyalty Program Data", "Support Messages"

- Full section content with all descriptions

---

### 5. [app/refund-policy/page.tsx](app/refund-policy/page.tsx) - Refund Policy
**Estimated Strings:** 20+

**Key Hardcoded Sections:**
- Section Headings:
  - "1. Overview"
  - "2. Subscription Cancellation"
  - "3. Refund Eligibility"
  - "4. Non-Refundable Items"
  - "5. How to Request a Refund"
  - "6. Billing Disputes"
  - "7. Chargeback Policy"
  - "8. Contact Support"

---

### 6. [app/booking-status/[id]/page.tsx](app/booking-status/[id]/page.tsx) - Booking Status Tracker
**Estimated Strings:** 15+

**Hardcoded Strings:**
- Page Title: "Booking Status"
- Subtitle: "Track your appointment in real-time"
- Status Labels (in getStatusLabel function):
  - "Pending Confirmation"
  - "Confirmed"
  - "Completed"
  - "Not Available"
  - "Unknown"

- Status Messages (in getStatusMessage function):
  - "Your booking request is being reviewed. You'll receive an update soon."
  - "Great! Your booking is confirmed. Please arrive on time."
  - "Thank you for your booking! We hope you had a great experience."
  - "Unfortunately, this time slot is no longer available. Please try booking another time."

- Error States:
  - "Booking Not Found"
  - "We couldn't find this booking. Please check the link and try again."
  - "Loading your booking..."

- Table Labels:
  - "Name", "Business", "Service(s)", "Date", "Time", "Duration", "Booking ID"
  - "Booking Details"

- Help Text: "💡 Tip: This page updates automatically. Refresh or check back for the latest status."

---

### 7. [app/b/[slug]/page.tsx](app/b/[slug]/page.tsx) - Public Business Page
**Estimated Strings:** 8+

**Hardcoded Strings:**
- "Bookorvia" (branding - keep if needed)
- "← Back" (navigation)
- "Business Not Found"
- "We couldn't find a business with the slug \"{slug}\"."
- "Back to Home"

---

## Priority 2: DASHBOARD PAGES

### 8. [app/dashboard/business-page/page.tsx](app/dashboard/business-page/page.tsx) - Business Page Management
**Estimated Strings:** 15+

**Hardcoded Strings:**
- QR Code Section Help Text:
  - "What is a QR Code?"
  - "A QR code is a scannable image that links directly to your business page. Customers can scan it with their phone camera to instantly access your services and booking form."
  
- How to Use Section:
  - "How to Use"
  - "Print the QR code on business cards"
  - "Display it in your storefront or window"
  - "Add it to invoices and receipts"
  - "Write it on an NFC card"

- Tips Section:
  - "📌 Tips"
  - "Make the QR code at least 2cm × 2cm"
  - "Ensure good contrast and clear printing"
  - "Test by scanning it before printing"

---

### 9. [app/dashboard/support/page.tsx](app/dashboard/support/page.tsx) - Support Tickets
**Estimated Strings:** 20+

**Hardcoded Strings:**
- Button Labels: "+ New Ticket"
- Form Labels: "Subject", "Category", "Priority", "Describe your issue..."
- Category Options:
  - "General", "Billing", "Technical", "Account", "Feature Request"
- Priority Options:
  - "Low Priority", "Normal", "High", "Urgent"
- Status Labels:
  - "All", "Open", "In Progress", "Resolved", "Closed"
- Empty State: "📭 No tickets yet"
- Filter Button Text
- Error Messages:
  - "Subject and message are required"
  - "This ticket is closed. You cannot reply to closed tickets."

---

### 10. [app/dashboard/onboarding/page.tsx](app/dashboard/onboarding/page.tsx) - Onboarding Flow
**Estimated Strings:** 30+

**Step Descriptions:**
- Step labels and titles
- Step 1: Business Profile setup instructions
- Step 2: "Add Services" with service field labels
- Step 3: Preview section
- Step 4: QR Code section

- Form Field Placeholders and Labels:
  - "Business name", "Business slug", "Description"
  - "Phone", "WhatsApp", "Address"
  - "Select currency", "Booking countries"

- Service Fields:
  - "Service name", "Price", "Duration", "Currency"

- Button Text:
  - "Create Business", "Add Service", "Continue", "Download QR"

---

### 11. [app/dashboard/clients/page.tsx](app/dashboard/clients/page.tsx) - Client Management
**Estimated Strings:** 15+

**Hardcoded Strings:**
- Table Headers: "Name", "Phone", "Source", "Last Visit", "Bookings", "Notes"
- Button Text: "+ Add Client", "Add", "Save Notes", "Delete"
- Dialog Messages:
  - "Create a business first in Settings"
  - "This client already has a loyalty card."
- WhatsApp Template: "Bonjour {name}, merci pour votre visite. Souhaitez-vous reprendre rendez-vous ?"
- Empty State Messages

---

### 12. [app/dashboard/settings/page.tsx](app/dashboard/settings/page.tsx) - Settings Page
**Estimated Strings:** 15+

**Hardcoded Strings:**
- Section Titles:
  - "Contact Information"
- Form Labels and Placeholders
- Phone, WhatsApp, Address fields

---

## Priority 3: AUTH PAGES

### 13. [app/login/LoginForm.tsx](app/login/LoginForm.tsx)
**Estimated Strings:** 8+

**Hardcoded Strings:**
- "you@example.com" (placeholder - may want to translate)
- "••••••••" (password placeholder)
- Error/Success messages related to auth

---

### 14. [app/register/RegisterForm.tsx](app/register/RegisterForm.tsx)
**Estimated Strings:** 8+

**Hardcoded Strings:**
- "you@example.com" (placeholder)
- "••••••••" (password placeholder)
- Email validation message
- Form submission text

---

### 15. [app/reset-password/page.tsx](app/reset-password/page.tsx)
**Estimated Strings:** 5+

**Hardcoded Strings:**
- Title: "Set New Password"
- Placeholder text for password fields

---

### 16. [app/forgot-password/page.tsx](app/forgot-password/page.tsx)
**Estimated Strings:** 8+

**Hardcoded Strings:**
- Error messages:
  - "Please enter your email address."
  - "Unable to process your request. Please try again."
  - "Something went wrong. Please try again later."

---

## Priority 4: ADMIN PAGES

### 17. [app/admin/businesses/page.tsx](app/admin/businesses/page.tsx)
**Estimated Strings:** 5+

**Hardcoded Strings:**
- Placeholder: "Search by name, slug, or email"
- Loading state text

---

## Priority 5: UTILITY/SPECIAL PAGES

### 18. [app/auth-debug/page.tsx](app/auth-debug/page.tsx)
**Estimated Strings:** 8+

**Hardcoded Strings:** (Keep in English for debugging)
- "NEXT_PUBLIC_SUPABASE_URL"
- "NEXT_PUBLIC_SUPABASE_ANON_KEY"
- "Loaded", "Missing"
- Debug labels (optional to translate)

---

### 19. [app/test-supabase/page.tsx](app/test-supabase/page.tsx)
**Estimated Strings:** 5+

**Status indicators:** (Can leave in English for testing)

---

### 20. [app/booking-status/[id]/page.tsx - ReviewBooster Component](app/b/[slug]/ReviewBooster.tsx)
**Estimated Strings:** 12+

**Hardcoded Strings:**
- "Thanks for visiting — please consider leaving a quick review."
- Rating selection messages
- "Sorry to hear that" (for negative feedback)
- Button labels related to reviews
- Review input placeholders

---

## Component Files with Hardcoded Text

### 21. [app/components/ThemeToggle.tsx](app/components/ThemeToggle.tsx)
**Estimated Strings:** 2

**Hardcoded Strings:**
- "Switch to light mode"
- "Switch to dark mode"

---

## Strings Already Using t() Function (Already Translated)

These files are **ALREADY PROPERLY TRANSLATED** - do NOT need work:

✅ [app/dashboard/business-page/page.tsx](app/dashboard/business-page/page.tsx)
- Uses: `t('dashboard.businessPageTitle')`, `t('dashboard.loadingBusiness')`, etc.

✅ [app/dashboard/SupportModal.tsx](app/dashboard/SupportModal.tsx)
- Uses proper t() calls

✅ [app/b/[slug]/BookingSection.tsx](app/b/[slug]/BookingSection.tsx)
- Uses: `t('booking.requestBooking')`, `t('booking.selectServiceTime')`

✅ [app/b/[slug]/ReviewBooster.tsx](app/b/[slug]/ReviewBooster.tsx)
- Uses t() for most strings

---

## Summary by Priority

| Priority | Count | Files | Status |
|----------|-------|-------|--------|
| 1: Public Pages | 50+ | 7 files | ⚠️ HIGH - User-facing |
| 2: Dashboard | 60+ | 5 files | ⚠️ HIGH - Frequent use |
| 3: Auth | 30+ | 4 files | ⚠️ MEDIUM - New users |
| 4: Admin | 5+ | 1 file | 🟡 LOW - Internal use |
| 5: Utility | 15+ | 3 files | 🟢 LOW - Testing/Debug |
| **TOTAL** | **150+** | **25+** | **⚠️ ACTION NEEDED** |

---

## Recommended Action Plan

### Phase 1: Critical (Days 1-2)
1. **[app/page.tsx](app/page.tsx)** - Homepage (25+ strings) - 90% of traffic
2. **[app/help/page.tsx](app/help/page.tsx)** - Help/FAQ (40+ strings) - Support traffic
3. **[app/booking-status/[id]/page.tsx](app/booking-status/[id]/page.tsx)** - Public booking status (15+ strings)

### Phase 2: Important (Days 3-4)
4. **[app/terms/page.tsx](app/terms/page.tsx)** - Legal pages (25+ strings)
5. **[app/privacy/page.tsx](app/privacy/page.tsx)** - Legal pages (30+ strings)
6. **[app/dashboard/support/page.tsx](app/dashboard/support/page.tsx)** - User support (20+ strings)

### Phase 3: Support (Days 5-6)
7. **[app/dashboard/onboarding/page.tsx](app/dashboard/onboarding/page.tsx)** - Onboarding (30+ strings)
8. All remaining dashboard and auth pages

---

## Notes

- **NOT INCLUDED:** Console.log errors (acceptable in English for debugging)
- **NOT INCLUDED:** Comments in code
- **NOT INCLUDED:** Code structure/logic keywords
- **PLACEHOLDERS:** Some email placeholders (you@example.com) are worth considering translating for better UX
- **BRAND NAME:** "Bookorvia" and "Bookorvia" mentions - keep consistent
- **LEGAL TEXT:** Terms and Privacy policy sections should be reviewed by legal after translation
