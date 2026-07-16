import { createAdminClient } from '@/lib/supabase/admin';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    // Check if service role key is loaded
    const hasServiceRole = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
    console.log('[AVAILABILITY] SERVICE ROLE LOADED:', hasServiceRole);

    if (!hasServiceRole) {
      console.error('[AVAILABILITY] CRITICAL: SUPABASE_SERVICE_ROLE_KEY is not set in environment');
      console.error('[AVAILABILITY] Make sure .env.local contains: SUPABASE_SERVICE_ROLE_KEY=<your_key>');
      console.error('[AVAILABILITY] Then restart dev server: Ctrl+C, then npm run dev');
    }

    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    const serviceId = searchParams.get('serviceId');
    const dateStr = searchParams.get('date');
    const debug = searchParams.get('debug') === '1';

    console.log(`[AVAILABILITY] Request: slug=${slug}, serviceId=${serviceId}, date=${dateStr}, debug=${debug}`);

    // Initialize debug object
    const debugInfo: any = {
      received: { slug, serviceId, date: dateStr },
      businessFound: false,
      serviceFound: false,
      settingsUsed: null,
      selectedDate: null,
      dayOfWeek: null,
      workingHoursFound: 0,
      workingHours: [],
      blockingEventsFound: 0,
      blockingEvents: [],
      slotsBeforeBlocking: [],
      slotsAfterBlocking: [],
      reason: '',
    };

    if (!slug || !serviceId || !dateStr) {
      debugInfo.reason = 'Missing required parameters';
      if (debug) {
        return NextResponse.json({
          slots: [],
          debug: debugInfo,
        });
      }
      return NextResponse.json(
        { error: 'Missing required parameters: slug, serviceId, date' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Get business by slug
    const { data: business, error: bizError } = await supabase
      .from('businesses')
      .select('id')
      .eq('slug', slug)
      .single();

    if (!business) {
      console.log(`[AVAILABILITY] Business not found: ${slug}, error: ${bizError?.message}`);
      debugInfo.reason = `Business not found for slug: ${slug}`;
      if (debug) {
        return NextResponse.json({
          slots: [],
          debug: debugInfo,
        });
      }
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    debugInfo.businessFound = true;
    debugInfo.businessId = business.id;
    console.log(`[AVAILABILITY] Business found: ${business.id}`);

    // Get service with full details
    const { data: service, error: svcError } = await supabase
      .from('services')
      .select('id, name, duration_minutes, is_active')
      .eq('id', serviceId)
      .eq('business_id', business.id)
      .single();

    if (!service) {
      console.log(`[AVAILABILITY] Service not found: ${serviceId}, error: ${svcError?.message}`);
      debugInfo.reason = `Service not found for id: ${serviceId}`;
      if (debug) {
        return NextResponse.json({
          slots: [],
          debug: debugInfo,
        });
      }
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 400 }
      );
    }

    if (!service.duration_minutes || service.duration_minutes === 0) {
      console.log(`[AVAILABILITY] Service has no duration: ${serviceId}`);
      debugInfo.reason = 'Service has no duration set';
      debugInfo.service = service;
      if (debug) {
        return NextResponse.json({
          slots: [],
          debug: debugInfo,
        });
      }
      return NextResponse.json(
        { error: 'This service is not available for online booking yet.' },
        { status: 400 }
      );
    }

    debugInfo.serviceFound = true;
    debugInfo.service = service;
    console.log(`[AVAILABILITY] Service found: ${service.name}, ${service.duration_minutes} min duration`);

    // Get calendar settings (with defaults)
    let { data: settings } = await supabase
      .from('business_calendar_settings')
      .select('*')
      .eq('business_id', business.id)
      .single();

    if (!settings) {
      settings = {
        timezone: 'Africa/Casablanca',
        slot_interval_minutes: 30,
        buffer_minutes: 0,
        min_notice_hours: 0,
        max_booking_days_ahead: 30,
      };
      console.log('[AVAILABILITY] Using default settings');
    }

    debugInfo.settingsUsed = {
      timezone: settings.timezone,
      slot_interval_minutes: settings.slot_interval_minutes,
      buffer_minutes: settings.buffer_minutes,
      min_notice_hours: settings.min_notice_hours,
      max_booking_days_ahead: settings.max_booking_days_ahead,
    };

    console.log(`[AVAILABILITY] Settings: timezone=${settings.timezone}, interval=${settings.slot_interval_minutes}min, buffer=${settings.buffer_minutes}min, notice=${settings.min_notice_hours}h, max_days=${settings.max_booking_days_ahead}`);

    // Parse the requested date carefully (avoid timezone shifts)
    const [year, month, day] = dateStr.split('-').map(Number);
    const selectedDate = new Date(year, month - 1, day);
    selectedDate.setHours(0, 0, 0, 0);
    const dayOfWeek = selectedDate.getDay();

    debugInfo.selectedDate = selectedDate.toISOString().split('T')[0];
    debugInfo.dayOfWeek = dayOfWeek;

    console.log(`[AVAILABILITY] Selected date: ${selectedDate.toDateString()}, day of week: ${dayOfWeek} (0=Sun, 6=Sat)`);

    // Check if date is within max booking days ahead
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const maxDate = new Date(today);
    maxDate.setDate(maxDate.getDate() + settings.max_booking_days_ahead);

    console.log(`[AVAILABILITY] Date range: today=${today.toDateString()}, maxDate=${maxDate.toDateString()}, selected=${selectedDate.toDateString()}`);

    if (selectedDate < today || selectedDate > maxDate) {
      console.log(`[AVAILABILITY] Date out of range`);
      debugInfo.reason = `Date ${selectedDate.toDateString()} is out of range (${today.toDateString()} to ${maxDate.toDateString()})`;
      if (debug) {
        return NextResponse.json({
          slots: [],
          debug: debugInfo,
        });
      }
      return NextResponse.json({ slots: [] });
    }

    // Get working hours for this day
    const { data: workingHours, error: whError } = await supabase
      .from('business_working_hours')
      .select('*')
      .eq('business_id', business.id)
      .eq('day_of_week', dayOfWeek)
      .eq('is_enabled', true)
      .order('start_time');

    debugInfo.workingHoursFound = workingHours?.length || 0;
    if (workingHours && workingHours.length > 0) {
      debugInfo.workingHours = workingHours.map(wh => ({
        day_of_week: wh.day_of_week,
        start_time: wh.start_time,
        end_time: wh.end_time,
        is_enabled: wh.is_enabled,
      }));
    }

    if (!workingHours || workingHours.length === 0) {
      console.log(`[AVAILABILITY] No working hours for day ${dayOfWeek}, error: ${whError?.message}`);
      debugInfo.reason = `No working hours found for day ${dayOfWeek}`;
      if (debug) {
        return NextResponse.json({
          slots: [],
          debug: debugInfo,
        });
      }
      return NextResponse.json({ slots: [] });
    }

    console.log(`[AVAILABILITY] Found ${workingHours.length} working hour(s) for day ${dayOfWeek}`);

    // Get all calendar events for this date
    const dayStart = new Date(selectedDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(selectedDate);
    dayEnd.setHours(23, 59, 59, 999);

    const { data: events = [], error: evError } = await supabase
      .from('calendar_events')
      .select('starts_at, ends_at, status')
      .eq('business_id', business.id)
      .gte('ends_at', dayStart.toISOString())
      .lte('starts_at', dayEnd.toISOString())
      .in('status', ['busy', 'tentative']);

    // Also get booking requests that are not refused or completed
    const { data: bookings = [], error: bookingError } = await supabase
      .from('booking_requests')
      .select('starts_at, ends_at, status')
      .eq('business_id', business.id)
      .gte('ends_at', dayStart.toISOString())
      .lte('starts_at', dayEnd.toISOString())
      .in('status', ['pending', 'accepted']);

    const blockingEvents = [
      ...(events || []).filter(e => e.status === 'busy' || e.status === 'tentative'),
      ...(bookings || []).filter(b => b.starts_at && b.ends_at), // Include all non-refused/completed bookings
    ];
    
    debugInfo.blockingEventsFound = blockingEvents.length;
    if (blockingEvents.length > 0) {
      debugInfo.blockingEvents = blockingEvents.map(e => ({
        starts_at: e.starts_at,
        ends_at: e.ends_at,
        status: (e as any).status || 'booking',
      }));
    }

    console.log(`[AVAILABILITY] Found ${blockingEvents.length} blocking event(s) on ${dateStr}`);

    // Generate available slots
    const slotsBeforeBlocking: any[] = [];
    const availableSlots: any[] = [];
    const serviceDuration = service.duration_minutes;
    const slotInterval = settings.slot_interval_minutes;
    const buffer = settings.buffer_minutes;

    let totalSlotsGenerated = 0;
    let slotsBlocked = 0;

    for (const workHour of workingHours) {
      // Parse time carefully
      const [startHourStr, startMinStr] = workHour.start_time.split(':');
      const [endHourStr, endMinStr] = workHour.end_time.split(':');

      const startHour = parseInt(startHourStr);
      const startMin = parseInt(startMinStr);
      const endHour = parseInt(endHourStr);
      const endMin = parseInt(endMinStr);

      let slotStart = new Date(selectedDate);
      slotStart.setHours(startHour, startMin, 0, 0);

      const workingEnd = new Date(selectedDate);
      workingEnd.setHours(endHour, endMin, 0, 0);

      console.log(`[AVAILABILITY] Processing work hours: ${workHour.start_time}–${workHour.end_time}`);

      while (slotStart < workingEnd) {
        const slotEnd = new Date(slotStart.getTime() + serviceDuration * 60 * 1000);
        const bufferEnd = new Date(slotEnd.getTime() + buffer * 60 * 1000);

        // Stop if slot end exceeds working hours
        if (slotEnd > workingEnd) {
          console.log(`[AVAILABILITY] Slot ${slotStart.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} exceeds working hours, stopping`);
          break;
        }

        totalSlotsGenerated++;

        const slotLabel = slotStart.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

        // Check if slot overlaps with any blocking events
        const isAvailable = !blockingEvents.some((event) => {
          const eventStart = new Date(event.starts_at);
          const eventEnd = new Date(event.ends_at);
          const overlaps = slotStart < eventEnd && bufferEnd > eventStart;
          if (overlaps) {
            console.log(`[AVAILABILITY] Slot ${slotLabel} blocked by event ${eventStart.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}–${eventEnd.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`);
          }
          return overlaps;
        });

        slotsBeforeBlocking.push({
          label: slotLabel,
          starts_at: slotStart.toISOString(),
          ends_at: slotEnd.toISOString(),
        });

        if (isAvailable) {
          availableSlots.push({
            label: slotLabel,
            starts_at: slotStart.toISOString(),
            ends_at: slotEnd.toISOString(),
          });
        } else {
          slotsBlocked++;
        }

        slotStart.setMinutes(slotStart.getMinutes() + slotInterval);
      }
    }

    debugInfo.slotsBeforeBlocking = slotsBeforeBlocking;
    debugInfo.slotsAfterBlocking = availableSlots;
    debugInfo.reason = `Generated ${totalSlotsGenerated} slots, ${slotsBlocked} blocked, ${availableSlots.length} available`;

    console.log(`[AVAILABILITY] Total: ${totalSlotsGenerated} generated, ${slotsBlocked} blocked, ${availableSlots.length} available`);

    if (debug) {
      return NextResponse.json({
        slots: availableSlots,
        debug: debugInfo,
      });
    }

    return NextResponse.json({ slots: availableSlots });
  } catch (error) {
    console.error('[AVAILABILITY] Error:', error);
    const { searchParams } = new URL(request.url);
    const debugInfo: any = {
      reason: `Server error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
    if (searchParams.get('debug') === '1') {
      return NextResponse.json({
        slots: [],
        debug: debugInfo,
        error: 'Internal server error',
      });
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

