import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Influencer, ChallengeRecord } from '@/types/dashboard';

// Cast to any to work around the generated types not having these tables yet
const db = supabase as any;

export function useInfluencers() {
  const query = useQuery({
    queryKey: ['influencers'],
    queryFn: async () => {
      const { data, error } = await db
        .from('influencers')
        .select('*')
        .order('name');
      if (error) throw error;
      return (data ?? []) as Influencer[];
    },
  });
  return {
    influencers: (query.data ?? []) as Influencer[],
    loading: query.isLoading,
    refetch: query.refetch,
  };
}

export function useChallenges() {
  const query = useQuery({
    queryKey: ['challenges'],
    queryFn: async () => {
      const { data, error } = await db
        .from('challenges')
        .select('*, influencer:influencers(*)')
        .order('drop_date', { ascending: false });
      if (error) throw error;

      const today = new Date().toISOString().split('T')[0];
      const records = (data ?? []) as ChallengeRecord[];
      const toExpire = records.filter(
        (c) => c.status === 'active' && c.expiry_date < today
      );

      if (toExpire.length > 0) {
        await db
          .from('challenges')
          .update({ status: 'expired' })
          .in('id', toExpire.map((c) => c.id));

        const { data: fresh } = await db
          .from('challenges')
          .select('*, influencer:influencers(*)')
          .order('drop_date', { ascending: false });
        return (fresh ?? []) as ChallengeRecord[];
      }

      return records;
    },
  });
  return {
    challenges: (query.data ?? []) as ChallengeRecord[],
    loading: query.isLoading,
    refetch: query.refetch,
  };
}

export function useCreateInfluencer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<Influencer, 'id' | 'created_at'>) => {
      const { data: result, error } = await db
        .from('influencers')
        .insert(data)
        .select()
        .single();
      if (error) throw error;
      return result as Influencer;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['influencers'] });
    },
  });
}

export function useCreateChallenge() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<ChallengeRecord, 'id' | 'created_at' | 'influencer'>) => {
      const { data: result, error } = await db
        .from('challenges')
        .insert(data)
        .select()
        .single();
      if (error) throw error;
      return result as ChallengeRecord;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
    },
  });
}

export function useUpdateChallengeStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: ChallengeRecord['status'] }) => {
      const { error } = await db
        .from('challenges')
        .update({ status })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
    },
  });
}
