
import React, { useState, useMemo, useEffect } from 'react';
import { Task, Region, Category, Priority, Status, FilterState, Language } from './types';
import { INITIAL_TASKS } from './data';
import { translations } from './i18n';
import Dashboard from './components/Dashboard';
import Database from './components/Database';
import TaskModal from './components/TaskModal';

type AppFilterState = Omit<FilterState, 'status'> & {
  status: Status | 'Todos' | 'Ativos';
};

const ACCESS_PASSWORD = 'Convergence2026!';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [loginError, setLoginError] = useState<boolean>(false);
  
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [activeTab, setActiveTab] = useState<'KANBAN' | 'DATABASE'>('KANBAN');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [lang, setLang] = useState<Language>('PT');

  const t = translations[lang];

  useEffect(() => {
    const authStatus = sessionStorage.getItem('convergencia_auth');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === ACCESS_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem('convergencia_auth', 'true');
      setLoginError(false);
    } else {
      setLoginError(true);
      setPasswordInput('');
    }
  };

  const [filters, setFilters] = useState<AppFilterState>({
    region: 'Todos',
    priority: 'Todos',
    owner: 'Todos',
    delayed: 'Todos',
    status: 'Todos'
  });

  const ownersList = useMemo(() => {
    const allPeople = new Set<string>();
    tasks.forEach(t => {
      if (t.owner) allPeople.add(t.owner);
      if (t.support) allPeople.add(t.support);
    });
    return ['Todos', ...Array.from(allPeople).sort()];
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchRegion = filters.region === 'Todos' || task.region === filters.region;
      const matchPriority = filters.priority === 'Todos' || task.priority === filters.priority;
      const matchOwner = filters.owner === 'Todos' || task.owner === filters.owner || task.support === filters.owner;
      
      let matchStatus = false;
      if (filters.status === 'Todos') {
        matchStatus = true;
      } else if (filters.status === 'Ativos') {
        matchStatus = task.status === Status.EM_ANDAMENTO || task.status === Status.NAO_INICIADO;
      } else {
        matchStatus = task.status === filters.status;
      }

      const matchDelayed = filters.delayed === 'Todos' || 
                           (filters.delayed === true && task.escalation === '') || 
                           (filters.delayed === false && task.escalation !== '');
      
      return matchRegion && matchPriority && matchOwner && matchStatus && matchDelayed;
    });
  }, [tasks, filters]);

  const handleAddTask = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleSaveTask = (taskData: Task) => {
    if (editingTask) {
      setTasks(prev => prev.map(t => t.id === editingTask.id ? taskData : t));
    } else {
      const newTask = { ...taskData, id: Math.random().toString(36).substr(2, 9) };
      setTasks(prev => [...prev, newTask]);
    }
    setIsModalOpen(false);
  };

  const resetFilters = () => {
    setFilters({
      region: 'Todos',
      priority: 'Todos',
      owner: 'Todos',
      delayed: 'Todos',
      status: 'Todos'
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-6 font-sans">
        <div className="absolute top-10 right-10">
          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
             <button onClick={() => setLang('PT')} className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${lang === 'PT' ? 'bg-white text-indigo-900' : 'text-gray-500'}`}>PT</button>
             <button onClick={() => setLang('ES')} className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${lang === 'ES' ? 'bg-white text-indigo-900' : 'text-gray-500'}`}>ES</button>
          </div>
        </div>

        <div className="w-full max-w-md animate-in fade-in zoom-in duration-500">
          <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden p-10 flex flex-col items-center">
            <div className="bg-gradient-to-br from-indigo-900 to-indigo-700 text-white p-5 rounded-3xl mb-8 shadow-xl">
              <i className="fas fa-chart-line text-4xl"></i>
            </div>
            
            <h1 className="text-2xl font-black text-indigo-950 tracking-tighter text-center leading-none">CONVERGÊNCIA</h1>
            <p className="text-[10px] uppercase font-bold tracking-[0.3em] text-indigo-400 mt-2 mb-10 opacity-70">Customer Care Hub</p>

            <div className="w-full space-y-2 text-center mb-8">
              <h2 className="text-gray-900 font-black text-sm uppercase tracking-widest">{t.loginTitle}</h2>
              <p className="text-gray-400 text-[11px] font-medium leading-relaxed">{t.loginSubtitle}</p>
            </div>

            <form onSubmit={handleLogin} className="w-full space-y-4">
              <div className="relative group">
                <i className="fas fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-500 transition-colors"></i>
                <input 
                  type="password" 
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder={t.loginPlaceholder}
                  className={`w-full bg-gray-50 border-2 ${loginError ? 'border-red-200 focus:border-red-500' : 'border-gray-100 focus:border-indigo-500'} rounded-2xl py-4 pl-12 pr-4 text-sm outline-none transition-all font-bold placeholder:font-medium placeholder:text-gray-300`}
                  autoFocus
                />
              </div>

              {loginError && (
                <p className="text-red-500 text-[10px] font-black text-center animate-bounce">
                  {t.loginError}
                </p>
              )}

              <button 
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs py-5 rounded-2xl transition-all shadow-xl shadow-indigo-100 uppercase tracking-widest active:scale-95"
              >
                {t.loginButton}
              </button>
            </form>
          </div>
          <p className="text-center text-gray-500 text-[9px] font-bold uppercase tracking-[0.2em] mt-10 opacity-50">
            LatAm Digital Infrastructure © 2026
          </p>
        </div>
      </div>
    );
  }

  const filterSelectClass = "text-[11px] border border-gray-200 rounded-xl p-2.5 bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm font-bold appearance-none";

  return (
    <div className="flex flex-col min-h-screen bg-[#FDFDFF]">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 p-4 sticky top-0 z-30 shadow-sm">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-6">
            <div className="bg-gradient-to-br from-indigo-900 to-indigo-800 text-white p-3 rounded-2xl flex items-center gap-3 shadow-lg cursor-pointer" onClick={() => { sessionStorage.clear(); window.location.reload(); }}>
              <i className="fas fa-chart-line text-2xl"></i>
              <div>
                <h1 className="text-lg font-black tracking-tight leading-none">CONVERGÊNCIA</h1>
                <p className="text-[9px] uppercase font-bold tracking-[0.2em] text-indigo-300 opacity-80">Customer Care Hub</p>
              </div>
            </div>
            
            <nav className="flex gap-1 bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
              <button 
                onClick={() => setActiveTab('KANBAN')}
                className={`px-8 py-2 rounded-xl text-xs font-black uppercase transition-all tracking-widest ${activeTab === 'KANBAN' ? 'bg-white text-indigo-700 shadow-sm border border-gray-100' : 'text-gray-400 hover:text-gray-600'}`}
              >
                {t.kanban}
              </button>
              <button 
                onClick={() => setActiveTab('DATABASE')}
                className={`px-8 py-2 rounded-xl text-xs font-black uppercase transition-all tracking-widest ${activeTab === 'DATABASE' ? 'bg-white text-indigo-700 shadow-sm border border-gray-100' : 'text-gray-400 hover:text-gray-600'}`}
              >
                {t.database}
              </button>
            </nav>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl border border-gray-200">
               <button onClick={() => setLang('PT')} className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${lang === 'PT' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400'}`}>PORTUGUÊS</button>
               <button onClick={() => setLang('ES')} className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${lang === 'ES' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400'}`}>ESPAÑOL</button>
            </div>

            <div className="h-8 border-l border-gray-100 hidden md:block"></div>
            
            <button 
              onClick={() => { sessionStorage.clear(); window.location.reload(); }}
              className="flex items-center gap-2 text-indigo-900 font-black text-[10px] tracking-widest opacity-40 hover:opacity-100 transition-opacity"
            >
              <i className="fas fa-sign-out-alt text-lg"></i>
              <span>LOGOUT</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="max-w-[1600px] mx-auto mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-1">{t.region}</label>
            <select value={filters.region} onChange={(e) => setFilters(f => ({ ...f, region: e.target.value as any }))} className={filterSelectClass}>
              <option value="Todos">{t.all}</option>
              {Object.values(Region).map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-1">{t.priority}</label>
            <select value={filters.priority} onChange={(e) => setFilters(f => ({ ...f, priority: e.target.value as any }))} className={filterSelectClass}>
              <option value="Todos">{t.all}</option>
              {Object.entries(t.priorities).map(([key, val]) => <option key={key} value={key}>{val}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-1">{t.owner}</label>
            <select value={filters.owner} onChange={(e) => setFilters(f => ({ ...f, owner: e.target.value as any }))} className={filterSelectClass}>
              {ownersList.map(o => <option key={o} value={o}>{o === 'Todos' ? t.all : o}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-1">{t.onTime}</label>
            <select value={String(filters.delayed)} onChange={(e) => { const val = e.target.value; setFilters(f => ({ ...f, delayed: val === 'Todos' ? 'Todos' : val === 'true' })) }} className={filterSelectClass}>
              <option value="Todos">{t.all}</option>
              <option value="true">{t.onTimeLabel}</option>
              <option value="false">{t.delayedLabel}</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-1">{t.status}</label>
            <select value={filters.status} onChange={(e) => setFilters(f => ({ ...f, status: e.target.value as any }))} className={filterSelectClass}>
              <option value="Todos">{t.all}</option>
              <option value="Ativos" className="bg-indigo-50 font-black">{t.activeStatus}</option>
              {Object.entries(t.statuses).map(([key, val]) => <option key={key} value={key}>{val}</option>)}
            </select>
          </div>

          <div className="flex items-end">
            <button onClick={resetFilters} className="w-full text-[10px] font-black text-indigo-600 uppercase hover:bg-white p-2.5 rounded-xl transition-all border border-transparent hover:border-gray-200 hover:shadow-sm">
              {t.clearFilters}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-[1600px] mx-auto w-full pt-4 pb-12">
        {activeTab === 'KANBAN' ? (
          <Dashboard tasks={filteredTasks} onEditTask={handleEditTask} lang={lang} />
        ) : (
          <Database tasks={filteredTasks} onEditTask={handleEditTask} onAddTask={handleAddTask} lang={lang} />
        )}
      </main>

      <footer className="bg-white border-t border-gray-100 p-4 text-[10px] flex justify-between items-center px-10 mt-auto">
        <div className="flex gap-8">
          <div className="flex items-center gap-2 group">
            <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
            <span className="text-gray-500 uppercase tracking-widest font-black">{t.total}: {filteredTasks.length}</span>
          </div>
          <div className="flex items-center gap-2 group">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            <span className="text-emerald-600 uppercase tracking-widest font-black">{t.completed}: {filteredTasks.filter(t => t.status === Status.CONCLUIDO).length}</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-black tracking-widest uppercase text-gray-300">{t.environment} © 2026</span>
          <div className="h-4 w-px bg-gray-100"></div>
          <i className="fas fa-shield-alt text-indigo-100"></i>
        </div>
      </footer>

      <TaskModal isOpen={isModalOpen} task={editingTask} onClose={() => setIsModalOpen(false)} onSave={handleSaveTask} lang={lang} />
    </div>
  );
};

export default App;
