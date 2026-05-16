import { useEffect } from 'react';
import { useShape } from '@electric-sql/react';
import { useQueryClient } from '@tanstack/react-query';

const ELECTRIC_URL = import.meta.env.VITE_ELECTRIC_URL || 'http://localhost:3000';

export function SyncEngine() {
  const queryClient = useQueryClient();

  // 1. Subscribe to the Electric HTTP Shapes
  const { data: animals } = useShape({
    url: `${ELECTRIC_URL}/v1/shape/animals`,
  });
  
  const { data: tasks } = useShape({
    url: `${ELECTRIC_URL}/v1/shape/tasks`,
  });

  // 2. Hydrate the TanStack Query Cache silently in the background
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

  // This is a headless engine; it renders nothing.
  return null;
}
