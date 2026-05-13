// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
const AuthContext = createContext();
const API_BASE = 'https://yellowgreen-jay-842557.hostingersite.com';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [otpSent, setOtpSent] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('whp_user').then(async (data) => {
      if (!data) return;
      const stored = JSON.parse(data);
      setUser(stored);

      // Re-fetch gmsToken fresh on every app start using the app token
      // This ensures we always have the latest full-length GMS token
      if (stored?.token) {
        try {
          const r = await fetch(`${API_BASE}/api/app/refresh-gms-token`, {
            headers: { 'x-app-token': stored.token }
          });
          const d = await r.json();
          if (d.success && d.gmsToken) {
            const updated = { ...stored, gmsToken: d.gmsToken, gmsUser: d.gmsUser || stored.gmsUser };
            setUser(updated);
            AsyncStorage.setItem('whp_user', JSON.stringify(updated));
          }
        } catch (e) {
          // Silent fail — use cached token
        }
      }
    });
  }, []);

  async function sendOTP(phone) {
    const res = await fetch(`${API_BASE}/api/app/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-App-Client': 'whp-mobile-app' },
      body: JSON.stringify({ phone }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Failed to send OTP');
    setOtpSent(true);
    return data;
  }

  async function verifyOTP(phone, inputOtp) {
    const res = await fetch(`${API_BASE}/api/app/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-App-Client': 'whp-mobile-app' },
      body: JSON.stringify({ phone, otp: inputOtp }),
    });
    return await res.json();
  }

  async function registerUser(phone, name, email) {
    const res = await fetch(`${API_BASE}/api/app/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-App-Client': 'whp-mobile-app' },
      body: JSON.stringify({ phone, name, email }),
    });
    return await res.json();
  }

  async function logoutFromServer(token) {
    try {
      await fetch(`${API_BASE}/api/app/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-App-Token': token },
      });
    } catch (e) {}
  }

  function login(userData) {
    setUser(userData);
    AsyncStorage.setItem('whp_user', JSON.stringify(userData));
  }

  function logout() {
    if (user?.token) logoutFromServer(user.token);
    setUser(null);
    setOtpSent(false);
    AsyncStorage.removeItem('whp_user');
  }

  return (
    <AuthContext.Provider value={{ user, otpSent, sendOTP, verifyOTP, registerUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);