import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BookOpen, Zap, ChevronLeft, Play, Clock, CheckCircle, Award, Target, Info } from 'lucide-react';
import { getCourseDetailApi } from '../../api/courses.api';
import { getCourseProgressApi, enrollApi, getMyEnrollmentsApi } from '../../api/progress.api';
import { generateCertificateApi } from '../../api/certificate.api';
import { getFileUrl } from '../../utils/fileUtils';
import toast from 'react-hot-toast';
import ThemeToggle from '../../components/shared/ThemeToggle';
import type { CourseDetailDto, CourseProgressDto, LessonProgressDto, LessonDto } from '../../types';

export default function CourseDetailPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();

  const [course, setCourse] = useState<CourseDetailDto | null>(null);
  const [progress, setProgress] = useState<CourseProgressDto | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!courseId) return;
    try {
      const courseData = await getCourseDetailApi(courseId);
      setCourse(courseData);
      
      try {
        const progressData = await getCourseProgressApi(courseId);
        setProgress(progressData);
      } catch (err) {
        setProgress(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [courseId]);



  const handleClaimCertificate = async () => {
    if (!courseId) return;
    const loadingToast = toast.loading('Sertifika durumunuz kontrol ediliyor...');
    try {
      const enrollments = await getMyEnrollmentsApi();
      const enrollment = enrollments.find(e => e.courseId === courseId);
      if (!enrollment) throw new Error('Kayıt bulunamadı!');
      
      toast.loading('Sertifikanız hazırlanıyor...', { id: loadingToast });
      await generateCertificateApi(enrollment.enrollmentId);
      toast.success('Sertifikanız başarıyla oluşturuldu! ✅', { id: loadingToast });
      navigate('/student/certificates');
    } catch (err: any) {
      toast.dismiss(loadingToast);
      const errorMsg = err.response?.data?.message || err.response?.data || err.message || 'Başarısız.';
      if (errorMsg.toString().toLowerCase().includes('zaten var')) {
        toast.success('Bu kursa ait sertifikanız halihazırda mevcut.', { id: loadingToast });
        navigate('/student/certificates');
      } else {
        toast.error(`Hata: ${errorMsg}`);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center bg-white dark:bg-slate-900 p-12 rounded-[32px] shadow-xl border border-slate-200 dark:border-slate-800 max-w-md mx-6">
          <BookOpen className="text-slate-200 dark:text-slate-800 mx-auto mb-6" size={64} />
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Kurs Bulunamadı</h2>
          <button onClick={() => navigate('/courses')} className="mt-6 text-indigo-600 dark:text-indigo-400 font-bold hover:underline">Kurslara Dön</button>
        </div>
      </div>
    );
  }

  const isEnrolled = !!progress;

  if (!course) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center bg-white dark:bg-slate-900 p-12 rounded-[32px] shadow-xl border border-slate-200 dark:border-slate-800 max-w-md mx-6">
          <BookOpen className="text-slate-200 dark:text-slate-800 mx-auto mb-6" size={64} />
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Kurs Bulunamadı</h2>
          <button onClick={() => navigate('/courses')} className="mt-6 text-indigo-600 dark:text-indigo-400 font-bold hover:underline">Kurslara Dön</button>
        </div>
      </div>
    );
  }

  // Eğer kullanıcı bu kursa kayıtlı (atanmış) değilse içeriği gösterme
  if (!loading && !isEnrolled) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center bg-white dark:bg-slate-900 p-12 rounded-[32px] shadow-xl border border-slate-200 dark:border-slate-800 max-w-md mx-6">
          <Zap className="text-amber-500 mx-auto mb-6" size={64} fill="currentColor" />
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Erişim Reddedildi</h2>
          <p className="text-slate-500 dark:text-slate-400">Bu kursa henüz atanmadınız. Lütfen yöneticinizle iletişime geçin.</p>
          <button onClick={() => navigate('/courses')} className="mt-6 text-indigo-600 dark:text-indigo-400 font-bold hover:underline">Kurslarıma Dön</button>
        </div>
      </div>
    );
  }

  const getNextLessonId = () => {
    if (!progress || !course) return course?.lessons[0]?.id;
    // Bir ders ancak video tamamlanmış VE quiz (varsa) geçilmişse tamamlanmış sayılır
    const nextIncomplete = progress.lessonProgresses.find((lp: LessonProgressDto) => {
      const lesson = course.lessons.find(l => l.id === lp.lessonId);
      const isLessonDone = lp.isVideoCompleted && (!lesson?.hasQuiz || lp.isQuizPassed);
      return !isLessonDone;
    });
    return nextIncomplete ? nextIncomplete.lessonId : course.lessons[0].id;
  };

  const totalDurationStr = (() => {
    const totalSec = course.lessons.reduce((acc: number, curr: LessonDto) => acc + curr.durationInSeconds, 0);
    const min = Math.ceil(totalSec / 60);
    if (min < 60) return `${min} dakika`;
    return `${Math.floor(min / 60)} saat ${min % 60} dakika`;
  })();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-sans pb-20 transition-colors duration-300">
      <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-6 py-4 shadow-sm sticky top-0 z-50 transition-colors">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/courses')} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all cursor-pointer">
              <ChevronLeft size={20} />
            </button>
            <div className="flex items-center gap-2">
              <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none">
                <BookOpen className="text-white" size={20} />
              </div>
              <span className="font-bold tracking-tight text-slate-900 dark:text-white text-xl">
                YBS <span className="text-indigo-600 dark:text-indigo-400">Portal</span>
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 pt-12">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded-lg uppercase tracking-wider border border-indigo-100/50">
                  {course.level}
                </span>
                <span className="px-3 py-1 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[10px] font-bold rounded-lg uppercase tracking-wider border border-amber-100/50 dark:border-amber-800/50 flex items-center gap-1">
                  <Zap size={10} fill="currentColor" /> {course.totalXpReward} XP
                </span>
                {course.tags && course.tags.map((tag: string, idx: number) => (
                  <span key={idx} className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold rounded-lg uppercase tracking-wider border border-slate-200 dark:border-slate-700">
                    {tag}
                  </span>
                ))}
              </div>
              
              <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
                {course.title}
              </h1>

              <div className="flex flex-wrap items-center gap-8 py-2 border-y border-slate-200/60 dark:border-slate-800/60">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-100 dark:border-indigo-800">
                    {course.teacherName.charAt(0)}
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold italic">Eğitmen</p>
                    <p className="font-bold text-slate-900 dark:text-white">{course.teacherName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-sm font-bold text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-2"><BookOpen size={18} className="text-indigo-500 dark:text-indigo-400"/> {course.lessons.length} Ders</span>
                  <span className="flex items-center gap-2"><Clock size={18} className="text-indigo-500 dark:text-indigo-400"/> {totalDurationStr}</span>
                </div>
              </div>
            </div>

            {/* Thumbnail Header for Student */}
            {course.thumbnailUrl ? (
              <div className="w-full h-80 rounded-[40px] overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl transition-colors">
                 <img src={getFileUrl(course.thumbnailUrl)} alt={course.title} className="w-full h-full object-cover" />
              </div>
            ) : null}

            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400">
                  <Info size={20} />
                </div>
                Kurs Hakkında
              </h2>
              <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 md:p-10 border border-slate-200 dark:border-slate-800 shadow-sm leading-relaxed text-lg text-slate-600 dark:text-slate-400 whitespace-pre-wrap transition-colors">
                {course.description}
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400">
                  <Target size={20} />
                </div>
                Müfredat Erişimi
              </h2>
              <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
                {course.lessons.map((lesson: LessonDto, idx: number) => {
                  const lessonProgress = progress?.lessonProgresses.find((lp: LessonProgressDto) => lp.lessonId === lesson.id);
                  const isCompleted = lessonProgress?.isVideoCompleted && (!lesson.hasQuiz || lessonProgress?.isQuizPassed);
                  const canAccess = isEnrolled && (lessonProgress?.isUnlocked || idx === 0);

                   return (
                    <div 
                      key={lesson.id} 
                      onClick={() => canAccess && navigate(`/course/${courseId}/lesson/${lesson.id}`)}
                      className={`p-6 flex items-center gap-5 transition-all ${canAccess ? 'cursor-pointer hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20' : 'opacity-60'} ${idx !== course.lessons.length - 1 ? 'border-b border-slate-100 dark:border-slate-800' : ''}`}
                    >
                        <div className={`w-10 h-10 rounded-2xl border font-bold flex items-center justify-center shrink-0 transition-colors ${isCompleted ? 'bg-emerald-50 dark:bg-emerald-900/40 border-emerald-100 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500'}`}>
                          {isCompleted ? <CheckCircle size={20} /> : lesson.orderIndex}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className={`font-bold transition-colors ${canAccess ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400 dark:text-slate-600'}`}>{lesson.title}</h3>
                          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 flex items-center gap-3 font-semibold">
                            <span className="flex items-center gap-1"><Clock size={12}/> {Math.ceil(lesson.durationInSeconds / 60)} dk</span>
                            {lesson.hasQuiz && <span className="text-indigo-500 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/40 px-1.5 rounded-md">Quiz</span>}
                            <span className="text-amber-500 dark:text-amber-400">+{lesson.xpReward} XP</span>
                          </p>
                        </div>
                        {!canAccess && (
                          <div className="text-slate-300">
                            <Zap size={20} className="grayscale" />
                          </div>
                        )}
                        {canAccess && (
                           <div className="text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Play size={18} fill="currentColor" />
                           </div>
                        )}
                    </div>
                  );
                })}
                {course.hasFinalExam && progress && (
                  <div 
                    onClick={() => {
                      if (progress.completedLessons < course.lessons.length) {
                        toast.error(`Final sınavına girmek için tüm dersleri tamamlamalısınız. (${progress.completedLessons} / ${course.lessons.length} tamamlandı)`);
                      } else {
                        navigate(`/course/${courseId}/final-exam`);
                      }
                    }}
                    className={`p-6 flex items-center gap-5 transition-all cursor-pointer hover:bg-violet-50/50 dark:hover:bg-violet-900/20 ${progress.completedLessons === course.lessons.length ? '' : 'opacity-60'}`}
                  >
                      <div className={`w-10 h-10 rounded-2xl border font-bold flex items-center justify-center shrink-0 transition-colors ${progress.isFinalExamPassed ? 'bg-emerald-50 dark:bg-emerald-900/40 border-emerald-100 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400' : 'bg-violet-50 dark:bg-violet-800/40 border-violet-200 dark:border-violet-700/50 text-violet-500 dark:text-violet-400'}`}>
                        {progress.isFinalExamPassed ? <CheckCircle size={20} /> : <Target size={20} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className={`font-bold transition-colors ${progress.completedLessons === course.lessons.length ? 'text-violet-700 dark:text-violet-300' : 'text-slate-400 dark:text-slate-600'}`}>Final Sınavı</h3>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 flex items-center gap-3 font-semibold">
                          <span className="text-emerald-500 dark:text-emerald-400">Sertifika Sınavı</span>
                        </p>
                      </div>
                      {progress.completedLessons < course.lessons.length && (
                        <div className="text-slate-300">
                          <Zap size={20} className="grayscale" />
                        </div>
                      )}
                      {progress.completedLessons === course.lessons.length && (
                         <div className="text-violet-500 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Play size={18} fill="currentColor" />
                         </div>
                      )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="sticky top-28 bg-white dark:bg-slate-900 rounded-[40px] p-8 border border-slate-200 dark:border-slate-800 shadow-2xl shadow-indigo-100/50 dark:shadow-none space-y-8 overflow-hidden relative transition-colors">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 dark:bg-indigo-600/10 rounded-full blur-3xl -mr-16 -mt-16 opacity-50"></div>
              
              <div className="relative text-center space-y-2">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 dark:text-indigo-300">Eğitim Durumu</p>
                <h3 className="text-5xl font-black text-slate-900 dark:text-white tracking-tight">%{progress?.completionPercentage}</h3>
                <p className="text-slate-400 dark:text-slate-500 text-sm font-medium pt-2">
                  Kursu tamamlama oranınız
                </p>
              </div>

              <div className="relative space-y-4 text-center">
                {progress?.isCompleted ? (
                    <button 
                      onClick={handleClaimCertificate}
                      className="w-full bg-emerald-500 hover:bg-emerald-600 border-2 border-emerald-500 hover:border-emerald-600 text-white font-bold py-5 px-6 rounded-[24px] transition-all flex items-center justify-center gap-3 shadow-xl shadow-emerald-200 dark:shadow-none hover:-translate-y-1"
                    >
                      <Award size={20} />
                      Sertifika Al
                    </button>
                  ) : (
                    <button 
                      onClick={() => navigate(`/course/${courseId}/lesson/${getNextLessonId()}`)}
                      className="w-full bg-slate-900 dark:bg-indigo-600 border-2 border-slate-900 dark:border-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-700 text-white font-bold py-5 px-6 rounded-[24px] transition-all flex items-center justify-center gap-3 shadow-xl hover:-translate-y-1"
                    >
                      <Play size={20} fill="currentColor" />
                      {progress?.completionPercentage === 0 ? 'Eğitime Başla' : 'Derse Devam Et'}
                    </button>
                  )}
                
                <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center font-bold uppercase tracking-widest">Ömür boyu erişim</p>
              </div>

              <div className="relative pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center gap-8">
                 <div className="text-center">
                    <p className="text-xl font-bold text-slate-800 dark:text-white">{course.lessons.length}</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">Ders</p>
                 </div>
                 <div className="w-px h-8 bg-slate-100 dark:bg-slate-800"></div>
                 <div className="text-center">
                    <p className="text-xl font-bold text-slate-800 dark:text-white">{Math.ceil(course.lessons.reduce((acc: number, c: LessonDto) => acc + c.durationInSeconds, 0) / 3600)}</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">Saat</p>
                 </div>
                 <div className="w-px h-8 bg-slate-100 dark:bg-slate-800"></div>
                 <div className="text-center">
                    <p className="text-xl font-bold text-slate-800 dark:text-white">{course.totalXpReward}</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">XP</p>
                 </div>
              </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-[32px] p-6 border border-amber-100/50 dark:border-amber-800/50 flex items-start gap-4 transition-colors">
               <div className="bg-white dark:bg-slate-800 p-2 rounded-xl text-amber-500 dark:text-amber-400 shadow-sm shrink-0 transition-colors">
                  <Zap size={20} fill="currentColor" />
               </div>
               <div>
                  <p className="font-bold text-amber-900 dark:text-amber-200 text-sm">XP Kazanma Şansı!</p>
                  <p className="text-xs text-amber-700 dark:text-amber-400 mt-1 leading-relaxed">Bu kursu tamamlayarak puanınızı yükseltebilir ve seviye atlayabilirsiniz.</p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
