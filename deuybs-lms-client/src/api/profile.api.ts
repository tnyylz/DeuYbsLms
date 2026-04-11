import axiosInstance from './axiosInstance';
import type { StudentProfileDto, UpdateProfileRequest } from '../types';

export const getProfileApi = async (): Promise<StudentProfileDto> => {
  const res = await axiosInstance.get('/Profile');
  return res.data;
};

export const updateProfileApi = async (data: UpdateProfileRequest): Promise<{ message: string }> => {
  const res = await axiosInstance.put('/Profile', data);
  return res.data;
};
