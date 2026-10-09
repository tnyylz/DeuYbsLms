// Path: src/api/gamification.api.ts

import axiosInstance from './axiosInstance';
import type { StudentGamificationDto, LeaderboardDto } from '../types';

export const getGamificationApi = async (): Promise<StudentGamificationDto> => {
  const response = await axiosInstance.get('/Gamification/profile');
  return response.data.data ?? response.data;
};

export const getLeaderboardApi = async (top: number = 10): Promise<LeaderboardDto[]> => {
  const response = await axiosInstance.get(`/Gamification/leaderboard?top=${top}`);
  return response.data.data ?? response.data;
};

export const equipItemApi = async (inventoryItemId: string): Promise<{ isEquipped: boolean; message: string }> => {
  const response = await axiosInstance.post(`/Gamification/equip/${inventoryItemId}`);
  return response.data.data ?? response.data;
};