import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supaBaseClient';
import toast from 'react-hot-toast';

export interface Raffle {
  id: number;
  title: string;
  description: string;
  prize_type: string;
  prize_description: string;
  image_url: string | null;
  start_date: string;
  end_date: string;
  total_entries: number;
  max_entries: number;
  winner_id: string | null;
}

interface RaffleEntry {
  raffle_id: number;
  ticket_number: string;
}

interface RafflesData {
  raffles: Raffle[];
  enteredMap: Record<number, string>;
}

const fetchRaffles = async (): Promise<Raffle[]> => {
  const { data, error } = await supabase.from('raffles').select('*').order('start_date', {
    ascending: true,
  });

  if (error) throw new Error(error.message);
  return data ?? [];
};

const fetchUserRaffleEntries = async (userId: string): Promise<RaffleEntry[]> => {
  if (!userId) return [];

  const { data, error } = await supabase
    .from('raffle_entries')
    .select('*')
    .eq('user_id', userId);

  if (error) throw new Error(error.message);
  return data ?? [];
};

export const useRaffles = (userId: string | null | undefined) => {
  return useQuery<RafflesData, Error>({
    queryKey: ['raffles', userId],
    queryFn: async () => {
      const [raffles, entries] = await Promise.all([
        fetchRaffles(),
        userId ? fetchUserRaffleEntries(userId) : Promise.resolve([]),
      ]);

      const enteredMap: Record<number, string> = {};
      entries.forEach((entry) => {
        enteredMap[entry.raffle_id] = entry.ticket_number;
      });

      return { raffles, enteredMap };
    },
    staleTime: 2 * 60 * 1000,
  });
};

interface EnterRaffleParams {
  raffleId: number;
  userId: string;
}

export const useEnterRaffle = () => {
  const queryClient = useQueryClient();

  return useMutation<unknown, Error, EnterRaffleParams>({
    mutationFn: async ({ raffleId, userId }) => {
      const { data, error } = await supabase
        .from('raffle_entries')
        .insert([{ raffle_id: raffleId, user_id: userId }]);

      if (error) throw new Error(error.message);

      await supabase.rpc('increment_raffle_entries', { raffle_id: raffleId });

      return data;
    },
    onSuccess: (_, { userId }) => {
      toast.success('Successfully entered raffle!');
      queryClient.invalidateQueries({ queryKey: ['raffles', userId] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to enter raffle');
    },
  });
};
