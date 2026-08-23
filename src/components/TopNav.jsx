import React from 'react';
import { FiBell, FiUser } from 'react-icons/fi';

const TopNav = () => {
  return (
    <div style={{
      height: '72px',
      padding: '0 2rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottom: '1px solid var(--border-color)',
      backgroundColor: 'var(--bg-primary)',
      position: 'sticky',
      top: 0,
      zIndex: 10,
    }}>
      <div style={{ flex: 1 }}></div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button style={{
          position: 'relative',
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-secondary)',
          backgroundColor: 'transparent',
          border: '1px solid var(--border-color)',
          transition: 'var(--transition-fast)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = 'var(--text-primary)';
          e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'var(--text-secondary)';
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
        >
          <FiBell size={18} />
          <span style={{
            position: 'absolute',
            top: '8px',
            right: '10px',
            width: '8px',
            height: '8px',
            backgroundColor: 'var(--accent-danger)',
            borderRadius: '50%',
            border: '2px solid var(--bg-primary)'
          }}></span>
        </button>

        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          backgroundColor: 'var(--bg-tertiary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '2px solid var(--accent-primary)',
          cursor: 'pointer'
        }}>
          <FiUser size={18} />
        </div>
      </div>
    </div>
  );
};

export default TopNav;
