import React from 'react';

export const MatchScore = ({ score, size = 'md', showLabel = true }) => {
  if (score === null || score === undefined) {
    return (
      <span className="badge badge-neutral" title="Login as a student with completed profile to see match score">
        Score N/A
      </span>
    );
  }

  const numScore = Math.round(Number(score));

  let color = '#ef4444'; // Red < 40
  let bgColor = 'rgba(239, 68, 68, 0.12)';
  let borderColor = 'rgba(239, 68, 68, 0.3)';
  let glowColor = 'rgba(239, 68, 68, 0.2)';
  let matchQuality = 'Low Match';

  if (numScore >= 80) {
    color = '#10b981'; // Green
    bgColor = 'rgba(16, 185, 129, 0.15)';
    borderColor = 'rgba(16, 185, 129, 0.35)';
    glowColor = 'rgba(16, 185, 129, 0.25)';
    matchQuality = 'High Match';
  } else if (numScore >= 60) {
    color = '#06b6d4'; // Cyan
    bgColor = 'rgba(6, 182, 212, 0.15)';
    borderColor = 'rgba(6, 182, 212, 0.35)';
    glowColor = 'rgba(6, 182, 212, 0.25)';
    matchQuality = 'Good Match';
  } else if (numScore >= 40) {
    color = '#f59e0b'; // Amber
    bgColor = 'rgba(245, 158, 11, 0.15)';
    borderColor = 'rgba(245, 158, 11, 0.35)';
    glowColor = 'rgba(245, 158, 11, 0.25)';
    matchQuality = 'Fair Match';
  }

  if (size === 'lg') {
    return (
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.85rem',
        padding: '0.5rem 1rem',
        borderRadius: 'var(--radius-lg)',
        background: bgColor,
        border: `1px solid ${borderColor}`,
        boxShadow: `0 0 16px ${glowColor}`
      }}>
        <div style={{
          width: 52,
          height: 52,
          borderRadius: '50%',
          border: `3px solid ${color}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 800,
          fontSize: '1.25rem',
          color: '#ffffff',
          background: 'rgba(0,0,0,0.3)'
        }}>
          {numScore}%
        </div>
        {showLabel && (
          <div>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>Match Score</div>
            <div style={{ fontWeight: 700, color: color, fontSize: '1rem' }}>{matchQuality}</div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.4rem',
      padding: '0.3rem 0.65rem',
      borderRadius: 'var(--radius-full)',
      background: bgColor,
      border: `1px solid ${borderColor}`,
      color: color,
      fontWeight: 700,
      fontSize: size === 'sm' ? '0.75rem' : '0.85rem'
    }}>
      <span style={{
        display: 'inline-block',
        width: 8,
        height: 8,
        borderRadius: '50%',
        backgroundColor: color
      }} />
      <span>{numScore}% Match</span>
    </div>
  );
};

export default MatchScore;
