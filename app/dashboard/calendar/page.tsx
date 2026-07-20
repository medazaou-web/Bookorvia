'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabase/browserClient';
import { useLanguage } from '@/lib/context/LanguageContext';
import { useTranslations } from '@/lib/i18n';
import { CalendarIcon, ClockIcon, SettingsIcon, EditIcon } from '@/components/icons';

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function getDayName(dayIndex: number, t: any): string {
  const dayKeys = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return t(`dashboardUI.dayNames.${dayKeys[dayIndex]}`);
}

interface CalendarEvent {
  id: string;
  title: string;
  starts_at: string;
  ends_at: string;
  source: 'booking' | 'manual' | 'external' | 'break' | 'unavailable';
  status: string;
}

interface BusinessHours {
  day_of_week: number;
  start_time: string;
  end_time: string;
}

interface CalendarSettings {
  timezone: string;
  slot_interval_minutes: number;
  buffer_minutes: number;
  min_notice_hours: number;
  max_booking_days_ahead: number;
}

// Get timezone list
function getTimezoneList(): string[] {
  try {
    return Intl.supportedValuesOf('timeZone');
  } catch {
    return [
      'Africa/Casablanca',
      'Africa/Cairo',
      'Africa/Lagos',
      'Africa/Johannesburg',
      'Europe/London',
      'Europe/Paris',
      'Europe/Berlin',
      'Europe/Amsterdam',
      'Europe/Brussels',
      'Europe/Madrid',
      'Europe/Rome',
      'Europe/Vienna',
      'Europe/Prague',
      'Europe/Warsaw',
      'Europe/Moscow',
      'America/New_York',
      'America/Chicago',
      'America/Denver',
      'America/Los_Angeles',
      'America/Anchorage',
      'America/Toronto',
      'America/Mexico_City',
      'America/Buenos_Aires',
      'America/Sao_Paulo',
      'Asia/Dubai',
      'Asia/Riyadh',
      'Asia/Qatar',
      'Asia/Kolkata',
      'Asia/Bangkok',
      'Asia/Singapore',
      'Asia/Hong_Kong',
      'Asia/Tokyo',
      'Asia/Shanghai',
      'Asia/Seoul',
      'Australia/Sydney',
      'Australia/Melbourne',
      'Pacific/Auckland',
      'UTC',
    ];
  }
}

