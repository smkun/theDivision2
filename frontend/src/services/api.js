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

export const referenceAPI = {
  getAttributes: async () => {
    const response = await api.get('/attributes');
    return response.data;
  },
  getTalents: async () => {
    const response = await api.get('/talents');
    return response.data;
  },
  getSkills: async () => {
    const response = await api.get('/skills');
    return response.data;
  },
  getSpecializations: async () => {
    const response = await api.get('/specializations');
    return response.data;
  },
};

export const buildsAPI = {
  // Get user's builds
  getUserBuilds: async () => {
    const response = await api.get('/me/builds');
    return response.data;
  },

  // Get a specific build
  getBuild: async (id) => {
    const response = await api.get(`/me/builds/${id}`);
    return response.data;
  },

  // Create a new build
  createBuild: async (buildData) => {
    const response = await api.post('/me/builds', buildData);
    return response.data;
  },

  // Update a build
  updateBuild: async (id, buildData) => {
    const response = await api.put(`/me/builds/${id}`, buildData);
    return response.data;
  },

  // Delete a build
  deleteBuild: async (id) => {
    const response = await api.delete(`/me/builds/${id}`);
    return response.data;
  },

  // Duplicate a build
  duplicateBuild: async (id) => {
    const response = await api.post(`/me/builds/${id}/duplicate`);
    return response.data;
  },

  // Get public builds
  getPublicBuilds: async () => {
    const response = await api.get('/builds/public');
    return response.data;
  },

  // Get a specific public build
  getPublicBuild: async (id) => {
    const response = await api.get(`/builds/public/${id}`);
    return response.data;
  },

  // Copy a public build to user's builds
  copyPublicBuild: async (id) => {
    const response = await api.post(`/builds/public/${id}/copy`);
    return response.data;
  },
};

export default api;
