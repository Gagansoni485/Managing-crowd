import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Get token from localStorage
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const adminApi = {
  // Get all users
  getAllUsers: async () => {
    const response = await axios.get(`${API_URL}/admin/users`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  // Get dashboard stats
  getDashboardStats: async () => {
    const response = await axios.get(`${API_URL}/admin/stats`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  // Update user role
  updateUserRole: async (userId, role) => {
    const response = await axios.put(
      `${API_URL}/admin/users/${userId}/role`,
      { role },
      { headers: getAuthHeader() }
    );
    return response.data;
  },

  // Get analytics
  getAnalytics: async (period = '7') => {
    const response = await axios.get(`${API_URL}/admin/analytics?period=${period}`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  // Get all bookings/tokens
  getAllBookings: async () => {
    const response = await axios.get(`${API_URL}/admin/bookings`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  // Get all staff members
  getAllStaff: async () => {
    const response = await axios.get(`${API_URL}/admin/staff`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  // Assign task to staff
  assignTaskToStaff: async (staffId, taskData) => {
    const response = await axios.post(
      `${API_URL}/admin/staff/${staffId}/assign-task`,
      taskData,
      { headers: getAuthHeader() }
    );
    return response.data;
  },
};

export default adminApi;
