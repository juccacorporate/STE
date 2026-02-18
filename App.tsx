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

  // BUSCAR DADOS
  useEffect(() => {
    if (isAuthenticated) {
      fetch(API_URL)
        .then(res => res.json())
        .then(data => {
          const formatData = data.map((item: any) => ({
            ...item,
            id: String(item.id),
            progress: Number(item.progress) || 0
          }));
          setTasks(formatData);
        })
        .catch(err => console.error("Erro ao carregar:", err));
    }
  }, [isAuthenticated]);

  const [filters, setFilters] = useState<FilterState & { status: Status | 'Todos' | 'Ativos' }>({
    region: 'Todos',
    priority: 'Todos',
    owner: 'Todos',
    delayed: 'Todos',
    status: 'Todos'
  });

  // --- LÓGICA DE FILTRO CORRIGIDA PARA DATAS ---
  const filteredTasks = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return tasks.filter(task => {
      // 1. Converte a data da planilha (DD/MM/AAAA) para uma data que o código entenda
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
      
      let matchStatus = false;
      if (filters.status === 'Todos') {
        matchStatus = true;
      } else if (filters.status === 'Ativos') {
        matchStatus = task.status === Status.EM_ANDAMENTO || task.status === Status.NAO_INICIADO;
      } else {
        matchStatus = task.status === filters.status;
      }

      // Filtro de Atrasados: Se o usuário marcou "Atrasados", mostra só quem isLate é true
      const matchDelayed = filters.delayed === 'Todos' || 
                           (filters.delayed === false && isLate) || 
                           (filters.delayed === true && !isLate);
      
      return matchRegion && matchPriority && matchOwner && matchStatus && matchDelayed;
    });
  }, [tasks, filters]);

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (passwordInput === 'Stellantis2026!') {
      setIsAuthenticated(true);
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

  const handleDeleteTask = async (id: string) => {
    await fetch(`${API_URL}/id/${id}`, { method: 'DELETE' });
    setTasks(prev => prev.filter(task => task.id !== id));
  };

  const handleSaveTask = async (taskData: Task) => {
    if (editingTask) {
      await fetch(`${API_URL}/id/${editingTask.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: taskData })
      });
      setTasks(prev => prev.map(t => t.id === editingTask.id ? taskData : t));
    } else {
      const newTask = { ...taskData, id: Math.random().toString(36).substr(2, 9) };
      await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: [newTask] })
      });
      setTasks(prev => [...prev, newTask]);
    }
    setIsModalOpen(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-indigo-950 px-4">
        <div className="w-full max-w-md">
          <div className="rounded-[2.5rem] border border-white/10 bg-white/5 p-10 backdrop-blur-xl shadow-2xl">
            <form onSubmit={handleLogin} className="space-y-6">
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Senha de Acesso"
                className="w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-center text-white outline-none"
                autoFocus
              />
              <button type="submit" className="w-full rounded-2xl bg-indigo-600 py-4 font-black text-white uppercase text-xs">Acessar Hub</button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#FDFDFF]">
      <header className="bg-white border-b border-gray-100 p-4 sticky top-0 z-30 shadow-sm">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-6">
            <h1 className="text-lg font-black tracking-tight leading-none text-indigo-900">CONVERGÊNCIA</h1>
            <nav className="flex gap-1 bg-gray-50 p-1.5 rounded-2xl">
              <button onClick={() => setActiveTab('KANBAN')} className={`px-8 py-2 rounded-xl text-xs font-black uppercase ${activeTab === 'KANBAN' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-400'}`}>{t.kanban}</button>
              <button onClick={() => setActiveTab('DATABASE')} className={`px-8 py-2 rounded-xl text-xs font-black uppercase ${activeTab === 'DATABASE' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-400'}`}>{t.database}</button>
            </nav>
          </div>
          <div className="flex items-center gap-6">
             <button onClick={() => setLang('PT')} className={`px-4 py-1.5 rounded-lg text-[10px] font-black ${lang === 'PT' ? 'bg-indigo-600 text-white' : 'text-gray-400'}`}>PT</button>
             <button onClick={() => setLang('ES')} className={`px-4 py-1.5 rounded-lg text-[10px] font-black ${lang === 'ES' ? 'bg-indigo-600 text-white' : 'text-gray-400'}`}>ES</button>
             <button onClick={() => setIsAuthenticated(false)} className="text-red-600 font-black text-[10px] bg-red-50 px-4 py-2 rounded-xl">SAIR</button>
          </div>
        </div>
        
        {/* Filtros */}
        <div className="max-w-[1600px] mx-auto mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 bg-gray-50/50 p-4 rounded-2xl">
          <select value={filters.region} onChange={(e) => setFilters(f => ({ ...f, region: e.target.value as any }))} className="text-[11px] p-2.5 rounded-xl border-gray-200">
            <option value="Todos">{t.region}: {t.all}</option>
            {Object.values(Region).map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <select value={filters.priority} onChange={(e) => setFilters(f => ({ ...f, priority: e.target.value as any }))} className="text-[11px] p-2.5 rounded-xl border-gray-200">
            <option value="Todos">{t.priority}: {t.all}</option>
            {Object.entries(t.priorities).map(([key, val]) => <option key={key} value={key}>{val}</option>)}
          </select>
          <select value={filters.owner} onChange={(e) => setFilters(f => ({ ...f, owner: e.target.value as any }))} className="text-[11px] p-2.5 rounded-xl border-gray-200">
            <option value="Todos">{t.owner}: {t.all}</option>
            {ownersList.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
          <select 
            value={String(filters.delayed)} 
            onChange={(e) => {
              const val = e.target.value;
              setFilters(f => ({ ...f, delayed: val === 'Todos' ? 'Todos' : val === 'true' }))
            }} 
            className="text-[11px] p-2.5 rounded-xl border-gray-200"
          >
            <option value="Todos">Prazo: {t.all}</option>
            <option value="true">No Prazo</option>
            <option value="false">Atrasados</option>
          </select>
          <select value={filters.status} onChange={(e) => setFilters(f => ({ ...f, status: e.target.value as any }))} className="text-[11px] p-2.5 rounded-xl border-gray-200">
            <option value="Todos">Status: {t.all}</option>
            {Object.entries(t.statuses).map(([key, val]) => <option key={key} value={key}>{val}</option>)}
          </select>
          <button onClick={() => setFilters({region:'Todos', priority:'Todos', owner:'Todos', delayed:'Todos', status:'Todos'})} className="text-[10px] font-black text-indigo-600 uppercase">Limpar</button>
        </div>
      </header>

      <main className="flex-1 max-w-[1600px] mx-auto w-full pt-4">
        {activeTab === 'KANBAN' ? (
          <Dashboard tasks={filteredTasks} onEditTask={setEditingTask} onDeleteTask={handleDeleteTask} lang={lang} />
        ) : (
          <Database tasks={filteredTasks} onEditTask={setEditingTask} onDeleteTask={handleDeleteTask} onAddTask={() => {setEditingTask(null); setIsModalOpen(true);}} lang={lang} />
        )}
      </main>

      <TaskModal isOpen={isModalOpen || !!editingTask} task={editingTask} onClose={() => {setIsModalOpen(false); setEditingTask(null);}} onSave={handleSaveTask} onDelete={handleDeleteTask} lang={lang} />
    </div>
  );
};

export default App;
