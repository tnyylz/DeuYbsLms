// Path: src/api/challenge.api.ts

import axiosInstance from './axiosInstance';
import type { ChallengeDto, XpResultDto } from '../types';

export const getMyChallengesApi = async (): Promise<ChallengeDto[]> => {
  const res = await axiosInstance.get('/Challenge/my');
  return res.data;
};

export const claimChallengeRewardApi = async (challengeId: string): Promise<XpResultDto> => {
  const res = await axiosInstance.post(`/Challenge/claim/${challengeId}`);
  return res.data;
};
