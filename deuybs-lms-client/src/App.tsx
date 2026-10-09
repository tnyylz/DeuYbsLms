// Path: src/App.tsx

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';

// Public
import LandingPage from './pages/public/LandingPage';
import LoginPage from './pages/public/LoginPage';
import VerifyCertificatePage from './pages/public/VerifyCertificatePage';

// Student
import StudentDashboard from './pages/student/StudentDashboard';
import CoursesPage from './pages/student/CoursesPage';
import CourseDetailPage from './pages/student/CourseDetailPage';
import SkillTreePage from './pages/student/SkillTreePage';
import LearningRoom from './pages/student/LearningRoom';
import CertificatesPage from './pages/student/CertificatesPage';
import ShopPage from './pages/student/ShopPage';
import ProfilePage from './pages/student/ProfilePage';
import LearningPathsPage from './pages/student/LearningPathsPage';
import LearningPathDetailPage from './pages/student/LearningPathDetailPage';

import LearningKanban from './pages/student/LearningKanban';

// Teacher
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import TeacherLearningPathsPage from './pages/teacher/TeacherLearningPathsPage';
import LearningPathBuilderPage from './pages/teacher/LearningPathBuilderPage';
import TeacherCourseDetailPage from './pages/teacher/TeacherCourseDetailPage';
import TeacherLessonBuilder from './pages/teacher/TeacherLessonBuilder';
import AnalyticsPage from './pages/teacher/AnalyticsPage';

import TeacherFinalExamBuilder from './pages/teacher/TeacherFinalExamBuilder';

// Admin
import AdminLayout from './components/layout/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import CourseList from './pages/admin/CourseList';
import AnnouncementManagement from './pages/admin/AnnouncementManagement.tsx';
import ChallengeManagement from './pages/admin/ChallengeManagement';
import ShopManagement from './pages/admin/ShopManagement';
import GlobalAnnouncement from './components/shared/GlobalAnnouncement';
import AdminCourseAnalyticsPage from './pages/admin/AdminCourseAnalyticsPage';

import { Toaster } from 'react-hot-toast';

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-center" reverseOrder={false} />
      <GlobalAnnouncement />
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/verify/:code" element={<VerifyCertificatePage />} />

        {/* Student */}
        <Route path="/student/dashboard" element={<ProtectedRoute role="Student"><StudentDashboard /></ProtectedRoute>} />
        <Route path="/courses" element={<ProtectedRoute role="Student"><CoursesPage /></ProtectedRoute>} />
        <Route path="/course/:courseId/detail" element={<ProtectedRoute role="Student"><CourseDetailPage /></ProtectedRoute>} />
        <Route path="/course/:courseId/skill-tree" element={<ProtectedRoute role="Student"><SkillTreePage /></ProtectedRoute>} />
        <Route path="/course/:courseId/lesson/:lessonId" element={<ProtectedRoute role="Student"><LearningRoom /></ProtectedRoute>} />
        <Route path="/course/:courseId/final-exam" element={<ProtectedRoute role="Student"><LearningRoom isFinalExam={true} /></ProtectedRoute>} />
        <Route path="/student/certificates" element={<ProtectedRoute role="Student"><CertificatesPage /></ProtectedRoute>} />
        <Route path="/student/shop" element={<ProtectedRoute role="Student"><ShopPage /></ProtectedRoute>} />
        <Route path="/student/profile" element={<ProtectedRoute role="Student"><ProfilePage /></ProtectedRoute>} />
        <Route path="/student/learning-paths" element={<ProtectedRoute role="Student"><LearningPathsPage /></ProtectedRoute>} />
        <Route path="/student/learning-path/:pathId" element={<ProtectedRoute role="Student"><LearningPathDetailPage /></ProtectedRoute>} />

        <Route path="/student/kanban" element={<ProtectedRoute role="Student"><LearningKanban /></ProtectedRoute>} />

        {/* Teacher */}
        <Route path="/teacher/dashboard" element={<ProtectedRoute role="Teacher"><TeacherDashboard /></ProtectedRoute>} />
        <Route path="/teacher/learning-paths" element={<ProtectedRoute role="Teacher"><TeacherLearningPathsPage /></ProtectedRoute>} />
        <Route path="/teacher/learning-path-builder" element={<ProtectedRoute role="Teacher"><LearningPathBuilderPage /></ProtectedRoute>} />
        <Route path="/teacher/learning-path-builder/:id" element={<ProtectedRoute role="Teacher"><LearningPathBuilderPage /></ProtectedRoute>} />
        <Route path="/teacher/course/:courseId" element={<ProtectedRoute role="Teacher"><TeacherCourseDetailPage /></ProtectedRoute>} />
        <Route path="/teacher/course/:courseId/lesson/new" element={<ProtectedRoute role="Teacher"><TeacherLessonBuilder /></ProtectedRoute>} />
        <Route path="/teacher/course/:courseId/lesson/:lessonId" element={<ProtectedRoute role="Teacher"><TeacherLessonBuilder /></ProtectedRoute>} />
        <Route path="/teacher/course/:courseId/final-exam" element={<ProtectedRoute role="Teacher"><TeacherFinalExamBuilder /></ProtectedRoute>} />
        <Route path="/teacher/analytics" element={<ProtectedRoute role="Teacher"><AnalyticsPage /></ProtectedRoute>} />
        <Route path="/teacher/analytics/:courseId" element={<ProtectedRoute role="Teacher"><AnalyticsPage /></ProtectedRoute>} />

        {/* Admin */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="courses" element={<CourseList />} />
          <Route path="courses/:courseId/analytics" element={<AdminCourseAnalyticsPage />} />
          <Route path="announcements" element={<AnnouncementManagement />} />
          <Route path="challenges" element={<ChallengeManagement />} />
          <Route path="shop" element={<ShopManagement />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}