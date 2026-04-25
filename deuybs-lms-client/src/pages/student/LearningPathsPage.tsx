// Path: src/pages/student/LearningPathsPage.tsx

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Compass, ChevronRight, Star, Target, Layers, LayoutGrid } from 'lucide-react';
import { getLearningPathsApi, seedLearningPathsApi } from '../../api/learningPath.api';
import type { LearningPathDto } from '../../types';
import toast from 'react-hot-toast';
import ThemeToggle from '../../components/shared/ThemeToggle';

export default function LearningPathsPage() {
  const [paths, setPaths] = useState<LearningPathDto[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const data = await getLearningPathsApi();
      setPaths(data);
    } catch (err) {
      toast.error('Öğrenme yolları yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSeed = async () => {
    try {
      await seedLearningPathsApi();
      toast.success('Örnek öğrenme yolu oluşturuldu!');
      fetchData();
    } catch (err) {
      toast.error('Giriş başarısız.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white pb-20">
      {/* Header */}
      <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-6 py-4 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
           <div className="flex items-center gap-3">
              <Link to="/student/dashboard" className="bg-slate-100 dark:bg-slate-800 p-2 rounded-xl text-slate-500 hover:text-indigo-600 transition-all">
                <LayoutGrid size={20} />
              </Link>
              <h1 className="text-xl font-black uppercase tracking-tight">KARİYER YOLLARI</h1>
           </div>
           <ThemeToggle />
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Banner */}
        <div className="bg-indigo-600 rounded-[2.5rem] p-12 text-white mb-16 relative overflow-hidden shadow-2xl shadow-indigo-500/20">
            <div className="absolute right-0 top-0 w-1/3 h-full bg-gradient-to-l from-white/10 to-transparent"></div>
            <div className="relative z-10 max-w-2xl">
                <div className="flex items-center gap-2 mb-6">
                    <Compass className="text-indigo-200 animate-pulse" size={28} />
                    <span className="font-black tracking-[0.2em] text-indigo-200 text-xs uppercase">Geleceğini İnşa Et</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tighter leading-tight">İHTİSAS <br/>PROGRAMLARI</h2>
                <p className="text-indigo-100 font-bold mb-8 leading-relaxed opacity-80">Rastgele öğrenmeyi bırakın. Alanında uzmanlaşmış kurs paketlerini takip ederek hayalinizdeki kariyere adım adım ulaşın.</p>
                
                {paths.length === 0 && (
                    <button onClick={handleSeed} className="bg-white text-indigo-600 px-8 py-4 rounded-2xl font-black text-sm shadow-xl hover:scale-105 transition-all">
                        İLK YOLU OLUŞTUR
                    </button>
                )}
            </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
            {paths.map((path) => (
                <Link 
                    key={path.id} 
                    to={`/student/learning-path/${path.id}`}
                    className="group bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-8 hover:border-indigo-500 dark:hover:border-indigo-500 transition-all shadow-sm hover:shadow-xl relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                        <Target size={120} />
                    </div>

                    <div className="flex items-start justify-between mb-8">
                        <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/30 rounded-3xl flex items-center justify-center text-indigo-600 shadow-inner">
                            <Layers size={32} />
                        </div>
                        <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest">
                            {path.difficulty}
                        </span>
                    </div>

                    <h3 className="text-2xl font-black mb-3 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{path.title}</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-8 line-clamp-2">
                        {path.description}
                    </p>

                    <div className="pt-8 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kurs Sayısı</span>
                                <span className="font-black text-slate-800 dark:text-slate-200">{path.totalCourses} Eğitim</span>
                            </div>
                            <div className="w-px h-8 bg-slate-100 dark:bg-slate-800"></div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Puan</span>
                                <span className="font-black text-amber-500 flex items-center gap-1">5.0 <Star size={12} fill="currentColor" /></span>
                            </div>
                        </div>

                        <div className="bg-indigo-600 text-white p-3 rounded-2xl group-hover:scale-110 transition-transform shadow-lg shadow-indigo-500/20">
                            <ChevronRight size={20} />
                        </div>
                    </div>
                </Link>
            ))}
        </div>
      </div>
    </div>
  );
}
