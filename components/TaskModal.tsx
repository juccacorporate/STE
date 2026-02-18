import React, { useState, useEffect } from 'react';
import { Task, Language, Status, Priority, Category, Region } from '../types';
import { translations } from '../i18n';

interface Props {
  isOpen: boolean;
  task: Task | null;
  onClose: () => void;
  onSave: (task: Task) => void;
  onDelete: (id: string) => void;
  lang: Language;
}

const TaskModal: React.FC<Props> = ({ isOpen, task, onClose, onSave, onDelete, lang }) => {
  const t = translations[lang];
  
  // Define a estrutura completa de uma tarefa vazia
  const initialTaskState: Partial<Task> = {
    region: Region.BRASIL,
    title: '',
    category: Category.PROJETOS,
    priority: Priority.MEDIA,
    status: Status.NAO_INICIADO,
    progress: 0,
    owner: '',
    support: '',
    startDate: '',
    dueDate: '',
    description: '',
    actionSteps: '',
    scenarioSummary: '',
    timeline: ''
  };
  
  const [formData, setFormData] = useState<Partial<Task>>(initialTaskState);

  useEffect(() => {
    // Quando o modal abre, preenche com os dados da tarefa ou reseta para o estado inicial
    setFormData(task ? { ...task } : initialTaskState);
  }, [task, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    onSave(formData as Task);
  };

  const handleDelete = () => {
    if (task?.id) {
      onDelete(task.id);
    }
  };

  const inputClass = "w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none";
  const textareaClass = `${inputClass} h-24 resize-none`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h2 className="text-2xl font-black text-gray-800 flex items-center gap-3">
            <i className="fas fa-edit text-indigo-500"></i>
            {task ? t.editTask : t.newTask}
          </h2>
          <button onClick={onClose} className="text-gray-400 text-2xl hover:text-gray-600">&times;</button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Coluna 1: Informações Principais */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-bold text-gray-600 mb-1 block">{t.region}</label>
              <select name="region" value={formData.region} onChange={handleChange} className={inputClass}>{Object.values(Region).map(r => <option key={r} value={r}>{r}</option>)}</select>
            </div>
            <div>
              <label className="text-sm font-bold text-gray-600 mb-1 block">{t.title}</label>
              <input type="text" name="title" value={formData.title || ''} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className="text-sm font-bold text-gray-600 mb-1 block">{t.category}</label>
              <select name="category" value={formData.category} onChange={handleChange} className={inputClass}>{Object.values(Category).map(c => <option key={c} value={c}>{c}</option>)}</select>
            </div>
            <div>
              <label className="text-sm font-bold text-gray-600 mb-1 block">{t.priority}</label>
              <select name="priority" value={formData.priority} onChange={handleChange} className={inputClass}>{Object.entries(t.priorities).map(([key, val]) => <option key={key} value={key}>{val}</option>)}</select>
            </div>
            <div>
              <label className="text-sm font-bold text-gray-600 mb-1 block">{t.status}</label>
              <select name="status" value={formData.status} onChange={handleChange} className={inputClass}>{Object.entries(t.statuses).map(([key, val]) => <option key={key} value={key}>{val}</option>)}</select>
            </div>
            <div>
              <label className="text-sm font-bold text-gray-600 mb-1 block">{t.progress} (%)</label>
              <input type="number" name="progress" value={formData.progress || 0} onChange={handleChange} className={inputClass} />
            </div>
          </div>
          
          {/* Coluna 2: Pessoas e Datas */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-bold text-gray-600 mb-1 block">{t.owner}</label>
              <input type="text" name="owner" value={formData.owner || ''} onChange={handleChange} className={inputClass} />
            </div>
             <div>
              <label className="text-sm font-bold text-gray-600 mb-1 block">{t.support}</label>
              <input type="text" name="support" value={formData.support || ''} onChange={handleChange} className={inputClass} />
            </div>
             <div>
              <label className="text-sm font-bold text-gray-600 mb-1 block">{t.startDate}</label>
              <input type="date" name="startDate" value={formData.startDate || ''} onChange={handleChange} className={inputClass} />
            </div>
             <div>
              <label className="text-sm font-bold text-gray-600 mb-1 block">{t.dueDate}</label>
              <input type="date" name="dueDate" value={formData.dueDate || ''} onChange={handleChange} className={inputClass} />
            </div>
          </div>

          {/* Coluna 3: Campos de Texto Grandes */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-bold text-gray-600 mb-1 block">{t.description}</label>
              <textarea name="description" value={formData.description || ''} onChange={handleChange} className={textareaClass} />
            </div>
            <div>
              <label className="text-sm font-bold text-gray-600 mb-1 block">{t.actionSteps}</label>
              <textarea name="actionSteps" value={formData.actionSteps || ''} onChange={handleChange} className={textareaClass} />
            </div>
             <div>
              <label className="text-sm font-bold text-gray-600 mb-1 block">{t.scenarioSummary}</label>
              <textarea name="scenarioSummary" value={formData.scenarioSummary || ''} onChange={handleChange} className={textareaClass} />
            </div>
             <div>
              <label className="text-sm font-bold text-gray-600 mb-1 block">{t.timeline}</label>
              <textarea name="timeline" value={formData.timeline || ''} onChange={handleChange} className={textareaClass} />
            </div>
          </div>
        </div>
        
        <div className="flex justify-between items-center mt-8 pt-6 border-t">
          <div>{task && <button onClick={handleDelete} className="px-6 py-3 bg-red-50 text-red-600 font-black text-xs uppercase rounded-lg border border-red-200 hover:bg-red-100">{t.delete}</button>}</div>
          <div className="flex gap-4">
            <button onClick={onClose} className="px-6 py-3 bg-gray-100 text-gray-700 font-black text-xs uppercase rounded-lg border border-gray-200 hover:bg-gray-200">{t.cancel}</button>
            <button onClick={handleSave} className="px-6 py-3 bg-indigo-600 text-white font-black text-xs uppercase rounded-lg hover:bg-indigo-700">{t.save}</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;
