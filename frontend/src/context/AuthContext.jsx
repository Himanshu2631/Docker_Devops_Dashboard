import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import authService from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Create axios instance with interceptor for automatic token injection
  const api = axios.create({
    baseURL: 'http://localhost:5000/api/'
  });

  api.interceptors.request.use((config) => {
    const activeToken = localStorage.getItem('token');
    if (activeToken) {
      config.headers.Authorization = `Bearer ${activeToken}`;
    }
    return config;
  });

  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const res = await authService.getProfile(token);
          setUser(res.data);
        } catch (err) {
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };
    loadUser();
  }, [token]);

  const login = async (userData) => {
    const res = await authService.login(userData);
    localStorage.setItem('token', res.token);
    setToken(res.token);
    setUser(res.data);
    return res;
  };

  const signup = async (userData) => {
    const res = await authService.signup(userData);
    localStorage.setItem('token', res.token);
    setToken(res.token);
    setUser(res.data);
    return res;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const continueAsGuest = () => {
    const guestUser = {
      username: 'Guest User',
      role: 'guest',
      isGuest: true
    };
    setUser(guestUser);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      loading, 
      login, 
      signup, 
      logout, 
      continueAsGuest,
      isAuthenticated: !!user,
      api
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
