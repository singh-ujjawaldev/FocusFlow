import { useState, useEffect } from 'react';


const LOCAL_STORAGE_KEY = 'focusflow_tasks';

export const useTasks = () => {
  const [tasks, setTasks] = useState(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to load tasks from local storage', e);
    }
    // Fallback to empty array if empty or on parse error
    return [];
  });

  // Sync to local storage whenever tasks change
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(tasks));
    } catch (e) {
      console.error('Failed to save tasks to local storage', e);
    }
  }, [tasks]);

  const addTask = (newTask) => {
    const task = {
      ...newTask,
      id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
      status: newTask.status || 'Todo',
      createdAt: new Date().toISOString()
    };
    setTasks(prev => [...prev, task]);
  };

  const updateTask = (id, updatedFields) => {
    setTasks(prev => prev.map(task => 
      task.id === id ? { ...task, ...updatedFields } : task
    ));
  };

  const deleteTask = (id) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  };

  const toggleTaskStatus = (id) => {
    setTasks(prev => prev.map(task => {
      if (task.id === id) {
        // Simple toggle logic: Todo/In Progress -> Done. Done -> Todo.
        const newStatus = task.status === 'Done' ? 'Todo' : 'Done';
        return { 
          ...task, 
          status: newStatus,
          completedAt: newStatus === 'Done' ? new Date().toISOString() : null
        };
      }
      return task;
    }));
  };

  return {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskStatus
  };
};
