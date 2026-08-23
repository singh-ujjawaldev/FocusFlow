import React, { useState } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useTasks } from '../hooks/useTasks';
import { usePomodoro } from '../hooks/usePomodoro';
import { useFocusSessions } from '../hooks/useFocusSessions';
import { FiPlay, FiPause, FiSquare, FiSkipForward, FiSettings } from 'react-icons/fi';

const FocusTimer = () => {
  const { tasks, updateTask } = useTasks();
  const { sessions, addSession } = useFocusSessions();
  const [selectedTaskId, setSelectedTaskId] = useState('');

  // Handle when a timer hits 0
  const handleSessionComplete = (durationMinutes) => {
    // Only log focus sessions, not breaks
    if (durationMinutes > 0 && selectedTaskId) {
      const task = tasks.find(t => t.id === selectedTaskId);
      if (task) {
        addSession({
          taskId: task.id,
          taskTitle: task.title,
          subject: task.subject,
          duration: durationMinutes,
          startedAt: new Date(Date.now() - durationMinutes * 60 * 1000).toISOString() 
        });
      }
    } else if (durationMinutes > 0) {
      // No task selected, but still completed a focus session
      addSession({
        taskId: null,
        taskTitle: 'Unassigned Focus Session',
        subject: '',
        duration: durationMinutes,
        startedAt: new Date(Date.now() - durationMinutes * 60 * 1000).toISOString()
      });
    }
  };

  const {
    mode,
    timeLeft,
    isRunning,
    completedFocusSessions,
    start,
    pause,
    reset,
    skip,
    setMode
  } = usePomodoro(handleSessionComplete);

  const handleStart = () => {
    // Update task status if it's 'Todo'
    if (selectedTaskId && mode === 'Focus') {
      const task = tasks.find(t => t.id === selectedTaskId);
      if (task && task.status === 'Todo') {
        updateTask(task.id, { status: 'In Progress' });
      }
    }
    start();
  };

  // Formatting time
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const renderModeButton = (label, modeName) => {
    const isActive = mode === modeName;
    return (
      <button 
        onClick={() => {
          if (isRunning) pause();
          setMode(modeName);
        }}
        style={{ 
          padding: '0.5rem 1.5rem', 
          borderRadius: 'var(--radius-full)', 
          backgroundColor: isActive ? 'var(--accent-primary)' : 'transparent', 
          color: isActive ? '#fff' : 'var(--text-secondary)', 
          fontWeight: '500',
          transition: 'var(--transition-fast)'
        }}
      >
        {label}
      </button>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3rem', height: '100%', overflowY: 'auto', paddingBottom: '2rem' }}>
      
      <div style={{ width: '100%', maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: '700' }}>Focus Timer</h1>
          <div style={{ color: 'var(--text-secondary)' }}>
            Completed Sessions: <span style={{ color: 'var(--accent-primary)', fontWeight: 'bold' }}>{completedFocusSessions}</span>
          </div>
        </div>

        <Card style={{ padding: '3rem', alignItems: 'center', gap: '2rem' }}>
          
          <div style={{ display: 'flex', gap: '0.5rem', backgroundColor: 'var(--bg-tertiary)', padding: '0.5rem', borderRadius: 'var(--radius-full)' }}>
            {renderModeButton('Focus', 'Focus')}
            {renderModeButton('Short Break', 'Short Break')}
            {renderModeButton('Long Break', 'Long Break')}
          </div>

          <div style={{ 
            fontSize: '6rem', 
            fontWeight: '700', 
            fontVariantNumeric: 'tabular-nums',
            letterSpacing: '-2px',
            color: 'var(--text-primary)',
            textShadow: '0 4px 24px rgba(99, 102, 241, 0.2)'
          }}>
            {timeString}
          </div>

          {/* Task Selector */}
          {mode === 'Focus' && (
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
              <label style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Select a Task to Work On</label>
              <select 
                value={selectedTaskId} 
                onChange={(e) => setSelectedTaskId(e.target.value)}
                disabled={isRunning}
                style={{
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  width: '80%',
                  fontFamily: 'inherit'
                }}
              >
                <option value="">-- No specific task --</option>
                {tasks.filter(t => t.status !== 'Done').map(task => (
                  <option key={task.id} value={task.id}>
                    {task.title} {task.subject ? `(${task.subject})` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            {isRunning ? (
              <Button variant="secondary" onClick={pause} style={{ padding: '1rem 2rem', fontSize: '1.125rem', borderRadius: 'var(--radius-full)' }}>
                <FiPause size={20} /> Pause
              </Button>
            ) : (
              <Button variant="primary" onClick={handleStart} style={{ padding: '1rem 2rem', fontSize: '1.125rem', borderRadius: 'var(--radius-full)' }}>
                <FiPlay size={20} /> Start
              </Button>
            )}

            <Button variant="secondary" onClick={reset} title="Reset Timer" style={{ width: '56px', height: '56px', borderRadius: '50%', padding: 0 }}>
               <FiSquare size={20} />
            </Button>

            <Button variant="ghost" onClick={skip} title="Skip to Next Mode" style={{ width: '56px', height: '56px', borderRadius: '50%', padding: 0 }}>
               <FiSkipForward size={20} />
            </Button>
          </div>
        </Card>
      </div>

      {/* Recent Sessions */}
      <div style={{ width: '100%', maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Recent Focus Sessions</h2>
        {sessions.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No completed sessions yet. Start focusing!</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {sessions.slice(0, 10).map((session) => (
              <div key={session.id} style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                padding: '1rem',
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                alignItems: 'center'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontWeight: '500' }}>{session.taskTitle}</span>
                  {session.subject && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{session.subject}</span>}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  <span>{session.duration} minutes</span>
                  <span style={{ fontSize: '0.75rem' }}>{new Date(session.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default FocusTimer;
