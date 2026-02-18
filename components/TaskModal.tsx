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
  const [formData, setFormData] = useState<Partial<Task>>({});

  useEffect(() => {
    setFormData(task ? { ...task } : {
      id: '',
      region: Region.BRASIL,
      title: '',
      description: '',
      category: Category.PROJETOS,
      priority: Priority.MEDIA,
      owner: '',
      support: '',
      startDate: '',
      dueDate: '',
      status: Status.NAO_INICIADO,
      progress: 0,
      actionSteps: '',
      scenarioSummary: '',
      timeline: ''
    });
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black text-gray-800 flex items-center gap-3">
            <i className="fas fa-edit text-indigo-500"></i>
            {task ? t.editTask : t.newTask}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">&times;</button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Coluna da Esquerda */}
          <div>
            <div className="mb-4">
              <label className="block text-sm font-bold text-gray-600 mb-1">{t.description}</label>
              <textarea name="description" value={formData.description || ''} onChange={handleChange} className="w-full border border-gray-300 rounded-md p-2 h-24" />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-bold text-gray-600 mb-1">{t.scenarioSummary}</label>
              <textarea name="scenarioSummary" value={formData.scenarioSummary || ''} onChange={handleChange} className="w-full border border-gray-300 rounded-md p-2 h-24" />
            </div>
             <div className="mb-4">
              <label className="block text-sm font-bold text-gray-600 mb-1">{t.timeline}</label>
              <textarea name="timeline" value={formData.timeline || ''} onChange={handleChange} className="w-full border border-gray-300 rounded-md p-2 h-24" />
            </div>
          </div>
          
          {/* Coluna da Direita */}
          <div>
             <div className="mb-4">
              <label className="block text-sm font-bold text-gray-600 mb-1">{t.actionSteps}</label>
              <textarea name="actionSteps" value={formData.actionSteps || ''} onChange={handleChange} className="w-full border border-gray-300 rounded-md p-2 h-52" />
            </div>
          </div>
        </div>
        
        <div className="flex justify-between items-center mt-8 pt-6 border-t">
          <div>
            {task && (
              <button onClick={handleDelete} className="px-6 py-3 bg-red-50 text-red-600 font-black text-xs uppercase rounded-lg border border-red-200 hover:bg-red-100">{t.delete}</button>
            )}
          </div>
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
