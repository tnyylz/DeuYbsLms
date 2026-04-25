// Path: src/api/kanban.api.ts

import axiosInstance from './axiosInstance';

export const KanbanStatus = {
  Recommended: 'Recommended',
  ToDo: 'ToDo',
  InProgress: 'InProgress',
  Revisit: 'Revisit',
  Done: 'Done'
} as const;

export type KanbanStatus = (typeof KanbanStatus)[keyof typeof KanbanStatus];

export interface KanbanCard {
  courseId: string;
  title: string;
  thumbnailUrl?: string;
  instructorName: string;
  progressPercentage: number;
  totalLessons: number;
  completedLessons: number;
  lastAccessed?: string;
}

export interface KanbanColumn {
  status: KanbanStatus;
  title: string;
  cards: KanbanCard[];
}

export interface KanbanBoard {
  columns: KanbanColumn[];
}

export const kanbanApi = {
  getBoard: async (): Promise<KanbanBoard> => {
    const response = await axiosInstance.get('/kanban');
    return response.data;
  },
  moveCard: async (courseId: string, newStatus: KanbanStatus): Promise<void> => {
    await axiosInstance.post('/kanban/move', { courseId, newStatus });
  }
};
