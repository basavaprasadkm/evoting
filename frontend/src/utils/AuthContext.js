import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('evoting_token');
    const userData = localStorage.getItem('evoting_user');
    if (token && userData) {
      setUser(JSON.parse(userData));
      // Verify token is still valid
      authAPI.getMe()
        .then(res => setUser(res.data.voter))
        .catch(() => logout())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = (token, userData) => {
    localStorage.setItem('evoting_token', token);
    localStorage.setItem('evoting_user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('evoting_token');
    localStorage.removeItem('evoting_user');
    setUser(null);
  };

  const updateUser = (userData) => {
    localStorage.setItem('evoting_user', JSON.stringify(userData));
    setUser(userData);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
