import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supaBaseClient';
import recalcUserInterest from '../service/recalcUserInterest.ts';
import populateUserRecommendations from '../service/populateUserRecommendations.ts';
import { sendOrderEmail, sendDeliveryEmail, sendNotification } from '../service/emailService.ts';
import { useNavigate } from 'react-router-dom';
import Pusher from 'pusher-js';
import { PUSHER_APP_KEY, PUSHER_CLUSTER } from '../config/env';
import { useVisitorCookie } from '../Hook/useVisitorCookie.ts'; // ← added

const AuthContext = createContext();

/**
 * Custom hook to access the authentication context.
 * @returns The authentication context, providing user state and authentication-related functions.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

/**
 * AuthProvider component to provide authentication context to the application.
 * @param {*} param0 - The props object containing children elements.
 * @returns The AuthContext provider wrapping the children elements.
 */
export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [access_token, setToken] = useState(null);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);
  const [processed, setProcessed] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [addressChecked, setAddressChecked] = useState(false);

  // ── Visitor cookie — pass user.id, hook does the rest ──────────────────────
  const { visitor, trackProduct, clearVisitor } = useVisitorCookie(user?.id);

  /**
   * Pusher instance for real-time notifications.
   */
  const pusher = new Pusher(PUSHER_APP_KEY, {
    cluster: PUSHER_CLUSTER,
    encrypted: true,
  });

  /**
   * Subscribe to Pusher channels
   */
  useEffect(() => {
    if (!user?.id) return;
    const channel = pusher.subscribe(`user.${user.id}`);
    console.log(`Pusher initialized for user`);
    return () => {
      pusher.unsubscribe(`user-${user.id}`);
      console.log(`Pusher unsubscribed for user`);
    };
  }, [user?.id]);

  /**
   * Handle user data in Supabase so that we can store additional information and manage user records.
   */
  const handleUserInSupabase = async (authenticatedUser) => {
    try {
      setLoading(true);
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
      setProcessed(true);
    } catch (error) {
      console.error('Error handling user in Supabase:', error.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Check for existing session on mount and set up auth state change listener
   * provides real-time updates to user state when they log in or out.
   */
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
        setAuthLoading(false); //session check finished — safe to render protected content now
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

  /**
   * After login, check if user has a saved shipping address.
   * If not, redirect to /add-address.
   */
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

  /**
   * Recalculate user interest every 30 seconds to keep recommendations up-to-date.
   * This is a background process that runs as long as the user is logged in.
   */
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

  /**
   * Logout function clears local storage, resets user state, and navigates to the login page.
   */
  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setToken(null);
    setCart([]);
    setAddressChecked(false);
    navigate('/login');
  };

  /**
   * Fetch cart items for a specific user.
   * @param {*} userId
   * @returns
   */
  const fetchCartItems = async (userId) => {
    const { data, error } = await supabase
      .from('cart')
      .select(`*, products:product_id (id, name, banner_url, amount, description, rating)`)
      .eq('user_id', userId)
      .order('id', { ascending: true });
    if (!error) {
      setCart(data);
    } else {
      console.error('Fetch cart error:', error.message);
    }
    setLoading(false);
    return data;
  };

  /**
   * Remove items from the cart after an order is placed.
   * @returns {Promise<void>}
   */
  const removeFromCartAfterOrder = async () => {
    if (!user) return;
    await supabase.from('cart').delete().eq('user_id', user.id);
    await fetchCartItems(user.id);
  };

  /**
   * Generate a unique tracking code for an order.
   * @returns {string} The generated tracking code.
   */
  const generateTrackingCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return `ORD-${Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')}`;
  };

  /**
   * Create and finalize an order in the system.
   * @param {*} param0 - The order details.
   * @returns {Promise<void>}
   */
  const createAndFinalizeOrder = async ({
    data,
    orderItems,
    stripe,
    removeCart = false,
    orderType = 'cart',
    itemsCount = 0,
    carts = [],
    singleOrderProduct = null,
  }) => {
    try {
      const today = new Date();
      const getRandomDays = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
      const daysToAdd = data.shippingMethod === 'free' ? getRandomDays(7, 23) : getRandomDays(1, 3);
      const deliveryDate = new Date(today);
      deliveryDate.setDate(today.getDate() + daysToAdd);

      let trackingCode,
        isUnique = false;
      while (!isUnique) {
        trackingCode = generateTrackingCode();
        const { data: existing } = await supabase
          .from('orders')
          .select('id')
          .eq('tracking_number', trackingCode)
          .limit(1);
        isUnique = !existing || existing.length === 0;
      }

      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert([
          {
            user_id: user.id,
            status: data.payment_status === 'success' ? 'Confirmed' : 'Pending',
            created_at: new Date(),
            total_amount: data.amount,
            shipping_address: data.address,
            payment_status: data.payment_status,
            order_date: deliveryDate.toISOString(),
            tracking_number: trackingCode,
            shipping_method: data.shippingMethod === 'free' ? 0 : 1,
            order_type: orderType,
            items_count: itemsCount,
          },
        ])
        .select()
        .single();

      if (orderError) throw orderError;
      const orderId = orderData.id;
      const orderItemsToInsert = orderItems.map((it) => ({ ...it, order_id: orderId }));

      await Promise.all([
        supabase.from('order_items').insert(orderItemsToInsert),
        supabase.from('orderpayments_logs').insert([
          {
            order_id: orderId,
            stripe_payment_id: stripe.transactionId,
            charge_id: stripe.chargeId,
            status: stripe.message,
            amount: data.amount,
            currency: 'USD',
            response_data: stripe,
          },
        ]),
        supabase.from('notifications').insert([
          {
            user_id: user.id,
            order_id: orderId,
            message: `Your order has been placed! 🎉 Total: $${data.amount}. You'll receive a confirmation email shortly.`,
            read: false,
            type: 0,
          },
        ]),
        sendOrderEmail(
          user.full_name || user.name,
          data.email,
          carts,
          `${data.address.addressLine1 || ''} ${data.address.addressLine2 || ''}, ${data.address.state || ''}, ${data.address.country || ''} - ${data.address.zipCode || ''}`,
          data.amount,
          trackingCode,
          deliveryDate.toLocaleDateString(),
          singleOrderProduct
        ),
        sendNotification({
          channel: `user-${user?.id}`,
          event: 'order-placed',
          message: {
            orderId,
            message: `Your order has been placed! 🎉 Total: $${data.amount}. You'll receive a confirmation email shortly.`,
            type: 0,
          },
        }),
        ...(removeCart ? [removeFromCartAfterOrder()] : []),
      ]);

      console.log(`Order placed successfully (${orderType}) with tracking:`, trackingCode);
      return orderId;
    } catch (error) {
      throw error;
    }
  };

  /**
   * Places an order in the system.
   * @param {*} data - The order details.
   * @param {*} stripe - The Stripe payment information.
   * @returns {Promise<string>} The ID of the created order.
   */
  const placeOrder = async (data, stripe) => {
    setOrderLoading(true);
    const carts = await fetchCartItems(user.id);
    if (!user || carts.length === 0) return;
    try {
      const orderItems = carts.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
        price_each: item.amount,
      }));
      const itemsCount = carts.reduce((sum, it) => sum + (it.quantity || 0), 0);
      const orderId = await createAndFinalizeOrder({
        data,
        orderItems,
        stripe,
        removeCart: true,
        orderType: 'cart',
        itemsCount,
        carts,
      });
      return orderId;
    } catch (error) {
      console.error('Error placing order:', error.message);
      throw error;
    } finally {
      setOrderLoading(false);
    }
  };

  /**
   * Places an order in the system.
   * @param {*} data - The order details.
   * @param {*} stripe - The Stripe payment information.
   * @param {*} product - The product being ordered.
   * @param {*} quantity - The quantity of the product.
   * @returns {Promise<string>} The ID of the created order.
   */
  const placeOrderSingle = async (data, stripe, product, quantity = 1) => {
    setOrderLoading(true);
    if (!user || !product) return;
    try {
      const orderItems = [{ product_id: product.id, quantity, price_each: product.amount }];
      const orderId = await createAndFinalizeOrder({
        data,
        orderItems,
        stripe,
        removeCart: false,
        orderType: 'single',
        itemsCount: quantity,
        singleOrderProduct: product,
      });
      return orderId;
    } catch (error) {
      console.error('Error placing single product order:', error.message);
      throw error;
    } finally {
      setOrderLoading(false);
    }
  };

  /**
   * Fetch notifications for a user within a specific range.
   * @param {*} start - The start index for pagination.
   * @param {*} end - The end index for pagination.
   * @returns {Promise<Array>} The list of notifications.
   */
  const getNotificationsByUserId = async (start, end) => {
    if (!user?.id) return [];
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user?.id)
        .order('id', { ascending: false })
        .range(start, end);
      if (error) {
        console.error('Failed to fetch notifications:', error.message);
        return [];
      }
      return data;
    } catch (err) {
      console.error('Unexpected error fetching notifications:', err);
      return [];
    }
  };

  /**
   * Fetches the orders for the current user.
   * @returns {Promise<Array>} The list of user orders.
   */
  const fetchUserOrders = async () => {
    if (!user) return [];
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(
          `*, order_items (*, products:product_id (id, name, banner_url, amount, description))`
        )
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) {
        console.error('Error fetching orders:', error.message);
        return [];
      }
      return data;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetches the cancelled orders for the current user.
   * @returns {Promise<Array>} The list of cancelled orders for the current user.
   */
  const fetchUserCancelledOrders = async () => {
    if (!user) return [];
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(
          `*, order_items (*, products:product_id (id, name, banner_url, amount, description)), orderpayments_logs (*)`
        )
        .eq('user_id', user.id)
        .eq('status', 'Cancelled')
        .order('created_at', { ascending: false });
      if (error) {
        console.error('Error fetching orders:', error.message);
        return [];
      }
      return data.map((order) => {
        const logs = order.orderpayments_logs || [];
        const latestLog = logs.sort((a, b) => b.id - a.id)[0] || null;
        return { ...order, orderpayments_logs: latestLog ?? null };
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetches the details of a specific order.
   * @param {*} orderId - The ID of the order to fetch.
   * @returns {Promise<Object>} The details of the order.
   */
  const getOrderDetails = async (orderId) => {
    setOrderLoading(true);
    try {
      const { data, error: orderError } = await supabase
        .from('orders')
        .select(
          `*, order_items (*, products:product_id (id, name, banner_url, amount, description)), orderpayments_logs(*)`
        )
        .eq('id', orderId)
        .single();
      if (orderError) throw orderError;
      return data;
    } catch (error) {
      console.error('Error fetching order details:', error.message);
      throw error;
    } finally {
      setOrderLoading(false);
    }
  };

  /**
   * Fetches the best selling products.
   * @returns {Promise<Array>} The list of best selling products.
   */
  const bestSellingProduct = async () => {
    const { data, error } = await supabase
      .from('best_selling_product')
      .select(`*, products:product_id (*)`);
    if (error) {
      console.error('Failed to fetch best selling products:', error.message);
      throw error;
    }
    return data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        authLoading,
        logout,
        cart,
        setUser,
        removeFromCartAfterOrder,
        setToken,
        access_token,
        loading,
        setLoading,
        orderLoading,
        placeOrder,
        placeOrderSingle,
        fetchUserOrders,
        getOrderDetails,
        fetchUserCancelledOrders,
        bestSellingProduct,
        getNotificationsByUserId,
        fetchCartItems,
        visitor, // ← cookie data
        trackProduct, // ← call on product click
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
