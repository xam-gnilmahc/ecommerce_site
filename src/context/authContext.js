import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../supaBaseClient";

// Create context
const AuthContext = createContext();

// Custom hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  // Check if user exists in Supabase or create/update
  const handleUserInSupabase = async (userId, authenticatedUser) => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("email", authenticatedUser.email)
        .single();

      if (!data) {
        console.log("User does not exist, creating a new user.");
        const { data: insertData, error: insertError } = await supabase
          .from("users")
          .insert([
            {
              id:userId,
              email: authenticatedUser.email,
              name: authenticatedUser.full_name || "Unnamed",
              created_at: new Date(),
            },
          ])
          .select();

        if (insertError) {
          console.error("Error inserting user:", insertError.message);
        } else {
          console.log("User inserted:", insertData);
        }
      } else {
        const { data: updateData, error: updateError } = await supabase
          .from("users")
          .update({
            email: authenticatedUser.email,
          })
          .eq("email", authenticatedUser.email);

        if (updateError) {
          console.error("Error updating user:", updateError.message);
        } else {
          console.log("User updated:", updateData);
        }
      }
    } catch (error) {
      console.error("Error handling user in Supabase:", error.message);
    }
  };

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          setUser(session.user.user_metadata);
          //await handleUserInSupabase(session.user.user_metadata);
        } else {
          setUser(null);
        }
      }
    );
  
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);
  


  const login = async (userId,userData, accessToken) => {
    setUser(userData);
    setToken(accessToken);
    await handleUserInSupabase( userId,userData);
  };

  const logout = () => {
    supabase.auth.signOut();
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
