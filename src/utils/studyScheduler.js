/**
 * studyScheduler.js
 * 
 * A simple, deterministic study scheduling algorithm.
 * 
 * HOW IT WORKS (interview explanation):
 * 
 * 1. For each subject, calculate how many days remain until its deadline.
 * 2. Compute a "priority score" for each subject using three factors:
 *    - Days until deadline (fewer days → higher urgency)
 *    - User-defined priority (High=3, Medium=2, Low=1)
 *    - Remaining study hours (more work left → higher urgency)
 * 3. Sort subjects by score (highest first), so urgent, important, heavy
 *    subjects are scheduled before lighter ones.
 * 4. Iterate day by day from today until the furthest deadline.
 *    On each day, fill available hours with sessions from our sorted list.
 *    A session lasts at most 2 hours (cap to keep days balanced).
 *    Once a subject's remaining hours reach zero, skip it.
 * 5. If any subject still has remaining hours after iterating all days,
 *    we emit a warning — the workload cannot fit before the deadline.
 * 6. Return the generated sessions array and any warnings.
 */

const PRIORITY_VALUES = { High: 3, Medium: 2, Low: 1 };

/** Format a Date as YYYY-MM-DD in local time. */
export const toDateString = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

/** Parse a YYYY-MM-DD string into a local-timezone Date at midnight. */
const parseDate = (str) => {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
};

/** Return number of full days from today to target (can be negative if past). */
const daysUntil = (targetDateStr) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = parseDate(targetDateStr);
  return Math.floor((target - today) / (1000 * 60 * 60 * 24));
};

/**
 * generateSchedule
 * 
 * @param {Array} subjects - Array of { id, name, deadline, priority, totalHours, remainingHours }
 * @param {number} availableHoursPerDay - Max study hours the user can do daily
 * @returns {{ sessions: Array, warnings: Array }}
 */
export const generateSchedule = (subjects, availableHoursPerDay) => {
  const sessions = [];
  const warnings = [];

  if (!subjects.length || availableHoursPerDay <= 0) {
    return { sessions, warnings };
  }

  // --- Step 1: Calculate scores and sort ---
  const scoredSubjects = subjects.map(sub => {
    const days = daysUntil(sub.deadline);
    const pv = PRIORITY_VALUES[sub.priority] || 1;
    // Score formula:
    //   urgency = 1 / max(days, 1)  → fewer days = higher score
    //   base = urgency * priorityValue * remainingHours
    const urgency = 1 / Math.max(days, 1);
    const score = urgency * pv * sub.remainingHours;
    return { ...sub, score, daysLeft: days };
  });

  // Highest score first
  scoredSubjects.sort((a, b) => b.score - a.score);

  // Working copy of remaining hours (in hours, not minutes)
  const remaining = {};
  scoredSubjects.forEach(s => {
    remaining[s.id] = s.remainingHours;
  });

  // --- Step 2: Determine date range ---
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const maxDeadline = scoredSubjects.reduce((max, s) => {
    const d = parseDate(s.deadline);
    return d > max ? d : max;
  }, today);

  // --- Step 3: Iterate day by day and fill sessions ---
  const cursor = new Date(today);
  const MAX_SESSION_HOURS = 2; // Cap per subject per day for balance

  while (cursor <= maxDeadline) {
    const dateStr = toDateString(cursor);
    let hoursLeftToday = availableHoursPerDay;

    for (const subject of scoredSubjects) {
      if (hoursLeftToday <= 0) break;
      if (remaining[subject.id] <= 0) continue;

      // Don't schedule past this subject's deadline
      if (cursor > parseDate(subject.deadline)) continue;

      // How much to schedule: min of (remaining, daily cap, hours left today)
      const sessionHours = Math.min(
        remaining[subject.id],
        MAX_SESSION_HOURS,
        hoursLeftToday
      );

      if (sessionHours < 0.25) continue; // Skip tiny slivers (< 15 min)

      sessions.push({
        id: `${subject.id}-${dateStr}`,
        subjectId: subject.id,
        subject: subject.name,
        date: dateStr,
        durationMinutes: Math.round(sessionHours * 60),
        priority: subject.priority,
        deadline: subject.deadline
      });

      remaining[subject.id] -= sessionHours;
      hoursLeftToday -= sessionHours;
    }

    // Move to next day
    cursor.setDate(cursor.getDate() + 1);
  }

  // --- Step 4: Check for subjects that couldn't be fully scheduled ---
  scoredSubjects.forEach(s => {
    const leftover = remaining[s.id];
    if (leftover > 0.1) { // 6+ minutes leftover triggers warning
      warnings.push(
        `⚠️ "${s.name}": ${leftover.toFixed(1)}h couldn't be scheduled before the deadline (${s.deadline}). Consider increasing daily hours or extending the deadline.`
      );
    }
  });

  return { sessions, warnings };
};

/**
 * Group sessions array by date, returning an object like:
 * { "2025-09-01": [session, ...], "2025-09-02": [...] }
 */
export const groupSessionsByDate = (sessions) => {
  return sessions.reduce((acc, session) => {
    if (!acc[session.date]) acc[session.date] = [];
    acc[session.date].push(session);
    return acc;
  }, {});
};

/** Format a YYYY-MM-DD string as a human-readable label, e.g. "Monday, Sep 1" */
export const formatDate = (dateStr) => {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
};
