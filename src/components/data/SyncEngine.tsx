import { useEffect } from 'react';
import { useShape } from '@electric-sql/react';
import { useQueryClient } from '@tanstack/react-query';

const ELECTRIC_URL = import.meta.env.VITE_ELECTRIC_URL || 'http://localhost:3000';

export function SyncEngine() {
  const queryClient = useQueryClient();

  // 1. Subscribe using the V2 Query Params format
  const { data: animals } = useShape({
    url: `${ELECTRIC_URL}/v1/shape`,
    params: { table: 'animals' }
  });
  
  const { data: tasks } = useShape({
    url: `${ELECTRIC_URL}/v1/shape`,
    params: { table: 'tasks' }
  });

  // 2. Hydrate the TanStack Query Cache silently
  useEffect(() => {
    if (animals) {
      queryClient.setQueryData(['animals'], animals);
    }
  }, [animals, queryClient]);

  useEffect(() => {
    if (tasks) {
      queryClient.setQueryData(['tasks'], tasks);
    }
  }, [tasks, queryClient]);

  return null;
}
