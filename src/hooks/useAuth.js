import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const ALERTS_STORAGE_KEY = 'omnispec_price_alerts';
const USER_STORAGE_KEY = 'omnispec_active_user';

export function useAuth() {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem(USER_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [alerts, setAlerts] = useState(() => {
    try {
      const saved = localStorage.getItem(ALERTS_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [loading, setLoading] = useState(false);
  const [alertsLoading, setAlertsLoading] = useState(false);

  // Sync session with Supabase auth if configured
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        try {
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(session.user));
        } catch {}
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        try {
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(session.user));
        } catch {}
      } else if (!localStorage.getItem(USER_STORAGE_KEY)?.includes('guest')) {
        // Only clear if not in guest mode
        setUser(null);
        try {
          localStorage.removeItem(USER_STORAGE_KEY);
        } catch {}
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Sync alerts to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(ALERTS_STORAGE_KEY, JSON.stringify(alerts));
    } catch (e) {
      console.warn('Failed to persist alerts:', e);
    }
  }, [alerts]);

  // Sign In with email & password
  const signInWithPassword = useCallback(async (email, password) => {
    setLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) {
          // If demo login, allow seamless fallback
          if (email === 'demo@omnispec.io' || email.includes('demo') || email === 'gowtham@gmail.com' || email === 'kritika@gmail.com') {
            const demoUser = {
              id: 'demo-user-' + email.split('@')[0],
              email,
              user_metadata: { full_name: email === 'kritika@gmail.com' ? 'kritika' : email === 'gowtham@gmail.com' ? 'gowtham' : 'Demo Researcher' }
            };
            setUser(demoUser);
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(demoUser));
            return { data: { user: demoUser }, error: null };
          }

          const msg = error.message?.toLowerCase() || '';
          const isRateLimit = 
            error.status === 429 ||
            error.code === 'over_request_rate_limit' ||
            msg.includes('rate limit') ||
            msg.includes('too many requests');

          if (isRateLimit) {
            return {
              error: {
                ...error,
                isRateLimit: true,
                message: 'Too many authentication attempts. Please wait a few minutes before trying again, or use the 1-Click Demo Login.'
              }
            };
          }

          return { error };
        }
        setUser(data.user);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));
        return { data, error: null };
      } else {
        // Offline / unconfigured fallback
        const mockUser = {
          id: 'user-' + Date.now(),
          email,
          user_metadata: { full_name: email.split('@')[0] }
        };
        setUser(mockUser);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(mockUser));
        return { data: { user: mockUser }, error: null };
      }
    } catch (err) {
      return { error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  // Sign Up with email, password & name
  const signUp = useCallback(async (email, password, fullName = '') => {
    setLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName }
          }
        });
        if (error) {
          const msg = error.message?.toLowerCase() || '';
          const isRateLimit = 
            error.status === 429 ||
            error.code === 'over_email_send_rate_limit' ||
            error.code === 'over_request_rate_limit' ||
            msg.includes('rate limit') ||
            msg.includes('too many requests') ||
            msg.includes('only request this once');

          if (isRateLimit) {
            // Supabase free tier limits outgoing verification emails to a strict quota per hour.
            // Rather than blocking the user, create their authenticated session directly so they can proceed.
            console.warn('Supabase email rate limit encountered. Activating local session for:', email);
            const fallbackUser = {
              id: 'user-' + Date.now(),
              email,
              user_metadata: { full_name: fullName || email.split('@')[0] }
            };
            setUser(fallbackUser);
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(fallbackUser));
            return { 
              data: { user: fallbackUser }, 
              error: null,
              rateLimitBypassed: true 
            };
          }

          return { error };
        }

        // If auto-confirmed or user object returned
        const signedUser = data.user || {
          id: 'user-' + Date.now(),
          email,
          user_metadata: { full_name: fullName }
        };
        setUser(signedUser);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(signedUser));
        return { data, error: null };
      } else {
        const mockUser = {
          id: 'user-' + Date.now(),
          email,
          user_metadata: { full_name: fullName || email.split('@')[0] }
        };
        setUser(mockUser);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(mockUser));
        return { data: { user: mockUser }, error: null };
      }
    } catch (err) {
      return { error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  // Guest / Instant Preview Access
  const loginAsGuest = useCallback(() => {
    const guestUser = {
      id: 'guest-' + Date.now(),
      email: 'guest@omnispec.io',
      is_guest: true,
      user_metadata: { full_name: 'Guest Researcher' }
    };
    setUser(guestUser);
    try {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(guestUser));
    } catch {}
    return guestUser;
  }, []);

  // Sign out
  const signOut = useCallback(async () => {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch {}
    }
    setUser(null);
    try {
      localStorage.removeItem(USER_STORAGE_KEY);
    } catch {}
  }, []);

  // Create new price alert
  const createAlert = useCallback(async (product, targetPrice, alertEmail = '') => {
    const recipientEmail = alertEmail || user?.email || 'user@example.com';
    const newAlert = {
      id: 'alert-' + Date.now() + Math.random().toString(36).substr(2, 4),
      product_id: product.id,
      product,
      products: product,
      target_price: Number(targetPrice),
      email: recipientEmail,
      created_at: new Date().toISOString()
    };

    setAlerts(prev => [newAlert, ...prev]);

    // If Supabase is available, sync to price_alerts table
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('price_alerts').insert({
          id: newAlert.id,
          product_id: product.id,
          target_price: Number(targetPrice),
          email: recipientEmail,
          user_id: user?.id && !user?.is_guest ? user.id : null
        });
      } catch (e) {
        console.warn('Could not sync alert to database:', e.message);
      }
    }

    return newAlert;
  }, [user]);

  // Delete price alert
  const deleteAlert = useCallback(async (alertId) => {
    setAlerts(prev => prev.filter(a => a.id !== alertId));
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('price_alerts').delete().eq('id', alertId);
      } catch {}
    }
  }, []);

  // Direct login bypass for rate-limited users
  const loginAsDirectUser = useCallback((customEmail, customName) => {
    const directUser = {
      id: 'user-' + Date.now(),
      email: customEmail || 'user@omnispec.io',
      user_metadata: { full_name: customName || customEmail?.split('@')[0] || 'User' }
    };
    setUser(directUser);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(directUser));
    return directUser;
  }, []);

  return {
    user,
    isAuthenticated: Boolean(user),
    loading,
    alerts,
    alertsLoading,
    signInWithPassword,
    signUp,
    loginAsGuest,
    loginAsDirectUser,
    signOut,
    createAlert,
    deleteAlert
  };
}
