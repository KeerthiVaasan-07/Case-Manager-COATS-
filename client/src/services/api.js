const API_BASE = '/api';

function getHeaders() {
  const token = localStorage.getItem('coats_token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function handleResponse(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = (data && data.error) || res.statusText || 'An error occurred';
    throw new Error(error);
  }
  return data;
}

export const api = {
  // Auth
  async login(username, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    return handleResponse(res);
  },

  async getMe() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async demoLogin(username) {
    const res = await fetch(`${API_BASE}/auth/demo-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username })
    });
    return handleResponse(res);
  },

  async getOfficers() {
    const res = await fetch(`${API_BASE}/auth/officers`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  // Cases
  async getCases(params = {}) {
    const query = new URLSearchParams();
    if (params.branch && params.branch !== 'ALL') query.append('branch', params.branch);
    if (params.stage && params.stage !== 'ALL') query.append('stage', params.stage);
    if (params.search) query.append('search', params.search);
    if (params.officer) query.append('officer', params.officer);

    const res = await fetch(`${API_BASE}/cases?${query.toString()}`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async getCaseById(id) {
    const res = await fetch(`${API_BASE}/cases/${id}`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async createCase(caseData) {
    const res = await fetch(`${API_BASE}/cases`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(caseData)
    });
    return handleResponse(res);
  },

  async updateProgress(caseId, progressData) {
    const res = await fetch(`${API_BASE}/cases/${caseId}/progress`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(progressData)
    });
    return handleResponse(res);
  },

  // Dashboard for Supervisory
  async getDashboardMetrics(params = {}) {
    const query = new URLSearchParams();
    if (params.branch && params.branch !== 'ALL') query.append('branch', params.branch);
    if (params.startDate) query.append('startDate', params.startDate);
    if (params.endDate) query.append('endDate', params.endDate);

    const res = await fetch(`${API_BASE}/dashboard/metrics?${query.toString()}`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  }
};
