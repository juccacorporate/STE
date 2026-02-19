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
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTab, setActiveTab] = useState<'KANBAN' | 'DATABASE'>('KANBAN');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [lang, setLang] = useState<Language>('PT');
  const t = translations[lang];

  // BUSCAR DADOS
  useEffect(() => {
    if (isAuthenticated) {
      fetch(API_URL).then(res => res.json()).then(data => {
        setTasks(data.map((item: any) => ({
          ...item,
          id: String(item.id),
          progress: Number(item.progress) || 0,
          escalation: item.escalation || '',
          actionSteps: item.actionSteps || '',
          scenarioSummary: item.scenarioSummary || '',
          timeline: item.timeline || ''
        })));
      });
    }
  }, [isAuthenticated]);

  // FILTROS
  const [filters, setFilters] = useState<FilterState & { status: Status | 'Todos' | 'Ativos' }>({
    region: 'Todos', priority: 'Todos', owner: 'Todos', delayed: 'Todos', status: 'Todos'
  });

  const filteredTasks = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return tasks.filter(task => {
      let isLate = false;
      if (task.dueDate && task.status !== Status.CONCLUIDO) {
        const parts = task.dueDate.split('-');
        const taskDate = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        isLate = taskDate < today;
      }
      const matchRegion = filters.region === 'Todos' || task.region === filters.region;
      const matchPriority = filters.priority === 'Todos' || task.priority === filters.priority;
      const matchOwner = filters.owner === 'Todos' || task.owner === filters.owner || task.support === filters.owner;
      let matchStatus = filters.status === 'Todos' ? true : filters.status === 'Ativos' ? (task.status === Status.EM_ANDAMENTO || task.status === Status.NAO_INICIADO) : task.status === filters.status;
      const matchDelayed = filters.delayed === 'Todos' || (filters.delayed === false && isLate) || (filters.delayed === true && !isLate);
      return matchRegion && matchPriority && matchOwner && matchStatus && matchDelayed;
    });
  }, [tasks, filters]);

  // SALVAR (MAPEAMENTO EXPLÍCITO PARA A PLANILHA)
  const handleSaveTask = async (taskData: Task) => {
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
      escalation: taskData.escalation || '',
      actionSteps: taskData.actionSteps || '',
      scenarioSummary: taskData.scenarioSummary || '',
      timeline: taskData.timeline || ''
    };

    if (editingTask) {
      await fetch(`${API_URL}/id/${editingTask.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: payload })
      });
      setTasks(prev => prev.map(t => t.id === editingTask.id ? (payload as Task) : t));
    } else {
      await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: [payload] })
      });
      setTasks(prev => [...prev, payload as Task]);
    }
    setIsModalOpen(false);
    setEditingTask(null);
  };

  const handleDeleteTask = async (id: string) => {
    await fetch(`${API_URL}/id/${id}`, { method: 'DELETE' });
    setTasks(prev => prev.filter(task => task.id !== id));
  };

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-indigo-950 px-4 text-center">
        <div className="w-full max-w-md">
          <div className="mb-12">
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-indigo-600 text-white shadow-2xl mb-6"><i className="fas fa-shield-halved text-3xl"></i></div>
            <h1 className="text-3xl font-black text-white">CONVERGÊNCIA</h1>
            <p className="text-[10px] font-bold uppercase text-indigo-400 tracking-[0.3em]">Customer Care Secure Hub</p>
          </div>
          <div className="rounded-[2.5rem] border border-white/10 bg-white/5 p-10 backdrop-blur-xl">
            <input type="password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} placeholder="Senha" className="w-full rounded-2xl p-4 text-center bg-white/10 text-white outline-none mb-4" />
            <button onClick={() => passwordInput === 'Stellantis2026!' && setIsAuthenticated(true)} className="w-full rounded-2xl bg-indigo-600 py-4 font-black text-white uppercase text-xs">Acessar</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#FDFDFF]">
      <header className="bg-white border-b p-4 flex justify-between items-center sticky top-0 z-30">
        <div className="flex items-center gap-6">
          <div className="bg-indigo-900 text-white p-3 rounded-2xl flex items-center gap-3"><i className="fas fa-chart-line text-2xl"></i><h1 className="text-lg font-black leading-none">CONVERGÊNCIA</h1></div>
          <nav className="flex gap-1 bg-gray-50 p-1.5 rounded-2xl border">
            <button onClick={() => setActiveTab('KANBAN')} className={`px-8 py-2 rounded-xl text-xs font-black uppercase ${activeTab === 'KANBAN' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-400'}`}>{t.kanban}</button>
            <button onClick={() => setActiveTab('DATABASE')} className={`px-8 py-2 rounded-xl text-xs font-black uppercase ${activeTab === 'DATABASE' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-400'}`}>{t.database}</button>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => setLang('PT')} className={`px-4 py-1.5 rounded-lg text-[10px] font-black ${lang === 'PT' ? 'bg-indigo-600 text-white' : 'text-gray-400'}`}>PORTUGUÊS</button>
          <button onClick={() => setLang('ES')} className={`px-4 py-1.5 rounded-lg text-[10px] font-black ${lang === 'ES' ? 'bg-indigo-600 text-white' : 'text-gray-400'}`}>ESPAÑOL</button>
          <button onClick={() => setIsAuthenticated(false)} className="text-red-600 font-black text-[10px] bg-red-50 px-4 py-2 rounded-xl">SAIR</button>
        </div>
      </header>
      <main className="flex-1 w-full pt-4">
        {activeTab === 'KANBAN' ? <Dashboard tasks={filteredTasks} onEditTask={(t) => {setEditingTask(t); setIsModalOpen(true);}} onDeleteTask={handleDeleteTask} lang={lang} /> : <Database tasks={filteredTasks} onEditTask={(t) => {setEditingTask(t); setIsModalOpen(true);}} onDeleteTask={handleDeleteTask} onAddTask={() => {setEditingTask(null); setIsModalOpen(true);}} lang={lang} />}
      </main>
      <TaskModal isOpen={isModalOpen || !!editingTask} task={editingTask} onClose={() => {setIsModalOpen(false); setEditingTask(null);}} onSave={handleSaveTask} onDelete={handleDeleteTask} lang={lang} />
    </div>
  );
};

export default App;
