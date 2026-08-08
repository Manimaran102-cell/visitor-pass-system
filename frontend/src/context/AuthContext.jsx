import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('vps_user');
    return raw ? JSON.parse(raw) : null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('vps_token', data.token);
      localStorage.setItem('vps_user', JSON.stringify(data.user));
      setUser(data.user);
      return data.user;
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed. Please try again.';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('vps_token');
    localStorage.removeItem('vps_user');
    setUser(null);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('vps_token');
    if (!token) {
      if (user) logout();
      return;
    }

    const verifySession = async () => {
      try {
        const { data } = await api.get('/auth/me');
        setUser(data.user);
        localStorage.setItem('vps_user', JSON.stringify(data.user));
      } catch (err) {
        logout();
      }
    };

    verifySession();
  }, [logout, user]);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
