import { supabase } from '../lib/supabase';
import { queryClient } from '../lib/db';
import { useOutboxStore } from '../store/outboxStore';

const generateUUID = () => crypto.randomUUID();

export const animalService = {
  saveAnimal: async (data: any) => {
    const isNew = !data.id;
    const payload = {
      ...data,
      id: data.id || generateUUID(),
      updated_at: new Date().toISOString(),
    };

    if (isNew) payload.created_at = new Date().toISOString();

    // 1. Optimistic UI Update (Inject into RAM)
    queryClient.setQueryData(['animals'], (old: any[] | undefined) => {
      if (!old) return [payload];
      return isNew ? [...old, payload] : old.map(a => a.id === payload.id ? payload : a);
    });

    // 2. The Cloud Strike
    try {
      const { error } = await supabase.from('animals').upsert(payload);
      if (error) throw error;
      console.log('Successfully saved to Supabase');
    } catch (error) {
      console.warn('Network offline or Supabase unreachable. Failing over to local Outbox.', error);
      
      // 3. Fallback to Local Hard Drive Outbox
      useOutboxStore.getState().addMutation({
        id: generateUUID(),
        table: 'animals',
        action: 'upsert',
        payload
      });
    }
  }
};
