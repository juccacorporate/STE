import React from 'react';
import { Task, Language } from '../types';
import { translations } from '../i18n';
import TaskCard from './TaskCard'; // Assumindo que você tem um TaskCard.tsx

interface Props {
  title: string;
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  lang: Language;
}

const KanbanColumn: React.FC<Props> = ({ title, tasks, onEditTask, onDeleteTask, lang }) => {
  const t = translations[lang];

  // Define a cor da borda baseado no título (ajuste as cores se necessário)
  const borderColor = {
    'PROJETOS': 'border-indigo-400',
    'QUALIDADE': 'border-emerald-400',
    'PRODUTO': 'border-orange-400',
    'FINANCEIRO': 'border-red-400',
  }[title] || 'border-gray-400';

  return (
    <div className="flex flex-col bg-white rounded-2xl shadow-lg p-4 border-t-4 border-indigo-500">
      <h3 className="font-black text-lg text-gray-700 mb-4">{title} <span className="text-gray-400 font-normal text-sm ml-2">({tasks.length})</span></h3>
      
      <div className="space-y-4 flex-1 overflow-y-auto">
        {tasks.map((task) => (
          <TaskCard 
            key={task.id}
            task={task} 
            onEdit={() => onEditTask(task)} 
            onDelete={onDeleteTask} 
            lang={lang}
          />
        ))}
      </div>
    </div>
  );
};

export default KanbanColumn;