export default function CalendarPage() {
  const { language } = useLanguage();
  const t = useTranslations(language);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [business, setBusiness] = useState<any>(null);
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [currentWeek, setCurrentWeek] = useState(getWeekStart(new Date()));
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [workingHours, setWorkingHours] = useState<BusinessHours[]>([]);
  const [settings, setSettings] = useState<CalendarSettings | null>(null);
  const [activeTab, setActiveTab] = useState<'calendar' | 'hours' | 'settings'>('calendar');
  const [currentEventsPage, setCurrentEventsPage] = useState(1);
  
  // Modal state for click-to-add
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalData, setModalData] = useState<{ date: string; time: string } | null>(null);

  // Modal state for viewing/editing existing bookings
  const [showBookingDetailsModal, setShowBookingDetailsModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);

  // Fetch business and initial data
  useEffect(() => {
    loadBusinessAndData();
    
    // Setup real-time subscription for calendar events
    let channel: any = null;
    
    async function setupSubscription() {
      try {
        const { data: userData } = await supabase.auth.getUser();
        const user = (userData as any)?.user ?? null;
        if (!user) return;

        const { data: biz } = await supabase.from("businesses").select("id").eq("user_id", user.id).single();
        const businessIdForSub = (biz as any)?.id ?? null;
        
        if (!businessIdForSub) return;

        console.log("📡 Setting up real-time subscription for calendar events:", businessIdForSub);
        
        // Remove any existing channel before creating new one
        const existingChannel = supabase.getChannels().find(ch => ch.topic === `realtime:calendar:${businessIdForSub}`);
        if (existingChannel) {
          await supabase.removeChannel(existingChannel);
        }
        
        channel = supabase
          .channel(`calendar:${businessIdForSub}`, { config: { broadcast: { self: true } } })
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "booking_requests",
              filter: `business_id=eq.${businessIdForSub}`,
            },
            (payload) => {
              console.log("📡 Calendar event update received:", payload);
              // Silently reload events in the background
              if (businessIdForSub) {
                loadEventsForWeek();
              }
            }
          )
          .subscribe((status) => {
            console.log("📡 Calendar subscription status:", status);
          });
      } catch (err) {
        console.error("📡 Error setting up calendar subscription:", err);
      }
    }

    setupSubscription();
    
    // Proper cleanup on unmount
    return () => {
      if (channel) {
        console.log("📡 Cleaning up calendar subscription");
        supabase.removeChannel(channel);
      }
    };
  }, []);

  // Load events when week changes
  useEffect(() => {
    if (businessId) {
      loadEventsForWeek();
    }
  }, [currentWeek, businessId]);

  async function loadBusinessAndData() {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const user = (userData as any)?.user ?? null;
      if (!user) {
        router.push('/login');
        return;
      }

      const { data: biz } = await supabase
        .from('businesses')
        .select('id, name, slug')
        .eq('user_id', user.id)
        .single();

      if (!biz) {
        router.push('/dashboard');
        return;
      }

      setBusiness(biz);
      setBusinessId(biz.id);

      // Load working hours
      const { data: hours } = await supabase
        .from('business_working_hours')
        .select('*')
        .eq('business_id', biz.id)
        .order('day_of_week');

      // If no hours exist, initialize with all 7 days disabled
      if (!hours || hours.length === 0) {
        const defaultHours = Array.from({ length: 7 }, (_, i) => ({
          day_of_week: i,
          start_time: '09:00',
          end_time: '17:00',
          enabled: false,
        }));
        setWorkingHours(defaultHours);
      } else {
        setWorkingHours(hours);
      }

      // Load calendar settings
      const { data: settingsData } = await supabase
        .from('business_calendar_settings')
        .select('*')
        .eq('business_id', biz.id)
        .single();

      if (settingsData) {
        setSettings(settingsData);
      } else {
        // Create defaults
        const defaults: CalendarSettings = {
          timezone: 'Africa/Casablanca',
          slot_interval_minutes: 30,
          buffer_minutes: 0,
          min_notice_hours: 2,
          max_booking_days_ahead: 30,
        };
        await supabase.from('business_calendar_settings').insert({
          business_id: biz.id,
          ...defaults,
        });
        setSettings(defaults);
      }
    } catch (err) {
      console.error('Error loading business:', err);
    } finally {
      setLoading(false);
    }
  }

  async function loadEventsForWeek() {
    if (!businessId) return;

    try {
      const weekEnd = new Date(currentWeek);
      weekEnd.setDate(weekEnd.getDate() + 7);

      // Load calendar events
      const { data: calendarEvents } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('business_id', businessId)
        .gte('starts_at', currentWeek.toISOString())
        .lt('starts_at', weekEnd.toISOString())
        .order('starts_at');

      // Load booking requests that have starts_at times
      const { data: bookings } = await supabase
        .from('booking_requests')
        .select('id, client_name, service, services_json, requested_date, starts_at, ends_at, status')
        .eq('business_id', businessId)
        .not('starts_at', 'is', null)
        .gte('starts_at', currentWeek.toISOString())
        .lt('starts_at', weekEnd.toISOString())
        .order('starts_at');

      // Convert bookings to calendar event format
      const bookingEvents: CalendarEvent[] = (bookings || []).map(b => {
        // Build service string
        let serviceString = b.service;
        if (b.services_json) {
          try {
            const services = JSON.parse(b.services_json);
            serviceString = services.map((s: any) => s.name).join(", ");
          } catch (e) {
            // Fall back to service field
          }
        }
        
        return {
          id: b.id,
          title: `${b.client_name} - ${serviceString}`,
          starts_at: b.starts_at,
          ends_at: b.ends_at,
          source: 'booking' as const,
          status: b.status,
        };
      });

      // Combine and sort all events
      const allEvents = [...(calendarEvents || []), ...bookingEvents].sort(
        (a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime()
      );

      setEvents(allEvents);
      setCurrentEventsPage(1); // Reset pagination when events load
    } catch (err) {
      console.error('Error loading events:', err);
    }
  }

  function getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  }

  function goToPreviousWeek() {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(newWeek.getDate() - 7);
    setCurrentWeek(newWeek);
  }

  function goToNextWeek() {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(newWeek.getDate() + 7);
    setCurrentWeek(newWeek);
  }

  function goToToday() {
    setCurrentWeek(getWeekStart(new Date()));
  }

  function handleSlotClick(date: Date, hour: number, minute: number = 0) {
    const dateStr = date.toISOString().split('T')[0];
    const timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    setModalData({ date: dateStr, time: timeStr });
    setShowAddModal(true);
  }

  function formatDateRange() {
    const end = new Date(currentWeek);
    end.setDate(end.getDate() + 6);
    return `${currentWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  }

  function getEventColor(event: CalendarEvent) {
    switch (event.source) {
      case 'booking':
        return 'bg-indigo-600';
      case 'external':
        return 'bg-violet-600';
      case 'break':
        return 'bg-amber-600';
      case 'unavailable':
        return 'bg-red-600';
      default:
        return 'bg-slate-400';
    }
  }

  async function handleEventClick(event: CalendarEvent) {
    if (event.source === 'booking') {
      // Fetch full booking details
      const { data: booking, error } = await supabase
        .from('booking_requests')
        .select('*')
        .eq('id', event.id)
        .single();

      if (booking) {
        setSelectedBooking(booking);
        setShowBookingDetailsModal(true);
      }
    }
  }

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(currentWeek);
    date.setDate(date.getDate() + i);
    return date;
  });

  if (loading) {
    return <div className="text-center py-12">{t('dashboardUI.calendarLoadingMessage')}</div>;
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">{t('dashboardUI.calendar')}</h1>
        <p className="text-slate-600 dark:text-slate-400">{t('dashboardUI.calendarManageSchedule')}</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {(['calendar', 'hours', 'settings'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center gap-1 sm:gap-2 whitespace-nowrap ${
              activeTab === tab
                ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white'
                : 'bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            {tab === 'calendar' && <><CalendarIcon className="h-3 sm:h-4 w-3 sm:w-4" /> <span className="hidden sm:inline">{t('dashboardUI.calendarTabs.calendar')}</span></>}
            {tab === 'hours' && <><ClockIcon className="h-3 sm:h-4 w-3 sm:w-4" /> <span className="hidden sm:inline">{t('dashboardUI.calendarTabs.hours')}</span></>}
            {tab === 'settings' && <><SettingsIcon className="h-3 sm:h-4 w-3 sm:w-4" /> <span className="hidden sm:inline">{t('dashboardUI.calendarTabs.settings')}</span></>}

          </button>
        ))}
      </div>

      {/* Calendar Tab */}
      {activeTab === 'calendar' && (
        <div className="space-y-6">
          {/* Week Navigation */}
          <div className="rounded-2xl bg-white/80 dark:bg-slate-900/50 backdrop-blur border border-white/60 dark:border-white/10 shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{formatDateRange()}</h2>
              <div className="flex gap-2">
                <button
                  onClick={goToPreviousWeek}
                  className="px-4 py-2 rounded-lg bg-white/60 dark:bg-slate-800 border border-white/60 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-white/80 dark:hover:bg-slate-700 transition-all"
                >
                  ← {t('dashboardUI.calendarNavigation.prev')}
                </button>
                <button
                  onClick={goToToday}
                  className="px-4 py-2 rounded-lg bg-white/60 dark:bg-slate-800 border border-white/60 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-white/80 dark:hover:bg-slate-700 transition-all"
                >
                  {t('dashboardUI.calendarNavigation.today')}
                </button>
                <button
                  onClick={goToNextWeek}
                  className="px-4 py-2 rounded-lg bg-white/60 dark:bg-slate-800 border border-white/60 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-white/80 dark:hover:bg-slate-700 transition-all"
                >
                  {t('dashboardUI.calendarNavigation.next')} →
                </button>
              </div>
            </div>

            {/* Time-based Week Grid (9 AM to 6 PM) */}
            <div className="mt-6 overflow-x-auto">
              {/* Time column header */}
              <div className="grid gap-0" style={{ gridTemplateColumns: '80px repeat(7, 1fr)' }}>
                {/* Empty corner for time column */}
                <div className="border-b border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-2"></div>

                {/* Day headers */}
                {weekDays.map((date, idx) => {
                  const isToday = date.toDateString() === new Date().toDateString();
                  return (
                    <div
                      key={idx}
                      className={`border-b-2 border-r border-slate-300 dark:border-slate-700 p-3 text-center ${
                        isToday ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-300 dark:border-indigo-700' : 'bg-slate-50 dark:bg-slate-800/50'
                      }`}
                    >
                      <div className="font-bold text-sm text-slate-900 dark:text-slate-100">
                        {getDayName(date.getDay(), t)}
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-400">
                        {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                  );
                })}

                {/* Time slots (9 AM to 6 PM in 1-hour increments) */}
                {Array.from({ length: 10 }, (_, hourIdx) => {
                  const hour = 9 + hourIdx;
                  const timeLabel = hour > 12 ? `${hour - 12}:00 PM` : hour === 12 ? '12:00 PM' : `${hour}:00 AM`;

                  return (
                    <div key={`row-${hour}`} className="contents">
                      {/* Time label */}
                      <div className="border-b border-r border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-2 text-right text-xs font-semibold text-slate-700 dark:text-slate-300 sticky left-0 z-10">
                        {timeLabel}
                      </div>

                      {/* Time slots for each day */}
                      {weekDays.map((date, dayIdx) => {
                        const slotEvents = events.filter((e) => {
                          const eventStart = new Date(e.starts_at);
                          const eventEnd = new Date(e.ends_at);
                          const slotStart = new Date(date);
                          slotStart.setHours(hour, 0, 0, 0);
                          const slotEnd = new Date(date);
                          slotEnd.setHours(hour + 1, 0, 0, 0);

                          // Check if event overlaps this hour slot
                          return eventStart < slotEnd && eventEnd > slotStart;
                        });

                        const isToday = date.toDateString() === new Date().toDateString();

                        return (
                          <div
                            key={`slot-${dayIdx}-${hour}`}
                            onClick={() => handleSlotClick(date, hour, 0)}
                            className={`
                              relative border-b border-r border-slate-200 dark:border-slate-700 p-2 min-h-[80px] cursor-pointer
                              transition-all hover:bg-indigo-100 dark:hover:bg-indigo-900/30 hover:shadow-sm
                              ${isToday ? 'bg-indigo-50 dark:bg-indigo-900/20' : 'bg-white/60 dark:bg-slate-800/30'}
                              ${slotEvents.length > 0 ? 'hover:bg-indigo-100/50 dark:hover:bg-indigo-900/30' : ''}
                            `}
                          >
                            {/* Events in this slot */}
                            {slotEvents.map((event) => (
                              <div
                                key={event.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEventClick(event);
                                }}
                                className={`text-xs rounded px-2 py-1 mb-1 text-white truncate font-semibold cursor-pointer hover:shadow-lg transition-all ${getEventColor(
                                  event
                                )}`}
                                title={`Click to view details`}
                              >
                                {event.title}
                              </div>
                            ))}

                            {/* Visual indicator for clickable slot */}
                            {slotEvents.length === 0 && (
                              <div className="absolute inset-0 opacity-0 hover:opacity-10 bg-indigo-600 rounded transition-opacity"></div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Events List */}
          <div className="rounded-2xl bg-white/80 dark:bg-slate-900/50 backdrop-blur border border-white/60 dark:border-white/10 shadow-lg p-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">{t('dashboardUI.calendarEvent.eventsThisWeek')}</h3>
            {events.length > 0 ? (
              <>
                <div className="space-y-2">
                  {events.slice((currentEventsPage - 1) * 10, currentEventsPage * 10).map((event) => (
                    <div
                      key={event.id}
                      className={`flex items-start gap-3 p-3 rounded-lg border-l-4 ${getEventColor(
                        event
                      )} bg-white/50 dark:bg-slate-800/30 cursor-pointer hover:shadow-md transition-shadow`}
                      onClick={() => {
                        setSelectedBooking(event);
                        setShowBookingDetailsModal(true);
                      }}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-slate-900 dark:text-slate-100">{event.title}</div>
                        <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                          <div className="font-medium text-slate-700 dark:text-slate-300">
                            {new Date(event.starts_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              weekday: 'short',
                            })}
                          </div>
                          <div>
                            {new Date(event.starts_at).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}{' '}
                            -{' '}
                            {new Date(event.ends_at).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                          {t(`dashboardUI.eventSource.${event.source}`)} • {t(`dashboardUI.eventStatus.${event.status}`)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {events.length > 10 && (
                  <div className="flex items-center justify-center gap-2 mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                    {Array.from({ length: Math.ceil(events.length / 10) }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentEventsPage(page)}
                        className={`w-8 h-8 rounded-lg font-semibold transition-all ${
                          currentEventsPage === page
                            ? 'bg-indigo-600 dark:bg-indigo-500 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    <span className="text-sm text-slate-600 dark:text-slate-400 ml-2">
                      {t('dashboardUI.calendarEvent.pageOf')} {currentEventsPage} {t('common.of')} {Math.ceil(events.length / 10)}
                    </span>
                  </div>
                )}
              </>
            ) : (
              <p className="text-slate-600 dark:text-slate-400">{t('dashboardUI.calendarEvent.noEventsThisWeek')}</p>
            )}
          </div>
        </div>
      )}

      {/* Quick Add Modal - triggered by slot click */}
      {showAddModal && modalData && businessId && (
        <QuickAddModal
          businessId={businessId}
          initialDate={modalData.date}
          initialTime={modalData.time}
          onClose={() => setShowAddModal(false)}
          onEventAdded={() => {
            setShowAddModal(false);
            loadEventsForWeek();
          }}
        />
      )}

      {/* Booking Details Modal - triggered by event click */}
      {showBookingDetailsModal && selectedBooking && (
        <BookingDetailsModal
          booking={selectedBooking}
          t={t}
          onClose={() => {
            setShowBookingDetailsModal(false);
            setSelectedBooking(null);
          }}
          onStatusChange={() => {
            setShowBookingDetailsModal(false);
            setSelectedBooking(null);
            loadEventsForWeek();
          }}
        />
      )}

      {/* Hours Tab */}
      {activeTab === 'hours' && businessId && (
        <WorkingHoursTab
          businessId={businessId}
          workingHours={workingHours}
          onSave={loadBusinessAndData}
        />
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && businessId && (
        <CalendarSettingsTab businessId={businessId} />
      )}
    </div>
  );
}

