# Hardcoded English Strings Audit for app/page.tsx

**Total Hardcoded Strings Found: 95+**

---

## 1. NAVIGATION & HEADER (Lines 40-125)

| Line | Hardcoded String | Suggested Translation Key | Component/Context |
|------|------------------|--------------------------|-------------------|
| 61 | `"Change language / Cambiar idioma / Changer la langue"` | `public.changeLanguageTitle` | Title attribute on language selector |

---

## 2. HERO SECTION MOCKUP (Lines 169-251)

### Mockup Header
| Line | Hardcoded String | Suggested Translation Key | Context |
|------|------------------|--------------------------|---------|
| 195 | `"Dr. Sarah's Clinic"` | `public.mockupClinicName` | Example business name |
| 196 | `"Live"` | `public.statusLive` | Status badge |
| 201 | `"Patients"` | `public.mockupPatientsLabel` | Stat label |
| 205 | `"Appointments"` | `public.mockupAppointmentsLabel` | Stat label |
| 209 | `"Rating"` | `public.mockupRatingLabel` | Stat label |

### Mockup Cards
| Line | Hardcoded String | Suggested Translation Key | Context |
|------|------------------|--------------------------|---------|
| 224 | `"Booking Request"` | `public.mockupBookingRequest` | Card title |
| 225 | `"Emma Wilson • Consultation • Tomorrow 10:00 AM"` | `public.mockupBookingExample` | Card content |
| 229 | `"New Review"` | `public.mockupNewReview` | Card title |
| 230 | `"5/5 stars • \"Excellent service!\""` | `public.mockupReviewExample` | Card content |
| 234 | `"Care Plan Progress"` | `public.mockupCarePlanProgress` | Card title |
| 240 | `"4/5 follow-ups • Checkup due soon"` | `public.mockupFollowUpStatus` | Card content |
| 244 | `"Health Reminder"` | `public.mockupHealthReminder` | Card title |
| 245 | `"Ready to send • 5 patients"` | `public.mockupReminderStatus` | Card content |
| 249 | `"Check-ins"` | `public.mockupCheckInsLabel` | Card title |
| 250 | `"+47%"` | `public.mockupCheckInsIncrease` | Stat value |
| 251 | `"Returning patients this month"` | `public.mockupCheckInsDesc` | Card description |

---

## 3. PROBLEM SECTION - Card 1: Missed Repeat Bookings (Lines 302-323)

| Line | Hardcoded String | Suggested Translation Key | Context |
|------|------------------|--------------------------|---------|
| 309 | `"MISSED BOOKINGS"` | `public.problemMissedBookingsTitle` | Problem card header |
| 311 | `"Mon 9:00 AM"` | `public.mockupBookingTime` | Example time slot |
| 312 | `"✓ Done"` | `public.mockupStatusDone` | Status indicator |
| 316 | `"Follow-up needed"` | `public.mockupFollowUpNeeded` | Example line item |
| 317 | `"✗ Missed"` | `public.mockupStatusMissed` | Status indicator |
| 321 | `"Missed Repeat Bookings"` | `public.problemMissedBookingsDesc` | Card title |
| 322 | `"A client visits once, loves the service, but you have no way to remind them to book again. They move on to a competitor."` | `public.problemMissedBookingsExplain` | Card description |
| 323 | `"No reminder system"` | `public.problemMissedBookingsTag` | Tag/badge |

---

## 4. PROBLEM SECTION - Card 2: Forgotten WhatsApp Follow-ups (Lines 328-342)

| Line | Hardcoded String | Suggested Translation Key | Context |
|------|------------------|--------------------------|---------|
| 328 | `"WHATSAPP MESSAGES"` | `public.problemWhatsappTitle` | Problem card header |
| 331 | `"Last visit:"` | `public.mockupLastVisitLabel` | Example label |
| 331 | `"28 days ago"` | `public.mockupDaysAgo` | Time reference |
| 336 | `"⚠ Follow-up overdue"` | `public.mockupFollowUpOverdue` | Status indicator |
| 340 | `"Forgotten WhatsApp Follow-ups"` | `public.problemForgottenFollowUpsDesc` | Card title |
| 341 | `"Businesses rely on memory to reach out to customers. Important follow-ups slip through the cracks, and regular clients never hear from you again."` | `public.problemForgottenFollowUpsExplain` | Card description |
| 342 | `"Manual work, easily forgotten"` | `public.problemForgottenFollowUpsTag` | Tag/badge |

