import { useQuery } from '@tanstack/react-query';
import { supabase } from '../supaBaseClient';
import { Order } from './useOrders';

const fetchOrderDetails = async (orderId: number | string): Promise<Order> => {
  if (!orderId) throw new Error('Order ID is required');

  const { data, error } = await supabase
    .from('orders')
    .select(
      `*, order_items (*, products:product_id (id, name, banner_url, amount, description)), orderpayments_logs(*)`
    )
    .eq('id', orderId)
    .single();

  if (error) throw new Error(error.message);
  return data;
};

export const useOrderDetails = (orderId: number | string | undefined, enabled: boolean = true) => {
  return useQuery<Order, Error>({
    queryKey: ['orderDetails', orderId],
    queryFn: () => fetchOrderDetails(orderId!),
    enabled: enabled && !!orderId,
    staleTime: 2 * 60 * 1000,
  });
};
