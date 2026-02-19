
import { Task } from '../types';

const API_URL = 'https://sheetdb.io/api/v1/87hsv43fnej';

export const api = {
  // Buscar todas as tarefas
  async getTasks(): Promise<Task[]> {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('Erro ao buscar tarefas');
    const data = await response.json();
    return data.map((item: any) => ({
      ...item,
      progress: parseInt(item.progress) || 0,
    }));
  },

  // Criar uma nova tarefa
  async createTask(task: Task): Promise<void> {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: [task] }),
    });
    if (!response.ok) throw new Error('Erro ao criar tarefa');
  },

  // Atualizar uma tarefa existente
  async updateTask(id: string, task: Partial<Task>): Promise<void> {
    const response = await fetch(`${API_URL}/id/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: task }),
    });
    if (!response.ok) throw new Error('Erro ao atualizar tarefa');
  },

  // Excluir uma tarefa
  async deleteTask(id: string): Promise<void> {
    const response = await fetch(`${API_URL}/id/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error('Erro ao excluir tarefa');
  }
};
