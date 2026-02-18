import React from 'react';
import { Task, Language, Status } from '../types';
import { translations } from '../i18n';
import KanbanColumn from './KanbanColumn'; // <-- Caminho corrigido aqui

interface Props {
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  lang: Language;
}

const Dashboard: React.FC<Props> = ({ tasks, onEditTask, onDeleteTask, lang }) => {
  const t = translations[lang];

  // Filtra as tarefas por status para cada coluna do Kanban
  const projects = tasks.filter(task => task.category === 'PROJETOS');
  const quality = tasks.filter(task => task.category === 'QUALIDADE');
  const product = tasks.filter(task => task.category === 'PRODUTO');
  const finance = tasks.filter(task => task.category === 'FINANCEIRO');

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-4">
      <KanbanColumn title={t.categories.PROJETOS} tasks={projects} onEditTask={onEditTask} onDeleteTask={onDeleteTask} lang={lang} />
      <KanbanColumn title={t.categories.QUALIDADE} tasks={quality} onEditTask={onEditTask} onDeleteTask={onDeleteTask} lang={lang} />
      <KanbanColumn title={t.categories.PRODUTO} tasks={product} onEditTask={onEditTask} onDeleteTask={onDeleteTask} lang={lang} />
      <KanbanColumn title={t.categories.FINANCEIRO} tasks={finance} onEditTask={onEditTask} onDeleteTask={onDeleteTask} lang={lang} />
    </div>
  );
};

export default Dashboard;
