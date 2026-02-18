
import React, { useState } from 'react';
import { Task, Category, Language } from '../types';
import { translations } from '../i18n';
import TaskCard from './TaskCard';

interface DashboardProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
  lang: Language;
}

const Dashboard: React.FC<DashboardProps> = ({ tasks, onEditTask, lang }) => {
  const [hoveredTask, setHoveredTask] = useState<{ task: Task; rect: DOMRect } | null>(null);
  const categories = [Category.PROJETOS, Category.QUALIDADE, Category.PRODUTO, Category.FINANCEIRO];
  const t = translations[lang];

  const handleTaskHover = (task: Task | null, element?: HTMLElement) => {
    if (task && element) {
      setHoveredTask({ task, rect: element.getBoundingClientRect() });
    } else {
      setHoveredTask(null);
    }
  };

  const getCategoryTheme = (cat: Category) => {
    switch(cat) {
      case Category.PROJETOS: return { border: 'border-t-indigo-600', text: 'text-indigo-700', panelBg: 'bg-indigo-50/40' };
      case Category.QUALIDADE: return { border: 'border-t-emerald-600', text: 'text-emerald-700', panelBg: 'bg-emerald-50/40' };
      case Category.PRODUTO: return { border: 'border-t-amber-500', text: 'text-amber-700', panelBg: 'bg-amber-50/40' };
      case Category.FINANCEIRO: return { border: 'border-t-slate-600', text: 'text-slate-700', panelBg: 'bg-slate-50/40' };
      default: return { border: 'border-t-gray-400', text: 'text-gray-600', panelBg: 'bg-gray-50/40' };
    }
  };

  return (
    <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-4 h-full min-h-[75vh]">
      {categories.map((cat) => {
        const theme = getCategoryTheme(cat);
        const filteredTasks = tasks.filter(t => t.category === cat);
        
        return (
          <div key={cat} className={`flex flex-col rounded-2xl border border-gray-200/60 shadow-sm border-t-4 ${theme.border} ${theme.panelBg} backdrop-blur-[2px] transition-colors duration-300`}>
            <div className="p-4 flex justify-between items-center bg-white/40 rounded-t-xl border-b border-gray-100/20">
              <span className={`font-black tracking-widest text-[11px] uppercase ${theme.text}`}>
                {t.categories[cat as keyof typeof t.categories]}
              </span>
              <span className="bg-white/80 text-gray-500 text-[10px] font-black px-2.5 py-1 rounded-full shadow-sm">
                {filteredTasks.length}
              </span>
            </div>
            
            <div className="p-3 overflow-y-auto max-h-[70vh] custom-scrollbar">
              {filteredTasks.map(task => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  onEdit={onEditTask} 
                  lang={lang} 
                  onHover={handleTaskHover}
                />
              ))}
              
              {filteredTasks.length === 0 && (
                <div className="py-20 text-center text-gray-300 italic text-[10px] flex flex-col items-center gap-2 opacity-60">
                  <i className="fas fa-inbox text-3xl mb-2"></i>
                  {t.emptyCategory}
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Floating Detail Panel - Now in Sublte Lavender-Tinted Off-White */}
      {hoveredTask && (
        <div 
          className="fixed z-[100] w-80 bg-white/95 backdrop-blur-3xl border border-indigo-100 shadow-[0_25px_60px_rgba(79,70,229,0.12)] rounded-[2rem] p-7 pointer-events-none animate-in fade-in zoom-in-95 slide-in-from-top-4 duration-300 overflow-hidden"
          style={{
            top: `${Math.min(window.innerHeight - 340, Math.max(20, hoveredTask.rect.top - 15))}px`,
            left: `${hoveredTask.rect.right + 25 > window.innerWidth - 320 ? hoveredTask.rect.left - 335 : hoveredTask.rect.right + 25}px`
          }}
        >
          {/* Subtle Accent Background Element */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/30 rounded-full -mr-16 -mt-16 blur-3xl"></div>
          
          <div className="relative">
            <div className="font-black text-indigo-900 mb-5 border-b border-indigo-50 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-2 h-2 rounded-full bg-indigo-600 shadow-[0_0_10px_rgba(79,70,229,0.4)]"></div>
                <span className="uppercase tracking-[0.2em] text-[10px] font-black opacity-80">{t.insightTitle}</span>
              </div>
              <span className="text-[9px] text-indigo-700 bg-indigo-50/80 px-3 py-1 rounded-full font-black border border-indigo-100/50 uppercase">
                {hoveredTask.task.region}
              </span>
            </div>
            
            <div className="space-y-6">
              <div>
                <span className="text-[9px] font-black text-indigo-400 uppercase block mb-2 tracking-[0.15em]">{t.actionSteps}</span>
                <p className="text-gray-800 leading-relaxed font-bold text-[14px]">
                  {hoveredTask.task.action}
                </p>
              </div>
              
              {hoveredTask.task.notes && (
                <div className="bg-indigo-50/30 p-4 rounded-2xl border border-indigo-50/50">
                  <p className="text-indigo-900/60 italic leading-snug text-[11px] font-medium">
                    "{hoveredTask.task.notes}"
                  </p>
                </div>
              )}
            </div>
            
            <div className="mt-6 pt-5 border-t border-indigo-50 text-[9px] font-black text-indigo-400 flex justify-between items-center uppercase tracking-[0.2em]">
               <div className="flex items-center gap-2">
                 <div className={`w-1.5 h-1.5 rounded-full ${hoveredTask.task.status === 'Concluído' ? 'bg-emerald-500' : 'bg-indigo-600'}`}></div>
                 {t.statuses[hoveredTask.task.status as keyof typeof t.statuses]}
               </div>
               <span className="text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded font-black">{hoveredTask.task.progress}%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
