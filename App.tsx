import React, { useState, useMemo, useEffect } from 'react';
import { Task, Region, Category, Priority, Status, FilterState, Language } from './types.ts';
import { translations } from './i18n.ts';
import Dashboard from './components/Dashboard.tsx';
import Database from './components/Database.tsx';
import TaskModal from './components/TaskModal.tsx';

// SUA API DO SHEETDB
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

  // 1. BUSCAR DADOS (CARREGAMENTO)
  useEffect(() => {
    if (isAuthenticated) {
      fetch(API_URL)
        .then(res => res.json())
        .then(data => {
          const formatData = data.map((item: any) => ({
            ...item,
            id: String(item.id),
            progress: Number(item.progress) || 0,
            // Lendo exatamente os nomes das colunas da sua planilha
            description: item.description || '',
            actionSteps: item.actionSteps || '',
            scenarioSummary: item.scenarioSummary || '',
            timeline: item.timeline || ''
          }));
          setTasks(formatData);
        })
        .catch(err => console.error("Erro ao carregar:", err));
    }
  }, [isAuthenticated]);

  const [filters, setFilters] = useState<FilterState & { status: Status | 'Todos' | 'Ativos' }>({
    region: 'Todos', priority: 'Todos', owner: 'Todos', delayed: 'Todos', status: 'Todos'
  });

  const filteredTasks = useMemo(() => {
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

  const handleDeleteTask = async (id: string) => {
    await fetch(`${API_URL}/id/${id}`, { method: 'DELETE' });
    setTasks(prev => prev.filter(task => task.id !== id));
  };

  // 2. SALVAR DADOS (GRAVAÇÃO)
  const handleSaveTask = async (taskData: Task) => {
    // MAPEAMENTO IDÊNTICO AOS CABEÇALHOS DA PLANILHA
    const payload = {
      id: taskData.id || Math.random().toString(36).substr(2, 9),
      region: taskData.region,
      title: taskData.title,
      description: taskData.description || '',
      category: taskData.category,
      priority: taskData.priority,
      owner: taskData.owner,
      support: taskData.support,
      startDate: taskData.startDate,
      dueDate: taskData.dueDate,
      status: taskData.status,
      progress: taskData.progress,
      actionSteps: taskData.actionSteps || '', // Nome da coluna M
      scenarioSummary: taskData.scenarioSummary || '', // Nome da coluna N
      timeline: taskData.timeline || '' // Nome da coluna O
    };

    if (editingTask) {
      await fetch(`${API_URL}/id/${editingTask.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: payload })
      });
      setTasks(prev => prev.map(t => t.id === editingTask.id ? payload : t));
    } else {
      await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: [payload] })
      });
      setTasks(prev => [...prev, payload]);
    }
    setIsModalOpen(false);
    setEditingTask(null);
  };

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-indigo-950 px-4">
        <div className="w-full max-w-md">
          <div className="mb-12 text-center">
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-indigo-600 text-white shadow-2xl mb-6">
              <i className="fas fa-shield-halved text-3xl"></i>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter">CONVERGÊNCIA</h1>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-indigo-400 opacity-60">Customer Care Secure Hub</p>
          </div>
          <div className="rounded-[2.5rem] border border-white/10 bg-white/5 p-10 backdrop-blur-xl shadow-2xl">
            <form onSubmit={handleLogin} className="space-y-6">
              <input type="password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} placeholder="Senha de Acesso" className="w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-center text-white outline-none focus:border-indigo-500" autoFocus />
              <button type="submit" className="w-full rounded-2xl bg-indigo-600 py-4 font-black uppercase text-white hover:bg-indigo-500 transition-all text-xs">Acessar Hub</button>
            </form>
          </div>
          <p className="mt-8 text-center text-[9px] font-bold uppercase tracking-widest text-white/20">Internal Use Only • Stellantis LatAm</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#FDFDFF]">
      <header className="bg-white border-b border-gray-100 p-4 sticky top-0 z-30 shadow-sm">
        <div className="max-w-[1600px] mx-auto flex justify-between items-center gap-4">
          <div className="flex items-center gap-6">
            <div className="bg-indigo-900 text-white p-3 rounded-2xl flex items-center gap-3">
              <i className="fas fa-chart-line text-2xl"></i>
              <div>
                <h1 className="text-lg font-black leading-none">CONVERGÊNCIA</h1>
                <p className="text-[9px] uppercase font-bold text-indigo-300">Customer Care Hub</p>
              </div>
            </div>
            <nav className="flex gap-1 bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
              <button onClick={() => setActiveTab('KANBAN')} className={`px-8 py-2 rounded-xl text-xs font-black uppercase transition-all ${activeTab === 'KANBAN' ? 'bg-white text-indigo-700 shadow-sm border border-gray-100' : 'text-gray-400'}`}>{t.kanban}</button>
              <button onClick={() => setActiveTab('DATABASE')} className={`px-8 py-2 rounded-xl text-xs font-black uppercase transition-all ${activeTab === 'DATABASE' ? 'bg-white text-indigo-700 shadow-sm border border-gray-100' : 'text-gray-400'}`}>{t.database}</button>
            </nav>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
               <button onClick={() => setLang('PT')} className={`px-4 py-1.5 rounded-lg text-[10px] font-black ${lang === 'PT' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400'}`}>PT</button>
               <button onClick={() => setLang('ES')} className={`px-4 py-1.5 rounded-lg text-[10px] font-black ${lang === 'ES' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400'}`}>ES</button>
            </div>
            <button onClick={() => setIsAuthenticated(false)} className="text-red-600 font-black text-[10px] bg-red-50 px-4 py-2 rounded-xl border border-red-100">SAIR</button>
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-[1600px] mx-auto w-full pt-4 pb-12">
        {activeTab === 'KANBAN' ? (
          <Dashboard tasks={filteredTasks} onEditTask={(t) => {setEditingTask(t); setIsModalOpen(true);}} onDeleteTask={handleDeleteTask} lang={lang} />
        ) : (
          <Database tasks={filteredTasks} onEditTask={(t) => {setEditingTask(t); setIsModalOpen(true);}} onDeleteTask={handleDeleteTask} onAddTask={() => {setEditingTask(null); setIsModalOpen(true);}} lang={lang} />
        )}
      </main>
      <TaskModal isOpen={isModalOpen} task={editingTask} onClose={() => {setIsModalOpen(false); setEditingTask(null);}} onSave={handleSaveTask} onDelete={handleDeleteTask} lang={lang} />
    </div>
  );
};

export default App;
