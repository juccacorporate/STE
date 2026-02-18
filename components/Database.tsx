
import React from 'react';
import { Task, Language, Region, Status } from '../types';
import { translations } from '../i18n';

interface DatabaseProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onAddTask: () => void;
  lang: Language;
}

const Database: React.FC<DatabaseProps> = ({ tasks, onEditTask, onDeleteTask, onAddTask, lang }) => {
  const t = translations[lang];

  const getRegionRowColor = (region: Region) => {
    switch (region) {
      case Region.BRAZIL: return 'bg-green-100/40 hover:bg-green-200/50';
      case Region.ARGENTINA: return 'bg-blue-100/40 hover:bg-blue-200/50';
      case Region.CHILE: return 'bg-red-100/30 hover:bg-red-200/40';
      case Region.SOUTH_AMERICA: return 'bg-orange-100/40 hover:bg-orange-200/50';
      default: return 'hover:bg-gray-50';
    }
  };

  const isOverdue = (dueDate: string, status: Status) => {
    if (status === Status.CONCLUIDO) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    return due < today;
  };

  return (
    <div className="p-4 bg-white rounded-2xl shadow-sm border border-gray-100 mx-4 my-2 overflow-x-auto">
      <div className="flex justify-between items-center mb-6 px-2">
        <h2 className="text-xl font-black text-indigo-900 flex items-center gap-3">
          <i className="fas fa-server text-indigo-500"></i> {t.database}
        </h2>
        <button 
          onClick={onAddTask}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all shadow-lg shadow-indigo-100 uppercase tracking-widest"
        >
          <i className="fas fa-plus"></i> {t.newTask}
        </button>
      </div>
      
      <table className="w-full text-[11px] text-left border-collapse min-w-[1400px]">
        <thead>
          <tr className="bg-gray-50 text-gray-400 uppercase border-b border-gray-100 font-black tracking-widest">
            <th className="p-4 w-32">{t.region}</th>
            <th className="p-4">Título</th>
            <th className="p-4">{t.actionSteps}</th>
            <th className="p-4">{t.category}</th>
            <th className="p-4 text-center">{t.priority}</th>
            <th className="p-4">{t.owner}</th>
            <th className="p-4">{t.support}</th>
            <th className="p-4">{t.startDate}</th>
            <th className="p-4">{t.dueDate}</th>
            <th className="p-4">{t.status}</th>
            <th className="p-4">{t.progress}</th>
            <th className="p-4"></th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => {
            const overdue = isOverdue(task.dueDate, task.status);
            const displayBadge = task.escalation || (overdue ? (lang === 'PT' ? 'Atrasado' : 'Retrasado') : '');
            
            return (
              <tr 
                key={task.id} 
                className={`border-b border-gray-200/50 transition-colors group ${getRegionRowColor(task.region)}`}
              >
                <td className="p-4 font-black text-indigo-950 uppercase tracking-tighter">
                  <div className="flex items-center gap-2">
                     <div className={`w-2 h-4 rounded-full shadow-sm ${
                       task.region === Region.BRAZIL ? 'bg-green-600' :
                       task.region === Region.ARGENTINA ? 'bg-blue-600' :
                       task.region === Region.CHILE ? 'bg-red-600' : 'bg-orange-500'
                     }`}></div>
                     {task.region}
                  </div>
                </td>
                <td className="p-4 font-black text-gray-900">
                  <div className="flex flex-col gap-1">
                    {task.title}
                    {displayBadge && (
                      <span className="inline-block w-fit bg-red-600 text-white text-[8px] px-1.5 py-0.5 rounded font-black uppercase tracking-wider shadow-sm animate-pulse">
                        {displayBadge}
                      </span>
                    )}
                  </div>
                </td>
                <td className="p-4 text-gray-700 italic max-w-xs truncate">{task.action}</td>
                <td className="p-4 font-bold text-indigo-500/80 uppercase">{t.categories[task.category as keyof typeof t.categories]}</td>
                <td className="p-4 text-center">
                  <span className={`px-2 py-1 rounded-full font-black text-[9px] uppercase tracking-tighter
                    ${task.priority === 'Alta' ? 'bg-red-50 text-red-600' : task.priority === 'Média' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>
                    {t.priorities[task.priority as keyof typeof t.priorities]}
                  </span>
                </td>
                <td className="p-4 font-black text-indigo-950">{task.owner}</td>
                <td className="p-4 font-bold text-gray-600 uppercase">{task.support || '-'}</td>
                <td className="p-4 text-gray-500 whitespace-nowrap">{new Date(task.startDate).toLocaleDateString(lang === 'PT' ? 'pt-BR' : 'es-AR')}</td>
                <td className={`p-4 font-black whitespace-nowrap ${overdue ? 'text-red-600 underline decoration-red-200' : 'text-gray-700'}`}>
                  {new Date(task.dueDate).toLocaleDateString(lang === 'PT' ? 'pt-BR' : 'es-AR')}
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded font-black text-[9px] uppercase tracking-widest whitespace-nowrap
                    ${task.status === 'Concluído' ? 'bg-emerald-500 text-white shadow-sm' : task.status === 'Em andamento' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-gray-200 text-gray-500'}`}>
                    {t.statuses[task.status as keyof typeof t.statuses]}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 h-1.5 rounded-full overflow-hidden w-20">
                      <div className="bg-indigo-600 h-full" style={{ width: `${task.progress}%` }}></div>
                    </div>
                    <span className="font-black text-indigo-950">{task.progress}%</span>
                  </div>
                </td>
                <td className="p-4 text-right">
                  <div className="flex gap-2 justify-end">
                    <button 
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEditTask(task); }}
                      className="text-indigo-600 hover:text-indigo-900 font-black uppercase tracking-widest text-[9px] bg-white border border-gray-200 hover:border-indigo-400 px-3 py-2 rounded-lg transition-all shadow-sm flex items-center gap-1.5"
                    >
                      <i className="fas fa-edit"></i> {t.edit}
                    </button>
                    <button 
                      onClick={(e) => { 
                        e.preventDefault(); 
                        e.stopPropagation(); 
                        onDeleteTask(task.id);
                      }}
                      className="text-red-500 hover:bg-red-50 hover:text-red-700 font-black uppercase tracking-widest text-[9px] bg-white border border-red-100 hover:border-red-300 px-3 py-2 rounded-lg transition-all shadow-sm flex items-center gap-1.5"
                    >
                      <i className="fas fa-trash-alt"></i> {t.delete}
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
          {tasks.length === 0 && (
            <tr>
              <td colSpan={12} className="p-20 text-center text-gray-400 italic">
                {t.noTasks}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Database;
