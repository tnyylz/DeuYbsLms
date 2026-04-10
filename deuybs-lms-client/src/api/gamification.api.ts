// Path: src/api/gamification.api.ts

import axiosInstance from './axiosInstance';
import type { StudentGamificationDto } from '../types';

export const getGamificationApi = async (): Promise<StudentGamificationDto> => {
  const response = await axiosInstance.get('/Gamification/profile');
  return response.data.data ?? response.data;
};