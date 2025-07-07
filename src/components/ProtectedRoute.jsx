// components/ProtectedRoute.jsx
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import { supabase } from "../supaBaseClient";

const ProtectedRoute = ({ children }) => {
  const { user, setUser, setToken } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setLoading(false);
      return;
    }

    const restoreSession = async () => {
      const key = Object.keys(localStorage).find(
        (k) => k.startsWith("sb-") && k.endsWith("-auth-token")
      );

      if (key) {
        try {
          const sessionRaw = localStorage.getItem(key);
          const session = sessionRaw ? JSON.parse(sessionRaw) : null;

          if (session?.access_token && session?.user) {
            setUser({ ...session.user.user_metadata, id: session.user.id });
            setToken(session.access_token);
          }
        } catch (err) {
          console.error("Failed to restore session:", err);
        }
      }

      setLoading(false);
    };

    restoreSession();
  }, [user, setUser, setToken]);

  if (loading) return null; // Or show loading spinner if desired

  return user ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
