import { useState, useEffect } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const useBackendStatus = () => {
  const [isOnline, setIsOnline] = useState(null); // null = checking, true = online, false = offline
  const [lastCheck, setLastCheck] = useState(null);

  const checkBackendStatus = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const response = await fetch(`${API_BASE_URL.replace('/api', '')}/health`, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        setIsOnline(true);
        setLastCheck(new Date());
        return true;
      } else {
        setIsOnline(false);
        setLastCheck(new Date());
        return false;
      }
    } catch (error) {
      console.warn('Backend health check failed:', error.message);
      setIsOnline(false);
      setLastCheck(new Date());
      return false;
    }
  };

  useEffect(() => {
    // Check immediately on mount
    checkBackendStatus();

    // Check every 30 seconds
    const interval = setInterval(checkBackendStatus, 30000);

    return () => clearInterval(interval);
  }, []);

  return {
    isOnline,
    lastCheck,
    checkBackendStatus,
  };
};