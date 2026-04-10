// Path: src/types/index.ts

export interface Result<T = any> {
  isSuccess: boolean;
  isFailure: boolean;
  errorMessage: string | null;
  data: T | null;
}
// ===== AUTH =====
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  studentNumber: string;
}

export interface AuthResponse {
  token: string;
  userId: string;
  fullName: string;
  email: string;
  role: string;
}

export interface UserInfo {
  userId: string;
  email: string;
  fullName: string;
  role: 'Student' | 'Teacher';
}

// ===== COURSE =====
export interface CourseDto {
  id: string;
  title: string;
  description: string;
  level: string;
  lessonCount: number;
  totalXpReward: number;
  teacherName: string;
}

export interface CourseDetailDto {
  id: string;
  title: string;
  description: string;
  level: string;
  lessonCount: number;
  totalXpReward: number;
  teacherName: string;
  lessons: LessonDto[];
}

export interface LessonDto {
  id: string;
  title: string;
  orderIndex: number;
  videoUrl: string;
  durationInSeconds: number;
  xpReward: number;
  hasQuiz: boolean;
  quizMinPassingScore?: number;
}

// ===== PROGRESS =====
export interface CourseProgressDto {
  courseId: string;
  courseTitle: string;
  totalLessons: number;
  completedLessons: number;
  completionPercentage: number;
  isCompleted: boolean;
  lessonProgresses: LessonProgressDto[];
}

export interface EnrollmentDto {
  enrollmentId: string;
  courseId: string;
  courseTitle: string;
  enrolledAt: string;
  isCourseCompleted: boolean;
  completedLessonsCount: number;
  totalLessonsCount: number;
  progressPercentage: number;
}

export interface LessonProgressDto {
  lessonId: string;
  lessonTitle: string;
  orderIndex: number;
  isUnlocked: boolean;
  isVideoCompleted: boolean;
  isQuizPassed: boolean;
  lastQuizScore?: number;
  quizAttemptCount: number;
}

export interface QuizResultDto {
  lessonId: string;
  score: number;
  isPassed: boolean;
  correctAnswers: number;
  totalQuestions: number;
  minimumPassingScore: number;
  attemptCount: number;
  nextLessonUnlocked: boolean;
  nextLessonId?: string;
  xpEarned: number;
  message: string;
  isCourseCompleted?: boolean;
  earnedBadge?: string | null;
}

export interface QuestionDto {
  id: string;
  questionText: string;
  options: AnswerOptionDto[];
}

export interface AnswerOptionDto {
  id: string;
  optionText: string;
}

// ===== GAMIFICATION =====
export interface StudentGamificationDto {
  totalXp: number;
  currentLevel: number;
  xpToNextLevel: number;
  xpProgressPercent: number;
  rank: number;
  completedQuizCount: number;
  badges: BadgeDto[];
}

export interface BadgeDto {
  badgeType: string;
  displayName: string;
  description: string;
  iconEmoji: string;
  earnedAt: string;
}

// ===== TEACHER =====
export interface TeacherDashboardDto {
  totalCourses: number;
  totalStudents: number;
  totalEnrollments: number;
  courses: TeacherCourseDto[];
}

export interface TeacherCourseDto {
  id: string;
  title: string;
  enrollmentCount: number;
  lessonCount: number;
}

export interface StudentAnalyticsDto {
  studentId: string;
  fullName: string;
  email: string;
  courseTitle: string;
  completedLessons: number;
  totalLessons: number;
  completionPercentage: number;
  failedQuizAttempts: number;
  isRedFlag: boolean;
}

export interface CreateCourseRequest {
  title: string;
  description: string;
  level: string;
}

export interface CreateLessonRequest {
  title: string;
  videoUrl: string;
  durationInSeconds: number;
  xpReward: number;
  orderIndex: number;
}

export interface CreateQuizRequest {
  lessonId: string;
  minimumPassingScore: number;
  questions: CreateQuestionRequest[];
}

export interface CreateQuestionRequest {
  questionText: string;
  options: CreateOptionRequest[];
}

export interface CreateOptionRequest {
  optionText: string;
  isCorrect: boolean;
}

// ===== CERTIFICATE =====
export interface CertificateDto {
  id: string;
  studentName: string;
  courseTitle: string;
  uniqueVerificationCode: string;
  issuedAt: string;
  pdfStoragePath?: string;
}