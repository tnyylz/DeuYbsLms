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
  thumbnailUrl?: string;
  level: string;
  lessonCount: number;
  totalDurationInSeconds: number;
  totalXpReward: number;
  teacherName: string;
  tags: string[];
}

export interface CourseDetailDto {
  id: string;
  title: string;
  description: string;
  thumbnailUrl?: string;
  level: string;
  lessonCount: number;
  totalXpReward: number;
  teacherName: string;
  lessons: LessonDto[];
  tags: string[];
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
  thumbnailUrl?: string;
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
  currentStreak: number;
  xpMultiplier: number;
  badges: BadgeDto[];
  recentXpTransactions: XpTransactionDto[];
}

export interface XpTransactionDto {
  amount: number;
  reason: string;
  earnedAt: string;
}

export interface LeaderboardDto {
  rank: number;
  studentId: string;
  fullName: string;
  profilePictureUrl?: string;
  totalXp: number;
  level: number;
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
  thumbnailUrl?: string;
  isPublished: boolean;
}

export interface StudentProfileDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  studentNumber?: string;
  profilePictureUrl?: string;
  totalXp: number;
  currentLevel: number;
  xpToNextLevel: number;
  rank: number;
  averageQuizScore: number;
  coursesCompletedCount: number;
  totalCertificatesCount: number;
  badges: BadgeDto[];
}

export interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
  studentNumber?: string;
  profilePictureUrl?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface StudentAnalyticsDto {
  studentId: string;
  fullName: string;
  email: string;
  courseTitle: string;
  completionPercentage: number;
  failedQuizAttempts: number;
  isRedFlag: boolean;
}

export interface CreateCourseRequest {
  title: string;
  description: string;
  level: string;
  thumbnailUrl?: string;
  isPublished?: boolean;
  tags?: string[];
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