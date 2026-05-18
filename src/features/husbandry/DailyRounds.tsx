import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
    ClipboardCheck, Check, X, Droplets, Lock, 
    Heart, AlertTriangle, Loader2 
} from 'lucide-react';
import { dailyRoundService } from '../../services/dailyRoundService';
import { Animal, DailyRound } from '../../types/schema';
import { supabase } from '../../lib/supabase';

type ReportType = 'HEALTH' | 'WATER' | 'SECURE';

export default function DailyRounds() {
  const [viewDate, setViewDate] = useState(new Date().toISOString().split('T')[0]);
  const [roundType, setRoundType] = useState<'Morning' | 'Evening'>('Morning');
  
  // Restore the Active Tab State
  const [activeTab, setActiveTab] = useState<string>('OWLS');
  const categories = ['OWLS', 'RAPTORS', 'MAMMALS', 'EXOTICS'];
  
  // pendingChecks tracks individual properties: is_alive, water_checked, locks_secured
  const [pendingChecks, setPendingChecks] = useState<Record<string, Partial<DailyRound>>>({});
  const [reportModal, setReportModal] = useState<{ open: boolean, animalId: string | null, type: ReportType | null }>({ open: false, animalId: null, type: null });
  const [issueText, setIssueText] = useState('');

  // 1. Data Fetch
  const { data: animals = [], isLoading } = useQuery({ 
    queryKey: ['animals'], 
    queryFn: async () => {
        const { data } = await supabase.from('animals').select('*').eq('is_deleted', false);
        return data as Animal[];
    }
  });

  // 2. Filter by Tab, then Group by Location
  const filteredAnimals = animals.filter(a => (a.category || '').toUpperCase() === activeTab);
  
  const animalsByLocation = filteredAnimals.reduce((acc, animal) => {
    const loc = animal.location || 'Unassigned Section';
    if (!acc[loc]) acc[loc] = [];
    acc[loc].push(animal);
    return acc;
  }, {} as Record<string, Animal[]>);

  // 3. Tri-State Logic per ZLA Button
  const toggleSpecific = (animal: Animal, type: ReportType) => {
    const current = pendingChecks[animal.id!] || {};
    
    let key: keyof Partial<DailyRound> = 'is_alive';
    if (type === 'WATER') key = 'water_checked';
    if (type === 'SECURE') key = 'locks_secured';

    const val = current[key];

    if (val === undefined) {
        // Tap 1: YES (Green)
        setPendingChecks(prev => ({ ...prev, [animal.id!]: { ...prev[animal.id!], [key]: true } }));
    } else if (val === true) {
        // Tap 2: NO (Trigger Modal)
        setReportModal({ open: true, animalId: animal.id!, type });
    } else {
        // Tap 3: Reset to unchecked
        setPendingChecks(prev => {
            const next = { ...prev[animal.id!] };
            delete next[key];
            if (Object.keys(next).length === 0) {
                const newState = { ...prev };
                delete newState[animal.id!];
                return newState;
            }
            return { ...prev, [animal.id!]: next };
        });
    }
  };

  const confirmIssue = () => {
    if (!reportModal.animalId || !issueText) return;
    
    let key: keyof Partial<DailyRound> = 'is_alive';
    let noteKey: keyof Partial<DailyRound> = 'animal_issue_note';
    
    if (reportModal.type === 'WATER' || reportModal.type === 'SECURE') {
        key = reportModal.type === 'WATER' ? 'water_checked' : 'locks_secured';
        noteKey = 'general_section_note'; 
    }

    setPendingChecks(prev => ({
        ...prev,
        [reportModal.animalId!]: { 
            ...prev[reportModal.animalId!], 
            [key]: false, 
            [noteKey]: issueText 
        }
    }));
    setReportModal({ open: false, animalId: null, type: null });
    setIssueText('');
  };

  const handleSignOff = async () => {
    const roundsToSave = Object.entries(pendingChecks).map(([id, data]) => ({
        animal_id: id,
        date: viewDate,
        shift: roundType,
        completed_at: new Date().toISOString(),
        ...data
    }));
    await dailyRoundService.bulkSaveRound(roundsToSave as DailyRound[]);
    setPendingChecks({});
    alert(`Successfully signed off ${roundsToSave.length} records for ${roundType} shift.`);
  };

  if (isLoading) return <div className="flex justify-center items-center min-h-screen"><Loader2 className="animate-spin text-emerald-500 w-12 h-12" /></div>;

  return (
    <div className="bg-[#0F1117] min-h-screen text-white p-4 sm:p-6 font-sans pb-32">
      <div className="max-w-5xl mx-auto">
          {/* Header & AM/PM Toggle */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h1 className="text-xl font-black uppercase tracking-widest text-white flex items-center gap-3">
                <ClipboardCheck className="text-emerald-500" /> Daily Rounds
            </h1>
            
            <div className="flex bg-[#0A0B0E] p-1.5 rounded-xl border border-slate-800">
                <button 
                    onClick={() => setRoundType('Morning')}
                    className={`px-6 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${roundType === 'Morning' ? 'bg-amber-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                >
                    AM Shift
                </button>
                <button 
                    onClick={() => setRoundType('Evening')}
                    className={`px-6 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${roundType === 'Evening' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                >
                    PM Shift
                </button>
            </div>
          </div>

          {/* Restored Category Tabs */}
          <div className="flex overflow-x-auto scrollbar-hide bg-[#0A0B0E] p-1.5 rounded-xl gap-1 mb-8 border border-slate-800">
            {categories.map((tab) => (
                <button 
                    key={tab} 
                    onClick={() => setActiveTab(tab)} 
                    className={`flex-1 min-w-[100px] py-2.5 text-xs font-black uppercase tracking-widest rounded-lg transition-all ${activeTab === tab ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:text-white hover:bg-slate-800/50'}`}
                >
                    {tab}
                </button>
            ))}
          </div>

          {/* Render Lists grouped by Section */}
          <div className="space-y-8">
            {Object.entries(animalsByLocation).sort().map(([location, sectionAnimals]) => (
                <div key={location} className="space-y-3">
                    {/* Section Header */}
                    <div className="flex items-center gap-3 mb-2 px-1">
                        <h2 className="text-xs font-black text-emerald-500 uppercase tracking-widest">{location}</h2>
                        <div className="h-px bg-slate-800/80 flex-1"></div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{sectionAnimals.length} Animals</span>
                    </div>

                    {/* Animals in Section */}
                    {sectionAnimals.map((animal) => {
                        const status = pendingChecks[animal.id!];
                        return (
                            <div key={animal.id} className={`bg-[#0A0B0E] border rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between transition-all ${status && (status.is_alive !== undefined || status.water_checked !== undefined || status.locks_secured !== undefined) ? 'border-emerald-500/30' : 'border-slate-800'}`}>
                                <div className="flex items-center gap-4 mb-4 md:mb-0">
                                    <div className="w-12 h-12 rounded-xl bg-slate-800 overflow-hidden shrink-0 border border-slate-700/50">
                                        {animal.image_url ? <img src={animal.image_url} className="w-full h-full object-cover" alt={animal.name || 'animal'} /> : <div className="w-full h-full flex items-center justify-center text-slate-600"><ClipboardCheck size={20} /></div>}
                                    </div>
                                    <div>
                                        <h3 className="font-black text-sm uppercase tracking-widest text-white">{animal.name}</h3>
                                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{animal.species}</p>
                                    </div>
                                </div>
                                
                                {/* ZLA Compliant Buttons */}
                                <div className="flex gap-2">
                                    {/* Health Button */}
                                    <button onClick={() => toggleSpecific(animal, 'HEALTH')}
                                        className={`flex flex-col items-center justify-center p-2 rounded-xl border w-16 h-14 transition-all ${
                                            status?.is_alive === true ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500' :
                                            status?.is_alive === false ? 'border-rose-500 bg-rose-500/10 text-rose-500' :
                                            'border-slate-800 text-slate-500 hover:border-slate-600'
                                        }`}>
                                        {status?.is_alive === true ? <Check size={18} /> : status?.is_alive === false ? <AlertTriangle size={18} /> : <Heart size={18} />}
                                        <span className="text-[8px] font-black uppercase mt-1 tracking-widest">Health</span>
                                    </button>

                                    {/* Water Button */}
                                    <button onClick={() => toggleSpecific(animal, 'WATER')}
                                        className={`flex flex-col items-center justify-center p-2 rounded-xl border w-16 h-14 transition-all ${
                                            status?.water_checked === true ? 'border-blue-500 bg-blue-500/10 text-blue-500' :
                                            status?.water_checked === false ? 'border-rose-500 bg-rose-500/10 text-rose-500' :
                                            'border-slate-800 text-slate-500 hover:border-slate-600'
                                        }`}>
                                        {status?.water_checked === true ? <Check size={18} /> : status?.water_checked === false ? <X size={18} /> : <Droplets size={18} />}
                                        <span className="text-[8px] font-black uppercase mt-1 tracking-widest">Water</span>
                                    </button>

                                    {/* Secure Button */}
                                    <button onClick={() => toggleSpecific(animal, 'SECURE')}
                                        className={`flex flex-col items-center justify-center p-2 rounded-xl border w-16 h-14 transition-all ${
                                            status?.locks_secured === true ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500' :
                                            status?.locks_secured === false ? 'border-rose-500 bg-rose-500/10 text-rose-500' :
                                            'border-slate-800 text-slate-500 hover:border-slate-600'
                                        }`}>
                                        {status?.locks_secured === true ? <Check size={18} /> : status?.locks_secured === false ? <X size={18} /> : <Lock size={18} />}
                                        <span className="text-[8px] font-black uppercase mt-1 tracking-widest">Secure</span>
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ))}
          </div>
      </div>

      {/* Fixed Footer for ZLA Verification */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#0F1117]/90 backdrop-blur border-t border-slate-800 flex justify-center z-40">
         <button 
            onClick={handleSignOff} 
            disabled={Object.keys(pendingChecks).length === 0} 
            className="w-full max-w-5xl bg-emerald-600 py-4 rounded-xl font-black text-xs uppercase tracking-widest text-white hover:bg-emerald-500 disabled:opacity-20 disabled:cursor-not-allowed transition-all shadow-[0_0_20px_rgba(16,185,129,0.15)] flex justify-center items-center gap-2"
         >
            <ClipboardCheck size={18} />
            Submit ZLA Verification Log ({Object.keys(pendingChecks).length} Records)
         </button>
      </div>

      {/* Issue Reporting Modal */}
      {reportModal.open && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-[#0F1117] border border-slate-800 p-6 rounded-2xl w-full max-w-sm shadow-2xl">
                <h2 className="text-sm font-black text-white uppercase tracking-widest mb-2 flex items-center gap-2">
                    <AlertTriangle className="text-rose-500" size={18} />
                    Report {reportModal.type} Issue
                </h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase mb-4">This note will be attached to the formal ZLA log.</p>
                <textarea 
                    autoFocus
                    value={issueText} 
                    onChange={(e) => setIssueText(e.target.value)} 
                    className="w-full bg-[#0A0B0E] border border-slate-800 rounded-xl p-3 text-sm font-medium text-white mb-4 focus:outline-none focus:border-rose-500/50 resize-none h-32"
                    placeholder="Provide required observation details..."
                />
                <div className="flex gap-2">
                    <button 
                        onClick={() => setReportModal({ open: false, animalId: null, type: null })} 
                        className="flex-1 bg-[#0A0B0E] border border-slate-800 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest text-slate-400 hover:text-white"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={confirmIssue} 
                        disabled={!issueText}
                        className="flex-1 bg-rose-600 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest disabled:opacity-50 hover:bg-rose-500"
                    >
                        Confirm Log
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}