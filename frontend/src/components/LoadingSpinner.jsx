import React from 'react';

export const LoadingSpinner = ({ message = 'Loading data...', size = 32 }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '3rem 1rem',
      gap: '1rem',
      color: 'var(--text-muted)'
    }}>
      <div style={{
        width: size,
        height: size,
        borderRadius: '50%',
        border: '3px solid rgba(99, 102, 241, 0.2)',
        borderTopColor: 'var(--primary)',
        animation: 'spin 0.8s linear infinite'
      }} />
      <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{message}</span>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner;
