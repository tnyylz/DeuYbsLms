import { useEffect, useState } from 'react';
import { adminApi, type AdminDashboardStats } from '../../api/admin';
import toast from 'react-hot-toast';
import { Users, BookOpen, UserPlus, Activity, TrendingUp, Star } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const fetchStats = async () => {
      try {
        const data = await adminApi.getDashboardStats();
        // Since we get data from latest month backward, let's reverse it so chart draws older to newer
        if (data.monthlyRegistrations) {
            data.monthlyRegistrations = [...data.monthlyRegistrations].reverse();
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
    <div className="space-y-8 animate-in fade-in duration-500 pb-8">
      {/* Top Value Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between transition-colors">
          <div>
            <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Toplam Kullanıcı</h3>
            <p className="text-4xl font-black mt-2 text-gray-900 dark:text-white">{stats?.totalUsers || 0}</p>
          </div>
          <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center">
            <Users className="w-8 h-8" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between transition-colors">
          <div>
            <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Toplam Kurs</h3>
            <p className="text-4xl font-black mt-2 text-gray-900 dark:text-white">{stats?.totalCourses || 0}</p>
          </div>
          <div className="w-16 h-16 bg-purple-50 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 rounded-2xl flex items-center justify-center">
            <BookOpen className="w-8 h-8" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between transition-colors">
          <div>
            <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Toplam Kayıt</h3>
            <p className="text-4xl font-black mt-2 text-gray-900 dark:text-white">{stats?.totalEnrollments || 0}</p>
          </div>
          <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center">
            <UserPlus className="w-8 h-8" />
          </div>
        </div>
      </div>
      
      {/* Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Aylık Yeni Kullanıcı Grafiği</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Son 6 aydaki kayıtlanma ivmesi</p>
            </div>
            <TrendingUp className="text-purple-500 w-6 h-6" />
          </div>
          
          <div className="h-80 w-full min-h-[320px]">
            {isMounted && (
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <AreaChart
                  data={stats?.monthlyRegistrations || []}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ color: '#8b5cf6', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="count" name="Yeni Kayıt" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
              </AreaChart>
            </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Top Courses */}
        <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors flex flex-col">
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

      {/* Recent Activities */}
      <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
        <div className="flex items-center space-x-3 mb-6">
            <Activity className="text-indigo-500 w-6 h-6" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Sistemdeki Aktiviteler</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stats?.recentActivities?.map((activity, idx) => (
                <div key={idx} className="flex items-start space-x-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700/50 transition-colors">
                    <div className="w-2 h-2 mt-2 rounded-full bg-indigo-500"></div>
                    <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-200">{activity.message}</p>
                        <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block">
                            {new Date(activity.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                </div>
            ))}
            {(!stats?.recentActivities || stats.recentActivities.length === 0) && (
                <p className="text-sm text-gray-500 text-center py-4 col-span-2">Kayıtlı sistem aktivitesi bulunamadı.</p>
            )}
        </div>
      </div>
    </div>
  );
}
