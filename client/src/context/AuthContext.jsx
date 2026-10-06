import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allOfficers, setAllOfficers] = useState([]);

  useEffect(() => {
    async function loadSession() {
      const token = localStorage.getItem('coats_token');
      if (token) {
        try {
          const res = await api.getMe();
          setUser(res.user);
        } catch (err) {
          console.warn('Session expired or invalid:', err.message);
          localStorage.removeItem('coats_token');
          setUser(null);
        }
      }
      setLoading(false);
    }
    loadSession();
    fetchOfficersList();
  }, []);

  async function fetchOfficersList() {
    try {
      const list = await api.getOfficers();
      setAllOfficers(list);
    } catch (err) {
      console.warn('Could not load officers directory:', err.message);
    }
  }

  async function login(username, password) {
    const res = await api.login(username, password);
    localStorage.setItem('coats_token', res.token);
    setUser(res.user);
    return res.user;
  }

  async function quickSwitch(officer) {
    // Demo mode only: the server rejects this unless DEMO_MODE=true and the request is local.
    const res = await api.demoLogin(officer.username);
    localStorage.setItem('coats_token', res.token);
    setUser(res.user);
    return res.user;
  }

  function logout() {
    localStorage.removeItem('coats_token');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      logout,
      quickSwitch,
      allOfficers,
      refreshOfficers: fetchOfficersList,
      isSupervisory: user?.role === 'SUPERVISORY',
      isCaseHolding: user?.role === 'CASE_HOLDING'
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
