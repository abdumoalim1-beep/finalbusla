const {
  getCalendarClient, isValidDate, isWeekend, allDaySlots,
  slotRange, isPastOrTooSoon, getBusyPeriods, overlaps
} = require('./_google');

module.exports = async function handler(req, res){
  try {
    const date = String(req.query.date || '');
    if(!isValidDate(date)){
      res.status(400).json({ error: 'invalid_date' });
      return;
    }
    if(isWeekend(date)){
      res.status(200).json({ slots: [] });
      return;
    }

    const calendar = getCalendarClient();
    const busy = await getBusyPeriods(calendar, date);

    const available = allDaySlots().filter(time => {
      if(isPastOrTooSoon(date, time)) return false;
      const { start, end } = slotRange(date, time);
      return !busy.some(b => overlaps(start, end, new Date(b.start), new Date(b.end)));
    });

    res.status(200).json({ slots: available });
  } catch(err){
    console.error('[api/slots]', err);
    res.status(500).json({ error: 'server_error' });
  }
};
