import React, { useState, useEffect } from 'react';
import { 
  UserCheck, 
  Sparkles, 
  Plus, 
  X, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  GraduationCap
} from 'lucide-react';
import { api } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

export const StudentProfile = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Profile fields
  const [formData, setFormData] = useState({
    branch: 'CSE',
    cgpa: 8.5,
    graduation_year: 2026,
    preferred_location: 'Hyderabad',
    preferred_role: 'Software Developer',
    experience_level: 'Fresher'
  });

  // Skills
  const [studentSkills, setStudentSkills] = useState([]);
  const [allSkillsCatalog, setAllSkillsCatalog] = useState([]);
  const [selectedCatalogSkill, setSelectedCatalogSkill] = useState('');
  const [customSkillName, setCustomSkillName] = useState('');

  const loadProfile = async () => {
    try {
      setLoading(true);
      const [profileRes, skillsRes] = await Promise.all([
        api.getStudentProfile(),
        api.getAllSkills()
      ]);

      if (profileRes.success && profileRes.profile) {
        const p = profileRes.profile;
        setFormData({
          branch: p.branch || 'CSE',
          cgpa: p.cgpa || 8.0,
          graduation_year: p.graduation_year || 2026,
          preferred_location: p.preferred_location || 'Any',
          preferred_role: p.preferred_role || 'Software Developer',
          experience_level: p.experience_level || 'Fresher'
        });
        setStudentSkills(p.skills || []);
      }

      if (skillsRes.success && skillsRes.skills) {
        setAllSkillsCatalog(skillsRes.skills);
      }
    } catch (err) {
      setMessage({ text: err.message || 'Failed to load profile data', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMessage({ text: '', type: '' });
      const res = await api.updateStudentProfile(formData);
      if (res.success) {
        setMessage({ text: 'Profile details saved successfully! Matching scores updated.', type: 'success' });
      }
    } catch (err) {
      setMessage({ text: err.message || 'Failed to save profile', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleAddCatalogSkill = async () => {
    if (!selectedCatalogSkill) return;
    try {
      const res = await api.addStudentSkill({ skill_id: parseInt(selectedCatalogSkill) });
      if (res.success) {
        setStudentSkills(res.skills);
        setSelectedCatalogSkill('');
        setMessage({ text: 'Skill added to your profile!', type: 'success' });
      }
    } catch (err) {
      setMessage({ text: err.message || 'Failed to add skill', type: 'error' });
    }
  };

  const handleAddCustomSkill = async (e) => {
    e.preventDefault();
    const name = customSkillName.trim();
    if (!name) return;
    try {
      const res = await api.addStudentSkill({ skill_name: name });
      if (res.success) {
        setStudentSkills(res.skills);
        setCustomSkillName('');
        setMessage({ text: `Custom skill "${name}" added!`, type: 'success' });
      }
    } catch (err) {
      setMessage({ text: err.message || 'Failed to add custom skill', type: 'error' });
    }
  };

  const handleRemoveSkill = async (skillId) => {
    try {
      const res = await api.removeStudentSkill(skillId);
      if (res.success) {
        setStudentSkills(res.skills);
        setMessage({ text: 'Skill removed from profile', type: 'info' });
      }
    } catch (err) {
      setMessage({ text: err.message || 'Failed to remove skill', type: 'error' });
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading your profile and technical skills..." />;
  }

  // Filter skills not yet added
  const existingSkillIds = new Set(studentSkills.map(s => s.id));
  const availableSkills = allSkillsCatalog.filter(s => !existingSkillIds.has(s.id));

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <UserCheck size={22} color="var(--primary)" /> Student Profile & Skills
          </h1>
          <p className="page-subtitle">
            Configure your academic credentials, preferences, and verified technical skills for real-time match scoring.
          </p>
        </div>
      </div>

      {message.text && (
        <div style={{
          padding: '0.65rem 1rem',
          borderRadius: 'var(--radius-sm)',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: message.type === 'success' ? 'rgba(16, 185, 129, 0.12)' : message.type === 'error' ? 'rgba(239, 68, 68, 0.12)' : 'rgba(99, 102, 241, 0.12)',
          border: `1px solid ${message.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : message.type === 'error' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(99, 102, 241, 0.3)'}`,
          color: message.type === 'success' ? '#34d399' : message.type === 'error' ? '#f87171' : '#a5b4fc',
          fontSize: '0.85rem'
        }}>
          {message.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{message.text}</span>
        </div>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '1.25rem',
        alignItems: 'start'
      }}>
        {/* Academic & Preferences Form */}
        <div className="glass-panel" style={{ padding: '1.25rem 1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <GraduationCap size={18} color="var(--secondary)" /> Academic & Career Preferences
          </h3>

          <form onSubmit={handleSaveProfile}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
              {/* Branch */}
              <div className="form-group">
                <label className="form-label">Degree Branch</label>
                <select
                  value={formData.branch}
                  onChange={(e) => handleInputChange('branch', e.target.value)}
                  className="form-select"
                >
                  <option value="CSE">Computer Science (CSE)</option>
                  <option value="IT">Information Technology (IT)</option>
                  <option value="ECE">Electronics (ECE)</option>
                  <option value="EEE">Electrical (EEE)</option>
                  <option value="AI/ML">AI & Machine Learning</option>
                  <option value="Data Science">Data Science</option>
                  <option value="Mechanical">Mechanical</option>
                  <option value="Civil">Civil</option>
                </select>
              </div>

              {/* CGPA */}
              <div className="form-group">
                <label className="form-label">CGPA (out of 10.0)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.00"
                  max="10.00"
                  required
                  value={formData.cgpa}
                  onChange={(e) => handleInputChange('cgpa', parseFloat(e.target.value) || 0)}
                  className="form-input"
                />
              </div>

              {/* Graduation Year */}
              <div className="form-group">
                <label className="form-label">Graduation Year</label>
                <select
                  value={formData.graduation_year}
                  onChange={(e) => handleInputChange('graduation_year', parseInt(e.target.value))}
                  className="form-select"
                >
                  <option value="2024">2024</option>
                  <option value="2025">2025</option>
                  <option value="2026">2026</option>
                  <option value="2027">2027</option>
                  <option value="2028">2028</option>
                </select>
              </div>

              {/* Preferred Role */}
              <div className="form-group">
                <label className="form-label">Target Role Preference</label>
                <select
                  value={formData.preferred_role}
                  onChange={(e) => handleInputChange('preferred_role', e.target.value)}
                  className="form-select"
                >
                  <option value="Software Developer">Software Developer</option>
                  <option value="Backend Engineer">Backend Engineer</option>
                  <option value="Frontend Developer">Frontend Developer</option>
                  <option value="Full Stack Developer">Full Stack Developer</option>
                  <option value="Data Analyst">Data Analyst</option>
                  <option value="Cloud/DevOps Engineer">Cloud/DevOps Engineer</option>
                  <option value="Machine Learning Engineer">ML Engineer</option>
                </select>
              </div>

              {/* Preferred Location */}
              <div className="form-group">
                <label className="form-label">Work Location</label>
                <select
                  value={formData.preferred_location}
                  onChange={(e) => handleInputChange('preferred_location', e.target.value)}
                  className="form-select"
                >
                  <option value="Any">Any / Flexible</option>
                  <option value="Hyderabad">Hyderabad</option>
                  <option value="Bangalore">Bangalore</option>
                  <option value="Remote">Remote</option>
                  <option value="Pune">Pune</option>
                  <option value="Delhi NCR">Delhi NCR</option>
                  <option value="Mumbai">Mumbai</option>
                </select>
              </div>

              {/* Experience Level */}
              <div className="form-group">
                <label className="form-label">Experience Level</label>
                <select
                  value={formData.experience_level}
                  onChange={(e) => handleInputChange('experience_level', e.target.value)}
                  className="form-select"
                >
                  <option value="Fresher">Fresher (Campus Graduate)</option>
                  <option value="0-1 Years">0-1 Years Experience</option>
                  <option value="1-2 Years">1-2 Years Experience</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '0.75rem', height: '40px' }}
            >
              <Save size={15} /> {saving ? 'Saving Profile...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>

        {/* Skills Management Panel */}
        <div className="glass-panel" style={{ padding: '1.25rem 1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <h3 style={{ fontSize: '1.1rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <Sparkles size={18} color="var(--primary)" /> Technical Skills ({studentSkills.length})
            </h3>
            <span className="badge badge-primary">Weighted 40%</span>
          </div>

          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.85rem' }}>
            The matching algorithm scans job criteria against these skills to calculate your exact overlap score.
          </p>

          {/* Current Skills Badges */}
          <div style={{
            minHeight: '80px',
            maxHeight: '160px',
            overflowY: 'auto',
            padding: '0.65rem 0.85rem',
            background: 'rgba(0, 0, 0, 0.25)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '0.85rem',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.35rem',
            alignContent: 'flex-start'
          }}>
            {studentSkills.length === 0 ? (
              <span style={{ color: 'var(--text-dim)', fontSize: '0.825rem', fontStyle: 'italic' }}>
                No skills added yet. Use the selectors below to populate your skillset.
              </span>
            ) : (
              studentSkills.map((sk) => (
                <span
                  key={sk.id}
                  className="badge badge-primary"
                  style={{
                    fontSize: '0.775rem',
                    padding: '0.25rem 0.55rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}
                >
                  <span>{sk.name}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(sk.id)}
                    title={`Remove ${sk.name}`}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'inherit',
                      cursor: 'pointer',
                      display: 'flex',
                      padding: 0,
                      opacity: 0.75
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = 0.75}
                  >
                    <X size={13} />
                  </button>
                </span>
              ))
            )}
          </div>

          {/* Add from Standard Catalog */}
          <div style={{ marginBottom: '0.75rem' }}>
            <label className="form-label" style={{ fontSize: '0.75rem' }}>Add From Standard Tech Catalog</label>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <select
                value={selectedCatalogSkill}
                onChange={(e) => setSelectedCatalogSkill(e.target.value)}
                className="form-select"
                style={{ flex: 1, height: '36px' }}
              >
                <option value="">-- Choose skill from catalog --</option>
                {availableSkills.map((sk) => (
                  <option key={sk.id} value={sk.id}>{sk.name}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleAddCatalogSkill}
                disabled={!selectedCatalogSkill}
                className="btn btn-secondary btn-sm"
                style={{ height: '36px' }}
              >
                <Plus size={15} /> Add
              </button>
            </div>
          </div>

          {/* Or Add Custom Skill */}
          <div>
            <label className="form-label" style={{ fontSize: '0.75rem' }}>Or Add Custom Skill / Tool</label>
            <form onSubmit={handleAddCustomSkill} style={{ display: 'flex', gap: '0.4rem' }}>
              <input
                type="text"
                value={customSkillName}
                onChange={(e) => setCustomSkillName(e.target.value)}
                placeholder="e.g. Next.js, PyTorch, GraphQL"
                className="form-input"
                style={{ flex: 1, height: '36px' }}
              />
              <button
                type="submit"
                disabled={!customSkillName.trim()}
                className="btn btn-primary btn-sm"
                style={{ height: '36px' }}
              >
                <Plus size={15} /> Add
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
