// Path: src/pages/teacher/TeacherDashboard.tsx

import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Users, BarChart2, PlusCircle, LogOut } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import axiosInstance from '../../api/axiosInstance';
import type { TeacherDashboardDto } from '../../types';

export default function TeacherDashboard() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [data, setData] = useState<TeacherDashboardDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await axiosInstance.get('/Teacher/dashboard');
        setData(res.data.data ?? res.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchDashboard();
  }, []);

  const handleLogout = () => { logout(); navigate('/'); };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <nav className="border-b border-slate-800 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="text-indigo-400" size={22} />
            <span className="font-bold tracking-tight">DEÜ YBS <span className="text-indigo-400">LMS</span></span>
            <span className="text-xs bg-indigo-950 border border-indigo-800 text-indigo-300 px-2 py-0.5 rounded-full ml-2">Eğitmen</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/teacher/analytics" className="text-slate-400 hover:text-white transition-colors text-sm flex items-center gap-1.5">
              <BarChart2 size={14} /> Analitik
            </Link>
            <button onClick={handleLogout} className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors text-sm">
              <LogOut size={15} /> Çıkış
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Hoş geldin, {user?.fullName?.split(' ')[0]} 👋</h1>
          <p className="text-slate-400 text-sm mt-1">Eğitmen paneli</p>
        </div>

        {/* İstatistik Kartları */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-center">
            <BookOpen className="text-indigo-400 mx-auto mb-2" size={22} />
            <p className="text-2xl font-bold">{data?.totalCourses ?? 0}</p>
            <p className="text-slate-400 text-xs mt-1">Kurs</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-center">
            <Users className="text-green-400 mx-auto mb-2" size={22} />
            <p className="text-2xl font-bold">{data?.totalStudents ?? 0}</p>
            <p className="text-slate-400 text-xs mt-1">Öğrenci</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-center">
            <BarChart2 className="text-yellow-400 mx-auto mb-2" size={22} />
            <p className="text-2xl font-bold">{data?.totalEnrollments ?? 0}</p>
            <p className="text-slate-400 text-xs mt-1">Kayıt</p>
          </div>
        </div>

        {/* Kurslarım */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold flex items-center gap-2"><BookOpen className="text-indigo-400" size={18} /> Kurslarım</h2>
          <Link to="/teacher/course-builder" className="bg-indigo-600 hover:bg-indigo-500 transition-colors px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5">
            <PlusCircle size={14} /> Yeni Kurs
          </Link>
        </div>

        {data?.courses && data.courses.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-4">
            {data.courses.map(course => (
              <div key={course.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-indigo-800 transition-colors">
                <h3 className="font-medium mb-2">{course.title}</h3>
                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <span className="flex items-center gap-1"><BookOpen size={12} /> {course.lessonCount} ders</span>
                  <span className="flex items-center gap-1"><Users size={12} /> {course.enrollmentCount} kayıt</span>
                </div>
                <div className="flex gap-2 mt-4">
                  <Link to={`/teacher/course-builder/${course.id}`} className="bg-slate-800 hover:bg-slate-700 transition-colors px-3 py-1.5 rounded-lg text-xs">Düzenle</Link>
                  <Link to={`/teacher/analytics/${course.id}`} className="bg-slate-800 hover:bg-slate-700 transition-colors px-3 py-1.5 rounded-lg text-xs">Analitik</Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-10 text-center text-slate-400">
            <BookOpen className="mx-auto mb-3 opacity-30" size={36} />
            <p>Henüz kurs oluşturmadın.</p>
            <Link to="/teacher/course-builder" className="text-indigo-400 hover:text-indigo-300 text-sm mt-2 inline-block">İlk kursunu oluştur →</Link>
          </div>
        )}
      </div>
    </div>
  );
}