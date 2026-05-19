import { useEffect, useState } from 'react';
import { adminApi, type AdminDashboardStats } from '../../api/admin';
import toast from 'react-hot-toast';
import { Users, BookOpen, Activity, TrendingUp, Star, Award, GraduationCap, Trophy, Shield, Zap } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const fetchStats = async () => {
      try {
        const data = await adminApi.getDashboardStats();
        
        // Reverse arrays so older is on left and newer is on right
        if (data.monthlyRegistrations) {
            data.monthlyRegistrations = [...data.monthlyRegistrations].reverse();
        }
        if (data.monthlyEnrollments) {
            data.monthlyEnrollments = [...data.monthlyEnrollments].reverse();
        }
        if (data.monthlyCompletedLessons) {
            data.monthlyCompletedLessons = [...data.monthlyCompletedLessons].reverse();
        }
        if (data.monthlyCertificates) {
            data.monthlyCertificates = [...data.monthlyCertificates].reverse();
        }
        
        setStats(data);
      } catch (error) {
        toast.error('İstatistikler yüklenirken bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="w-12 h-12 border-t-2 border-b-2 border-purple-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-8 font-sans">
      {/* 4 Premium Value Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Toplam Öğrenci */}
        <div className="bg-white dark:bg-gray-800 p-5 sm:p-6 rounded-2xl sm:rounded-[24px] shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between transition-all hover:shadow-md">
          <div>
            <h3 className="text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase tracking-wider">Toplam Öğrenci</h3>
            <p className="text-3xl font-black mt-2 text-gray-900 dark:text-white">{stats?.totalStudents || 0}</p>
          </div>
          <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center shrink-0">
            <GraduationCap className="w-7 h-7" />
          </div>
        </div>
        
        {/* Toplam Eğitmen */}
        <div className="bg-white dark:bg-gray-800 p-5 sm:p-6 rounded-2xl sm:rounded-[24px] shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between transition-all hover:shadow-md">
          <div>
            <h3 className="text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase tracking-wider">Toplam Eğitmen</h3>
            <p className="text-3xl font-black mt-2 text-gray-900 dark:text-white">{stats?.totalTeachers || 0}</p>
          </div>
          <div className="w-14 h-14 bg-amber-50 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center shrink-0">
            <Users className="w-7 h-7" />
          </div>
        </div>

        {/* Toplam Kurs */}
        <div className="bg-white dark:bg-gray-800 p-5 sm:p-6 rounded-2xl sm:rounded-[24px] shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between transition-all hover:shadow-md">
          <div>
            <h3 className="text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase tracking-wider">Toplam Kurs</h3>
            <p className="text-3xl font-black mt-2 text-gray-900 dark:text-white">{stats?.totalCourses || 0}</p>
          </div>
          <div className="w-14 h-14 bg-purple-50 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 rounded-2xl flex items-center justify-center shrink-0">
            <BookOpen className="w-7 h-7" />
          </div>
        </div>

        {/* Tamamlanan Kurslar */}
        <div className="bg-white dark:bg-gray-800 p-5 sm:p-6 rounded-2xl sm:rounded-[24px] shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between transition-all hover:shadow-md">
          <div>
            <h3 className="text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase tracking-wider">Tamamlanan Kurs</h3>
            <p className="text-3xl font-black mt-2 text-gray-900 dark:text-white">{stats?.totalCompletedEnrollments || 0}</p>
          </div>
          <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center shrink-0">
            <Award className="w-7 h-7" />
          </div>
        </div>
      </div>
      
      {/* Visual Analytics Section (Dual Graphs) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Aylık Tamamlanan Ders Sayısı Grafiği */}
        <div className="bg-white dark:bg-gray-800 p-5 sm:p-6 lg:p-8 rounded-2xl lg:rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Aylık Tamamlanan Ders Sayısı</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Öğrencilerin bitirdiği toplam video & quiz aktivitesi</p>
            </div>
            <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          
          <div className="h-72 w-full min-h-[288px]">
            {isMounted && stats && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats?.monthlyCompletedLessons || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCompletedLessons" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      itemStyle={{ color: '#6366f1', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="count" name="Ders Tamamlama" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorCompletedLessons)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Aylık Dağıtılan Sertifika Sayısı Grafiği */}
        <div className="bg-white dark:bg-gray-800 p-5 sm:p-6 lg:p-8 rounded-2xl lg:rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Aylık Dağıtılan Sertifika Sayısı</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Kursu %100 bitirip sertifika almaya hak kazananlar</p>
            </div>
            <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
          </div>
          
          <div className="h-72 w-full min-h-[288px]">
            {isMounted && stats && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats?.monthlyCertificates || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCertificates" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="count" name="Sertifika Dağıtımı" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorCertificates)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>



      {/* Middle Section (Top Courses) */}
      <div className="grid grid-cols-1 gap-8">
        {/* Top Courses */}
        <div className="bg-white dark:bg-gray-800 p-5 sm:p-6 lg:p-8 rounded-2xl lg:rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Popüler Kurslar</h3>
            <Star className="text-yellow-500 w-6 h-6" />
          </div>
          <div className="space-y-5 flex-1">
            {stats?.topCourses?.map((course, idx) => (
              <div key={course.id} className="flex items-center space-x-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${idx === 0 ? 'bg-yellow-100 text-yellow-600' : idx === 1 ? 'bg-gray-200 text-gray-600' : idx === 2 ? 'bg-amber-100 text-amber-700' : 'bg-purple-50 text-purple-600'}`}>
                    {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{course.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{course.enrollmentCount} Öğrenci Kayıtlı</p>
                </div>
              </div>
            ))}
            {(!stats?.topCourses || stats.topCourses.length === 0) && (
                <p className="text-sm text-gray-500 text-center py-4">Henüz popüler listesine çıkacak kurs verisi bulunmuyor.</p>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Section (Leaderboard & Recent Activities) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Öğrenci Liderlik Sıralaması */}
        <div className="bg-white dark:bg-gray-800 p-5 sm:p-6 lg:p-8 rounded-2xl lg:rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
          <div className="flex items-center space-x-3 mb-6">
            <Trophy className="text-yellow-500 w-6 h-6" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Öğrenci XP Sıralaması (Top 10)</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700 text-gray-400 font-semibold text-xs uppercase">
                  <th className="py-3 px-2">Sıra</th>
                  <th className="py-3 px-2">Ad Soyad</th>
                  <th className="py-3 px-2 text-center">Seviye</th>
                  <th className="py-3 px-2 text-center">XP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                {stats?.studentLeaderboard?.map((student, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/20 transition-all">
                    <td className="py-3.5 px-2">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                        idx === 0 ? 'bg-yellow-100 text-yellow-700' :
                        idx === 1 ? 'bg-gray-100 text-gray-700' :
                        idx === 2 ? 'bg-amber-50 text-amber-700' : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {idx + 1}
                      </span>
                    </td>
                    <td className="py-3.5 px-2 font-semibold text-gray-900 dark:text-white">{student.fullName}</td>
                    <td className="py-3.5 px-2 text-center font-bold text-indigo-600 dark:text-indigo-400">Lvl {student.level}</td>
                    <td className="py-3.5 px-2 text-center font-bold text-gray-750 dark:text-gray-300">
                      <span className="inline-flex items-center gap-1">
                        <Zap size={12} className="text-amber-500 fill-amber-500" />
                        {student.totalXp.toLocaleString()}
                      </span>
                    </td>
                  </tr>
                ))}
                {(!stats?.studentLeaderboard || stats.studentLeaderboard.length === 0) && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-sm text-gray-500">Sıralama verisi bulunmuyor.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sistemdeki Aktiviteler */}
        <div className="bg-white dark:bg-gray-800 p-5 sm:p-6 lg:p-8 rounded-2xl lg:rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors flex flex-col">
          <div className="flex items-center space-x-3 mb-6">
            <Activity className="text-indigo-500 w-6 h-6" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Sistemdeki Aktiviteler</h3>
          </div>
          
          <div className="space-y-4 overflow-y-auto max-h-[420px] pr-2 flex-1">
            {stats?.recentActivities?.map((activity, idx) => (
                <div key={idx} className="flex items-start space-x-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700/50 transition-colors">
                    <div className="w-2 h-2 mt-2 rounded-full bg-indigo-500 shrink-0"></div>
                    <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-200">{activity.message}</p>
                        <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block">
                            {new Date(activity.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                </div>
            ))}
            {(!stats?.recentActivities || stats.recentActivities.length === 0) && (
                <p className="text-sm text-gray-500 text-center py-4">Kayıtlı sistem aktivitesi bulunamadı.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
