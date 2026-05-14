import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';
import { db } from './lib/db';
import './index.css';

// Initialize the router
const router = createRouter({ routeTree });

// Register it for strict type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

// Mount the app
const rootElement = document.getElementById('root')!;
if (!rootElement.innerHTML) {
  const root = createRoot(rootElement);
  root.render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>
  );
}