---

## 5. PROBLEM SECTION - Card 3: No Review System (Lines 350-365)

| Line | Hardcoded String | Suggested Translation Key | Context |
|------|------------------|--------------------------|---------|
| 350 | `"REVIEWS"` | `public.problemReviewsTitle` | Problem card header |
| 354 | `"Happy clients:"` | `public.mockupHappyClientsLabel` | Example label |
| 355 | `"5/5 ✓✓✓"` | `public.mockupFiveStarRating` | Rating display |
| 359 | `"✗ No Google reviews"` | `public.mockupNoGoogleReviews` | Missing feature indicator |
| 363 | `"No Clear Review System"` | `public.problemNoReviewSystemDesc` | Card title |
| 364 | `"Happy clients don't know where to leave reviews. Meanwhile, even one upset client can post a negative review unchallenged. Your reputation stays hidden."` | `public.problemNoReviewSystemExplain` | Card description |
| 365 | `"Lost opportunity"` | `public.problemNoReviewSystemTag` | Tag/badge |

---

## 6. PROBLEM SECTION - Card 4: Messy Booking Flow (Lines 374-386)

| Line | Hardcoded String | Suggested Translation Key | Context |
|------|------------------|--------------------------|---------|
| 374 | `"BOOKING SOURCES"` | `public.problemBookingSourcesTitle` | Problem card header |
| 377 | `"Call"` | `public.bookingSourceCall` | Booking channel |
| 378 | `"WhatsApp"` | `public.bookingSourceWhatsapp` | Booking channel |
| 379 | `"Instagram"` | `public.bookingSourceInstagram` | Booking channel |
| 380 | `"Double-booking"` | `public.mockupDoubleBooking` | Problem indicator |
| 384 | `"Messy Booking Flow"` | `public.problemMessyBookingDesc` | Card title |
| 385 | `"Bookings come from calls, WhatsApp, Instagram, and walk-ins with zero central calendar. Double-bookings happen. Clients get conflicting information."` | `public.problemMessyBookingExplain` | Card description |
| 386 | `"Chaos and lost sales"` | `public.problemMessyBookingTag` | Tag/badge |

---

## 7. PROBLEM SECTION - Card 5: No Loyalty Tracking (Lines 395-409)

| Line | Hardcoded String | Suggested Translation Key | Context |
|------|------------------|--------------------------|---------|
| 395 | `"LOYALTY CARD"` | `public.problemLoyaltyTitle` | Problem card header |
| 398 | `"Visits:"` | `public.mockupVisitsLabel` | Example label |
| 399 | `"3/5 ✓✓✓"` | `public.mockupLoyaltyProgress` | Progress display |
| 403 | `"Reward not tracked"` | `public.mockupRewardNotTracked` | Status indicator |
| 407 | `"No Loyalty Tracking"` | `public.problemNoLoyaltyDesc` | Card title |
| 408 | `"Regular clients are your best asset, but many businesses track loyalty manually or not at all. Repeat customers feel undervalued and invisible."` | `public.problemNoLoyaltyExplain` | Card description |
| 409 | `"Lost repeat business"` | `public.problemNoLoyaltyTag` | Tag/badge |

---

## 8. PROBLEM SECTION - Card 6: No Customer History (Lines 418-431)

| Line | Hardcoded String | Suggested Translation Key | Context |
|------|------------------|--------------------------|---------|
| 418 | `"CLIENT PROFILE"` | `public.problemClientProfileTitle` | Problem card header |
| 421 | `"Last service:"` | `public.mockupLastServiceLabel` | Example label |
| 421 | `"21 days ago"` | `public.mockupDaysAgoAlt` | Time reference |
| 425 | `"✗ Notes/history missing"` | `public.mockupNotesHistoryMissing` | Missing feature indicator |
| 429 | `"No Customer History"` | `public.problemNoHistoryDesc` | Card title |
| 430 | `"Without a client database, you forget names, preferences, what they bought, and their service history. Every visit feels like the first time."` | `public.problemNoHistoryExplain` | Card description |
| 431 | `"Lost context"` | `public.problemNoHistoryTag` | Tag/badge |

---

## 9. BEFORE/AFTER COMPARISON SECTION (Lines 440-496)

