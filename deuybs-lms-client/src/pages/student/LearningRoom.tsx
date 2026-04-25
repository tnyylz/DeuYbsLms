// Path: src/pages/student/LearningRoom.tsx

import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  BookOpen, ChevronLeft, ChevronRight, Loader2, HelpCircle, 
  Lock, CheckCircle, Zap, Info, Clock, Play, FileDown 
} from 'lucide-react';
import { getFileUrl } from '../../utils/fileUtils';
import VideoPlayer from '../../components/VideoPlayer';
import QuizModal from '../../components/QuizModal';
import { LevelUpModal } from '../../components/shared/LevelUpModal';
import { getCourseDetailApi, getQuizQuestionsApi } from '../../api/courses.api';
import { getCourseProgressApi, completeVideoApi, submitQuizApi } from '../../api/progress.api';
import type { 
  CourseDetailDto, LessonDto, LessonProgressDto, 
  QuestionDto, QuizResultDto, CourseProgressDto 
} from '../../types';

import toast from 'react-hot-toast';

export default function LearningRoom() {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const navigate = useNavigate();

  const [course, setCourse] = useState<CourseDetailDto | null>(null);
  const [lesson, setLesson] = useState<LessonDto | null>(null);
  const [lessonProgress, setLessonProgress] = useState<LessonProgressDto | null>(null);
  const [loading, setLoading] = useState(true);

  const [showQuiz, setShowQuiz] = useState(false);
  const [questions, setQuestions] = useState<QuestionDto[]>([]);
  const [quizLoading, setQuizLoading] = useState(false);
  const [progress, setProgress] = useState<CourseProgressDto | null>(null);

  const [showLevelUp, setShowLevelUp] = useState(false);
  const [newLevel, setNewLevel] = useState(1);

  const fetchAll = useCallback(async () => {
    if (!courseId || !lessonId) return;
    try {
      const [courseData, progressData] = await Promise.all([
        getCourseDetailApi(courseId),
        getCourseProgressApi(courseId),
      ]);
      setCourse(courseData);

      const currentLesson = courseData.lessons.find(l => l.id === lessonId);
      setLesson(currentLesson ?? null);

      const currentProgress = progressData.lessonProgresses.find(lp => lp.lessonId === lessonId);
      setLessonProgress(currentProgress ?? null);
      setProgress(progressData);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [courseId, lessonId]);

  useEffect(() => { 
    setLoading(true);
    fetchAll(); 
  }, [courseId, lessonId, fetchAll]);

  const handleVideoComplete = async () => {
    if (!lessonId) return;
    const loadingToast = toast.loading('İlerleme kaydediliyor...');
    try {
      const res = await completeVideoApi(lessonId);
      await fetchAll();
      toast.success('Ders başarıyla tamamlandı! ✅', { id: loadingToast });
      
      if (res.xpResult) {
        toast.success(`+${res.xpResult.xpAwarded} XP Kazandın!`, {
          icon: '✨',
          duration: 3000,
        });

        if (res.xpResult.didLevelUp && res.xpResult.newLevel) {
          setNewLevel(res.xpResult.newLevel);
          setShowLevelUp(true);
        }
      }
    } catch (err: any) { 
      console.error(err);
      const errorMsg = err.response?.data?.message || err.response?.data || 'Ders tamamlanırken bir hata oluştu veya bu ders hala kilitli.';
      toast.error(`Hata: ${errorMsg}`, { id: loadingToast });
    }
  };

  const handleOpenQuiz = async () => {
    if (!lessonId) return;
    const loadingToast = toast.loading('Quiz hazırlanıyor...');
    setQuizLoading(true);
    try {
      const q = await getQuizQuestionsApi(lessonId);
      setQuestions(q);
      setShowQuiz(true);
      toast.dismiss(loadingToast);
    } catch (err) { 
      console.error(err);
      toast.error('Quiz yüklenirken bir sorun oluştu.', { id: loadingToast });
    }
    finally { setQuizLoading(false); }
  };

  const handleSubmitQuiz = async (answers: Record<string, string>): Promise<QuizResultDto> => {
    const loadingToast = toast.loading('Cevaplar kontrol ediliyor...');
    try {
      const payload = Object.entries(answers).map(([questionId, selectedAnswerOptionId]) => ({
        questionId,
        selectedAnswerOptionId,
      }));
      const result = await submitQuizApi(lessonId!, payload);
      await fetchAll();
      toast.success(result.isPassed ? 'Tebrikler, quizi geçtiniz! 🎉' : 'Üzgünüz, geçme puanının altında kaldınız. ❌', { id: loadingToast });
      
      if (result.xpResult && result.isPassed) {
        toast.success(`+${result.xpResult.xpAwarded} XP Kazandın!`, {
          icon: '✨',
          duration: 3000,
        });

        if (result.xpResult.didLevelUp && result.xpResult.newLevel) {
          setNewLevel(result.xpResult.newLevel);
          setShowLevelUp(true);
        }
      }

      return result;
    } catch (err: any) {
      console.error(err);
      toast.error('Quiz gönderilirken bir hata oluştu.', { id: loadingToast });
      throw err;
    }
  };

  const handleNextLesson = (targetLessonId?: string) => {
    setShowQuiz(false);
    const idToNavigate = targetLessonId || getNextLessonId();
    if (idToNavigate) {
      navigate(`/course/${courseId}/lesson/${idToNavigate}`);
    } else {
      navigate(`/course/${courseId}/detail`);
    }
  };

  const getNextLessonId = () => {
    if (!course || !lesson) return null;
    const currentIndex = course.lessons.findIndex(l => l.id === lesson.id);
    if (currentIndex < course.lessons.length - 1) {
      return course.lessons[currentIndex + 1].id;
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
        <p className="text-slate-600 font-medium animate-pulse">Öğrenme odası hazırlanıyor...</p>
      </div>
    );
  }

  if (!course || !lesson || !progress) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-slate-900 dark:text-white transition-colors duration-300">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 text-center">
          <BookOpen className="mx-auto text-slate-200 dark:text-slate-800 mb-4" size={48} />
          <h2 className="text-xl font-bold mb-2">Ders bulunamadı</h2>
          <button onClick={() => navigate(`/course/${courseId}/detail`)} className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline">Kurs Sayfasına Dön</button>
        </div>
      </div>
    );
  }

  const videoCompleted = lessonProgress?.isVideoCompleted ?? false;
  const quizPassed = lessonProgress?.isQuizPassed ?? false;
  const isLessonFinished = videoCompleted && (!lesson.hasQuiz || quizPassed);
  const nextLessonId = getNextLessonId();

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-sans flex flex-col transition-colors duration-300">
      {/* Upper Navigation / Progress Bar */}
      <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-6 py-3 sticky top-0 z-30 shadow-sm transition-colors">
        <div className="max-w-[1800px] mx-auto flex items-center justify-between gap-8">
          <div className="flex items-center gap-4 min-w-0">
            <button 
              onClick={() => navigate(`/course/${courseId}/detail`)} 
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all group"
              title="Kursa Geri Dön"
            >
              <ChevronLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
            </button>
            <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 mx-2 hidden md:block"></div>
            <div className="min-w-0">
               <h1 className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors cursor-default">
                {course.title}
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wider">Mevcut Ders:</span>
                <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold truncate">{lesson.title}</span>
              </div>
            </div>
          </div>

          <div className="flex-1 max-w-md hidden lg:block">
             <div className="flex justify-between items-center mb-1.5">
               <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Kurs İlerlemesi</span>
               <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/40 px-2 py-0.5 rounded-full">%{progress.completionPercentage}</span>
             </div>
             <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
               <div 
                className="bg-indigo-600 dark:bg-indigo-500 h-full rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${progress.completionPercentage}%` }}
               />
             </div>
          </div>

          <div className="flex items-center gap-3">
             <div className="text-right hidden sm:block">
                <p className="text-[10px] text-slate-500 dark:text-slate-500 font-bold uppercase tracking-tight">Kazanılan Toplam XP</p>
                <p className="text-sm font-black text-amber-500 dark:text-amber-400 flex items-center justify-end gap-1">
                  <Zap size={14} fill="currentColor" /> {progress.completedLessons * 10}
                </p>
             </div>
          </div>
        </div>
      </nav>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Main Content (Left) */}
        <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 custom-scrollbar relative">
          <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8">
            
            {/* Video Section or Document Only */}
            {lesson.videoUrl ? (
                <div className="aspect-video bg-black rounded-2xl overflow-hidden shadow-xl border border-slate-200 dark:border-slate-800 relative group transition-colors">
                  <VideoPlayer 
                    lessonId={lesson.id}
                    videoUrl={lesson.videoUrl} 
                    initialTime={lessonProgress?.lastWatchedSecond || 0}
                    onVideoComplete={handleVideoComplete} 
                  />
                </div>
            ) : lesson.resourceUrl ? (
               <div className="aspect-video bg-slate-100 dark:bg-slate-900 rounded-2xl flex flex-col items-center justify-center shadow-xl border border-slate-200 dark:border-slate-800 transition-colors px-6 text-center">
                  <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mb-6 shadow-md">
                     <FileDown size={32} />
                  </div>
                  <h3 className="text-xl md:text-2xl font-black text-slate-800 dark:text-white mb-3">Ders Dokümanı</h3>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-8 max-w-md">Bu ders için sisteme bir video yerine indirilebilir kaynak yüklenmiştir. Materyalleri aşağıdan cihazınıza indirebilirsiniz.</p>
                  <a 
                    href={getFileUrl(lesson.resourceUrl)} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    onClick={() => {
                      if (!videoCompleted) handleVideoComplete();
                    }}
                    className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-xl shadow-indigo-200 dark:shadow-none flex items-center gap-3 transition-all hover:-translate-y-1"
                  >
                     <FileDown size={20} />
                     Uzantıyı İndir
                  </a>
                  {!videoCompleted && (
                    <p className="text-xs font-bold text-amber-600 dark:text-amber-500 mt-6 max-w-sm bg-amber-50 dark:bg-amber-900/20 p-3 rounded-xl border border-amber-100 dark:border-amber-800/50">
                      Önemli: İlerlemek için materyali indirmeniz gerekmektedir. İndirdikten sonra "Sonraki Derse Geç" butonu aktif olacaktır.
                    </p>
                  )}
               </div>
            ) : (
                <div className="aspect-video bg-slate-100 dark:bg-slate-900 rounded-2xl flex flex-col items-center justify-center shadow-xl border border-slate-200 dark:border-slate-800 transition-colors">
                  <p className="text-slate-500 font-medium">Bu dersin içeriği bulunamadı.</p>
                </div>
            )}

            {/* Supplemental Document (if video also exists) */}
            {lesson.videoUrl && lesson.resourceUrl && (
               <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/40 rounded-[28px] p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-sm">
                  <div className="flex items-center gap-5">
                     <div className="bg-white dark:bg-slate-800 p-4 rounded-full text-emerald-600 dark:text-emerald-400 shadow-md">
                        <FileDown size={28} />
                     </div>
                     <div>
                        <h4 className="font-black tracking-tight text-lg text-emerald-900 dark:text-emerald-200">Ek Kaynaklar</h4>
                        <p className="text-sm font-medium text-emerald-700 dark:text-emerald-500 mt-1">Bu video dersini destekleyici ek materyaller sisteme yüklenmiş.</p>
                     </div>
                  </div>
                  <a href={getFileUrl(lesson.resourceUrl)} target="_blank" rel="noopener noreferrer" className="whitespace-nowrap w-full sm:w-auto text-center px-8 py-4 bg-white dark:bg-slate-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 font-black tracking-wide uppercase rounded-2xl shadow-sm border border-emerald-100 dark:border-emerald-800 flex items-center justify-center gap-3 transition-colors">
                     <FileDown size={20} /> İndir
                  </a>
               </div>
            )}

            {/* Lesson Info & Actions */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[32px] p-8 space-y-8 shadow-sm transition-colors">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 text-[10px] font-black rounded uppercase tracking-widest border border-indigo-100 dark:border-indigo-800">
                      Modül {lesson.orderIndex}
                    </span>
                    {videoCompleted && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/40 px-2 py-0.5 rounded border border-emerald-100 dark:border-emerald-800/50">
                        <CheckCircle size={10} /> İzleme Tamamlandı
                      </span>
                    )}
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{lesson.title}</h2>
                </div>

                <div className="flex flex-wrap gap-3">
                  {lesson.hasQuiz && (
                    <button
                      onClick={handleOpenQuiz}
                      disabled={!videoCompleted || quizPassed || quizLoading}
                      className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all border ${
                        quizPassed 
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-600' 
                          : !videoCompleted 
                            ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-50'
                            : 'bg-indigo-600 hover:bg-indigo-700 border-indigo-600 text-white shadow-lg shadow-indigo-200 hover:-translate-y-0.5'
                      }`}
                    >
                      {quizLoading ? <Loader2 size={18} className="animate-spin" /> : <HelpCircle size={18} />}
                      {quizPassed ? 'Quiz Başarıyla Geçildi' : quizLoading ? 'Hazırlanıyor...' : 'Bilgini Sına: Quiz'}
                    </button>
                  )}

                  {isLessonFinished && (
                    <button 
                      onClick={() => handleNextLesson()}
                      className="flex items-center gap-3 px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-sm transition-all shadow-lg shadow-emerald-200 dark:shadow-none hover:-translate-y-0.5"
                    >
                      {nextLessonId ? (
                        <>
                          Sonraki Derse Geç
                          <ChevronRight size={18} />
                        </>
                      ) : (
                        <>
                          <CheckCircle size={18} />
                          Eğitimi Tamamla
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Warnings/Status */}
              {!videoCompleted && lesson.hasQuiz && (
                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/50 rounded-2xl flex items-center gap-3 text-amber-700 dark:text-amber-400 text-xs font-medium">
                  <Info size={16} className="shrink-0" />
                  <span>Quiz'e erişmek için önce ders videosunu izlemeli veya tamamlamalısınız.</span>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Sidebar (Right) */}
        <aside className="w-full md:w-[350px] lg:w-[400px] border-l border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex flex-col z-20 shadow-inner transition-colors">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 sticky top-0 transition-colors">
             <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-lg">Kurs İçeriği</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">{progress.completedLessons} / {course.lessons.length} Ders Tamamlandı</p>
             </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {course.lessons.map((l, idx) => {
              const lp = progress.lessonProgresses.find(p => p.lessonId === l.id);
              const isActive = l.id === lessonId;
              const isComp = lp?.isVideoCompleted && (!l.hasQuiz || lp?.isQuizPassed);
              const status = lp?.isUnlocked ?? (idx === 0);

              return (
                <button
                  key={l.id}
                  disabled={!status && !isActive}
                  onClick={() => navigate(`/course/${courseId}/lesson/${l.id}`)}
                  className={`w-full p-5 flex items-start gap-4 transition-all border-b border-slate-200 dark:border-slate-800 text-left group relative ${
                    isActive ? 'bg-indigo-50 dark:bg-indigo-900/40 border-l-4 border-l-indigo-600' : 'hover:bg-slate-100 dark:hover:bg-slate-800 bg-white dark:bg-slate-900'
                  } ${!status ? 'opacity-60 cursor-not-allowed grayscale' : 'cursor-pointer'}`}
                >
                  <div className={`mt-1 shrink-0 w-6 h-6 rounded-full flex items-center justify-center border-2 transition-colors ${
                    isComp ? 'bg-emerald-500 border-emerald-500 text-white' : 
                    isActive ? 'border-indigo-600 text-indigo-600' : 
                    !status ? 'border-slate-300 text-slate-300' : 'border-slate-400 text-slate-500'
                  }`}>
                    {isComp ? <CheckCircle size={14} /> : !status ? <Lock size={12} /> : <span className="text-[10px] font-bold">{l.orderIndex}</span>}
                  </div>
                  
                  <div className="min-w-0">
                    <p className={`text-sm font-bold truncate transition-colors ${isActive ? 'text-indigo-600 dark:text-indigo-400' : status ? 'text-slate-700 dark:text-slate-200' : 'text-slate-400 dark:text-slate-600'}`}>
                      {l.title}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1 text-[10px] text-slate-500 font-bold uppercase tracking-tight">
                        <Clock size={10} /> {Math.ceil(l.durationInSeconds / 60)} dk
                      </span>
                      {l.hasQuiz && (
                        <span className={`text-[10px] font-black px-1.5 py-0.5 rounded border ${
                          lp?.isQuizPassed ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-indigo-50 border-indigo-100 text-indigo-600'
                        }`}>QUIZ</span>
                      )}
                    </div>
                  </div>

                  {status && !isComp && !isActive && (
                    <Play size={14} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1" />
                  )}
                </button>
              );
            })}
          </div>
        </aside>
      </div>

      {/* Quiz Modal */}
      {showQuiz && questions.length > 0 && (
        <QuizModal
          questions={questions}
          onSubmit={handleSubmitQuiz}
          onClose={() => setShowQuiz(false)}
          onNextLesson={handleNextLesson}
        />
      )}

      <LevelUpModal 
        isOpen={showLevelUp} 
        onClose={() => setShowLevelUp(false)} 
        newLevel={newLevel} 
      />
    </div>
  );
}