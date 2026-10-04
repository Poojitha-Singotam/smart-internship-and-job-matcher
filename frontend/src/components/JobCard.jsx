import React, { useState } from 'react';
import { Bookmark, BookmarkCheck, MapPin, Building, Calendar, Award, DollarSign, ChevronRight, HelpCircle } from 'lucide-react';
import MatchScore from './MatchScore';
import StatusBadge from './StatusBadge';
import MatchBreakdownModal from './MatchBreakdownModal';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export const JobCard = ({ job, onApplySuccess, onSaveToggle }) => {
  const { isStudent } = useAuth();
  const [isApplying, setIsApplying] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(job.is_saved || false);
  const [isApplied, setIsApplied] = useState(job.is_applied || false);
  const [appStatus, setAppStatus] = useState(job.application_status || null);

  const handleApply = async () => {
    if (!isStudent) {
      alert('Please log in with a student account to apply.');
      return;
    }
    if (isApplied) return;

    try {
      setIsApplying(true);
      const res = await api.applyToJob(job.id);
      if (res.success) {
        setIsApplied(true);
        setAppStatus('Applied');
        if (onApplySuccess) onApplySuccess(job.id);
      }
    } catch (err) {
      alert(err.message || 'Failed to submit application');
    } finally {
      setIsApplying(false);
    }
  };

  const handleToggleSave = async () => {
    if (!isStudent) {
      alert('Please log in with a student account to bookmark jobs.');
      return;
    }
    try {
      setIsSaving(true);
      if (isSaved) {
        await api.removeSavedJob(job.id);
        setIsSaved(false);
        if (onSaveToggle) onSaveToggle(job.id, false);
      } else {
        await api.saveJob(job.id);
        setIsSaved(true);
        if (onSaveToggle) onSaveToggle(job.id, true);
      }
    } catch (err) {
      alert(err.message || 'Failed to update bookmark');
    } finally {
      setIsSaving(false);
    }
  };

  // Check matched vs missing skills for this card if breakdown exists
  const matchedSkillSet = new Set(job.match_breakdown?.skills?.matched || []);
  const allSkills = job.skills || [];
  const visibleSkills = allSkills.slice(0, 4);
  const hiddenSkillsCount = allSkills.length - 4;

  return (
    <>
      <div className="glass-panel glass-panel-hover job-card">
        <div>
          {/* Top Row: Company & Match Score / Save Button */}
          <div className="job-card-top">
            <div className="job-card-company-info">
              <div className="job-company-avatar">
                {job.company?.[0]?.toUpperCase() || 'J'}
              </div>
              <div style={{ minWidth: 0 }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  <Building size={13} style={{ flexShrink: 0 }} /> {job.company}
                </span>
                <span className={`badge ${job.job_type === 'Internship' ? 'badge-secondary' : 'badge-primary'}`} style={{ marginTop: '0.15rem' }}>
                  {job.job_type}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
              {isStudent && job.match_score !== null && (
                <MatchScore score={job.match_score} size="sm" />
              )}
              {isStudent && (
                <button
                  onClick={handleToggleSave}
                  disabled={isSaving}
                  title={isSaved ? "Remove from bookmarks" : "Save job"}
                  style={{
                    background: isSaved ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid ' + (isSaved ? 'var(--primary)' : 'var(--border-subtle)'),
                    color: isSaved ? 'var(--primary)' : 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: '0.35rem',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'var(--transition)'
                  }}
                >
                  {isSaved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                </button>
              )}
            </div>
          </div>

          {/* Job Title */}
          <h3 className="job-card-title" title={job.title}>
            {job.title}
          </h3>

          {/* Key Meta Badges */}
          <div className="job-meta-row">
            <span className="job-meta-item">
              <MapPin size={13} color="#06b6d4" /> {job.location}
            </span>
            <span className="job-meta-item">
              <DollarSign size={13} color="#10b981" /> {job.salary_range || 'Competitive'}
            </span>
            <span className="job-meta-item">
              <Award size={13} color="#f59e0b" /> Min CGPA: {job.minimum_cgpa > 0 ? job.minimum_cgpa : 'None'}
            </span>
            <span className="job-meta-item">
              <Calendar size={13} color="#a855f7" /> Batch: {job.graduation_year || 'Any'}
            </span>
          </div>

          {/* Description snippet */}
          <p className="job-desc-snippet">
            {job.description}
          </p>

          {/* Required Skills */}
          <div className="job-skills-section">
            <div className="job-skills-label">
              Required Skills
            </div>
            <div className="job-skills-list">
              {visibleSkills.map((sk) => {
                const isMatched = matchedSkillSet.has(sk.name);
                return (
                  <span
                    key={sk.id}
                    className={`badge ${isMatched ? 'badge-success' : 'badge-neutral'}`}
                  >
                    {isMatched ? `✓ ${sk.name}` : sk.name}
                  </span>
                );
              })}
              {hiddenSkillsCount > 0 && (
                <span className="badge badge-neutral" title={`${hiddenSkillsCount} more skills required`}>
                  +{hiddenSkillsCount}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="job-card-footer">
          {/* Explainability Button */}
          {isStudent && job.match_score !== null ? (
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn btn-secondary btn-sm"
              style={{
                fontSize: '0.75rem',
                color: '#818cf8',
                borderColor: 'rgba(99, 102, 241, 0.3)',
                padding: '0.3rem 0.6rem'
              }}
            >
              <HelpCircle size={13} /> Why this match?
            </button>
          ) : (
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '170px' }}>
              Eligible: {job.eligible_branches || 'All Branches'}
            </span>
          )}

          {/* Status or Apply Action */}
          <div>
            {isApplied ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <StatusBadge status={appStatus || 'Applied'} />
              </div>
            ) : (
              <button
                onClick={handleApply}
                disabled={isApplying}
                className="btn btn-primary btn-sm"
              >
                {isApplying ? 'Applying...' : 'Apply Now'} <ChevronRight size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Match Breakdown Modal */}
      {isModalOpen && (
        <MatchBreakdownModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          jobTitle={job.title}
          company={job.company}
          matchData={{
            total_score: job.match_score,
            breakdown: job.match_breakdown,
            explanation: job.match_explanation
          }}
        />
      )}
    </>
  );
};

export default JobCard;
