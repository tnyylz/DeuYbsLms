import api from './axiosInstance';

export interface SystemAnnouncement {
  id: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  targetRole: string;
  isActive: boolean;
  createdAt: string;
}

export interface CreateAnnouncementRequest {
  message: string;
  type: string;
  targetRole: string;
}

export const announcementApi = {
  getActive: async (role?: string): Promise<SystemAnnouncement | null> => {
    const response = await api.get('/Announcement/active', {
      params: { role }
    });
    return response.data;
  },

  getAll: async (): Promise<SystemAnnouncement[]> => {
    const response = await api.get('/Announcement');
    return response.data;
  },

  create: async (data: CreateAnnouncementRequest): Promise<SystemAnnouncement> => {
    const response = await api.post('/Announcement', data);
    return response.data;
  },

  toggle: async (id: string): Promise<void> => {
    await api.put(`/Announcement/${id}/toggle`);
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/Announcement/${id}`);
  }
};
