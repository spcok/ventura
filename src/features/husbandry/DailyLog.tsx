import React, { useState, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Users, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { Animal, LogEntry, LogType, AnimalCategory, EntityType } from '../../types';
import { getUKLocalDate } from '../../services/temporalService';
import { useDailyLogData } from './useDailyLogData';
import { useWeatherSync } from './hooks/useWeatherSync';
import AddEntryModal from './AddEntryModal';
import { BirdRow } from './components/BirdRow';
import { MammalRow } from './components/MammalRow';
import { ExoticRow } from './components/ExoticRow';

const DailyLog: React.FC = () => {
  const [viewDate, setViewDate] = useState(getUKLocalDate());
  
  const handlePrevDay = () => {
    const d = new Date(viewDate);
    d.setDate(d.getDate() - 1);
    setViewDate(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(viewDate);
    d.setDate(d.getDate() + 1);
    setViewDate(d.toISOString().split('T')[0]);
  };

  const handleToday = () => {
    setViewDate(getUKLocalDate());
  };

  const [activeCategory, setActiveCategory] = useState<AnimalCategory>(AnimalCategory.OWLS);
  const [hideSubAccounts, setHideSubAccounts] = useState(true);
  const isProcessing = useRef<Set<string>>(new Set());
  
  const { animals, getTodayLog, addLogEntry, updateLogEntry, isLoading } = useDailyLogData(viewDate, activeCategory);
  const { isSyncing } = useWeatherSync();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);
  const [selectedType, setSelectedType] = useState<LogType>(LogType.GENERAL);

  const visibleAnimals = hideSubAccounts 
    ? animals.filter(a => !(a.entityType === EntityType.INDIVIDUAL && a.parentMobId))
    : animals;

  const categories = [
    AnimalCategory.OWLS,
    AnimalCategory.RAPTORS,
    AnimalCategory.MAMMALS,
    AnimalCategory.EXOTICS
  ];

  const handleCellClick = (animal: Animal, type: LogType) => {
    setSelectedAnimal(animal);
    setSelectedType(type);
    setIsModalOpen(true);
  };

  const renderHeaders = () => {
    switch (activeCategory) {
      case AnimalCategory.EXOTICS:
        return (
          <tr>
            <th className="px-6 py-5 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Animal</th>
            <th className="px-6 py-5 text-center text-[10px] font-black text-slate-500 uppercase tracking-widest">FEED</th>
            <th className="px-6 py-5 text-center text-[10px] font-black text-slate-500 uppercase tracking-widest">MISTING</th>
            <th className="px-6 py-5 text-center text-[10px] font-black text-slate-500 uppercase tracking-widest">ENV</th>
          </tr>
        );
      default:
        return (
          <tr>
            <th className="px-6 py-5 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Animal</th>
            <th className="px-6 py-5 text-center text-[10px] font-black text-slate-500 uppercase tracking-widest">WT</th>
            <th className="px-6 py-5 text-center text-[10px] font-black text-slate-500 uppercase tracking-widest">FEED</th>
            <th className="px-6 py-5 text-center text-[10px] font-black text-slate-500 uppercase tracking-widest">ENV</th>
          </tr>
        );
    }
  };

  const renderRow = (animal: Animal) => {
    let parentMobName: string | undefined;
    if (animal.entityType === EntityType.INDIVIDUAL && animal.parentMobId) {
      const parent = animals.find(a => a.id === animal.parentMobId);
      if (parent) parentMobName = parent.name;
    }

    switch (animal.category) {
      case AnimalCategory.OWLS:
      case AnimalCategory.RAPTORS:
        return <BirdRow key={animal.id} animal={animal} getTodayLog={getTodayLog} onCellClick={handleCellClick} parentMobName={parentMobName} />;
      case AnimalCategory.MAMMALS:
        return <MammalRow key={animal.id} animal={animal} getTodayLog={getTodayLog} onCellClick={handleCellClick} parentMobName={parentMobName} />;
      case AnimalCategory.EXOTICS:
        return <ExoticRow key={animal.id} animal={animal} getTodayLog={getTodayLog} onCellClick={handleCellClick} parentMobName={parentMobName} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto font-sans">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
            <h1 className="text-3xl font-black text-white tracking-tight uppercase">DAILY LOG</h1>
            <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Log and track daily animal activities.</p>
            
            <div className="flex items-center gap-1 mt-4 bg-[#0A0B0E] border border-slate-800/80 rounded-xl p-1.5 w-fit shadow-inner">
              <button 
                onClick={handlePrevDay} 
                className="p-1.5 text-slate-500 hover:text-emerald-400 hover:bg-slate-800/50 rounded-lg transition-colors"
                title="Previous Day"
              >
                <ChevronLeft size={16} />
              </button>

              <div className="flex items-center gap-2 px-3 border-x border-slate-800/80">
                <Calendar size={14} className="text-slate-500" />
                <input 
                  type="date" 
                  value={viewDate}
                  onChange={(e) => setViewDate(e.target.value)}
                  className="text-xs font-bold text-white bg-transparent focus:outline-none w-28 text-center cursor-pointer [&::-webkit-calendar-picker-indicator]:invert"
                />
              </div>

              <button 
                onClick={handleNextDay} 
                className="p-1.5 text-slate-500 hover:text-emerald-400 hover:bg-slate-800/50 rounded-lg transition-colors"
                title="Next Day"
              >
                <ChevronRight size={16} />
              </button>

              <button 
                onClick={handleToday}
                className={`ml-2 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-colors ${viewDate === getUKLocalDate() ? 'bg-emerald-600/10 text-emerald-400 border border-emerald-500/20' : 'text-slate-500 hover:bg-slate-800/50 hover:text-white'}`}
              >
                Today
              </button>
            </div>
        </div>
        {isSyncing && <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest animate-pulse border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 rounded-lg shadow-inner">Syncing Weather...</span>}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0F1117] border border-slate-800/80 p-3 rounded-2xl shadow-inner">
        <div className="flex overflow-x-auto scrollbar-hide bg-[#0A0B0E] p-1 rounded-xl gap-1">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`flex-1 min-w-[100px] py-2 px-4 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all whitespace-nowrap ${
                activeCategory === category 
                  ? 'bg-emerald-600/10 text-emerald-400 border border-emerald-500/20 shadow-sm' 
                  : 'text-slate-500 hover:text-white hover:bg-[#0F1117]'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
        <button 
          onClick={() => setHideSubAccounts(!hideSubAccounts)}
          className={`ml-auto flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] uppercase tracking-widest font-black transition-all ${hideSubAccounts ? 'bg-emerald-600/10 text-emerald-400 border border-emerald-500/20' : 'bg-[#0A0B0E] border border-slate-800/80 text-slate-500 hover:text-white'}`}
        >
          <Users size={14} />
          {hideSubAccounts ? 'Sub-Accounts Hidden' : 'Showing All'}
        </button>
      </div>

      <div className="bg-[#0F1117] rounded-3xl border border-slate-800/80 shadow-2xl overflow-hidden relative">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#0A0B0E] border-b border-slate-800/80">
              {renderHeaders()}
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-slate-800/80 animate-pulse bg-[#0A0B0E]/50">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-800/80 shrink-0"></div>
                      <div>
                        <div className="h-4 w-24 bg-slate-800/80 rounded mb-2"></div>
                        <div className="h-3 w-16 bg-slate-800/80 rounded"></div>
                      </div>
                    </td>
                    <td className="px-6 py-4"><div className="h-8 w-16 bg-slate-800/80 rounded-lg mx-auto"></div></td>
                    <td className="px-6 py-4"><div className="h-8 w-16 bg-slate-800/80 rounded-lg mx-auto"></div></td>
                    <td className="px-6 py-4"><div className="h-8 w-16 bg-slate-800/80 rounded-lg mx-auto"></div></td>
                  </tr>
                ))
              ) : (
                visibleAnimals.map(renderRow)
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && selectedAnimal && (
        <AddEntryModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={async (entry: Partial<LogEntry>) => {
            if (entry.animalId && isProcessing.current.has(entry.animalId)) return;
            if (entry.animalId) isProcessing.current.add(entry.animalId);
            try {
              const existingLog = getTodayLog(selectedAnimal.id, selectedType);
              if (existingLog && existingLog.id) {
                await updateLogEntry(existingLog.id, { ...existingLog, ...entry } as LogEntry);
              } else {
                if (!entry.id) entry.id = uuidv4();
                await addLogEntry(entry as LogEntry);
              }
              setIsModalOpen(false);
            } finally {
              if (entry.animalId) isProcessing.current.delete(entry.animalId);
            }
          }}
          animal={selectedAnimal}
          initialType={selectedType}
          existingLog={getTodayLog(selectedAnimal.id, selectedType)}
          initialDate={viewDate}
        />
      )}
    </div>
  );
};

export default DailyLog;
