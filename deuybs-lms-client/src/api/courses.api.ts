// Path: src/api/courses.api.ts

import axiosInstance from './axiosInstance';
import type { CourseDto, CourseDetailDto, CreateCourseRequest, CreateLessonRequest, CreateQuizRequest, QuestionDto } from '../types';

export const getCoursesApi = async (): Promise<CourseDto[]> => {
  const response = await axiosInstance.get('/Course');
  return response.data.data ?? response.data;
};

export const getCourseDetailApi = async (id: string): Promise<CourseDetailDto> => {
  const response = await axiosInstance.get(`/Course/${id}`);
  return response.data.data ?? response.data;
};

export const createCourseApi = async (data: CreateCourseRequest): Promise<string> => {
  const response = await axiosInstance.post('/Course', data);
  return response.data.data ?? response.data;
};

export const createLessonApi = async (courseId: string, data: CreateLessonRequest): Promise<string> => {
  const response = await axiosInstance.post(`/Course/${courseId}/lessons`, data);
  return response.data.data ?? response.data;
};

export const createQuizApi = async (data: CreateQuizRequest): Promise<string> => {
  const response = await axiosInstance.post('/Quiz', data);
  return response.data.data ?? response.data;
};

export const getQuizQuestionsApi = async (lessonId: string): Promise<QuestionDto[]> => {
  const response = await axiosInstance.get(`/Quiz/lesson/${lessonId}/questions`);
  return response.data.data ?? response.data;
};

export const getCourseQuizQuestionsApi = async (courseId: string): Promise<QuestionDto[]> => {
  const response = await axiosInstance.get(`/Quiz/course/${courseId}/questions`);
  return response.data.data ?? response.data;
};