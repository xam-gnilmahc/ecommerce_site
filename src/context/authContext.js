import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
} from "react";
import { supabase } from "../supaBaseClient";
import { sendOrderEmail, sendDeliveryEmail ,sendNotification} from "../service/emailService";
import { useNavigate } from "react-router-dom";
import Pusher from 'pusher-js';

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
  const navigate = useNavigate();
  
  const [user, setUser] = useState(null);
  const [access_token, setToken] = useState(null);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [processed, setProcessed] = useState(false);

  const memoizedUser = useMemo(() => user, [user]);
  const memoizedProcessed = useMemo(() => processed, [processed]);
  
  const pusher = new Pusher('8a749302cc2bbbaf87b5', {
    cluster: 'ap1', // e.g., 'ap2'
    encrypted: true,
  });

  useEffect(() => {
    if (!user?.id) return;

    // Subscribe to user-specific channel (no events bound yet)
    const channel = pusher.subscribe(`user.${user.id}`);

    // Optional: log to verify it's subscribed
    console.log(`🔔 Pusher initialized for user: ${user.id}`);

    // Cleanup when component unmounts or user changes
    return () => {
      pusher.unsubscribe(`user-${user.id}`);
      console.log(`🧹 Pusher unsubscribed for user: ${user.id}`);
    };
  }, [user?.id]);

  // Check if user exists in Supabase or create/update
  const handleUserInSupabase = useMemo(
    () => async (authenticatedUser) => {
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
            .insert([
              {
                id: authenticatedUser.id,
                email: authenticatedUser.email || "null",
                name: authenticatedUser.full_name || "null",
                created_at: new Date(),
                profile:authenticatedUser.picture || null
              },
            ])
            .select();

          if (insertError) {
            console.error("Error inserting user:", insertError.message);
          } else {
            console.log("User inserted:");
          }
        } else {
          const { data: updateData, error: updateError } = await supabase
            .from("users")
            .update({
              email: authenticatedUser.email ,
              name: authenticatedUser.full_name,
              profile: authenticatedUser.picture || null
            })
            .eq("email", authenticatedUser.email);

          if (updateError) {
            console.error("Error updating user:", updateError.message);
          } else {
            console.log("User updated:");
          }
        }
        setLoading(false);
        setProcessed(true);
      } catch (error) {
        console.error("Error handling user in Supabase:", error.message);
        setLoading(false);
      }
    },
    []
  );

 useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          setUser({ ...session.user.user_metadata, id: session.user.id });
          handleUserInSupabase({...session.user.user_metadata, id: session.user.id });
        };
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);
  
  //  useEffect(() => {
  //   // Fallback: try restoring session from localStorage manually
  //   const restoreSession = async () => {
  //     // Supabase stores the session under a key like this:
  //     const key = Object.keys(localStorage).find((k) =>
  //       k.startsWith("sb-") && k.endsWith("-auth-token")
  //     );
  
  //     if (key) {
  //       try {
  //         const sessionRaw = localStorage.getItem(key);
  //         if (sessionRaw) {
  //           const session = JSON.parse(sessionRaw);
  //           if (session?.access_token && session?.user) {
  //             setUser({ ...session.user.user_metadata, id: session.user.id });
  //             setToken(session.access_token);
  //           }
  //         }
  //       } catch (err) {
  //         console.error("Failed to restore session:", err);
  //       }
  //     }
  
  //     setLoading(false);
  //   };
  
  //   restoreSession();
  
  // }, []);




  // // // Fetch cart items when user is set
  // useEffect(() => {
  //   const updateUserData = async () => {
  //     if (user && user.id) {
  //       if (!memoizedProcessed) {
  //         await handleUserInSupabase(user);
  //       }
  //       await fetchCartItems(user.id);
  //     }
  //   };

  //   updateUserData();
  // }, [user, handleUserInSupabase, memoizedProcessed]);

  const logout = () => {
    localStorage.clear();
    setUser(null);
    setToken(null);
    setCart([]);
    navigate("/login"); // ✅ redirect to login page
  };

  // Fetch cart items with loading state
  const fetchCartItems = useMemo(
    () => async (userId) => {
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
    },
    []
  );

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
      const { error: insertError } = await supabase.from("cart").insert([
        {
          product_id: product.id,
          user_id: memoizedUser.id,
          amount: product.amount,
          quantity: product.qty ? product.qty : 1,
        },
      ]);

      if (insertError) {
        console.error("Error inserting cart item:", insertError.message);
      }
    } else {
      const { error: updateError } = await supabase
        .from("cart")
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
        await supabase
          .from("cart")
          .update({ quantity: newQty })
          .eq("id", existingItem.id);
      } else {
        await supabase.from("cart").delete().eq("id", existingItem.id);
      }

      await fetchCartItems(memoizedUser.id);
    }else{
      
      await supabase.from("cart").delete().eq("id", existingItem.id);

      await fetchCartItems(memoizedUser.id);

    }

  };

  const removeFromCartAfterOrder = async () => {
    if (!memoizedUser) return;

    await supabase.from("cart").delete().eq("user_id", memoizedUser.id);

    await fetchCartItems(memoizedUser.id);
  };

  const insertReviewWithAttachments = async ({
    productId,
    rating,
    reviewText,
    files,
  }) => {
    try {
      // 1. Insert the review
      const { data: review, error: reviewError } = await supabase
        .from("reviews")
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
          .from("attachments")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Get public URL from Supabase
        const { data: publicUrlData } = supabase.storage
          .from("attachments")
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
          .from("review_attachments")
          .insert(attachments);

        if (attachInsertError) throw attachInsertError;
      }

      return true;
    } catch (error) {
      console.error("Error inserting review with attachments:", error.message);
      throw error;
    }
  };

