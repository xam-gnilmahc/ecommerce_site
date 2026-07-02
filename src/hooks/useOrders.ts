import { useQuery } from '@tanstack/react-query';
import { supabase } from '../supaBaseClient';

interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  price_each: number;
  products: {
    id: number;
    name: string;
    banner_url: string;
    amount: string;
    description: string;
  };
}

interface OrderPaymentLog {
  id: number;
  order_id: number;
  payment_method: number;
  amount: number;
  status: string;
}

export interface Order {
  id: number;
  user_id: string;
  tracking_number: string;
  status: string;
  total_amount: number;
  shipping_address: string;
  delivery_date: string | null;
  estimated_date: string | null;
  created_at: string;
  order_items: OrderItem[];
  orderpayments_logs?: OrderPaymentLog[];
}

const fetchUserOrders = async (userId: string): Promise<Order[]> => {
  if (!userId) return [];

  const { data, error } = await supabase
    .from('orders')
    .select(`*, order_items (*, products:product_id (id, name, banner_url, amount, description))`)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data;
};

export const useUserOrders = (userId: string | undefined, enabled: boolean = true) => {
  return useQuery<Order[], Error>({
    queryKey: ['orders', userId],
    queryFn: () => fetchUserOrders(userId!),
    enabled: enabled && !!userId,
    staleTime: 2 * 60 * 1000,
  });
};

const fetchUserCancelledOrders = async (userId: string): Promise<Order[]> => {
  if (!userId) return [];

  const { data, error } = await supabase
    .from('orders')
    .select(
      `*, order_items (*, products:product_id (id, name, banner_url, amount, description)), orderpayments_logs (*)`
    )
    .eq('user_id', userId)
    .eq('status', 'Cancelled')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);

  return data.map((order: Order) => {
    const logs = order.orderpayments_logs || [];
    const latestLog = logs.sort((a, b) => b.id - a.id)[0] || null;
    return { ...order, orderpayments_logs: latestLog ? [latestLog] : null };
  });
};

export const useUserCancelledOrders = (userId: string | undefined, enabled: boolean = true) => {
  return useQuery<Order[], Error>({
    queryKey: ['cancelledOrders', userId],
    queryFn: () => fetchUserCancelledOrders(userId!),
    enabled: enabled && !!userId,
    staleTime: 2 * 60 * 1000,
  });
};
