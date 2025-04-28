// components/ProtectedRoute.jsx
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import { supabase } from "../supaBaseClient";

const ProtectedRoute = ({ children }) => {
  const [loading, setLoading] = useState(true); // Start as true while checking
  const { user, setUser,setToken } = useAuth();

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          setUser({ ...session.user.user_metadata, id: session.user.id });
          setToken(session?.access_token);
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    // Initial check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser({ ...session.user.user_metadata, id: session.user.id });
        setToken(session?.access_token);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    // Cleanup listener on unmount
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [setUser]);
  

  if (loading) return null; // Optionally show a spinner

  return user ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