### Before Section
| Line | Hardcoded String | Suggested Translation Key | Context |
|------|------------------|--------------------------|---------|
| 444 | `"Before Bookorvia"` | `public.beforeBookorvia` | Section heading |
| 448 | `"Bookings scattered across calls, WhatsApp, Instagram"` | `public.beforePoint1` | Bullet point |
| 453 | `"Follow-ups depend on memory and manual reminders"` | `public.beforePoint2` | Bullet point |
| 458 | `"Happy clients never asked for reviews"` | `public.beforePoint3` | Bullet point |
| 463 | `"No loyalty tracking, clients feel forgotten"` | `public.beforePoint4` | Bullet point |
| 468 | `"Client history lost between visits"` | `public.beforePoint5` | Bullet point |

### After Section
| Line | Hardcoded String | Suggested Translation Key | Context |
|------|------------------|--------------------------|---------|
| 472 | `"With Bookorvia"` | `public.withBookorvia` | Section heading |
| 476 | `"One unified calendar. Bookings in one place."` | `public.afterPoint1` | Bullet point |
| 481 | `"Automated follow-ups sent at the right time"` | `public.afterPoint2` | Bullet point |
| 486 | `"Auto-request reviews from happy clients"` | `public.afterPoint3` | Bullet point |
| 491 | `"Digital loyalty cards visible to customers"` | `public.afterPoint4` | Bullet point |
| 496 | `"Complete client history at your fingertips"` | `public.afterPoint5` | Bullet point |

---

## 10. FEATURES SECTION (Lines 507-560)

### Section Header
| Line | Hardcoded String | Suggested Translation Key | Context |
|------|------------------|--------------------------|---------|
| 509 | `"Everything you need to manage your business"` | `public.featuresHeading` | Section title |
| 510 | `"Professional tools built for local service businesses"` | `public.featuresSubheading` | Section subtitle |

### Feature 1: Smart Booking Calendar
| Line | Hardcoded String | Suggested Translation Key | Context |
|------|------------------|--------------------------|---------|
| 514 | `"Smart Booking Calendar"` | `public.featureSmartBookingTitle` | Feature title |
| 515 | `"Set your availability, let clients book instantly. Auto-confirm or review each booking."` | `public.featureSmartBookingDesc` | Feature description |
| 516 | `"Today\n• 9:00 AM - Haircut\n• 10:30 AM - Beard\n• 2:00 PM - (Open)\n• 4:00 PM - Color"` | `public.featureSmartBookingVisual` | Visual example |

### Feature 2: Client Database
| Line | Hardcoded String | Suggested Translation Key | Context |
|------|------------------|--------------------------|---------|
| 520 | `"Client Database"` | `public.featureClientDatabaseTitle` | Feature title |
| 521 | `"Keep all customer info in one place. Track history, preferences, and contact info."` | `public.featureClientDatabaseDesc` | Feature description |
| 522 | `"John Smith\nPhone: +34 612 345 678\n12 visits\nRating: 5.0"` | `public.featureClientDatabaseVisual` | Visual example |

### Feature 3: Review Booster
| Line | Hardcoded String | Suggested Translation Key | Context |
|------|------------------|--------------------------|---------|
| 527 | `"Review Booster"` | `public.featureReviewBoosterTitle` | Feature title |
| 528 | `"Automatically ask for Google & Trustpilot reviews after each service."` | `public.featureReviewBoosterDesc` | Feature description |
| 529 | `"Request sent\nVia email & SMS\n87% response rate\nRating +0.4"` | `public.featureReviewBoosterVisual` | Visual example |

### Feature 4: WhatsApp Follow-ups
| Line | Hardcoded String | Suggested Translation Key | Context |
|------|------------------|--------------------------|---------|
| 533 | `"WhatsApp Follow-ups"` | `public.featureWhatsappFollowupsTitle` | Feature title |
| 534 | `"Send automated reminders and follow-ups. Keep clients engaged between visits."` | `public.featureWhatsappFollowupsDesc` | Feature description |
| 535 | `"Ready to send\n2 clients\nScheduled\nAuto-reschedule"` | `public.featureWhatsappFollowupsVisual` | Visual example |

