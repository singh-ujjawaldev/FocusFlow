import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  FiHome, 
  FiCheckSquare, 
  FiBookOpen, 
  FiClock, 
  FiCalendar, 
  FiPieChart
} from 'react-icons/fi';

const BottomNav = () => {
  const navItems = [
    { name: 'Home', path: '/', icon: <FiHome size={20} /> },
    { name: 'Tasks', path: '/tasks', icon: <FiCheckSquare size={20} /> },
    { name: 'Planner', path: '/planner', icon: <FiBookOpen size={20} /> },
    { name: 'Timer', path: '/timer', icon: <FiClock size={20} /> },
    { name: 'Calendar', path: '/calendar', icon: <FiCalendar size={20} /> },
    { name: 'Stats', path: '/analytics', icon: <FiPieChart size={20} /> },
  ];

  return (
    <div className="bottom-nav-mobile" style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      height: '64px',
      backgroundColor: 'var(--bg-secondary)',
      borderTop: '1px solid var(--border-color)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-around',
      zIndex: 50,
      padding: '0 0.5rem'
    }}>
      {navItems.map((item) => (
        <NavLink
          key={item.name}
          to={item.path}
          style={({ isActive }) => ({
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.25rem',
            color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
            textDecoration: 'none',
            flex: 1,
            height: '100%',
            transition: 'var(--transition-fast)'
          })}
        >
          {item.icon}
          <span style={{ fontSize: '10px', fontWeight: '500' }}>{item.name}</span>
        </NavLink>
      ))}
    </div>
  );
};

export default BottomNav;
