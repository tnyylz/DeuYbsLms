import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminApi, type AdminCourseAnalytics } from '../../api/admin';
import toast from 'react-hot-toast';
import { 
  ArrowLeft, 
  Users, 
  Trophy, 
  TrendingUp, 
  Activity, 
  Shield, 
  AlertTriangle, 
  Calendar, 
  Mail, 
  BookOpen, 
  GraduationCap, 
  Zap,
  CheckCircle2
} from 'lucide-react';
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

export default function AdminCourseAnalyticsPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<AdminCourseAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!courseId) return;
      try {
        setLoading(true);
        const data = await adminApi.getCourseAnalytics(courseId);
        
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
        <div className="w-12 h-12 border-t-2 border-b-2 border-purple-600 rounded-full animate-spin"></div>
        <p className="text-gray-500 dark:text-gray-400 font-medium animate-pulse">Analiz verileri hazırlanıyor...</p>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 space-y-4">
        <p className="text-gray-500 dark:text-gray-400 font-medium">Analiz verileri yüklenemedi.</p>
        <button 
          onClick={() => navigate('/admin/courses')}
          className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-colors"
        >
          Kurs Listesine Dön
        </button>
      </div>
    );
  }

  // Segmentation Data for PieChart
  const pieData = [
    { name: '%0 - %20 (Başlangıç)', value: analytics.segmentation.segment0to20, color: '#818cf8' }, // Light Indigo
    { name: '%21 - %50 (Isınanlar)', value: analytics.segmentation.segment21to50, color: '#60a5fa' }, // Light Blue
    { name: '%51 - %80 (Orta İlerleme)', value: analytics.segmentation.segment51to80, color: '#f59e0b' }, // Amber
    { name: '%81 - %99 (Bitişe Yakın)', value: analytics.segmentation.segment81to99, color: '#fb923c' }, // Orange
    { name: '%100 (Tamamlayanlar)', value: analytics.segmentation.segment100, color: '#10b981' }, // Emerald
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
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Top Breadcrumb & Header Card */}
      <div className="flex flex-col space-y-4">
        <button 
          onClick={() => navigate('/admin/courses')}
          className="flex items-center space-x-2 text-gray-500 hover:text-purple-600 font-medium transition-colors w-fit group"
        >
          <ArrowLeft className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" />
          <span>Kurs Yönetimine Dön</span>
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
              <h2 className="text-3xl font-black leading-tight tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-100 bg-clip-text text-transparent">
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
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Kayıtlılar</span>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-black text-gray-900 dark:text-white leading-none">
              {analytics.totalEnrolled}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 font-medium">Toplam Öğrenci</p>
          </div>
        </div>

        {/* Total Completed */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col justify-between transition-all hover:shadow-md">
          <div className="flex justify-between items-start">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Trophy className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Mezunlar</span>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-black text-gray-900 dark:text-white leading-none">
              {analytics.totalCompleted}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 font-medium">Sertifika Alanlar</p>
          </div>
        </div>

        {/* Completion Rate */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col justify-between transition-all hover:shadow-md">
          <div className="flex justify-between items-start">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Başarı Oranı</span>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-black text-gray-900 dark:text-white leading-none">
              %{analytics.completionRate}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 font-medium">Kursu Bitirme Oranı</p>
          </div>
        </div>

        {/* Average Progress Rate */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col justify-between transition-all hover:shadow-md">
          <div className="flex justify-between items-start">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Activity className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">İlerleme</span>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-black text-gray-900 dark:text-white leading-none">
              %{analytics.averageProgressRate}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 font-medium">Ort. Kurs İlerlemesi</p>
          </div>
        </div>

        {/* Final Exam Pass Rate */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col justify-between transition-all hover:shadow-md col-span-2 lg:col-span-1">
          <div className="flex justify-between items-start">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <GraduationCap className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Final Sınavı</span>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-black text-gray-900 dark:text-white leading-none">
              %{analytics.finalExamPassRate}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 font-medium">Sınav Başarı Oranı</p>
          </div>
        </div>
      </div>

      {/* Graphs Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Lesson-by-Lesson Combo Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-[2rem] p-6 border border-gray-100 dark:border-gray-700 shadow-sm lg:col-span-2 flex flex-col min-h-[400px]">
          <div className="mb-4">
            <h4 className="text-lg font-bold text-gray-900 dark:text-white">Ders Bazlı Performans Analizi</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Derslerin video izlenme oranları ve quiz başarı yüzdeleri</p>
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
              <div className="flex h-full items-center justify-center text-gray-500 text-sm">
                Derse ait içerik bulunmamaktadır.
              </div>
            )}
          </div>
        </div>

        {/* Student Progress Segmentation Doughnut Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-[2rem] p-6 border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col min-h-[400px]">
          <div className="mb-4">
            <h4 className="text-lg font-bold text-gray-900 dark:text-white">İlerleme Segmentasyonu</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Öğrencilerin kurstaki yüzdesel dağılımları</p>
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
              <div className="flex h-full items-center justify-center text-gray-500 text-sm">
                Veri bulunmamaktadır.
              </div>
            )}
            {/* Custom Legend */}
            <div className="space-y-1.5 mt-4 max-h-[140px] overflow-y-auto pr-2">
              {pieData.map((item, index) => (
                <div key={index} className="flex justify-between items-center text-xs">
                  <div className="flex items-center space-x-2 truncate">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }}></span>
                    <span className="text-gray-600 dark:text-gray-300 font-medium truncate">{item.name}</span>
                  </div>
                  <span className="font-bold text-gray-900 dark:text-white pl-2">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Enrollment and Completion Trend Dual Area Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-[2rem] p-6 border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col min-h-[380px]">
        <div className="mb-4">
          <h4 className="text-lg font-bold text-gray-900 dark:text-white">Aylık Kayıt ve Tamamlama Trendi</h4>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Son 6 aydaki yeni kayıt olanlar ile kursu bitirip sertifika alan öğrenci sayılarının karşılaştırması</p>
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
            <div className="flex h-full items-center justify-center text-gray-500 text-sm">
              Trend verisi bulunmamaktadır.
            </div>
          )}
        </div>
      </div>

      {/* Course Registered Students Table */}
      <div className="bg-white dark:bg-gray-800 rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-purple-500/[0.02] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-500" />
              <span>Kursa Kayıtlı Tüm Öğrenciler</span>
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">
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
                <tr className="border-b border-gray-100 dark:border-gray-700 text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50/50 dark:bg-gray-900/30">
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

                  // Premium dynamic progress bar colors
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
                      className="hover:bg-gray-50/50 dark:hover:bg-gray-900/20 transition-colors"
                    >
                      <td className="py-4 px-6 font-bold text-gray-900 dark:text-white">
                        {student.fullName}
                      </td>
                      <td className="py-4 px-6 text-gray-600 dark:text-gray-300 font-mono text-xs">
                        {student.studentNumber}
                      </td>
                      <td className="py-4 px-6 text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
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
                      <td className="py-4 px-6 text-center font-bold font-mono text-gray-700 dark:text-gray-300">
                        {student.failedQuizAttempts}
                      </td>
                      <td className="py-4 px-6 text-gray-500 dark:text-gray-400">
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          {new Date(student.enrolledAt).toLocaleDateString('tr-TR')}
                        </span>
                        <span className="text-[10px] text-gray-400 block mt-0.5">{daysEnrolled} gündür kayıtlı</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-12 flex flex-col items-center justify-center space-y-3">
              <Users className="w-12 h-12 text-gray-400" />
              <div>
                <h5 className="font-bold text-gray-900 dark:text-white">Henüz Öğrenci Bulunmamaktadır.</h5>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Bu kursa kayıtlı herhangi bir öğrenci bulunmamaktadır.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
