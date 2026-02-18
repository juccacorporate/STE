
import React, { useState, useEffect } from 'react';
import { Task, Region, Category, Priority, Status, Language } from '../types';
import { translations } from '../i18n';

interface TaskModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Task) => void;
  onDelete: (id: string) => void;
  lang: Language;
}

const TaskModal: React.FC<TaskModalProps> = ({ task, isOpen, onClose, onSave, onDelete, lang }) => {
  const t = translations[lang];
  const [formData, setFormData] = useState<Partial<Task>>({
    region: Region.BRAZIL,
    category: Category.PROJETOS,
    priority: Priority.MEDIA,
    status: Status.NAO_INICIADO,
    progress: 0,
    startDate: new Date().toISOString().split('T')[0],
    dueDate: new Date().toISOString().split('T')[0],
    timeline: '',
  });

  useEffect(() => {
    if (task) {
      setFormData(task);
    } else {
      setFormData({
        region: Region.BRAZIL,
        category: Category.PROJETOS,
        priority: Priority.MEDIA,
        status: Status.NAO_INICIADO,
        progress: 0,
        startDate: new Date().toISOString().split('T')[0],
        dueDate: new Date().toISOString().split('T')[0],
        timeline: '',
      });
    }
  }, [task, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData as Task);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'progress' ? parseInt(value) : value }));
  };

  const handleDelete = () => {
    if (task?.id) {
      onDelete(task.id);
    }
  };

  const inputClass = "w-full border border-gray-200 rounded-xl p-3 text-sm bg-gray-50/50 text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all";
  const labelClass = "text-[10px] font-black text-gray-400 uppercase tracking-[0.1em] px-1 block mb-1.5";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-indigo-950/40 backdrop-blur-md p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden border border-white/20 flex flex-col">
        <div className="flex justify-between items-center p-8 border-b border-gray-50 bg-gray-50/30">
          <div>
            <h2 className="text-2xl font-black text-indigo-900 flex items-center gap-3">
              <i className={`fas ${task ? 'fa-pen-to-square' : 'fa-plus-circle'} text-indigo-500`}></i>
              {task ? t.edit : t.newTask}
            </h2>
          </div>
          <button onClick={onClose} className="text-gray-300 hover:text-red-500 transition-colors bg-white p-2 rounded-full shadow-sm">
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className={labelClass}>{t.region}</label>
              <select name="region" value={formData.region} onChange={handleChange} className={inputClass}>
                {Object.values(Region).map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            <div>
              <label className={labelClass}>Título</label>
              <input required name="title" value={formData.title || ''} onChange={handleChange} className={inputClass} placeholder="Ex: Backup Car" />
            </div>

            <div>
              <label className={labelClass}>{t.category}</label>
              <select name="category" value={formData.category} onChange={handleChange} className={inputClass}>
                {Object.entries(t.categories).map(([key, val]) => <option key={key} value={key}>{val}</option>)}
              </select>
            </div>

            <div>
              <label className={labelClass}>{t.priority}</label>
              <select name="priority" value={formData.priority} onChange={handleChange} className={inputClass}>
                {Object.entries(t.priorities).map(([key, val]) => <option key={key} value={key}>{val}</option>)}
              </select>
            </div>

            <div>
              <label className={labelClass}>{t.status}</label>
              <select name="status" value={formData.status} onChange={handleChange} className={inputClass}>
                {Object.entries(t.statuses).map(([key, val]) => <option key={key} value={key}>{val}</option>)}
              </select>
            </div>

            <div>
              <label className={labelClass}>{t.progress}</label>
              <input type="number" name="progress" min="0" max="100" value={formData.progress} onChange={handleChange} className={inputClass} />
            </div>

            <div>
              <label className={labelClass}>Owner</label>
              <input name="owner" value={formData.owner || ''} onChange={handleChange} className={inputClass} />
            </div>

            <div>
              <label className={labelClass}>Apoio</label>
              <input name="support" value={formData.support || ''} onChange={handleChange} className={inputClass} />
            </div>

            <div>
              <label className={labelClass}>{t.startDate}</label>
              <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} className={inputClass} />
            </div>

            <div>
              <label className={labelClass}>{t.dueDate}</label>
              <input type="date" name="dueDate" value={formData.dueDate} onChange={handleChange} className={inputClass} />
            </div>

            <div>
              <label className={labelClass}>{t.escalation}</label>
              <input name="escalation" value={formData.escalation || ''} onChange={handleChange} className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
            <div>
              <label className={labelClass}>{t.description}</label>
              <textarea name="description" value={formData.description || ''} onChange={handleChange} className={`${inputClass} h-32 resize-none`} />
            </div>

            <div>
              <label className={labelClass}>{t.actionSteps}</label>
              <textarea name="action" value={formData.action || ''} onChange={handleChange} className={`${inputClass} h-32 resize-none`} />
            </div>

            <div className="lg:col-span-2">
              <label className={labelClass}>{t.scenarioSummary}</label>
              <textarea name="notes" value={formData.notes || ''} onChange={handleChange} className={`${inputClass} h-24 resize-none`} />
            </div>

            <div className="lg:col-span-2">
              <label className={labelClass}>{t.taskTimeline}</label>
              <textarea name="timeline" value={formData.timeline || ''} onChange={handleChange} className={`${inputClass} h-32 resize-none`} placeholder="Registre as evoluções da tarefa aqui..." />
            </div>
          </div>
        </form>

        <div className="p-8 border-t border-gray-50 bg-gray-50/30 flex justify-between gap-4">
          <div className="flex gap-4">
            {task && (
              <button 
                type="button" 
                onClick={handleDelete} 
                className="px-8 py-3 bg-red-50 text-red-600 border border-red-100 rounded-xl font-black text-xs hover:bg-red-600 hover:text-white transition-all uppercase tracking-widest shadow-sm"
              >
                <i className="fas fa-trash-alt mr-2"></i> {t.delete}
              </button>
            )}
          </div>
          <div className="flex gap-4">
            <button type="button" onClick={onClose} className="px-8 py-3 bg-white border border-gray-200 rounded-xl text-gray-500 font-black text-xs hover:bg-gray-100 transition-all uppercase tracking-widest shadow-sm">
              {t.cancel}
            </button>
            <button onClick={handleSubmit} type="submit" className="px-10 py-3 bg-indigo-600 text-white rounded-xl font-black text-xs hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all uppercase tracking-widest">
              {t.save}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;
