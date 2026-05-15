import React, { useEffect } from 'react';
import { createRootRoute, Outlet } from '@tanstack/react-router';
import { useAuthStore } from '../store/authStore';
import { Login } from '../features/auth/Login';
import { Loader2, LogOut } from 'lucide-react';

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  const isInitialized = useAuthStore((s) => s.isInitialized);
  const session = useAuthStore((s) => s.session);
  const initialize = useAuthStore((s) => s.initialize);
  const signOut = useAuthStore((s) => s.signOut);

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (!isInitialized) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-zinc-950 text-cyan-500">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!session) {
    return <Login />;
  }

  return (
    <div className="h-screen flex flex-col bg-zinc-950 font-sans text-zinc-100">
      <header className="h-16 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between px-6 shadow-sm shrink-0">
        <h1 className="font-black text-cyan-500 tracking-widest uppercase text-sm">
          Vetaura Systems
        </h1>
        <button
          onClick={() => signOut()}
          className="flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-100 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </header>
      <main className="flex-1 p-6 overflow-auto">
        {/* All child routes (like the Dashboard) will render inside this Outlet */}
        <Outlet />
      </main>
    </div>
  );
}