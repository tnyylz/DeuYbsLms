// Path: src/api/teacher.api.ts

import axiosInstance from './axiosInstance';
import type { TeacherDashboardDto, StudentAnalyticsDto, CreateCourseRequest, CreateLessonRequest, CreateQuizRequest } from '../types';

export const getTeacherDashboardApi = async (): Promise<TeacherDashboardDto> => {
  const res = await axiosInstance.get('/Teacher/dashboard');
  return res.data;
};

export const getCourseAnalyticsApi = async (courseId?: string): Promise<StudentAnalyticsDto[]> => {
  const url = courseId ? `/Teacher/analytics/${courseId}` : '/Teacher/analytics';
  const res = await axiosInstance.get(url);
  return res.data;
};

export const updateCourseApi = async (id: string, data: Partial<CreateCourseRequest>) => {
  await axiosInstance.put(`/Course/${id}`, data);
};

export const uploadThumbnailApi = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  const res = await axiosInstance.post('/Upload?folder=thumbnails', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data.url;
};

export const createLessonApi = async (data: CreateLessonRequest): Promise<string> => {
  const res = await axiosInstance.post('/Lesson', data);
  return res.data;
};

export const updateLessonApi = async (id: string, data: Partial<CreateLessonRequest>) => {
  await axiosInstance.put(`/Lesson/${id}`, data);
};

export const deleteLessonApi = async (id: string) => {
  await axiosInstance.delete(`/Lesson/${id}`);
};

export const reorderLessonsApi = async (orders: { id: string, orderIndex: number }[]) => {
  await axiosInstance.post('/Lesson/reorder', orders);
};

export const createOrUpdateQuizApi = async (data: CreateQuizRequest): Promise<string> => {
  const res = await axiosInstance.post('/Quiz', data);
  return res.data;
};
