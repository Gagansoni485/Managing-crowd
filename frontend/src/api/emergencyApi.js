import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Get token from localStorage
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const emergencyApi = {
  // Create emergency request for guest users (no auth required)
  createGuestEmergency: async (emergencyData) => {
    const response = await axios.post(
      `${API_URL}/emergency/guest`,
      emergencyData
    );
    return response.data;
  },

  // Create emergency request (works for both logged-in users and guests)
  createEmergencyRequest: async (emergencyData) => {
    const token = localStorage.getItem('token');
    
    // If no token, use guest endpoint
    if (!token) {
      return emergencyApi.createGuestEmergency(emergencyData);
    }
    
    const response = await axios.post(
      `${API_URL}/emergency`,
      emergencyData,
      { headers: getAuthHeader() }
    );
    return response.data;
  },

  // Legacy alias
  createEmergency: async (emergencyData) => {
    return emergencyApi.createEmergencyRequest(emergencyData);
  },

  // Get my emergency requests
  getMyEmergencies: async () => {
    const response = await axios.get(`${API_URL}/emergency/my-requests`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  // Get all emergency requests (Admin/Volunteer)
  getAllEmergencies: async (status = null) => {
    const url = status
      ? `${API_URL}/emergency?status=${status}`
      : `${API_URL}/emergency`;
    const response = await axios.get(url, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  // Update emergency status (Admin/Volunteer)
  updateEmergencyStatus: async (emergencyId, statusData) => {
    const response = await axios.put(
      `${API_URL}/emergency/${emergencyId}`,
      statusData,
      { headers: getAuthHeader() }
    );
    return response.data;
  },
};

export default emergencyApi;
