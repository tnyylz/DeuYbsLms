// Path: src/pages/teacher/AnalyticsPage.tsx

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BookOpen, ChevronLeft, AlertTriangle, Users, BarChart2, Search } from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';
import type { StudentAnalyticsDto } from '../../types';

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
        const url = courseId ? `/Teacher/analytics/${courseId}` : '/Teacher/analytics';
        const res = await axiosInstance.get(url);
        const data = res.data.data ?? res.data;
        setStudents(data);
        setFiltered(data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
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
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <button onClick={() => navigate('/teacher/dashboard')} className="text-slate-400 hover:text-white transition-colors"><ChevronLeft size={20} /></button>
          <BookOpen className="text-indigo-400" size={20} />
          <span className="font-bold tracking-tight">Öğrenci Analitik</span>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Özet Kartları */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
            <Users className="text-indigo-400 mx-auto mb-2" size={20} />
            <p className="text-xl font-bold">{students.length}</p>
            <p className="text-slate-400 text-xs mt-1">Toplam Öğrenci</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
            <BarChart2 className="text-green-400 mx-auto mb-2" size={20} />
            <p className="text-xl font-bold">
              {students.length > 0 ? Math.round(students.reduce((a, s) => a + s.completionPercentage, 0) / students.length) : 0}%
            </p>
            <p className="text-slate-400 text-xs mt-1">Ort. Tamamlanma</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
            <AlertTriangle className="text-red-400 mx-auto mb-2" size={20} />
            <p className="text-xl font-bold">{redFlagCount}</p>
            <p className="text-slate-400 text-xs mt-1">Risk Altında</p>
          </div>
        </div>

        {/* Filtreler */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input type="text" placeholder="Öğrenci ara..." value={search} onChange={e => setSearch(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors" />
          </div>
          <button onClick={() => setShowRedFlagsOnly(!showRedFlagsOnly)} className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-medium border transition-colors ${showRedFlagsOnly ? 'bg-red-950 border-red-800 text-red-300' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'}`}>
            <AlertTriangle size={14} /> {showRedFlagsOnly ? 'Tümünü Göster' : `Risk (${redFlagCount})`}
          </button>
        </div>

        {/* Tablo */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider">
                <th className="text-left px-5 py-3">Öğrenci</th>
                <th className="text-left px-5 py-3">Kurs</th>
                <th className="text-center px-5 py-3">İlerleme</th>
                <th className="text-center px-5 py-3">Başarısız Quiz</th>
                <th className="text-center px-5 py-3">Durum</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => (
                <tr key={i} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                  <td className="px-5 py-3">
                    <p className="font-medium text-white">{s.fullName}</p>
                    <p className="text-xs text-slate-400">{s.email}</p>
                  </td>
                  <td className="px-5 py-3 text-slate-300">{s.courseTitle}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-16 bg-slate-800 rounded-full h-1.5">
                        <div className={`h-1.5 rounded-full ${s.completionPercentage >= 80 ? 'bg-green-500' : s.completionPercentage >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${s.completionPercentage}%` }} />
                      </div>
                      <span className="text-xs text-slate-400">{s.completionPercentage}%</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-center">
                    <span className={`text-xs font-medium ${s.failedQuizAttempts >= 3 ? 'text-red-400' : 'text-slate-400'}`}>{s.failedQuizAttempts}</span>
                  </td>
                  <td className="px-5 py-3 text-center">
                    {s.isRedFlag ? (
                      <span className="inline-flex items-center gap-1 text-xs bg-red-950 border border-red-800 text-red-300 px-2.5 py-1 rounded-full">
                        <AlertTriangle size={10} /> Risk
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs bg-green-950 border border-green-800 text-green-300 px-2.5 py-1 rounded-full">
                        Normal
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="text-center py-10 text-slate-400 text-sm">Öğrenci bulunamadı.</div>
          )}
        </div>
      </div>
    </div>
  );
}