### Feature 5: Loyalty Cards
| Line | Hardcoded String | Suggested Translation Key | Context |
|------|------------------|--------------------------|---------|
| 539 | `"Loyalty Cards"` | `public.featureLoyaltyCardsTitle` | Feature title |
| 540 | `"Digital loyalty programs. Customers collect stamps, earn rewards. Drive repeat visits."` | `public.featureLoyaltyCardsDesc` | Feature description |
| 541 | `"Loyalty Card\n[■■■□□] 3/5\nReward ready\n€25 discount"` | `public.featureLoyaltyCardsVisual` | Visual example |

### Feature 6: QR/NFC Public Page
| Line | Hardcoded String | Suggested Translation Key | Context |
|------|------------------|--------------------------|---------|
| 545 | `"QR/NFC Public Page"` | `public.featureQRPageTitle` | Feature title |
| 546 | `"One link for everything. Booking, reviews, loyalty, business info. Share everywhere."` | `public.featureQRPageDesc` | Feature description |
| 547 | `"Scan with phone\nView availability\nBook instantly\nSee reviews"` | `public.featureQRPageVisual` | Visual example |

---

## 11. HOW IT WORKS SECTION (Lines 564-580)

| Line | Hardcoded String | Suggested Translation Key | Context |
|------|------------------|--------------------------|---------|
| 566 | `"How it works in 5 minutes"` | `public.howItWorksHeading` | Section title |
| 571 | `"Create Account"` | `public.stepCreateAccount` | Step 1 title |
| 572 | `"Sign up with email"` | `public.stepCreateAccountDesc` | Step 1 description |
| 573 | `"Add Services"` | `public.stepAddServices` | Step 2 title |
| 574 | `"Define services & pricing"` | `public.stepAddServicesDesc` | Step 2 description |
| 575 | `"Set Hours"` | `public.stepSetHours` | Step 3 title |
| 576 | `"Choose working hours"` | `public.stepSetHoursDesc` | Step 3 description |
| 577 | `"Share QR"` | `public.stepShareQR` | Step 4 title |
| 578 | `"Get your QR code"` | `public.stepShareQRDesc` | Step 4 description |
| 579 | `"Get Bookings"` | `public.stepGetBookings` | Step 5 title |
| 580 | `"Start receiving requests"` | `public.stepGetBookingsDesc` | Step 5 description |

---

## 12. PRICING SECTION (Lines 584-624)

### Section Header
| Line | Hardcoded String | Suggested Translation Key | Context |
|------|------------------|--------------------------|---------|
| 586 | `"Simple, transparent pricing"` | `public.pricingHeading` | Section title |
| 587 | `"Choose the plan that fits your business"` | `public.pricingSubheading` | Section subtitle |

### Starter Plan (Lines 590-598)
| Line | Hardcoded String | Suggested Translation Key | Context |
|------|------------------|--------------------------|---------|
| 590 | `"Starter"` | `public.planStarter` | Plan name |
| 591 | `"19€"` | `public.planStarterPrice` | Price |
| 592 | `"/month"` | `public.pricingPeriod` | Billing period |
| 593 | `"For small businesses starting online booking"` | `public.planStarterDesc` | Plan description |
| 594 | `"Booking calendar"` | `public.featureBookingCalendar` | Feature name |
| 595 | `"Up to 50 bookings/month"` | `public.featureBookingsLimit` | Feature detail |
| 596 | `"Client database"` | `public.featureClientDatabase` | Feature name |
| 597 | `"Basic email support"` | `public.featureEmailSupport` | Feature name |
| 598 | `"Start Free Trial"` | `public.pricingCTA` | Call-to-action button |

### Pro Plan (Lines 600-611)
| Line | Hardcoded String | Suggested Translation Key | Context |
|------|------------------|--------------------------|---------|
| 600 | `"Pro"` | `public.planPro` | Plan name |
| 601 | `"39€"` | `public.planProPrice` | Price |
| 602 | `"/month"` | `public.pricingPeriod` | Billing period |
| 603 | `"Most popular. For growing businesses"` | `public.planProDesc` | Plan description |
| 604 | `"Everything in Starter"` | `public.featureEverythingInStarter` | Feature name |
| 605 | `"Unlimited bookings"` | `public.featureUnlimitedBookings` | Feature name |
| 606 | `"Reviews & ratings"` | `public.featureReviewsRatings` | Feature name |
| 607 | `"WhatsApp follow-ups"` | `public.featureWhatsappFollowups` | Feature name |
| 608 | `"Loyalty cards"` | `public.featureLoyaltyCards` | Feature name |
| 609 | `"QR/NFC page"` | `public.featureQRPage` | Feature name |
| 610 | `"Priority support"` | `public.featurePrioritySupport` | Feature name |
| 611 | `"Start Free Trial"` | `public.pricingCTA` | Call-to-action button |
| 612 | `"Most popular"` | `public.planPopularBadge` | Badge |

