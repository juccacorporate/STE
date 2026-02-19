import React from 'react';
import { Task, Language } from '../types';
import { translations } from '../i18n';
import KanbanColumn from './KanbanColumn';

interface Props { tasks: Task[]; onEditTask: (task: Task) => void; onDeleteTask: (id: string) => void; lang: Language; }

const Dashboard: React.FC<Props> = ({ tasks, onEditTask, onDeleteTask, lang }) => {
  const t = translations[lang];
  const categories = ['PROJETOS', 'QUALIDADE', 'PRODUTO', 'FINANCEIRO'];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-4 pb-10">
      {categories.map(cat => (
        <KanbanColumn key={cat} title={cat} tasks={tasks.filter(t => t.category === cat)} onEditTask={onEditTask} onDeleteTask={onDeleteTask} lang={lang} />
      ))}
    </div>
  );
};
export default Dashboard;
