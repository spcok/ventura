import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
    ClipboardCheck, Sun, Moon, Check, X, Droplets, Lock, 
    Heart, AlertTriangle, ShieldCheck, Loader2, Calendar as CalendarIcon,
    Info, ChevronRight, CornerDownRight 
} from 'lucide-react';
import { dailyRoundService } from '../../services/dailyRoundService';
import { Animal, DailyRound, AnimalCategory } from '../../types/schema';
import { supabase } from '../../lib/supabase';

export default function DailyRounds() {
  const [viewDate, setViewDate] = useState(new Date().toISOString().split('T')[0]);
  const [roundType, setRoundType] = useState<'Morning' | 'Evening'>('Morning');
  const [pendingChecks, setPendingChecks] = useState<Record<string, Partial<DailyRound>>>({});
  const [reportModal, setReportModal] = useState<{ open: boolean, animalId: string | null, type: 'HEALTH' | 'SECURITY' | null }>({ open: false, animalId: null, type: null });
  const [issueText, setIssueText] = useState('');

  // Fetching data via standard TanStack Query
  const { data: animals = [], isLoading } = useQuery({ 
    queryKey: ['animals'], 
    queryFn: async () => {
        const { data } = await supabase.from('animals').select('*').eq('is_deleted', false);
        return data as Animal[];
    }
  });

  // Toggle Logic (Tri-State: Unchecked -> Yes -> No(Modal))
  const toggleStatus = (animal: Animal) => {
    const current = pendingChecks[animal.id!];

    if (!current) {
        // Tap 1: Mark as YES (Watered/Healthy/Secure)
        setPendingChecks(prev => ({ ...prev, [animal.id!]: { is_alive: true, water_checked: true, locks_secured: true } }));
    } else if (current.is_alive === true) {
        // Tap 2: Trigger NO (Trigger Modal)
        setReportModal({ open: true, animalId: animal.id!, type: 'HEALTH' });
    } else {
        // Tap 3: Reset
        const next = { ...pendingChecks };
        delete next[animal.id!];
        setPendingChecks(next);
    }
  };

  const confirmIssue = () => {
    if (!reportModal.animalId || !issueText) return;
    setPendingChecks(prev => ({
        ...prev,
        [reportModal.animalId!]: { is_alive: false, animal_issue_note: issueText }
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
    alert('Round Signed Off Successfully');
  };

  if (isLoading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-emerald-500" /></div>;

  return (
    <div className="bg-[#0F1117] min-h-screen text-white p-6 font-sans">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-xl font-black uppercase tracking-widest text-white flex items-center gap-3">
            <ClipboardCheck className="text-emerald-500" /> Daily Rounds
        </h1>
        <button onClick={handleSignOff} disabled={Object.keys(pendingChecks).length === 0} className="bg-emerald-600 px-6 py-2 rounded-xl font-black text-xs uppercase hover:bg-emerald-500 disabled:opacity-50">
            Verify & Sign Off
        </button>
      </div>

      <div className="grid gap-3">
        {animals.map((animal) => {
            const status = pendingChecks[animal.id!];
            return (
                <div key={animal.id} className={`bg-[#0A0B0E] border rounded-2xl p-4 flex items-center justify-between ${status ? 'border-emerald-500/50' : 'border-slate-800'}`}>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-800 overflow-hidden">
                            {animal.image_url && <img src={animal.image_url} className="w-full h-full object-cover" />}
                        </div>
                        <div>
                            <p className="font-black text-sm uppercase">{animal.name}</p>
                            <p className="text-[10px] text-slate-500">{animal.location}</p>
                        </div>
                    </div>
                    
                    <button 
                        onClick={() => toggleStatus(animal)}
                        className={`p-4 rounded-xl border ${status ? (status.is_alive ? 'border-emerald-500 bg-emerald-500/10' : 'border-rose-500 bg-rose-500/10') : 'border-slate-800'}`}
                    >
                        {status ? (status.is_alive ? <Check className="text-emerald-500" /> : <X className="text-rose-500" />) : <Heart className="text-slate-600" />}
                    </button>
                </div>
            );
        })}
      </div>

      {reportModal.open && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4">
            <div className="bg-[#0F1117] border border-slate-800 p-6 rounded-2xl w-full max-w-sm">
                <h2 className="text-sm font-black text-white uppercase mb-4">Report Issue</h2>
                <textarea 
                    autoFocus
                    value={issueText} 
                    onChange={(e) => setIssueText(e.target.value)} 
                    className="w-full bg-[#0A0B0E] border border-slate-800 rounded-xl p-3 text-sm text-white mb-4"
                    placeholder="Describe issue..."
                />
                <button onClick={confirmIssue} className="w-full bg-rose-600 py-3 rounded-xl font-black text-xs uppercase">Confirm</button>
            </div>
        </div>
      )}
    </div>
  );
}