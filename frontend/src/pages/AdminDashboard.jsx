import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Briefcase, 
  Send, 
  Plus, 
  MapPin, 
  Sparkles, 
  TrendingUp,
  FolderKanban
} from 'lucide-react';
import { api } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminStatistics();
      setStats(res.statistics || {});
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Aggregating platform analytics..." />;
  }

  const {
    total_students = 0,
    total_jobs = 0,
    total_applications = 0,
    applications_by_status = {},
    top_demanded_skills = [],
    jobs_by_location = []
  } = stats || {};

  return (
    <div className="page-container fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <FolderKanban size={22} color="var(--warning)" /> Admin Analytics & Command Center
          </h1>
          <p className="page-subtitle">
            Student engagement, demand trends, skill requirements, and hiring pipeline metrics.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Link to="/admin/jobs" className="btn btn-primary btn-sm">
            <Plus size={15} /> Post New Opportunity
          </Link>
          <Link to="/admin/applications" className="btn btn-secondary btn-sm">
            Review Applications
          </Link>
        </div>
      </div>

      {/* Top Level Metric Cards */}
      <div className="kpi-grid-3">
        <div className="kpi-card">
          <div className="kpi-card-header">
            <span className="kpi-card-label">Registered Students</span>
            <div className="kpi-card-icon" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
              <Users size={16} />
            </div>
          </div>
          <div className="kpi-card-value">{total_students}</div>
          <Link to="/admin/students" className="kpi-card-sub" style={{ color: 'var(--primary)' }}>View student directory →</Link>
        </div>

        <div className="kpi-card">
          <div className="kpi-card-header">
            <span className="kpi-card-label">Active Job Listings</span>
            <div className="kpi-card-icon" style={{ background: 'var(--secondary-light)', color: '#22d3ee' }}>
              <Briefcase size={16} />
            </div>
          </div>
          <div className="kpi-card-value">{total_jobs}</div>
          <Link to="/admin/jobs" className="kpi-card-sub" style={{ color: 'var(--secondary)' }}>Manage listings →</Link>
        </div>

        <div className="kpi-card">
          <div className="kpi-card-header">
            <span className="kpi-card-label">Total Applications</span>
            <div className="kpi-card-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
              <Send size={16} />
            </div>
          </div>
          <div className="kpi-card-value" style={{ color: '#34d399' }}>{total_applications}</div>
          <Link to="/admin/applications" className="kpi-card-sub" style={{ color: '#34d399' }}>Update statuses →</Link>
        </div>
      </div>

      {/* Analytics Breakdown Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
        gap: '1rem'
      }}>
        {/* Applications By Pipeline Status */}
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <TrendingUp size={16} color="var(--primary)" /> Applications By Status
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {Object.entries(applications_by_status).map(([st, cnt]) => {
              const pct = total_applications > 0 ? Math.round((cnt / total_applications) * 100) : 0;
              let barColor = '#6366f1';
              if (st === 'Accepted') barColor = '#10b981';
              if (st === 'Interviewing') barColor = '#3b82f6';
              if (st === 'Under Review') barColor = '#f59e0b';
              if (st === 'Rejected') barColor = '#ef4444';

              return (
                <div key={st}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: 600 }}>{st}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{cnt} ({pct}%)</span>
                  </div>
                  <div style={{ width: '100%', height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', backgroundColor: barColor, borderRadius: 3, transition: 'width 0.4s' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Most Demanded Technical Skills */}
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Sparkles size={16} color="#06b6d4" /> In-Demand Skills Across Postings
          </h3>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
            {top_demanded_skills.map((sk, idx) => (
              <div 
                key={idx}
                style={{
                  padding: '0.35rem 0.65rem',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.8rem'
                }}
              >
                <span style={{ fontWeight: 600, color: '#ffffff' }}>{sk.name}</span>
                <span className="badge badge-primary" style={{ fontSize: '0.675rem' }}>
                  {sk.demand_count} jobs
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Job Listings By Location */}
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <MapPin size={16} color="#ec4899" /> Distribution By Location
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {jobs_by_location.map((loc, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.45rem 0.65rem',
                  background: 'rgba(255,255,255,0.02)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '0.8rem'
                }}
              >
                <span>{loc.location}</span>
                <span className="badge badge-secondary">{loc.count} openings</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
