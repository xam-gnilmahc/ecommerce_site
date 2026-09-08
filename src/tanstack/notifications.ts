import { useQuery } from '@tanstack/react-query';
import { supabase } from '../supaBaseClient';

export const fetchNotifications = async (userId: string, start: number, end: number) => {
  if (!userId) return [];
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('id', { ascending: false })
    .range(start, end);
  if (error) throw error;
  return data;
};

export const useUserNotifications = (
  userId: string | undefined,
  range: [number, number] = [0, 9]
) => {
  return useQuery({
    queryKey: ['notifications', userId, range],
    queryFn: () => fetchNotifications(userId!, range[0], range[1]),
    enabled: !!userId,
  });
};
