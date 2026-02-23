
import { Task } from '../types';

const API_URL = 'https://sheetdb.io/api/v1/qfvxr8lu43heq';

export const api = {
  // Buscar todas as tarefas
  async getTasks(): Promise<Task[]> {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro HTTP ${response.status}: ${errorText}`);
      }
      const data = await response.json();
      return data.map((item: any) => {
        // Handle progress conversion from decimal (0.5) to percentage (50)
        let progressValue = 0;
        if (item.progress !== undefined && item.progress !== null && item.progress !== '') {
          // If it's already a string with '%', parse it
          if (typeof item.progress === 'string' && item.progress.includes('%')) {
            progressValue = parseFloat(item.progress.replace('%', ''));
          } else {
            // If it's a decimal from sheets (e.g. 0.5 for 50%), multiply by 100
            const rawValue = parseFloat(item.progress);
            progressValue = rawValue <= 1 ? Math.round(rawValue * 100) : Math.round(rawValue);
          }
        }
        
        return {
          ...item,
          progress: progressValue,
        };
      });
    } catch (error) {
      console.error('Erro detalhado ao buscar tarefas:', error);
      throw error;
    }
  },

  // Criar uma nova tarefa
  async createTask(task: Task): Promise<void> {
    try {
      // Convert progress to decimal for Google Sheets percentage format
      const taskToSave = {
        ...task,
        progress: task.progress !== undefined ? task.progress / 100 : 0
      };

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: [taskToSave] }),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro HTTP ${response.status}: ${errorText}`);
      }
    } catch (error) {
      console.error('Erro detalhado ao criar tarefa:', error);
      throw error;
    }
  },

  // Atualizar uma tarefa existente
  async updateTask(id: string, task: Partial<Task>): Promise<void> {
    try {
      // Convert progress to decimal for Google Sheets percentage format
      const taskToUpdate = { ...task };
      if (taskToUpdate.progress !== undefined) {
        taskToUpdate.progress = taskToUpdate.progress / 100;
      }

      const response = await fetch(`${API_URL}/id/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: taskToUpdate }),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro HTTP ${response.status}: ${errorText}`);
      }
    } catch (error) {
      console.error('Erro detalhado ao atualizar tarefa:', error);
      throw error;
    }
  },

  // Excluir uma tarefa
  async deleteTask(id: string): Promise<void> {
    try {
      const response = await fetch(`${API_URL}/id/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro HTTP ${response.status}: ${errorText}`);
      }
    } catch (error) {
      console.error('Erro detalhado ao excluir tarefa:', error);
      throw error;
    }
  }
};
