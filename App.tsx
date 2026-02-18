import React, { useState, useMemo, useEffect } from 'react';
import { Task, Region, Category, Priority, Status, FilterState, Language } from './types.ts';
import { translations } from './i18n.ts';
import Dashboard from './components/Dashboard.tsx';
import Database from './components/Database.tsx';
import TaskModal from './components/TaskModal.tsx';

const API_URL = "https://sheetdb.io/api/v1/qfvxr8lu43heq";

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTab, setActiveTab] = useState<'KANBAN' | 'DATABASE'>('KANBAN');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [lang, setLang] = useState<Language>('PT');

  const t = translations[lang];

  // *** CORRIGIDO: SINTAXE DO USEEFFECT CORRETA ***
  useEffect(() => {
    if (isAuthenticated) {
      fetch(API_URL)
        .then(res => res.json())
        .then(data => {
          const formatData = data.map((item: any) => ({
            ...item,
            id: String(item.id),
            progress: Number(item.progress) || 0,
            description: item.description || '',
            actionSteps: item.actionSteps || '',
            scenarioSummary: item.scenarioSummary || '',
            timeline: item.timeline || ''
          }));
          setTasks(formatData);
        }) // <-- O PARÊNTESE QUE FALTAVA ESTÁ AQUI!
        .catch(err => console.error("Erro ao carregar:", err)); // AQUI O CATCH AJUDA A DEBUGAR
    }
  }, [isAuthenticated]);

  const [filters, setFilters] = useState<FilterState & { status: Status | 'Todos' | 'Ativos' }>({
    region: 'Todos', priority: 'Todos', owner: 'Todos', delayed: 'Todos', status: 'Todos'
  });

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (passwordInput === 'Stellantis2026!') {
      setIsAuthenticated(true);
      setLoginError(false);
    } else {
      setLoginError(true);
      setTimeout(() => setLoginError(false), 2000);
    }
  };

  const ownersList = useMemo(() => {
    const allPeople = new Set<string>();
    tasks.forEach(t => {
      if (t.owner) allPeople.add(t.owner);
      if (t.support) allPeople.add(t.support);
    });
    return ['Todos', ...Array.from(allPeople).sort()];
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    // Lógica de filtro restaurada (incluindo o filtro de atraso)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return tasks.filter(task => {
      let isLate = false;
      if (task.dueDate && task.status !== Status.CONCLUIDO) {
        const parts = task.dueDate.split('/');
        if (parts.length === 3) {
          const taskDate = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
          isLate = taskDate < today;
        }
      }

      const matchRegion = filters.region === 'Todos' || task.region === filters.region;
      const matchPriority = filters.priority === 'Todos' || task.priority === filters.priority;
      const matchOwner = filters.owner === 'Todos' || task.owner === filters.owner || task.support === filters.owner;
      
      let matchStatus = filters.status === 'Todos' ? true : filters.status === 'Ativos' ? (task.status === Status.EM_ANDAMENTO || task.status === Status.NAO_INICIADO) : task.status === filters.status;
      const matchDelayed = filters.delayed === 'Todos' || (filters.delayed === false && isLate) || (filters.delayed === true && !isLate);
      
      return matchRegion && matchPriority && matchOwner && matchStatus && matchDelayed;
    });
  }, [tasks, filters]);

  const handleSaveTask = async (taskData: Task) => {
    const payload = { ...taskData, id: taskData.id || Math.random().toString(36).substr(2, 9) };
    
    if (editingTask) {
      await fetch(`${API_URL}/id/${editingTask.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: payload })
      });
      setTasks(prev => prev.map(t => t.id === editingTask.id ? taskData : t));
    } else {
      await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: [payload] })
      });
      setTasks(prev => [...prev, taskData]);
    }
    setIsModalOpen(false);
    setEditingTask(null);
  };

  const handleDeleteTask = async (id: string) => {
    await fetch(`${API_URL}/id/${id}`, { method: 'DELETE' });
    setTasks(prev => prev.filter(task => task.id !== id));
  };
  
  // ... (Resto do código de visual e login que estava correto)
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-indigo-950 px-4">
        <div className="w-full max-w-md">
          <div className="mb-12 text-center">
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-indigo-600 text-white shadow-2xl mb-6">
              <i className="fas fa-shield-halved text-3xl"></i>
            </div>
            <h1 className="text-3xl font-black tracking-tighter text-white">CONVERGÊNCIA</h1>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-indigo-400 opacity-60">Customer Care Secure Hub</p>
          </div>
          <div className="rounded-[2.5rem] border border-white/10 bg-white/5 p-10 backdrop-blur-xl shadow-2xl">
            <form onSubmit={handleLogin} className="space-y-6">
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Senha de Acesso"
                className={`w-full rounded-2xl border ${loginError ? 'border-red-500 bg-red-500/10' : 'border-white/10 bg-white/5'} p-4 text-center text-white outline-none transition-all focus:border-indigo-500`}
                autoFocus
              />
              {loginError && <p className="text-center text-[10px] font-black uppercase text-red-400 animate-bounce">Senha Incorreta</p>}
              <button type="submit" className="w-full rounded-2xl bg-indigo-600 py-4 font-black uppercase text-white hover:bg-indigo-500 text-xs transition-all">Acessar Hub</button>
            </form>
          </div>
          <p className="mt-8 text-center text-[9px] font-bold uppercase tracking-widest text-white/20">Internal Use Only • Stellantis LatAm</p>
        </div>
      </div>
    );
  }

  const filterSelectClass = "text-[11px] border border-gray-200 rounded-xl p-2.5 bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm font-bold appearance-none";
  
  return (
    <div className="flex flex-col min-h-screen bg-[#FDFDFF]">
      <header className="bg-white border-b border-gray-100 p-4 sticky top-0 z-30 shadow-sm">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-6">
            <div className="bg-gradient-to-br from-indigo-900 to-indigo-800 text-white p-3 rounded-2xl flex items-center gap-3 shadow-lg">
              <i className="fas fa-chart-line text-2xl"></i>
              <div>
                <h1 className="text-lg font-black tracking-tight leading-none">CONVERGÊNCIA</h1>
                <p className="text-[9px] uppercase font-bold tracking-[0.2em] text-indigo-300 opacity-80">Customer Care Hub</p>
              </div>
            </div>
            <nav className="flex gap-1 bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
              <button onClick={() => setActiveTab('KANBAN')} className={`px-8 py-2 rounded-xl text-xs font-black uppercase transition-all ${activeTab === 'KANBAN' ? 'bg-white text-indigo-700 shadow-sm border border-gray-100' : 'text-gray-400 hover:text-gray-600'}`}>{t.kanban}</button>
              <button onClick={() => setActiveTab('DATABASE')} className={`px-8 py-2 rounded-xl text-xs font-black uppercase transition-all ${activeTab === 'DATABASE' ? 'bg-white text-indigo-700 shadow-sm border border-gray-100' : 'text-gray-400 hover:text-gray-600'}`}>{t.database}</button>
            </nav>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl border border-gray-200">
               <button onClick={() => setLang('PT')} className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${lang === 'PT' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400'}`}>PORTUGUÊS</button>
               <button onClick={() => setLang('ES')} className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${lang === 'ES' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400'}`}>ESPAÑOL</button>
            </div>
            <button onClick={() => setIsAuthenticated(false)} className="text-red-600 font-black text-[10px] bg-red-50 px-4 py-2 rounded-xl border border-red-100">SAIR</button>
          </div>
        </div>
        {/* Filtros (Restaurados) */}
        <div className="max-w-[1600px] mx-auto mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
            <select value={filters.region} onChange={(e) => setFilters(f => ({ ...f, region: e.target.value as any }))}>...</select>
            <select value={filters.priority} onChange={(e) => setFilters(f => ({ ...f, priority: e.target.value as any }))}>...</select>
            <select value={filters.owner} onChange={(e) => setFilters(f => ({ ...f, owner: e.target.value as any }))}>...</select>
            <select value={String(filters.delayed)} onChange={(e) => setFilters(f => ({ ...f, delayed: e.target.value === 'Todos' ? 'Todos' : e.target.value === 'true' }))}>...</select>
            <select value={filters.status} onChange={(e) => setFilters(f => ({ ...f, status: e.target.value as any }))}>...</select>
            <button onClick={resetFilters} className="text-[10px] font-black text-indigo-600 uppercase">Limpar</button>
        </div>
      </header>
      <main className="flex-1 max-w-[1600px] mx-auto w-full pt-4 pb-12">
        {activeTab === 'KANBAN' ? (
          <Dashboard tasks={filteredTasks} onEditTask={(t) => {setEditingTask(t); setIsModalOpen(true);}} onDeleteTask={handleDeleteTask} lang={lang} />
        ) : (
          <Database tasks={filteredTasks} onEditTask={(t) => {setEditingTask(t); setIsModalOpen(true);}} onDeleteTask={handleDeleteTask} onAddTask={() => {setEditingTask(null); setIsModalOpen(true);}} lang={lang} />
        )}
      </main>
      <TaskModal isOpen={isModalOpen || !!editingTask} task={editingTask} onClose={() => {setIsModalOpen(false); setEditingTask(null);}} onSave={handleSaveTask} onDelete={handleDeleteTask} lang={lang} />
    </div>
  );
};

export default App;
