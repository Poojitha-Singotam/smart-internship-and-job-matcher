import React, { useState, useEffect } from 'react';
import { Send, Building, Calendar, HelpCircle } from 'lucide-react';
import { api } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import MatchScore from '../components/MatchScore';
import MatchBreakdownModal from '../components/MatchBreakdownModal';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

export const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [selectedJobForModal, setSelectedJobForModal] = useState(null);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await api.getApplications();
      setApplications(res.applications || []);
    } catch (err) {
      console.error('Failed to load applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const tabs = ['All', 'Applied', 'Under Review', 'Interviewing', 'Accepted', 'Rejected'];

  const filteredApps = activeTab === 'All' 
    ? applications 
    : applications.filter(a => a.status.toLowerCase() === activeTab.toLowerCase());

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Send size={22} color="var(--primary)" /> My Applications ({applications.length})
          </h1>
          <p className="page-subtitle">
            Real-time tracking of your job and internship application statuses and match feedback.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{
        display: 'flex',
        gap: '0.4rem',
        overflowX: 'auto',
        paddingBottom: '0.4rem',
        marginBottom: '1.1rem',
        borderBottom: '1px solid var(--border-subtle)'
      }}>
        {tabs.map((tab) => {
          const count = tab === 'All' ? applications.length : applications.filter(a => a.status.toLowerCase() === tab.toLowerCase()).length;
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                background: isActive ? 'var(--primary-light)' : 'transparent',
                border: isActive ? '1px solid var(--border-active)' : '1px solid transparent',
                color: isActive ? '#ffffff' : 'var(--text-muted)',
                padding: '0.35rem 0.75rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.825rem',
                fontWeight: isActive ? 700 : 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                whiteSpace: 'nowrap',
                transition: 'var(--transition)'
              }}
            >
              <span>{tab}</span>
              <span style={{
                fontSize: '0.7rem',
                padding: '0.05rem 0.35rem',
                borderRadius: 'var(--radius-full)',
                background: isActive ? 'var(--primary)' : 'rgba(255,255,255,0.06)',
                color: '#ffffff'
              }}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <LoadingSpinner message="Fetching your submitted applications..." />
      ) : filteredApps.length === 0 ? (
        <EmptyState
          title={`No ${activeTab === 'All' ? '' : activeTab} applications`}
          description={applications.length === 0 ? "You haven't applied to any opportunities yet. Browse recommended jobs and apply with one click!" : `You currently have no applications under "${activeTab}" status.`}
          actionLabel={applications.length === 0 ? "Browse Job Listings" : undefined}
          onAction={() => window.location.href = '/jobs'}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filteredApps.map((app) => (
            <div
              key={app.id}
              className="glass-panel glass-panel-hover"
              style={{
                padding: '1rem 1.25rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem'
              }}
            >
              {/* Left Details */}
              <div style={{ flex: '1 1 260px', minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Building size={13} /> {app.company}
                  </span>
                  <span className={`badge ${app.job_type === 'Internship' ? 'badge-secondary' : 'badge-primary'}`}>
                    {app.job_type}
                  </span>
                </div>
                <h3 style={{ fontSize: '1.05rem', color: '#ffffff', marginBottom: '0.35rem' }}>
                  {app.title}
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', fontSize: '0.775rem', color: 'var(--text-dim)' }}>
                  <span>📍 {app.location}</span>
                  <span>💰 {app.salary_range}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Calendar size={12} /> Applied: {new Date(app.applied_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Match Score & Why button */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
                {app.match_score !== null && app.match_score !== undefined && (
                  <div style={{ textAlign: 'center' }}>
                    <MatchScore score={app.match_score} size="sm" />
                    <div>
                      <button
                        onClick={() => setSelectedJobForModal(app)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--primary)',
                          fontSize: '0.725rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.2rem',
                          marginTop: '0.2rem'
                        }}
                      >
                        <HelpCircle size={12} /> Why match?
                      </button>
                    </div>
                  </div>
                )}

                {/* Status Badge */}
                <div style={{ minWidth: '110px', textAlign: 'right' }}>
                  <div style={{ fontSize: '0.675rem', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '0.15rem' }}>Current Status</div>
                  <StatusBadge status={app.status} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Match Breakdown Modal */}
      {selectedJobForModal && (
        <MatchBreakdownModal
          isOpen={!!selectedJobForModal}
          onClose={() => setSelectedJobForModal(null)}
          jobTitle={selectedJobForModal.title}
          company={selectedJobForModal.company}
          matchData={{
            total_score: selectedJobForModal.match_score,
            breakdown: selectedJobForModal.match_breakdown,
            explanation: selectedJobForModal.match_explanation
          }}
        />
      )}
    </div>
  );
};

export default Applications;
