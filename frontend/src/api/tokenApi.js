import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Get token from localStorage
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const tokenApi = {
  // Get visitor tokens
  getVisitorTokens: async () => {
    const response = await axios.get(`${API_URL}/visitor/tokens`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  // Create token booking
  createTokenBooking: async (bookingData) => {
    const response = await axios.post(
      `${API_URL}/visitor/tokens`,
      bookingData,
      { headers: getAuthHeader() }
    );
    return response.data;
  },

  // Get queue position
  getQueuePosition: async (tokenId) => {
    const response = await axios.get(`${API_URL}/visitor/queue/${tokenId}`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  // Rejoin queue
  rejoinQueue: async (tokenId) => {
    const response = await axios.post(
      `${API_URL}/visitor/queue/rejoin`,
      { tokenId },
      { headers: getAuthHeader() }
    );
    return response.data;
  },
};

export default tokenApi;
