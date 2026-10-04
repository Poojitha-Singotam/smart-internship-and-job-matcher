const API_BASE_URL = 'http://127.0.0.1:5000/api';

/**
 * Universal API Client with automatic JWT injection and structured error handling.
 */
async function request(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const config = {
    ...options,
    headers
  };

  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await res.json().catch(() => ({ success: false, message: 'Invalid JSON response from server' }));

    if (!res.ok) {
      if (res.status === 401 && endpoint !== '/auth/login' && endpoint !== '/auth/register') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.dispatchEvent(new Event('auth-expired'));
      }
      throw new Error(data.message || `Request failed with status ${res.status}`);
    }

    return data;
  } catch (error) {
    console.error(`API Error on ${endpoint}:`, error);
    throw error;
  }
}

export const api = {
  // Authentication
  login: (email, password) => 
    request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  
  register: (name, email, password, role = 'student') => 
    request('/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password, role }) }),
  
  getMe: () => 
    request('/auth/me'),

  getAllSkills: () => 
    request('/auth/skills'),

  // Student Profile & Skills
  getStudentProfile: () => 
    request('/student/profile'),

  updateStudentProfile: (profileData) => 
    request('/student/profile', { method: 'PUT', body: JSON.stringify(profileData) }),

  getStudentSkills: () => 
    request('/student/skills'),

  addStudentSkill: (skillPayload) => 
    request('/student/skills', { method: 'POST', body: JSON.stringify(skillPayload) }),

  removeStudentSkill: (skillId) => 
    request(`/student/skills/${skillId}`, { method: 'DELETE' }),

  // Jobs
  getJobs: (params = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.location) query.append('location', params.location);
    if (params.job_type) query.append('job_type', params.job_type);
    if (params.role) query.append('role', params.role);
    if (params.min_score) query.append('min_score', params.min_score);
    if (params.sort_by) query.append('sort_by', params.sort_by);
    const qs = query.toString();
    return request(`/jobs${qs ? `?${qs}` : ''}`);
  },

  getJobById: (id) => 
    request(`/jobs/${id}`),

  createJob: (jobData) => 
    request('/jobs', { method: 'POST', body: JSON.stringify(jobData) }),

  updateJob: (id, jobData) => 
    request(`/jobs/${id}`, { method: 'PUT', body: JSON.stringify(jobData) }),

  deleteJob: (id) => 
    request(`/jobs/${id}`, { method: 'DELETE' }),

  // Matching Engine
  getMatches: (params = {}) => {
    const query = new URLSearchParams();
    if (params.min_score) query.append('min_score', params.min_score);
    if (params.limit) query.append('limit', params.limit);
    const qs = query.toString();
    return request(`/matches${qs ? `?${qs}` : ''}`);
  },

  getJobMatchExplanation: (jobId) => 
    request(`/matches/${jobId}`),

  // Applications
  applyToJob: (job_id) => 
    request('/applications', { method: 'POST', body: JSON.stringify({ job_id }) }),

  getApplications: (status = '') => 
    request(`/applications${status ? `?status=${encodeURIComponent(status)}` : ''}`),

  updateApplicationStatus: (appId, status) => 
    request(`/applications/${appId}`, { method: 'PUT', body: JSON.stringify({ status }) }),

  // Saved Jobs
  getSavedJobs: () => 
    request('/saved-jobs'),

  saveJob: (job_id) => 
    request('/saved-jobs', { method: 'POST', body: JSON.stringify({ job_id }) }),

  removeSavedJob: (job_id) => 
    request(`/saved-jobs/${job_id}`, { method: 'DELETE' }),

  // Admin
  getAdminStatistics: () => 
    request('/admin/statistics'),

  getAdminStudents: () => 
    request('/admin/students'),

  getAdminApplications: (status = '') => 
    request(`/admin/applications${status ? `?status=${encodeURIComponent(status)}` : ''}`),
};
