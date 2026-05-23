import { API_BASE_URL } from './config.js';
import { showToast } from './utils.js';

// Get stored token
export const getToken = () => localStorage.getItem('token');

// Set token
export const setToken = (token) => localStorage.setItem('token', token);

// Remove token
export const removeToken = () => localStorage.removeItem('token');

// Get user data
export const getUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

// Set user data
export const setUser = (user) => localStorage.setItem('user', JSON.stringify(user));

// Remove user data
export const removeUser = () => localStorage.removeItem('user');

// API request helper
export const apiRequest = async (endpoint, options = {}) => {
  const token = getToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };
  
  if (token) {
    headers['Authorization'] = token;
  }
  
  const config = {
    ...options,
    headers
  };
  
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }
    
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Auth API calls
export const authAPI = {
  signup: (userData) => apiRequest('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(userData)
  }),
  
  login: (credentials) => apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  })
};

// Issues API calls
export const issuesAPI = {
  getAll: (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    const url = `/issues${queryParams ? `?${queryParams}` : ''}`;
    return apiRequest(url);
  },
  
  getById: (id) => apiRequest(`/issues/${id}`),
  
  create: (issueData) => apiRequest('/issues', {
    method: 'POST',
    body: JSON.stringify(issueData)
  }),
  
  update: (id, issueData) => apiRequest(`/issues/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(issueData)
  }),
  
  updateStatus: (id, status) => apiRequest(`/issues/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  }),
  
  delete: (id) => apiRequest(`/issues/${id}`, {
    method: 'DELETE'
  })
};