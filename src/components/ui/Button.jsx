import React from 'react';

/**
 * Button component with primary, secondary, danger, and ghost variants.
 * 
 * Bug fix: hover handlers now use e.currentTarget (the button itself)
 * instead of e.target (which could be a child icon element).
 * Also added disabled styling and cursor management.
 */
const Button = ({ children, variant = 'primary', className = '', disabled = false, style = {}, ...props }) => {
  const baseStyle = {
    padding: '0.5rem 1rem',
    borderRadius: 'var(--radius-md)',
    fontWeight: '500',
    fontSize: '0.875rem',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    transition: 'var(--transition-fast)',
    border: '1px solid transparent',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    pointerEvents: disabled ? 'none' : 'auto',
  };

  const variants = {
    primary: {
      backgroundColor: 'var(--accent-primary)',
      color: '#fff',
    },
    secondary: {
      backgroundColor: 'transparent',
      border: '1px solid var(--border-color)',
      color: 'var(--text-primary)',
    },
    danger: {
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      color: 'var(--accent-danger)',
      border: '1px solid rgba(239, 68, 68, 0.2)',
    },
    ghost: {
      backgroundColor: 'transparent',
      color: 'var(--text-secondary)',
    }
  };

  const currentVariantStyle = variants[variant] || variants.primary;

  // Use e.currentTarget so the hover always targets the button, not a child icon
  const handleMouseEnter = (e) => {
    if (disabled) return;
    if (variant === 'primary') e.currentTarget.style.backgroundColor = 'var(--accent-primary-hover)';
    if (variant === 'secondary' || variant === 'ghost') {
      e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
      e.currentTarget.style.color = 'var(--text-primary)';
    }
    if (variant === 'danger') {
      e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.2)';
    }
  };

  const handleMouseLeave = (e) => {
    if (disabled) return;
    if (variant === 'primary') e.currentTarget.style.backgroundColor = 'var(--accent-primary)';
    if (variant === 'secondary') {
      e.currentTarget.style.backgroundColor = 'transparent';
      e.currentTarget.style.color = 'var(--text-primary)';
    }
    if (variant === 'ghost') {
      e.currentTarget.style.backgroundColor = 'transparent';
      e.currentTarget.style.color = 'var(--text-secondary)';
    }
    if (variant === 'danger') {
      e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
    }
  };

  return (
    <button
      style={{ ...baseStyle, ...currentVariantStyle, ...style }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      disabled={disabled}
      className={className}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
