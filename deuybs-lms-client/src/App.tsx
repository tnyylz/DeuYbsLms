// Path: src/App.tsx

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';

// Public
import LandingPage from './pages/public/LandingPage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';

// Student
import StudentDashboard from './pages/student/StudentDashboard';
import CoursesPage from './pages/student/CoursesPage';
import CourseDetailPage from './pages/student/CourseDetailPage';
import SkillTreePage from './pages/student/SkillTreePage';
import LearningRoom from './pages/student/LearningRoom';
import CertificatesPage from './pages/student/CertificatesPage';
import ProfilePage from './pages/student/ProfilePage';

// Teacher
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import CourseBuilder from './pages/teacher/CourseBuilder';
import AnalyticsPage from './pages/teacher/AnalyticsPage';

import { Toaster } from 'react-hot-toast';

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-center" reverseOrder={false} />
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Student */}
        <Route path="/student/dashboard" element={<ProtectedRoute role="Student"><StudentDashboard /></ProtectedRoute>} />
        <Route path="/courses" element={<ProtectedRoute role="Student"><CoursesPage /></ProtectedRoute>} />
        <Route path="/course/:courseId/detail" element={<ProtectedRoute role="Student"><CourseDetailPage /></ProtectedRoute>} />
        <Route path="/course/:courseId/skill-tree" element={<ProtectedRoute role="Student"><SkillTreePage /></ProtectedRoute>} />
        <Route path="/course/:courseId/lesson/:lessonId" element={<ProtectedRoute role="Student"><LearningRoom /></ProtectedRoute>} />
        <Route path="/student/certificates" element={<ProtectedRoute role="Student"><CertificatesPage /></ProtectedRoute>} />
        <Route path="/student/profile" element={<ProtectedRoute role="Student"><ProfilePage /></ProtectedRoute>} />

        {/* Teacher */}
        <Route path="/teacher/dashboard" element={<ProtectedRoute role="Teacher"><TeacherDashboard /></ProtectedRoute>} />
        <Route path="/teacher/course-builder" element={<ProtectedRoute role="Teacher"><CourseBuilder /></ProtectedRoute>} />
        <Route path="/teacher/course-builder/:courseId" element={<ProtectedRoute role="Teacher"><CourseBuilder /></ProtectedRoute>} />
        <Route path="/teacher/analytics" element={<ProtectedRoute role="Teacher"><AnalyticsPage /></ProtectedRoute>} />
        <Route path="/teacher/analytics/:courseId" element={<ProtectedRoute role="Teacher"><AnalyticsPage /></ProtectedRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}