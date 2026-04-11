// Path: src/pages/student/CoursesPage.tsx

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Zap, ChevronLeft, Search, Clock, User, PlayCircle } from 'lucide-react';
import { getCoursesApi } from '../../api/courses.api';
import { getMyEnrollmentsApi } from '../../api/progress.api';
import { getFileUrl } from '../../utils/fileUtils';
import type { CourseDto, EnrollmentDto } from '../../types';

export default function CoursesPage() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<CourseDto[]>([]);
  const [enrollments, setEnrollments] = useState<EnrollmentDto[]>([]);
  const [filtered, setFiltered] = useState<CourseDto[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Hem tüm kursları hem de mevcut kullanıcının kayıtlarını çekelim
        const [coursesData, enrollmentsData] = await Promise.all([
          getCoursesApi(),
          getMyEnrollmentsApi()
        ]);
        setCourses(coursesData);
        setEnrollments(enrollmentsData);
        setFiltered(coursesData);
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

  const isEnrolled = (courseId: string) => enrollments.some(e => e.courseId === courseId);

  const levelLabel = (level: string) => {
    const l = level.toLowerCase();
    if (l.includes('beginner') || l.includes('başlangıç')) return { label: 'Başlangıç', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    if (l.includes('intermediate') || l.includes('orta')) return { label: 'Orta', color: 'text-amber-700 bg-amber-50 border-amber-200' };
    return { label: 'İleri', color: 'text-rose-700 bg-rose-50 border-rose-200' };
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours} sa ${minutes} dk`;
    return `${minutes} dk`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-20">
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 shadow-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/student/dashboard')} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-indigo-600 transition-all cursor-pointer">
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
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-4xl font-extrabold mb-3 text-slate-900 tracking-tight">Kurs Kataloğu</h1>
          <p className="text-slate-500 text-lg">Yeteneklerinizi geliştirmek için tasarlanmış eğitim programlarını keşfedin.</p>
        </div>

        <div className="relative mb-12 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Kurs başlığı, eğitmen veya içerik ara..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium text-lg shadow-sm" 
          />
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((course, idx) => {
            const level = levelLabel(course.level);
            const enrolled = isEnrolled(course.id);
            
            return (
              <div 
                key={course.id} 
                onClick={() => navigate(`/course/${course.id}/detail`)}
                className="bg-white border border-slate-200 rounded-3xl overflow-hidden hover:shadow-2xl hover:-translate-y-2 hover:border-indigo-200 transition-all duration-500 flex flex-col group cursor-pointer shadow-sm shadow-slate-200/50"
                style={{ animationDelay: `${idx * 50}ms` }}
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
                  {enrolled && (
                    <div className="absolute top-4 right-4 animate-in fade-in zoom-in duration-300">
                      <span className="bg-emerald-500 text-white text-[10px] px-2.5 py-1 rounded-lg font-bold uppercase tracking-wider shadow-lg flex items-center gap-1">
                        <PlayCircle size={10} fill="currentColor" /> Kayıtlı
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center gap-2 mb-3 text-amber-500">
                    <Zap size={14} fill="currentColor" />
                    <span className="text-[10px] font-extrabold tracking-widest uppercase">{course.totalXpReward} XP Ödülü</span>
                  </div>

                  <h3 className="text-xl font-bold mb-3 text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight line-clamp-2">
                    {course.title}
                  </h3>
                  
                  <p className="text-slate-500 text-sm leading-relaxed line-clamp-2 mb-6 flex-1">
                    {course.description}
                  </p>

                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">
                      {course.teacherName.charAt(0)}
                    </div>
                    <span className="text-xs font-bold text-slate-600 underline decoration-indigo-200 underline-offset-4">{course.teacherName}</span>
                  </div>

                  <div className="flex items-center justify-between pt-5 border-t border-slate-100">
                    <div className="flex items-center gap-4 text-[11px] font-bold text-slate-400">
                      <span className="flex items-center gap-1.5"><BookOpen size={14} className="text-slate-300" /> {course.lessonCount} Ders</span>
                      <span className="flex items-center gap-1.5"><Clock size={14} className="text-slate-300" /> {formatDuration(course.totalDurationInSeconds)}</span>
                    </div>

                    <div className={`p-2 rounded-xl transition-all duration-300 ${enrolled ? 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white' : 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white'}`}>
                      {enrolled ? <PlayCircle size={20} /> : <ChevronLeft size={20} className="rotate-180" />}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20 bg-white border border-slate-200 rounded-3xl shadow-sm mt-8 animate-in fade-in zoom-in duration-300">
            <Search className="mx-auto mb-4 text-slate-300" size={48} />
            <p className="text-slate-500 font-bold text-lg">Aramanıza uygun kurs bulunamadı.</p>
            <button onClick={() => setSearch('')} className="mt-4 text-indigo-600 font-bold hover:underline">Tüm kursları göster</button>
          </div>
        )}
      </div>
    </div>
  );
}