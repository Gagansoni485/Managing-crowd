import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Get token from localStorage
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const queueApi = {
  // Get all queues
  getAllQueues: async () => {
    const response = await axios.get(`${API_URL}/queue`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  // Get queue by temple
  getQueueByTemple: async (templeId) => {
    const response = await axios.get(`${API_URL}/queue/temple/${templeId}`);
    return response.data;
  },

  // Join queue
  joinQueue: async (tokenId, templeId) => {
    const response = await axios.post(
      `${API_URL}/queue/join`,
      { tokenId, templeId },
      { headers: getAuthHeader() }
    );
    return response.data;
  },

  // Leave queue
  leaveQueue: async (queueId) => {
    const response = await axios.delete(`${API_URL}/queue/${queueId}`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  // Update queue position (Admin only)
  updateQueuePosition: async (queueId, position) => {
    const response = await axios.put(
      `${API_URL}/queue/${queueId}/position`,
      { position },
      { headers: getAuthHeader() }
    );
    return response.data;
  },
};

export default queueApi;
