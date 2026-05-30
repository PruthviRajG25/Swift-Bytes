import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../services/api';

const CanteenContext = createContext(null);

export const CanteenProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    try {
      const { data } = await api.get('/canteen/status');
      setIsOpen(Boolean(data?.isOpen));
    } catch {
      // keep last-known status
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const value = useMemo(
    () => ({ isOpen, loading, refresh, setIsOpen }),
    [isOpen, loading]
  );

  return <CanteenContext.Provider value={value}>{children}</CanteenContext.Provider>;
};

export const useCanteen = () => {
  const ctx = useContext(CanteenContext);
  if (!ctx) throw new Error('useCanteen must be used within CanteenProvider');
  return ctx;
};

