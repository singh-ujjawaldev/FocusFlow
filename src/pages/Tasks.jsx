import React, { useState, useMemo } from 'react';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { useTasks } from '../hooks/useTasks';
import { FiPlus, FiMoreHorizontal, FiTrash2, FiEdit2, FiCheckSquare } from 'react-icons/fi';

const Tasks = () => {
  const { tasks, addTask, updateTask, deleteTask, toggleTaskStatus } = useTasks();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  
  // Filtering & Sorting State
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterPriority, setFilterPriority] = useState('All');
  const [sortBy, setSortBy] = useState('dueDate'); // 'dueDate', 'priority'

  // Form State
  const initialFormState = {
    title: '',
    description: '',
    subject: '',
    priority: 'Medium',
    dueDate: '',
    estimatedDuration: 30,
    status: 'Todo'
  };
  const [formData, setFormData] = useState(initialFormState);

  // Open modal for edit
  const handleEditClick = (task) => {
    setEditingTask(task);
    setFormData(task);
    setIsModalOpen(true);
  };

  // Open modal for new
  const handleNewClick = () => {
    setEditingTask(null);
    setFormData(initialFormState);
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (editingTask) {
      updateTask(editingTask.id, formData);
    } else {
      addTask(formData);
    }
    setIsModalOpen(false);
  };

  // Filter and Sort Logic
  const filteredAndSortedTasks = useMemo(() => {
    let result = [...tasks];

    // Filter
    if (filterStatus !== 'All') result = result.filter(t => t.status === filterStatus);
    if (filterPriority !== 'All') result = result.filter(t => t.priority === filterPriority);

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'priority') {
        const pValues = { 'High': 3, 'Medium': 2, 'Low': 1 };
        return (pValues[b.priority] || 0) - (pValues[a.priority] || 0);
      }
      if (sortBy === 'dueDate') {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
      }
      return 0;
    });

    return result;
  }, [tasks, filterStatus, filterPriority, sortBy]);

  const getStatusColor = (status) => {
    switch(status) {
      case 'Done': return 'var(--accent-success)';
      case 'In Progress': return 'var(--accent-warning)';
      default: return 'var(--text-muted)';
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'High': return 'var(--accent-danger)';
      case 'Medium': return 'var(--accent-warning)';
      case 'Low': return 'var(--accent-success)';
      default: return 'var(--text-muted)';
    }
  };

  const FilterPill = ({ label, current, options, onChange }) => (
    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginRight: '0.25rem' }}>{label}:</span>
      {options.map(opt => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          style={{
            padding: '0.25rem 0.75rem',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.75rem',
            fontWeight: '500',
            backgroundColor: current === opt ? 'var(--accent-primary)' : 'rgba(255,255,255,0.05)',
            color: current === opt ? '#fff' : 'var(--text-primary)',
            border: `1px solid ${current === opt ? 'var(--accent-primary)' : 'var(--border-color)'}`,
            transition: 'var(--transition-fast)'
          }}
        >
          {opt}
        </button>
      ))}
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '700' }}>Tasks</h1>
        <Button variant="primary" onClick={handleNewClick}>
          <FiPlus /> New Task
        </Button>
      </div>
      
      {/* Filters and Actions */}
      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'center', backgroundColor: 'var(--bg-secondary)', padding: '1rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
        
        <FilterPill 
          label="Status" 
          current={filterStatus} 
          options={['All', 'Todo', 'In Progress', 'Done']} 
          onChange={setFilterStatus} 
        />
        
        <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--border-color)' }}></div>

        <FilterPill 
          label="Priority" 
          current={filterPriority} 
          options={['All', 'High', 'Medium', 'Low']} 
          onChange={setFilterPriority} 
        />
        
        <div style={{ flex: 1 }}></div>

        <select 
          value={sortBy} 
          onChange={e => setSortBy(e.target.value)}
          style={selectStyle}
        >
          <option value="dueDate">Sort: Due Date</option>
          <option value="priority">Sort: Priority</option>
        </select>
        
      </div>

      <div className="card-panel" style={{ 
        flex: 1, 
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-sm)',
        borderRadius: 'var(--radius-lg)', 
        padding: '1.5rem',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {tasks.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
             <FiCheckSquare size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
             <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>No tasks yet</h3>
             <p>Create a task to get started.</p>
          </div>
        ) : filteredAndSortedTasks.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
             <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>No tasks found</h3>
             <p>Try adjusting your filters.</p>
          </div>
        ) : (
          <>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '3fr 2fr 2fr 1fr 1fr 1fr', 
              gap: '1rem',
              paddingBottom: '1rem',
              borderBottom: '1px solid var(--border-color)',
              color: 'var(--text-secondary)',
              fontWeight: '500',
              fontSize: '0.875rem'
            }}>
              <div>Task Name</div>
              <div>Subject</div>
              <div>Due Date</div>
              <div>Priority</div>
              <div>Status</div>
              <div style={{ textAlign: 'right' }}>Actions</div>
            </div>
            
            <div style={{ overflowY: 'auto', flex: 1, marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {filteredAndSortedTasks.map(task => (
                <div key={task.id} style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '3fr 2fr 2fr 1fr 1fr 1fr', 
                  gap: '1rem',
                  alignItems: 'center',
                  padding: '1rem',
                  backgroundColor: 'var(--bg-tertiary)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.875rem',
                  transition: 'var(--transition-fast)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <input 
                      type="checkbox" 
                      checked={task.status === 'Done'} 
                      onChange={() => toggleTaskStatus(task.id)}
                      style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: 'var(--accent-primary)' }} 
                    />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: '500', textDecoration: task.status === 'Done' ? 'line-through' : 'none', color: task.status === 'Done' ? 'var(--text-secondary)' : 'var(--text-primary)' }}>
                        {task.title}
                      </span>
                      {task.description && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>
                          {task.description}
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ color: 'var(--text-secondary)' }}>{task.subject}</div>
                  <div style={{ color: 'var(--text-secondary)' }}>
                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}
                  </div>
                  <div>
                    <span style={{ 
                      padding: '0.25rem 0.5rem', 
                      borderRadius: 'var(--radius-full)', 
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      color: getPriorityColor(task.priority),
                      fontSize: '0.75rem',
                      fontWeight: '600'
                    }}>
                      {task.priority}
                    </span>
                  </div>
                  <div>
                    <span style={{ 
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.375rem',
                      color: getStatusColor(task.status),
                      cursor: 'pointer'
                    }} onClick={() => toggleTaskStatus(task.id)}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: getStatusColor(task.status) }}></div>
                      {task.status}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                    <button onClick={() => handleEditClick(task)} style={{ color: 'var(--text-secondary)', padding: '0.25rem' }}><FiEdit2 size={16} /></button>
                    <button onClick={() => deleteTask(task.id)} style={{ color: 'var(--accent-danger)', padding: '0.25rem' }}><FiTrash2 size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingTask ? "Edit Task" : "Create New Task"}>
        <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          <input 
            type="text" 
            placeholder="Task Title" 
            required
            value={formData.title}
            onChange={e => setFormData({...formData, title: e.target.value})}
            style={inputStyle} 
          />
          
          <textarea 
            placeholder="Description (Optional)" 
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
            style={{...inputStyle, minHeight: '80px', resize: 'vertical'}} 
          />
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Subject</label>
              <input 
                type="text"
                placeholder="e.g. Calculus"
                value={formData.subject}
                onChange={e => setFormData({...formData, subject: e.target.value})}
                style={inputStyle}
              />
            </div>
            
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Priority</label>
              <select 
                value={formData.priority}
                onChange={e => setFormData({...formData, priority: e.target.value})}
                style={inputStyle}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Due Date</label>
              <input 
                type="date" 
                value={formData.dueDate}
                onChange={e => setFormData({...formData, dueDate: e.target.value})}
                style={inputStyle} 
              />
            </div>
            
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Est. Duration (mins)</label>
              <input 
                type="number" 
                min="5" step="5"
                value={formData.estimatedDuration}
                onChange={e => setFormData({...formData, estimatedDuration: parseInt(e.target.value) || 0})}
                style={inputStyle} 
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">{editingTask ? "Save Changes" : "Create Task"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

const inputStyle = {
  padding: '0.75rem',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--border-color)',
  backgroundColor: 'var(--bg-primary)',
  color: 'var(--text-primary)',
  outline: 'none',
  width: '100%',
  fontFamily: 'inherit'
};

const selectStyle = {
  ...inputStyle,
  width: 'auto',
  padding: '0.5rem 1rem',
  fontSize: '0.875rem'
};

export default Tasks;
