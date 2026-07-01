'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabase/browserClient';

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

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
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [business, setBusiness] = useState<any>(null);
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [currentWeek, setCurrentWeek] = useState(getWeekStart(new Date()));
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [workingHours, setWorkingHours] = useState<BusinessHours[]>([]);
  const [settings, setSettings] = useState<CalendarSettings | null>(null);
  const [activeTab, setActiveTab] = useState<'calendar' | 'hours' | 'settings'>('calendar');
  
  // Modal state for click-to-add
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalData, setModalData] = useState<{ date: string; time: string } | null>(null);

  // Fetch business and initial data
  useEffect(() => {
    loadBusinessAndData();
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

      setWorkingHours(hours || []);

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

      const { data: events } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('business_id', businessId)
        .gte('starts_at', currentWeek.toISOString())
        .lt('starts_at', weekEnd.toISOString())
        .order('starts_at');

      setEvents(events || []);
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

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(currentWeek);
    date.setDate(date.getDate() + i);
    return date;
  });

  if (loading) {
    return <div className="text-center py-12">Loading calendar...</div>;
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">Calendar</h1>
        <p className="text-slate-600 dark:text-slate-400">Manage your schedule and availability</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {(['calendar', 'hours', 'settings'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === tab
                ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white'
                : 'bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            {tab === 'calendar' && '📅 Calendar'}
            {tab === 'hours' && '⏰ Hours'}
            {tab === 'settings' && '⚙️ Settings'}

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
                  ← Prev
                </button>
                <button
                  onClick={goToToday}
                  className="px-4 py-2 rounded-lg bg-white/60 dark:bg-slate-800 border border-white/60 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-white/80 dark:hover:bg-slate-700 transition-all"
                >
                  Today
                </button>
                <button
                  onClick={goToNextWeek}
                  className="px-4 py-2 rounded-lg bg-white/60 dark:bg-slate-800 border border-white/60 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-white/80 dark:hover:bg-slate-700 transition-all"
                >
                  Next →
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
                        {DAYS_OF_WEEK[date.getDay()]}
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
                                className={`text-xs rounded px-2 py-1 mb-1 text-white truncate font-semibold ${getEventColor(
                                  event
                                )}`}
                                title={`${event.title} - ${new Date(event.starts_at).toLocaleTimeString('en-US', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })} to ${new Date(event.ends_at).toLocaleTimeString('en-US', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}`}
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
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">Events This Week</h3>
            {events.length > 0 ? (
              <div className="space-y-2">
                {events.map((event) => (
                  <div
                    key={event.id}
                    className={`flex items-start gap-3 p-3 rounded-lg border-l-4 ${getEventColor(
                      event
                    )} bg-white/50 dark:bg-slate-800/30`}
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
                        {event.source} • {event.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-600 dark:text-slate-400">No events this week</p>
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
      setMessage({ type: 'error', text: 'Business ID not found' });
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

      setMessage({ type: 'success', text: '✓ Working hours saved successfully' });
      setIsEditing(false);
      setTimeout(() => {
        if (onSave) onSave();
      }, 500);
    } catch (err: any) {
      console.error('Error saving hours:', err);
      setMessage({
        type: 'error',
        text: err?.message || 'Failed to save working hours. Please try again.',
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
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Weekly Working Hours</h3>
        {!isEditing && hours.length > 0 && (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100 font-medium hover:bg-slate-300 dark:hover:bg-slate-600 transition-all"
          >
            ✏️ Edit
          </button>
        )}
      </div>

      {/* Locked View - Read-only display after saving */}
      {!isEditing && hours.length > 0 && (
        <div className="space-y-3 mb-6">
          {hours.map((h: any, idx: number) => (
            <div key={idx} className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
              <div className="w-24 font-semibold text-slate-900 dark:text-slate-100">{DAYS_OF_WEEK[h.day_of_week]}</div>
              <div className="flex-1 text-slate-900 dark:text-slate-300 font-medium">
                {formatTimeDisplay(h.start_time)} – {formatTimeDisplay(h.end_time)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Editable View */}
      {isEditing && (
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
                <div className="w-24 font-semibold text-slate-900 dark:text-slate-100">{DAYS_OF_WEEK[i]}</div>

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
            {saving ? '⏳ Saving...' : '✓ Save Working Hours'}
          </button>
          <button
            onClick={() => setIsEditing(false)}
            disabled={saving}
            className="flex-1 px-4 py-3 rounded-lg bg-slate-300 dark:bg-slate-700 text-slate-900 dark:text-slate-100 font-semibold hover:bg-slate-400 dark:hover:bg-slate-600 transition-all disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}

// Calendar Settings Component
function CalendarSettingsTab({ businessId }: any) {
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
      // Delete existing settings for this business
      const { error: deleteErr } = await supabase
        .from('business_calendar_settings')
        .delete()
        .eq('business_id', businessId);

      if (deleteErr) throw deleteErr;

      // Insert new settings
      const { error: insertErr } = await supabase
        .from('business_calendar_settings')
        .insert({
          business_id: businessId,
          ...settings,
        });

      if (insertErr) throw insertErr;

      setMessage({ type: 'success', text: '✓ Settings saved successfully' });
    } catch (err: any) {
      console.error('Error saving settings:', err);
      setMessage({
        type: 'error',
        text: err?.message || 'Failed to save settings. Please try again.',
      });
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="text-center py-12 text-slate-600 dark:text-slate-400">Loading settings...</div>;
  if (!settings) return <div className="text-center py-12 text-slate-600 dark:text-slate-400">No settings found</div>;

  return (
    <div className="rounded-xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 shadow-sm p-6 max-w-2xl">
      <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-6">Calendar Settings</h3>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">Timezone</label>
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
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Current: {settings.timezone}</p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-900 mb-2">Slot Interval (minutes)</label>
          <input
            type="number"
            min="5"
            max="120"
            value={settings.slot_interval_minutes}
            onChange={(e) =>
              setSettings({ ...settings, slot_interval_minutes: parseInt(e.target.value) })
            }
            className="w-full px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <p className="text-xs text-slate-500 mt-1">How often slots are offered (e.g., 30 = every 30 min)</p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-900 mb-2">
            Buffer Between Bookings (minutes)
          </label>
          <input
            type="number"
            min="0"
            max="120"
            value={settings.buffer_minutes}
            onChange={(e) => setSettings({ ...settings, buffer_minutes: parseInt(e.target.value) })}
            className="w-full px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <p className="text-xs text-slate-500 mt-1">Break time after each booking</p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-900 mb-2">Minimum Notice (hours)</label>
          <input
            type="number"
            min="0"
            max="168"
            value={settings.min_notice_hours}
            onChange={(e) =>
              setSettings({ ...settings, min_notice_hours: parseInt(e.target.value) })
            }
            className="w-full px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <p className="text-xs text-slate-500 mt-1">How far in advance clients must book</p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-900 mb-2">Max Booking Days Ahead</label>
          <input
            type="number"
            min="1"
            max="365"
            value={settings.max_booking_days_ahead}
            onChange={(e) =>
              setSettings({ ...settings, max_booking_days_ahead: parseInt(e.target.value) })
            }
            className="w-full px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <p className="text-xs text-slate-500 mt-1">How many days ahead can be booked</p>
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
        {saving ? '⏳ Saving...' : '✓ Save Settings'}
      </button>
    </div>
  );
}


// Quick Add Modal - opened by clicking a calendar slot
function QuickAddModal({ businessId, initialDate, initialTime, onClose, onEventAdded }: any) {
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
      setMessage({ type: 'error', text: 'Please fill in all required fields' });
      return;
    }

    const startDateTime = new Date(`${startDate}T${startTime}`);
    const endDateTime = new Date(`${endDate}T${endTime}`);

    if (startDateTime >= endDateTime) {
      setMessage({ type: 'error', text: 'End time must be after start time' });
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
        text: `✓ Event "${title}" added successfully`,
      });

      setTimeout(() => {
        if (onEventAdded) onEventAdded();
      }, 500);
    } catch (err: any) {
      console.error('Error adding event:', err);
      setMessage({
        type: 'error',
        text: err?.message || 'Failed to add event. Please try again.',
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Add Event</h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 p-1 rounded-lg transition-all"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleAddEvent} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">Title *</label>
            <input
              type="text"
              placeholder="e.g., Lunch break, External booking"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
              className="w-full px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">Type</label>
            <select
              value={eventType}
              onChange={(e) => setEventType(e.target.value as any)}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="manual">Manual Reservation</option>
              <option value="external">External Booking</option>
              <option value="break">Break</option>
              <option value="unavailable">Unavailable</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">Start Time</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">End Time</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">Notes (optional)</label>
            <textarea
              placeholder="Add details..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
              rows={2}
            />
          </div>

          {message && (
            <div
              className={`p-3 rounded-lg text-sm ${
                message.type === 'success'
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {message.text}
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 font-semibold hover:bg-slate-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold hover:shadow-lg transition-all disabled:opacity-50"
            >
              {saving ? '⏳ Adding...' : '✓ Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}



