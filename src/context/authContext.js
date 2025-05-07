import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
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
  const [access_token, setToken] = useState(null);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [processed, setProcessed] = useState(false);

  const memoizedUser = useMemo(() => user, [user]);
  const memoizedProcessed = useMemo(() => processed, [processed]);

  // Check if user exists in Supabase or create/update
  const handleUserInSupabase = useMemo(() => async (authenticatedUser) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("email", authenticatedUser.email)
        .single();

      if (!data) {
        const { data: insertData, error: insertError } = await supabase
          .from("users")
          .insert([{
            id: authenticatedUser.id,
            email: authenticatedUser.email || "ashimasharma742@gmail.com",
            name: authenticatedUser.full_name || "ashima sharma",
            created_at: new Date(),
          }])
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
            email: authenticatedUser.email || "ashimasharma742@gmail.com",
            name: authenticatedUser.full_name || "ashima sharma"
          })
          .eq("email", authenticatedUser.email);

        if (updateError) {
          console.error("Error updating user:", updateError.message);
        } else {
          console.log("User updated:", updateData);
        }
      }
      setLoading(false);
      setProcessed(true);
    } catch (error) {
      console.error("Error handling user in Supabase:", error.message);
      setLoading(false);
    }
  }, []);

  // Auth state listener
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          console.log(session);
          setUser({ ...session.user.user_metadata, id: session.user.id });
        } else {
          setUser(null);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Fetch cart items when user is set
  useEffect(() => {
    const updateUserData = async () => {
      if (user && user.id) {
        if (!memoizedProcessed) {
          await handleUserInSupabase(user);
        }
        await fetchCartItems(user.id);
      }
    };

    updateUserData();
  }, [user, handleUserInSupabase, memoizedProcessed]);

  const logout = () => {
    supabase.auth.signOut();
    setUser(null);
    setToken(null);
  };

  // Fetch cart items with loading state
  const fetchCartItems = useMemo(() => async (userId) => {
    const { data, error } = await supabase
      .from("cart")
      .select(
        `*, products:product_id (
          id,
          name,
          banner_url,
          amount,
          description,
          rating
        )`
      )
      .eq("user_id", userId)
      .order("id", { ascending: true });
    if (!error) {
      setCart(data);
    } else {
      console.error("Fetch cart error:", error.message);
    }
    setLoading(false);
  }, []);

  const addToCart = async (product) => {
    if (!memoizedUser) return;

    const { data: existingItem, error: selectError } = await supabase
      .from("cart")
      .select("id, quantity")
      .eq("user_id", memoizedUser.id)
      .eq("product_id", product.id)
      .single();

    if (selectError && selectError.code !== "PGRST116") {
      console.error("Error checking existing cart item:", selectError.message);
      return;
    }

    if (!existingItem) {
      const { error: insertError } = await supabase.from("cart").insert([{
        product_id: product.id,
        user_id: memoizedUser.id,
        amount: product.amount,
        quantity: product.qty ? product.qty : 1,
      }]);

      if (insertError) {
        console.error("Error inserting cart item:", insertError.message);
      }
    } else {
      const { error: updateError } = await supabase.from("cart")
        .update({ quantity: existingItem.quantity + (product.qty ?? 1) })
        .eq("id", existingItem.id);

      if (updateError) {
        console.error("Error updating cart quantity:", updateError.message);
      }
    }

    await fetchCartItems(memoizedUser.id);
  };

  const removeFromCart = async (product) => {
    if (!memoizedUser) return;

    const { data: existingItem } = await supabase
      .from("cart")
      .select("id, quantity")
      .eq("user_id", memoizedUser.id)
      .eq("product_id", product.id)
      .single();

    if (existingItem) {
      const newQty = existingItem.quantity - 1;

      if (newQty > 0) {
        await supabase.from("cart")
          .update({ quantity: newQty })
          .eq("id", existingItem.id);
      } else {
        await supabase.from("cart")
          .delete()
          .eq("id", existingItem.id);
      }

     // await fetchCartItems(memoizedUser.id);
    }
  };

  const removeFromCartAfterOrder = async () => {
    if (!memoizedUser) return;

    await supabase.from("cart")
      .delete()
      .eq("user_id", memoizedUser.id);

    await fetchCartItems(memoizedUser.id);
  };

  return (
    <AuthContext.Provider value={{ user, logout, addToCart, removeFromCart, cart, setUser, removeFromCartAfterOrder, setToken, access_token, loading, setLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
