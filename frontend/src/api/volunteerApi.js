import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Get token from localStorage
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const volunteerApi = {
  // Get assigned queues
  getAssignedQueues: async () => {
    const response = await axios.get(`${API_URL}/volunteer/queues`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  // Update queue status
  updateQueueStatus: async (queueId, status) => {
    const response = await axios.put(
      `${API_URL}/volunteer/queues/${queueId}`,
      { status },
      { headers: getAuthHeader() }
    );
    return response.data;
  },

  // Get emergency requests
  getEmergencyRequests: async () => {
    const response = await axios.get(`${API_URL}/volunteer/emergencies`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  // Respond to emergency
  respondToEmergency: async (emergencyId, responseData) => {
    const response = await axios.put(
      `${API_URL}/volunteer/emergencies/${emergencyId}`,
      responseData,
      { headers: getAuthHeader() }
    );
    return response.data;
  },
};

export default volunteerApi;
