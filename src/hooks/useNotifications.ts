import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supaBaseClient';

const PAGE_SIZE = 10;

export interface Notification {
  id: number;
  user_id: string;
  order_id: number;
  message: string;
  type: number;
  read: boolean;
  is_read: boolean;
  created_at: string;
}

interface NotificationsPage {
  data: Notification[];
  nextPage: number | null;
}

const fetchNotifications = async ({
  userId,
  pageParam = 0,
}: {
  userId: string;
  pageParam?: number;
}): Promise<NotificationsPage> => {
  if (!userId) return { data: [], nextPage: null };

  const start = pageParam * PAGE_SIZE;
  const end = start + PAGE_SIZE - 1;

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('id', { ascending: false })
    .range(start, end);

  if (error) throw new Error(error.message);

  return {
    data,
    nextPage: data.length === PAGE_SIZE ? pageParam + 1 : null,
  };
};

export const useNotifications = (userId: string | undefined, enabled: boolean = true) => {
  return useInfiniteQuery<NotificationsPage, Error, { pages: NotificationsPage[]; pageParams: number[] }, ['notifications', string], number>({
    queryKey: ['notifications', userId ?? ''],
    queryFn: ({ pageParam }) => fetchNotifications({ userId: userId!, pageParam }),
    getNextPageParam: (lastPage) => lastPage.nextPage ?? undefined,
    initialPageParam: 0,
    enabled: enabled && !!userId,
    staleTime: 30 * 1000,
  });
};

const fetchUnreadCount = async (userId: string): Promise<number> => {
  if (!userId) return 0;

  const { count, error } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_read', false);

  if (error) throw new Error(error.message);
  return count || 0;
};

export const useUnreadNotificationCount = (userId: string | undefined, enabled: boolean = true) => {
  return useQuery<number, Error>({
    queryKey: ['unreadNotificationCount', userId],
    queryFn: () => fetchUnreadCount(userId!),
    enabled: enabled && !!userId,
    staleTime: 30 * 1000,
    refetchInterval: 30 * 1000,
  });
};

export const useMarkNotificationsAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) throw new Error(error.message);
    },
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: ['notifications', userId] });
      queryClient.invalidateQueries({ queryKey: ['unreadNotificationCount', userId] });
    },
  });
};
