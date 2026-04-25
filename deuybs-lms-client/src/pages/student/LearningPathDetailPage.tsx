// Path: src/pages/student/LearningPathDetailPage.tsx

import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, Lock, CheckCircle2, Play, BookOpen, Trophy, Clock } from 'lucide-react';
import { getLearningPathByIdApi } from '../../api/learningPath.api';
import type { LearningPathDto } from '../../types';
import toast from 'react-hot-toast';
import ThemeToggle from '../../components/shared/ThemeToggle';

export default function LearningPathDetailPage() {
  const { pathId } = useParams<{ pathId: string }>();
  const [path, setPath] = useState<LearningPathDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!pathId) return;
        const data = await getLearningPathByIdApi(pathId);
        setPath(data);
      } catch (err) {
        toast.error('Detaylar yüklenemedi.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [pathId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!path) return <div className="p-10 text-center">Yol bulunamadı.</div>;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white pb-20">
      {/* Header */}
      <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-6 py-4 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
           <Link to="/student/learning-paths" className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-all font-bold text-sm">
              <ChevronLeft size={20} /> GERİ DÖN
           </Link>
           <ThemeToggle />
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-12">
        
        {/* Intro Section */}
        <div className="mb-16">
            <div className="flex items-center gap-3 mb-6">
                <span className="bg-indigo-600 text-white text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-widest">Kariyer Yolu</span>
                <span className="text-slate-400 text-xs font-bold uppercase tracking-widest flex items-center gap-1">
                    <Clock size={14} /> {path.totalCourses * 4} SAAT+ İÇERİK
                </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black mb-6 tracking-tighter uppercase leading-tight">{path.title}</h1>
            <p className="text-slate-500 dark:text-slate-400 text-lg font-medium leading-relaxed max-w-3xl">
                {path.description}
            </p>
        </div>

        {/* Roadmap Visualization */}
        <div className="relative space-y-12">
            {/* Vertical Line */}
            <div className="absolute left-[27px] md:left-1/2 top-10 bottom-10 w-1 bg-slate-100 dark:bg-slate-800 -translate-x-1/2 hidden sm:block"></div>

            {path.courses.map((pc, index) => {
                // MANTIK: İlk kurs direkt açık. Sonraki kurs bir önceki tamamlanmışsa açık.
                // Not: Backend'den status bilgisini "Locked" vs. olarak göndermeyi planlamıştık.
                const isFirst = index === 0;
                const isCompleted = pc.progressPercentage === 100;
                const isLocked = !isFirst && path.courses[index-1].progressPercentage < 100;

                return (
                    <div 
                        key={pc.courseId}
                        className={`relative flex flex-col sm:flex-row items-center gap-8 ${index % 2 !== 0 ? 'sm:flex-row-reverse' : ''}`}
                    >
                        {/* Node (Circle) */}
                        <div className={`z-10 w-14 h-14 rounded-full flex items-center justify-center border-4 shadow-xl transition-all duration-500 bg-white dark:bg-slate-900 
                            ${isCompleted ? 'border-emerald-500 text-emerald-500' : 
                              isLocked ? 'border-slate-200 dark:border-slate-800 text-slate-300' : 
                              'border-indigo-600 text-indigo-600 scale-110 shadow-indigo-500/20'}`}
                        >
                            {isCompleted ? <CheckCircle2 size={24} /> : 
                             isLocked ? <Lock size={24} /> : 
                             <div className="font-black text-xl">{index + 1}</div>}
                        </div>

                        {/* Content Card */}
                        <div className={`flex-1 w-full p-8 rounded-[2rem] border-2 transition-all 
                            ${isLocked ? 'bg-slate-50/50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800 opacity-60' : 
                              isCompleted ? 'bg-white dark:bg-slate-900 border-emerald-100 dark:border-emerald-900/30' : 
                              'bg-white dark:bg-slate-900 border-indigo-100 dark:border-indigo-900 shadow-xl'}`}
                        >
                            <div className="flex items-center gap-2 mb-4">
                                <BookOpen size={16} className="text-slate-400" />
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">KURS {index + 1}</span>
                            </div>

                            <h4 className="text-xl font-black mb-4 uppercase tracking-tight leading-tight">{pc.courseTitle}</h4>
                            
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                                <div className="w-full sm:w-1/2">
                                    <div className="flex justify-between text-[10px] font-black text-slate-400 mb-2 uppercase tracking-tighter">
                                        <span>İlerleme</span>
                                        <span>%{pc.progressPercentage}</span>
                                    </div>
                                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full transition-all duration-1000 ${isCompleted ? 'bg-emerald-500' : 'bg-indigo-600'}`}
                                            style={{ width: `${pc.progressPercentage}%` }}
                                        ></div>
                                    </div>
                                </div>

                                {isLocked ? (
                                    <div className="flex items-center gap-2 text-slate-400 text-xs font-bold px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl">
                                        <Lock size={14} /> ÖNCEKİ KURSU TAMAMLA
                                    </div>
                                ) : (
                                    <Link 
                                        to={`/course/${pc.courseId}/detail`}
                                        className={`px-6 py-2.5 rounded-xl font-black text-xs transition-all flex items-center gap-2 
                                            ${isCompleted ? 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200' : 'bg-indigo-600 text-white hover:bg-slate-900 dark:hover:bg-white dark:hover:text-black shadow-lg shadow-indigo-500/20'}`}
                                    >
                                        {isCompleted ? 'TEKRAR İZLE' : <><Play size={14} fill="currentColor" /> EĞİTİME BAŞLA</>}
                                    </Link>
                                )}
                            </div>
                        </div>

                        {/* Spacer for horizontal layout */}
                        <div className="hidden sm:block flex-1"></div>
                    </div>
                );
            })}
        </div>

        {/* Milestone Card */}
        <div className="mt-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-[2.5rem] p-10 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl shadow-orange-500/30">
            <div>
                <h3 className="text-2xl font-black mb-2 flex items-center gap-2 uppercase tracking-tight">
                    <Trophy size={28} /> ÖDÜL KAZAN
                </h3>
                <p className="text-white/80 font-bold text-sm">Bu kariyer yolunu tamamla ve profiline özel "UZMAN" rozetini ekleyelim.</p>
            </div>
            <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center text-4xl shadow-inner border border-white/30">
                🏆
            </div>
        </div>
      </div>
    </div>
  );
}
