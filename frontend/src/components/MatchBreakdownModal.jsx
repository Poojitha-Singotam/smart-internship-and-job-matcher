import React from 'react';
import Modal from './Modal';
import { CheckCircle2, AlertTriangle, Sparkles, BookOpen, MapPin, Briefcase, Award, GraduationCap } from 'lucide-react';

export const MatchBreakdownModal = ({ isOpen, onClose, jobTitle, company, matchData }) => {
  if (!matchData) return null;

  const { total_score, breakdown, explanation } = matchData;
  const { skills, eligibility, education, role_preference, location_preference, experience } = breakdown || {};

  const categories = [
    {
      name: 'Technical Skills',
      icon: Sparkles,
      score: skills?.score || 0,
      max: skills?.max || 40,
      color: '#6366f1'
    },
    {
      name: 'Academic Eligibility (CGPA & Batch)',
      icon: Award,
      score: eligibility?.score || 0,
      max: eligibility?.max || 25,
      color: '#10b981'
    },
    {
      name: 'Branch / Education',
      icon: GraduationCap,
      score: education?.score || 0,
      max: education?.max || 15,
      color: '#06b6d4'
    },
    {
      name: 'Role Preference Alignment',
      icon: Briefcase,
      score: role_preference?.score || 0,
      max: role_preference?.max || 10,
      color: '#f59e0b'
    },
    {
      name: 'Location Match',
      icon: MapPin,
      score: location_preference?.score || 0,
      max: location_preference?.max || 5,
      color: '#ec4899'
    },
    {
      name: 'Experience Compatibility',
      icon: BookOpen,
      score: experience?.score || 0,
      max: experience?.max || 5,
      color: '#8b5cf6'
    }
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Why This Match? — Transparent Scoring Breakdown" maxWidth="660px">
      {/* Header Banner */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.85rem 1.15rem',
        borderRadius: 'var(--radius-sm)',
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(6, 182, 212, 0.12) 100%)',
        border: '1px solid rgba(99, 102, 241, 0.25)',
        marginBottom: '1rem'
      }}>
        <div style={{ minWidth: 0 }}>
          <h4 style={{ fontSize: '1.05rem', color: '#ffffff', marginBottom: '0.15rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{jobTitle}</h4>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{company}</p>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, lineHeight: 1, color: total_score >= 80 ? '#10b981' : total_score >= 60 ? '#06b6d4' : '#f59e0b' }}>
            {total_score}%
          </div>
          <span style={{ fontSize: '0.675rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
            Calculated Match
          </span>
        </div>
      </div>

      {/* Point Distribution Breakdown */}
      <div style={{ marginBottom: '1.1rem' }}>
        <h5 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Rule-Based Score Breakdown (100 Pts Total)
        </h5>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.5rem' }}>
          {categories.map((cat, idx) => {
            const Icon = cat.icon;
            const pct = Math.min(100, Math.round((cat.score / cat.max) * 100));
            return (
              <div key={idx} style={{
                background: 'rgba(255, 255, 255, 0.025)',
                padding: '0.55rem 0.75rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.775rem', fontWeight: 600 }}>
                    <Icon size={14} color={cat.color} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cat.name}</span>
                  </div>
                  <div style={{ fontSize: '0.775rem', fontWeight: 700, whiteSpace: 'nowrap' }}>
                    <span style={{ color: cat.color }}>{cat.score}</span> / <span style={{ color: 'var(--text-dim)' }}>{cat.max}</span>
                  </div>
                </div>
                <div style={{ width: '100%', height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{
                    width: `${pct}%`,
                    height: '100%',
                    backgroundColor: cat.color,
                    borderRadius: 2,
                    transition: 'width 0.4s ease-in-out'
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Skills Comparison */}
      <div style={{ marginBottom: '1.1rem' }}>
        <h5 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Skills Comparison
        </h5>
        
        {/* Matched Skills */}
        <div style={{ marginBottom: '0.6rem' }}>
          <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600, marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <CheckCircle2 size={13} /> MATCHED SKILLS ({skills?.matched?.length || 0})
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
            {skills?.matched?.length > 0 ? (
              skills.matched.map((sk, i) => (
                <span key={i} className="badge badge-success" style={{ fontSize: '0.75rem' }}>
                  ✓ {sk}
                </span>
              ))
            ) : (
              <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem', fontStyle: 'italic' }}>No skills matched</span>
            )}
          </div>
        </div>

        {/* Missing Skills */}
        {skills?.missing?.length > 0 && (
          <div>
            <div style={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: 600, marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <AlertTriangle size={13} /> MISSING SKILLS TO LEARN ({skills.missing.length})
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
              {skills.missing.map((sk, i) => (
                <span key={i} className="badge badge-warning" style={{ fontSize: '0.75rem' }}>
                  ⚠ {sk}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Algorithmic Reasoning: Strengths & Gaps */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '0.75rem'
      }}>
        {/* Strengths */}
        <div style={{
          background: 'rgba(16, 185, 129, 0.04)',
          border: '1px solid rgba(16, 185, 129, 0.2)',
          borderRadius: 'var(--radius-sm)',
          padding: '0.75rem'
        }}>
          <h6 style={{ color: '#34d399', fontSize: '0.8rem', marginBottom: '0.45rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <CheckCircle2 size={14} /> Key Matching Strengths
          </h6>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.775rem', color: '#e2e8f0' }}>
            {explanation?.strengths?.map((st, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.35rem' }}>
                <span style={{ color: '#10b981' }}>✓</span>
                <span>{st}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Gaps / Action Items */}
        <div style={{
          background: 'rgba(245, 158, 11, 0.04)',
          border: '1px solid rgba(245, 158, 11, 0.2)',
          borderRadius: 'var(--radius-sm)',
          padding: '0.75rem'
        }}>
          <h6 style={{ color: '#fbbf24', fontSize: '0.8rem', marginBottom: '0.45rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <AlertTriangle size={14} /> Gaps & Missing Criteria
          </h6>
          {explanation?.gaps?.length > 0 ? (
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.775rem', color: '#e2e8f0' }}>
              {explanation.gaps.map((gap, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.35rem' }}>
                  <span style={{ color: '#f59e0b' }}>⚠</span>
                  <span>{gap}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
              Outstanding! You meet all listed prerequisites for this opening.
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default MatchBreakdownModal;
