import { supabase } from '../lib/supabase';
import { queryClient } from '../lib/db';
import { useOutboxStore } from '../store/outboxStore';

const generateUUID = () => crypto.randomUUID();

export const animalService = {
  saveAnimal: async (data: any) => {
    // 1. Sanitize Payload: Convert empty strings to null
    const sanitizedData = Object.fromEntries(
      Object.entries(data).map(([key, value]) => [
        key,
        value === '' ? null : value
      ])
    );

    const isNew = !sanitizedData.id;
    
    // 2. Iron-Clad Schema Enforcement (Guarantee NO NULL values hit Postgres for strict columns)
    const payload = {
      ...sanitizedData,
      id: sanitizedData.id || generateUUID(),
      display_order: sanitizedData.display_order ?? 999, // Background integer
      census_count: sanitizedData.census_count ?? 1,
      entity_type: sanitizedData.entity_type || 'individual',
      weight_unit: sanitizedData.weight_unit || 'g',
      red_list_status: sanitizedData.red_list_status || 'NE',
      is_venomous: !!sanitizedData.is_venomous,
      is_dob_unknown: !!sanitizedData.is_dob_unknown,
      has_no_id: !!sanitizedData.has_no_id,
      ambient_temp_only: !!sanitizedData.ambient_temp_only,
      lineage_unknown: !!sanitizedData.lineage_unknown,
      is_boarding: !!sanitizedData.is_boarding,
      is_quarantine: !!sanitizedData.is_quarantine,
      archived: !!sanitizedData.archived,
      is_deleted: false,
      updated_at: new Date().toISOString(),
    };

    if (isNew) payload.created_at = new Date().toISOString();

    // 3. Optimistic UI Update (Inject into RAM)
    queryClient.setQueryData(['animals'], (old: any[] | undefined) => {
      if (!old) return [payload];
      return isNew ? [...old, payload] : old.map(a => a.id === payload.id ? payload : a);
    });

    // 4. The Cloud Strike
    try {
      const { error } = await supabase.from('animals').upsert(payload);
      if (error) {
        console.error('Supabase Upsert Error:', error.message);
        throw error;
      }
      console.log('Successfully saved to Supabase');
    } catch (error) {
      console.warn('Network offline or Postgres rejection. Failing over to local Outbox.', error);
      useOutboxStore.getState().addMutation({
        id: generateUUID(),
        table: 'animals',
        action: 'upsert',
        payload
      });
    }
  }
};
