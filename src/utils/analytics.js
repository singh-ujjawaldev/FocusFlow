/**
 * analytics.js — Pure calculation functions for the Analytics page.
 *
 * All functions take plain arrays as input and return plain values.
 * No React, no hooks, no side effects. Easy to test and explain.
 */

const DAY_NAMES_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** Return "YYYY-MM-DD" for a given Date (local time). */
const toDateStr = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

/** Return true if an ISO timestamp string falls on today. */
const isToday = (isoStr) => {
  if (!isoStr) return false;
  return new Date(isoStr).toDateString() === new Date().toDateString();
};

/** Return true if an ISO timestamp string falls within the current calendar week (Mon–Sun). */
const isThisWeek = (isoStr) => {
  if (!isoStr) return false;
  const d = new Date(isoStr);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  // Monday of this week
  const monday = new Date(now);
  const dow = now.getDay();
  monday.setDate(now.getDate() - (dow === 0 ? 6 : dow - 1));
  // Sunday of this week
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return d >= monday && d <= sunday;
};

/**
 * Filter focus sessions by time range.
 * @param {Array} sessions
 * @param {'today'|'week'|'all'} range
 */
export const filterSessionsByRange = (sessions, range) => {
  if (range === 'today') return sessions.filter(s => isToday(s.completedAt));
  if (range === 'week') return sessions.filter(s => isThisWeek(s.completedAt));
  return sessions; // 'all'
};

/**
 * Filter tasks by time range (using completedAt).
 * For 'all', returns all completed tasks regardless of date.
 */
export const filterTasksByRange = (tasks, range) => {
  const completed = tasks.filter(t => t.status === 'Done');
  if (range === 'today') return completed.filter(t => isToday(t.completedAt));
  if (range === 'week') return completed.filter(t => isThisWeek(t.completedAt));
  return completed;
};

/** Sum all duration minutes from a session array. */
export const totalFocusMinutes = (sessions) =>
  sessions.reduce((acc, s) => acc + (s.duration || 0), 0);

/** Group session minutes by subject name. Returns [{ subject, minutes }] sorted desc. */
export const minutesBySubject = (sessions) => {
  const map = {};
  sessions.forEach(s => {
    const key = s.subject || 'Unassigned';
    map[key] = (map[key] || 0) + (s.duration || 0);
  });
  return Object.entries(map)
    .map(([subject, minutes]) => ({ subject, minutes }))
    .sort((a, b) => b.minutes - a.minutes);
};

/**
 * Build the last 7 days worth of daily focus minutes for the bar chart.
 * Always returns exactly 7 entries ordered from oldest → newest.
 * @param {Array} sessions — full sessions array (not pre-filtered)
 */
export const weeklyFocusData = (sessions) => {
  const today = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i)); // 6 days ago … today
    const dateStr = toDateStr(d);
    const minutes = sessions
      .filter(s => s.completedAt && toDateStr(new Date(s.completedAt)) === dateStr)
      .reduce((acc, s) => acc + (s.duration || 0), 0);
    return { label: DAY_NAMES_SHORT[d.getDay()], dateStr, minutes };
  });
};

/** Task completion stats. */
export const taskStats = (tasks) => {
  const total = tasks.length;
  const done = tasks.filter(t => t.status === 'Done').length;
  const rate = total > 0 ? Math.round((done / total) * 100) : 0;
  return { total, done, remaining: total - done, rate };
};

/** Planned vs actual: planned minutes from study plan sessions, actual from focus sessions. */
export const plannedVsActual = (studySessions, focusSessions) => {
  const planned = studySessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);
  const actual = focusSessions.reduce((acc, s) => acc + (s.duration || 0), 0);
  return { planned, actual };
};
