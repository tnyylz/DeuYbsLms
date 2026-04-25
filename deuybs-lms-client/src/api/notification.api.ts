// Path: src/api/notification.api.ts

import axiosInstance from './axiosInstance';
import type { NotificationDto } from '../types';

export const getNotificationsApi = async (count = 20): Promise<NotificationDto[]> => {
  const res = await axiosInstance.get(`/Notification?count=${count}`);
  return res.data;
};

export const getUnreadCountApi = async (): Promise<number> => {
  const res = await axiosInstance.get('/Notification/unread-count');
  return res.data;
};

export const markAsReadApi = async (id: string): Promise<void> => {
  await axiosInstance.post(`/Notification/${id}/read`);
};

export const markAllAsReadApi = async (): Promise<void> => {
  await axiosInstance.post('/Notification/read-all');
};
