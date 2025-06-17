// components/ProtectedRoute.jsx
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import { supabase } from "../supaBaseClient";

const ProtectedRoute = ({ children }) => {
  const [loading, setLoading] = useState(true); // Start as true while checking
  const { user, setUser,setToken } = useAuth();

useEffect(() => {
  // Fallback: try restoring session from localStorage manually
  const restoreSession = async () => {
    // Supabase stores the session under a key like this:
    const key = Object.keys(localStorage).find((k) =>
      k.startsWith("sb-") && k.endsWith("-auth-token")
    );

    if (key) {
      try {
        const sessionRaw = localStorage.getItem(key);
        if (sessionRaw) {
          const session = JSON.parse(sessionRaw);
          if (session?.access_token && session?.user) {
            setUser({ ...session.user.user_metadata, id: session.user.id });
            setToken(session.access_token);
          }
        }
      } catch (err) {
        console.error("Failed to restore session:", err);
      }
    }

    setLoading(false);
  };

  restoreSession()

}, []);

  

  if (loading) return null; // Optionally show a spinner

  return user ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
