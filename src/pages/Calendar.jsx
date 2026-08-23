import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { useStudyPlan } from '../hooks/useStudyPlan';
import { toDateString, formatDate } from '../utils/studyScheduler';
import { FiChevronLeft, FiChevronRight, FiCalendar, FiClock, FiPlay } from 'react-icons/fi';

/* ─── date helpers ────────────────────────────────────────── */

/** Return the Monday of the week that contains `date`. */
const getWeekStart = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay(); // 0 = Sun
  const diff = day === 0 ? -6 : 1 - day; // shift to Monday
  d.setDate(d.getDate() + diff);
  return d;
};

/** Return an array of 7 Date objects starting from `monday`. */
const getWeekDays = (monday) =>
  Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(d.getDate() + i);
    return d;
  });

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const PRIORITY_COLORS = {
  High: { bg: 'rgba(239,68,68,0.12)', border: 'var(--accent-danger)', text: 'var(--accent-danger)' },
  Medium: { bg: 'rgba(245,158,11,0.12)', border: 'var(--accent-warning)', text: 'var(--accent-warning)' },
  Low: { bg: 'rgba(16,185,129,0.12)', border: 'var(--accent-success)', text: 'var(--accent-success)' }
};

/* ─── component ───────────────────────────────────────────── */

const Calendar = () => {
  const navigate = useNavigate();
  const { sessions, updateSessionDate } = useStudyPlan();

  // Week navigation state
  const [weekStart, setWeekStart] = useState(() => getWeekStart(new Date()));

  // Session detail modal
  const [selectedSession, setSelectedSession] = useState(null);

  // Drag state — only the session ID being dragged
  const [draggingId, setDraggingId] = useState(null);

  const weekDays = getWeekDays(weekStart);
  const today = toDateString(new Date());

  /* ── week label ── */
  const weekLabel = (() => {
    const start = weekDays[0];
    const end = weekDays[6];
    const sameMonth = start.getMonth() === end.getMonth();
    const opts = { month: 'short', day: 'numeric' };
    if (sameMonth) {
      return `${start.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })} · ${start.getDate()}–${end.getDate()}`;
    }
    return `${start.toLocaleDateString(undefined, opts)} – ${end.toLocaleDateString(undefined, { ...opts, year: 'numeric' })}`;
  })();

  /* ── navigation ── */
  const prevWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() - 7);
    setWeekStart(d);
  };
  const nextWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 7);
    setWeekStart(d);
  };
  const goToday = () => setWeekStart(getWeekStart(new Date()));

  /* ── sessions lookup ── */
  const sessionsByDate = sessions.reduce((acc, s) => {
    if (!acc[s.date]) acc[s.date] = [];
    acc[s.date].push(s);
    return acc;
  }, {});

  const weekHasSessions = weekDays.some(d => sessionsByDate[toDateString(d)]?.length > 0);

  /* ── drag handlers ── */
  const handleDragStart = (e, sessionId) => {
    setDraggingId(sessionId);
    e.dataTransfer.effectAllowed = 'move';
    // Store the ID in the transfer data as a fallback
    e.dataTransfer.setData('text/plain', sessionId);
  };

  const handleDragOver = (e) => {
    e.preventDefault(); // required to allow drop
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetDateStr) => {
    e.preventDefault();
    const id = draggingId || e.dataTransfer.getData('text/plain');
    if (!id) return;
    updateSessionDate(id, targetDateStr);
    setDraggingId(null);
  };

  const handleDragEnd = () => setDraggingId(null);

  /* ── start focus session from modal ── */
  const handleStartFocus = () => {
    setSelectedSession(null);
    navigate('/focus-timer');
  };

  /* ─── render ─────────────────────────────────────────────── */
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: '700' }}>Calendar</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <button
              onClick={prevWeek}
              title="Previous week"
              style={{ padding: '0.5rem', color: 'var(--text-secondary)', borderRadius: 'var(--radius-md)', transition: 'var(--transition-fast)' }}
            >
              <FiChevronLeft size={20} />
            </button>
            <span style={{ fontSize: '0.9375rem', fontWeight: '500', color: 'var(--text-secondary)', minWidth: '240px', textAlign: 'center' }}>
              {weekLabel}
            </span>
            <button
              onClick={nextWeek}
              title="Next week"
              style={{ padding: '0.5rem', color: 'var(--text-secondary)', borderRadius: 'var(--radius-md)', transition: 'var(--transition-fast)' }}
            >
              <FiChevronRight size={20} />
            </button>
          </div>
        </div>
        <Button variant="secondary" onClick={goToday}>Today</Button>
      </div>

      {/* No schedule generated at all */}
      {sessions.length === 0 && (
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          color: 'var(--text-muted)',
          textAlign: 'center',
          padding: '4rem 2rem'
        }}>
          <div style={{
            width: '72px', height: '72px', borderRadius: '50%',
            backgroundColor: 'var(--bg-tertiary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <FiCalendar size={32} />
          </div>
          <p style={{ fontWeight: '600', fontSize: '1.125rem', color: 'var(--text-primary)' }}>No study plan yet</p>
          <p style={{ fontSize: '0.875rem', maxWidth: '340px' }}>
            Head to the <strong>Study Planner</strong> to add subjects and generate a schedule.
            It will appear here automatically.
          </p>
          <Button variant="primary" onClick={() => navigate('/study-planner')}>Go to Study Planner</Button>
        </div>
      )}

      {/* Calendar grid */}
      {sessions.length > 0 && (
        <div style={{
          flex: 1,
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          backgroundColor: 'var(--bg-secondary)',
          display: 'flex',
          flexDirection: 'column',
          minHeight: '500px'
        }}>
          {/* Day header row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            backgroundColor: 'var(--bg-tertiary)',
            borderBottom: '1px solid var(--border-color)'
          }}>
            {weekDays.map((day, i) => {
              const dateStr = toDateString(day);
              const isToday = dateStr === today;
              return (
                <div key={i} style={{
                  padding: '0.75rem 0.5rem',
                  textAlign: 'center',
                  borderRight: i < 6 ? '1px solid var(--border-color)' : 'none'
                }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: '500', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
                    {DAY_LABELS[i]}
                  </div>
                  <div style={{
                    width: '32px', height: '32px',
                    borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto',
                    backgroundColor: isToday ? 'var(--accent-primary)' : 'transparent',
                    color: isToday ? '#fff' : 'var(--text-primary)',
                    fontWeight: isToday ? '700' : '500',
                    fontSize: '0.9375rem'
                  }}>
                    {day.getDate()}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Session cells — one column per day */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', flex: 1, overflowY: 'auto' }}>
            {weekDays.map((day, colIdx) => {
              const dateStr = toDateString(day);
              const daySessions = sessionsByDate[dateStr] || [];
              const isToday = dateStr === today;

              return (
                <div
                  key={colIdx}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, dateStr)}
                  style={{
                    borderRight: colIdx < 6 ? '1px solid var(--border-color)' : 'none',
                    padding: '0.5rem',
                    backgroundColor: isToday ? 'rgba(99,102,241,0.03)' : 'transparent',
                    minHeight: '200px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.375rem',
                    transition: 'background-color 0.15s'
                  }}
                >
                  {daySessions.length === 0 && (
                    <div style={{
                      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'var(--text-muted)', fontSize: '0.7rem', textAlign: 'center', padding: '0.5rem'
                    }}>
                      <span>No sessions</span>
                    </div>
                  )}

                  {daySessions.map(session => {
                    const colors = PRIORITY_COLORS[session.priority] || PRIORITY_COLORS.Medium;
                    const isDragging = draggingId === session.id;
                    return (
                      <div
                        key={session.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, session.id)}
                        onDragEnd={handleDragEnd}
                        onClick={() => setSelectedSession(session)}
                        title={`${session.subject} · ${session.durationMinutes} min`}
                        style={{
                          backgroundColor: colors.bg,
                          borderLeft: `3px solid ${colors.border}`,
                          borderRadius: 'var(--radius-sm)',
                          padding: '0.4rem 0.5rem',
                          cursor: 'grab',
                          opacity: isDragging ? 0.4 : 1,
                          transition: 'opacity 0.15s',
                          userSelect: 'none'
                        }}
                      >
                        <div style={{ fontWeight: '600', fontSize: '0.75rem', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {session.subject}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.15rem' }}>
                          <FiClock size={10} />
                          {session.durationMinutes} min
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/* No-sessions-this-week banner */}
          {!weekHasSessions && (
            <div style={{
              padding: '1.5rem',
              textAlign: 'center',
              color: 'var(--text-muted)',
              fontSize: '0.875rem',
              borderTop: '1px solid var(--border-color)'
            }}>
              No study sessions scheduled this week. Navigate to another week or regenerate your plan.
            </div>
          )}
        </div>
      )}

      {/* Session detail modal */}
      <Modal
        isOpen={!!selectedSession}
        onClose={() => setSelectedSession(null)}
        title="Session Details"
      >
        {selectedSession && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Subject */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Subject</span>
              <span style={{ fontWeight: '700', fontSize: '1.25rem' }}>{selectedSession.subject}</span>
            </div>

            {/* Meta grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Date</div>
                <div style={{ fontWeight: '500', fontSize: '0.875rem' }}>{formatDate(selectedSession.date)}</div>
              </div>
              <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Duration</div>
                <div style={{ fontWeight: '500', fontSize: '0.875rem' }}>{selectedSession.durationMinutes} minutes</div>
              </div>
              <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Priority</div>
                <div style={{
                  fontWeight: '600', fontSize: '0.875rem',
                  color: PRIORITY_COLORS[selectedSession.priority]?.text || 'var(--text-primary)'
                }}>
                  {selectedSession.priority}
                </div>
              </div>
              <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Deadline</div>
                <div style={{ fontWeight: '500', fontSize: '0.875rem' }}>{selectedSession.deadline || '—'}</div>
              </div>
            </div>

            {/* CTA */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '0.25rem' }}>
              <Button variant="ghost" onClick={() => setSelectedSession(null)}>Close</Button>
              <Button variant="primary" onClick={handleStartFocus}>
                <FiPlay size={14} /> Start Focus Session
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Calendar;
