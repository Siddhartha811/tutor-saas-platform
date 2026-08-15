import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import api from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [tenant, setTenant] = useState(() => {
    const stored = localStorage.getItem('tenant');
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token'));

  const persist = (nextToken, nextUser, nextTenant) => {
    localStorage.setItem('token', nextToken);
    localStorage.setItem('user', JSON.stringify(nextUser));
    if (nextTenant) localStorage.setItem('tenant', JSON.stringify(nextTenant));
    setToken(nextToken);
    setUser(nextUser);
    if (nextTenant) setTenant(nextTenant);
  };

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    persist(data.token, data.user);
    const me = await api.get('/auth/me', { headers: { Authorization: `Bearer ${data.token}` } });
    persist(data.token, me.data.user, me.data.tenant);
    return data;
  }, []);

  const register = useCallback(async (payload) => {
    const { data } = await api.post('/auth/register', payload);
    persist(data.token, data.user, data.tenant);
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('tenant');
    setToken(null);
    setUser(null);
    setTenant(null);
  }, []);

  useEffect(() => {
    if (token && !tenant) {
      api.get('/auth/me').then(({ data }) => {
        setTenant(data.tenant);
        localStorage.setItem('tenant', JSON.stringify(data.tenant));
      }).catch(() => logout());
    }
  }, [token, tenant, logout]);

  return (
    <AuthContext.Provider value={{ user, tenant, token, login, register, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);