### Business Plan (Lines 614-624)
| Line | Hardcoded String | Suggested Translation Key | Context |
|------|------------------|--------------------------|---------|
| 614 | `"Business"` | `public.planBusiness` | Plan name |
| 615 | `"79€"` | `public.planBusinessPrice` | Price |
| 616 | `"/month"` | `public.pricingPeriod` | Billing period |
| 617 | `"For teams and advanced management"` | `public.planBusinessDesc` | Plan description |
| 618 | `"Everything in Pro"` | `public.featureEverythingInPro` | Feature name |
| 619 | `"Advanced analytics"` | `public.featureAdvancedAnalytics` | Feature name |
| 620 | `"Multi-user access"` | `public.featureMultiUserAccess` | Feature name |
| 621 | `"Custom branding"` | `public.featureCustomBranding` | Feature name |
| 622 | `"API access"` | `public.featureAPIAccess` | Feature name |
| 623 | `"Dedicated support"` | `public.featureDedicatedSupport` | Feature name |
| 624 | `"Start Free Trial"` | `public.pricingCTA` | Call-to-action button |

---

## 13. FINAL CTA SECTION (Lines 647-652)

| Line | Hardcoded String | Suggested Translation Key | Context |
|------|------------------|--------------------------|---------|
| 649 | `"Ready to turn more clients into regulars?"` | `public.finalCTAHeading` | Main heading |
| 650 | `"Start your 14-day free trial today. No credit card required."` | `public.finalCTASubheading` | Subheading |
| 651 | `"Start Free Trial"` | `public.finalCTAButton` | Button text |

---

## 14. FOOTER SECTION (Lines 657-691)

### About Section
| Line | Hardcoded String | Suggested Translation Key | Context |
|------|------------------|--------------------------|---------|
| 665 | `"Help local service businesses turn first-time clients into loyal regulars with smart booking, reviews, and loyalty tools."` | `public.footerAbout` | Company description |

### Product Links
| Line | Hardcoded String | Suggested Translation Key | Context |
|------|------------------|--------------------------|---------|
| 669 | `"Product"` | `public.footerProductHeading` | Section heading |
| (implicit) | `"Features"` | `public.features` | Link text |
| (implicit) | `"Pricing"` | `public.pricing` | Link text |
| (implicit) | `"Demo"` | `public.demo` | Link text |

### Legal Links
| Line | Hardcoded String | Suggested Translation Key | Context |
|------|------------------|--------------------------|---------|
| 677 | `"Legal"` | `public.footerLegalHeading` | Section heading |
| (implicit) | `"Terms"` | `public.terms` | Link text |
| (implicit) | `"Privacy"` | `public.privacy` | Link text |
| (implicit) | `"Cookies"` | `public.cookies` | Link text |
| (implicit) | `"Refunds"` | `public.refunds` | Link text |

### Bottom Footer
| Line | Hardcoded String | Suggested Translation Key | Context |
|------|------------------|--------------------------|---------|
| 691 | `"Built for local businesses"` | `public.footerTagline` | Tagline |
| (implicit) | `"Contact"` | `public.contact` | Link text |
| (implicit) | `"Help"` | `public.help` | Link text |

---

## SUMMARY

**Total Sections with Hardcoded Strings: 14**

**Recommended Naming Convention Pattern:**
```
public.{section}{description}
```

Examples:
- `public.heroTitle` - Hero section title
- `public.problemMissedBookings` - Problem card about missed bookings
- `public.featureSmartBooking` - Feature description
- `public.pricingHeading` - Pricing section heading
- `public.footerAbout` - Footer about section

---

## NEXT STEPS

1. Create translation JSON files with these keys for EN, ES, and FR
2. Replace all hardcoded strings with `t()` function calls
3. Handle multi-line strings (use `\n` or split across lines)
4. Test all three language translations
5. Verify fallback to English for missing keys
