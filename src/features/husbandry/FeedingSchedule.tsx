import React, { useState, useMemo, useTransition } from 'react';
import { Animal, AnimalCategory, Task, LogType } from '../../types/schema';
import { CalendarClock, Plus, Calendar, Trash2, Filter, Utensils, RefreshCw, Loader2, History, ArrowRight, Copy } from 'lucide-react';
import { getUKLocalDate } from '../../services/temporalService';
import { useOperationalLists } from '../../hooks/useOperationalLists';
import { useFeedingScheduleData } from './useFeedingScheduleData';
import { useAnimalsData } from '../animals/useAnimalsData';
import { useTaskData } from './useTaskData';

const FeedingSchedule: React.FC = () => {
  const [viewDate, setViewDate] = useState(getUKLocalDate());
  const { data: feedingLogs = [], isLoading: logsLoading } = useFeedingScheduleData(viewDate);
  const { animals, isLoading: animalsLoading } = useAnimalsData();
  const { tasks, addTask, deleteTask, isLoading: tasksLoading } = useTaskData();

  const isLoading = animalsLoading || tasksLoading || logsLoading;

  const [selectedCategory, setSelectedCategory] = useState<AnimalCategory>(AnimalCategory.EXOTICS);
  const { foodTypes: foodOptions } = useOperationalLists(selectedCategory);
  const [selectedAnimalId, setSelectedAnimalId] = useState('');
  const [foodType, setFoodType] = useState('');
  const [quantity, setQuantity] = useState('');
  const [withCalciDust, setWithCalciDust] = useState(false);
  const [scheduleMode, setScheduleMode] = useState<'manual' | 'interval'>('manual');
  
  const [isPending, startTransition] = useTransition();
  
  const [viewFilterAnimalId, setViewFilterAnimalId] = useState<string>('ALL');
  const [viewScope, setViewScope] = useState<'upcoming' | 'history'>('upcoming');
  const [viewLayout, setViewLayout] = useState<'timeline' | 'animal'>('timeline');

  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  
  const [intervalDays, setIntervalDays] = useState(3);
  const [intervalStart, setIntervalStart] = useState(getUKLocalDate());
  const [occurrences, setOccurrences] = useState(5);

  const filteredAnimals = animals.filter(a => a.category === selectedCategory && !a.archived);

  const toggleDate = (date: string) => {
      setSelectedDates(prev => prev.includes(date) ? prev.filter(d => d !== date) : [...prev, date]);
  };

  const handleGenerate = () => {
      if (!selectedAnimalId || !foodType || !quantity) return;
      
      startTransition(() => {
          const animal = animals.find(a => a.id === selectedAnimalId);
          if (!animal) return;

          let datesToSchedule: string[] = [];

          if (scheduleMode === 'manual') {
              datesToSchedule = selectedDates;
          } else {
              const [y, m, d] = intervalStart.split('-').map(Number);
              const startDate = new Date(y, m - 1, d);

              for (let i = 0; i < occurrences; i++) {
                  const current = new Date(startDate);
                  current.setDate(startDate.getDate() + (i * intervalDays));
                  const year = current.getFullYear();
                  const month = String(current.getMonth() + 1).padStart(2, '0');
                  const day = String(current.getDate()).padStart(2, '0');
                  datesToSchedule.push(`${year}-${month}-${day}`);
              }
          }

          const notes = `${quantity} ${foodType}${withCalciDust ? ' + Calci-dust' : ''}`;
          
          const newTasks: Partial<Task>[] = datesToSchedule.map(date => ({
              animalId: selectedAnimalId,
              title: `Feed ${animal.name}`,
              type: LogType.FEED,
              dueDate: date,
              completed: false,
              notes: notes,
          }));

          Promise.all(newTasks.map(t => addTask(t))).then(() => {
              setSelectedDates([]);
          });
      });
  };

  const handleQuickExtend = (animalId: string) => {
      const animalTasks = tasks.filter(t => (t.animalId === animalId) && (t.type === LogType.FEED));
      if (animalTasks.length === 0) return;
      
      animalTasks.sort((a, b) => (b.dueDate!).localeCompare(a.dueDate!));
      const lastTask: Task = animalTasks[0];
      
      setSelectedCategory(animals.find(a => a.id === animalId)?.category || AnimalCategory.EXOTICS);
      setSelectedAnimalId(animalId);
      
      if (lastTask.notes) {
          const match = lastTask.notes.match(/^(\d+(\.\d+)?) (.+?)( \+ Calci-dust)?$/);
          if (match) {
              setQuantity(match[1]);
              setFoodType(match[3].trim());
              setWithCalciDust(!!match[4]);
          } else {
              setQuantity('1');
              setFoodType('');
          }
      }

      const lastDate = new Date(lastTask.dueDate as string);
      lastDate.setDate(lastDate.getDate() + 1); 
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const startDate = lastDate > new Date() ? lastDate : tomorrow;
      
      const y = startDate.getFullYear();
      const m = String(startDate.getMonth() + 1).padStart(2, '0');
      const d = String(startDate.getDate()).padStart(2, '0');
      
      setIntervalStart(`${y}-${m}-${d}`);
      setScheduleMode('interval');
      
      if (animalTasks.length > 1) {
          const secondLast: Task = animalTasks[1];
          const diffTime = Math.abs(new Date(lastTask.dueDate as string).getTime() - new Date(secondLast.dueDate as string).getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
          if (diffDays > 0 && diffDays < 30) setIntervalDays(diffDays);
      }
  };

  const filteredTasks = useMemo(() => {
    const baseTasks = tasks
        .filter(t => (t.type === LogType.FEED))
        .filter(t => viewScope === 'upcoming' ? !t.completed : t.completed)
        .filter(t => viewFilterAnimalId === 'ALL' || (t.animalId === viewFilterAnimalId));

    if (viewScope === 'history') {
        const mappedLogs = feedingLogs
            .filter(log => viewFilterAnimalId === 'ALL' || log.animalId === viewFilterAnimalId)
            .map(log => ({
                id: log.id,
                animalId: log.animalId,
                title: `Fed ${log.animals?.name || 'Animal'}`,
                type: LogType.FEED,
                dueDate: log.logDate,
                completed: true,
                notes: log.notes,
                createdAt: log.createdAt
            } as unknown as Task));
        
        return [...baseTasks, ...mappedLogs].sort((a, b) => (b.dueDate!).localeCompare(a.dueDate!));
    }

    return baseTasks.sort((a, b) => (a.dueDate!).localeCompare(b.dueDate!));
  }, [tasks, feedingLogs, viewFilterAnimalId, viewScope]);

  const animalGroups = useMemo(() => {
      const groups = new Map<string, { animal: Animal, tasks: Task[] }>();
      
      filteredTasks.forEach(task => {
          const aId = task.animalId;
          if (!aId) return;
          if (!groups.has(aId)) {
              const animal = animals.find(a => a.id === aId);
              if (animal) groups.set(aId, { animal, tasks: [] });
          }
          groups.get(aId)?.tasks.push(task);
      });
      
      return Array.from(groups.values());
  }, [filteredTasks, animals]);

  const calendarDays = useMemo(() => {
      const today = new Date();
      const year = today.getFullYear();
      const month = today.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const days = [];
      for(let i=1; i<=daysInMonth; i++) {
          const d = new Date(year, month, i);
          const y = d.getFullYear();
          const m = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');
          days.push(`${y}-${m}-${day}`);
      }
      return days;
  }, []);

  const inputClass = "w-full px-4 py-2.5 bg-[#0F1117] border border-slate-800/80 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-emerald-500/50 transition-all shadow-inner";

  if (isLoading) return <div className="p-8 flex justify-center items-center min-h-screen"><Loader2 className="animate-spin text-emerald-500" size={40} /></div>;

  return (
    <div className="space-y-6 bg-[#0F1117] min-h-screen text-slate-300 font-sans p-4 lg:p-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 max-w-[1600px] mx-auto">
             <div>
                <h1 className="text-3xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                    <CalendarClock className="text-emerald-500" size={28} /> Feeding Schedule
                </h1>
                <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-widest">Plan and view future feeding tasks</p>
             </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 max-w-[1600px] mx-auto">
            
            {/* LEFT COLUMN: CREATION */}
            <div className="xl:col-span-1 space-y-4">
                 <div className="bg-[#0A0B0E] p-6 rounded-2xl border border-slate-800/80 shadow-2xl">
                     <h4 className="text-xs font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2 border-b border-slate-800/80 pb-4">
                        <Plus size={16} className="text-emerald-500"/> Schedule Feeds
                     </h4>
                     
                     <div className="space-y-5">
                        <div className="bg-[#0F1117] p-1.5 rounded-xl flex border border-slate-800/80 overflow-x-auto scrollbar-hide shadow-inner">
                            {[AnimalCategory.OWLS, AnimalCategory.RAPTORS, AnimalCategory.MAMMALS, AnimalCategory.EXOTICS].map(cat => (
                                <button 
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`flex-1 min-w-[70px] py-2 px-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${selectedCategory === cat ? 'bg-emerald-600/10 text-emerald-400 border border-emerald-500/20 shadow-sm' : 'text-slate-500 hover:text-white hover:bg-slate-800/50'}`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Animal *</label>
                            <select value={selectedAnimalId} onChange={e => setSelectedAnimalId(e.target.value)} className={inputClass}>
                                <option value="">Select Animal...</option>
                                {filteredAnimals.map(a => <option key={a.id} value={a.id}>{a.name} ({a.species})</option>)}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Food Type *</label>
                                <select value={foodType} onChange={e => setFoodType(e.target.value)} className={inputClass} required>
                                    <option value="" disabled>Select a food type...</option>
                                    {foodOptions === undefined ? (
                                        <option value="" disabled>Loading foods...</option>
                                    ) : foodOptions.length === 0 ? (
                                        <option value="" disabled>No foods configured</option>
                                    ) : (
                                        foodOptions.map(f => <option key={f.id} value={f.value}>{f.value}</option>)
                                    )}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Quantity *</label>
                                <input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} className={inputClass} placeholder="1"/>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 bg-[#0F1117] p-3 rounded-xl border border-slate-800/80 shadow-inner">
                            <input type="checkbox" id="calci" checked={withCalciDust} onChange={e => setWithCalciDust(e.target.checked)} className="w-4 h-4 text-emerald-500 bg-[#0A0B0E] rounded border-slate-700 focus:ring-emerald-500/50 focus:ring-offset-[#0F1117]"/>
                            <label htmlFor="calci" className="text-xs font-bold text-slate-300 select-none cursor-pointer uppercase tracking-widest">Include Calci-dust</label>
                        </div>

                        <div className="pt-5 border-t border-slate-800/80">
                             <div className="flex flex-col gap-2 mb-4">
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Schedule Method *</label>
                                <div className="flex items-center gap-3 bg-[#0F1117] p-3 rounded-xl border border-slate-800/80 shadow-inner">
                                    <input 
                                        type="checkbox" 
                                        id="intervalMode" 
                                        checked={scheduleMode === 'interval'} 
                                        onChange={(e) => setScheduleMode(e.target.checked ? 'interval' : 'manual')}
                                        className="w-4 h-4 text-emerald-500 bg-[#0A0B0E] rounded border-slate-700 focus:ring-emerald-500/50 focus:ring-offset-[#0F1117]"
                                    />
                                    <label htmlFor="intervalMode" className="text-xs font-bold text-slate-300 select-none cursor-pointer uppercase tracking-widest">Auto-Interval Mode</label>
                                </div>
                             </div>

                             {scheduleMode === 'manual' ? (
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center px-2">
                                         <span className="text-xs font-black text-white uppercase tracking-widest">{new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
                                    </div>
                                    <div className="grid grid-cols-7 gap-1 bg-[#0F1117] p-3 rounded-xl border border-slate-800/80 shadow-inner">
                                        {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
                                            <div key={d} className="text-center text-[10px] text-slate-500 font-black uppercase py-1">{d}</div>
                                        ))}
                                        {calendarDays.map(date => {
                                            const [y, m, d] = date.split('-').map(Number);
                                            const localDate = new Date(y, m-1, d);
                                            const dayNum = localDate.getDate();
                                            const colStart = localDate.getDay() + 1;
                                            const isSelected = selectedDates.includes(date);
                                            
                                            const style = dayNum === 1 ? { gridColumnStart: colStart } : {};

                                            return (
                                                <button 
                                                    key={date}
                                                    style={style}
                                                    onClick={() => toggleDate(date)}
                                                    className={`h-8 w-8 mx-auto rounded-xl text-[10px] font-black transition-all flex items-center justify-center ${
                                                        isSelected ? 'bg-emerald-600 text-white shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'bg-[#0A0B0E] border border-slate-800 text-slate-400 hover:text-white hover:border-slate-600'
                                                    }`}
                                                >
                                                    {dayNum}
                                                </button>
                                            )
                                        })}
                                    </div>
                                    <p className="text-[10px] font-bold text-emerald-500 text-right uppercase tracking-widest">{selectedDates.length} dates selected</p>
                                </div>
                             ) : (
                                <div className="space-y-4 bg-[#0F1117] p-4 rounded-xl border border-slate-800/80 shadow-inner animate-in slide-in-from-top-2 duration-200">
                                    <div className="flex items-start gap-3 bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20">
                                        <RefreshCw size={16} className="text-emerald-500 shrink-0"/>
                                        <div className="text-[10px] text-emerald-400/90 font-bold uppercase tracking-widest leading-relaxed">
                                            Generate repeating tasks starting from a date.
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Start Date</label>
                                        <input type="date" value={intervalStart} onChange={e => setIntervalStart(e.target.value)} className={inputClass}/>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Repeat Every (Days)</label>
                                            <input type="number" min="1" value={intervalDays} onChange={e => setIntervalDays(parseInt(e.target.value))} className={inputClass}/>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Occurrences</label>
                                            <input type="number" min="1" max="50" value={occurrences} onChange={e => setOccurrences(parseInt(e.target.value))} className={inputClass}/>
                                        </div>
                                    </div>
                                </div>
                             )}
                        </div>

                        <button 
                            onClick={handleGenerate}
                            disabled={!selectedAnimalId || !foodType || !quantity || (scheduleMode === 'manual' && selectedDates.length === 0) || isPending}
                            className="w-full bg-emerald-600 text-white py-3.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-[0_0_15px_rgba(16,185,129,0.15)] flex items-center justify-center gap-2 mt-4"
                        >
                            {isPending ? <Loader2 size={16} className="animate-spin" /> : <CalendarClock size={16} />}
                            {isPending ? 'SCHEDULING...' : 'CONFIRM SCHEDULE'}
                        </button>
                     </div>
                 </div>
            </div>

            {/* RIGHT COLUMN: VIEWING */}
            <div className="xl:col-span-2 space-y-4">
                <div className="bg-[#0A0B0E] p-6 rounded-2xl border border-slate-800/80 shadow-2xl h-full flex flex-col">
                    <div className="flex flex-col gap-4 border-b border-slate-800/80 pb-5 mb-5">
                         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                             <div>
                                <h4 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                                    <Utensils size={16} className="text-emerald-500"/> Scheduled Feeds
                                </h4>
                                <p className="text-[10px] text-slate-500 mt-1 uppercase font-bold tracking-widest">{filteredTasks.length} {viewScope} feeds found</p>
                             </div>
                             
                             <div className="flex flex-wrap items-center gap-3">
                                 {/* Scope Toggle */}
                                 <div className="bg-[#0F1117] p-1.5 rounded-xl flex border border-slate-800/80 shadow-inner">
                                     <button onClick={() => setViewScope('upcoming')} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${viewScope === 'upcoming' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-500 hover:text-white hover:bg-slate-800/50'}`}>Upcoming</button>
                                     <button onClick={() => setViewScope('history')} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5 ${viewScope === 'history' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-500 hover:text-white hover:bg-slate-800/50'}`}><History size={12}/> History</button>
                                 </div>
                                 
                                 {viewScope === 'history' && (
                                     <input 
                                        type="date" 
                                        value={viewDate} 
                                        onChange={(e) => setViewDate(e.target.value)}
                                        className="px-3 py-2 bg-[#0F1117] border border-slate-800/80 rounded-xl text-[10px] font-black text-white uppercase focus:border-emerald-500/50 outline-none shadow-inner"
                                     />
                                 )}

                                 {/* Layout Toggle */}
                                 <div className="bg-[#0F1117] p-1.5 rounded-xl flex border border-slate-800/80 shadow-inner hidden sm:flex">
                                     <button onClick={() => setViewLayout('timeline')} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${viewLayout === 'timeline' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-500 hover:text-white hover:bg-slate-800/50'}`}>Timeline</button>
                                     <button onClick={() => setViewLayout('animal')} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${viewLayout === 'animal' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-500 hover:text-white hover:bg-slate-800/50'}`}>By Animal</button>
                                 </div>
                             </div>
                         </div>

                         {/* Filter */}
                         <div className="flex items-center gap-3 bg-[#0F1117] p-2.5 rounded-xl border border-slate-800/80 w-full shadow-inner">
                             <Filter size={16} className="text-slate-500 ml-2" />
                             <select 
                                value={viewFilterAnimalId} 
                                onChange={(e) => setViewFilterAnimalId(e.target.value)}
                                className="bg-transparent text-xs font-black text-white uppercase tracking-widest border-none focus:ring-0 cursor-pointer w-full outline-none"
                             >
                                 <option value="ALL">All Animals Filter</option>
                                 {animals.filter(a => !a.archived).map(a => <option key={a.id} value={a.id}>{a.name} ({a.species})</option>)}
                             </select>
                         </div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 min-h-[400px]">
                        {filteredTasks.length > 0 ? (
                            viewLayout === 'timeline' ? (
                                <div className="space-y-3">
                                    {filteredTasks.map(task => {
                                        const animal = animals.find(a => a.id === (task.animalId));
                                        if (!animal) return null;
                                        
                                        const dateObj = new Date(task.dueDate as string);
                                        const isToday = (task.dueDate) === getUKLocalDate();

                                        return (
                                            <div key={task.id} className={`flex items-center bg-[#0F1117] border border-slate-800/80 rounded-xl p-3 hover:border-slate-600 transition-all group shadow-sm ${task.completed ? 'opacity-40 grayscale' : ''}`}>
                                                <div className={`w-12 h-12 rounded-lg flex flex-col items-center justify-center mr-4 border ${isToday ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-[#0A0B0E] border-slate-800 text-slate-400'}`}>
                                                    <span className="text-[9px] uppercase font-black tracking-widest">{dateObj.toLocaleString('default', {month: 'short'})}</span>
                                                    <span className="text-sm font-black leading-none my-0.5">{dateObj.getDate()}</span>
                                                </div>
                                                
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h3 className="text-sm font-black text-white uppercase tracking-tight truncate">{animal.name}</h3>
                                                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest bg-[#0A0B0E] border border-slate-800 px-2 py-0.5 rounded-md">{animal.category}</span>
                                                    </div>
                                                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest truncate">{task.notes}</p>
                                                </div>

                                                <button 
                                                    onClick={() => deleteTask(task.id)}
                                                    className="p-2.5 text-slate-600 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100 ml-2"
                                                    title="Delete Schedule Item"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        )
                                    })}
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {animalGroups.map(({ animal, tasks }) => (
                                        <div key={animal.id} className="bg-[#0F1117] border border-slate-800/80 rounded-xl p-4 hover:border-emerald-500/30 transition-all shadow-sm">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-[#0A0B0E] border border-slate-800 text-slate-400 flex items-center justify-center font-black text-sm uppercase">
                                                        {animal.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <h3 className="text-sm font-black text-white uppercase tracking-tight">{animal.name}</h3>
                                                        <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">{tasks.length} {viewScope} entries</p>
                                                    </div>
                                                </div>
                                                <button 
                                                    onClick={() => handleQuickExtend(animal.id)}
                                                    className="bg-[#0A0B0E] border border-slate-800 text-slate-400 hover:border-emerald-500/50 hover:text-emerald-400 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors flex items-center gap-1.5"
                                                    title="Extend Schedule"
                                                >
                                                    <Copy size={12}/> Extend
                                                </button>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="bg-[#0A0B0E] p-2.5 rounded-lg border border-slate-800/80 flex items-center justify-between shadow-inner">
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Range</span>
                                                    <div className="text-[10px] font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-widest">
                                                        {new Date(tasks[0].dueDate as string).toLocaleDateString()} 
                                                        <ArrowRight size={10} className="text-slate-600"/> 
                                                        {new Date(tasks[tasks.length - 1].dueDate as string).toLocaleDateString()}
                                                    </div>
                                                </div>
                                                <div className="bg-[#0A0B0E] p-2.5 rounded-lg border border-slate-800/80 shadow-inner">
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 block mb-1">Diet Info</span>
                                                    <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest truncate" title={tasks[0].notes}>{tasks[0].notes || 'See details'}</div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )
                        ) : (
                            <div className="flex flex-col items-center justify-center h-64 text-slate-600">
                                <Calendar size={40} className="mb-4 opacity-20" />
                                <p className="text-sm font-black uppercase tracking-widest text-slate-400">No {viewScope} feeds found</p>
                                <p className="text-[10px] font-bold text-slate-600 mt-1 uppercase tracking-widest">Use the creation tool to add new feeds</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default FeedingSchedule;