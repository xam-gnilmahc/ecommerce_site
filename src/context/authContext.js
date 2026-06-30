import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supaBaseClient';
import recalcUserInterest from '../service/recalcUserInterest';
import populateUserRecommendations from '../service/populateUserRecommendations';
import { sendOrderEmail, sendDeliveryEmail, sendNotification } from '../service/emailService';
import { useNavigate } from 'react-router-dom';
import Pusher from 'pusher-js';
import { useVisitorCookie } from '../Hook/useVisitorCookie'; // ← added

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
  const [access_token, setToken] = useState(null);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);
  const [processed, setProcessed] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  // ── Visitor cookie — pass user.id, hook does the rest ──────────────────────
  const { visitor, trackProduct, clearVisitor } = useVisitorCookie(user?.id);
  // visitor      → full cookie object { visitor_id, visit_count, pages_visited, product_ids, ... }
  // trackProduct → call on any product click: trackProduct(product.id)
  // clearVisitor → wipe cookie on logout

  const pusher = new Pusher('8a749302cc2bbbaf87b5', {
    cluster: 'ap1',
    encrypted: true,
  });

  useEffect(() => {
    if (!user?.id) return;
    const channel = pusher.subscribe(`user.${user.id}`);
    console.log(`🔔 Pusher initialized for user: ${user.id}`);
    return () => {
      pusher.unsubscribe(`user-${user.id}`);
      console.log(`🧹 Pusher unsubscribed for user: ${user.id}`);
    };
  }, [user?.id]);

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

  // check for an existing session on mount (handles page refresh),
  // then keep listening for future auth changes (login/logout/token refresh).
  // The empty dependency array means this effect runs ONCE on mount only —
  // it does NOT re-run on navigation, menu clicks, or other re-renders.
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

  const logout = () => {
    localStorage.clear();
    //clearVisitor(); // ← wipe the tracking cookie on logout
    setUser(null);
    setToken(null);
    setCart([]);
    navigate('/login');
  };

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

  // Cart mutations are handled by the redux slice (userCart).
  // The repository uses the redux async thunks for add/remove/fetch operations
  // (see src/redux/slice/userCart.ts). Keeping fetchCartItems internally for
  // the provider to refresh state when needed, but direct add/remove helpers
  // are implemented in redux — so we avoid exposing duplicate functions here.

  const removeFromCartAfterOrder = async () => {
    if (!user) return;
    await supabase.from('cart').delete().eq('user_id', user.id);
    await fetchCartItems(user.id);
  };

  const generateTrackingCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return `ORD-${Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')}`;
  };

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
            message: `✨Your order <a href="/orders/${orderId}" target="_blank" rel="noopener noreferrer" style="color:#0d6efd; text-decoration:underline;">#${orderId}</a> has been placed successfully. Thank you for shopping with us!`,
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
            message: `Your order <a href="/orders/${orderId}" target="_blank" rel="noopener noreferrer" style="color:#0d6efd; text-decoration:underline;">#${orderId}</a> has been placed successfully. Thank you for shopping with us`,
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

  const sendAllDeliveryEmails = async () => {
    setLoading(true);
    try {
      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
      const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();
      const { data: orders, error } = await supabase
        .from('orders')
        .select(
          `*, order_items (*, products:product_id (id, name, banner_url, amount, description))`
        )
        .gte('order_date', startOfDay)
        .lt('order_date', endOfDay);
      if (error) throw error;
      const userIds = [...new Set(orders.map((o) => o.user_id))];
      const { data: users, error: userError } = await supabase
        .from('users')
        .select(`id, name, email`)
        .in('id', userIds);
      if (userError) throw userError;
      const usersMap = Object.fromEntries(users.map((u) => [u.id, u]));
      await Promise.all(
        orders
          .filter((order) => usersMap[order.user_id])
          .map(async (order) => {
            const user = usersMap[order.user_id];
            const address = JSON.parse(order.shipping_address || '{}');
            await sendDeliveryEmail({
              userName: user.name,
              userEmail: user.email,
              orderItems: order.order_items.map((item) => ({
                name: item.products?.name || 'Unnamed',
                quantity: item.quantity,
                amount: item.price_each,
                image: item.products?.banner_url,
              })),
              address: `${address.addressLine1 || ''} ${address.addressLine2 || ''}, ${address.state || ''}, ${address.country || ''} - ${address.zipCode || ''}`,
              cartTotal: order.total_amount,
              orderId: order.id,
              orderDate: order.order_date,
            });
          })
      );
      console.log('All emails sent.');
    } catch (error) {
      console.error('Error sending delivery emails:', error.message);
    } finally {
      setLoading(false);
    }
  };

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
        sendAllDeliveryEmails,
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
