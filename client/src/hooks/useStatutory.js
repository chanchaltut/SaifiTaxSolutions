import { useEffect, useState } from 'react';
import { radar } from '../content/home';

/**
 * Returns today's date only after mount. Pages are prerendered once at build
 * time, so anything date-dependent has to appear on the client to stay correct.
 */
export function useToday() {
  const [today, setToday] = useState(null);
  useEffect(() => {
    setToday(new Date());
  }, []);
  return today;
}

const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

/** Next calendar occurrence of a radar item on or after `from`. */
function nextOccurrence(item, from) {
  const base = startOfDay(from);
  for (let offset = 0; offset < 13; offset += 1) {
    const year = base.getFullYear();
    const month = base.getMonth() + offset;
    const candidate = new Date(year, month, item.day);
    const allowed = !item.months || item.months.includes(candidate.getMonth());
    if (allowed && candidate >= base) return candidate;
  }
  return base;
}

export function upcoming(from) {
  const base = startOfDay(from);
  return radar.items
    .map((item) => {
      const date = nextOccurrence(item, from);
      const days = Math.round((date - base) / 86400000);
      return { item, date, days };
    })
    .sort((a, b) => a.date - b.date);
}

export const relativeDays = (days) => {
  if (days === 0) return 'Due today';
  if (days === 1) return 'Due tomorrow';
  return `Due in ${days} days`;
};

export const ordinal = (n) => {
  const rem = n % 100;
  if (rem >= 11 && rem <= 13) return `${n}th`;
  return `${n}${{ 1: 'st', 2: 'nd', 3: 'rd' }[n % 10] || 'th'}`;
};

/** Marks for a month grid: `day -> [radar item]`. */
export function monthMarks(year, month) {
  const marks = {};
  radar.items.forEach((item) => {
    if (item.months && !item.months.includes(month)) return;
    marks[item.day] = [...(marks[item.day] || []), item];
  });
  return marks;
}

export const monthName = (d) =>
  d.toLocaleDateString('en-IN', { month: 'long' });
