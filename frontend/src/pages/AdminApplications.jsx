import React, { useState, useEffect } from 'react';
import { FileCheck2 } from 'lucide-react';
import { api } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';

export const AdminApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminApplications(statusFilter);
      setApplications(res.applications || []);
    } catch (err) {
      console.error('Failed to load applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [statusFilter]);

  const handleStatusChange = async (appId, newStatus) => {
    try {
      setUpdatingId(appId);
      const res = await api.updateApplicationStatus(appId, newStatus);
      if (res.success) {
        setApplications(prev => prev.map(a => a.id === appId ? { ...a, status: newStatus } : a));
      }
    } catch (err) {
      alert(err.message || 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = applications.filter(a => {
    const term = search.toLowerCase();
    return (
      a.student_name?.toLowerCase().includes(term) ||
      a.job_title?.toLowerCase().includes(term) ||
      a.job_company?.toLowerCase().includes(term) ||
      a.student_email?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <FileCheck2 size={22} color="var(--primary)" /> Application Review & Status Pipeline ({applications.length})
          </h1>
          <p className="page-subtitle">
            Update candidate progress: Under Review, Interviewing, Accepted, or Rejected.
          </p>
        </div>

        {/* Filter Controls */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="form-select"
            style={{ width: '150px', height: '36px', fontSize: '0.825rem', padding: '0.35rem 0.65rem' }}
          >
            <option value="">All Statuses</option>
            <option value="Applied">Applied</option>
            <option value="Under Review">Under Review</option>
            <option value="Interviewing">Interviewing</option>
            <option value="Accepted">Accepted</option>
            <option value="Rejected">Rejected</option>
          </select>

          <input
            type="text"
            placeholder="Search candidate or job..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input"
            style={{ width: '200px', height: '36px', fontSize: '0.825rem' }}
          />
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading candidate application submissions..." />
      ) : filtered.length === 0 ? (
        <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          No applications match the current filter.
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Candidate</th>
                <th>Academics</th>
                <th>Applied Role</th>
                <th>Applied Date</th>
                <th>Current Status</th>
                <th style={{ textAlign: 'right' }}>Update Stage</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((app) => (
                <tr key={app.id}>
                  {/* Candidate */}
                  <td>
                    <div style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.9rem' }}>{app.student_name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{app.student_email}</div>
                  </td>

                  {/* Academics */}
                  <td>
                    <div style={{ color: '#ffffff', fontWeight: 600, fontSize: '0.825rem' }}>{app.branch} (Batch {app.graduation_year})</div>
                    <div style={{ fontSize: '0.75rem', color: app.cgpa >= app.minimum_cgpa ? '#10b981' : '#f59e0b' }}>
                      CGPA: {app.cgpa.toFixed(2)} {app.minimum_cgpa > 0 ? `(Req: ${app.minimum_cgpa.toFixed(2)})` : ''}
                    </div>
                  </td>

                  {/* Job */}
                  <td>
                    <div style={{ fontWeight: 600, color: '#ffffff', fontSize: '0.875rem' }}>{app.job_title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{app.job_company} • {app.job_location}</div>
                  </td>

                  {/* Applied Date */}
                  <td style={{ fontSize: '0.825rem', color: 'var(--text-dim)' }}>
                    {new Date(app.applied_at).toLocaleDateString()}
                  </td>

                  {/* Status Badge */}
                  <td>
                    <StatusBadge status={app.status} />
                  </td>

                  {/* Dropdown status updater */}
                  <td style={{ textAlign: 'right' }}>
                    <select
                      value={app.status}
                      disabled={updatingId === app.id}
                      onChange={(e) => handleStatusChange(app.id, e.target.value)}
                      className="form-select"
                      style={{
                        width: '135px',
                        padding: '0.3rem 0.5rem',
                        fontSize: '0.775rem',
                        height: '30px',
                        display: 'inline-block'
                      }}
                    >
                      <option value="Applied">Applied</option>
                      <option value="Under Review">Under Review</option>
                      <option value="Interviewing">Interviewing</option>
                      <option value="Accepted">Accepted</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminApplications;
