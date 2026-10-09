import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  ChevronLeft, 
  AlertTriangle, 
  Users, 
  BarChart2, 
  Search, 
  Filter, 
  Mail, 
  ArrowUpRight,
  ArrowLeft,
  Trophy,
  TrendingUp,
  Activity,
  Calendar,
  GraduationCap,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { getCourseAnalyticsApi, getCourseAnalyticsDetailApi } from '../../api/teacher.api';
import type { StudentAnalyticsDto } from '../../types';
import type { AdminCourseAnalytics } from '../../api/admin';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeToggle from '../../components/shared/ThemeToggle';
import toast from 'react-hot-toast';
import { 
  ComposedChart,
  AreaChart, 
  Area, 
  Bar, 
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';

function TeacherCourseAnalyticsView({ courseId }: { courseId: string }) {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<AdminCourseAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const data = await getCourseAnalyticsDetailApi(courseId);
        
        // Reverse monthly arrays so they display chronologically (older left, newer right)
        if (data.monthlyEnrollmentTrends) {
          data.monthlyEnrollmentTrends = [...data.monthlyEnrollmentTrends].reverse();
        }
        if (data.monthlyCompletionTrends) {
          data.monthlyCompletionTrends = [...data.monthlyCompletionTrends].reverse();
        }
        
        setAnalytics(data);
      } catch (error) {
        toast.error('Kurs analiz verileri yüklenirken bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [courseId]);

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center flex-col space-y-4">
        <div className="w-12 h-12 border-t-2 border-b-2 border-indigo-600 rounded-full animate-spin"></div>
        <p className="text-slate-500 dark:text-slate-400 font-medium animate-pulse font-sans">Analiz verileri hazırlanıyor...</p>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 space-y-4 m-6">
        <p className="text-gray-500 dark:text-gray-400 font-medium">Analiz verileri yüklenemedi veya bu kursa erişim yetkiniz yok.</p>
        <button 
          onClick={() => navigate('/teacher/dashboard')}
          className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors"
        >
          Eğitmen Paneline Dön
        </button>
      </div>
    );
  }

  // Segmentation Data for PieChart
  const pieData = [
    { name: '%0 - %20 (Başlangıç)', value: analytics.segmentation.segment0to20, color: '#818cf8' },
    { name: '%21 - %50 (Isınanlar)', value: analytics.segmentation.segment21to50, color: '#60a5fa' },
    { name: '%51 - %80 (Orta İlerleme)', value: analytics.segmentation.segment51to80, color: '#f59e0b' },
    { name: '%81 - %99 (Bitişe Yakın)', value: analytics.segmentation.segment81to99, color: '#fb923c' },
    { name: '%100 (Tamamlayanlar)', value: analytics.segmentation.segment100, color: '#10b981' },
  ].filter(item => item.value > 0);

  // Merged Enrollment vs Completion trend data
  const trendData = analytics.monthlyEnrollmentTrends.map((item, idx) => ({
    month: item.month,
    kayitli: item.count,
    sertifika: analytics.monthlyCompletionTrends[idx]?.count || 0
  }));

  // Lessons Data for Combo Chart
  const lessonData = analytics.lessons.map(l => ({
    name: l.title.length > 15 ? l.title.substring(0, 15) + '...' : l.title,
    fullTitle: l.title,
    tamamlama: l.completionRate,
    quizBasari: l.hasQuiz ? l.quizPassRate : 0
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8 animate-in fade-in duration-500 pb-12 font-sans">
      {/* Top Breadcrumb & Header Card */}
      <div className="flex flex-col space-y-4">
        <button 
          onClick={() => navigate('/teacher/dashboard')}
          className="flex items-center space-x-2 text-slate-500 hover:text-indigo-600 font-medium transition-colors w-fit group cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" />
          <span>Eğitmen Paneline Dön</span>
        </button>

        <div className="bg-gradient-to-r from-indigo-900/90 via-purple-900/95 to-slate-900 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/20 via-transparent to-transparent pointer-events-none"></div>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider text-purple-300">
                  Kurs Analiz Paneli
                </span>
                <span className="text-white/40 text-xs">|</span>
                <span className="text-xs text-white/60 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  Oluşturulma: {new Date(analytics.createdAt).toLocaleDateString('tr-TR')}
                </span>
              </div>
              <h2 className="text-3xl font-black leading-tight tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-100 bg-clip-text text-transparent uppercase">
                {analytics.courseTitle}
              </h2>
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-indigo-200/95 font-medium">
                <span className="flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-purple-400" />
                  Eğitmen: {analytics.teacherName}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-indigo-400" />
                  Toplam Ders: {analytics.lessonCount}
                </span>
              </div>
            </div>
            
            <div className="flex flex-col items-end gap-1">
              <span className="text-xs font-black text-indigo-300 uppercase tracking-widest">Platform Durumu</span>
              <span className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-2xl text-sm font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Veriler Aktif
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Enrolled */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col justify-between transition-all hover:shadow-md">
          <div className="flex justify-between items-start">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Kayıtlılar</span>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-black text-slate-900 dark:text-white leading-none">
              {analytics.totalEnrolled}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">Toplam Öğrenci</p>
          </div>
        </div>

        {/* Total Completed */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col justify-between transition-all hover:shadow-md">
          <div className="flex justify-between items-start">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Trophy className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mezunlar</span>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-black text-slate-900 dark:text-white leading-none">
              {analytics.totalCompleted}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">Sertifika Alanlar</p>
          </div>
        </div>

        {/* Completion Rate */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col justify-between transition-all hover:shadow-md">
          <div className="flex justify-between items-start">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Başarı Oranı</span>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-black text-slate-900 dark:text-white leading-none">
              %{analytics.completionRate}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">Kursu Bitirme Oranı</p>
          </div>
        </div>

        {/* Average Progress Rate */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col justify-between transition-all hover:shadow-md">
          <div className="flex justify-between items-start">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Activity className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">İlerleme</span>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-black text-slate-900 dark:text-white leading-none">
              %{analytics.averageProgressRate}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">Ort. Kurs İlerlemesi</p>
          </div>
        </div>

        {/* Final Exam Pass Rate */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col justify-between transition-all hover:shadow-md col-span-2 lg:col-span-1">
          <div className="flex justify-between items-start">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <GraduationCap className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Final Sınavı</span>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-black text-slate-900 dark:text-white leading-none">
              %{analytics.finalExamPassRate}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">Sınav Başarı Oranı</p>
          </div>
        </div>
      </div>

      {/* Graphs Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 font-sans">
        {/* Lesson-by-Lesson Combo Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-[2rem] p-6 border border-gray-100 dark:border-gray-700 shadow-sm lg:col-span-2 flex flex-col min-h-[400px]">
          <div className="mb-4 font-sans">
            <h4 className="text-lg font-bold text-slate-900 dark:text-white">Ders Bazlı Performans Analizi</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Derslerin video izlenme oranları ve quiz başarı yüzdeleri</p>
          </div>
          <div className="w-full h-[320px]" style={{ minHeight: '320px' }}>
            {lessonData.length > 0 ? (
              <ResponsiveContainer width="100%" height={320} minWidth={0} minHeight={0}>
                <ComposedChart data={lessonData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-gray-700" />
                  <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 10, fontWeight: 500 }} />
                  <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }}
                    labelFormatter={(label, items) => {
                      return items[0]?.payload?.fullTitle || label;
                    }}
                    formatter={(value, name) => [
                      `${value}%`, 
                      name === 'tamamlama' ? 'Video İzlenme Oranı' : 'Quiz Başarı Oranı'
                    ]}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                  <Bar dataKey="tamamlama" name="tamamlama" fill="#818cf8" radius={[4, 4, 0, 0]} barSize={24} />
                  <Line type="monotone" dataKey="quizBasari" name="quizBasari" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} />
                </ComposedChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-slate-500 text-sm">
                Derse ait içerik bulunmamaktadır.
              </div>
            )}
          </div>
        </div>

        {/* Student Progress Segmentation Doughnut Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-[2rem] p-6 border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col min-h-[400px] font-sans">
          <div className="mb-4">
            <h4 className="text-lg font-bold text-slate-900 dark:text-white">İlerleme Segmentasyonu</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Öğrencilerin kurstaki yüzdesel dağılımları</p>
          </div>
          <div className="flex-1 flex flex-col justify-center relative min-h-[250px]">
            {pieData.length > 0 ? (
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                      formatter={(value, name) => [`${value} Öğrenci`, name]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center text-slate-500 text-sm">
                Veri bulunmamaktadır.
              </div>
            )}
            {/* Custom Legend */}
            <div className="space-y-1.5 mt-4 max-h-[140px] overflow-y-auto pr-2">
              {pieData.map((item, index) => (
                <div key={index} className="flex justify-between items-center text-xs">
                  <div className="flex items-center space-x-2 truncate">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }}></span>
                    <span className="text-slate-600 dark:text-slate-300 font-medium truncate">{item.name}</span>
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white pl-2">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Enrollment and Completion Trend Dual Area Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-[2rem] p-6 border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col min-h-[380px]">
        <div className="mb-4">
          <h4 className="text-lg font-bold text-slate-900 dark:text-white">Aylık Kayıt ve Tamamlama Trendi</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Son 6 aydaki yeni kayıt olanlar ile kursu bitirip sertifika alan öğrenci sayılarının karşılaştırması</p>
        </div>
        <div className="w-full h-[280px]" style={{ minHeight: '280px' }}>
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280} minWidth={0} minHeight={0}>
              <AreaChart data={trendData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorEnroll" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorComplete" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-gray-700" />
                <XAxis dataKey="month" stroke="#94a3b8" tick={{ fontSize: 10, fontWeight: 500 }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }}
                  formatter={(value, name) => [
                    `${value} Öğrenci`, 
                    name === 'kayitli' ? 'Kursa Kayıtlı Öğrenci' : 'Sertifika Alan Öğrenci'
                  ]}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                <Area type="monotone" dataKey="kayitli" name="kayitli" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorEnroll)" />
                <Area type="monotone" dataKey="sertifika" name="sertifika" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorComplete)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-slate-500 text-sm">
              Trend verisi bulunmamaktadır.
            </div>
          )}
        </div>
      </div>

      {/* Course Registered Students Table */}
      <div className="bg-white dark:bg-gray-800 rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden font-sans">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-purple-500/[0.02] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-500" />
              <span>Kursa Kayıtlı Tüm Öğrenciler</span>
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Bu kursu alan tüm öğrencilerin detaylı ilerleme durumu, toplam quiz denemesi sayısı ve kayıt tarihleri.
            </p>
          </div>
          <span className="px-3 py-1 bg-purple-500/10 border border-purple-500/30 text-purple-600 dark:text-purple-400 text-xs font-bold rounded-xl w-fit">
            Kayıtlı Öğrenci Raporu
          </span>
        </div>

        <div className="overflow-x-auto">
          {analytics.students && analytics.students.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-gray-50/50 dark:bg-gray-900/30">
                  <th className="py-4 px-6">Öğrenci Adı Soyadı</th>
                  <th className="py-4 px-6">Öğrenci Numarası</th>
                  <th className="py-4 px-6">E-posta Adresi</th>
                  <th className="py-4 px-6 text-center">Kurs İlerlemesi</th>
                  <th className="py-4 px-6 text-center">Toplam Quiz Denemesi</th>
                  <th className="py-4 px-6">Kayıt Tarihi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50 text-sm">
                {analytics.students.map((student, idx) => {
                  const daysEnrolled = Math.floor(
                    (new Date().getTime() - new Date(student.enrolledAt).getTime()) / (1000 * 3600 * 24)
                  );

                  let progressColorClass = 'bg-red-500';
                  let progressTextColorClass = 'text-red-500';
                  if (student.completionPercentage >= 100) {
                    progressColorClass = 'bg-emerald-500';
                    progressTextColorClass = 'text-emerald-500';
                  } else if (student.completionPercentage >= 50) {
                    progressColorClass = 'bg-indigo-500';
                    progressTextColorClass = 'text-indigo-500';
                  } else if (student.completionPercentage >= 20) {
                    progressColorClass = 'bg-amber-500';
                    progressTextColorClass = 'text-amber-500';
                  }

                  return (
                    <tr 
                      key={idx} 
                      className="hover:bg-gray-50/50 dark:hover:bg-gray-900/20 transition-colors font-sans"
                    >
                      <td className="py-4 px-6 font-bold text-slate-900 dark:text-white uppercase">
                        {student.fullName}
                      </td>
                      <td className="py-4 px-6 text-slate-600 dark:text-slate-300 font-mono text-xs">
                        {student.studentNumber}
                      </td>
                      <td className="py-4 px-6 text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 shrink-0" />
                        <span>{student.email}</span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <div className="w-16 bg-gray-100 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                            <div 
                              className={`${progressColorClass} h-1.5 rounded-full`} 
                              style={{ width: `${student.completionPercentage}%` }}
                            ></div>
                          </div>
                          <span className={`font-bold ${progressTextColorClass} font-mono text-xs`}>%{student.completionPercentage}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center font-bold font-mono text-slate-700 dark:text-slate-300">
                        {student.failedQuizAttempts}
                      </td>
                      <td className="py-4 px-6 text-slate-500 dark:text-slate-400">
                        <span className="font-medium text-slate-700 dark:text-slate-300 font-sans">
                          {new Date(student.enrolledAt).toLocaleDateString('tr-TR')}
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5 font-sans">{daysEnrolled} gündür kayıtlı</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-12 flex flex-col items-center justify-center space-y-3 font-sans">
              <Users className="w-12 h-12 text-slate-400" />
              <div>
                <h5 className="font-bold text-slate-900 dark:text-white">Henüz Öğrenci Bulunmamaktadır.</h5>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Bu kursa kayıtlı herhangi bir öğrenci bulunmamaktadır.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();

  const [students, setStudents] = useState<StudentAnalyticsDto[]>([]);
  const [filtered, setFiltered] = useState<StudentAnalyticsDto[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showRedFlagsOnly, setShowRedFlagsOnly] = useState(false);

  useEffect(() => {
    if (courseId) return; // handled by specialized view

    const fetchAnalytics = async () => {
      try {
        const data = await getCourseAnalyticsApi();
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
    if (courseId) return;

    let result = students;
    if (showRedFlagsOnly) result = result.filter(s => s.isRedFlag);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(s => s.fullName.toLowerCase().includes(q) || s.email.toLowerCase().includes(q));
    }
    setFiltered(result);
  }, [search, showRedFlagsOnly, students, courseId]);

  const redFlagCount = students.filter(s => s.isRedFlag).length;
  const avgCompletion = students.length > 0 
    ? Math.round(students.reduce((a, s) => a + s.completionPercentage, 0) / students.length) 
    : 0;

  if (courseId) {
    return <TeacherCourseAnalyticsView courseId={courseId} />;
  }

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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-indigo-100 font-sans">
      <nav className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl sticky top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
           <div className="flex items-center gap-4">
              <button onClick={() => navigate('/teacher/dashboard')} className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-100 dark:hover:border-indigo-900 transition-all shadow-sm cursor-pointer">
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
                 Genel Özet
              </div>
           </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
         <div className="mb-8 sm:mb-12">
            <h1 className="text-2xl sm:text-4xl font-black mb-2 tracking-tight uppercase text-slate-900 dark:text-slate-100">Öğrenci <span className="text-indigo-600 dark:text-indigo-400">Performansı</span></h1>
            <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-xs sm:text-sm">Gelişmeleri takip et ve aksiyon al.</p>
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
            className={`flex items-center gap-3 px-10 py-5 rounded-[1.5rem] text-sm font-black transition-all border-2 uppercase tracking-widest shadow-xl cursor-pointer ${showRedFlagsOnly ? 'bg-red-500 text-white border-red-500 shadow-red-500/20' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 hover:text-red-500 hover:border-red-100 dark:hover:border-red-900'}`}
           >
              <Filter size={18} /> {showRedFlagsOnly ? 'TÜMÜNÜ GÖSTER' : `RİSKLİLER (${redFlagCount})`}
           </button>
        </div>

         {/* Students Table/Grid */}
         <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] sm:rounded-[3rem] overflow-hidden shadow-sm font-sans">
            <div className="overflow-x-auto">
               <table className="w-full text-left min-w-[700px]">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-[0.25em]">
                       <th className="px-4 sm:px-10 py-5 sm:py-8">Öğrenci</th>
                       <th className="px-4 sm:px-10 py-5 sm:py-8">Kurs</th>
                       <th className="px-4 sm:px-10 py-5 sm:py-8">İlerleme</th>
                       <th className="px-4 sm:px-10 py-5 sm:py-8">Quiz Durumu</th>
                       <th className="px-4 sm:px-10 py-5 sm:py-8 text-right">Aksiyon</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                    <AnimatePresence>
                       {filtered.map((s, i) => (
                          <motion.tr 
                            key={`${s.studentId}-${i}`}
                             initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
                          >
                             <td className="px-4 sm:px-10 py-5 sm:py-8">
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
                              <td className="px-4 sm:px-10 py-5 sm:py-8">
                                <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 px-4 py-2 rounded-xl uppercase tracking-widest">
                                   {s.courseTitle}
                                </span>
                              </td>
                             <td className="px-4 sm:px-10 py-5 sm:py-8">
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
                             <td className="px-4 sm:px-10 py-5 sm:py-8">
                                 <div className="flex flex-col gap-1.5 font-sans">
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
                             <td className="px-4 sm:px-10 py-5 sm:py-8 text-right">
                                 <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                   <button title="E-posta Gönder" className="w-10 h-10 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-100 dark:hover:border-indigo-900 hover:shadow-lg transition-all flex items-center justify-center cursor-pointer">
                                      <Mail size={16} />
                                   </button>
                                   <button title="Detaylar" className="w-10 h-10 bg-indigo-600 dark:bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 dark:hover:bg-indigo-500 shadow-lg shadow-indigo-600/10 transition-all flex items-center justify-center cursor-pointer">
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
