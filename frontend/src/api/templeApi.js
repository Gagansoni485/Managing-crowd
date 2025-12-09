import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Get token from localStorage
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const templeApi = {
  // Get all temples
  getAllTemples: async () => {
    const response = await axios.get(`${API_URL}/temples`);
    return response.data;
  },

  // Get temple by ID
  getTempleById: async (templeId) => {
    const response = await axios.get(`${API_URL}/temples/${templeId}`);
    return response.data;
  },

  // Create temple (Admin)
  createTemple: async (templeData) => {
    const response = await axios.post(
      `${API_URL}/temples`,
      templeData,
      { headers: getAuthHeader() }
    );
    return response.data;
  },

  // Update temple (Admin)
  updateTemple: async (templeId, templeData) => {
    const response = await axios.put(
      `${API_URL}/temples/${templeId}`,
      templeData,
      { headers: getAuthHeader() }
    );
    return response.data;
  },

  // Delete temple (Admin)
  deleteTemple: async (templeId) => {
    const response = await axios.delete(`${API_URL}/temples/${templeId}`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },
};

export default templeApi;
