import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supaBaseClient';
import recalcUserInterest from '../services/recalcUserInterest.ts';
import populateUserRecommendations from '../services/populateUserRecommendations.ts';
import { useNavigate } from 'react-router-dom';
import Pusher from 'pusher-js';
import { PUSHER_APP_KEY, PUSHER_CLUSTER } from '../config/env';
import { useVisitorCookie } from '../hooks/useVisitorCookie.ts';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [addressChecked, setAddressChecked] = useState(false);

  const { visitor, trackProduct } = useVisitorCookie(user?.id);

  const pusher = new Pusher(PUSHER_APP_KEY, {
    cluster: PUSHER_CLUSTER,
    encrypted: true,
  });

  useEffect(() => {
    if (!user?.id) return;
    const channel = pusher.subscribe(`user.${user.id}`);
    console.log(`Pusher initialized for user`);
    return () => {
      pusher.unsubscribe(`user-${user.id}`);
      console.log(`Pusher unsubscribed for user`);
    };
  }, [user?.id]);

  const handleUserInSupabase = async (authenticatedUser) => {
    try {
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('email', authenticatedUser.email)
        .single();

      if (!data) {
        const { error: insertError } = await supabase.from('users').insert([
          {
            id: authenticatedUser.id,
            email: authenticatedUser.email || 'null',
            name: authenticatedUser.full_name || 'null',
            created_at: new Date(),
            profile: authenticatedUser.picture || null,
          },
        ]);
        if (insertError) console.error('Error inserting user:', insertError.message);
      } else {
        const { error: updateError } = await supabase
          .from('users')
          .update({
            email: authenticatedUser.email,
            name: authenticatedUser.full_name,
            profile: authenticatedUser.picture || null,
          })
          .eq('email', authenticatedUser.email);
        if (updateError) console.error('Error updating user:', updateError.message);
      }
    } catch (error) {
      console.error('Error handling user in Supabase:', error.message);
    }
  };

  useEffect(() => {
    const initSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session) {
          const userData = { ...session.user.user_metadata, id: session.user.id };
          setUser(userData);
          handleUserInSupabase(userData);
        }
      } catch (err) {
        console.error('Error checking existing session:', err.message);
      } finally {
        setAuthLoading(false);
      }
    };

    initSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        const userData = { ...session.user.user_metadata, id: session.user.id };
        setUser(userData);
        handleUserInSupabase(userData);
      } else {
        setUser(null);
      }
      setAuthLoading(false);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!user?.id || addressChecked) return;

    const checkAddress = async () => {
      const { data, error } = await supabase
        .from('shipping_addresses')
        .select('id')
        .eq('user_id', user.id)
        .limit(1);

      setAddressChecked(true);

      if (error) {
        console.warn('Error checking shipping address:', error.message);
        return;
      }
      if (!data || data.length === 0) {
        const currentPath = window.location.pathname;
        if (currentPath !== '/add-address' && currentPath !== '/checkout') {
          navigate('/add-address');
        }
      }
    };

    checkAddress();
  }, [user?.id, addressChecked, navigate]);

  useEffect(() => {
    if (!user?.id) return undefined;
    let running = false,
      cancelled = false;
    const runRecalc = async () => {
      if (running || cancelled) return;
      running = true;
      try {
        await recalcUserInterest(user.id);
      } catch (err) {
        console.warn('recalcUserInterest failed', err);
      } finally {
        running = false;
      }
    };
    const intervalId = setInterval(() => {
      void runRecalc();
    }, 30 * 1000);
    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return undefined;
    let running = false,
      cancelled = false;
    const runRecalc = async () => {
      if (running || cancelled) return;
      running = true;
      try {
        await populateUserRecommendations(user.id);
      } catch (err) {
        console.warn('populateUserRecommendations failed', err);
      } finally {
        running = false;
      }
    };
    const intervalId = setInterval(() => {
      void runRecalc();
    }, 60 * 1000);
    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [user?.id]);

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setAddressChecked(false);
    navigate('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        authLoading,
        logout,
        visitor,
        trackProduct,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
