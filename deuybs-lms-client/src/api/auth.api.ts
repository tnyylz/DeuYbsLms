// Path: src/api/auth.api.ts

import axiosInstance from './axiosInstance';
import type { AuthResponse, LoginRequest, RegisterRequest } from '../types';

export const loginApi = async (data: LoginRequest): Promise<AuthResponse> => {
  const response = await axiosInstance.post('/Auth/login', data);
  return response.data.data ?? response.data;
};

export const registerApi = async (data: RegisterRequest): Promise<AuthResponse> => {
  const response = await axiosInstance.post('/Auth/register', data);
  return response.data.data ?? response.data;
};