import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Briefcase, 
  Send, 
  Bookmark, 
  Award, 
  Sparkles, 
  AlertCircle, 
  ArrowRight,
  Clock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import JobCard from '../components/JobCard';
import LoadingSpinner from '../components/LoadingSpinner';

export const StudentDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [matches, setMatches] = useState([]);
  const [stats, setStats] = useState({
    totalMatching: 0,
    appliedCount: 0,
    savedCount: 0,
    interviewCount: 0,
    highestMatch: 0,
    averageMatch: 0
  });

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // 1. Fetch Profile
      const profileRes = await api.getStudentProfile();
      const userProfile = profileRes.profile || {};
      setProfile(userProfile);

      // 2. Fetch Matches & Stats
      const matchRes = await api.getMatches({ limit: 6 });
      const jobMatches = matchRes.matches || [];
      setMatches(jobMatches);

      // 3. Fetch Applications to count statuses
      const appRes = await api.getApplications();
      const applications = appRes.applications || [];
      const interviewing = applications.filter(a => a.status === 'Interviewing').length;

      // 4. Fetch Saved Jobs
      const savedRes = await api.getSavedJobs();
      const savedJobs = savedRes.saved_jobs || [];

      setStats({
        totalMatching: matchRes.stats?.total_matches || jobMatches.length,
        appliedCount: applications.length,
        savedCount: savedJobs.length,
        interviewCount: interviewing,
        highestMatch: matchRes.stats?.highest_match || (jobMatches[0]?.match_score || 0),
        averageMatch: matchRes.stats?.average_match || 0
      });
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Calculating explainable matches and loading dashboard..." />;
  }

  const hasFewSkills = !profile?.skills || profile.skills.length < 3;

  return (
    <div className="page-container fade-in">
      {/* Welcome Banner */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            Welcome back, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="page-subtitle">
            Live matching feed powered by your academic eligibility ({profile?.branch || 'CSE'}, CGPA {profile?.cgpa || 'N/A'}) and {profile?.skills?.length || 0} skills.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Link to="/profile" className="btn btn-secondary btn-sm">
            Edit Profile & Skills
          </Link>
          <Link to="/jobs" className="btn btn-primary btn-sm">
            Browse All Opportunities <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Profile Incomplete Callout if needed */}
      {hasFewSkills && (
        <div style={{
          background: 'rgba(99, 102, 241, 0.08)',
          border: '1px solid rgba(99, 102, 241, 0.25)',
          borderRadius: 'var(--radius-md)',
          padding: '0.75rem 1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
          marginBottom: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <AlertCircle size={18} color="#818cf8" style={{ flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.85rem' }}>
                Boost your match scores!
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.775rem' }}>
                Add more verified skills and update your CGPA to unlock 90%+ match opportunities.
              </div>
            </div>
          </div>
          <Link to="/profile" className="btn btn-primary btn-sm">
            Update Skills
          </Link>
        </div>
      )}

      {/* Analytics KPI Grid */}
      <div className="kpi-grid-5">
        {/* Total Matches */}
        <div className="kpi-card">
          <div className="kpi-card-header">
            <span className="kpi-card-label">Matching Openings</span>
            <div className="kpi-card-icon" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
              <Briefcase size={15} />
            </div>
          </div>
          <div className="kpi-card-value">{stats.totalMatching}</div>
          <span className="kpi-card-sub">Actively hiring</span>
        </div>

        {/* Highest Match */}
        <div className="kpi-card">
          <div className="kpi-card-header">
            <span className="kpi-card-label">Top Match Score</span>
            <div className="kpi-card-icon" style={{ background: 'var(--success-light)', color: '#34d399' }}>
              <Award size={15} />
            </div>
          </div>
          <div className="kpi-card-value" style={{ color: '#34d399' }}>{stats.highestMatch}%</div>
          <span className="kpi-card-sub">Avg fit: {stats.averageMatch}%</span>
        </div>

        {/* Applications */}
        <div className="kpi-card">
          <div className="kpi-card-header">
            <span className="kpi-card-label">Submitted Applications</span>
            <div className="kpi-card-icon" style={{ background: 'var(--secondary-light)', color: '#22d3ee' }}>
              <Send size={15} />
            </div>
          </div>
          <div className="kpi-card-value">{stats.appliedCount}</div>
          <Link to="/applications" className="kpi-card-sub" style={{ color: 'var(--secondary)' }}>Track status →</Link>
        </div>

        {/* Interviews */}
        <div className="kpi-card">
          <div className="kpi-card-header">
            <span className="kpi-card-label">Active Interviews</span>
            <div className="kpi-card-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
              <Clock size={15} />
            </div>
          </div>
          <div className="kpi-card-value" style={{ color: '#fbbf24' }}>{stats.interviewCount}</div>
          <span className="kpi-card-sub">Shortlisted stages</span>
        </div>

        {/* Saved Jobs */}
        <div className="kpi-card">
          <div className="kpi-card-header">
            <span className="kpi-card-label">Saved Bookmarks</span>
            <div className="kpi-card-icon" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc' }}>
              <Bookmark size={15} />
            </div>
          </div>
          <div className="kpi-card-value">{stats.savedCount}</div>
          <Link to="/saved-jobs" className="kpi-card-sub" style={{ color: '#c084fc' }}>View bookmarks →</Link>
        </div>
      </div>

      {/* Top Recommended Opportunities Section */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <Sparkles size={17} color="var(--primary)" /> Top Algorithmic Recommendations
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              Transparent ranking calculated in real time based on your academic eligibility and technical skillset.
            </p>
          </div>
          <Link to="/jobs" style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--primary)', whiteSpace: 'nowrap' }}>
            View all {stats.totalMatching} jobs →
          </Link>
        </div>

        {matches.length === 0 ? (
          <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No matching opportunities found. Try updating your profile or checking all jobs.
          </div>
        ) : (
          <div className="jobs-grid">
            {matches.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onApplySuccess={() => loadDashboardData()}
                onSaveToggle={() => loadDashboardData()}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
