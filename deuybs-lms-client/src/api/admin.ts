import api from './axiosInstance';
import type { AdminCourseAssignmentDto } from '../types';

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
  totalStudents: number;
  totalTeachers: number;
  totalCompletedEnrollments: number;
  monthlyRegistrations: MonthlyRegistration[];
  monthlyEnrollments: MonthlyRegistration[];
  monthlyCompletedLessons: MonthlyRegistration[];
  monthlyCertificates: MonthlyRegistration[];
  studentLeaderboard: { fullName: string, totalXp: number, level: number }[];
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

  createUser: async (data: any): Promise<void> => {
    await api.post('/Admin/users', data);
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
  },

  assignCourse: async (courseId: string, data: AdminCourseAssignmentDto): Promise<void> => {
    await api.post(`/Admin/courses/${courseId}/assign`, data);
  },

  getCourseAnalytics: async (courseId: string): Promise<AdminCourseAnalytics> => {
    const response = await api.get(`/Admin/courses/${courseId}/analytics`);
    return response.data;
  }
};

export interface AdminLessonAnalytics {
  lessonId: string;
  title: string;
  orderIndex: number;
  hasQuiz: boolean;
  totalViews: number;
  quizPassCount: number;
  quizPassRate: number;
  completionRate: number;
}

export interface AdminStudentSegmentation {
  segment0to20: number;
  segment21to50: number;
  segment51to80: number;
  segment81to99: number;
  segment100: number;
}

export interface AdminCourseStudent {
  fullName: string;
  studentNumber: string;
  email: string;
  completionPercentage: number;
  failedQuizAttempts: number;
  enrolledAt: string;
}

export interface AdminCourseAnalytics {
  courseId: string;
  courseTitle: string;
  teacherName: string;
  lessonCount: number;
  createdAt: string;
  totalEnrolled: number;
  totalCompleted: number;
  completionRate: number;
  averageProgressRate: number;
  finalExamPassRate: number;
  lessons: AdminLessonAnalytics[];
  monthlyEnrollmentTrends: MonthlyRegistration[];
  monthlyCompletionTrends: MonthlyRegistration[];
  segmentation: AdminStudentSegmentation;
  students: AdminCourseStudent[];
}
