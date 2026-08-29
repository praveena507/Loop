import React, { createContext, useContext, useState } from 'react';
import { api } from '../services/api';

const UserAuthContext = createContext(null);

export const UserAuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('loop_user_profile');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('loop_user_token') || null);
  const [loading, setLoading] = useState(false);

  const requestOTP = async (email, name) => {
    setLoading(true);
    try {
      const res = await api.requestLoginOTP(email, name);
      return res;
    } finally {
      setLoading(false);
    }
  };

  const verifyOTPAndLogin = async (email, otp, name) => {
    setLoading(true);
    try {
      const res = await api.verifyLoginOTP(email, otp, name);
      if (res.success && res.user) {
        setUser(res.user);
        setToken(res.token);
        localStorage.setItem('loop_user_profile', JSON.stringify(res.user));
        localStorage.setItem('loop_user_token', res.token);
        return { success: true, user: res.user };
      }
      return { success: false, error: res.error || 'Verification failed.' };
    } catch (err) {
      return { success: false, error: err.message || 'Login failed.' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('loop_user_profile');
    localStorage.removeItem('loop_user_token');
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    requestOTP,
    verifyOTPAndLogin,
    logout
  };

  return <UserAuthContext.Provider value={value}>{children}</UserAuthContext.Provider>;
};

export const useUserAuth = () => {
  const context = useContext(UserAuthContext);
  if (!context) {
    throw new Error('useUserAuth must be used within a UserAuthProvider');
  }
  return context;
};
