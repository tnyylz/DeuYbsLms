// Path: src/api/learningPath.api.ts
import api from './axiosInstance';
import type { LearningPathDto } from '../types';

export const getLearningPathsApi = async (): Promise<LearningPathDto[]> => {
    const response = await api.get('/LearningPath');
    return response.data;
};

export const getLearningPathByIdApi = async (id: string): Promise<LearningPathDto> => {
    const response = await api.get(`/LearningPath/${id}`);
    return response.data;
};

export const getTeacherPathsApi = async (): Promise<LearningPathDto[]> => {
    const response = await api.get('/teacher/learning-paths');
    return response.data;
};

export const createLearningPathApi = async (data: any): Promise<{ id: string }> => {
    const response = await api.post('/teacher/learning-paths', data);
    return response.data;
};

export const updateLearningPathApi = async (id: string, data: any): Promise<void> => {
    await api.put(`/teacher/learning-paths/${id}`, data);
};

export const deleteLearningPathApi = async (id: string): Promise<void> => {
    await api.delete(`/teacher/learning-paths/${id}`);
};

export const seedLearningPathsApi = async (): Promise<void> => {
    await api.post('/LearningPath/seed');
};