// Working Hours Component
function WorkingHoursTab({ businessId, workingHours: initialHours, onSave }: any) {
  const { language } = useLanguage();
  const t = useTranslations(language);
  const [hours, setHours] = useState(initialHours);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setHours(initialHours);
    setIsEditing(false);
  }, [initialHours]);

  async function saveHours() {
    if (!businessId) {
      setMessage({ type: 'error', text: t('dashboardUI.calendarSettings.businessNotFound') });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      // Delete existing hours
      const { error: deleteErr } = await supabase
        .from('business_working_hours')
        .delete()
        .eq('business_id', businessId);

      if (deleteErr) throw deleteErr;

      // Insert new hours
      const hoursToInsert = hours
        .filter((h: any) => h.enabled)
        .map((h: any) => ({
          business_id: businessId,
          day_of_week: h.day_of_week,
          start_time: h.start_time,
          end_time: h.end_time,
          is_enabled: true,
        }));

      if (hoursToInsert.length > 0) {
        const { error: insertErr } = await supabase.from('business_working_hours').insert(hoursToInsert);

        if (insertErr) throw insertErr;
      }

      setMessage({ type: 'success', text: '✓ ' + t('dashboardUI.calendarSettings.workingHoursSaved') });
      setIsEditing(false);
      setTimeout(() => {
        if (onSave) onSave();
      }, 500);
    } catch (err: any) {
      console.error('Error saving hours:', err);
      setMessage({
        type: 'error',
        text: err?.message || t('dashboardUI.calendarSettings.failedToSaveWorkingHours'),
      });
    } finally {
      setSaving(false);
    }
  }

  // Format time for display (e.g., "09:00 AM" to "6:00 PM")
  function formatTimeDisplay(time: string) {
    const [h, m] = time.split(':');
    const hour = parseInt(h);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${m} ${period}`;
  }

  return (
    <div className="rounded-xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{t('dashboardUI.calendarSettings.weeklyWorkingHours')}</h3>
        {!isEditing && hours.length > 0 && hours.some((h: any) => h.enabled) && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100 font-medium hover:bg-slate-300 dark:hover:bg-slate-600 transition-all"
          >
            <EditIcon className="h-5 w-5" />
            {t('common.edit')}
          </button>
        )}
      </div>

      {/* Locked View - Read-only display after saving */}
      {!isEditing && hours.length > 0 && (
        <div className="space-y-3 mb-6">
          {hours.map((h: any, idx: number) => (
            <div key={idx} className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
              <div className="w-24 font-semibold text-slate-900 dark:text-slate-100">{getDayName(h.day_of_week, t)}</div>
              <div className="flex-1 text-slate-900 dark:text-slate-300 font-medium">
                {formatTimeDisplay(h.start_time)} – {formatTimeDisplay(h.end_time)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Editable View - Show when editing OR when no hours saved yet */}
      {(isEditing || hours.length === 0) && (
        <div className="space-y-3 mb-6">
          {Array.from({ length: 7 }, (_, i) => {
            const dayHours = hours.find((h: any) => h.day_of_week === i);
            const isEnabled = dayHours?.enabled || false;

            return (
              <div key={i} className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                <input
                  type="checkbox"
                  checked={isEnabled}
                  onChange={(e) => {
                    const updated = [...hours];
                    const idx = updated.findIndex((h: any) => h.day_of_week === i);
                    if (idx >= 0) {
                      updated[idx].enabled = e.target.checked;
                    } else {
                      updated.push({
                        day_of_week: i,
                        start_time: '09:00',
                        end_time: '17:00',
                        enabled: e.target.checked,
                      });
                    }
                    setHours(updated);
                  }}
                  className="w-5 h-5 rounded cursor-pointer accent-indigo-600"
                />
                <div className="w-24 font-semibold text-slate-900 dark:text-slate-100">{getDayName(i, t)}</div>

                {isEnabled && (
                  <div className="flex items-center gap-3 flex-1">
                    <input
                      type="time"
                      value={dayHours?.start_time || '09:00'}
                      onChange={(e) => {
                        const updated = [...hours];
                        const idx = updated.findIndex((h: any) => h.day_of_week === i);
                        if (idx >= 0) {
                          updated[idx].start_time = e.target.value;
                          setHours(updated);
                        }
                      }}
                      className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <span className="text-slate-700 dark:text-slate-300 font-medium">to</span>
                    <input
                      type="time"
                      value={dayHours?.end_time || '17:00'}
                      onChange={(e) => {
                        const updated = [...hours];
                        const idx = updated.findIndex((h: any) => h.day_of_week === i);
                        if (idx >= 0) {
                          updated[idx].end_time = e.target.value;
                          setHours(updated);
                        }
                      }}
                      className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {message && (
        <div
          className={`p-4 rounded-lg mb-4 ${
            message.type === 'success'
              ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800'
          }`}
        >
          {message.text}
        </div>
      )}

      {isEditing && (
        <div className="flex gap-3">
          <button
            onClick={saveHours}
            disabled={saving}
            className="flex-1 px-4 py-3 rounded-lg bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold hover:shadow-lg transition-all disabled:opacity-50"
          >
            {saving ? '⏳ ' + t('common.saving') : '✓ ' + t('dashboardUI.calendarSettings.saveWorkingHours')}
          </button>
          <button
            onClick={() => setIsEditing(false)}
            disabled={saving}
            className="flex-1 px-4 py-3 rounded-lg bg-slate-300 dark:bg-slate-700 text-slate-900 dark:text-slate-100 font-semibold hover:bg-slate-400 dark:hover:bg-slate-600 transition-all disabled:opacity-50"
          >
            {t('common.cancel')}
          </button>
        </div>
      )}
    </div>
  );
}

// Calendar Settings Component
function CalendarSettingsTab({ businessId }: any) {
  const { language } = useLanguage();
  const t = useTranslations(language);
  const [settings, setSettings] = useState<CalendarSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const timezones = getTimezoneList();

  useEffect(() => {
    loadSettings();
  }, [businessId]);

  async function loadSettings() {
    if (!businessId) return;

    try {
      let { data: existing } = await supabase
        .from('business_calendar_settings')
        .select('*')
        .eq('business_id', businessId)
        .single();

      if (!existing) {
        const defaults = {
          business_id: businessId,
          timezone: 'Africa/Casablanca',
          slot_interval_minutes: 30,
          buffer_minutes: 0,
          min_notice_hours: 2,
          max_booking_days_ahead: 30,
        };
        await supabase.from('business_calendar_settings').insert(defaults);
        existing = defaults;
      }

      setSettings(existing);
    } catch (err) {
      console.error('Error loading settings:', err);
    } finally {
      setLoading(false);
    }
  }

  async function saveSettings() {
    if (!businessId || !settings) return;

    setSaving(true);
    setMessage(null);

    try {
      // Use upsert to avoid constraint conflicts
      const { error: upsertErr } = await supabase
        .from('business_calendar_settings')
        .upsert({
          business_id: businessId,
          ...settings,
        }, {
          onConflict: 'business_id'
        });

      if (upsertErr) throw upsertErr;

      setMessage({ type: 'success', text: '✓ ' + t('dashboardUI.calendarSettings.settingsSaved') });
    } catch (err: any) {
      console.error('Error saving settings:', err);
      setMessage({
        type: 'error',
        text: err?.message || t('dashboardUI.calendarSettings.failedToSaveSettings'),
      });
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="text-center py-12 text-slate-600 dark:text-slate-400">{t('dashboardUI.calendarSettings.loadingSettings')}</div>;
  if (!settings) return <div className="text-center py-12 text-slate-600 dark:text-slate-400">{t('dashboardUI.calendarSettings.noSettingsFound')}</div>;

  return (
    <div className="rounded-xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 shadow-sm p-6 max-w-2xl">
      <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-6">{t('dashboardUI.calendarSettings.calendarSettings')}</h3>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">{t('dashboardUI.calendarSettings.timezone')}</label>
          <select
            value={settings.timezone}
            onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            {timezones.map((tz) => (
              <option key={tz} value={tz} className="text-slate-900 dark:text-slate-100">
                {tz}
              </option>
            ))}
          </select>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t('dashboardUI.calendarSettings.currentTimezone')}: {settings.timezone}</p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">{t('dashboardUI.calendarSettings.slotInterval')}</label>
          <input
            type="number"
            min="5"
            max="120"
            value={settings.slot_interval_minutes}
            onChange={(e) =>
              setSettings({ ...settings, slot_interval_minutes: parseInt(e.target.value) })
            }
            className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-white/10 bg-white dark:bg-slate-900/50 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t('dashboardUI.calendarSettings.slotIntervalHelp')}</p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
            {t('dashboardUI.calendarSettings.bufferBetweenBookings')}
          </label>
          <input
            type="number"
            min="0"
            max="120"
            value={settings.buffer_minutes}
            onChange={(e) => setSettings({ ...settings, buffer_minutes: parseInt(e.target.value) })}
            className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-white/10 bg-white dark:bg-slate-900/50 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t('dashboardUI.calendarSettings.bufferHelp')}</p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">{t('dashboardUI.calendarSettings.minimumNotice')}</label>
          <input
            type="number"
            min="0"
            max="168"
            value={settings.min_notice_hours}
            onChange={(e) =>
              setSettings({ ...settings, min_notice_hours: parseInt(e.target.value) })
            }
            className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-white/10 bg-white dark:bg-slate-900/50 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t('dashboardUI.calendarSettings.minimumNoticeHelp')}</p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">{t('dashboardUI.calendarSettings.maxBookingDaysAhead')}</label>
          <input
            type="number"
            min="1"
            max="365"
            value={settings.max_booking_days_ahead}
            onChange={(e) =>
              setSettings({ ...settings, max_booking_days_ahead: parseInt(e.target.value) })
            }
            className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-white/10 bg-white dark:bg-slate-900/50 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t('dashboardUI.calendarSettings.maxBookingDaysAheadHelp')}</p>
        </div>
      </div>

      {message && (
        <div
          className={`p-4 rounded-lg mt-6 ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      <button
        onClick={saveSettings}
        disabled={saving}
        className="mt-6 w-full px-4 py-3 rounded-lg bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold hover:shadow-lg transition-all disabled:opacity-50"
      >
        {saving ? '⏳ ' + t('common.saving') : '✓ ' + t('dashboardUI.calendarSettings.saveSettings')}
      </button>
    </div>
  );
}


