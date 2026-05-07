import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth';

const authService = {
  signup: async (userData) => {
    const response = await axios.post(`${API_URL}/signup`, userData);
    return response.data;
  },

  login: async (userData) => {
    const response = await axios.post(`${API_URL}/login`, userData);
    return response.data;
  },

  getProfile: async (token) => {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
    const response = await axios.get(`${API_URL}/profile`, config);
    return response.data;
  }
};

export default authService;
