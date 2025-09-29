import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests if it exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getCurrentUser: () => api.get('/auth/me')
};

// Users API calls
export const usersAPI = {
  getAllUsers: () => api.get('/users'),
  getUserById: (userId) => api.get(`/users/${userId}`)
};

// Messages API calls
export const messagesAPI = {
  sendMessage: (messageData) => api.post('/messages', messageData),
  getConversation: (userId) => api.get(`/messages/conversation/${userId}`),
  getAllConversations: () => api.get('/messages/conversations'),
  markAsRead: (messageId) => api.patch(`/messages/${messageId}/read`)
};

export default api;