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

  // SALVAR (CRIAÇÃO E EDIÇÃO)
  const handleSaveTask = async (taskData: Task) => {
    const payload = { ...taskData, id: taskData.id || Math.random().toString(36).substr(2, 9) };
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

  const handleDeleteTask = async (id: string) => {
    await fetch(`${API_URL}/id/${id}`, { method: 'DELETE' });
    setTasks(prev => prev.filter(task => task.id !== id));
  };

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-indigo-950 px-4">
        <div className="w-full max-w-md text-center">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-indigo-600 text-white shadow-2xl mb-6">
            <i className="fas fa-shield-halved text-3xl"></i>
          </div>
          <h1 className="text-3xl font-black text-white">CONVERGÊNCIA</h1>
          <p className="text-[10px] font-bold uppercase text-indigo-400 mb-8 tracking-[0.3em]">Customer Care Secure Hub</p>
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
          <div className="bg-indigo-900 text-white p-3 rounded-2xl flex items-center gap-3 shadow-lg">
            <i className="fas fa-chart-line text-2xl"></i>
            <h1 className="text-lg font-black">CONVERGÊNCIA</h1>
          </div>
          <nav className="flex gap-1 bg-gray-50 p-1.5 rounded-2xl border">
            <button onClick={() => setActiveTab('KANBAN')} className={`px-8 py-2 rounded-xl text-xs font-black ${activeTab === 'KANBAN' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-400'}`}>{t.kanban}</button>
            <button onClick={() => setActiveTab('DATABASE')} className={`px-8 py-2 rounded-xl text-xs font-black ${activeTab === 'DATABASE' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-400'}`}>{t.database}</button>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => setLang('PT')} className={`px-4 py-1.5 rounded-lg text-[10px] font-black ${lang === 'PT' ? 'bg-indigo-600 text-white' : 'text-gray-400'}`}>PT</button>
          <button onClick={() => setLang('ES')} className={`px-4 py-1.5 rounded-lg text-[10px] font-black ${lang === 'ES' ? 'bg-indigo-600 text-white' : 'text-gray-400'}`}>ES</button>
          <button onClick={() => setIsAuthenticated(false)} className="text-red-600 font-black text-[10px] bg-red-50 px-4 py-2 rounded-xl">SAIR</button>
        </div>
      </header>
      <main className="flex-1 max-w-[1600px] mx-auto w-full pt-4">
        {activeTab === 'KANBAN' ? <Dashboard tasks={tasks} onEditTask={(t) => {setEditingTask(t); setIsModalOpen(true);}} onDeleteTask={handleDeleteTask} lang={lang} /> : <Database tasks={tasks} onEditTask={(t) => {setEditingTask(t); setIsModalOpen(true);}} onDeleteTask={handleDeleteTask} onAddTask={() => {setEditingTask(null); setIsModalOpen(true);}} lang={lang} />}
      </main>
      <TaskModal isOpen={isModalOpen || !!editingTask} task={editingTask} onClose={() => {setIsModalOpen(false); setEditingTask(null);}} onSave={handleSaveTask} onDelete={handleDeleteTask} lang={lang} />
    </div>
  );
};

export default App;
