// Path: src/api/league.api.ts

import axiosInstance from './axiosInstance';
import type { LeagueLeaderboardDto } from '../types';

export const getMyLeagueLeaderboardApi = async (): Promise<LeagueLeaderboardDto> => {
  const res = await axiosInstance.get('/League/leaderboard');
  return res.data;
};

export const ensureInLeagueGroupApi = async (): Promise<{ leagueGroupId: string }> => {
  const res = await axiosInstance.post('/League/ensure-group');
  return res.data;
};
