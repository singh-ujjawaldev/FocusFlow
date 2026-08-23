import React, { useState } from 'react';
import Card from '../components/ui/Card';
import { useTasks } from '../hooks/useTasks';
import { useFocusSessions } from '../hooks/useFocusSessions';
import { useStudyPlan } from '../hooks/useStudyPlan';
import {
  filterSessionsByRange,
  filterTasksByRange,
  totalFocusMinutes,
  minutesBySubject,
  weeklyFocusData,
  taskStats,
  plannedVsActual
} from '../utils/analytics';
import { FiClock, FiCheckSquare, FiTrendingUp, FiBook, FiActivity } from 'react-icons/fi';

/* ─── tiny inline SVG bar chart ──────────────────────────────
   Pure CSS bars — no library needed. Heights are percentages
   of the tallest bar so the chart always fills its container. */
const BarChart = ({ data, color = 'var(--accent-primary)', height = 160 }) => {
  const max = Math.max(...data.map(d => d.minutes), 1); // avoid divide-by-zero
  const hasData = data.some(d => d.minutes > 0);

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: `${height}px`, width: '100%' }}>
      {data.map((d, i) => {
        const pct = d.minutes / max;
        const barH = hasData ? Math.max(pct * (height - 24), 2) : 0; // 24px reserved for label
        return (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', height: '100%', justifyContent: 'flex-end' }}>
            {d.minutes > 0 && (
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', lineHeight: 1 }}>{d.minutes}m</span>
            )}
            <div
              title={`${d.label}: ${d.minutes} min`}
              style={{
                width: '100%',
                height: `${barH}px`,
                backgroundColor: color,
                borderRadius: '4px 4px 0 0',
                opacity: d.minutes === 0 ? 0.15 : 1,
                transition: 'height 0.3s ease',
                minHeight: '3px'
              }}
            />
            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{d.label}</span>
          </div>
        );
      })}
    </div>
  );
};

/* ─── horizontal bar (subject breakdown) ──────────────────── */
const HorizBar = ({ label, minutes, maxMinutes, color }) => {
  const pct = maxMinutes > 0 ? (minutes / maxMinutes) * 100 : 0;
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '0.8125rem' }}>
        <span style={{ fontWeight: '500' }}>{label}</span>
        <span style={{ color: 'var(--text-secondary)' }}>{minutes} min</span>
      </div>
      <div style={{ height: '10px', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          backgroundColor: color,
          borderRadius: 'var(--radius-full)',
          transition: 'width 0.4s ease'
        }} />
      </div>
    </div>
  );
};

/* ─── stat card ───────────────────────────────────────────── */
const StatCard = ({ icon, label, value, unit, color }) => (
  <Card>
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <div style={{
        width: '48px', height: '48px',
        borderRadius: '12px',
        backgroundColor: `${color}20`,
        color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0
      }}>
        {icon}
      </div>
      <div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', fontWeight: '500', marginBottom: '0.15rem' }}>{label}</p>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
          <span style={{ fontSize: '1.75rem', fontWeight: '700', lineHeight: 1 }}>{value}</span>
          {unit && <span style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>{unit}</span>}
        </div>
      </div>
    </div>
  </Card>
);

/* ─── range pill filter ───────────────────────────────────── */
const RangePill = ({ current, value, label, onChange }) => (
  <button
    onClick={() => onChange(value)}
    style={{
      padding: '0.35rem 1rem',
      borderRadius: 'var(--radius-full)',
      fontSize: '0.8125rem',
      fontWeight: '500',
      backgroundColor: current === value ? 'var(--accent-primary)' : 'rgba(255,255,255,0.05)',
      color: current === value ? '#fff' : 'var(--text-secondary)',
      border: `1px solid ${current === value ? 'var(--accent-primary)' : 'var(--border-color)'}`,
      transition: 'var(--transition-fast)'
    }}
  >
    {label}
  </button>
);

/* ─── accent colour palette for subjects ─────────────────── */
const SUBJECT_COLORS = [
  'var(--accent-primary)',
  'var(--accent-secondary)',
  'var(--accent-success)',
  'var(--accent-warning)',
  'var(--accent-danger)',
  '#a78bfa',
  '#34d399',
  '#60a5fa'
];

