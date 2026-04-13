import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BookOpen, ChevronLeft, AlertTriangle, Users, BarChart2, Search, Filter, Mail, ArrowUpRight } from 'lucide-react';
import { getCourseAnalyticsApi } from '../../api/teacher.api';
import type { StudentAnalyticsDto } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeToggle from '../../components/shared/ThemeToggle';

export default function AnalyticsPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();

  const [students, setStudents] = useState<StudentAnalyticsDto[]>([]);
  const [filtered, setFiltered] = useState<StudentAnalyticsDto[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showRedFlagsOnly, setShowRedFlagsOnly] = useState(false);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const data = await getCourseAnalyticsApi(courseId);
        setStudents(data);
        setFiltered(data);
      } catch (err) {
        console.error('Analytics fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [courseId]);

  useEffect(() => {
    let result = students;
    if (showRedFlagsOnly) result = result.filter(s => s.isRedFlag);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(s => s.fullName.toLowerCase().includes(q) || s.email.toLowerCase().includes(q));
    }
    setFiltered(result);
  }, [search, showRedFlagsOnly, students]);

  const redFlagCount = students.filter(s => s.isRedFlag).length;
  const avgCompletion = students.length > 0 
    ? Math.round(students.reduce((a, s) => a + s.completionPercentage, 0) / students.length) 
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full" 
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-indigo-100">
      <nav className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl sticky top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
           <div className="flex items-center gap-4">
              <button onClick={() => navigate('/teacher/dashboard')} className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-100 dark:hover:border-indigo-900 transition-all shadow-sm">
                 <ChevronLeft size={20} />
              </button>
              <div className="flex items-center gap-2">
                 <BarChart2 className="text-indigo-600 dark:text-indigo-400" size={20} />
                 <span className="font-black tracking-tight uppercase text-lg">Eğitim Analitiği</span>
              </div>
           </div>
           <div className="hidden sm:flex items-center gap-4">
              <ThemeToggle />
              <div className="px-5 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                 {courseId ? 'Kurs Bazlı Analiz' : 'Genel Özet'}
              </div>
           </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">
         <div className="mb-12">
           <h1 className="text-4xl font-black mb-2 tracking-tight uppercase text-slate-900 dark:text-slate-100">Öğrenci <span className="text-indigo-600 dark:text-indigo-400">Performansı</span></h1>
           <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-sm">Gelişmeleri takip et ve aksiyon al.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            { label: 'Kayıtlı Öğrenci', value: students.length, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
            { label: 'Ort. Tamamlanma', value: `${avgCompletion}%`, icon: BarChart2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Risk Altındakiler', value: redFlagCount, icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50' },
          ].map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
               transition={{ delay: i * 0.1 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 hover:shadow-xl hover:shadow-indigo-500/5 dark:hover:shadow-indigo-500/10 transition-all group"
            >
              <div className={`w-14 h-14 ${stat.bg} ${stat.color} dark:bg-slate-800 dark:text-indigo-400 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform`}>
                <stat.icon size={26} />
              </div>
              <p className="text-4xl font-black mb-1 tracking-tighter text-slate-900 dark:text-slate-100">{stat.value}</p>
              <p className="text-slate-400 dark:text-slate-500 font-black text-[10px] uppercase tracking-[0.2em]">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-10">
           <div className="relative flex-1 group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={20} />
               <input 
                type="text" 
                placeholder="Öğrenci adı veya e-posta ile ara..." 
                value={search} 
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[1.5rem] pl-14 pr-6 py-5 outline-none focus:border-indigo-600/50 focus:ring-8 focus:ring-indigo-500/5 transition-all text-sm font-bold shadow-sm text-slate-900 dark:text-slate-100"
              />
           </div>
            <button 
            onClick={() => setShowRedFlagsOnly(!showRedFlagsOnly)}
            className={`flex items-center gap-3 px-10 py-5 rounded-[1.5rem] text-sm font-black transition-all border-2 uppercase tracking-widest shadow-xl ${showRedFlagsOnly ? 'bg-red-500 text-white border-red-500 shadow-red-500/20' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 hover:text-red-500 hover:border-red-100 dark:hover:border-red-900'}`}
           >
              <Filter size={18} /> {showRedFlagsOnly ? 'TÜMÜNÜ GÖSTER' : `RİSKLİLER (${redFlagCount})`}
           </button>
        </div>

         {/* Students Table/Grid */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[3rem] overflow-hidden shadow-sm">
           <div className="overflow-x-auto">
              <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-[0.25em]">
                       <th className="px-10 py-8">Öğrenci</th>
                       <th className="px-10 py-8">Kurs</th>
                       <th className="px-10 py-8">İlerleme</th>
                       <th className="px-10 py-8">Quiz Durumu</th>
                       <th className="px-10 py-8 text-right">Aksiyon</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    <AnimatePresence>
                       {filtered.map((s, i) => (
                          <motion.tr 
                            key={s.studentId}
                             initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
                          >
                             <td className="px-10 py-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-indigo-600 dark:bg-indigo-900/50 rounded-2xl flex items-center justify-center font-black text-sm text-white dark:text-indigo-300 shadow-lg shadow-indigo-600/20 uppercase">
                                      {s.fullName.charAt(0)}
                                   </div>
                                   <div>
                                      <p className="font-black text-slate-900 dark:text-slate-100 leading-tight uppercase tracking-tight">{s.fullName}</p>
                                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">{s.email}</p>
                                   </div>
                                </div>
                             </td>
                              <td className="px-10 py-8">
                                <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 px-4 py-2 rounded-xl uppercase tracking-widest">
                                   {s.courseTitle}
                                </span>
                             </td>
                             <td className="px-10 py-8">
                                <div className="flex items-center gap-4">
                                    <div className="flex-1 w-24 bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                                      <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${s.completionPercentage}%` }}
                                        className={`h-full rounded-full shadow-inner ${s.completionPercentage >= 80 ? 'bg-emerald-500' : s.completionPercentage >= 40 ? 'bg-amber-500' : 'bg-red-500'}`}
                                      />
                                   </div>
                                   <span className="text-xs font-black text-slate-900 dark:text-slate-100 uppercase">{s.completionPercentage}%</span>
                                </div>
                             </td>
                             <td className="px-10 py-8">
                                 <div className="flex flex-col gap-1.5">
                                   <span className={`text-[10px] font-black uppercase tracking-widest ${s.failedQuizAttempts > 2 ? 'text-red-500 dark:text-red-400' : 'text-slate-500 dark:text-slate-400'}`}>
                                      {s.failedQuizAttempts} Başarısız Deneme
                                   </span>
                                   {s.isRedFlag && (
                                     <div className="flex items-center gap-1.5 text-red-500">
                                       <AlertTriangle size={12} />
                                       <span className="text-[9px] font-black uppercase tracking-tighter">Acil ilgi gerekiyor!</span>
                                     </div>
                                   )}
                                </div>
                             </td>
                             <td className="px-10 py-8 text-right">
                                 <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                   <button title="E-posta Gönder" className="w-10 h-10 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-100 dark:hover:border-indigo-900 hover:shadow-lg transition-all flex items-center justify-center">
                                      <Mail size={16} />
                                   </button>
                                   <button title="Detaylar" className="w-10 h-10 bg-indigo-600 dark:bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 dark:hover:bg-indigo-500 shadow-lg shadow-indigo-600/10 transition-all flex items-center justify-center">
                                      <ArrowUpRight size={16} />
                                   </button>
                                </div>
                             </td>
                          </motion.tr>
                       ))}
                    </AnimatePresence>
                 </tbody>
              </table>
           </div>
                      {filtered.length === 0 && (
               <div className="py-24 text-center">
                  <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                     <Search className="text-slate-200 dark:text-slate-700" size={32} />
                  </div>
                  <h3 className="text-2xl font-black mb-1 uppercase tracking-tight text-slate-900 dark:text-slate-100">Kayıt Bulunamadı</h3>
                  <p className="text-slate-400 dark:text-slate-500 text-sm font-medium uppercase tracking-widest">Filtreleri değiştirerek tekrar dene.</p>
               </div>
            )}
        </div>
      </main>
    </div>
  );
}
