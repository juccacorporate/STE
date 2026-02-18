
import React from 'react';
import { Task, Priority, Status, Language } from '../types';
import { translations } from '../i18n';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  lang: Language;
  onHover: (task: Task | null, element?: HTMLElement) => void;
}

const getPriorityBorderColor = (priority: Priority) => {
  switch (priority) {
    case Priority.ALTA: return 'border-l-red-500';
    case Priority.MEDIA: return 'border-l-amber-400';
    case Priority.BAIXA: return 'border-l-blue-400';
    default: return 'border-l-gray-300';
  }
};

const getPriorityBadgeColor = (priority: Priority) => {
  switch (priority) {
    case Priority.ALTA: return 'text-red-700 bg-red-50';
    case Priority.MEDIA: return 'text-amber-700 bg-amber-50';
    case Priority.BAIXA: return 'text-blue-700 bg-blue-50';
    default: return 'text-gray-600';
  }
};

const isOverdue = (dueDate: string, status: Status) => {
  if (status === Status.CONCLUIDO) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  return due < today;
};

const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onDelete, lang, onHover }) => {
  const t = translations[lang];
  const overdue = isOverdue(task.dueDate, task.status);
  const displayBadge = task.escalation || (overdue ? (lang === 'PT' ? 'Atrasado' : 'Retrasado') : '');

  return (
    <div 
      className={`group relative p-4 mb-3 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer border-l-4 ${getPriorityBorderColor(task.priority)}`}
      onMouseEnter={(e) => onHover(task, e.currentTarget)}
      onMouseLeave={() => onHover(null)}
      onClick={() => onEdit(task)}
    >
      {displayBadge && (
        <div className="absolute -top-2 -right-1 bg-red-600 text-white text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider shadow-lg animate-pulse z-10 border border-white/20">
          {displayBadge}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-start">
          <h4 className="font-bold text-[12px] text-gray-900 leading-tight group-hover:text-indigo-600 transition-colors">
            {task.title}
          </h4>
        </div>
        
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter ${getPriorityBadgeColor(task.priority)}`}>
              {t.priorities[task.priority as keyof typeof t.priorities]}
            </span>
            <span className="text-[10px] font-black text-indigo-900">
              {task.owner}
            </span>
          </div>
          {task.support && (
            <div className="flex items-center gap-1.5 ml-1 opacity-70">
               <i className="fas fa-user-friends text-[8px] text-indigo-400"></i>
               <span className="text-[9px] font-bold text-gray-500 uppercase tracking-tighter">{task.support}</span>
            </div>
          )}
        </div>

        <div className="space-y-1 mt-1">
          <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${task.status === Status.CONCLUIDO ? 'bg-emerald-500' : 'bg-indigo-600'}`} 
              style={{ width: `${task.progress}%` }}
            ></div>
          </div>
          <div className="flex justify-between items-center text-[9px] font-bold uppercase">
            <span className={overdue ? 'text-red-500 font-black' : 'text-gray-400'}>
              {new Date(task.dueDate).toLocaleDateString(lang === 'PT' ? 'pt-BR' : 'es-AR')}
            </span>
            <span className="text-indigo-900 font-black">{task.progress}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
