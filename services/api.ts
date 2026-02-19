
import { Task } from '../types';

const API_URL = 'https://sheetdb.io/api/v1/87hsv43fnej';

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
      return data.map((item: any) => ({
        ...item,
        progress: parseInt(item.progress) || 0,
      }));
    } catch (error) {
      console.error('Erro detalhado ao buscar tarefas:', error);
      throw error;
    }
  },

  // Criar uma nova tarefa
  async createTask(task: Task): Promise<void> {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: [task] }),
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
      const response = await fetch(`${API_URL}/id/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: task }),
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
