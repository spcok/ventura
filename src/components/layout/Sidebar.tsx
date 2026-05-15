import React from 'react';
import { Link } from '@tanstack/react-router';
import { LayoutDashboard, PawPrint, Stethoscope, ClipboardList, ShieldAlert } from 'lucide-react';

const navigation = [
  { name: 'Dashboard', to: '/', icon: LayoutDashboard },
  { name: 'Animals', to: '/animals', icon: PawPrint },
  { name: 'Clinical', to: '/clinical', icon: Stethoscope },
  { name: 'Tasks', to: '/tasks', icon: ClipboardList },
];

export function Sidebar() {
  return (
    <div className="w-64 bg-[#0F1117] border-r border-slate-800/80 flex flex-col h-full shrink-0">
      <div className="h-16 flex items-center px-6 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#0A0B0E] border border-slate-800/80 flex items-center justify-center shadow-inner">
            <ShieldAlert size={16} className="text-emerald-500" />
          </div>
          <span className="font-black text-white tracking-tight">Vetaura</span>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navigation.map((item) => (
          <Link
            key={item.name}
            to={item.to}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors group [&.active]:bg-emerald-500/10 [&.active]:text-emerald-400"
          >
            <item.icon size={18} className="shrink-0 transition-colors group-[&.active]:text-emerald-400" />
            {item.name}
          </Link>
        ))}
      </nav>
    </div>
  );
}
