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
            progress: Number(item.progress) || 0,
            // Traduzindo os nomes da planilha para o site
            actionSteps: item.actionsteps || '',
            scenarioSummary: item.scenariosummary || '',
            timeline: item.timeline || ''
          }));
          setTasks(formatData);
        });
    }
  }, [isAuthenticated]);

  // SALVAR DADOS
  const handleSaveTask = async (taskData: Task) => {
    // MAPEAMENTO FORÇADO PARA A PLANILHA (TUDO MINÚSCULO)
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
      actionsteps: taskData.actionSteps || '', // Coluna M
      scenariosummary: taskData.scenarioSummary || '', // Coluna N
      timeline: taskData.timeline || '' // Coluna O
    };

    try {
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
    } catch (e) {
      alert("Erro ao salvar na planilha!");
    }

    setIsModalOpen(false);
    setEditingTask(null);
  };

  const handleDeleteTask = async (id: string) => {
    await fetch(`${API_URL}/id/${id}`, { method: 'DELETE' });
    setTasks(prev => prev.filter(task => task.id !== id));
  };

  // --- ABAIXO É O VISUAL DO SITE (MANTIDO) ---
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-indigo-950">
        <div className="w-full max-w-md p-10 bg-white/5 rounded-[2.5rem] backdrop-blur-xl border border-white/10 text-center">
            <h1 className="text-3xl font-black text-white mb-8">CONVERGÊNCIA</h1>
            <input type="password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} placeholder="Senha" className="w-full rounded-2xl p-4 mb-4 text-center outline-none bg-white/10 text-white" />
            <button onClick={() => handleLogin()} className="w-full rounded-2xl bg-indigo-600 py-4 font-black text-white uppercase text-xs">Entrar</button>
        </div>
      </div>
    );
  }

  const filteredTasks = tasks.filter(task => {
    return (filters.region === 'Todos' || task.region === filters.region);
  });

  const [filters, setFilters] = useState<any>({ region: 'Todos' });

  return (
    <div className="flex flex-col min-h-screen bg-[#FDFDFF]">
      <header className="bg-white border-b p-4 sticky top-0 z-30 flex justify-between items-center">
        <h1 className="text-lg font-black text-indigo-900">CONVERGÊNCIA</h1>
        <nav className="flex gap-4">
          <button onClick={() => setActiveTab('KANBAN')} className={`px-4 py-2 font-bold ${activeTab === 'KANBAN' ? 'text-indigo-600' : 'text-gray-400'}`}>KANBAN</button>
          <button onClick={() => setActiveTab('DATABASE')} className={`px-4 py-2 font-bold ${activeTab === 'DATABASE' ? 'text-indigo-600' : 'text-gray-400'}`}>BASE DE DADOS</button>
        </nav>
        <button onClick={() => setIsAuthenticated(false)} className="text-red-500 font-bold">SAIR</button>
      </header>
      <main className="max-w-[1600px] mx-auto w-full pt-4">
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

const handleLogin = (e?: any) => {}; // Placeholder

export default App;
