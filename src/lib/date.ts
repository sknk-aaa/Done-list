import { DEV_TODAY, SEED } from './dev';

export const WEEKDAYS_JA = ['日', '月', '火', '水', '木', '金', '土'];
export const WEEKDAYS_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const MONTHS_EN = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export type DateParts = { y: number; m0: number; d: number };

export const pad2 = (n: number) => (n < 10 ? `0${n}` : `${n}`);

/** Build 'YYYY-MM-DD' from year / 0-indexed month / day. */
export const toISO = (y: number, m0: number, d: number) => `${y}-${pad2(m0 + 1)}-${pad2(d)}`;

export const parseISO = (iso: string): DateParts => {
  const [y, m, d] = iso.split('-').map(Number);
  return { y, m0: m - 1, d };
};

/** Local-midnight Date for an ISO date string. */
export const isoToDate = (iso: string): Date => {
  const { y, m0, d } = parseISO(iso);
  return new Date(y, m0, d);
};

export const dateToISO = (date: Date): string => toISO(date.getFullYear(), date.getMonth(), date.getDate());

export const daysInMonth = (y: number, m0: number) => new Date(y, m0 + 1, 0).getDate();

/** Weekday of the 1st of a month (0=Sun). */
export const firstWeekday = (y: number, m0: number) => new Date(y, m0, 1).getDay();

export const weekdayOfISO = (iso: string): number => isoToDate(iso).getDay();

export const addDaysISO = (iso: string, n: number): string => {
  const dt = isoToDate(iso);
  dt.setDate(dt.getDate() + n);
  return dateToISO(dt);
};

/** Today as ISO. Pinned to DEV_TODAY while SEED is on (for design diffing). */
export const getTodayISO = (): string => (SEED ? DEV_TODAY : dateToISO(new Date()));

/** 'HH:MM' from a Date. */
export const formatTime = (d: Date): string => `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;

/** Date (today's date, given time) from 'HH:MM'; defaults to 09:00. */
export const timeToDate = (time: string | null): Date => {
  const d = new Date();
  const [h, m] = (time ?? '09:00').split(':').map(Number);
  d.setHours(h, m, 0, 0);
  return d;
};

/** Difference in whole days between two ISO dates (b - a). */
export const diffDays = (a: string, b: string): number =>
  Math.round((isoToDate(b).getTime() - isoToDate(a).getTime()) / 86400000);

type Lang = 'ja' | 'en';

/** Long absolute label, e.g. JA '6月19日（金）' / EN 'Jun 19 (Fri)'. */
export const formatLong = (iso: string, lang: Lang, withYear = false): string => {
  const { y, m0, d } = parseISO(iso);
  const wd = weekdayOfISO(iso);
  if (lang === 'ja') {
    const head = withYear ? `${y}年${m0 + 1}月${d}日` : `${m0 + 1}月${d}日`;
    return `${head}（${WEEKDAYS_JA[wd]}）`;
  }
  const head = withYear ? `${MONTHS_EN[m0]} ${d}, ${y}` : `${MONTHS_EN[m0]} ${d}`;
  return `${head} (${WEEKDAYS_EN[wd]})`;
};

/**
 * Relative-or-absolute label for the daily header.
 * 今日/昨日/明日 (Today/Yesterday/Tomorrow) within ±1 day, else formatLong.
 */
export const formatRelative = (
  iso: string,
  todayISO: string,
  lang: Lang,
  rel: { today: string; yesterday: string; tomorrow: string },
): string => {
  const delta = diffDays(todayISO, iso);
  if (delta === 0) return rel.today;
  if (delta === -1) return rel.yesterday;
  if (delta === 1) return rel.tomorrow;
  return formatLong(iso, lang);
};
