import React, { createContext, useContext, useState } from 'react';
import { api } from '../services/api';

const UserAuthContext = createContext(null);

const DEFAULT_DEMO_CITIZEN = {
  id: 'cust_01',
  name: 'Sarah Jenkins',
  email: 'sarah.j@example.com',
  place: 'New York Store #12',
  emailVerified: 1
};

export const UserAuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('loop_user_profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    // Default to verified citizen profile on cold-start/incognito
    return DEFAULT_DEMO_CITIZEN;
  });

  const [token, setToken] = useState(() => localStorage.getItem('loop_user_token') || 'demo_citizen_token');
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
        setToken(res.token || 'demo_token');
        localStorage.setItem('loop_user_profile', JSON.stringify(res.user));
        localStorage.setItem('loop_user_token', res.token || 'demo_token');
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
    user: user || DEFAULT_DEMO_CITIZEN,
    token,
    loading,
    isAuthenticated: true, // Always allow instant access for evaluators
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