// Quick Add Modal - opened by clicking a calendar slot
function QuickAddModal({ businessId, initialDate, initialTime, onClose, onEventAdded }: any) {
  const { language } = useLanguage();
  const t = useTranslations(language);
  const [title, setTitle] = useState('');
  const [eventType, setEventType] = useState<'external' | 'manual' | 'break' | 'unavailable'>('manual');
  const [startDate, setStartDate] = useState(initialDate);
  const [startTime, setStartTime] = useState(initialTime);
  const [endDate, setEndDate] = useState(initialDate);
  const [endTime, setEndTime] = useState(() => {
    // Default end time: 30 minutes after start time
    const start = new Date(`${initialDate}T${initialTime}`);
    start.setMinutes(start.getMinutes() + 30);
    return `${String(start.getHours()).padStart(2, '0')}:${String(start.getMinutes()).padStart(2, '0')}`;
  });
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  async function handleAddEvent(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    if (!title.trim() || !startDate || !endDate) {
      setMessage({ type: 'error', text: t('dashboardUI.calendarEvent.fillAllFields') });
      return;
    }

    const startDateTime = new Date(`${startDate}T${startTime}`);
    const endDateTime = new Date(`${endDate}T${endTime}`);

    if (startDateTime >= endDateTime) {
      setMessage({ type: 'error', text: t('dashboardUI.calendarEvent.endTimeAfterStart') });
      return;
    }

    setSaving(true);

    try {
      const { error } = await supabase.from('calendar_events').insert({
        business_id: businessId,
        title: title.trim(),
        source: eventType,
        starts_at: startDateTime.toISOString(),
        ends_at: endDateTime.toISOString(),
        notes: notes.trim() || null,
        status: 'busy',
      });

      if (error) throw error;

      setMessage({
        type: 'success',
        text: `✓ ${t('dashboardUI.calendarEvent.eventAdded')} "${title}"`,
      });

      setTimeout(() => {
        if (onEventAdded) onEventAdded();
      }, 500);
    } catch (err: any) {
      console.error('Error adding event:', err);
      setMessage({
        type: 'error',
        text: err?.message || t('dashboardUI.calendarEvent.failedToAddEvent'),
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70 backdrop-blur-sm"
      onClick={(e) => {
        // Close only if clicking the backdrop itself, not the modal content
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">{t('dashboardUI.calendarEvent.addEvent')}</h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 p-1 rounded-lg transition-all"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleAddEvent} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">{t('dashboardUI.calendarEvent.title')} *</label>
            <input
              type="text"
              placeholder={t('dashboardUI.calendarEvent.titlePlaceholder')}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">{t('dashboardUI.calendarEvent.type')}</label>
            <select
              value={eventType}
              onChange={(e) => setEventType(e.target.value as any)}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="manual">{t('dashboardUI.calendarEvent.typeManual')}</option>
              <option value="external">{t('dashboardUI.calendarEvent.typeExternal')}</option>
              <option value="break">{t('dashboardUI.calendarEvent.typeBreak')}</option>
              <option value="unavailable">{t('dashboardUI.calendarEvent.typeUnavailable')}</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">{t('dashboardUI.calendarEvent.startDate')}</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">{t('dashboardUI.calendarEvent.startTime')}</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">{t('dashboardUI.calendarEvent.endDate')}</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">{t('dashboardUI.calendarEvent.endTime')}</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">{t('dashboardUI.calendarEvent.notes')}</label>
            <textarea
              placeholder={t('dashboardUI.calendarEvent.notesPlaceholder')}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
              rows={2}
            />
          </div>

          {message && (
            <div
              className={`p-3 rounded-lg text-sm ${
                message.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-700'
                  : 'bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-700'
              }`}
            >
              {message.text}
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold hover:shadow-lg transition-all disabled:opacity-50"
            >
              {saving ? '⏳ ' + t('dashboardUI.calendarEvent.adding') : '✓ ' + t('dashboardUI.calendarEvent.addEvent')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Booking Details Modal Component - Full Edit Mode
function BookingDetailsModal({ booking, t, onClose, onStatusChange }: any) {
  const [status, setStatus] = useState(booking.status);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Edit mode states
  const [isEditing, setIsEditing] = useState(false);
  const [editDate, setEditDate] = useState(booking.requested_date);
  const [editTime, setEditTime] = useState(booking.requested_time);
  const [availableServices, setAvailableServices] = useState<any[]>([]);
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>(() => {
    if (booking.services_json) {
      try {
        return JSON.parse(booking.services_json).map((s: any) => s.id);
      } catch {
        return [];
      }
    }
    return booking.service_id ? [booking.service_id] : [];
  });
  const [loadingServices, setLoadingServices] = useState(false);

  // Load available services when entering edit mode
  useEffect(() => {
    if (isEditing && availableServices.length === 0) {
      loadServices();
    }
  }, [isEditing]);

  async function loadServices() {
    setLoadingServices(true);
    try {
      const { data } = await supabase
        .from('services')
        .select('id, name, duration_minutes, price')
        .eq('business_id', booking.business_id)
        .eq('is_active', true);
      setAvailableServices(data || []);
    } catch (err) {
      console.error('Error loading services:', err);
    } finally {
      setLoadingServices(false);
    }
  }

  const selectedServices = selectedServiceIds
    .map(id => availableServices.find(s => s.id === id))
    .filter((s): s is any => !!s);

  const totalDuration = selectedServices.reduce((sum, s) => sum + (s.duration_minutes || 0), 0);

  async function updateStatus() {
    setUpdating(true);
    setMessage(null);

    try {
      const { error } = await supabase
        .from('booking_requests')
        .update({ status })
        .eq('id', booking.id);

      if (error) throw error;

      // Create in-app notification
      const statusEmojis: { [key: string]: string } = {
        accepted: "✅",
        pending: "⏳",
        completed: "🎉",
        refused: "❌"
      };

      const statusTexts: { [key: string]: string } = {
        accepted: t('dashboardUI.eventStatus.accepted'),
        pending: t('dashboardUI.eventStatus.pending'),
        completed: t('dashboardUI.eventStatus.completed'),
        refused: t('dashboardUI.eventStatus.refused')
      };

      const statusEmoji = statusEmojis[status] || "🔔";
      const statusText = statusTexts[status] || status;

      await fetch("/api/notifications/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId: booking.business_id,
          type: "update",
          title: `Booking Status Updated ${statusEmoji}`,
          message: `${booking.client_name}'s booking for ${booking.service} has been ${statusText}`,
          data: {
            bookingId: booking.id,
            newStatus: status,
            clientName: booking.client_name,
            service: booking.service,
          },
        }),
      }).catch(err => console.error("Failed to create in-app notification:", err));

      setMessage({ type: 'success', text: t('dashboardUI.bookingDetailsModal.statusUpdatedSuccessfully') });
      setTimeout(() => {
        if (onStatusChange) onStatusChange();
      }, 500);
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.message || t('dashboardUI.bookingDetailsModal.failedToUpdateStatus') });
    } finally {
      setUpdating(false);
    }
  }

  async function handleSaveEdit() {
    setUpdating(true);
    setMessage(null);

    try {
      if (selectedServices.length === 0) {
        throw new Error(t('dashboardUI.bookingDetailsModal.selectAtLeastOneService'));
      }

      // Calculate new end time
      const startDate = new Date(`${editDate}T${editTime}`);
      const endDate = new Date(startDate.getTime() + totalDuration * 60000);

      const serviceNames = selectedServices.map(s => s.name).join(", ");
      const servicesJson = JSON.stringify(selectedServices.map(s => ({
        id: s.id,
        name: s.name,
        duration_minutes: s.duration_minutes,
        price: s.price,
      })));

      const { error } = await supabase
        .from('booking_requests')
        .update({
          requested_date: editDate,
          requested_time: editTime,
          service: serviceNames,
          services_json: servicesJson,
          duration_minutes: totalDuration,
          starts_at: startDate.toISOString(),
          ends_at: endDate.toISOString(),
        })
        .eq('id', booking.id);

      if (error) throw error;

      setMessage({ type: 'success', text: t('dashboardUI.bookingDetailsModal.bookingUpdatedSuccessfully') });
      setIsEditing(false);
      
      setTimeout(() => {
        if (onStatusChange) onStatusChange();
      }, 500);
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.message || t('dashboardUI.bookingDetailsModal.failedToSaveChanges') });
    } finally {
      setUpdating(false);
    }
  }

  const getStatusColor = (stat: string) => {
    switch (stat) {
      case 'pending':
        return 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-700';
      case 'accepted':
        return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700';
      case 'completed':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border border-blue-300 dark:border-blue-700';
      case 'refused':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border border-red-300 dark:border-red-700';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200';
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center p-4 z-50"
      onClick={(e) => {
        // Close only if clicking the backdrop itself, not the modal content
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t('dashboardUI.bookingDetailsModal.title')}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* Client Info */}
          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">{t('dashboardUI.bookingDetailsModal.clientNameLabel')}</label>
            <p className="text-lg font-semibold text-slate-900 dark:text-slate-100 mt-1">{booking.client_name}</p>
          </div>

          {/* Phone */}
          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">{t('dashboardUI.bookingDetailsModal.phoneLabel')}</label>
            <p className="text-sm font-mono text-slate-700 dark:text-slate-300 mt-1">{booking.client_phone}</p>
          </div>

          {/* Email */}
          {booking.client_email && (
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">{t('dashboardUI.bookingDetailsModal.emailLabel')}</label>
              <p className="text-sm font-mono text-slate-700 dark:text-slate-300 mt-1">{booking.client_email}</p>
            </div>
          )}

          {/* Services - Editable */}
          <div className="border-y border-slate-200 dark:border-slate-700 py-4">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">{t('dashboardUI.bookingDetailsModal.servicesLabel')}</label>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  {t('dashboardUI.bookingDetailsModal.edit')}
                </button>
              )}
            </div>

            {isEditing && loadingServices ? (
              <p className="text-sm text-slate-600 dark:text-slate-400">{t('dashboardUI.bookingDetailsModal.loadingServices')}</p>
            ) : isEditing ? (
              <div className="space-y-2">
                {availableServices.map(service => (
                  <label key={service.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedServiceIds.includes(service.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedServiceIds([...selectedServiceIds, service.id]);
                        } else {
                          setSelectedServiceIds(selectedServiceIds.filter(id => id !== service.id));
                        }
                      }}
                      className="w-4 h-4 accent-indigo-600 cursor-pointer"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{service.name}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{service.duration_minutes} min</div>
                    </div>
                  </label>
                ))}
              </div>
            ) : (
              <div className="space-y-1">
                {booking.services_json ? (
                  <>
                    {JSON.parse(booking.services_json).map((svc: any, idx: number) => (
                      <div key={idx} className="text-sm text-slate-700 dark:text-slate-300">
                        {svc.name} <span className="text-slate-500 dark:text-slate-400">({svc.duration_minutes} min)</span>
                      </div>
                    ))}
                  </>
                ) : (
                  <p className="text-sm text-slate-700 dark:text-slate-300">{booking.service}</p>
                )}
              </div>
            )}

            {isEditing && (
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                Total: {totalDuration < 60 ? `${totalDuration} min` : `${Math.floor(totalDuration / 60)}h ${totalDuration % 60}m`}
              </p>
            )}
          </div>

          {/* Date & Time - Editable */}
          {isEditing ? (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide block mb-1">{t('dashboardUI.bookingDetailsModal.date')}</label>
                <input
                  type="date"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide block mb-1">{t('dashboardUI.bookingDetailsModal.time')}</label>
                <input
                  type="time"
                  value={editTime}
                  onChange={(e) => setEditTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">{t('dashboardUI.bookingDetailsModal.date')}</label>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-1">{booking.requested_date}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">{t('dashboardUI.bookingDetailsModal.time')}</label>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-1">
                  {new Date(booking.starts_at).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          )}

          {/* Duration Display */}
          {!isEditing && (
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">{t('dashboardUI.bookingDetailsModal.duration')}</label>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-1">
                {booking.duration_minutes < 60
                  ? `${booking.duration_minutes} min`
                  : `${Math.floor(booking.duration_minutes / 60)}h ${booking.duration_minutes % 60}m`}
              </p>
            </div>
          )}

          {/* Message */}
          {booking.message && !isEditing && (
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">{t('dashboardUI.bookingDetailsModal.message')}</label>
              <p className="text-sm text-slate-700 dark:text-slate-300 mt-1 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">{booking.message}</p>
            </div>
          )}

          {/* Status Update - Only when not editing */}
          {!isEditing && (
            <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide block mb-2">{t('dashboardUI.bookingDetailsModal.updateStatus')}</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 ${getStatusColor(status)}`}
              >
                <option value="pending">{t('dashboardUI.eventStatus.pending')}</option>
                <option value="accepted">{t('dashboardUI.eventStatus.accepted')}</option>
                <option value="completed">{t('dashboardUI.eventStatus.completed')}</option>
                <option value="refused">{t('dashboardUI.eventStatus.refused')}</option>
              </select>
            </div>
          )}

          {message && (
            <div
              className={`p-3 rounded-lg text-sm font-medium ${
                message.type === 'success'
                  ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200'
                  : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={isEditing ? () => setIsEditing(false) : onClose}
              className="flex-1 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
            >
              {isEditing ? t('dashboardUI.bookingDetailsModal.cancel') : t('dashboardUI.bookingDetailsModal.close')}
            </button>
            {isEditing ? (
              <button
                onClick={handleSaveEdit}
                disabled={updating}
                className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold hover:shadow-lg transition-all disabled:opacity-50"
              >
                {updating ? '⏳ ' + t('dashboardUI.bookingDetailsModal.saving') : '✓ ' + t('dashboardUI.bookingDetailsModal.saveChanges')}
              </button>
            ) : (
              <button
                onClick={updateStatus}
                disabled={updating || status === booking.status}
                className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold hover:shadow-lg transition-all disabled:opacity-50"
              >
                {updating ? '⏳ ' + t('dashboardUI.bookingDetailsModal.saving') : '✓ ' + t('dashboardUI.bookingDetailsModal.saveStatus')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}




