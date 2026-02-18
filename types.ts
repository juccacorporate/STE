
export enum Region {
  BRAZIL = 'Brasil',
  ARGENTINA = 'Argentina',
  CHILE = 'Chile',
  SOUTH_AMERICA = 'South America'
}

export enum Category {
  PROJETOS = 'PROJETOS',
  QUALIDADE = 'QUALIDADE',
  PRODUTO = 'PRODUTO',
  FINANCEIRO = 'FINANCEIRO'
}

export enum Priority {
  ALTA = 'Alta',
  MEDIA = 'Média',
  BAIXA = 'Baixa'
}

export enum Status {
  CONCLUIDO = 'Concluído',
  EM_ANDAMENTO = 'Em andamento',
  NAO_INICIADO = 'Não iniciado'
}

export type Language = 'PT' | 'ES';

export interface Task {
  id: string;
  region: Region;
  title: string;
  description: string;
  action: string;
  category: Category;
  priority: Priority;
  owner: string;
  support: string;
  startDate: string;
  status: Status;
  progress: number;
  dueDate: string;
  escalation: string;
  notes: string;
  timeline: string;
}

export interface FilterState {
  region: Region | 'Todos';
  priority: Priority | 'Todos';
  owner: string | 'Todos';
  delayed: boolean | 'Todos';
  status: Status | 'Todos';
}
