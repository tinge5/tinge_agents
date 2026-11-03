const pad = (value: number) => String(value).padStart(2, '0');

export const formatDateTime = (iso: string) => {
  const date = new Date(iso);
  return `${date.getMonth() + 1}/${date.getDate()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export const formatDateLabel = (iso: string) => {
  const date = new Date(iso);
  return `${date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}`;
};

export const minutesBetween = (startISO: string, endISO: string) => {
  return Math.max(0, (new Date(endISO).getTime() - new Date(startISO).getTime()) / 60000);
};

export const addMinutes = (iso: string, minutes: number) => {
  return new Date(new Date(iso).getTime() + minutes * 60000).toISOString();
};

export const overlaps = (aStart: string, aEnd: string, bStart: string, bEnd: string) => {
  return new Date(aStart) < new Date(bEnd) && new Date(bStart) < new Date(aEnd);
};
