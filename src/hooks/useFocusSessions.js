import { useState, useEffect } from 'react';

const STORAGE_KEY = 'focusflow_focus_sessions';

export const useFocusSessions = () => {
  const [sessions, setSessions] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Failed to parse focus sessions from LocalStorage:", error);
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  }, [sessions]);

  const addSession = (session) => {
    const newSession = {
      ...session,
      id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
      completedAt: new Date().toISOString()
    };
    setSessions(prev => [newSession, ...prev]); // Add to beginning
  };

  // Helper for dashboard
  const getTodayStats = () => {
    const today = new Date().toDateString();
    
    const todaySessions = sessions.filter(session => {
      // completedAt exists because it's set in addSession
      const sessionDate = new Date(session.completedAt).toDateString();
      return sessionDate === today;
    });

    const totalMinutes = todaySessions.reduce((acc, curr) => acc + (curr.duration || 0), 0);

    return {
      sessionsCount: todaySessions.length,
      totalMinutes
    };
  };

  return {
    sessions,
    addSession,
    getTodayStats
  };
};
