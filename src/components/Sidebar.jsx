import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  FiHome, 
  FiCheckSquare, 
  FiBookOpen, 
  FiClock, 
  FiCalendar, 
  FiPieChart,
  FiSettings
} from 'react-icons/fi';

const Sidebar = () => {
  const navItems = [
    { name: 'Dashboard', path: '/', icon: <FiHome size={20} /> },
    { name: 'Tasks', path: '/tasks', icon: <FiCheckSquare size={20} /> },
    { name: 'Study Planner', path: '/planner', icon: <FiBookOpen size={20} /> },
    { name: 'Focus Timer', path: '/timer', icon: <FiClock size={20} /> },
    { name: 'Calendar', path: '/calendar', icon: <FiCalendar size={20} /> },
    { name: 'Analytics', path: '/analytics', icon: <FiPieChart size={20} /> },
  ];

  return (
    <div style={{
      width: '260px',
      height: '100vh',
      backgroundColor: 'var(--bg-secondary)',
      borderRight: '1px solid var(--border-color)',
      display: 'flex',
      flexDirection: 'column',
      padding: '1.5rem',
      position: 'sticky',
      top: 0,
    }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '0.75rem',
        marginBottom: '2.5rem',
        padding: '0 0.5rem'
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '8px',
          background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontWeight: 'bold',
          fontSize: '18px'
        }}>
          F
        </div>
        <span style={{ fontSize: '1.25rem', fontWeight: '700', letterSpacing: '-0.5px' }}>
          FocusFlow
        </span>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              color: isActive ? '#fff' : 'var(--text-secondary)',
              backgroundColor: isActive ? 'var(--accent-primary)' : 'transparent',
              fontWeight: isActive ? '600' : '500',
              transition: 'var(--transition-fast)',
              textDecoration: 'none'
            })}
            className="sidebar-link"
          >
            {item.icon}
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
        <button style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '0.75rem 1rem',
          width: '100%',
          borderRadius: 'var(--radius-md)',
          color: 'var(--text-secondary)',
          fontWeight: '500',
          transition: 'var(--transition-fast)',
          textAlign: 'left'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
          e.currentTarget.style.color = 'var(--text-primary)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.color = 'var(--text-secondary)';
        }}
        >
          <FiSettings size={20} />
          <span>Settings</span>
        </button>
      </div>

      <style>{`
        .sidebar-link:hover:not(.active) {
          background-color: rgba(255,255,255,0.05) !important;
          color: var(--text-primary) !important;
        }
      `}</style>
    </div>
  );
};

export default Sidebar;
