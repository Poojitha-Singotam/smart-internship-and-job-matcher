import React, { useState, useEffect } from 'react';
import { Users, Search, GraduationCap, MapPin, Mail } from 'lucide-react';
import { api } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

export const ManageStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminStudents();
      setStudents(res.students || []);
    } catch (err) {
      console.error('Failed to load students:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const filteredStudents = students.filter(s => {
    const term = search.toLowerCase();
    const skillsMatch = (s.skills || []).some(sk => sk.toLowerCase().includes(term));
    return (
      s.name?.toLowerCase().includes(term) ||
      s.email?.toLowerCase().includes(term) ||
      s.branch?.toLowerCase().includes(term) ||
      skillsMatch
    );
  });

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Users size={22} color="var(--primary)" /> Student Candidate Directory ({students.length})
          </h1>
          <p className="page-subtitle">
            Candidate academic standing, graduation batch, role preferences, and technical skills.
          </p>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', width: '100%', maxWidth: '280px' }}>
          <Search size={15} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search candidate by name, skill, branch..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '2.3rem', height: '36px', fontSize: '0.825rem' }}
          />
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading candidate profiles..." />
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Candidate</th>
                <th>Academics</th>
                <th>Target Role & Location</th>
                <th>Skills Portfolio</th>
                <th style={{ textAlign: 'center' }}>Applications</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((s) => (
                <tr key={s.user_id}>
                  {/* Candidate Name & Email */}
                  <td>
                    <div style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.9rem' }}>{s.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Mail size={11} /> {s.email}
                    </div>
                  </td>

                  {/* Academics: Branch, CGPA, Batch */}
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600, color: '#ffffff', fontSize: '0.825rem' }}>
                      <GraduationCap size={14} color="#06b6d4" /> {s.branch || 'CSE'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      CGPA: <strong style={{ color: '#10b981' }}>{s.cgpa > 0 ? s.cgpa.toFixed(2) : 'N/A'}</strong> | Batch: {s.graduation_year || 'N/A'}
                    </div>
                  </td>

                  {/* Target Role & Location */}
                  <td>
                    <div style={{ color: '#ffffff', fontWeight: 500, fontSize: '0.825rem' }}>{s.preferred_role || 'Software Developer'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <MapPin size={11} /> {s.preferred_location || 'Any'}
                    </div>
                  </td>

                  {/* Skills Portfolio */}
                  <td>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', maxWidth: '280px' }}>
                      {(s.skills || []).map((sk, i) => (
                        <span key={i} className="badge badge-primary" style={{ fontSize: '0.675rem' }}>
                          {sk}
                        </span>
                      ))}
                      {(s.skills || []).length === 0 && (
                        <span style={{ color: 'var(--text-dim)', fontSize: '0.725rem', fontStyle: 'italic' }}>No skills added</span>
                      )}
                    </div>
                  </td>

                  {/* Applications Submitted */}
                  <td style={{ textAlign: 'center' }}>
                    <span className="badge badge-secondary" style={{ fontSize: '0.775rem', padding: '0.2rem 0.6rem' }}>
                      {s.applications_count || 0} applied
                    </span>
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

export default ManageStudents;
