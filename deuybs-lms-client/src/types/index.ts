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
  gradeLevel?: number;
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
  role: 'Student' | 'Teacher' | 'Admin';
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
  isPublished: boolean;
}

// ===== LEARNING PATH =====
export interface LearningPathDto {
  id: string;
  title: string;
  description: string;
  thumbnailUrl?: string;
  difficulty: string;
  totalCourses: number;
  completedCoursesCount: number;
  progressPercentage: number;
  isPublished: boolean;
  courses: LearningPathCourseDto[];
}

export interface LearningPathCourseDto {
  courseId: string;
  courseTitle: string;
  thumbnailUrl?: string;
  orderIndex: number;
  status: 'Locked' | 'Available' | 'Completed';
  progressPercentage: number;
}

export interface LessonDto {
  id: string;
  title: string;
  description?: string;
  orderIndex: number;
  videoUrl?: string;
  textContent?: string;
  resourceUrl?: string;
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
  lastWatchedSecond: number;
  quizAttemptCount: number;
  xpResult?: XpResultDto;
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
  xpResult?: XpResultDto;
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

// ===== GAMIFICATION, LEAGUES & CHALLENGES =====
export interface ChallengeDto {
  id: string;
  title: string;
  description: string;
  type: number; // 1: XpGain, 2: LessonCompletion, 3: QuizSuccess
  targetValue: number;
  xpReward: number;
  expiryDate?: string;
  currentValue: number;
  isCompleted: boolean;
  progressPercent: number;
}

export interface LeagueDto {
  id: string;
  tier: string;
  seasonNumber: number;
  endDate: string;
  isClosed: boolean;
}

export interface LeagueParticipationDto {
  studentId: string;
  fullName: string;
  profilePictureUrl?: string;
  points: number;
  rank: number;
  isPromotionZone: boolean;
  isRelegationZone: boolean;
}

export interface LeagueLeaderboardDto {
  tier: string;
  seasonNumber: number;
  endDate: string;
  rankings: LeagueParticipationDto[];
}

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
  currentLeagueTier: string;
  leagueRank?: number | null;
  currentTitle?: string | null;
  profileFrameColor?: string | null;
  activeChallenges: ChallengeDto[];
}

export interface BadgeDto {
  badgeType: string;
  displayName: string;
  description: string;
  iconEmoji: string;
  level: number;
  earnedAt: string;
  contextDescription?: string;
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

// ===== SHOP =====
export interface ShopItem {
  id: string;
  name: string;
  description: string;
  priceXp: number;
  type: string;
  iconEmoji: string;
  metadata?: string;
}

export interface UserInventoryItem {
  id: string;
  shopItemId: string;
  itemName: string;
  itemType: string;
  iconEmoji: string;
  isUsed: boolean;
  purchasedAt: string;
}

export interface PurchaseResult {
  success: boolean;
  message: string;
  newTotalXp: number;
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

export interface AdminCourseAssignmentDto {
  gradeLevel?: number;
  studentNumbers?: string[];
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
  gradeLevel: number;
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
  totalXpReward: number;
  thumbnailUrl?: string;
  isPublished?: boolean;
  tags?: string[];
  teacherId: string;
}

export interface CreateLessonRequest {
  title: string;
  description?: string;
  videoUrl?: string | null;
  textContent?: string | null;
  resourceUrl?: string | null;
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

export interface XpResultDto {
  xpAwarded: number;
  newTotalXp: number;
  currentLevel: number;
  didLevelUp: boolean;
  newLevel?: number;
}

// ===== NOTIFICATION =====
export interface NotificationDto {
  id: string;
  title: string;
  message: string;
  type: 'System' | 'Achievement' | 'Challenge' | 'LevelUp' | 'CourseUpdate' | 'LeagueUpdate';
  isRead: boolean;
  actionUrl?: string;
  createdAt: string;
}