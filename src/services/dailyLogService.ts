import { supabase } from '../lib/supabase';
import { queryClient } from '../lib/db';
import { useOutboxStore } from '../store/outboxStore';

const generateUUID = () => crypto.randomUUID();

export const dailyLogService = {
  saveLog: async (data: any) => {
    const isNew = !data.id;
    const payload = {
      ...data,
      id: data.id || generateUUID(),
      updated_at: new Date().toISOString(),
      is_deleted: false,
    };

    if (isNew) payload.created_at = new Date().toISOString();

    // 1. Optimistic RAM Update (Instant UI)
    queryClient.setQueryData(['daily_logs'], (old: any[] | undefined) => {
      if (!old) return [payload];
      return isNew ? [...old, payload] : old.map(l => l.id === payload.id ? payload : l);
    });

    // 2. Cloud Strike
    try {
      const { error } = await supabase.from('daily_logs').upsert(payload);
      if (error) throw error;
      console.log('Successfully saved log to Supabase');
    } catch (error) {
      console.warn('Network offline. Routing log to local Outbox.', error);
      // 3. Fallback to Outbox
      useOutboxStore.getState().addMutation({
        id: generateUUID(),
        table: 'daily_logs',
        action: 'upsert',
        payload
      });
    }
  }
};
