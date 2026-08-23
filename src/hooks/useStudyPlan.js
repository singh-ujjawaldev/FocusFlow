import { useState, useEffect } from 'react';

const STORAGE_KEY = 'focusflow_study_plan';

/**
 * Persists the study planner configuration (subjects list + generated schedule)
 * to LocalStorage under the key `focusflow_study_plan`.
 *
 * Stored shape:
 * {
 *   subjects: [],          // user-defined subjects with deadlines, priorities, hours
 *   availableHoursPerDay: 4,
 *   sessions: [],          // generated schedule sessions
 *   warnings: [],          // any scheduling warnings
 *   generatedAt: ISO string
 * }
 */
export const useStudyPlan = () => {
  const [subjects, setSubjects] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored).subjects ?? [] : [];
    } catch {
      return [];
    }
  });

  const [availableHoursPerDay, setAvailableHoursPerDay] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored).availableHoursPerDay ?? 4 : 4;
    } catch {
      return 4;
    }
  });

  const [sessions, setSessions] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored).sessions ?? [] : [];
    } catch {
      return [];
    }
  });

  const [warnings, setWarnings] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored).warnings ?? [] : [];
    } catch {
      return [];
    }
  });

  // Persist everything whenever any piece of state changes
  useEffect(() => {
    const plan = {
      subjects,
      availableHoursPerDay,
      sessions,
      warnings,
      generatedAt: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
  }, [subjects, availableHoursPerDay, sessions, warnings]);

  // --- Subject CRUD ---
  const addSubject = (subject) => {
    const newSubject = {
      ...subject,
      id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
      remainingHours: subject.totalHours
    };
    setSubjects(prev => [...prev, newSubject]);
  };

  const removeSubject = (id) => {
    setSubjects(prev => prev.filter(s => s.id !== id));
    // Clear schedule when subjects change
    setSessions([]);
    setWarnings([]);
  };

  const updateSubject = (id, updates) => {
    setSubjects(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    setSessions([]);
    setWarnings([]);
  };

  // Called by the planner page after running the algorithm
  const saveSchedule = (newSessions, newWarnings) => {
    setSessions(newSessions);
    setWarnings(newWarnings);
  };

  /**
   * Called by the Calendar when a session is dragged to a new day.
   * Only updates the `date` field on the target session — everything else
   * is left untouched. The useEffect above automatically persists the change.
   */
  const updateSessionDate = (sessionId, newDate) => {
    setSessions(prev =>
      prev.map(s => s.id === sessionId ? { ...s, date: newDate } : s)
    );
  };

  return {
    subjects,
    availableHoursPerDay,
    setAvailableHoursPerDay,
    sessions,
    warnings,
    addSubject,
    removeSubject,
    updateSubject,
    saveSchedule,
    updateSessionDate
  };
};
