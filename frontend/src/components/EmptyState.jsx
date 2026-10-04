import React from 'react';
import { Inbox } from 'lucide-react';

export const EmptyState = ({
  icon: Icon = Inbox,
  title = 'No results found',
  description = 'Try adjusting your filters or search keywords to find what you are looking for.',
  actionLabel,
  onAction
}) => {
  return (
    <div className="glass-panel" style={{
      textAlign: 'center',
      padding: '4rem 2rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      maxWidth: '600px',
      margin: '2rem auto'
    }}>
      <div style={{
        width: 64,
        height: 64,
        borderRadius: '50%',
        background: 'rgba(99, 102, 241, 0.1)',
        border: '1px solid rgba(99, 102, 241, 0.25)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--primary)',
        marginBottom: '1.25rem'
      }}>
        <Icon size={30} />
      </div>
      <h4 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: '#ffffff' }}>{title}</h4>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem', marginBottom: actionLabel ? '1.5rem' : 0, maxWidth: '420px' }}>
        {description}
      </p>
      {actionLabel && onAction && (
        <button onClick={onAction} className="btn btn-primary btn-sm">
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
