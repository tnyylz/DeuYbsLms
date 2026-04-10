// Path: src/api/progress.api.ts

import axiosInstance from './axiosInstance';
import type { CourseProgressDto, QuizResultDto, Result, EnrollmentDto } from '../types';

export const enrollApi = async (courseId: string): Promise<boolean> => {
  const response = await axiosInstance.post<Result<boolean>>(`/Progress/enroll/${courseId}`);
  return response.data.data!;
};

export const getMyEnrollmentsApi = async (): Promise<EnrollmentDto[]> => {
  const response = await axiosInstance.get('/Progress/my-enrollments');
  return response.data.data ?? response.data;
};

export const completeVideoApi = async (lessonId: string): Promise<void> => {
  await axiosInstance.post(`/Progress/complete-video?lessonId=${lessonId}`);
};

export const getCourseProgressApi = async (courseId: string): Promise<CourseProgressDto> => {
  const response = await axiosInstance.get<Result<CourseProgressDto>>(`/Progress/course/${courseId}`);
  return response.data.data!;
};

export const submitQuizApi = async (
  lessonId: string,
  answers: { questionId: string; selectedAnswerOptionId: string }[]
): Promise<QuizResultDto> => {
  const response = await axiosInstance.post(`/Progress/submit-quiz`, { lessonId, answers });
  return response.data.data ?? response.data;
}; 