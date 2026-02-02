import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to all requests
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

// API Methods
export const catalogAPI = {
  // Get all items (armor sets + exotics)
  getAll: async () => {
    const response = await api.get('/catalog');
    return response.data;
  },
};

export const userItemsAPI = {
  // Get owned items for current user
  getOwned: async () => {
    const response = await api.get('/me/items');
    return response.data;
  },

  // Update ownership status for an item
  updateOwnership: async (itemId, owned) => {
    const response = await api.put(`/me/items/${itemId}`, { owned });
    return response.data;
  },
};

export default api;
