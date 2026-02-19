import React, { useState, useEffect } from 'react';
import { Task, Language, Status, Priority, Category, Region } from '../types';
import { translations } from '../i18n';

interface Props {
  isOpen: boolean; task: Task | null; onClose: () => void; onSave: (task: Task) => void; onDelete: (id: string) => void; lang: Language;
}

const TaskModal: React.FC<Props> = ({ isOpen, task, onClose, onSave, onDelete, lang }) => {
  const t = translations[lang];
  const [formData, setFormData] = useState<Partial<Task>>({});

  useEffect(() => {
    setFormData(task || { region: Region.BRASIL, category: Category.PROJETOS, status: Status.NAO_INICIADO, priority: Priority.MEDIA });
  }, [task, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: any) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const inputClass = "w-full p-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-sm";

  return (
    <div className="fixed inset-0 bg-indigo-950/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-[2rem] shadow-2xl p-8 w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-black text-gray-800 mb-6 flex items-center gap-3 border-b pb-4">
          <i className="fas fa-edit text-indigo-600"></i> {task ? t.editTask : t.newTask}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest">{t.title}</label>
            <input name="title" value={formData.title || ''} onChange={handleChange} className={inputClass} />
            <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest">Escalação (Badges)</label>
            <input name="escalation" value={formData.escalation || ''} onChange={handleChange} className={inputClass} placeholder="Ex: ATRASADO, URGENTE" />
            <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest">{t.status}</label>
            <select name="status" value={formData.status} onChange={handleChange} className={inputClass}>
              {Object.entries(t.statuses).map(([key, val]) => <option key={key} value={key}>{val}</option>)}
            </select>
          </div>

          <div className="space-y-4">
            <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest">{t.description}</label>
            <textarea name="description" value={formData.description || ''} onChange={handleChange} className={`${inputClass} h-32`} />
            <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest">Ações / Próximos Passos</label>
            <textarea name="actionSteps" value={formData.actionSteps || ''} onChange={handleChange} className={`${inputClass} h-32`} />
          </div>

          <div className="space-y-4">
            <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest">Resumo do Cenário</label>
            <textarea name="scenarioSummary" value={formData.scenarioSummary || ''} onChange={handleChange} className={`${inputClass} h-32`} />
            <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest">Timeline</label>
            <textarea name="timeline" value={formData.timeline || ''} onChange={handleChange} className={`${inputClass} h-32`} />
          </div>
        </div>

        <div className="flex justify-between mt-10 border-t pt-6">
          <button onClick={() => task && onDelete(task.id)} className="text-red-500 font-black text-xs uppercase px-6 py-3 rounded-xl hover:bg-red-50 border border-transparent hover:border-red-100">Excluir</button>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-8 py-3 rounded-xl bg-gray-100 text-gray-500 font-black text-xs uppercase hover:bg-gray-200">Cancelar</button>
            <button onClick={() => onSave(formData as Task)} className="px-10 py-3 rounded-xl bg-indigo-600 text-white font-black text-xs uppercase hover:bg-indigo-700 shadow-lg shadow-indigo-200">Guardar</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;
