import React from 'react';
import { Search, RotateCcw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const FilterPanel = ({ filters, setFilters, onReset }) => {
  const { isStudent } = useAuth();

  const handleInputChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="glass-panel" style={{ padding: '0.85rem 1.15rem', marginBottom: '1rem' }}>
      {/* Search Input */}
      <div style={{ position: 'relative', marginBottom: '0.75rem' }}>
        <Search 
          size={16} 
          style={{
            position: 'absolute',
            left: '0.85rem',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-muted)'
          }}
        />
        <input
          type="text"
          placeholder="Search by job title, company name, or technology keywords..."
          value={filters.search}
          onChange={(e) => handleInputChange('search', e.target.value)}
          className="form-input"
          style={{ paddingLeft: '2.4rem', height: '38px', fontSize: '0.875rem' }}
        />
      </div>

      {/* Filter Controls Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '0.65rem',
        alignItems: 'flex-end'
      }}>
        {/* Location Filter */}
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" style={{ fontSize: '0.75rem' }}>Location</label>
          <select 
            value={filters.location} 
            onChange={(e) => handleInputChange('location', e.target.value)}
            className="form-select"
            style={{ height: '35px', fontSize: '0.825rem', padding: '0.35rem 0.65rem' }}
          >
            <option value="">All Locations</option>
            <option value="Hyderabad">Hyderabad</option>
            <option value="Bangalore">Bangalore</option>
            <option value="Remote">Remote</option>
            <option value="Pune">Pune</option>
            <option value="Delhi NCR">Delhi NCR</option>
            <option value="Mumbai">Mumbai</option>
          </select>
        </div>

        {/* Job Type Filter */}
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" style={{ fontSize: '0.75rem' }}>Type</label>
          <select 
            value={filters.job_type} 
            onChange={(e) => handleInputChange('job_type', e.target.value)}
            className="form-select"
            style={{ height: '35px', fontSize: '0.825rem', padding: '0.35rem 0.65rem' }}
          >
            <option value="">All Types</option>
            <option value="Internship">Internship</option>
            <option value="Full-time">Full-time</option>
          </select>
        </div>

        {/* Min Match Score (Student only) */}
        {isStudent && (
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontSize: '0.75rem' }}>Min Match Score</label>
            <select 
              value={filters.min_score} 
              onChange={(e) => handleInputChange('min_score', e.target.value)}
              className="form-select"
              style={{ height: '35px', fontSize: '0.825rem', padding: '0.35rem 0.65rem' }}
            >
              <option value="">Any Match (0%+)</option>
              <option value="80">High Match (80%+)</option>
              <option value="60">Good Match (60%+)</option>
              <option value="40">Fair Match (40%+)</option>
            </select>
          </div>
        )}

        {/* Sort By */}
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" style={{ fontSize: '0.75rem' }}>Sort By</label>
          <select 
            value={filters.sort_by} 
            onChange={(e) => handleInputChange('sort_by', e.target.value)}
            className="form-select"
            style={{ height: '35px', fontSize: '0.825rem', padding: '0.35rem 0.65rem' }}
          >
            {isStudent && <option value="score">Highest Match Score</option>}
            <option value="date">Most Recent</option>
            <option value="cgpa">CGPA (High to Low)</option>
            <option value="title">Job Title (A-Z)</option>
          </select>
        </div>

        {/* Reset Button */}
        <div>
          <button 
            type="button" 
            onClick={onReset}
            className="btn btn-secondary" 
            style={{ width: '100%', height: '35px', fontSize: '0.8rem', padding: '0 0.65rem' }}
          >
            <RotateCcw size={14} /> Reset
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;
