import React, { useState } from 'react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { useStudyPlan } from '../hooks/useStudyPlan';
import { generateSchedule, groupSessionsByDate, formatDate } from '../utils/studyScheduler';
import {
  FiPlus, FiTrash2, FiRefreshCw, FiAlertTriangle, FiCalendar, FiBook, FiClock
} from 'react-icons/fi';

/* ─── helpers ─────────────────────────────────────────────── */
const PRIORITY_COLORS = {
  High: 'var(--accent-danger)',
  Medium: 'var(--accent-warning)',
  Low: 'var(--accent-success)'
};

const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const EMPTY_FORM = {
  name: '',
  deadline: '',
  priority: 'Medium',
  totalHours: 5
};

/* ─── component ───────────────────────────────────────────── */
const StudyPlanner = () => {
  const {
    subjects,
    availableHoursPerDay,
    setAvailableHoursPerDay,
    sessions,
    warnings,
    addSubject,
    removeSubject,
    saveSchedule
  } = useStudyPlan();

  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');

  /* ── Add subject ── */
  const handleAddSubject = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return setFormError('Subject name is required.');
    if (!form.deadline) return setFormError('Deadline is required.');
    if (form.deadline < todayStr()) return setFormError('Deadline cannot be in the past.');
    if (form.totalHours <= 0) return setFormError('Study hours must be greater than 0.');
    setFormError('');
    addSubject({ ...form, totalHours: Number(form.totalHours) });
    setForm(EMPTY_FORM);
  };

  /* ── Generate schedule ── */
  const handleGenerate = () => {
    const { sessions: newSessions, warnings: newWarnings } = generateSchedule(
      subjects,
      availableHoursPerDay
    );
    saveSchedule(newSessions, newWarnings);
  };

  /* ── Schedule summary stats ── */
  const totalMinutes = sessions.reduce((acc, s) => acc + s.durationMinutes, 0);
  const grouped = groupSessionsByDate(sessions);
  const sortedDates = Object.keys(grouped).sort();

  /* ── Styles ── */
  const inputStyle = {
    padding: '0.65rem 0.75rem',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-primary)',
    color: 'var(--text-primary)',
    outline: 'none',
    fontFamily: 'inherit',
    fontSize: '0.875rem',
    width: '100%'
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.25rem' }}>Smart Study Planner</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Add your subjects, then generate a realistic study schedule.</p>
        </div>
        <Button
          variant="primary"
          onClick={handleGenerate}
          disabled={subjects.length === 0}
        >
          <FiRefreshCw /> Generate Schedule
        </Button>
      </div>

      {/* ── Two-column layout ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) minmax(300px, 1.5fr)', gap: '1.5rem', alignItems: 'start' }}>

        {/* LEFT – Configuration */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Daily availability */}
          <Card title="Daily Availability">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <FiClock size={18} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                  Available study hours per day
                </label>
                <input
                  type="number"
                  min="1"
                  max="16"
                  step="0.5"
                  value={availableHoursPerDay}
                  onChange={e => setAvailableHoursPerDay(Number(e.target.value) || 1)}
                  style={{ ...inputStyle, width: '100px' }}
                />
              </div>
            </div>
          </Card>

          {/* Add subject form */}
          <Card title="Add a Subject">
            <form onSubmit={handleAddSubject} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Subject Name</label>
                <input
                  type="text"
                  placeholder="e.g. Operating Systems"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  style={inputStyle}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Deadline</label>
                  <input
                    type="date"
                    min={todayStr()}
                    value={form.deadline}
                    onChange={e => setForm({ ...form, deadline: e.target.value })}
                    style={inputStyle}
                  />
                </div>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Priority</label>
                  <select
                    value={form.priority}
                    onChange={e => setForm({ ...form, priority: e.target.value })}
                    style={inputStyle}
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Estimated Study Hours</label>
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={form.totalHours}
                  onChange={e => setForm({ ...form, totalHours: e.target.value })}
                  style={inputStyle}
                />
              </div>

              {formError && (
                <p style={{ color: 'var(--accent-danger)', fontSize: '0.75rem' }}>{formError}</p>
              )}

              <Button type="submit" variant="secondary" style={{ alignSelf: 'flex-start' }}>
                <FiPlus /> Add Subject
              </Button>
            </form>
          </Card>

          {/* Subject list */}
          {subjects.length > 0 && (
            <Card title={`Subjects (${subjects.length})`}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {subjects.map(s => (
                  <div key={s.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem',
                    backgroundColor: 'var(--bg-tertiary)',
                    borderRadius: 'var(--radius-md)',
                    borderLeft: `4px solid ${PRIORITY_COLORS[s.priority]}`
                  }}>
                    <FiBook size={16} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: '600', fontSize: '0.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.name}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        Due {s.deadline} · {s.remainingHours}h remaining ·{' '}
                        <span style={{ color: PRIORITY_COLORS[s.priority] }}>{s.priority}</span>
                      </p>
                    </div>
                    <button
                      onClick={() => removeSubject(s.id)}
                      title="Remove subject"
                      style={{ color: 'var(--accent-danger)', padding: '0.25rem', flexShrink: 0 }}
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* RIGHT – Generated Schedule */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Warnings */}
          {warnings.length > 0 && (
            <div style={{
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-danger)', fontWeight: '600', fontSize: '0.875rem' }}>
                <FiAlertTriangle size={16} />
                Scheduling Warnings
              </div>
              {warnings.map((w, i) => (
                <p key={i} style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', paddingLeft: '1.5rem' }}>{w}</p>
              ))}
            </div>
          )}

          {sessions.length === 0 ? (
            <Card>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '300px',
                color: 'var(--text-muted)',
                textAlign: 'center',
                gap: '1rem'
              }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--bg-tertiary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <FiCalendar size={28} />
                </div>
                <div>
                  <p style={{ fontWeight: '600', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>No schedule yet</p>
                  <p style={{ fontSize: '0.875rem' }}>
                    {subjects.length === 0
                      ? 'Add at least one subject to get started.'
                      : 'Click "Generate Schedule" to build your study plan.'}
                  </p>
                </div>
              </div>
            </Card>
          ) : (
            <>
              {/* Summary bar */}
              <div style={{
                display: 'flex',
                gap: '1.5rem',
                padding: '1rem 1.25rem',
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                flexWrap: 'wrap'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--accent-primary)' }}>{Math.round(totalMinutes / 60 * 10) / 10}h</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>total planned</div>
                </div>
                <div style={{ width: '1px', backgroundColor: 'var(--border-color)' }}></div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--accent-success)' }}>{sessions.length}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>sessions</div>
                </div>
                <div style={{ width: '1px', backgroundColor: 'var(--border-color)' }}></div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--accent-warning)' }}>{sortedDates.length}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>study days</div>
                </div>
              </div>

              {/* Day-by-day schedule */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {sortedDates.map(date => (
                  <div key={date} style={{
                    backgroundColor: 'var(--bg-secondary)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    overflow: 'hidden'
                  }}>
                    {/* Day header */}
                    <div style={{
                      padding: '0.75rem 1rem',
                      borderBottom: '1px solid var(--border-color)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      backgroundColor: 'var(--bg-tertiary)'
                    }}>
                      <span style={{ fontWeight: '600', fontSize: '0.9375rem' }}>{formatDate(date)}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {Math.round(grouped[date].reduce((a, s) => a + s.durationMinutes, 0))} min
                      </span>
                    </div>

                    {/* Sessions for this day */}
                    <div style={{ padding: '0.5rem' }}>
                      {grouped[date].map(session => (
                        <div key={session.id} style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          padding: '0.6rem 0.75rem',
                          borderRadius: 'var(--radius-sm)',
                          transition: 'var(--transition-fast)'
                        }}>
                          <div style={{
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            backgroundColor: PRIORITY_COLORS[session.priority],
                            flexShrink: 0
                          }}></div>
                          <span style={{ flex: 1, fontWeight: '500', fontSize: '0.875rem' }}>{session.subject}</span>
                          <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                            {session.durationMinutes} min
                          </span>
                          <span style={{
                            fontSize: '0.7rem',
                            color: PRIORITY_COLORS[session.priority],
                            padding: '0.15rem 0.5rem',
                            border: `1px solid ${PRIORITY_COLORS[session.priority]}`,
                            borderRadius: 'var(--radius-full)',
                            opacity: 0.8
                          }}>
                            {session.priority}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudyPlanner;
