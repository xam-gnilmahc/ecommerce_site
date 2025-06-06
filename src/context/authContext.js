import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { supabase } from "../supaBaseClient";
import { sendOrderEmail } from "../service/emailService";
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
    setCart([]);
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

  const removeFromCart = async (product, state = false) => {
    if (!memoizedUser) return;

    const { data: existingItem } = await supabase
      .from("cart")
      .select("id, quantity")
      .eq("user_id", memoizedUser.id)
      .eq("product_id", product.id)
      .single();

    if (existingItem & !state) {
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

      await fetchCartItems(memoizedUser.id);
    }

    if(state){
      await supabase.from("cart")
      .delete()
      .eq("id", existingItem.id);

      await fetchCartItems(memoizedUser.id);
    }
  };

  const removeFromCartAfterOrder = async () => {
    if (!memoizedUser) return;

    await supabase.from("cart")
      .delete()
      .eq("user_id", memoizedUser.id);

    await fetchCartItems(memoizedUser.id);
  };

  const insertReviewWithAttachments = async ({  productId , rating, reviewText, files }) => {
    try {
      // 1. Insert the review
      const { data: review, error: reviewError } = await supabase
      .from('reviews')
      .insert([
        {
          user_id: user.id,
          product_id: productId,
          rating,
          review: reviewText,
        },
      ])
      .select()
      .single();

    if (reviewError) throw reviewError;

    const attachments = [];

    for (const file of files) {
      const filePath = `${Date.now()}-${file.name}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('attachments')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL from Supabase
      const { data: publicUrlData } = supabase.storage
        .from('attachments')
        .getPublicUrl(filePath);

      const publicUrl = publicUrlData.publicUrl;

      attachments.push({
        review_id: review.id,
        file_url: publicUrl,
        file_name: file.name,
      });
      
    }
      // 3. Insert attachments metadata into the attachments table
      if (attachments.length > 0) {
        const { error: attachInsertError } = await supabase
          .from('review_attachments')
          .insert(attachments);
  
        if (attachInsertError) throw attachInsertError;
      }
  
      return true;
    } catch (error) {
      console.error('Error inserting review with attachments:', error.message);
      throw error;
    }
  };

  const placeOrder = async (data, stripe) => {
    if (!memoizedUser || cart.length === 0) return;
  
    try {
  
      // Generate delivery date (7 days from now)
      const deliveryDate = new Date();
      deliveryDate.setDate(deliveryDate.getDate() + 7);
  
      // Generate unique tracking code (e.g., ORD-XYZ123)
      const generateTrackingCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        const randomCode = Array.from({ length: 6 }, () =>
          chars[Math.floor(Math.random() * chars.length)]
        ).join('');
        return `ORD-${randomCode}`;
      };
  
      // Ensure the tracking code is unique
      let trackingCode;
      let isUnique = false;
      while (!isUnique) {
        trackingCode = generateTrackingCode();
        const { data: existing } = await supabase
          .from("orders")
          .select("id")
          .eq("tracking_code", trackingCode)
          .single();
  
        if (!existing) {
          isUnique = true;
        }
      }
  
      // 1. Create new order
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert([
          {
            user_id: memoizedUser.id,
            status: data.payment_status == "success" ? "Confirmed" : "Pending",
            created_at: new Date(),
            total_amount: data.amount,
            shipping_address: data.address,
            payment_status: data.payment_status,
            order_date: deliveryDate.toISOString(),
            tracking_number: trackingCode,
          },
        ])
        .select()
        .single();
  
      if (orderError) {
        throw orderError;
      }
  
      const orderId = orderData.id;
  
      // 2. Prepare order items
      const orderItems = cart.map((item) => ({
        order_id: orderId,
        product_id: item.product_id,
        quantity: item.quantity,
        price_each: item.amount,
      }));
  
      // 3. Insert order items
      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);
  
      if (itemsError) {
        throw itemsError;
      }
  
      // 3. Insert order items
      const { error: logError } = await supabase
        .from("orderpayments_logs")
        .insert([
          {
            order_id: orderId,
            stripe_payment_id:stripe.transactionId,
            charge_id:stripe.chargeId,
            status: stripe.message,
            amount: data.amount,
            currency: 'USD',
            response_data: stripe,
          },
        ]);
  
      if (logError) {
        throw itemsError;
      }
      
      await sendOrderEmail(
                  user.full_name || user.name,
                  data.email,
                  cart,
                  data.address,
                  data.amount,
                  orderId,
                  deliveryDate.toISOString()
                );
      // 4. Clear cart after order
      await removeFromCartAfterOrder();
  
      console.log("Order placed successfully with tracking:", trackingCode);
      return orderId;
    } catch (error) {
      console.error("Error placing order:", error.message);
      throw error;
    }
  };
  
  // Inside AppContextProvider or export separately
  const fetchUserOrders = async () => {
    if (!memoizedUser) return [];
  
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          order_items (
            *,
            products:product_id (
              id,
              name,
              banner_url,
              amount,
              description
            )
          ),
          orderpayments_logs(
          *)
        `)
        .eq("user_id", memoizedUser.id)
        .neq('status', "Cancelled")
        .order("created_at", { ascending: false });
  
      if (error) {
        console.error("Error fetching orders:", error.message);
        return [];
      }
      return data;
    } finally {
      setLoading(false);
    }
  };

  const fetchUserCancelledOrders = async () => {
    if (!memoizedUser) return [];
  
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          order_items (
            *,
            products:product_id (
              id,
              name,
              banner_url,
              amount,
              description
            )
          ),
          orderpayments_logs (
            *
          )
        `)
        .eq("user_id", memoizedUser.id)
        .eq("status", "Cancelled")
        .order("created_at", { ascending: false });
  
      if (error) {
        console.error("Error fetching orders:", error.message);
        return [];
      }
  
      // 🔽 Replace logs array with only the latest (max id)
      const processedData = data.map(order => {
        const logs = order.orderpayments_logs || [];
        const latestLog = logs.sort((a, b) => b.id - a.id)[0] || null;
        console.log(latestLog);
        return {
          ...order,
          orderpayments_logs: latestLog ?? null,
        };
      });
  
      return processedData;
    } finally {
      setLoading(false);
    }
  };
  
  

  
  const getOrderDetails = async (orderId) => {
    setLoading(true);
    try {
      
      const { data, error: orderError } = await supabase
        .from("orders")
        .select(`
          *,
          order_items (
            *,
            products:product_id (
              id,
              name,
              banner_url,
              amount,
              description
            )
          ),
          orderpayments_logs(
          *)
        `)
        .eq("id", orderId)
        .single();
  
      if (orderError) {
        throw orderError;
      }
  
      const latestLog =
      data.orderpayments_logs?.sort((a, b) => b.id - a.id)[0] || null;

    // Replace full logs array with the latest one only
    const processedData = {
      ...data,
      orderpayments_logs: latestLog,
    };

    console.log(processedData);

    return processedData;
    } catch (error) {
      console.error("Error fetching order details:", error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateOrder = async (orderId, result, amount, reason="Change my minde") => {
    // Fetch the latest payment log for this order
    const { data: latestLog, error: fetchError } = await supabase
      .from("orderpayments_logs")
      .select("*")
      .eq("order_id", orderId)
      .order("id", { ascending: false })
      .limit(1)
      .single();
  
    if (fetchError || !latestLog) {
      console.error("Failed to fetch latest payment log:", fetchError);
      return;
    }
  
    // Insert a new refund log
    const { error: logInsertError } = await supabase
      .from("orderpayments_logs")
      .insert([
        {
          order_id: latestLog.order_id,
          stripe_payment_id: latestLog.stripe_payment_id,
          status: result.message,
          amount: amount,
          currency: "USD",
          refund_transaction_id: result.refundId, // renamed for clarity
          charge_id: latestLog.charge_id,
        },
      ]);
  
    if (logInsertError) {
      console.error("Failed to insert refund log:", logInsertError);
      throw logInsertError;
    }
  
    // Update the order status
    const { error: updateError } = await supabase
      .from("orders")
      .update({ status: "Cancelled", Reason: reason })
      .eq("id", orderId);
  
    if (updateError) {
      console.error("Failed to update order status:", updateError);
      throw updateError;
    }
  };
  
  return (
    <AuthContext.Provider value={{ user, logout, addToCart, removeFromCart, cart, setUser, removeFromCartAfterOrder, setToken, access_token, loading, setLoading,placeOrder,fetchUserOrders,getOrderDetails,updateOrder , fetchUserCancelledOrders}}>
      {children}
    </AuthContext.Provider>
  );
};
