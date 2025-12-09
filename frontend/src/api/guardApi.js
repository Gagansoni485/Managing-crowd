import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Get token from localStorage
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const guardApi = {
  // Verify QR code at entrance
  verifyQR: async (qrData) => {
    const response = await axios.post(
      `${API_URL}/guard/verify-qr`,
      { qrData },
      { headers: getAuthHeader() }
    );
    return response.data;
  },

  // Get today's entry logs
  getEntryLogs: async () => {
    const response = await axios.get(`${API_URL}/guard/entry-logs`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },
};

export default guardApi;
