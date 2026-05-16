import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Heart, AlertCircle, Scale, ClipboardCheck, CheckCircle } from 'lucide-react';
import { Link } from '@tanstack/react-router';

export function Dashboard() {
  const [activeTab, setActiveTab] = useState('ALL');

  // LOCAL REACTIVE QUERY: Configured for Electric Sync caching
  const { data: rawAnimals = [] } = useQuery({ 
    queryKey: ['animals'],
    queryFn: () => [], 
    staleTime: Infinity 
  });
  
  // LOCAL REACTIVE QUERY: Configured for Electric Sync caching
  const { data: rawTasks = [] } = useQuery({ 
    queryKey: ['tasks'],
    queryFn: () => [],
    staleTime: Infinity
  });

  // In-memory filter to replace SQL WHERE clauses
  const animals = rawAnimals.filter((a: any) => !a.is_deleted).sort((a: any, b: any) => (a.name || '').localeCompare(b.name || ''));
  const tasks = rawTasks.filter((t: any) => t.status === 'PENDING' && !t.is_deleted);

  const filteredAnimals = activeTab === 'ALL' 
    ? animals 
    : animals.filter((a: any) => a.category === activeTab);

  // Helper to render table header
  const renderTableHeader = () => {
    if (activeTab === 'OWLS' || activeTab === 'RAPTORS') {
      return (
        <tr className="bg-[#0A0B0E] border-b border-slate-800/80 text-slate-500 font-black text-[10px] uppercase tracking-widest">
          <th className="px-6 py-5">Name</th><th className="px-6 py-5">Species</th><th className="px-6 py-5">Ring #</th><th className="px-6 py-5">Weight</th><th className="px-6 py-5">Last Feed</th><th className="px-6 py-5">Feed</th><th className="px-6 py-5">Location</th>
        </tr>
      );
    }
    if (activeTab === 'MAMMALS') {
      return (
        <tr className="bg-[#0A0B0E] border-b border-slate-800/80 text-slate-500 font-black text-[10px] uppercase tracking-widest">
          <th className="px-6 py-5">Name</th><th className="px-6 py-5">Species</th><th className="px-6 py-5">Microchip</th><th className="px-6 py-5">Feed</th><th className="px-6 py-5">Location</th>
        </tr>
      );
    }
    if (activeTab === 'EXOTICS') {
      return (
        <tr className="bg-[#0A0B0E] border-b border-slate-800/80 text-slate-500 font-black text-[10px] uppercase tracking-widest">
          <th className="px-6 py-5">Name</th><th className="px-6 py-5">Species</th><th className="px-6 py-5">Feed</th><th className="px-6 py-5">Next Feed</th><th className="px-6 py-5">Location</th>
        </tr>
      );
    }
    return (
      <tr className="bg-[#0A0B0E] border-b border-slate-800/80 text-slate-500 font-black text-[10px] uppercase tracking-widest">
        <th className="px-6 py-5">Name</th><th className="px-6 py-5">Category</th><th className="px-6 py-5">Species</th><th className="px-6 py-5">Location</th>
      </tr>
    );
  };

  // Helper to render dynamic row cells
  const renderRowCells = (animal: any) => {
    const emptyNode = <span className="text-slate-700">--</span>;

    // The clickable name cell
    const nameCell = (
      <td className="px-6 py-4 text-xs font-bold">
        <Link 
          to="/animals/$id" 
          params={{ id: animal.id }}
          className="text-emerald-400 hover:text-emerald-300 transition-colors underline decoration-emerald-500/30 underline-offset-4"
        >
          {animal.name || 'Unnamed'}
        </Link>
      </td>
    );

    if (activeTab === 'OWLS' || activeTab === 'RAPTORS') {
      return (
        <>
          {nameCell}
          <td className="px-6 py-4 text-xs font-bold text-slate-500">{animal.species || 'Unknown'}</td>
          <td className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{animal.ring_number || emptyNode}</td>
          <td className="px-6 py-4 text-xs font-bold text-amber-500">{animal.todays_weight ? `${animal.todays_weight}g` : emptyNode}</td>
          <td className="px-6 py-4 text-xs font-bold text-slate-500">{animal.last_feed || emptyNode}</td>
          <td className="px-6 py-4 text-xs font-bold text-slate-500">{animal.todays_feed || emptyNode}</td>
          <td className="px-6 py-4"><span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg uppercase tracking-widest">{animal.location || 'Unknown'}</span></td>
        </>
      );
    }
    if (activeTab === 'MAMMALS') {
      return (
        <>
          {nameCell}
          <td className="px-6 py-4 text-xs font-bold text-slate-500">{animal.species || 'Unknown'}</td>
          <td className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{animal.microchip_id || emptyNode}</td>
          <td className="px-6 py-4 text-xs font-bold text-slate-500">{animal.todays_feed || emptyNode}</td>
          <td className="px-6 py-4"><span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg uppercase tracking-widest">{animal.location || 'Unknown'}</span></td>
        </>
      );
    }
    if (activeTab === 'EXOTICS') {
      return (
        <>
          {nameCell}
          <td className="px-6 py-4 text-xs font-bold text-slate-500">{animal.species || 'Unknown'}</td>
          <td className="px-6 py-4 text-xs font-bold text-slate-500">{animal.todays_feed || emptyNode}</td>
          <td className="px-6 py-4 text-[10px] font-black text-amber-500/80 uppercase tracking-widest">{animal.next_feed || emptyNode}</td>
          <td className="px-6 py-4"><span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg uppercase tracking-widest">{animal.location || 'Unknown'}</span></td>
        </>
      );
    }
    return (
      <>
        {nameCell}
        <td className="px-6 py-4 text-[10px] font-black text-blue-400 uppercase tracking-widest">{animal.category || emptyNode}</td>
        <td className="px-6 py-4 text-xs font-bold text-slate-500">{animal.species || 'Unknown'}</td>
        <td className="px-6 py-4"><span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg uppercase tracking-widest">{animal.location || 'Unknown'}</span></td>
      </>
    );
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto font-sans">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Dashboard</h1>
          <p className="text-slate-400 mt-1 flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
            Live Local Sync <span className="text-slate-700">|</span> 🌤️ Active
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          <div className="bg-[#0F1117] rounded-2xl border border-slate-800/80 shadow-2xl p-5 flex flex-col transition-all duration-300 h-64 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-[64px] rounded-full pointer-events-none" />
              <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-3">
                      <div className="p-2 bg-[#0A0B0E] border border-slate-800/80 text-blue-500 rounded-xl shadow-inner"><ClipboardCheck size={18} /></div>
                      <h2 className="text-sm font-black text-white uppercase tracking-widest">Pending Duties</h2>
                  </div>
                  <span className="bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black px-2.5 py-1 rounded-lg">{tasks.length}</span>
              </div>
              <div className="mt-4 flex-1 overflow-y-auto pr-2 space-y-2 scrollbar-hide relative z-10">
                  {tasks.length > 0 ? tasks.map((t: any) => (
                      <div key={t.id} className="flex items-start gap-3 p-3 rounded-xl bg-[#0A0B0E] border border-slate-800/80 shadow-inner">
                          <AlertCircle size={14} className="text-amber-500 mt-0.5 shrink-0"/>
                          <div>
                              <p className="text-xs font-bold text-slate-200">{t.title}</p>
                              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Due: {t.due_date || 'N/A'}</p>
                          </div>
                      </div>
                  )) : (
                      <div className="flex flex-col items-center justify-center h-full text-slate-500">
                          <CheckCircle size={24} className="text-emerald-500/50 mb-3"/>
                          <p className="text-xs font-bold uppercase tracking-widest">All duties satisfied</p>
                      </div>
                  )}
              </div>
          </div>

          <div className="bg-[#0F1117] rounded-2xl border border-slate-800/80 shadow-2xl p-5 flex flex-col transition-all duration-300 h-64 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 blur-[64px] rounded-full pointer-events-none" />
              <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-3">
                      <div className="p-2 bg-[#0A0B0E] border border-slate-800/80 text-rose-500 rounded-xl shadow-inner"><Heart size={18} /></div>
                      <h2 className="text-sm font-black text-white uppercase tracking-widest">Health Rota</h2>
                  </div>
              </div>
              <div className="flex flex-col items-center justify-center h-full text-slate-500 relative z-10">
                  <Heart size={24} className="text-rose-500/30 mb-3"/>
                  <p className="text-xs font-bold uppercase tracking-widest">Collection Stable</p>
              </div>
          </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto scrollbar-hide bg-[#0F1117] border border-slate-800/80 p-1.5 rounded-2xl gap-1 shadow-inner">
        {['ALL', 'OWLS', 'RAPTORS', 'MAMMALS', 'EXOTICS', 'ARCHIVED'].map(cat => (
          <button
            key={cat}
            onClick={() => setActiveTab(cat)}
            className={`flex-1 min-w-[100px] py-2.5 px-4 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all whitespace-nowrap ${
              activeTab === cat 
              ? 'bg-emerald-600/10 text-emerald-400 border border-emerald-500/20 shadow-sm' 
              : 'text-slate-500 hover:text-slate-300 hover:bg-[#0A0B0E]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Database Table */}
      <div className="bg-[#0F1117] rounded-3xl border border-slate-800/80 shadow-2xl overflow-hidden relative">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="w-full">
              {renderTableHeader()}
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredAnimals.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#0A0B0E] border border-slate-800/80 mb-4 shadow-inner">
                      <Scale size={24} className="text-slate-600" />
                    </div>
                    <h3 className="text-sm font-black text-white uppercase tracking-widest">Local Vault Empty</h3>
                    <p className="text-xs font-bold text-slate-500 mt-2">Awaiting downstream sync from Supabase.</p>
                  </td>
                </tr>
              ) : (
                filteredAnimals.map((animal: any) => (
                  <tr key={animal.id} className="hover:bg-[#0A0B0E] transition-colors group">
                    {renderRowCells(animal)}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}