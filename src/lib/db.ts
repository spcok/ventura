import { createCollection } from '@tanstack/react-db';
import { electricCollectionOptions } from '@tanstack/electric-db-collection';
import { QueryClient } from '@tanstack/react-query';

// 1. Initialize the central Query engine that TanStack DB uses
export const queryClient = new QueryClient();

// Base URL for the Electric sync engine shapes (configured for local tunnel/docker)
const BASE_SHAPE_URL = 'http://localhost:3000/v1/shape';

// 2. Define all Collections mapped directly to the Supabase schema
// Note: We explicitly use 'public.table_name' so Electric can find the schema

export const animalsCollection = createCollection(
  electricCollectionOptions({
    id: 'animals',
    getKey: (row: any) => row.id,
    shapeOptions: { url: `${BASE_SHAPE_URL}/public.animals` }
  })
);

export const clinicalAttachmentsCollection = createCollection(
  electricCollectionOptions({
    id: 'clinical_attachments',
    getKey: (row: any) => row.id,
    shapeOptions: { url: `${BASE_SHAPE_URL}/public.clinical_attachments` }
  })
);

export const clinicalRecordsCollection = createCollection(
  electricCollectionOptions({
    id: 'clinical_records',
    getKey: (row: any) => row.id,
    shapeOptions: { url: `${BASE_SHAPE_URL}/public.clinical_records` }
  })
);

export const clinicalScheduleCollection = createCollection(
  electricCollectionOptions({
    id: 'clinical_schedule',
    getKey: (row: any) => row.id,
    shapeOptions: { url: `${BASE_SHAPE_URL}/public.clinical_schedule` }
  })
);

export const dailyLogsCollection = createCollection(
  electricCollectionOptions({
    id: 'daily_logs',
    getKey: (row: any) => row.id,
    shapeOptions: { url: `${BASE_SHAPE_URL}/public.daily_logs` }
  })
);

export const dailyRoundsCollection = createCollection(
  electricCollectionOptions({
    id: 'daily_rounds',
    getKey: (row: any) => row.id,
    shapeOptions: { url: `${BASE_SHAPE_URL}/public.daily_rounds` }
  })
);

export const feedingSchedulesCollection = createCollection(
  electricCollectionOptions({
    id: 'feeding_schedules',
    getKey: (row: any) => row.id,
    shapeOptions: { url: `${BASE_SHAPE_URL}/public.feeding_schedules` }
  })
);

export const fireDrillLogsCollection = createCollection(
  electricCollectionOptions({
    id: 'fire_drill_logs',
    getKey: (row: any) => row.id,
    shapeOptions: { url: `${BASE_SHAPE_URL}/public.fire_drill_logs` }
  })
);

export const incidentsCollection = createCollection(
  electricCollectionOptions({
    id: 'incidents',
    getKey: (row: any) => row.id,
    shapeOptions: { url: `${BASE_SHAPE_URL}/public.incidents` }
  })
);

export const isolationLogsCollection = createCollection(
  electricCollectionOptions({
    id: 'isolation_logs',
    getKey: (row: any) => row.id,
    shapeOptions: { url: `${BASE_SHAPE_URL}/public.isolation_logs` }
  })
);

export const maintenanceTicketsCollection = createCollection(
  electricCollectionOptions({
    id: 'maintenance_tickets',
    getKey: (row: any) => row.id,
    shapeOptions: { url: `${BASE_SHAPE_URL}/public.maintenance_tickets` }
  })
);

export const medicationLogsCollection = createCollection(
  electricCollectionOptions({
    id: 'medication_logs',
    getKey: (row: any) => row.id,
    shapeOptions: { url: `${BASE_SHAPE_URL}/public.medication_logs` }
  })
);

export const operationalListsCollection = createCollection(
  electricCollectionOptions({
    id: 'operational_lists',
    getKey: (row: any) => row.id,
    shapeOptions: { url: `${BASE_SHAPE_URL}/public.operational_lists` }
  })
);

export const rolePermissionsCollection = createCollection(
  electricCollectionOptions({
    id: 'role_permissions',
    getKey: (row: any) => row.id,
    shapeOptions: { url: `${BASE_SHAPE_URL}/public.role_permissions` }
  })
);

export const safetyIncidentsCollection = createCollection(
  electricCollectionOptions({
    id: 'safety_incidents',
    getKey: (row: any) => row.id,
    shapeOptions: { url: `${BASE_SHAPE_URL}/public.safety_incidents` }
  })
);

export const tasksCollection = createCollection(
  electricCollectionOptions({
    id: 'tasks',
    getKey: (row: any) => row.id,
    shapeOptions: { url: `${BASE_SHAPE_URL}/public.tasks` }
  })
);

export const timesheetsCollection = createCollection(
  electricCollectionOptions({
    id: 'timesheets',
    getKey: (row: any) => row.id,
    shapeOptions: { url: `${BASE_SHAPE_URL}/public.timesheets` }
  })
);

export const usersCollection = createCollection(
  electricCollectionOptions({
    id: 'users',
    getKey: (row: any) => row.id,
    shapeOptions: { url: `${BASE_SHAPE_URL}/public.users` }
  })
);