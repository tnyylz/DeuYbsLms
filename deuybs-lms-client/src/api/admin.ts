import api from './axiosInstance';

export interface MonthlyRegistration {
  month: string;
  count: number;
}

export interface AdminTopCourse {
  id: string;
  title: string;
  enrollmentCount: number;
}

export interface AdminRecentActivity {
  message: string;
  createdAt: string;
}

export interface AdminDashboardStats {
  totalUsers: number;
  totalCourses: number;
  totalEnrollments: number;
  monthlyRegistrations: MonthlyRegistration[];
  topCourses: AdminTopCourse[];
  recentActivities: AdminRecentActivity[];
}

export interface AdminUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string | number; // Support both for flexibility
  isActive: boolean;
  createdAt: string;
}

export interface AdminUserEnrollment {
  courseId: string;
  courseTitle: string;
  enrolledAt: string;
  isCompleted: boolean;
  progressPercentage: number;
}

export interface AdminUserDetail extends AdminUser {
  totalXp: number;
  currentLevel: number;
  enrolledCoursesCount: number;
  completedCoursesCount: number;
  enrollments: AdminUserEnrollment[];
}

export interface AdminCourse {
  id: string;
  title: string;
  teacherName: string;
  level: number;
  isPublished: boolean;
  enrollmentCount: number;
  createdAt: string;
}

export const adminApi = {
  getDashboardStats: async (): Promise<AdminDashboardStats> => {
    const response = await api.get('/Admin/dashboard-stats');
    return response.data;
  },

  getAllUsers: async (): Promise<AdminUser[]> => {
    const response = await api.get('/Admin/users');
    return response.data;
  },

  getUserDetail: async (userId: string): Promise<AdminUserDetail> => {
    const response = await api.get(`/Admin/users/${userId}`);
    return response.data;
  },

  updateUserRole: async (userId: string, role: number): Promise<void> => {
    await api.put(`/Admin/users/${userId}/role`, role, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  },

  toggleUserStatus: async (userId: string): Promise<void> => {
    await api.put(`/Admin/users/${userId}/toggle-status`);
  },

  getAllCourses: async (): Promise<AdminCourse[]> => {
    const response = await api.get('/Admin/courses');
    return response.data;
  },

  deleteCourse: async (courseId: string): Promise<void> => {
    await api.delete(`/Admin/courses/${courseId}`);
  },

  // Challenge Management
  getAllChallenges: async (): Promise<any[]> => {
    const response = await api.get('/Admin/challenges');
    return response.data;
  },

  createChallenge: async (data: any): Promise<void> => {
    await api.post('/Admin/challenges', data);
  },

  updateChallenge: async (id: string, data: any): Promise<void> => {
    await api.put(`/Admin/challenges/${id}`, data);
  },

  deleteChallenge: async (id: string): Promise<void> => {
    await api.delete(`/Admin/challenges/${id}`);
  },

  // Shop Management
  getAllShopItems: async (): Promise<any[]> => {
    const response = await api.get('/Admin/shop-items');
    return response.data;
  },

  createShopItem: async (data: any): Promise<void> => {
    await api.post('/Admin/shop-items', data);
  },

  updateShopItem: async (id: string, data: any): Promise<void> => {
    await api.put(`/Admin/shop-items/${id}`, data);
  },

  deleteShopItem: async (id: string): Promise<void> => {
    await api.delete(`/Admin/shop-items/${id}`);
  }
};
