import api from './api';

// Auth services
export const authService = {
  // Login
  login: async (username, password) => {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
  },

  // Register
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // Logout
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await api.get('/me');
    return response.data;
  }
};

// Password services
export const passwordService = {
  // Forgot password - send OTP
  forgotPassword: async (email) => {
    const response = await api.post('/password/forgot', { email });
    return response.data;
  },

  // Verify OTP
  verifyOTP: async (email, otp) => {
    const response = await api.post('/password/verify-otp', { email, otp });
    return response.data;
  },

  // Reset password
  resetPassword: async (email, password, confirmPassword) => {
    const response = await api.post('/password/reset', { email, password, confirmPassword });
    return response.data;
  }
};

// Medication services
export const medicationService = {
  // Get all medications
  getAll: async () => {
    const response = await api.get('/medications');
    return response.data;
  },

  // Get single medication
  getById: async (id) => {
    const response = await api.get(`/medications/${id}`);
    return response.data;
  },

  // Create medication
  create: async (medicationData) => {
    const response = await api.post('/medications', medicationData);
    return response.data;
  },

  // Update medication
  update: async (id, medicationData) => {
    const response = await api.put(`/medications/${id}`, medicationData);
    return response.data;
  },

  // Delete medication
  delete: async (id) => {
    const response = await api.delete(`/medications/${id}`);
    return response.data;
  }
};

// Profile services
export const profileService = {
  // Get profile
  getProfile: async () => {
    const response = await api.get('/profile');
    return response.data;
  },

  // Update profile
  updateProfile: async (profileData) => {
    const response = await api.put('/profile', profileData);
    return response.data;
  },

  // Upload avatar
  uploadAvatar: async (formData) => {
    const response = await api.post('/profile/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // Delete avatar
  deleteAvatar: async () => {
    const response = await api.delete('/profile/avatar');
    return response.data;
  }
};

// Admin services
export const adminService = {
  // Get dashboard stats
  getDashboard: async () => {
    const response = await api.get('/admin/dashboard');
    return response.data;
  },

  // Get all users
  getUsers: async (params = {}) => {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },

  // Get single user
  getUser: async (id) => {
    const response = await api.get(`/admin/users/${id}`);
    return response.data;
  },

  // Update user role
  updateRole: async (id, role) => {
    const response = await api.put(`/admin/users/${id}/role`, { role });
    return response.data;
  },

  // Toggle user status
  toggleStatus: async (id) => {
    const response = await api.put(`/admin/users/${id}/status`);
    return response.data;
  },

  // Delete user
  deleteUser: async (id) => {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
  },

  // Update user profile (admin)
  updateUser: async (id, userData) => {
    const response = await api.put(`/admin/users/${id}`, userData);
    return response.data;
  }
};
