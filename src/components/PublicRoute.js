import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import { supabase } from "../supaBaseClient";

const PublicRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const { user, setUser } = useAuth();

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          setUser({ ...session.user.user_metadata, id: session.user.id });
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser({ ...session.user.user_metadata, id: session.user.id });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [setUser]);

  if (loading) return null;

  return user ? <Navigate to="/" replace /> : children;
};

export default PublicRoute;
