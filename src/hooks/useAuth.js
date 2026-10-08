import { useState, useEffect, useCallback } from 'react';

const ALERTS_STORAGE_KEY = 'omnispec_price_alerts';

export function useAuth() {
  const [alerts, setAlerts] = useState(() => {
    try {
      const saved = localStorage.getItem(ALERTS_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [alertsLoading, setAlertsLoading] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(ALERTS_STORAGE_KEY, JSON.stringify(alerts));
    } catch (e) {
      console.warn('Failed to persist alerts:', e);
    }
  }, [alerts]);

  // Create new price alert (no auth required)
  const createAlert = useCallback(async (product, targetPrice, email = '') => {
    const newAlert = {
      id: 'alert-' + Date.now() + Math.random().toString(36).substr(2, 4),
      product_id: product.id,
      product,
      products: product,
      target_price: Number(targetPrice),
      email,
      created_at: new Date().toISOString()
    };

    setAlerts(prev => [newAlert, ...prev]);
    return newAlert;
  }, []);

  // Delete price alert
  const deleteAlert = useCallback(async (alertId) => {
    setAlerts(prev => prev.filter(a => a.id !== alertId));
  }, []);

  return {
    user: null, // Sign in / sign up temporarily removed as requested
    loading: false,
    alerts,
    alertsLoading,
    createAlert,
    deleteAlert,
    signInWithOtp: async () => {},
    signOut: async () => {}
  };
}
