// Strips time from a Date, returning midnight UTC for that calendar day.
const startOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const endOfDay = (date) => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

const isSameCalendarDay = (a, b) => startOfDay(a).getTime() === startOfDay(b).getTime();

// Compares "HH:mm" time string against the current clock time.
const isTimeInPast = (hhmm, referenceDate = new Date()) => {
  const [h, m] = hhmm.split(':').map(Number);
  const candidate = new Date(referenceDate);
  candidate.setHours(h, m, 0, 0);
  return candidate.getTime() < referenceDate.getTime();
};

module.exports = { startOfDay, endOfDay, isSameCalendarDay, isTimeInPast };
