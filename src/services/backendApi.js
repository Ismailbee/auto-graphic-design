const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001/api';

async function request(path, { method = 'GET', headers = {}, body, raw = false } = {}) {
  const url = `${API_BASE_URL}${path}`;
  const options = { method, headers: { ...headers } };

  if (body instanceof FormData) {
    options.body = body;
  } else if (body !== undefined && body !== null) {
    options.headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);

  if (!response.ok) {
    const text = await response.text();
    let details;
    try {
      details = JSON.parse(text);
    } catch (error) {
      details = text || response.statusText;
    }
    const message = details?.details ?? details?.message ?? details ?? 'Request failed';
    throw new Error(message);
  }

  if (raw) {
    return response;
  }

  const contentType = response.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    return response.json();
  }
  if (contentType.includes('application/pdf')) {
    return response.blob();
  }
  return response.text();
}

export const backendApi = {
  get apiBaseUrl() {
    return API_BASE_URL;
  },

  async health() {
    return request('/', { method: 'GET' });
  },

  // ==========================================
  // AUTH
  // ==========================================

  async register(email, password, name) {
    return request('/auth/register', {
      method: 'POST',
      body: { email, password, name }
    });
  },

  async login(email, password) {
    return request('/auth/login', {
      method: 'POST',
      body: { email, password }
    });
  },

  async refreshToken(refreshToken) {
    return request('/auth/refresh', {
      method: 'POST',
      body: { refreshToken }
    });
  },

  async getCurrentUser(token) {
    return request('/auth/me', {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
  },

  async updateProfile(token, updates) {
    return request('/auth/profile', {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}` },
      body: updates
    });
  },

  async changePassword(token, currentPassword, newPassword) {
    return request('/auth/change-password', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: { currentPassword, newPassword }
    });
  },

  // ==========================================
  // IMPOSITION
  // ==========================================

  async getImpositionOptions() {
    return request('/imposition/options');
  },

  async impose(formData) {
    return request('/impose', { method: 'POST', body: formData, raw: true }).then((response) => response.blob());
  },

  // ==========================================
  // TEMPLATES
  // ==========================================

  async getTemplates(category) {
    const query = category ? `?category=${encodeURIComponent(category)}` : '';
    return request(`/templates${query}`);
  },

  async createTemplate(payload) {
    return request('/templates', { method: 'POST', body: payload });
  },

  async updateTemplate(id, payload) {
    return request(`/templates/${id}`, { method: 'PUT', body: payload });
  },

  async deleteTemplate(id) {
    return request(`/templates/${id}`, { method: 'DELETE' });
  },

  // ==========================================
  // DESIGNS
  // ==========================================

  async getDesigns(templateId) {
    const query = templateId ? `?templateId=${encodeURIComponent(templateId)}` : '';
    return request(`/designs${query}`);
  },

  async createDesign(payload) {
    return request('/designs', { method: 'POST', body: payload });
  },

  async updateDesign(id, payload) {
    return request(`/designs/${id}`, { method: 'PUT', body: payload });
  },

  async deleteDesign(id) {
    return request(`/designs/${id}`, { method: 'DELETE' });
  },

  // ==========================================
  // ASSETS
  // ==========================================

  async listAssets(tag) {
    const query = tag ? `?tag=${encodeURIComponent(tag)}` : '';
    return request(`/assets${query}`);
  },

  async getAsset(id) {
    return request(`/assets/${id}`);
  },

  async uploadAsset(file) {
    const formData = new FormData();
    formData.append('file', file);
    return request('/assets/upload', { method: 'POST', body: formData });
  },

  async updateAsset(id, payload) {
    return request(`/assets/${id}`, { method: 'PUT', body: payload });
  },

  async deleteAsset(id) {
    return request(`/assets/${id}`, { method: 'DELETE' });
  },

  // ==========================================
  // COMMENTS
  // ==========================================

  async getComments(filters = {}) {
    const params = new URLSearchParams();
    if (filters.templateId) params.append('templateId', filters.templateId);
    if (filters.designId) params.append('designId', filters.designId);
    if (filters.userId) params.append('userId', filters.userId);
    const query = params.toString() ? `?${params.toString()}` : '';
    return request(`/comments${query}`);
  },

  async getComment(id) {
    return request(`/comments/${id}`);
  },

  async createComment(token, commentData) {
    return request('/comments', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: commentData
    });
  },

  async updateComment(token, id, updates) {
    return request(`/comments/${id}`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` },
      body: updates
    });
  },

  async deleteComment(token, id) {
    return request(`/comments/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
  },

  async likeComment(token, id) {
    return request(`/comments/${id}/like`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
  },

  async getCommentStats(templateId = null, designId = null) {
    const params = new URLSearchParams();
    if (templateId) params.append('templateId', templateId);
    if (designId) params.append('designId', designId);
    const query = params.toString() ? `?${params.toString()}` : '';
    return request(`/comments/stats${query}`);
  },

  // ==========================================
  // SEARCH
  // ==========================================

  async searchSuggestions(query) {
    const params = query ? `?q=${encodeURIComponent(query)}` : '';
    return request(`/search/suggestions${params}`);
  },

  // ==========================================
  // USERS
  // ==========================================

  async listUsers() {
    return request('/users');
  },

  async getUser(id) {
    return request(`/users/${id}`);
  },

  async updateUser(id, payload) {
    return request(`/users/${id}`, { method: 'PATCH', body: payload });
  },
};
