import React from 'react';

export const StatusBadge = ({ status }) => {
  const getBadgeClass = (s) => {
    switch ((s || '').toLowerCase()) {
      case 'accepted':
        return 'badge-success';
      case 'interviewing':
        return 'badge-primary';
      case 'under review':
        return 'badge-warning';
      case 'applied':
        return 'badge-info';
      case 'rejected':
        return 'badge-danger';
      default:
        return 'badge-neutral';
    }
  };

  return (
    <span className={`badge ${getBadgeClass(status)}`}>
      <span style={{
        width: 6,
        height: 6,
        borderRadius: '50%',
        backgroundColor: 'currentColor'
      }} />
      {status || 'Unknown'}
    </span>
  );
};

export default StatusBadge;