const placeOrder = async (data, stripe) => {
  if (!memoizedUser || cart.length === 0) return;
  
  console.log('max');
  
  try {
    const today = new Date();
    const getRandomDays = (min, max) =>
      Math.floor(Math.random() * (max - min + 1)) + min;

    const daysToAdd =
      data.shippingMethod === "free" ? getRandomDays(7, 23) : getRandomDays(1, 3);

    const deliveryDate = new Date(today);
    deliveryDate.setDate(today.getDate() + daysToAdd);

    const generateTrackingCode = () => {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      return `ORD-${Array.from({ length: 6 }, () =>
        chars[Math.floor(Math.random() * chars.length)]
      ).join("")}`;
    };

    let trackingCode, isUnique = false;
    while (!isUnique) {
      trackingCode = generateTrackingCode();
      const { data: existing } = await supabase
        .from("orders")
        .select("id")
        .eq("tracking_number", trackingCode)
        .limit(1);
      isUnique = !existing || existing.length === 0;
    }

    // Create the order
    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .insert([
        {
          user_id: memoizedUser.id,
          status: data.payment_status === "success" ? "Confirmed" : "Pending",
          created_at: new Date(),
          total_amount: data.amount,
          shipping_address: data.address,
          payment_status: data.payment_status,
          order_date: deliveryDate.toISOString(),
          tracking_number: trackingCode,
          shipping_method: data.shippingMethod === "free" ? 0 : 1,
        },
      ])
      .select()
      .single();

    if (orderError) throw orderError;

    const orderId = orderData.id;

    // Prepare order items
    const orderItems = cart.map((item) => ({
      order_id: orderId,
      product_id: item.product_id,
      quantity: item.quantity,
      price_each: item.amount,
    }));

    // Run async inserts in parallel
    await Promise.all([
      supabase.from("order_items").insert(orderItems),

      supabase.from("orderpayments_logs").insert([
        {
          order_id: orderId,
          stripe_payment_id: stripe.transactionId,
          charge_id: stripe.chargeId,
          status: stripe.message,
          amount: data.amount,
          currency: "USD",
          response_data: stripe,
        },
      ]),

      supabase.from("notifications").insert([
        {
          user_id: memoizedUser.id,
          order_id: orderId,
          message: `✨Your order <a href="/orders/${orderId}" target="_blank" rel="noopener noreferrer" style="color:#0d6efd; text-decoration:underline;">#${orderId}</a> has been placed successfully. Thank you for shopping with us!`,
          read: false,
          type: 0,
        },
      ]),

      sendNotification({
        channel: `user-${memoizedUser?.id}`,
        event: "order-placed",
        message: {
          orderId,
          message: `Your order <a href="/orders/${orderId}" target="_blank" rel="noopener noreferrer" style="color:#0d6efd; text-decoration:underline;">#${orderId}</a> has been placed successfully. Thank you for shopping with us`,
          type: 0,
        },
      }),

      sendOrderEmail(
        user.full_name || user.name,
        data.email,
        cart,
        data.address,
        data.amount,
        orderId,
        deliveryDate.toISOString()
      ),

      removeFromCartAfterOrder(),
    ]);

    console.log("Order placed successfully with tracking:", trackingCode);
    return orderId;
  } catch (error) {
    console.error("Error placing order:", error.message);
    throw error;
  }
};


 const getNotificationsByUserId = async (start, end) => {
  if (!memoizedUser?.id) return [];

  try {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", memoizedUser?.id)
      .order("id", { ascending: false })
      .range(start, end); // Only fetch the required slice

    if (error) {
      console.error("Failed to fetch notifications:", error.message);
      return [];
    }

    return data;
  } catch (err) {
    console.error("Unexpected error fetching notifications:", err);
    return [];
  }
};


  // Inside AppContextProvider or export separately
  const fetchUserOrders = async () => {
    if (!memoizedUser) return [];

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(
          `
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
        `
        )
        .eq("user_id", memoizedUser.id)
        .neq("status", "Cancelled")
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
        .select(
          `
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
        `
        )
        .eq("user_id", memoizedUser.id)
        .eq("status", "Cancelled")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching orders:", error.message);
        return [];
      }

      // 🔽 Replace logs array with only the latest (max id)
      const processedData = data.map((order) => {
        const logs = order.orderpayments_logs || [];
        const latestLog = logs.sort((a, b) => b.id - a.id)[0] || null;
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
        .select(
          `
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
        `
        )
        .eq("id", orderId)
        .single();

      if (orderError) {
        throw orderError;
      }

      //   const latestLog =
      //   data.orderpayments_logs?.sort((a, b) => b.id - a.id)[0] || null;

      // // Replace full logs array with the latest one only
      // const processedData = {
      //   ...data,
      //   orderpayments_logs: latestLog,
      // };

      // console.log(data);

      return data;
    } catch (error) {
      console.error("Error fetching order details:", error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateOrder = async (
    orderId,
    result,
    amount,
    reason = "Change my mind"
  ) => {
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

    if (result?.refundId) {
      // Update the order status
      const { error: updateError } = await supabase
        .from("orders")
        .update({
          status: "Cancelled",
          Reason: reason,
          order_cancelled: new Date(),
        })
        .eq("id", orderId);

      if (updateError) {
        console.error("Failed to update order status:", updateError);
        throw updateError;
      }
    }
  };

  const sendAllDeliveryEmails = async () => {
    setLoading(true);
    try {
      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
      const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();

      const { data: orders, error } = await supabase
        .from("orders")
        .select(
          `
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
          )
          `
        )
        .gte("order_date", startOfDay)
        .lt("order_date", endOfDay);

      if (error) throw error;

      const userIds = [...new Set(orders.map((o) => o.user_id))];

      const { data: users, error: userError } = await supabase
        .from("users")
        .select(`id, name, email`)
        .in("id", userIds);

      if (userError) throw userError;

      const usersMap = Object.fromEntries(users.map((u) => [u.id, u]));

      const sendTasks = orders
        .filter((order) => usersMap[order.user_id])
        .map(async (order) => {
          const user = usersMap[order.user_id];
          const address = JSON.parse(order.shipping_address || "{}");

          const payload = {
            userName: user.name,
            userEmail: user.email,
            orderItems: order.order_items.map((item) => ({
              name: item.products?.name || "Unnamed",
              quantity: item.quantity,
              amount: item.price_each,
              image: item.products?.banner_url,
            })),
            address: {
              line1: address.addressLine1 || "",
              line2: address.addressLine2 || "",
              state: address.state || "",
              country: address.country || "",
              zip: address.zipCode || "",
            },
            cartTotal: order.total_amount,
            orderId: order.id,
            orderDate: order.order_date,
          };

          await sendDeliveryEmail(payload);
        });

      await Promise.all(sendTasks);

      console.log("All emails sent.");

    } catch (error) {
      console.error("Error sending delivery emails:", error.message);
    } finally {
      setLoading(false);
    }
  };

    const bestSellingProduct = async () => {
      const { data, error } = await supabase
        .from("best_selling_product")
        .select(`*, products:product_id (
          *
        )`);

      if (error) {
        console.error("Failed to fetch best selling products:", error.message);
        throw error;
      }

      return data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        logout,
        addToCart,
        removeFromCart,
        cart,
        setUser,
        removeFromCartAfterOrder,
        setToken,
        access_token,
        loading,
        setLoading,
        placeOrder,
        fetchUserOrders,
        getOrderDetails,
        updateOrder,
        fetchUserCancelledOrders,
        sendAllDeliveryEmails,
        bestSellingProduct,
        getNotificationsByUserId,
        fetchCartItems,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
