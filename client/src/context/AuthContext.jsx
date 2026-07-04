import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { connectSocket, disconnectSocket } from '../services/socket';

const AuthContext = createContext();
const SESSION_DAYS = 14;
const SESSION_MS = SESSION_DAYS * 24 * 60 * 60 * 1000;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('canteenUser');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const stored = localStorage.getItem('canteenUser');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          const loginAt = Number(parsed?.loginAt || 0);
          if (!loginAt || Date.now() - loginAt > SESSION_MS) {
            localStorage.removeItem('canteenUser');
            setUser(null);
            disconnectSocket();
            setLoading(false);
            return;
          }
          const { data } = await api.get('/auth/me');
          const updated = { ...parsed, ...data };
          setUser(updated);
          localStorage.setItem('canteenUser', JSON.stringify(updated));
          connectSocket(updated._id);
        } catch {
          localStorage.removeItem('canteenUser');
          setUser(null);
        }
      }
      setLoading(false);
    };
    init();
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    const withSession = { ...data, loginAt: Date.now(), sessionDays: SESSION_DAYS };
    setUser(withSession);
    localStorage.setItem('canteenUser', JSON.stringify(withSession));
    connectSocket(withSession._id);
    return withSession;
  };

  const register = async (name, email, password, dietPreference = 'all') => {
    const { data } = await api.post('/auth/register', { name, email, password, dietPreference });
    const withSession = { ...data, loginAt: Date.now(), sessionDays: SESSION_DAYS };
    setUser(withSession);
    localStorage.setItem('canteenUser', JSON.stringify(withSession));
    connectSocket(withSession._id);
    return withSession;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('canteenUser');
    disconnectSocket();
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
