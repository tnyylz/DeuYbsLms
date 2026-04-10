// Path: src/pages/student/StudentDashboard.tsx

import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Trophy, LogOut, ChevronRight, Play, Medal, CheckCircle, BarChart3 } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { getGamificationApi } from '../../api/gamification.api';
import { getMyEnrollmentsApi } from '../../api/progress.api';
import type { StudentGamificationDto, EnrollmentDto } from '../../types';

export default function StudentDashboard() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const [gamification, setGamification] = useState<StudentGamificationDto | null>(null);
  const [enrollments, setEnrollments] = useState<EnrollmentDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [gData, cData] = await Promise.all([
          getGamificationApi().catch(() => null),
          getMyEnrollmentsApi().catch(() => []),
        ]);
        setGamification(gData);
        setEnrollments(cData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleLogout = () => { logout(); navigate('/'); };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Extract dummy rank if available (from our fallback api)
  const rank = gamification?.rank || 1;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-50 p-2 rounded-lg">
              <BookOpen className="text-indigo-600" size={20} />
            </div>
            <span className="font-bold tracking-tight text-slate-900 text-lg">
              DEÜ YBS <span className="text-indigo-600">LMS</span>
            </span>
          </div>
          <div className="flex items-center gap-5">
            <Link to="/courses" className="text-slate-500 hover:text-indigo-600 font-medium transition-colors text-sm">Kurslar</Link>
            <Link to="/student/certificates" className="text-slate-500 hover:text-indigo-600 font-medium transition-colors text-sm">Sertifikalarım</Link>
            <div className="w-px h-5 bg-slate-200"></div>
            <button onClick={handleLogout} className="flex items-center gap-1.5 text-slate-500 hover:text-red-500 font-medium transition-colors text-sm">
              <LogOut size={16} /> Çıkış
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">
        
        {/* SECTION 1: Hoşgeldin & Seviye Kartı */}
        <section className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -mx-20 -my-20 pointer-events-none opacity-60"></div>
          
          <div className="relative z-10">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Hoş geldin, <span className="text-indigo-600">{user?.fullName?.split(' ')[0]}</span> 👋
            </h1>
            <p className="text-slate-500 max-w-md">
              Öğrenmeye devam et, projelerini tamamla ve liderlik tablosunda yüksel!
            </p>
          </div>

          {gamification && (
            <div className="relative z-10 w-full md:w-auto min-w-[300px] bg-slate-50 rounded-2xl p-5 border border-slate-100 shadow-inner">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center border-2 border-indigo-200 shadow-sm">
                    <span className="font-bold text-indigo-700 text-lg">{gamification.currentLevel}</span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Mevcut Seviye</span>
                    <p className="font-semibold text-slate-800">Seviye {gamification.currentLevel}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Toplam XP</span>
                  <p className="font-bold text-indigo-600 text-lg">{gamification.totalXp}</p>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-xs font-medium text-slate-500 mb-2">
                  <span>Sıradaki seviyeye</span>
                  <span className="text-indigo-600">{gamification.xpToNextLevel} XP kaldı</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className="bg-indigo-600 h-2.5 rounded-full transition-all duration-1000 ease-out" 
                    style={{ width: `${gamification.xpProgressPercent}%` }} 
                  />
                </div>
              </div>
            </div>
          )}
        </section>

        <div className="grid md:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: Devam Et & İstatistikler */}
          <div className="md:col-span-8 space-y-8">
            
            {/* SECTION 2: Kaldığın Yerden Devam Et */}
            {enrollments.length > 0 && (
              <section className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-2xl p-8 text-white shadow-md relative overflow-hidden group">
                <div className="absolute right-0 top-0 h-full w-1/2 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="absolute -right-10 -bottom-10 opacity-20 transform group-hover:scale-110 transition-transform duration-700">
                  <Play size={160} className="text-white" fill="currentColor" />
                </div>
                
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-semibold tracking-wide uppercase mb-3 backdrop-blur-md">
                      Kaldığın Yerden
                    </span>
                    <h2 className="text-2xl font-bold mb-1">{enrollments[0].courseTitle}</h2>
                    <p className="text-indigo-100 text-sm max-w-sm">
                      Eğitimine kaldığın yerden devam et. 
                      ({enrollments[0].completedLessonsCount} / {enrollments[0].totalLessonsCount} tamamlandı)
                    </p>
                  </div>
                  
                  <button 
                    onClick={() => navigate(`/course/${enrollments[0].courseId}/skill-tree`)}
                    className="bg-white text-indigo-600 hover:bg-slate-50 font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-transform hover:-translate-y-1 self-start md:self-auto"
                  >
                    <Play size={18} fill="currentColor" />
                    Derse Git
                  </button>
                </div>
              </section>
            )}

            {/* SECTION 3: İstatistikler (Gamification) */}
            <section>
              <h3 className="font-bold text-slate-800 text-lg mb-4 flex items-center gap-2">
                <BarChart3 className="text-indigo-500" size={20} />
                Performans Özeti
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm text-center">
                  <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <CheckCircle size={20} />
                  </div>
                  <p className="text-2xl font-bold text-slate-900">{gamification?.completedQuizCount || 0}</p>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mt-1">Çözülen Quiz</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm text-center">
                  <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Medal size={20} />
                  </div>
                  <p className="text-2xl font-bold text-slate-900">{gamification?.badges?.length || 0}</p>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mt-1">Kazanılan Rozet</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm text-center">
                  <div className="w-10 h-10 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Trophy size={20} />
                  </div>
                  <p className="text-2xl font-bold text-slate-900">#{rank}</p>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mt-1">Liderlik Sırası</p>
                </div>
              </div>
            </section>
            
          </div>

          {/* RIGHT COLUMN: Son Rozetler vs */}
          <div className="md:col-span-4 space-y-8">
            {gamification?.badges && gamification.badges.length > 0 && (
              <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h3 className="font-bold text-slate-800 text-lg mb-4 flex items-center gap-2">
                  <Trophy className="text-amber-500" size={20} /> 
                  Son Rozetlerim
                </h3>
                <div className="space-y-4">
                  {gamification.badges.slice(0, 4).map((badge, i) => (
                    <div key={i} className="flex items-center gap-4 bg-slate-50 border border-slate-100 rounded-xl p-3 hover:border-indigo-100 hover:bg-indigo-50/30 transition-colors">
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-2xl shadow-sm border border-slate-100 shrink-0">
                        {badge.iconEmoji}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 text-sm">{badge.displayName}</p>
                        <p className="text-xs text-slate-500 line-clamp-1">{badge.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

        </div>

        {/* SECTION 4: Kayıtlı Kurslarım Grid'i */}
        <section className="pt-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-slate-800 text-xl flex items-center gap-2">
              <BookOpen className="text-indigo-600" size={22} /> Kayıtlı Kurslarım
            </h2>
            <Link to="/courses" className="text-indigo-600 hover:text-indigo-800 text-sm font-semibold flex items-center gap-1 transition-colors">
              Tümünü gör <ChevronRight size={16} />
            </Link>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrollments.length === 0 ? (
               <div className="col-span-full bg-white border border-slate-200 rounded-2xl p-10 text-center shadow-sm">
                 <BookOpen className="mx-auto text-slate-300 mb-3" size={40} />
                 <p className="text-slate-500 font-medium">Henüz kayıtlı olduğunuz bir kurs bulunmuyor.</p>
                 <Link to="/courses" className="inline-block mt-4 text-indigo-600 font-semibold hover:underline">Hemen bir kursa katılın</Link>
               </div>
            ) : (
              enrollments.slice(0, 6).map((enrollment, idx) => (
                <div 
                  key={enrollment.enrollmentId} 
                  className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:-translate-y-1 hover:shadow-lg hover:border-indigo-200 transition-all duration-300 flex flex-col h-full shadow-sm group"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  {/* Decorative Header */}
                  <div className="h-2 bg-slate-100 group-hover:bg-indigo-600 transition-colors"></div>
                  
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-start justify-between mb-4">
                      <span className="bg-indigo-50 text-indigo-700 border border-indigo-100 text-xs font-bold px-2.5 py-1 rounded-md uppercase tracking-wide">
                        Kayıtlı Kurs
                      </span>
                      <span className="flex items-center gap-1 text-xs font-bold text-amber-500 bg-amber-50 px-2 py-1 rounded-md">
                        {enrollment.progressPercentage}%
                      </span>
                    </div>
                    
                    <h3 className="font-bold text-slate-900 text-lg mb-2 leading-snug group-hover:text-indigo-600 transition-colors">
                      {enrollment.courseTitle}
                    </h3>
                    
                    <div className="flex-1 mb-6 mt-2">
                       <div className="flex justify-between text-xs font-medium text-slate-500 mb-1">
                         <span>İlerleme</span>
                         <span className="text-indigo-600">{enrollment.completedLessonsCount} / {enrollment.totalLessonsCount}</span>
                       </div>
                       <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                         <div 
                           className="bg-indigo-600 h-2 rounded-full transition-all duration-1000 ease-out" 
                           style={{ width: `${enrollment.progressPercentage}%` }} 
                         />
                       </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
                      <Link 
                        to={`/course/${enrollment.courseId}/skill-tree`} 
                        className="bg-slate-50 hover:bg-indigo-50 text-indigo-600 hover:text-indigo-700 border border-slate-200 hover:border-indigo-200 transition-colors px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-1 w-full justify-center"
                      >
                        Devam Et <ChevronRight size={14} />
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

      </div>
    </div>
  );
}