import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Get token from localStorage
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const parkingApi = {
  // Get all parking slots
  getAllParkingSlots: async () => {
    const response = await axios.get(`${API_URL}/parking`);
    return response.data;
  },

  // Get available parking slots
  getAvailableParkingSlots: async () => {
    const response = await axios.get(`${API_URL}/parking/available`);
    return response.data;
  },

  // Create parking slot (Admin)
  createParkingSlot: async (slotData) => {
    const response = await axios.post(
      `${API_URL}/parking`,
      slotData,
      { headers: getAuthHeader() }
    );
    return response.data;
  },

  // Update parking slot (Admin)
  updateParkingSlot: async (slotId, slotData) => {
    const response = await axios.put(
      `${API_URL}/parking/${slotId}`,
      slotData,
      { headers: getAuthHeader() }
    );
    return response.data;
  },

  // Bulk update parking slots (Computer Vision)
  bulkUpdateParkingSlots: async (slots) => {
    const response = await axios.post(`${API_URL}/parking/bulk-update`, {
      slots,
    });
    return response.data;
  },
};

export default parkingApi;
