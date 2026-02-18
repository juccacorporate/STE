import React, { useState, useMemo, useEffect } from 'react';
import { Task, Region, Category, Priority, Status, FilterState, Language } from './types.ts';
import { translations } from './i18n.ts';
import Dashboard from './components/Dashboard.tsx';
import Database from './components/Database.tsx';
import TaskModal from './components/TaskModal.tsx';

// AQUI ESTÁ O SEU LINK CORRIGIDO
const API_URL = "https://sheetdb.io/api/v1/qfvxr8lu43heq";

const App: React.FC = () => {
  // --- Estados de Segurança ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState(false);

  // --- Estados da Aplicação ---
  const [tasks, setTasks] = useState<Task[]>([]); // Começa vazio e busca da planilha
  const [activeTab, setActiveTab] = useState<'KANBAN' | 'DATABASE'>('KANBAN');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [lang, setLang] = useState<Language>('PT');

  const t = translations[lang];

  // --- PASSO 2: BUSCAR DADOS (RESOLVE O F5) ---
  useEffect(() => {
    if (isAuthenticated) {
      fetch(API_URL)
        .then(res => res.json())
        .then(data => {
          // Esse trecho abaixo limpa as datas antes de salvar no site
          const dadosLimpos = data.map(item => ({
            ...item,
            // Se a data for um número doido da planilha, ele tenta corrigir
            startDate: item.startDate ? new Date(item.startDate).toISOString().split('T')[0] : '',
            dueDate: item.dueDate ? new Date(item.dueDate).toISOString().split('T')[0] : ''
          }));
          setTasks(dadosLimpos);
        })
        .catch(err => console.error("Erro ao carregar dados:", err));
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

  // --- PASSO 3: EXCLUIR DEFINITIVO ---
  const handleDeleteTask = async (id: string) => {
    // Apaga na Planilha
    await fetch(`${API_URL}/id/${id}`, { method: 'DELETE' });
    // Apaga na tela
    setTasks(prev => prev.filter(task => task.id !== id));
    if (isModalOpen) setIsModalOpen(false);
  };

  // --- SALVAR (NOVO OU EDITAR) ---
  const handleSaveTask = async (taskData: Task) => {
    if (editingTask) {
      // Editar na planilha
      await fetch(`${API_URL}/id/${editingTask.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: taskData })
      });
      setTasks(prev => prev.map(t => t.id === editingTask.id ? taskData : t));
    } else {
      // Novo na planilha
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

  const resetFilters = () => {
    setFilters({ region: 'Todos', priority: 'Todos', owner: 'Todos', delayed: 'Todos', status: 'Todos' });
  };

  // --- ABAIXO SEGUE O SEU LAYOUT ORIGINAL ---
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
                <label className="mb-2 block px-2 text-[10px] font-black uppercase tracking-widest text-indigo-300">
                  Senha de Acesso
                </label>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="••••••••••••"
                  className={`w-full rounded-2xl border ${loginError ? 'border-red-500 bg-red-500/10' : 'border-white/10 bg-white/5'} p-4 text-center text-white placeholder-white/20 outline-none transition-all focus:border-indigo-500 focus:bg-white/10`}
                  autoFocus
                />
              </div>

              {loginError && (
                <p className="text-center text-[10px] font-black uppercase tracking-widest text-red-400 animate-bounce">
                  Senha Incorreta
                </p>
              )}

              <button
                type="submit"
                className="group relative w-full overflow-hidden rounded-2xl bg-indigo-600 py-4 font-black uppercase tracking-[0.2em] text-white transition-all hover:bg-indigo-500 hover:shadow-xl hover:shadow-indigo-500/20 active:scale-95 text-xs"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  Acessar Hub <i className="fas fa-arrow-right text-[10px] transition-transform group-hover:translate-x-1"></i>
                </span>
              </button>
            </form>
          </div>
          <p className="mt-8 text-center text-[9px] font-bold uppercase tracking-widest text-white/20">
            Internal Use Only • Stellantis LatAm
          </p>
        </div>
      </div>
    );
  }

  const filterSelectClass = "text-[11px] border border-gray-200 rounded-xl p-2.5 bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm font-bold appearance-none";

  return (
    <div className="flex flex-col min-h-screen bg-[#FDFDFF] animate-in fade-in duration-700">
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
              <button onClick={() => setActiveTab('KANBAN')} className={`px-8 py-2 rounded-xl text-xs font-black uppercase transition-all tracking-widest ${activeTab === 'KANBAN' ? 'bg-white text-indigo-700 shadow-sm border border-gray-100' : 'text-gray-400 hover:text-gray-600'}`}>{t.kanban}</button>
              <button onClick={() => setActiveTab('DATABASE')} className={`px-8 py-2 rounded-xl text-xs font-black uppercase transition-all tracking-widest ${activeTab === 'DATABASE' ? 'bg-white text-indigo-700 shadow-sm border border-gray-100' : 'text-gray-400 hover:text-gray-600'}`}>{t.database}</button>
            </nav>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl border border-gray-200">
               <button onClick={() => setLang('PT')} className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${lang === 'PT' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400'}`}>PORTUGUÊS</button>
               <button onClick={() => setLang('ES')} className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${lang === 'ES' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400'}`}>ESPAÑOL</button>
            </div>
            <button onClick={() => setIsAuthenticated(false)} className="flex items-center gap-2 text-red-600 font-black text-[10px] tracking-widest hover:text-red-800 transition-colors bg-red-50 px-4 py-2 rounded-xl border border-red-100">
              <i className="fas fa-sign-out-alt"></i> SAIR
            </button>
          </div>
        </div>
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
            <button onClick={resetFilters} className="w-full text-[10px] font-black text-indigo-600 uppercase hover:bg-white p-2.5 rounded-xl transition-all border border-transparent hover:border-gray-200 hover:shadow-sm">{t.clearFilters}</button>
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

      <footer className="bg-white border-t border-gray-100 p-4 text-[10px] flex justify-between items-center px-10 mt-auto">
        <div className="flex gap-8">
          <div className="flex items-center gap-2 group">
            <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
            <span className="text-gray-500 uppercase tracking-widest font-black">{t.total}: {filteredTasks.length}</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-black tracking-widest uppercase text-gray-300">{t.environment} © 2026</span>
          <i className="fas fa-shield-alt text-indigo-100"></i>
        </div>
      </footer>

      <TaskModal isOpen={isModalOpen} task={editingTask} onClose={() => setIsModalOpen(false)} onSave={handleSaveTask} onDelete={handleDeleteTask} lang={lang} />
    </div>
  );
};

export default App;
