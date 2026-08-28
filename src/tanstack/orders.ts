import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supaBaseClient';
import { sendOrderEmail, sendNotification } from '../services/emailService.ts';
import toast from 'react-hot-toast';

function generateTrackingCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const time = Date.now().toString(36).toUpperCase();
  const rand = Array.from(
    { length: 4 },
    () => chars[Math.floor(Math.random() * chars.length)]
  ).join('');
  return `ORD-${time}-${rand}`;
}

async function createAndFinalizeOrder({
  userId,
  userName,
  userEmail,
  data,
  orderItems,
  stripe,
  removeCart = false,
  orderType = 'cart',
  itemsCount = 0,
  carts = [],
  singleOrderProduct = null,
}: {
  userId: string;
  userName: string;
  userEmail: string;
  data: any;
  orderItems: any[];
  stripe: any;
  removeCart?: boolean;
  orderType?: string;
  itemsCount?: number;
  carts?: any[];
  singleOrderProduct?: any;
}) {
  const today = new Date();
  const getRandomDays = (min: number, max: number) =>
    Math.floor(Math.random() * (max - min + 1)) + min;
  const daysToAdd = data.shippingMethod === 'free' ? getRandomDays(7, 23) : getRandomDays(1, 3);
  const deliveryDate = new Date(today);
  deliveryDate.setDate(today.getDate() + daysToAdd);

  const trackingCode = generateTrackingCode();

  const { data: orderData, error: orderError } = await supabase
    .from('orders')
    .insert([
      {
        user_id: userId,
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

  // ── Critical: wait for order items + payment log + local notification ──
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
        user_id: userId,
        order_id: orderId,
        message: `Thank you for your order! We've received your order and it's being processed. You'll get a shipping confirmation when your items are on the way.`,
        read: false,
        type: 0,
      },
    ]),
  ]);

  // ── Fire-and-forget: don't block user on these ──
  sendOrderEmail(
    userName,
    userEmail,
    carts,
    `${data.address.addressLine1 || ''} ${data.address.addressLine2 || ''}, ${data.address.state || ''}, ${data.address.country || ''} - ${data.address.zipCode || ''}`,
    data.amount,
    trackingCode,
    deliveryDate.toLocaleDateString(),
    singleOrderProduct
  ).catch(() => {});

  sendNotification({
    channel: `user-${userId}`,
    event: 'order-placed',
    message: {
      orderId,
      message: `Thank you for your order! We've received your order and it's being processed. You'll get a shipping confirmation when your items are on the way.`,
      type: 0,
    },
  }).catch(() => {});

  return orderId;
}

export const usePlaceOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      userId,
      userName,
      userEmail,
      data,
      stripe,
    }: {
      userId: string;
      userName: string;
      userEmail: string;
      data: any;
      stripe: any;
    }) => {
      const { data: carts, error: cartError } = await supabase
        .from('cart')
        .select(`*, products:product_id (id, name, banner_url, amount, description, rating)`)
        .eq('user_id', userId)
        .order('id', { ascending: true });

      if (cartError) throw cartError;
      if (!carts || carts.length === 0) throw new Error('Cart is empty');

      const orderItems = carts.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
        price_each: item.amount,
      }));
      const itemsCount = carts.reduce((sum, it) => sum + (it.quantity || 0), 0);

      const orderId = await createAndFinalizeOrder({
        userId,
        userName,
        userEmail,
        data,
        orderItems,
        stripe,
        removeCart: false,
        orderType: 'cart',
        itemsCount,
        carts,
      });

      return orderId;
    },
    onSuccess: async (_, { userId }) => {
      await supabase.from('cart').delete().eq('user_id', userId);
      queryClient.invalidateQueries({ queryKey: ['cart', userId] });
      queryClient.invalidateQueries({ queryKey: ['cart', 'total', userId] });
      queryClient.invalidateQueries({ queryKey: ['orders', userId] });
      toast.success('Payment successful!');
    },
  });
};

export const usePlaceOrderSingle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      userId,
      userName,
      userEmail,
      data,
      stripe,
      product,
      quantity = 1,
    }: {
      userId: string;
      userName: string;
      userEmail: string;
      data: any;
      stripe: any;
      product: any;
      quantity?: number;
    }) => {
      const orderItems = [{ product_id: product.id, quantity, price_each: product.amount }];

      const orderId = await createAndFinalizeOrder({
        userId,
        userName,
        userEmail,
        data,
        orderItems,
        stripe,
        removeCart: false,
        orderType: 'single',
        itemsCount: quantity,
        singleOrderProduct: product,
      });

      return orderId;
    },
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['orders', userId] });
      toast.success('Payment processed successfully!');
    },
  });
};

// ── Query hooks ────────────────────────────────────────────────────────────

export const useUserOrders = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['orders', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(
          `*, order_items (*, products:product_id (id, name, banner_url, amount, description))`
        )
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
};

export const useUserCancelledOrders = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['orders', 'cancelled', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(
          `*, order_items (*, products:product_id (id, name, banner_url, amount, description)), orderpayments_logs (*)`
        )
        .eq('user_id', userId)
        .eq('status', 'Cancelled')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data.map((order) => {
        const logs = order.orderpayments_logs || [];
        const latestLog = logs.sort((a, b) => b.id - a.id)[0] || null;
        return { ...order, orderpayments_logs: latestLog ?? null };
      });
    },
    enabled: !!userId,
  });
};

export const useOrderDetails = (orderId: string | undefined) => {
  return useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(
          `*, order_items (*, products:product_id (id, name, banner_url, amount, description)), orderpayments_logs(*)`
        )
        .eq('id', orderId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!orderId,
  });
};
