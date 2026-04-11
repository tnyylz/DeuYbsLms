// Path: src/pages/student/CourseDetailPage.tsx

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BookOpen, Zap, ChevronLeft, Play, Clock, CheckCircle, Award, Target, Info, Loader2 } from 'lucide-react';
import { getCourseDetailApi } from '../../api/courses.api';
import { getCourseProgressApi, enrollApi } from '../../api/progress.api';
import { getFileUrl } from '../../utils/fileUtils';
import type { CourseDetailDto, CourseProgressDto } from '../../types';

export default function CourseDetailPage() {
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

  const handleEnroll = async () => {
    if (!courseId) return;
    setEnrolling(true);
    try {
      await enrollApi(courseId);
      // Başarılı kayıttan sonra sayfayı yenile (stateler güncellensin)
      await fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center bg-white p-12 rounded-[32px] shadow-xl border border-slate-200 max-w-md mx-6">
          <BookOpen className="text-slate-200 mx-auto mb-6" size={64} />
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Kurs Bulunamadı</h2>
          <button onClick={() => navigate('/courses')} className="mt-6 text-indigo-600 font-bold hover:underline">Kurslara Dön</button>
        </div>
      </div>
    );
  }

  const isEnrolled = !!progress;
  
  // Bulunması gereken ders: İlk tamamlanmamış ders veya ilk ders
  const getNextLessonId = () => {
    if (!progress || !course) return course?.lessons[0]?.id;
    const nextIncomplete = progress.lessonProgresses.find(lp => !lp.isVideoCompleted);
    return nextIncomplete ? nextIncomplete.lessonId : course.lessons[0].id;
  };

  const totalDurationStr = (() => {
    const totalSec = course.lessons.reduce((acc, curr) => acc + curr.durationInSeconds, 0);
    const min = Math.ceil(totalSec / 60);
    if (min < 60) return `${min} dakika`;
    return `${Math.floor(min / 60)} saat ${min % 60} dakika`;
  })();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-20">
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 shadow-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <button onClick={() => navigate('/courses')} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-indigo-600 transition-all cursor-pointer">
            <ChevronLeft size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-200">
              <BookOpen className="text-white" size={20} />
            </div>
            <span className="font-bold tracking-tight text-slate-900 text-xl">
              DEÜ YBS <span className="text-indigo-600">LMS</span>
            </span>
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
                <span className="px-3 py-1 bg-amber-50 text-amber-700 text-[10px] font-bold rounded-lg uppercase tracking-wider border border-amber-100/50 flex items-center gap-1">
                  <Zap size={10} fill="currentColor" /> {course.totalXpReward} XP
                </span>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
                {course.title}
              </h1>

              <div className="flex flex-wrap items-center gap-8 py-2 border-y border-slate-200/60">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold border border-indigo-100">
                    {course.teacherName.charAt(0)}
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold italic">Eğitmen</p>
                    <p className="font-bold text-slate-900">{course.teacherName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-sm font-bold text-slate-500">
                  <span className="flex items-center gap-2"><BookOpen size={18} className="text-indigo-500"/> {course.lessons.length} Ders</span>
                  <span className="flex items-center gap-2"><Clock size={18} className="text-indigo-500"/> {totalDurationStr}</span>
                </div>
              </div>
            </div>

            {/* Thumbnail Header for Student */}
            {course.thumbnailUrl ? (
              <div className="w-full h-80 rounded-[40px] overflow-hidden border border-slate-200 shadow-xl">
                 <img src={getFileUrl(course.thumbnailUrl)} alt={course.title} className="w-full h-full object-cover" />
              </div>
            ) : null}

            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
                  <Info size={20} />
                </div>
                Kurs Hakkında
              </h2>
              <div className="bg-white rounded-[32px] p-8 md:p-10 border border-slate-200 shadow-sm leading-relaxed text-lg text-slate-600 whitespace-pre-wrap">
                {course.description}
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
                  <Target size={20} />
                </div>
                Müfredat {isEnrolled ? 'Erişimi' : 'Önizleme'}
              </h2>
              <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
                {course.lessons.map((lesson, idx) => {
                  const lessonProgress = progress?.lessonProgresses.find(lp => lp.lessonId === lesson.id);
                  const isCompleted = lessonProgress?.isVideoCompleted;
                  const canAccess = isEnrolled && (lessonProgress?.isUnlocked || idx === 0);

                   return (
                    <div 
                      key={lesson.id} 
                      onClick={() => canAccess && navigate(`/course/${courseId}/lesson/${lesson.id}`)}
                      className={`p-6 flex items-center gap-5 transition-all ${canAccess ? 'cursor-pointer hover:bg-indigo-50/50' : 'opacity-60'} ${idx !== course.lessons.length - 1 ? 'border-b border-slate-100' : ''}`}
                    >
                        <div className={`w-10 h-10 rounded-2xl border font-bold flex items-center justify-center shrink-0 ${isCompleted ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                          {isCompleted ? <CheckCircle size={20} /> : lesson.orderIndex}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className={`font-bold transition-colors ${canAccess ? 'text-slate-800' : 'text-slate-400'}`}>{lesson.title}</h3>
                          <p className="text-xs text-slate-400 mt-1 flex items-center gap-3 font-semibold">
                            <span className="flex items-center gap-1"><Clock size={12}/> {Math.ceil(lesson.durationInSeconds / 60)} dk</span>
                            {lesson.hasQuiz && <span className="text-indigo-500 bg-indigo-50 px-1.5 rounded-md">Quiz</span>}
                            <span className="text-amber-500">+{lesson.xpReward} XP</span>
                          </p>
                        </div>
                        {isEnrolled && !canAccess && (
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
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="sticky top-28 bg-white rounded-[40px] p-8 border border-slate-200 shadow-2xl shadow-indigo-100/50 space-y-8 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl -mr-16 -mt-16 opacity-50"></div>
              
              <div className="relative text-center space-y-2">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">{isEnrolled ? 'Eğitim Durumu' : 'Ücretsiz Erişim'}</p>
                <h3 className="text-5xl font-black text-slate-900 tracking-tight">{isEnrolled ? `%${progress?.completionPercentage}` : 'Ücretsiz'}</h3>
                <p className="text-slate-400 text-sm font-medium pt-2">
                  {isEnrolled ? 'Kursu tamamlama oranınız' : 'Hemen kaydolun ve öğrenmeye başlayın.'}
                </p>
              </div>

              <div className="relative space-y-4">
                {isEnrolled ? (
                   <button 
                    onClick={() => navigate(`/course/${courseId}/lesson/${getNextLessonId()}`)}
                    className="w-full bg-slate-900 border-2 border-slate-900 hover:bg-slate-800 text-white font-bold py-5 px-6 rounded-[24px] transition-all flex items-center justify-center gap-3 shadow-xl hover:-translate-y-1"
                  >
                    <Play size={20} fill="currentColor" />
                    {progress?.completionPercentage === 0 ? 'Eğitime Başla' : 'Derse Devam Et'}
                  </button>
                ) : (
                  <button 
                    onClick={handleEnroll}
                    disabled={enrolling}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold py-5 px-6 rounded-[24px] transition-all flex items-center justify-center gap-3 shadow-xl shadow-indigo-200 hover:-translate-y-1 relative group"
                  >
                    {enrolling ? (
                      <Loader2 size={24} className="animate-spin" />
                    ) : (
                      <>
                        <Award size={20} />
                        <span>Hemen Kayıt Ol</span>
                      </>
                    )}
                  </button>
                )}
                
                <p className="text-[10px] text-slate-400 text-center font-bold uppercase tracking-widest">Ömür boyu erişim</p>
              </div>

              <div className="relative pt-6 border-t border-slate-100 flex items-center justify-center gap-8">
                 <div className="text-center">
                    <p className="text-xl font-bold text-slate-800">{course.lessons.length}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Ders</p>
                 </div>
                 <div className="w-px h-8 bg-slate-100"></div>
                 <div className="text-center">
                    <p className="text-xl font-bold text-slate-800">{Math.ceil(course.lessons.reduce((acc, c) => acc + c.durationInSeconds, 0) / 3600)}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Saat</p>
                 </div>
                 <div className="w-px h-8 bg-slate-100"></div>
                 <div className="text-center">
                    <p className="text-xl font-bold text-slate-800">{course.totalXpReward}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">XP</p>
                 </div>
              </div>
            </div>

            <div className="bg-amber-50 rounded-[32px] p-6 border border-amber-100/50 flex items-start gap-4">
               <div className="bg-white p-2 rounded-xl text-amber-500 shadow-sm shrink-0">
                  <Zap size={20} fill="currentColor" />
               </div>
               <div>
                  <p className="font-bold text-amber-900 text-sm">XP Kazanma Şansı!</p>
                  <p className="text-xs text-amber-700 mt-1 leading-relaxed">Bu kursu tamamlayarak puanınızı yükseltebilir ve seviye atlayabilirsiniz.</p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
