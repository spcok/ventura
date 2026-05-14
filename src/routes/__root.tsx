import React from 'react';
import { createRootRoute, Outlet } from '@tanstack/react-router';

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <div className="h-screen flex flex-col bg-slate-50 font-sans">
      <header className="h-16 bg-white border-b border-slate-200 flex items-center px-6 shadow-sm shrink-0">
        <h1 className="font-black text-slate-800 tracking-widest uppercase text-sm">
          Vetaura Systems
        </h1>
      </header>
      <main className="flex-1 p-6 overflow-auto">
        {/* All child routes (like the Dashboard) will render inside this Outlet */}
        <Outlet />
      </main>
    </div>
  );
}