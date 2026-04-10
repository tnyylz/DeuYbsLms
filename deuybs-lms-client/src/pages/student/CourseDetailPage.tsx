// Path: src/pages/student/CourseDetailPage.tsx

import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { BookOpen, Zap, ChevronLeft, Play, Clock, CheckCircle } from 'lucide-react';
import { getCourseDetailApi } from '../../api/courses.api';
import { getCourseProgressApi, enrollApi } from '../../api/progress.api';
import type { CourseDetailDto, CourseProgressDto } from '../../types';

export default function CourseDetailPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();

  const [course, setCourse] = useState<CourseDetailDto | null>(null);
  const [progress, setProgress] = useState<CourseProgressDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!courseId) return;
      try {
        const courseData = await getCourseDetailApi(courseId);
        setCourse(courseData);
        
        try {
          const progressData = await getCourseProgressApi(courseId);
          setProgress(progressData);
        } catch (err) {
          // Öğrenci bu kursa kayıtlı değil
          setProgress(null);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [courseId]);

  const handleEnroll = async () => {
    if (!courseId) return;
    setEnrolling(true);
    try {
      await enrollApi(courseId);
      // Başarılı kayıttan sonra skill tree'ye yönlendir
      navigate(`/course/${courseId}/skill-tree`);
    } catch (err) {
      console.error(err);
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <BookOpen className="mx-auto mb-4 text-slate-300" size={48} />
          <h2 className="text-xl font-bold text-slate-800 mb-2">Kurs Bulunamadı</h2>
           <Link to="/courses" className="text-indigo-600 hover:underline">Kurslara Dön</Link>
        </div>
      </div>
    );
  }

  const totalDurationStr = (() => {
    const totalSec = course.lessons.reduce((acc, curr) => acc + curr.durationInSeconds, 0);
    const min = Math.ceil(totalSec / 60);
    if (min < 60) return `${min} dk`;
    return `${Math.floor(min / 60)} sa ${min % 60} dk`;
  })();

  const isEnrolled = !!progress;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <nav className="bg-white border-b border-slate-200 px-6 py-4 shadow-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <button onClick={() => navigate('/courses')} className="text-slate-500 hover:text-indigo-600 transition-colors">
            <ChevronLeft size={20} />
          </button>
          <div className="bg-indigo-50 p-2 rounded-lg">
            <BookOpen className="text-indigo-600" size={20} />
          </div>
          <span className="font-bold tracking-tight text-slate-900 text-lg">
            DEÜ YBS <span className="text-indigo-600">LMS</span>
          </span>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-white border-b border-slate-200 py-12 px-6">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-10">
          <div className="md:col-span-2 space-y-6">
            <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-md uppercase tracking-wide border border-indigo-100">
              {course.level}
            </span>
            <h1 className="text-4xl font-bold text-slate-900 leading-tight">
              {course.title}
            </h1>
            <p className="text-lg text-slate-600 leading-relaxed max-w-2xl">
              {course.description}
            </p>
            <div className="flex flex-wrap items-center gap-6 text-sm font-semibold text-slate-500">
              <span className="flex items-center gap-1.5"><BookOpen size={18} /> {course.lessons.length} Ders</span>
              <span className="flex items-center gap-1.5"><Clock size={18} /> {totalDurationStr}</span>
              <span className="flex items-center gap-1.5 text-amber-500"><Zap size={18} fill="currentColor" /> Toplam {course.totalXpReward} XP</span>
              <span className="text-slate-400">|</span>
              <span className="text-slate-700">Eğitmen: <span className="text-indigo-600">{course.teacherName}</span></span>
            </div>
          </div>
          
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col justify-center h-full">
            {isEnrolled ? (
              <div className="text-center space-y-5">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-600 mx-auto rounded-full flex items-center justify-center border border-emerald-100 mb-2">
                  <CheckCircle size={32} />
                </div>
                <div>
                   <h3 className="font-bold text-slate-900 mb-1">Bu Kursa Kayıtlısınız</h3>
                   <p className="text-sm text-slate-500">
                     İlerlemeniz: %{progress.completionPercentage} ({progress.completedLessons} / {progress.totalLessons} ders)
                   </p>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${progress.completionPercentage}%` }}></div>
                </div>
                <button 
                  onClick={() => navigate(`/course/${courseId}/skill-tree`)}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-md mt-2 flex items-center justify-center gap-2"
                >
                  <Play size={18} fill="currentColor" />
                  Eğitime Devam Et
                </button>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <h3 className="font-extrabold text-2xl text-slate-900">Ücretsiz</h3>
                <p className="text-sm text-slate-500 mb-4">Hemen kayıt olun, XP puanları ve rozetler kazanmaya başlayın.</p>
                <button 
                   onClick={handleEnroll}
                   disabled={enrolling}
                   className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-75 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-md shadow-indigo-600/20"
                >
                  {enrolling ? 'İşleniyor...' : 'Hemen Kayıt Ol'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          <BookOpen className="text-indigo-600" size={24} /> 
          Kurs İçeriği
        </h2>
        
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          {course.lessons.map((lesson, idx) => (
             <div key={lesson.id} className={`flex items-start md:items-center gap-4 p-5 ${idx !== course.lessons.length - 1 ? 'border-b border-slate-100' : ''}`}>
                <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 text-slate-500 font-bold flex items-center justify-center shrink-0">
                  {lesson.orderIndex}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-900 text-base">{lesson.title}</h3>
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500 font-semibold">
                    <span>{Math.ceil(lesson.durationInSeconds / 60)} dakika</span>
                    {lesson.hasQuiz && (
                      <>
                        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                        <span className="text-indigo-600">Quiz Mevcut</span>
                      </>
                    )}
                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                    <span className="text-amber-500 flex items-center gap-0.5"><Zap size={10} fill="currentColor"/> {lesson.xpReward} XP</span>
                  </div>
                </div>
                
                {isEnrolled && (() => {
                  const lp = progress.lessonProgresses.find(p => p.lessonId === lesson.id);
                  if (lp?.isQuizPassed) return <CheckCircle className="text-emerald-500 shrink-0" size={20} />;
                  if (lp?.isVideoCompleted) return <span className="text-xs font-semibold px-2 py-1 bg-indigo-50 text-indigo-700 rounded-md shrink-0">Video bitti</span>;
                  return null;
                })()}
             </div>
          ))}
        </div>
      </div>
    </div>
  );
}
