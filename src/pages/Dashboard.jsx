import React from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useTasks } from '../hooks/useTasks';
import { useFocusSessions } from '../hooks/useFocusSessions';
import { useStudyPlan } from '../hooks/useStudyPlan';
import { FiPlay, FiPlus, FiClock, FiCheckSquare } from 'react-icons/fi';
import { totalFocusMinutes, filterSessionsByRange, taskStats, minutesBySubject } from '../utils/analytics';

/** Return a time-of-day greeting. */
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { tasks, toggleTaskStatus } = useTasks();
  const { sessions: focusSessions } = useFocusSessions();
  const { sessions: studySessions } = useStudyPlan();

  const remainingTasks = tasks.filter(t => t.status !== 'Done');
  const urgentTasks = tasks.filter(t => t.priority === 'High' && t.status !== 'Done');

  const todayFocusMins = totalFocusMinutes(filterSessionsByRange(focusSessions, 'today'));
  const weekFocusMins  = totalFocusMinutes(filterSessionsByRange(focusSessions, 'week'));
  const todaySessionCount = filterSessionsByRange(focusSessions, 'today').length;
  const tStats = taskStats(tasks);

  // Study progress: top subjects by scheduled minutes from the plan
  const subjectProgress = (() => {
    const COLORS = ['#6366f1','#10b981','#f59e0b','#ef4444','#8b5cf6'];
    const bySubject = studySessions.reduce((acc, s) => {
      acc[s.subject] = (acc[s.subject] || 0) + (s.durationMinutes || 0);
      return acc;
    }, {});
    const total = Object.values(bySubject).reduce((a, b) => a + b, 0) || 1;
    return Object.entries(bySubject)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([name, mins], i) => ({
        id: i, name, color: COLORS[i % COLORS.length],
        progress: Math.round((mins / total) * 100)
      }));
  })();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.25rem' }}>{getGreeting()}!</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            {remainingTasks.length === 0
              ? 'All caught up — great work!'
              : `You have ${remainingTasks.length} task${remainingTasks.length > 1 ? 's' : ''} remaining.`}
          </p>
        </div>
        <Button variant="primary" onClick={() => navigate('/tasks')}>
          <FiPlus /> New Task
        </Button>
      </div>

      <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>

        {/* Focus Stats */}
        <Card title="Today's Focus">
          <div style={{ display: 'flex', gap: '1.5rem', flex: 1, alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.25rem', fontWeight: '700', color: 'var(--accent-primary)', lineHeight: 1 }}>{todayFocusMins}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>min today</div>
            </div>
            <div style={{ width: '1px', height: '40px', backgroundColor: 'var(--border-color)' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.25rem', fontWeight: '700', color: 'var(--accent-success)', lineHeight: 1 }}>{todaySessionCount}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>sessions</div>
            </div>
            <div style={{ width: '1px', height: '40px', backgroundColor: 'var(--border-color)' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.25rem', fontWeight: '700', color: 'var(--accent-warning)', lineHeight: 1 }}>{weekFocusMins}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>min this week</div>
            </div>
          </div>
        </Card>

        {/* Task Overview */}
        <Card title="Task Overview">
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.25rem', fontWeight: '700', color: 'var(--accent-success)', lineHeight: 1 }}>{tStats.done}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>completed</div>
            </div>
            <div style={{ width: '1px', height: '40px', backgroundColor: 'var(--border-color)' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.25rem', fontWeight: '700', color: 'var(--text-primary)', lineHeight: 1 }}>{tStats.remaining}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>remaining</div>
            </div>
            <div style={{ width: '1px', height: '40px', backgroundColor: 'var(--border-color)' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.25rem', fontWeight: '700', color: 'var(--accent-warning)', lineHeight: 1 }}>{tStats.rate}%</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>done rate</div>
            </div>
          </div>
          <Button variant="secondary" style={{ marginTop: '0.5rem' }} onClick={() => navigate('/tasks')}>
            View All Tasks
          </Button>
        </Card>

        {/* Urgent Tasks */}
        <Card title={`Urgent Tasks ${urgentTasks.length > 0 ? `(${urgentTasks.length})` : ''}`}>
          {urgentTasks.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem 0' }}>
              <span>✅ No urgent tasks right now!</span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', overflowY: 'auto', maxHeight: '220px' }}>
              {urgentTasks.slice(0, 5).map(task => (
                <div key={task.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.625rem 0.75rem',
                  backgroundColor: 'var(--bg-tertiary)',
                  borderRadius: 'var(--radius-md)',
                  borderLeft: '3px solid var(--accent-danger)'
                }}>
                  <input
                    type="checkbox"
                    id={`urgent-${task.id}`}
                    checked={task.status === 'Done'}
                    onChange={() => toggleTaskStatus(task.id)}
                    aria-label={`Mark "${task.title}" as complete`}
                    style={{ width: '16px', height: '16px', cursor: 'pointer', flexShrink: 0 }}
                  />
                  <label htmlFor={`urgent-${task.id}`} style={{ flex: 1, overflow: 'hidden', cursor: 'pointer' }}>
                    <p style={{ fontWeight: '500', fontSize: '0.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{task.title}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
                    </p>
                  </label>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Study Plan Progress */}
        <Card title="Study Plan">
          {subjectProgress.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', padding: '1rem 0' }}>
              <p>No study plan generated yet.</p>
              <Button variant="secondary" onClick={() => navigate('/planner')}>Go to Study Planner</Button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {subjectProgress.map(subject => (
                <div key={subject.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '0.8125rem' }}>
                    <span style={{ fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '60%' }}>{subject.name}</span>
                    <span style={{ color: 'var(--text-secondary)', flexShrink: 0 }}>{subject.progress}% of plan</span>
                  </div>
                  <div style={{ height: '7px', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${subject.progress}%`,
                      backgroundColor: subject.color,
                      borderRadius: 'var(--radius-full)',
                      transition: 'width 0.4s ease'
                    }} />
                  </div>
                </div>
              ))}
              <Button variant="secondary" onClick={() => navigate('/calendar')}>View Calendar</Button>
            </div>
          )}
        </Card>

      </div>
    </div>
  );
};

export default Dashboard;
