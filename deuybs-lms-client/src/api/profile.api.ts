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

export const changePasswordApi = async (data: any): Promise<{ message: string }> => {
  const res = await axiosInstance.post('/Profile/change-password', data);
  return res.data;
};
