const {
  getCalendarClient, CALENDAR_ID, isValidDate, isValidTime, isWeekend,
  allDaySlots, slotRange, isPastOrTooSoon, getBusyPeriods, overlaps
} = require('./_google');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

module.exports = async function handler(req, res){
  if(req.method !== 'POST'){
    res.status(405).json({ error: 'method_not_allowed' });
    return;
  }
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const date = String(body.date || '');
    const time = String(body.time || '');
    const email = String(body.email || '').trim();
    const name = String(body.name || '').trim().slice(0, 120);
    const lang = body.lang === 'en' ? 'en' : 'ar';

    if(!isValidDate(date) || !isValidTime(time)){
      res.status(400).json({ error: 'invalid_slot' });
      return;
    }
    if(!EMAIL_RE.test(email)){
      res.status(400).json({ error: 'invalid_email' });
      return;
    }
    if(isWeekend(date) || isPastOrTooSoon(date, time) || !allDaySlots().includes(time)){
      res.status(400).json({ error: 'slot_not_bookable' });
      return;
    }

    const calendar = getCalendarClient();
    const { start, end } = slotRange(date, time);

    // Re-check availability right before booking to avoid double-booking races.
    const busy = await getBusyPeriods(calendar, date);
    const stillFree = !busy.some(b => overlaps(start, end, new Date(b.start), new Date(b.end)));
    if(!stillFree){
      res.status(409).json({ error: 'slot_taken' });
      return;
    }

    const summary = lang === 'en'
      ? `Busla consultation with ${name || email}`
      : `استشارة Busla مع ${name || email}`;
    const description = lang === 'en'
      ? `Booked via the Busla website.\nEmail: ${email}`
      : `تم الحجز عبر موقع Busla.\nالبريد الإلكتروني: ${email}`;

    const event = await calendar.events.insert({
      calendarId: CALENDAR_ID,
      sendUpdates: 'all',
      conferenceDataVersion: 1,
      requestBody: {
        summary,
        description,
        start: { dateTime: start.toISOString(), timeZone: 'Asia/Riyadh' },
        end: { dateTime: end.toISOString(), timeZone: 'Asia/Riyadh' },
        attendees: [{ email }],
        conferenceData: {
          createRequest: {
            requestId: `busla-${date}-${time}-${Date.now()}`,
            conferenceSolutionKey: { type: 'hangoutsMeet' }
          }
        }
      }
    });

    res.status(200).json({
      success: true,
      meetLink: event.data.hangoutLink || null,
      eventLink: event.data.htmlLink || null
    });
  } catch(err){
    console.error('[api/book]', err);
    res.status(500).json({ error: 'server_error' });
  }
};
