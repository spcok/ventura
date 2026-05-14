import { createCollection } from '@tanstack/db';
import { electricCollectionOptions } from '@tanstack/electric-db-collection';

// 1. Initialize the global TanStack Database instance - Using createCollection instead as inferred instance creator
export const db = createCollection as any; // Temporary fix based on package exports

// Base URL for the Electric sync engine shapes (Will be updated in the Uplink phase)
const BASE_SHAPE_URL = 'http://localhost:3000/v1/shape';

// 2. Define the Collections mapped directly to the Supabase schema
export const animalsCollection = createCollection(
  electricCollectionOptions({
    id: 'animals',
    getKey: (row: any) => row.id,
    shapeOptions: { url: `${BASE_SHAPE_URL}/animals` }
  })
);

export const clinicalAttachmentsCollection = createCollection(
  electricCollectionOptions({
    id: 'clinical_attachments',
    getKey: (row: any) => row.id,
    shapeOptions: { url: `${BASE_SHAPE_URL}/clinical_attachments` }
  })
);

export const clinicalRecordsCollection = createCollection(
  electricCollectionOptions({
    id: 'clinical_records',
    getKey: (row: any) => row.id,
    shapeOptions: { url: `${BASE_SHAPE_URL}/clinical_records` }
  })
);

export const clinicalScheduleCollection = createCollection(
  electricCollectionOptions({
    id: 'clinical_schedule',
    getKey: (row: any) => row.id,
    shapeOptions: { url: `${BASE_SHAPE_URL}/clinical_schedule` }
  })
);

export const dailyLogsCollection = createCollection(
  electricCollectionOptions({
    id: 'daily_logs',
    getKey: (row: any) => row.id,
    shapeOptions: { url: `${BASE_SHAPE_URL}/daily_logs` }
  })
);

export const dailyRoundsCollection = createCollection(
  electricCollectionOptions({
    id: 'daily_rounds',
    getKey: (row: any) => row.id,
    shapeOptions: { url: `${BASE_SHAPE_URL}/daily_rounds` }
  })
);

export const feedingSchedulesCollection = createCollection(
  electricCollectionOptions({
    id: 'feeding_schedules',
    getKey: (row: any) => row.id,
    shapeOptions: { url: `${BASE_SHAPE_URL}/feeding_schedules` }
  })
);

export const fireDrillLogsCollection = createCollection(
  electricCollectionOptions({
    id: 'fire_drill_logs',
    getKey: (row: any) => row.id,
    shapeOptions: { url: `${BASE_SHAPE_URL}/fire_drill_logs` }
  })
);

export const incidentsCollection = createCollection(
  electricCollectionOptions({
    id: 'incidents',
    getKey: (row: any) => row.id,
    shapeOptions: { url: `${BASE_SHAPE_URL}/incidents` }
  })
);

export const isolationLogsCollection = createCollection(
  electricCollectionOptions({
    id: 'isolation_logs',
    getKey: (row: any) => row.id,
    shapeOptions: { url: `${BASE_SHAPE_URL}/isolation_logs` }
  })
);

export const maintenanceTicketsCollection = createCollection(
  electricCollectionOptions({
    id: 'maintenance_tickets',
    getKey: (row: any) => row.id,
    shapeOptions: { url: `${BASE_SHAPE_URL}/maintenance_tickets` }
  })
);

export const medicationLogsCollection = createCollection(
  electricCollectionOptions({
    id: 'medication_logs',
    getKey: (row: any) => row.id,
    shapeOptions: { url: `${BASE_SHAPE_URL}/medication_logs` }
  })
);

export const operationalListsCollection = db.create