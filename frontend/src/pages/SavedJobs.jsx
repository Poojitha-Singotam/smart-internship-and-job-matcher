import React, { useState, useEffect } from 'react';
import { Bookmark } from 'lucide-react';
import { api } from '../services/api';
import JobCard from '../components/JobCard';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

export const SavedJobs = () => {
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSavedJobs = async () => {
    try {
      setLoading(true);
      const res = await api.getSavedJobs();
      setSavedJobs(res.saved_jobs || []);
    } catch (err) {
      console.error('Failed to load saved jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedJobs();
  }, []);

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Bookmark size={22} color="var(--primary)" /> Saved Bookmarks ({savedJobs.length})
          </h1>
          <p className="page-subtitle">
            Opportunities you bookmarked for later review or application.
          </p>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading your bookmarked jobs..." />
      ) : savedJobs.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="No saved jobs yet"
          description="Click the bookmark icon on any job card to save it here for quick access."
          actionLabel="Browse Opportunities"
          onAction={() => window.location.href = '/jobs'}
        />
      ) : (
        <div className="jobs-grid">
          {savedJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onApplySuccess={fetchSavedJobs}
              onSaveToggle={fetchSavedJobs}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedJobs;
