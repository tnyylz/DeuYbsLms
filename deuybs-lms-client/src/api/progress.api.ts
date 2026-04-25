// Path: src/api/progress.api.ts

import axiosInstance from './axiosInstance';
import type { CourseProgressDto, QuizResultDto, Result, EnrollmentDto, LessonProgressDto } from '../types';

export const enrollApi = async (courseId: string): Promise<boolean> => {
  const response = await axiosInstance.post(`/Progress/enroll/${courseId}`);
  return response.status === 200 || response.data.isSuccess;
};

export const getMyEnrollmentsApi = async (): Promise<EnrollmentDto[]> => {
  const response = await axiosInstance.get('/Progress/my-enrollments');
  return response.data.data ?? response.data;
};

export const completeVideoApi = async (lessonId: string): Promise<LessonProgressDto> => {
  const response = await axiosInstance.post(`/Progress/complete-video/${lessonId}`);
  return response.data.data ?? response.data;
};

export const getCourseProgressApi = async (courseId: string): Promise<CourseProgressDto> => {
  const response = await axiosInstance.get(`/Progress/${courseId}`);
  return response.data.data ?? response.data;
};

export const submitQuizApi = async (
  lessonId: string,
  answers: { questionId: string; selectedAnswerOptionId: string }[]
): Promise<QuizResultDto> => {
  const response = await axiosInstance.post(`/Progress/submit-quiz`, { lessonId, answers });
  return response.data.data ?? response.data;
};

export const updateVideoProgressApi = async (lessonId: string, second: number): Promise<void> => {
  await axiosInstance.post(`/Progress/update-video-progress/${lessonId}`, second, {
    headers: { 'Content-Type': 'application/json' }
  });
};