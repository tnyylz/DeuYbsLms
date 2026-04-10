// Path: src/pages/student/CoursesPage.tsx

import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Zap, ChevronLeft, Search } from 'lucide-react';
import { getCoursesApi } from '../../api/courses.api';
import type { CourseDto } from '../../types';

export default function CoursesPage() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<CourseDto[]>([]);
  const [filtered, setFiltered] = useState<CourseDto[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await getCoursesApi();
        setCourses(data);
        setFiltered(data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchCourses();
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(courses.filter(c => c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)));
  }, [search, courses]);

  const levelLabel = (level: string) => {
    if (level === 'Beginner') return { label: 'Başlangıç', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    if (level === 'Intermediate') return { label: 'Orta', color: 'text-amber-700 bg-amber-50 border-amber-200' };
    return { label: 'İleri', color: 'text-rose-700 bg-rose-50 border-rose-200' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <nav className="bg-white border-b border-slate-200 px-6 py-4 shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <button onClick={() => navigate('/student/dashboard')} className="text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer">
            <ChevronLeft size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="bg-indigo-50 p-2 rounded-lg">
              <BookOpen className="text-indigo-600" size={20} />
            </div>
            <span className="font-bold tracking-tight text-slate-900 text-lg">
              DEÜ YBS <span className="text-indigo-600">LMS</span>
            </span>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-slate-900">Kurslar</h1>
          <p className="text-slate-500">Platformdaki tüm mevcut kurslara göz atın ve yeni yetenekler edinin.</p>
        </div>

        <div className="relative mb-10 shadow-sm">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Kurs başlığı veya açıklaması ara..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            className="w-full bg-white border border-slate-200 rounded-xl pl-11 pr-4 py-3.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium" 
          />
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((course, idx) => {
            const level = levelLabel(course.level);
            return (
              <div 
                key={course.id} 
                className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-lg hover:-translate-y-1 hover:border-indigo-200 transition-all duration-300 flex flex-col group shadow-sm"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <span className={`text-xs px-2.5 py-1 rounded-md border font-bold uppercase tracking-wide ${level.color}`}>
                    {level.label}
                  </span>
                  <span className="flex items-center gap-1 text-xs font-bold text-amber-500 bg-amber-50 px-2.5 py-1 rounded-md">
                    <Zap size={14} fill="currentColor" /> {course.totalXpReward} XP
                  </span>
                </div>
                <h3 className="text-lg font-bold mb-2 text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug">
                  {course.title}
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed line-clamp-2 flex-1 mb-6">
                  {course.description}
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                    <BookOpen size={14} className="text-slate-400" /> {course.lessonCount} ders
                  </div>
                  <Link 
                    to={`/course/${course.id}/detail`} 
                    className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition-colors px-4 py-2 rounded-lg text-sm font-semibold flex items-center shadow-sm"
                  >
                    Detaylar →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20 bg-white border border-slate-200 rounded-2xl shadow-sm mt-8">
            <BookOpen className="mx-auto mb-4 text-slate-300" size={48} />
            <p className="text-slate-500 font-medium text-lg">Aramanıza uygun kurs bulunamadı.</p>
          </div>
        )}
      </div>
    </div>
  );
}