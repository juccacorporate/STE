import React, { useState, useMemo, useEffect } from 'react';
import { Task, Region, Category, Priority, Status, FilterState, Language } from './types.ts';
import { translations } from './i18n.ts';
import Dashboard from './components/Dashboard.tsx';
import Database from './components/Database.tsx';
import TaskModal from './components/TaskModal.tsx';

// CONFIGURAÇÃO DA API
const API_URL = "https://sheetdb.io/api/v1/qfvxr8lu43heq";

const App: React.FC = () => {
  // --- Estados de Segurança ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState(false);

  // --- Estados da Aplicação ---
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTab, setActiveTab] = useState<'KANBAN' | 'DATABASE'>('KANBAN');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [lang, setLang] = useState<Language>('PT');

  const t = translations[lang];

  // --- BUSCAR DADOS DA PLANILHA (COM CORREÇÃO DE DATA) ---
  useEffect(() => {
    if (isAuthenticated) {
      fetch(API_URL)
        .then(res => res.json())
        .then(data => {
          // Garante que as datas sejam lidas corretamente pelo site
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

  // --- EXCLUIR DA PLANILHA ---
  const handleDeleteTask = async (id: string) => {
    await fetch(`${API_URL}/id/${id}`, { method: 'DELETE' });
    setTasks(prev => prev.filter(task => task.id !== id));
    if (isModalOpen) setIsModalOpen(false);
  };

  // --- SALVAR OU EDITAR NA PLANILHA ---
  const handleSaveTask = async (taskData: Task) => {
    // Formata os dados para o Google Sheets não se perder
    const payload = {
      ...taskData,
      startDate: taskData.startDate ? String(taskData.startDate) : '',
      dueDate: taskData.dueDate ? String(taskData.dueDate) : ''
    };

    if (editingTask) {
      await fetch(`${API_URL}/id/${editingTask.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: payload })
      });
      setTasks(prev => prev.map(t => t.id === editingTask.id ? payload : t));
    } else {
      const newTask = { ...payload, id: Math.random().toString(36).substr(2, 9) };
      await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: [newTask] })
      });
      setTasks(prev => [...prev, newTask]);
    }
    setIsModalOpen(false);
  };

  const resetFilters = () => {
    setFilters({ region: 'Todos', priority: 'Todos', owner: 'Todos', delayed: 'Todos', status: 'Todos' });
  };

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-indigo-950 px-4">
        <div className="w-full max-w-md">
          <div className="mb-12 text-center">
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-indigo-600 text-white shadow-2xl shadow-indigo-500/20 mb-6">
              <i className="fas fa-shield-halved text-3xl"></i>
            </div>
            <h1 className="text-3xl font-black tracking-tighter text-white">CONVERGÊNCIA</h1>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-indigo-400 opacity-60">Customer Care Secure Hub</p>
          </div>
          <div className="rounded-[2.5rem] border border-white/10 bg-white/5 p-10 backdrop-blur-xl shadow-2xl">
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="mb-2 block px-2 text-[10px] font-black uppercase tracking-widest text-indigo-300">Senha de Acesso</label>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="••••••••••••"
                  className={`w-full rounded-2xl border ${loginError ? 'border-red-500 bg-red-500/10' : 'border-white/10 bg-white/5'} p-4 text-center text-white outline-none transition-all focus:border-indigo-500`}
                  autoFocus
                />
              </div>
              {loginError && <p className="text-center text-[10px] font-black uppercase text-red-400 animate-bounce">Senha Incorreta</p>}
              <button type="submit" className="w-full rounded-2xl bg-indigo-600 py-4 font-black uppercase text-white hover:bg-indigo-500 transition-all text-xs">Acessar Hub</button>
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
            <div className="bg-gradient-to-br from-indigo-900 to-indigo-800 text-white p-3 rounded-2xl flex items-center gap-3">
              <i className="fas fa-chart-line text-2xl"></i>
              <div>
                <h1 className="text-lg font-black tracking-tight leading-none">CONVERGÊNCIA</h1>
                <p className="text-[9px] uppercase font-bold tracking-[0.2em] text-indigo-300">Customer Care Hub</p>
              </div>
            </div>
            <nav className="flex gap-1 bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
              <button onClick={() => setActiveTab('KANBAN')} className={`px-8 py-2 rounded-xl text-xs font-black uppercase transition-all ${activeTab === 'KANBAN' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-400'}`}>{t.kanban}</button>
              <button onClick={() => setActiveTab('DATABASE')} className={`px-8 py-2 rounded-xl text-xs font-black uppercase transition-all ${activeTab === 'DATABASE' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-400'}`}>{t.database}</button>
            </nav>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
               <button onClick={() => setLang('PT')} className={`px-4 py-1.5 rounded-lg text-[10px] font-black ${lang === 'PT' ? 'bg-white text-indigo-600' : 'text-gray-400'}`}>PT</button>
               <button onClick={() => setLang('ES')} className={`px-4 py-1.5 rounded-lg text-[10px] font-black ${lang === 'ES' ? 'bg-white text-indigo-600' : 'text-gray-400'}`}>ES</button>
            </div>
            <button onClick={() => setIsAuthenticated(false)} className="text-red-600 font-black text-[10px] bg-red-50 px-4 py-2 rounded-xl border border-red-100">SAIR</button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-[1600px] mx-auto w-full pt-4 pb-12">
        {activeTab === 'KANBAN' ? (
          <Dashboard tasks={filteredTasks} onEditTask={handleEditTask} onDeleteTask={handleDeleteTask} lang={lang} />
        ) : (
          <Database tasks={filteredTasks} onEditTask={handleEditTask} onDeleteTask={handleDeleteTask} onAddTask={handleAddTask} lang={lang} />
        )}
      </main>

      <footer className="bg-white border-t border-gray-100 p-4 text-[10px] flex justify-between items-center px-10">
        <span className="text-gray-500 font-black uppercase">Total: {filteredTasks.length}</span>
        <span className="font-black text-gray-300">Stellantis © 2026</span>
      </footer>

      <TaskModal isOpen={isModalOpen} task={editingTask} onClose={() => setIsModalOpen(false)} onSave={handleSaveTask} onDelete={handleDeleteTask} lang={lang} />
    </div>
  );
};

export default App;
