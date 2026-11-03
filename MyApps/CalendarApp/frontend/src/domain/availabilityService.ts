import { CalendarEvent, TimeSlot } from './types';
import { overlaps } from './dateUtils';

const WORK_START_HOUR = 9;
const WORK_END_HOUR = 18;

const mergeIntervals = (events: CalendarEvent[]) => {
  const sorted = [...events].sort((a, b) => new Date(a.startISO).getTime() - new Date(b.startISO).getTime());
  return sorted.reduce<{ startISO: string; endISO: string }[]>((acc, event) => {
    const last = acc[acc.length - 1];
    if (!last || new Date(event.startISO) > new Date(last.endISO)) {
      acc.push({ startISO: event.startISO, endISO: event.endISO });
    } else if (new Date(event.endISO) > new Date(last.endISO)) {
      last.endISO = event.endISO;
    }
    return acc;
  }, []);
};

export const computeSharedAvailability = (params: {
  participants: { id: string }[];
  calendars: Record<string, CalendarEvent[]>;
  dateRange: { startISO: string; endISO: string };
  minimumMinutes?: number;
}) => {
  const minimumMinutes = params.minimumMinutes ?? 30;
  const startDate = new Date(params.dateRange.startISO);
  const endDate = new Date(params.dateRange.endISO);
  const slots: TimeSlot[] = [];

  for (let day = new Date(startDate); day <= endDate; day.setDate(day.getDate() + 1)) {
    const dayStart = new Date(day);
    dayStart.setHours(WORK_START_HOUR, 0, 0, 0);
    const dayEnd = new Date(day);
    dayEnd.setHours(WORK_END_HOUR, 0, 0, 0);

    const freePerPerson = params.participants.map((person) => {
      const busy = mergeIntervals((params.calendars[person.id] ?? []).filter((event) => overlaps(event.startISO, event.endISO, dayStart.toISOString(), dayEnd.toISOString())));
      const free: { startISO: string; endISO: string }[] = [];
      let cursor = dayStart.toISOString();
      busy.forEach((interval) => {
        if (new Date(interval.startISO) > new Date(cursor)) free.push({ startISO: cursor, endISO: interval.startISO });
        cursor = new Date(Math.max(new Date(cursor).getTime(), new Date(interval.endISO).getTime())).toISOString();
      });
      if (new Date(cursor) < dayEnd) free.push({ startISO: cursor, endISO: dayEnd.toISOString() });
      return free.filter((interval) => (new Date(interval.endISO).getTime() - new Date(interval.startISO).getTime()) / 60000 >= minimumMinutes);
    });

    const common = freePerPerson.reduce<{ startISO: string; endISO: string }[]>((acc, freeIntervals, index) => {
      if (index === 0) return freeIntervals;
      const next: { startISO: string; endISO: string }[] = [];
      acc.forEach((a) => {
        freeIntervals.forEach((b) => {
          const start = new Date(Math.max(new Date(a.startISO).getTime(), new Date(b.startISO).getTime()));
          const end = new Date(Math.min(new Date(a.endISO).getTime(), new Date(b.endISO).getTime()));
          if (end > start && (end.getTime() - start.getTime()) / 60000 >= minimumMinutes) next.push({ startISO: start.toISOString(), endISO: end.toISOString() });
        });
      });
      return next;
    }, []);

    common.forEach((slot) => slots.push({ startISO: slot.startISO, endISO: slot.endISO, durationMinutes: (new Date(slot.endISO).getTime() - new Date(slot.startISO).getTime()) / 60000 }));
  }

  return { slots: slots.sort((a, b) => new Date(a.startISO).getTime() - new Date(b.startISO).getTime()), reason: slots.length ? undefined : 'No shared availability found for the selected demo group and date range.' };
};
