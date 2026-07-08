const { google } = require('googleapis');

const TIMEZONE = 'Asia/Riyadh';
const TZ_OFFSET = '+03:00';
const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID || 'primary';
const WORK_START_HOUR = 9;
const WORK_END_HOUR = 17;
const SLOT_MINUTES = 30;
const MIN_LEAD_MINUTES = 60;

function getCalendarClient(){
  const client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );
  client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });
  return google.calendar({ version: 'v3', auth: client });
}

function isValidDate(date){
  return /^\d{4}-\d{2}-\d{2}$/.test(date) && !isNaN(Date.parse(date + 'T00:00:00' + TZ_OFFSET));
}
function isValidTime(time){
  return /^\d{2}:\d{2}$/.test(time);
}

// Riyadh has no DST, so a fixed +03:00 offset is always correct.
function riyadhDayOfWeek(date){
  const d = new Date(date + 'T12:00:00' + TZ_OFFSET);
  return d.getUTCDay();
}
function isWeekend(date){
  const dow = riyadhDayOfWeek(date);
  return dow === 5 || dow === 6; // Friday, Saturday
}

function allDaySlots(){
  const slots = [];
  for(let h = WORK_START_HOUR; h < WORK_END_HOUR; h++){
    for(let m = 0; m < 60; m += SLOT_MINUTES){
      slots.push(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`);
    }
  }
  return slots;
}

function slotRange(date, time){
  const start = new Date(`${date}T${time}:00${TZ_OFFSET}`);
  const end = new Date(start.getTime() + SLOT_MINUTES * 60000);
  return { start, end };
}

function isPastOrTooSoon(date, time){
  const { start } = slotRange(date, time);
  return start.getTime() < Date.now() + MIN_LEAD_MINUTES * 60000;
}

async function getBusyPeriods(calendar, date){
  const dayStart = `${date}T00:00:00${TZ_OFFSET}`;
  const dayEnd = `${date}T23:59:59${TZ_OFFSET}`;
  const res = await calendar.freebusy.query({
    requestBody: {
      timeMin: dayStart,
      timeMax: dayEnd,
      timeZone: TIMEZONE,
      items: [{ id: CALENDAR_ID }]
    }
  });
  const cal = res.data.calendars && res.data.calendars[CALENDAR_ID];
  return (cal && cal.busy) || [];
}

function overlaps(aStart, aEnd, bStart, bEnd){
  return aStart < bEnd && bStart < aEnd;
}

module.exports = {
  TIMEZONE, TZ_OFFSET, CALENDAR_ID, SLOT_MINUTES,
  getCalendarClient, isValidDate, isValidTime, isWeekend,
  allDaySlots, slotRange, isPastOrTooSoon, getBusyPeriods, overlaps
};
