// Path: src/pages/student/CoursesPage.tsx

import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Zap, ChevronLeft, Search, Clock, PlayCircle, Layout } from 'lucide-react';
import { getCoursesApi } from '../../api/courses.api';
import { getMyEnrollmentsApi } from '../../api/progress.api';
import { getFileUrl } from '../../utils/fileUtils';
import ThemeToggle from '../../components/shared/ThemeToggle';
import type { CourseDto, EnrollmentDto } from '../../types';
import { motion } from 'framer-motion';

export default function CoursesPage() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<CourseDto[]>([]);
  const [filtered, setFiltered] = useState<CourseDto[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesData, enrollmentsData] = await Promise.all([
          getCoursesApi(),
          getMyEnrollmentsApi()
        ]);
        
        // Sadece kayıtlı (atanmış) kursları filtrele
        const enrolledCourseIds = new Set(enrollmentsData.map(e => e.courseId));
        const assignedCourses = coursesData.filter(c => enrolledCourseIds.has(c.id));
        
        setCourses(assignedCourses);
        setFiltered(assignedCourses);
      } catch (err) { 
        console.error("Veri çekme hatası:", err); 
      } finally { 
        setLoading(false); 
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(courses.filter(c => 
      c.title.toLowerCase().includes(q) || 
      c.description.toLowerCase().includes(q) ||
      c.teacherName.toLowerCase().includes(q)
    ));
  }, [search, courses]);

  // ... (existing logic for duration formatting, etc.)

  const levelLabel = (level: string) => {
    const l = level.toLowerCase();
    if (l.includes('beginner') || l.includes('başlangıç')) 
      return { label: 'Başlangıç', color: 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800' };
    if (l.includes('intermediate') || l.includes('orta')) 
      return { label: 'Orta', color: 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800' };
    return { label: 'İleri', color: 'text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/30 border-rose-200 dark:border-rose-800' };
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours} sa ${minutes} dk`;
    return `${minutes} dk`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-sans pb-20 transition-colors duration-300">
      <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-6 py-4 sticky top-0 z-50 shadow-sm transition-colors">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/student/dashboard')} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all cursor-pointer">
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

          <div className="flex items-center gap-6">
            <Link to="/student/kanban" className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold transition-all text-sm group">
               <Layout size={16} className="group-hover:rotate-12 transition-transform" /> 
               Pano
               <span className="bg-amber-400 text-amber-950 text-[8px] px-1.5 py-0.5 rounded-full animate-bounce">YENİ</span>
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-4xl font-extrabold mb-3 text-slate-900 dark:text-white tracking-tight">Atanan Kurslarım</h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg">Yöneticiler tarafından size atanan eğitim içerikleri burada listelenir.</p>
        </div>

        <div className="relative mb-12 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Atanan kurslar içinde ara..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium text-lg shadow-sm" 
          />
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((course, idx) => {
            const level = levelLabel(course.level);

            return (
              <motion.div 
                key={course.id} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1,
                  y: 0 
                }}
                transition={{ 
                  opacity: { duration: 0.4 },
                  scale: { duration: 0.4 },
                  delay: idx * 0.05 
                }}
                onClick={() => navigate(`/course/${course.id}/detail`)}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-500 flex flex-col group cursor-pointer shadow-sm shadow-slate-200/50 dark:shadow-none dark:hover:border-indigo-500"
              >
                {/* Image Section */}
                <div className="relative h-48 overflow-hidden bg-slate-100">
                  {course.thumbnailUrl ? (
                    <img 
                      src={getFileUrl(course.thumbnailUrl)} 
                      alt={course.title} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                      <BookOpen size={48} className="text-white opacity-30" />
                    </div>
                  )}
                  <div className="absolute top-4 left-4">
                    <span className={`text-[10px] px-2.5 py-1 rounded-lg border font-bold uppercase tracking-widest backdrop-blur-md shadow-sm ${level.color}`}>
                      {level.label}
                    </span>
                  </div>
                  <div className="absolute top-4 right-4 animate-in fade-in zoom-in duration-300">
                    <span className="bg-emerald-500 text-white text-[10px] px-2.5 py-1 rounded-lg font-bold uppercase tracking-wider shadow-lg flex items-center gap-1">
                      <PlayCircle size={10} fill="currentColor" /> Atandı
                    </span>
                  </div>
                </div>

                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center gap-2 mb-3 text-amber-500">
                    <Zap size={14} fill="currentColor" />
                    <span className="text-[10px] font-extrabold tracking-widest uppercase">{course.totalXpReward} XP Ödülü</span>
                  </div>

                  <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors leading-tight line-clamp-2">
                    {course.title}
                  </h3>
                  
                  <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed line-clamp-2 mb-6 flex-1">
                    {course.description}
                  </p>

                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase">
                      {course.teacherName.charAt(0)}
                    </div>
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400 underline decoration-indigo-200 dark:decoration-indigo-800 underline-offset-4">{course.teacherName}</span>
                  </div>

                  <div className="flex items-center justify-between pt-5 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-4 text-[11px] font-bold text-slate-400 dark:text-slate-500">
                      <span className="flex items-center gap-1.5"><BookOpen size={14} className="text-slate-300 dark:text-slate-700" /> {course.lessonCount} Ders</span>
                      <span className="flex items-center gap-1.5"><Clock size={14} className="text-slate-300 dark:text-slate-700" /> {formatDuration(course.totalDurationInSeconds)}</span>
                    </div>

                    <div className="p-2 rounded-xl transition-all duration-300 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white">
                      <PlayCircle size={20} />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm mt-8 animate-in fade-in zoom-in duration-300">
            <Search className="mx-auto mb-4 text-slate-300 dark:text-slate-700" size={48} />
            <p className="text-slate-500 dark:text-slate-400 font-bold text-lg">Aramanıza uygun kurs bulunamadı.</p>
            <button onClick={() => setSearch('')} className="mt-4 text-indigo-600 dark:text-indigo-400 font-bold hover:underline">Tüm kursları göster</button>
          </div>
        )}
      </div>
    </div>
  );
}