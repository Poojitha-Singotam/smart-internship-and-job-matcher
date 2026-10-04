import React, { useState, useEffect } from 'react';
import { 
  FolderKanban, 
  Plus, 
  Edit, 
  Trash2, 
  Building, 
  MapPin, 
  DollarSign, 
  Award, 
  Calendar,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { api } from '../services/api';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';

export const ManageJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [skillsCatalog, setSkillsCatalog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJobId, setEditingJobId] = useState(null);
  const [saving, setSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    description: '',
    location: 'Hyderabad',
    job_type: 'Full-time',
    experience_required: 'Fresher',
    minimum_cgpa: 7.0,
    graduation_year: 2026,
    eligible_branches: 'CSE, IT, ECE',
    salary_range: 'Competitive',
    skill_names: []
  });

  const [newSkillInput, setNewSkillInput] = useState('');

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const [jobsRes, skillsRes] = await Promise.all([
        api.getJobs(),
        api.getAllSkills()
      ]);
      setJobs(jobsRes.jobs || []);
      setSkillsCatalog(skillsRes.skills || []);
    } catch (err) {
      console.error('Failed to load jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const resetForm = () => {
    setFormData({
      title: '',
      company: '',
      description: '',
      location: 'Hyderabad',
      job_type: 'Full-time',
      experience_required: 'Fresher',
      minimum_cgpa: 7.0,
      graduation_year: 2026,
      eligible_branches: 'CSE, IT, ECE',
      salary_range: 'Competitive',
      skill_names: []
    });
    setEditingJobId(null);
    setNewSkillInput('');
  };

  const handleOpenAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (job) => {
    setEditingJobId(job.id);
    setFormData({
      title: job.title || '',
      company: job.company || '',
      description: job.description || '',
      location: job.location || 'Hyderabad',
      job_type: job.job_type || 'Full-time',
      experience_required: job.experience_required || 'Fresher',
      minimum_cgpa: job.minimum_cgpa || 0.0,
      graduation_year: job.graduation_year || 2026,
      eligible_branches: job.eligible_branches || 'All Branches',
      salary_range: job.salary_range || 'Competitive',
      skill_names: (job.skills || []).map(s => s.name)
    });
    setIsModalOpen(true);
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleToggleSkill = (skillName) => {
    setFormData(prev => {
      const exists = prev.skill_names.includes(skillName);
      return {
        ...prev,
        skill_names: exists 
          ? prev.skill_names.filter(s => s !== skillName)
          : [...prev.skill_names, skillName]
      };
    });
  };

  const handleAddCustomSkill = (e) => {
    e.preventDefault();
    const val = newSkillInput.trim();
    if (!val) return;
    if (!formData.skill_names.includes(val)) {
      setFormData(prev => ({ ...prev, skill_names: [...prev.skill_names, val] }));
    }
    setNewSkillInput('');
  };

  const handleSaveJob = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMessage({ text: '', type: '' });

      if (editingJobId) {
        await api.updateJob(editingJobId, formData);
        setMessage({ text: `Job listing "${formData.title}" updated successfully!`, type: 'success' });
      } else {
        await api.createJob(formData);
        setMessage({ text: `New opportunity "${formData.title}" created successfully!`, type: 'success' });
      }

      setIsModalOpen(false);
      fetchJobs();
    } catch (err) {
      setMessage({ text: err.message || 'Failed to save job listing', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteJob = async (id, title) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${title}"?`)) return;

    try {
      await api.deleteJob(id);
      setMessage({ text: `Job listing deleted.`, type: 'info' });
      fetchJobs();
    } catch (err) {
      setMessage({ text: err.message || 'Failed to delete job', type: 'error' });
    }
  };

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <FolderKanban size={22} color="var(--primary)" /> Manage Job Listings ({jobs.length})
          </h1>
          <p className="page-subtitle">
            Create, update, or remove job & internship openings and configure required criteria.
          </p>
        </div>

        <button onClick={handleOpenAddModal} className="btn btn-primary btn-sm">
          <Plus size={16} /> Post New Opportunity
        </button>
      </div>

      {message.text && (
        <div style={{
          padding: '0.65rem 1rem',
          borderRadius: 'var(--radius-sm)',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: message.type === 'success' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
          border: `1px solid ${message.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
          color: message.type === 'success' ? '#34d399' : '#f87171',
          fontSize: '0.85rem'
        }}>
          {message.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{message.text}</span>
        </div>
      )}

      {loading ? (
        <LoadingSpinner message="Fetching job listings..." />
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Opportunity</th>
                <th>Location</th>
                <th>Type</th>
                <th>Min CGPA</th>
                <th>Batch</th>
                <th>Required Skills</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job.id}>
                  {/* Title & Company */}
                  <td>
                    <div style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.9rem' }}>{job.title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{job.company}</div>
                  </td>

                  {/* Location */}
                  <td style={{ fontSize: '0.825rem', color: 'var(--text-main)' }}>
                    {job.location}
                  </td>

                  {/* Type */}
                  <td>
                    <span className={`badge ${job.job_type === 'Internship' ? 'badge-secondary' : 'badge-primary'}`}>
                      {job.job_type}
                    </span>
                  </td>

                  {/* Min CGPA */}
                  <td style={{ fontSize: '0.825rem', fontWeight: 600 }}>
                    {job.minimum_cgpa > 0 ? job.minimum_cgpa : 'None'}
                  </td>

                  {/* Batch */}
                  <td style={{ fontSize: '0.825rem' }}>
                    {job.graduation_year || 'Any'}
                  </td>

                  {/* Skills count */}
                  <td>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', maxWidth: '220px' }}>
                      {(job.skills || []).slice(0, 3).map(s => (
                        <span key={s.id} className="badge badge-neutral" style={{ fontSize: '0.675rem' }}>
                          {s.name}
                        </span>
                      ))}
                      {(job.skills || []).length > 3 && (
                        <span className="badge badge-neutral" style={{ fontSize: '0.675rem' }}>
                          +{job.skills.length - 3}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Actions */}
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.35rem' }}>
                      <button
                        onClick={() => handleOpenEditModal(job)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.25rem 0.5rem' }}
                        title="Edit Job"
                      >
                        <Edit size={13} />
                      </button>
                      <button
                        onClick={() => handleDeleteJob(job.id, job.title)}
                        className="btn btn-danger btn-sm"
                        style={{ padding: '0.25rem 0.5rem' }}
                        title="Delete Job"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Job Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingJobId ? 'Edit Opportunity Listing' : 'Post New Opportunity'}
        maxWidth="750px"
      >
        <form onSubmit={handleSaveJob}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Job Title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => handleFormChange('title', e.target.value)}
                placeholder="e.g. Software Developer Intern"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Company Name *</label>
              <input
                type="text"
                required
                value={formData.company}
                onChange={(e) => handleFormChange('company', e.target.value)}
                placeholder="e.g. Microsoft"
                className="form-input"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Location *</label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => handleFormChange('location', e.target.value)}
                placeholder="e.g. Hyderabad / Remote"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Opportunity Type *</label>
              <select
                value={formData.job_type}
                onChange={(e) => handleFormChange('job_type', e.target.value)}
                className="form-select"
              >
                <option value="Internship">Internship</option>
                <option value="Full-time">Full-time</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Experience Required</label>
              <select
                value={formData.experience_required}
                onChange={(e) => handleFormChange('experience_required', e.target.value)}
                className="form-select"
              >
                <option value="Fresher">Fresher</option>
                <option value="0-1 Years">0-1 Years</option>
                <option value="1-2 Years">1-2 Years</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Minimum CGPA (0-10)</label>
              <input
                type="number"
                step="0.1"
                min="0.0"
                max="10.0"
                value={formData.minimum_cgpa}
                onChange={(e) => handleFormChange('minimum_cgpa', parseFloat(e.target.value) || 0)}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Target Batch (Year)</label>
              <input
                type="number"
                value={formData.graduation_year}
                onChange={(e) => handleFormChange('graduation_year', parseInt(e.target.value) || 2026)}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Salary / Stipend</label>
              <input
                type="text"
                value={formData.salary_range}
                onChange={(e) => handleFormChange('salary_range', e.target.value)}
                placeholder="e.g. ₹50,000/month or 12 LPA"
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Eligible Branches</label>
            <input
              type="text"
              value={formData.eligible_branches}
              onChange={(e) => handleFormChange('eligible_branches', e.target.value)}
              placeholder="e.g. CSE, IT, ECE or All Branches"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Role Description *</label>
            <textarea
              required
              rows={3}
              value={formData.description}
              onChange={(e) => handleFormChange('description', e.target.value)}
              placeholder="Detailed description of responsibilities, requirements, and culture..."
              className="form-textarea"
            />
          </div>

          {/* Required Skills Selector */}
          <div className="form-group">
            <label className="form-label">Required Skills (Click to toggle)</label>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.4rem',
              maxHeight: '140px',
              overflowY: 'auto',
              padding: '0.75rem',
              background: 'rgba(0,0,0,0.25)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              marginBottom: '0.75rem'
            }}>
              {skillsCatalog.map((sk) => {
                const isSelected = formData.skill_names.includes(sk.name);
                return (
                  <button
                    key={sk.id}
                    type="button"
                    onClick={() => handleToggleSkill(sk.name)}
                    style={{
                      background: isSelected ? 'var(--primary)' : 'rgba(255,255,255,0.06)',
                      color: isSelected ? '#ffffff' : 'var(--text-muted)',
                      border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border-subtle)',
                      padding: '0.25rem 0.6rem',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      fontWeight: isSelected ? 700 : 500
                    }}
                  >
                    {isSelected ? `✓ ${sk.name}` : `+ ${sk.name}`}
                  </button>
                );
              })}
            </div>

            {/* Custom Skill Input */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                value={newSkillInput}
                onChange={(e) => setNewSkillInput(e.target.value)}
                placeholder="Or type custom skill name and click Add"
                className="form-input"
                style={{ flex: 1, height: '38px', fontSize: '0.85rem' }}
              />
              <button
                type="button"
                onClick={handleAddCustomSkill}
                disabled={!newSkillInput.trim()}
                className="btn btn-secondary btn-sm"
              >
                Add Skill
              </button>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary"
            >
              {saving ? 'Saving...' : editingJobId ? 'Save Changes' : 'Publish Opportunity'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ManageJobs;
