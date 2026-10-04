import React, { useState, useEffect } from 'react';
import { Briefcase, Sparkles } from 'lucide-react';
import { api } from '../services/api';
import JobCard from '../components/JobCard';
import FilterPanel from '../components/FilterPanel';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { useAuth } from '../context/AuthContext';

export const JobListings = () => {
  const { isStudent } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    location: '',
    job_type: '',
    role: '',
    min_score: '',
    sort_by: isStudent ? 'score' : 'date'
  });

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await api.getJobs(filters);
      setJobs(res.jobs || []);
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [filters]);

  const handleResetFilters = () => {
    setFilters({
      search: '',
      location: '',
      job_type: '',
      role: '',
      min_score: '',
      sort_by: isStudent ? 'score' : 'date'
    });
  };

  return (
    <div className="page-container fade-in">
      {/* Title */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Briefcase size={22} color="var(--primary)" /> Discover Opportunities
          </h1>
          <p className="page-subtitle">
            Explore internships and engineering positions with real-time explainable matching.
          </p>
        </div>
      </div>

      {/* Filter Panel */}
      <FilterPanel
        filters={filters}
        setFilters={setFilters}
        onReset={handleResetFilters}
      />

      {/* Results Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '0.85rem'
      }}>
        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Showing <strong style={{ color: '#ffffff' }}>{jobs.length}</strong> available openings
          {filters.min_score && ` with ≥ ${filters.min_score}% match`}
        </div>

        {isStudent && (
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Sparkles size={13} color="#10b981" /> Transparent scores calculated live
          </div>
        )}
      </div>

      {/* Jobs Grid */}
      {loading ? (
        <LoadingSpinner message="Filtering and calculating match scores..." />
      ) : jobs.length === 0 ? (
        <EmptyState
          title="No jobs matched your filters"
          description="Try clearing your search terms or lowering your minimum match score filter to see more openings."
          actionLabel="Reset All Filters"
          onAction={handleResetFilters}
        />
      ) : (
        <div className="jobs-grid">
          {jobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onApplySuccess={fetchJobs}
              onSaveToggle={fetchJobs}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default JobListings;
