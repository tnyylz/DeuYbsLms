import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Users, BarChart2, PlusCircle, LogOut, ChevronRight, LayoutDashboard, Settings, Layers } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { getTeacherDashboardApi } from '../../api/teacher.api';
import { getFileUrl } from '../../utils/fileUtils';
import type { TeacherDashboardDto } from '../../types';
import { motion } from 'framer-motion';
import ThemeToggle from '../../components/shared/ThemeToggle';
import NotificationCenter from '../../components/shared/NotificationCenter';

export default function TeacherDashboard() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [data, setData] = useState<TeacherDashboardDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const stats = await getTeacherDashboardApi();
        setData(stats);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const handleLogout = () => { logout(); navigate('/'); };

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
      {/* Sidebar / Topbar Mixed Dashboard Layout */}
      <nav className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl sticky top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
              <BookOpen className="text-white" size={22} />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight block">DEÜ YBS <span className="text-indigo-600">LMS</span></span>
              <span className="text-[10px] uppercase tracking-widest text-indigo-500 font-bold">Eğitmen Portalı</span>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/teacher/analytics" className="text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all text-sm font-semibold flex items-center gap-2 group">
              <BarChart2 size={16} className="group-hover:text-indigo-600 transition-colors" /> Analitik
            </Link>
            <div className="h-4 w-px bg-slate-200 dark:bg-slate-700" />
            <Link to="/teacher/learning-paths" className="text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all text-sm font-semibold flex items-center gap-2 group">
              <Layers size={16} className="group-hover:text-indigo-600 transition-colors" /> Yol Haritaları
            </Link>
            <div className="h-4 w-px bg-slate-200 dark:bg-slate-700" />
            <NotificationCenter />
            <div className="h-4 w-px bg-slate-200 dark:bg-slate-700" />
            <ThemeToggle />
            <div className="h-4 w-px bg-slate-200 dark:bg-slate-700" />
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{user?.fullName}</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-tighter">Kıdemli Eğitmen</p>
              </div>
              <button 
                onClick={handleLogout}
                className="w-9 h-9 border border-slate-200 dark:border-slate-700 rounded-full flex items-center justify-center text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-900 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl font-black tracking-tight mb-2 text-slate-900 dark:text-slate-100">
              Hoş geldin, <span className="text-indigo-600 dark:text-indigo-400">{user?.fullName?.split(' ')[0]}</span> 👋
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">Bugün yeni neler öğretmek istersin?</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Link 
              to="/teacher/course-builder" 
              className="group relative bg-indigo-600 hover:bg-indigo-700 transition-all px-8 py-4 rounded-2xl text-sm font-bold text-white flex items-center gap-2 shadow-xl shadow-indigo-600/20 active:scale-95"
            >
              <PlusCircle size={20} />
              <span>Yeni Kurs Hazırla</span>
            </Link>
          </motion.div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {[
            { label: 'Oluşturulan Kurslar', value: data?.totalCourses ?? 0, icon: BookOpen, color: 'text-indigo-600', bg: 'bg-indigo-50' },
            { label: 'Toplam Öğrenci', value: data?.totalStudents ?? 0, icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Aktif Kayıtlar', value: data?.totalEnrollments ?? 0, icon: LayoutDashboard, color: 'text-amber-600', bg: 'bg-amber-50' },
          ].map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 hover:border-indigo-200 dark:hover:border-indigo-800 hover:shadow-xl hover:shadow-indigo-500/5 transition-all group"
            >
              <div className={`w-12 h-12 ${stat.bg} ${stat.color} dark:bg-indigo-950/30 dark:text-indigo-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <stat.icon size={24} />
              </div>
              <p className="text-4xl font-black mb-1 text-slate-900 dark:text-slate-100">{stat.value}</p>
              <p className="text-slate-400 dark:text-slate-500 font-bold text-xs uppercase tracking-widest">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Courses Section */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black flex items-center gap-3 text-slate-900 dark:text-slate-100">
              <span className="w-2 h-8 bg-indigo-600 rounded-full" />
              Yayındaki Kursların
            </h2>
            <Link to="/teacher/analytics" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 text-sm font-bold flex items-center gap-1 group">
              Tüm Detayları Gör <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {data?.courses && data.courses.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {data.courses.map((course, i) => (
                <motion.div 
                  key={course.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 hover:border-indigo-600/30 dark:hover:border-indigo-500/30 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all overflow-hidden"
                >
                  <div className="relative z-10 flex gap-6">
                    {/* Thumbnail Section */}
                    <div className="w-32 h-32 md:w-40 md:h-40 flex-shrink-0 bg-slate-50 dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-700 group-hover:border-indigo-100 dark:group-hover:border-indigo-900 transition-all">
                      {course.thumbnailUrl ? (
                        <img src={getFileUrl(course.thumbnailUrl)} alt={course.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-200 dark:text-slate-700">
                          <BookOpen size={40} />
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full ${course.isPublished ? 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'}`}>
                          {course.isPublished ? 'Yayında' : 'Taslak'}
                        </span>
                        <div className="flex gap-2">
                           <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-lg border border-slate-100 dark:border-slate-700">
                              <LayoutDashboard size={12} className="text-indigo-600 dark:text-indigo-400" />
                              <span className="text-[10px] font-black text-slate-900 dark:text-slate-100">{course.lessonCount}</span>
                           </div>
                           <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-lg border border-slate-100 dark:border-slate-700">
                              <Users size={12} className="text-emerald-600 dark:text-emerald-400" />
                              <span className="text-[10px] font-black text-slate-900 dark:text-slate-100">{course.enrollmentCount}</span>
                           </div>
                        </div>
                      </div>
                      
                      <h3 className="text-xl font-black mb-4 text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2 uppercase tracking-tight leading-tight">{course.title}</h3>
                      
                      <div className="flex gap-2">
                        <Link 
                          to={`/teacher/course/${course.id}`} 
                          className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 transition-all py-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 group/btn"
                        >
                          <Settings size={14} className="group-hover/btn:rotate-90 transition-transform" /> YÖNET
                        </Link>
                        <Link 
                          to={`/teacher/analytics/${course.id}`} 
                          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white transition-all py-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/10"
                        >
                          <BarChart2 size={14} /> ANALİZ
                        </Link>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-16 text-center"
            >
              <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <BookOpen className="text-slate-300 dark:text-slate-700" size={32} />
              </div>
              <h3 className="text-2xl font-black mb-2 text-slate-900 dark:text-slate-100">Henüz Kursun Yok</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-sm mx-auto font-medium">İlk eğitim içeriğini oluşturarak binlerce öğrenciye ulaşmaya hemen başla.</p>
              <Link 
                to="/teacher/course-builder" 
                className="bg-indigo-600 hover:bg-indigo-700 transition-all px-10 py-4 rounded-2xl text-base font-black text-white inline-flex items-center gap-2 shadow-xl shadow-indigo-600/20"
              >
                <PlusCircle size={20} /> İlk Kursunu Oluştur
              </Link>
            </motion.div>
          )}
        </section>
      </main>
    </div>
  );
}