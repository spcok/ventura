import React from 'react';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: DashboardPlaceholder,
});

function DashboardPlaceholder() {
  return (
    <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-emerald-500/30 rounded-2xl bg-emerald-50">
      <h2 className="text-xl font-black text-emerald-600 uppercase tracking-widest">Phase 1 Complete</h2>
      <p className="text-sm font-bold text-slate-500 mt-2">TanStack DB & Router Active</p>
    </div>
  );
}