/* ═══════════════════════════════════════════════════════════
   ANALYTICS PAGE
═══════════════════════════════════════════════════════════ */
const Analytics = () => {
  const { tasks } = useTasks();
  const { sessions: focusSessions } = useFocusSessions();
  const { sessions: studySessions } = useStudyPlan();

  const [range, setRange] = useState('week'); // 'today' | 'week' | 'all'

  /* ── derived data ── */
  const filteredFocus = filterSessionsByRange(focusSessions, range);
  const filteredTasks = filterTasksByRange(tasks, range);

  const focusMinutes = totalFocusMinutes(filteredFocus);
  const focusHrs = (focusMinutes / 60).toFixed(1);

  const subjectData = minutesBySubject(filteredFocus);
  const subjectMax = subjectData[0]?.minutes || 1;

  const weekData = weeklyFocusData(focusSessions); // always last 7 days regardless of range
  const tStats = taskStats(tasks); // overall task stats (not range-filtered)
  const pvA = plannedVsActual(studySessions, focusSessions);

  const hasAnyFocusData = focusSessions.length > 0;
  const hasFilteredData = filteredFocus.length > 0;

  /* ─── render ── */
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

      {/* Header + Range Filter */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.25rem' }}>Analytics</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Insights from your real tasks and focus sessions.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', backgroundColor: 'var(--bg-secondary)', padding: '0.375rem', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-color)' }}>
          <RangePill current={range} value="today" label="Today" onChange={setRange} />
          <RangePill current={range} value="week" label="This Week" onChange={setRange} />
          <RangePill current={range} value="all" label="All Time" onChange={setRange} />
        </div>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <StatCard
          icon={<FiClock size={22} />}
          label="Focus Time"
          value={focusHrs}
          unit="hrs"
          color="var(--accent-primary)"
        />
        <StatCard
          icon={<FiActivity size={22} />}
          label="Focus Sessions"
          value={filteredFocus.length}
          unit=""
          color="var(--accent-secondary)"
        />
        <StatCard
          icon={<FiCheckSquare size={22} />}
          label="Tasks Completed"
          value={range === 'all' ? tStats.done : filteredTasks.length}
          unit=""
          color="var(--accent-success)"
        />
        <StatCard
          icon={<FiTrendingUp size={22} />}
          label="Completion Rate"
          value={tStats.rate}
          unit="%"
          color="var(--accent-warning)"
        />
      </div>

      {/* Empty state — no data at all */}
      {!hasAnyFocusData && (
        <div style={{
          padding: '3rem',
          textAlign: 'center',
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          color: 'var(--text-muted)'
        }}>
          <FiActivity size={40} style={{ marginBottom: '1rem', opacity: 0.4 }} />
          <p style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '1rem', marginBottom: '0.5rem' }}>
            No focus data yet
          </p>
          <p style={{ fontSize: '0.875rem' }}>Complete a focus session to start building your productivity history.</p>
        </div>
      )}

      {/* Charts row */}
      {hasAnyFocusData && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>

          {/* Weekly focus bar chart */}
          <Card title="Focus Time — Last 7 Days">
            {weekData.every(d => d.minutes === 0) ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', padding: '2rem 0', textAlign: 'center' }}>
                No focus sessions in the past 7 days.
              </p>
            ) : (
              <>
                <BarChart data={weekData} color="var(--accent-primary)" height={160} />
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'right', marginTop: '0.5rem' }}>
                  Total: {weekData.reduce((a, d) => a + d.minutes, 0)} min
                </p>
              </>
            )}
          </Card>

          {/* Subject breakdown */}
          <Card title="Focus by Subject">
            {subjectData.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', padding: '2rem 0', textAlign: 'center' }}>
                {hasFilteredData ? 'No subject data for this range.' : 'No sessions in this range.'}
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                {subjectData.slice(0, 8).map((d, i) => (
                  <HorizBar
                    key={d.subject}
                    label={d.subject}
                    minutes={d.minutes}
                    maxMinutes={subjectMax}
                    color={SUBJECT_COLORS[i % SUBJECT_COLORS.length]}
                  />
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Task completion + Planned vs Actual row */}
      {(tasks.length > 0 || studySessions.length > 0) && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>

          {/* Task completion donut-style summary */}
          {tasks.length > 0 && (
            <Card title="Task Completion">
              <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap' }}>
                {/* Visual ring using conic-gradient */}
                <div style={{
                  width: '110px',
                  height: '110px',
                  borderRadius: '50%',
                  background: `conic-gradient(var(--accent-success) 0% ${tStats.rate}%, var(--bg-tertiary) ${tStats.rate}% 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <div style={{
                    width: '74px', height: '74px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--bg-secondary)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <span style={{ fontSize: '1.25rem', fontWeight: '700', lineHeight: 1 }}>{tStats.rate}%</span>
                    <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>done</span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
                  {[
                    { label: 'Completed', value: tStats.done, color: 'var(--accent-success)' },
                    { label: 'Remaining', value: tStats.remaining, color: 'var(--text-muted)' },
                    { label: 'Total', value: tStats.total, color: 'var(--text-secondary)' }
                  ].map(row => (
                    <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>{row.label}</span>
                      <span style={{ fontWeight: '600', color: row.color }}>{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {/* Planned vs Actual */}
          {studySessions.length > 0 && (
            <Card title="Planned vs Actual Focus">
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                Planned = study plan total · Actual = recorded focus sessions (all time)
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {[
                  { label: 'Planned', minutes: pvA.planned, color: 'var(--accent-secondary)' },
                  { label: 'Actual', minutes: pvA.actual, color: 'var(--accent-primary)' }
                ].map(row => (
                  <div key={row.label}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '0.25rem' }}>
                      <span style={{ fontWeight: '500' }}>{row.label}</span>
                      <span style={{ color: 'var(--text-secondary)' }}>{Math.round(row.minutes / 60 * 10) / 10} hrs ({row.minutes} min)</span>
                    </div>
                    <div style={{ height: '10px', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        width: `${Math.min((row.minutes / Math.max(pvA.planned, pvA.actual, 1)) * 100, 100)}%`,
                        backgroundColor: row.color,
                        borderRadius: 'var(--radius-full)',
                        transition: 'width 0.4s ease'
                      }} />
                    </div>
                  </div>
                ))}
              </div>
              {pvA.actual > pvA.planned && pvA.planned > 0 && (
                <p style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--accent-success)' }}>
                  🎉 You've exceeded your planned study time!
                </p>
              )}
              {pvA.actual === 0 && (
                <p style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Start focus sessions to track actual study time.
                </p>
              )}
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default Analytics;
