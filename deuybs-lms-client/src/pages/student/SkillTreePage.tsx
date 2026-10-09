import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BookOpen, CheckCircle, Lock, PlayCircle, Zap, ChevronLeft, Trophy } from 'lucide-react';
import { getCourseProgressApi, enrollApi } from '../../api/progress.api';
import { getCourseDetailApi } from '../../api/courses.api';
import ThemeToggle from '../../components/shared/ThemeToggle';
import type { CourseDetailDto, CourseProgressDto, LessonProgressDto } from '../../types';

type NodeStatus = 'completed' | 'active' | 'locked';

function getNodeStatus(lp: LessonProgressDto): NodeStatus {
  if (lp.isVideoCompleted && lp.isQuizPassed) return 'completed';
  if (lp.isUnlocked) return 'active';
  return 'locked';
}

export default function SkillTreePage() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();

  const [course, setCourse] = useState<CourseDetailDto | null>(null);
  const [progress, setProgress] = useState<CourseProgressDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  const fetchData = async () => {
    if (!courseId) return;
    try {
      const courseData = await getCourseDetailApi(courseId);
      setCourse(courseData);
      const progressData = await getCourseProgressApi(courseId);
      setProgress(progressData);
    } catch (err: any) {
      if (err.response?.status === 404) {
        const courseData = await getCourseDetailApi(courseId);
        setCourse(courseData);
        setProgress(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [courseId]);

  const handleEnroll = async () => {
    if (!courseId) return;
    setEnrolling(true);
    try {
      await enrollApi(courseId);
      await fetchData();
    } catch (err) { console.error(err); }
    finally { setEnrolling(false); }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-slate-900 dark:text-white font-sans transition-colors duration-300">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 text-center">
          <BookOpen className="text-slate-300 dark:text-slate-700 mx-auto mb-4" size={48} />
          <p className="text-lg font-medium text-slate-700 dark:text-slate-300">Kurs bulunamadı.</p>
          <button onClick={() => navigate('/courses')} className="mt-4 text-indigo-600 dark:text-indigo-400 hover:underline text-sm font-semibold">Kurslara Dön</button>
        </div>
      </div>
    );
  }

  // Not Enrolled Screen
  if (!progress) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-sans transition-colors duration-300">
        <nav className="bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 px-6 py-4 shadow-sm sticky top-0 z-50 transition-colors">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate('/courses')} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all cursor-pointer">
                <ChevronLeft size={20} />
              </button>
              <div className="bg-indigo-50 dark:bg-indigo-900/40 p-2 rounded-lg">
                <BookOpen className="text-indigo-600 dark:text-indigo-400" size={20} />
              </div>
              <span className="font-bold tracking-tight text-slate-900 dark:text-white text-xl">
                YBS <span className="text-indigo-600 dark:text-indigo-400">Portal</span>
              </span>
            </div>
            <ThemeToggle />
          </div>
        </nav>
        <div className="max-w-lg mx-auto px-6 py-20 text-center">
          <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/40 border-2 border-indigo-100 dark:border-indigo-800 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-sm">
            <BookOpen className="text-indigo-600 dark:text-indigo-400" size={36} />
          </div>
          <h1 className="text-3xl font-bold mb-3 text-slate-900 dark:text-white">{course.title}</h1>
          <p className="text-slate-500 dark:text-slate-400 text-base mb-6 leading-relaxed bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm">{course.description}</p>
          
          <div className="flex justify-center gap-6 text-sm font-semibold text-slate-700 dark:text-slate-300 mb-10 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-4 rounded-xl shadow-sm">
            <div className="flex flex-col items-center">
              <span className="text-slate-400 dark:text-slate-500 text-xs uppercase mb-1">Ders Sayısı</span>
              <span>{course.lessonCount} Adet</span>
            </div>
            <div className="w-px bg-slate-200 dark:bg-slate-800"></div>
            <div className="flex flex-col items-center">
              <span className="text-slate-400 dark:text-slate-500 text-xs uppercase mb-1">Toplam Puan</span>
              <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1"><Zap size={14} fill="currentColor" /> {course.totalXpReward} XP</span>
            </div>
          </div>

          <button onClick={handleEnroll} disabled={enrolling} className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white disabled:opacity-50 transition-all px-10 py-4 rounded-2xl font-bold text-lg shadow-lg shadow-indigo-200 dark:shadow-none hover:-translate-y-1 transform duration-300">
            {enrolling ? 'İşleminiz Yapılıyor...' : 'Bu Kursa Ücretsiz Kayıt Ol'}
          </button>
        </div>
      </div>
    );
  }

  // Skill Tree Enrolled View
  const lessons = course.lessons.sort((a, b) => a.orderIndex - b.orderIndex);
  const progressMap = new Map(progress.lessonProgresses.map(lp => [lp.lessonId, lp]));

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-sans transition-colors duration-300">
      <nav className="bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 px-6 py-4 shadow-sm sticky top-0 z-50 transition-colors">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/student/dashboard')} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all cursor-pointer">
              <ChevronLeft size={20} />
            </button>
            <div className="bg-indigo-50 dark:bg-indigo-900/40 p-2 rounded-lg">
              <BookOpen className="text-indigo-600 dark:text-indigo-400" size={18} />
            </div>
            <span className="font-bold tracking-tight text-slate-900 dark:text-white line-clamp-1">{course.title}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
              <span>{progress.completedLessons} / {progress.totalLessons}</span>
              <div className="w-24 bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden shadow-inner hidden sm:block">
                <div className="bg-indigo-600 dark:bg-indigo-400 h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${progress.completionPercentage}%` }} />
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      <div className="max-w-md mx-auto px-6 py-12">
        {/* Kurs tamamlandı banner */}
        {progress.isCompleted && (
          <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-6 mb-12 text-center shadow-sm transition-colors">
            <div className="w-16 h-16 bg-white dark:bg-slate-800 border border-emerald-100 dark:border-emerald-800 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm transition-colors">
              <Trophy className="text-emerald-500 dark:text-emerald-400" size={30} />
            </div>
            <p className="font-bold text-emerald-800 dark:text-emerald-300 text-lg">Kurs Tamamlandı! 🎉</p>
            <p className="text-emerald-600 dark:text-emerald-400 font-medium text-sm mt-1">Sertifikan Sertifikalarım sayfasında seni bekliyor.</p>
          </div>
        )}

        {/* Skill Tree Nodes */}
        <div className="relative flex flex-col items-center gap-0">
          {lessons.map((lesson, index) => {
            const lp = progressMap.get(lesson.id);
            const status: NodeStatus = lp ? getNodeStatus(lp) : (index === 0 ? 'active' : 'locked');

            const isCompleted = status === 'completed';
            const isActive = status === 'active';
            const isLocked = status === 'locked';

            return (
              <div key={lesson.id} className="flex flex-col items-center">
                {/* Bağlantı çizgisi */}
                {index > 0 && (
                  <div className={`w-1 h-12 rounded-full transition-colors duration-500 ${isCompleted ? 'bg-indigo-600 dark:bg-indigo-500' : isActive ? 'bg-indigo-300 dark:bg-indigo-800' : 'bg-slate-200 dark:bg-slate-800'}`} />
                )}

                {/* Node */}
                <button
                  onClick={() => !isLocked && navigate(`/course/${courseId}/lesson/${lesson.id}`)}
                  disabled={isLocked}
                  className={`relative w-72 rounded-2xl p-5 text-left transition-all duration-300 group ${
                    isCompleted
                      ? 'bg-white dark:bg-slate-900 border-2 border-indigo-600 dark:border-indigo-500 shadow-md hover:shadow-lg'
                      : isActive
                        ? 'bg-indigo-600 dark:bg-indigo-500 border-2 border-indigo-700 dark:border-indigo-600 text-white shadow-xl shadow-indigo-600/30 dark:shadow-none hover:bg-indigo-700 dark:hover:bg-indigo-600 transform hover:-translate-y-1'
                        : 'bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 opacity-60 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-inner transition-colors ${
                      isCompleted ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400' : isActive ? 'bg-white/20 text-white backdrop-blur-sm' : 'bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-600 border border-slate-200 dark:border-slate-700'
                    }`}>
                      {isCompleted ? <CheckCircle size={24} /> :
                       isActive ? <PlayCircle size={24} fill="currentColor" className="text-indigo-600 dark:text-indigo-400" /> :
                       <Lock size={20} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-base font-bold truncate mb-1 transition-colors ${isLocked ? 'text-slate-500 dark:text-slate-600' : isCompleted ? 'text-slate-900 dark:text-white group-hover:text-indigo-700 dark:group-hover:text-indigo-400 relative' : 'text-white'}`}>
                        {lesson.title}
                      </p>
                      <div className={`flex items-center gap-2 mt-1 font-semibold text-xs transition-colors ${isActive ? 'text-indigo-100' : 'text-slate-500 dark:text-slate-400'}`}>
                        <span>{Math.ceil(lesson.durationInSeconds / 60)} dk</span>
                        {lesson.hasQuiz && <span className={isActive ? 'text-white' : 'text-indigo-600 dark:text-indigo-400'}>Quiz</span>}
                        <span className={`flex items-center gap-0.5 ${isActive ? 'text-yellow-300' : 'text-amber-500 dark:text-amber-400'}`}>
                          <Zap size={12} fill="currentColor" />{lesson.xpReward}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Alt durum bilgisi */}
                  {lp && isActive && (
                    <div className="mt-4 pt-3 border-t border-indigo-500/30 flex gap-2 w-full justify-center">
                      <span className={`text-xs px-3 py-1 font-semibold rounded-full flex items-center gap-1 ${lp.isVideoCompleted ? 'bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 shadow-sm' : 'bg-indigo-700 dark:bg-indigo-900/60 text-indigo-200 dark:text-indigo-400 border border-indigo-500 dark:border-indigo-800'}`}>
                        {lp.isVideoCompleted ? <CheckCircle size={12} /> : <div className="w-3 h-3 rounded-full border-2 border-indigo-300 dark:border-indigo-500"></div>} Video
                      </span>
                      {lesson.hasQuiz && (
                        <span className={`text-xs px-3 py-1 font-semibold rounded-full flex items-center gap-1 ${lp.isQuizPassed ? 'bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 shadow-sm' : 'bg-indigo-700 dark:bg-indigo-900/60 text-indigo-200 dark:text-indigo-400 border border-indigo-500 dark:border-indigo-800'}`}>
                          {lp.isQuizPassed ? <CheckCircle size={12} /> : <div className="w-3 h-3 rounded-full border-2 border-indigo-300 dark:border-indigo-500"></div>} Quiz
                        </span>
                      )}
                    </div>
                  )}
                  
                  {lp && isCompleted && (
                     <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex gap-2 w-full transition-colors">
                       <span className={`text-xs px-2.5 py-1 font-semibold rounded-md border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 flex items-center gap-1 w-full justify-center`}>
                         Tekrar İzle / Çöz
                       </span>
                     </div>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}