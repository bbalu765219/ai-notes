// API client utility for ChatGPT Notes Hub
const BASE_URL = '/api';

export const getAuthToken = () => localStorage.getItem('notes_hub_token');
export const setAuthToken = (token) => {
  if (token) localStorage.setItem('notes_hub_token', token);
  else localStorage.removeItem('notes_hub_token');
};

export const getStoredUser = () => {
  try {
    const userStr = localStorage.getItem('notes_hub_user');
    return userStr ? JSON.parse(userStr) : null;
  } catch {
    return null;
  }
};

export const setStoredUser = (user) => {
  if (user) localStorage.setItem('notes_hub_user', JSON.stringify(user));
  else localStorage.removeItem('notes_hub_user');
};

async function request(endpoint, options = {}) {
  const token = getAuthToken();
  const headers = { ...options.headers };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  const contentType = response.headers.get('content-type');
  const isJson = contentType && contentType.includes('application/json');

  if (!response.ok) {
    let errorMsg = `Request failed (${response.status})`;
    if (isJson) {
      const errorData = await response.json().catch(() => ({}));
      errorMsg = errorData.error || errorData.message || errorMsg;
    }
    throw new Error(errorMsg);
  }

  return isJson ? await response.json() : response;
}

export const api = {
  // Auth
  login: async (credentials) => {
    const data = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
    setAuthToken(data.token);
    setStoredUser(data.user);
    return data;
  },

  register: async (userData) => {
    const data = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
    setAuthToken(data.token);
    setStoredUser(data.user);
    return data;
  },

  logout: () => {
    setAuthToken(null);
    setStoredUser(null);
  },

  getProfile: () => request('/auth/me'),
  getFavorites: () => request('/auth/favorites'),
  toggleFavorite: (noteId) => request(`/auth/favorites/toggle/${noteId}`, { method: 'POST' }),
  getMyUploads: () => request('/auth/my-uploads'),

  // Notes
  getNotes: (params = {}) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '' && val !== 'All') {
        searchParams.append(key, val);
      }
    });
    const qs = searchParams.toString();
    return request(`/notes${qs ? `?${qs}` : ''}`);
  },

  getStats: () => request('/notes/stats/summary'),
  getNoteById: (id) => request(`/notes/${id}`),

  uploadNote: (formData) => {
    return request('/notes/upload', {
      method: 'POST',
      body: formData
    });
  },

  saveAiNote: (noteData) => {
    return request('/notes/save-ai', {
      method: 'POST',
      body: JSON.stringify(noteData)
    });
  },

  // AI Notes Generator
  checkAiStatus: () => request('/ai/status'),
  generateAiNotes: (params) => {
    return request('/ai/generate', {
      method: 'POST',
      body: JSON.stringify(params)
    });
  },

  // Admin
  getAdminStats: () => request('/admin/stats'),
  getPendingNotes: () => request('/admin/pending'),
  getAllNotesAdmin: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/admin/all-notes${qs ? `?${qs}` : ''}`);
  },
  updateNoteStatus: (id, status) => {
    return request(`/admin/notes/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  },
  deleteNoteAdmin: (id) => {
    return request(`/admin/notes/${id}`, { method: 'DELETE' });
  },
  getSubjects: () => request('/admin/subjects'),
  addSubject: (subject) => request('/admin/subjects', { method: 'POST', body: JSON.stringify(subject) }),
  deleteSubject: (id) => request(`/admin/subjects/${id}`, { method: 'DELETE' })
};
