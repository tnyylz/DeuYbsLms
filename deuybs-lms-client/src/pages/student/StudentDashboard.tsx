// Path: src/pages/student/StudentDashboard.tsx

import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Trophy, LogOut, ChevronRight, Play, CheckCircle, BarChart3, User, Flame, TrendingUp, Star, Award, LayoutGrid, Stars, ShoppingBag, Package, Layout } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import ThemeToggle from '../../components/shared/ThemeToggle';
import NotificationCenter from '../../components/shared/NotificationCenter';
import { getGamificationApi, getLeaderboardApi } from '../../api/gamification.api';
import { getMyEnrollmentsApi } from '../../api/progress.api';
import { getCoursesApi } from '../../api/courses.api';
import { getProfileApi } from '../../api/profile.api';
import { generateCertificateApi } from '../../api/certificate.api';
import { getFileUrl } from '../../utils/fileUtils';
import toast from 'react-hot-toast';
import type { StudentGamificationDto, EnrollmentDto, LeaderboardDto, StudentProfileDto } from '../../types';
import SkillGalaxy from '../../components/dashboard/SkillGalaxy';
import ChallengesPanel from '../../components/dashboard/ChallengesPanel';
import EvolvingBadge from '../../components/dashboard/EvolvingBadge';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Map as MapIcon, Shield } from 'lucide-react';

export default function StudentDashboard() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const [gamification, setGamification] = useState<StudentGamificationDto | null>(null);
  const [profile, setProfile] = useState<StudentProfileDto | null>(null);
  const [enrollments, setEnrollments] = useState<EnrollmentDto[]>([]);
  const [allCourses, setAllCourses] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardDto[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'galaxy'>('grid');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const getLeagueColor = (tier?: string | null) => {
    const safeTier = tier || 'DEMİR';
    switch (safeTier.toLowerCase()) {
      case 'demir': case 'iron': return 'from-slate-400 to-slate-600';
      case 'bronz': case 'bronze': return 'from-orange-500 to-orange-800';
      case 'gümüş': case 'silver': return 'from-gray-300 to-gray-500';
      case 'altın': case 'gold': return 'from-yellow-400 to-yellow-600';
      case 'platin': case 'platinum': return 'from-teal-400 to-teal-700';
      case 'zümrüt': case 'emerald': return 'from-emerald-400 to-emerald-700';
      case 'elmas': case 'diamond': return 'from-blue-400 to-blue-700';
      case 'ustalık': case 'master': return 'from-purple-500 to-purple-800';
      case 'üstatlık': case 'grandmaster': return 'from-red-500 to-red-800';
      case 'şampiyonluk': case 'challenger': return 'from-amber-400 to-sky-500 shadow-sky-500/20';
      default: return 'from-indigo-600 to-purple-600';
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [gData, cData, lData, pData, allData] = await Promise.all([
          getGamificationApi().catch(() => null),
          getMyEnrollmentsApi().catch(() => []),
          getLeaderboardApi(5).catch(() => []),
          getProfileApi().catch(() => null),
          getCoursesApi().catch(() => []),
        ]);
        setGamification(gData);
        setEnrollments(cData);
        setLeaderboard(lData);
        setProfile(pData);
        setAllCourses(allData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleLogout = () => { logout(); navigate('/'); };

  const handleClaimCertificate = async (enrollmentId: string) => {
    const loadingToast = toast.loading('Sertifikanız hazırlanıyor...');
    try {
      await generateCertificateApi(enrollmentId);
      toast.success('Sertifikanız başarıyla oluşturuldu! ✅', { id: loadingToast });
      navigate('/student/certificates');
    } catch (err: any) {
      toast.dismiss(loadingToast);
      const errorMsg = err.response?.data?.message || err.response?.data || 'Başarısız.';
      if (errorMsg.toString().toLowerCase().includes('zaten var')) {
        toast.success('Bu kursa ait sertifikanız halihazırda mevcut.', { id: loadingToast });
        navigate('/student/certificates');
      } else {
        toast.error(`Hata: ${errorMsg}`);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const rank = profile?.rank || gamification?.rank || 1;

  const NavLink = ({ to, icon: Icon, children, badge }: any) => (
    <Link 
      to={to} 
      className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 font-bold transition-all text-sm group relative py-2"
      onClick={() => setIsMobileMenuOpen(false)}
    >
      <div className="p-2 rounded-xl group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/40 transition-colors">
        <Icon size={18} className="group-hover:scale-110 transition-transform" />
      </div>
      <span className="hidden lg:block">{children}</span>
      {badge && (
        <span className="absolute -top-1 -right-1 bg-amber-400 text-amber-950 text-[8px] px-1.5 py-0.5 rounded-full font-black shadow-sm">
          {badge}
        </span>
      )}
    </Link>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-sans transition-colors duration-300">
      {/* Top Navigation */}
      <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-3 sticky top-0 z-50 shadow-sm transition-colors">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="md:hidden">
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
            
            <Link to="/student/dashboard" className="flex items-center gap-2 group">
              <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-600/20 group-hover:rotate-12 transition-transform">
                <BookOpen className="text-white" size={20} />
              </div>
              <span className="font-black tracking-tighter text-slate-900 dark:text-white text-xl hidden sm:block">
                DEÜ YBS <span className="text-indigo-600">LMS</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1 lg:gap-4">
            <NavLink to="/courses" icon={BookOpen}>Kurslar</NavLink>
            <NavLink to="/student/learning-paths" icon={MapIcon}>Yol Haritaları</NavLink>
            <NavLink to="/student/kanban" icon={Layout} badge="YENİ">Pano</NavLink>
            <NavLink to="/student/leagues" icon={Shield}>Ligler</NavLink>
            <NavLink to="/student/certificates" icon={Award}>Sertifikalar</NavLink>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-1 sm:gap-3 bg-slate-50 dark:bg-slate-800/50 p-1.5 rounded-2xl border border-slate-100 dark:border-slate-700">
              <NotificationCenter />
              <ThemeToggle />
              <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block"></div>
              <Link to="/student/profile" className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-xl transition-all group">
                <User size={18} className="text-slate-500 group-hover:text-indigo-600" />
              </Link>
            </div>

            <button 
              onClick={handleLogout} 
              className="hidden sm:flex items-center justify-center w-10 h-10 bg-rose-50 hover:bg-rose-100 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-xl transition-all hover:scale-105"
              title="Çıkış Yap"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -20, height: 0 }}
              className="md:hidden overflow-hidden bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800"
            >
              <div className="flex flex-col gap-1 p-4">
                <Link to="/courses" className="flex items-center gap-3 p-3 text-slate-600 dark:text-slate-300 font-bold hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-xl transition-all" onClick={() => setIsMobileMenuOpen(false)}>
                  <BookOpen size={20} /> Kurslar
                </Link>
                <Link to="/student/learning-paths" className="flex items-center gap-3 p-3 text-slate-600 dark:text-slate-300 font-bold hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-xl transition-all" onClick={() => setIsMobileMenuOpen(false)}>
                  <MapIcon size={20} /> Yol Haritaları
                </Link>
                <Link to="/student/kanban" className="flex items-center gap-3 p-3 text-indigo-600 dark:text-indigo-400 font-bold hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-xl transition-all" onClick={() => setIsMobileMenuOpen(false)}>
                  <Layout size={20} /> Pano <span className="bg-amber-400 text-amber-950 text-[10px] px-2 py-0.5 rounded-full">YENİ</span>
                </Link>
                <Link to="/student/leagues" className="flex items-center gap-3 p-3 text-slate-600 dark:text-slate-300 font-bold hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-xl transition-all" onClick={() => setIsMobileMenuOpen(false)}>
                  <Shield size={20} /> Ligler
                </Link>
                <Link to="/student/certificates" className="flex items-center gap-3 p-3 text-slate-600 dark:text-slate-300 font-bold hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-xl transition-all" onClick={() => setIsMobileMenuOpen(false)}>
                  <Award size={20} /> Sertifikalarım
                </Link>
                <div className="h-px bg-slate-100 dark:bg-slate-800 my-2" />
                <button onClick={handleLogout} className="flex items-center gap-3 p-3 text-rose-600 font-bold hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-xl transition-all">
                  <LogOut size={20} /> Oturumu Kapat
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">
        
        {/* SECTION 1: Hoşgeldin & Seviye Kartı */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 dark:bg-indigo-900/10 rounded-full blur-3xl -mx-20 -my-20 pointer-events-none opacity-60"></div>
          
          <div className="relative z-10">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Hoş geldin, <span className="text-indigo-600 dark:text-indigo-400">{user?.fullName?.split(' ')[0]}</span> 
              {gamification?.currentTitle && (
                <span className="ml-3 px-3 py-1 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 text-xs font-black rounded-lg border border-amber-200 dark:border-amber-800 uppercase tracking-widest animate-pulse">
                  {gamification.currentTitle}
                </span>
              )} 👋
            </h1>
            <p className="text-slate-500 dark:text-slate-400 max-w-md">
              Öğrenmeye devam et, projelerini tamamla ve liderlik tablosunda yüksel!
            </p>
          </div>

          {gamification && (
            <div className="relative z-10 w-full md:w-auto min-w-[300px] bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 shadow-inner">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center border-2 shadow-sm transition-all"
                    style={{ 
                      backgroundColor: gamification.profileFrameColor ? `${gamification.profileFrameColor}20` : undefined,
                      borderColor: gamification.profileFrameColor || '#e2e8f0',
                      boxShadow: gamification.profileFrameColor ? `0 0 15px ${gamification.profileFrameColor}40` : undefined
                    }}
                  >
                    <span className="font-bold text-lg" style={{ color: gamification.profileFrameColor || 'inherit' }}>
                      {gamification.currentLevel}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Mevcut Seviye</span>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">Seviye {gamification.currentLevel}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Toplam XP</span>
                  <p className="font-bold text-indigo-600 dark:text-indigo-400 text-lg">{gamification.totalXp}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-4">
                  <Link to="/student/shop" className="flex-1 bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 px-4 py-2 rounded-xl font-black text-xs text-center flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm">
                    <ShoppingBag size={14} /> MAĞAZA'YA GİT
                  </Link>
                  <div className="flex items-center gap-1.5 px-3 py-2 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl border border-amber-100 dark:border-amber-800/50">
                    <Package size={14} /> <span className="text-[10px] font-black uppercase">Envanter</span>
                  </div>
              </div>
              
              <div>
                <div className="flex justify-between text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                  <span>Sıradaki seviyeye</span>
                  <span className="text-indigo-600 dark:text-indigo-400">{gamification.xpToNextLevel} XP kaldı</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className="bg-indigo-600 dark:bg-indigo-500 h-2.5 rounded-full transition-all duration-1000 ease-out" 
                    style={{ width: `${gamification.xpProgressPercent}%` }} 
                  />
                </div>
              </div>
            </div>
          )}
        </section>

        <div className="grid md:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN */}
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
                    <p className="text-indigo-100 dark:text-indigo-200/80 text-sm max-w-sm">
                      Eğitimine kaldığın yerden devam et. 
                      ({enrollments[0].completedLessonsCount} / {enrollments[0].totalLessonsCount} tamamlandı)
                    </p>
                  </div>
                  
                  <button 
                    onClick={() => navigate(`/course/${enrollments[0].courseId}/detail`)}
                    className="bg-white text-indigo-600 hover:bg-slate-50 font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-transform hover:-translate-y-1 self-start md:self-auto"
                  >
                    <Play size={18} fill="currentColor" />
                    Derse Git
                  </button>
                </div>
              </section>
            )}

            {/* SECTION 2: Challenges */}
            <ChallengesPanel 
              challenges={gamification?.activeChallenges || []} 
              onRewardClaimed={async () => {
                const gData = await getGamificationApi();
                setGamification(gData);
              }}
            />

            {/* SECTION 3: İstatistikler */}
            <section>
              <h3 className="font-bold text-slate-800 dark:text-white text-lg mb-4 flex items-center gap-2">
                 <BarChart3 className="text-indigo-500" size={20} />
                 Performans Özeti
               </h3>
               <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm text-center group hover:border-indigo-200 dark:hover:border-indigo-500 transition-all">
                  <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                    <CheckCircle size={20} />
                  </div>
                  <p className="text-2xl font-black text-slate-900 dark:text-white">{profile?.coursesCompletedCount || 0}</p>
                  <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">Tamamlanan Kurs</p>
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm text-center group hover:border-indigo-200 dark:hover:border-indigo-500 transition-all">
                  <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                    <Star size={20} />
                  </div>
                  <p className="text-2xl font-black text-slate-900 dark:text-white">%{profile?.averageQuizScore || 0}</p>
                  <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">Ortalama Puan</p>
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm text-center group hover:border-indigo-200 dark:hover:border-indigo-500 transition-all">
                  <div className="w-10 h-10 bg-amber-50 dark:bg-amber-900/30 text-amber-500 dark:text-amber-400 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                    <Trophy size={20} />
                  </div>
                  <p className="text-2xl font-black text-slate-900 dark:text-white">#{rank}</p>
                  <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">Liderlik Sırası</p>
                </div>
                <div className="bg-white dark:bg-slate-900 border border-orange-100 dark:border-orange-500/20 rounded-2xl p-5 shadow-sm text-center group hover:border-orange-200 dark:hover:border-orange-500 transition-all relative overflow-hidden">
                   <div className="absolute -right-2 -top-2 opacity-5 text-orange-600 group-hover:rotate-12 transition-transform">
                     <Flame size={60} />
                   </div>
                  <div className="w-10 h-10 bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-125 transition-transform">
                    <Flame size={20} fill="currentColor" />
                  </div>
                  <p className="text-2xl font-black text-slate-900 dark:text-white">{gamification?.currentStreak || 0} Gün</p>
                  <p className="text-[10px] font-black text-orange-600 dark:text-orange-400 uppercase tracking-widest mt-1 flex items-center justify-center gap-1">
                    <TrendingUp size={10} /> x{gamification?.xpMultiplier?.toFixed(1) || '1.0'} Bonus
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN */}
          <div className="md:col-span-4 space-y-6">
            {/* League Status Card */}
            <div className={`bg-gradient-to-br ${getLeagueColor(gamification?.currentLeagueTier)} p-8 rounded-[3rem] text-white shadow-xl relative overflow-hidden group`}>
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
               <div className="relative z-10 text-center">
                  <div className="flex flex-col items-center mb-6">
                    <Shield size={48} className="text-white drop-shadow-xl mb-3" />
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-1">Aktif Lig Seviyen</p>
                    <p className="text-3xl font-black tracking-tighter uppercase">{gamification?.currentLeagueTier || 'DEMİR'}</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 mb-6 flex justify-between items-center text-xs font-black uppercase tracking-widest">
                     <span>GRUP SIRALAMAN:</span>
                     <span className="text-lg">#{gamification?.leagueRank || '-'}</span>
                  </div>
                  <Link to="/student/leagues" className="w-full bg-white text-indigo-600 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:gap-4 transition-all shadow-lg">
                     LİG ARENASINA GİT <ChevronRight size={16} />
                  </Link>
               </div>
            </div>

            {/* Leaderboard Widget */}
            <section className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-indigo-900/20 relative overflow-hidden transition-all">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 dark:bg-indigo-600/10 rounded-full blur-[60px] opacity-100 dark:opacity-30 -mr-16 -mt-16"></div>
              <h3 className="font-bold text-lg mb-6 flex items-center justify-between relative z-10">
                <div className="flex items-center gap-2">
                  <Trophy className="text-amber-500" size={20} /> Sıralama
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 opacity-60">Top 5</span>
              </h3>
              <div className="space-y-3 relative z-10">
                {leaderboard === null ? (
                   <div className="py-10 text-center text-slate-400 dark:text-slate-500 text-sm animate-pulse">Sıralama verisi yükleniyor...</div>
                ) : leaderboard.length === 0 ? (
                   <div className="py-10 text-center text-slate-400 text-sm">Henüz veri yok.</div>
                ) : (
                  leaderboard.map((item) => (
                    <div key={item.studentId} className={`flex items-center justify-between p-3 rounded-2xl transition-all ${item.studentId === user?.userId ? 'bg-indigo-50 dark:bg-indigo-600/40 border border-indigo-200 dark:border-indigo-400/30' : 'bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 hover:border-indigo-100 dark:hover:bg-white/10'}`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black ${item.rank === 1 ? 'bg-amber-400 text-amber-900' : 'bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-white/60'}`}>{item.rank}</div>
                        <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-200 dark:border-white/10 shrink-0">
                          {item.profilePictureUrl ? <img src={getFileUrl(item.profilePictureUrl)} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-slate-100 dark:bg-white/10 flex items-center justify-center"><User size={14} className="opacity-40" /></div>}
                        </div>
                        <div>
                          <p className={`text-sm font-bold truncate max-w-[100px] ${item.studentId === user?.userId ? 'text-indigo-700 dark:text-white' : 'text-slate-700 dark:text-white/80'}`}>{item.fullName}</p>
                          <p className="text-[10px] text-slate-400 dark:opacity-40 font-bold uppercase tracking-tighter">Seviye {item.level}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-indigo-600 dark:text-indigo-400">{item.totalXp}</p>
                        <p className="text-[9px] text-slate-400 dark:opacity-30 font-bold uppercase tracking-widest">XP</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>

            {/* Badges Widget */}
            {gamification?.badges && gamification.badges.length > 0 && (
              <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-6 shadow-sm">
                <h3 className="font-bold text-slate-800 dark:text-white text-lg mb-4 flex items-center gap-2">
                  <Star className="text-amber-500" size={20} /> Rozetler
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                  {gamification.badges.slice(0, 4).map((badge, i) => (
                    <EvolvingBadge key={i} badge={badge} />
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>

        {/* SECTION 4: Kayıtlı Kurslarım Grid'i */}
        <section className="pt-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-slate-800 dark:text-white text-xl flex items-center gap-2">
              <BookOpen className="text-indigo-600 dark:text-indigo-400" size={22} /> Kayıtlı Kurslarım
            </h2>
            <div className="flex items-center gap-3">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 rounded-xl flex items-center shadow-sm">
                    <button 
                        onClick={() => setViewMode('grid')}
                        className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-black transition-all ${viewMode === 'grid' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
                    >
                        <LayoutGrid size={14} /> LİSTE
                    </button>
                    <button 
                        onClick={() => setViewMode('galaxy')}
                        className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-black transition-all ${viewMode === 'galaxy' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
                    >
                        <Stars size={14} /> GALAXY
                    </button>
                    <Link 
                        to="/student/kanban"
                        className="px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-black transition-all text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                    >
                        <Layout size={14} /> KANBAN
                    </Link>
                </div>
                <Link to="/courses" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 text-sm font-semibold flex items-center gap-1 transition-colors">
                  Tümünü gör <ChevronRight size={16} />
                </Link>
            </div>
          </div>
          
          <div className="animate-in fade-in duration-700">
            {viewMode === 'galaxy' ? (
              <SkillGalaxy enrollments={enrollments} allCourses={allCourses} />
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {enrollments.length === 0 ? (
                  <div className="col-span-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-10 text-center shadow-sm">
                    <BookOpen className="mx-auto text-slate-300 mb-3" size={40} />
                    <p className="text-slate-500 font-medium">Henüz kayıtlı olduğunuz bir kurs bulunmuyor.</p>
                    <Link to="/courses" className="inline-block mt-4 text-indigo-600 font-semibold hover:underline">Hemen bir kursa katılın</Link>
                  </div>
                ) : (
                  enrollments.slice(0, 6).map((enrollment, idx) => (
                    <div 
                      key={enrollment.enrollmentId} 
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden hover:-translate-y-1 hover:shadow-lg hover:border-indigo-200 dark:hover:border-indigo-500 transition-all duration-300 flex flex-col h-full shadow-sm group"
                      style={{ animationDelay: `${idx * 100}ms` }}
                    >
                      <div className="h-32 overflow-hidden bg-slate-100 dark:bg-slate-800">
                        {enrollment.thumbnailUrl ? <img src={getFileUrl(enrollment.thumbnailUrl)} alt={enrollment.courseTitle} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" /> : <div className="w-full h-full flex items-center justify-center text-slate-300"><BookOpen size={30} /></div>}
                      </div>
                      <div className="p-6 flex-1 flex flex-col">
                        <div className="flex items-start justify-between mb-4">
                          <span className="bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800 text-xs font-bold px-2.5 py-1 rounded-md uppercase tracking-wide">Kayıtlı Kurs</span>
                          <span className="flex items-center gap-1 text-xs font-bold text-amber-500 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-2 py-1 rounded-md">{enrollment.progressPercentage}%</span>
                        </div>
                        <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-2 leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{enrollment.courseTitle}</h3>
                        <div className="flex-1 mb-6 mt-2">
                          <div className="flex justify-between text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                            <span>İlerleme</span>
                            <span className="text-indigo-600 dark:text-indigo-400">{enrollment.completedLessonsCount} / {enrollment.totalLessonsCount}</span>
                          </div>
                          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                            <div className="bg-indigo-600 dark:bg-indigo-500 h-2 rounded-full transition-all duration-1000 ease-out" style={{ width: `${enrollment.progressPercentage}%` }} />
                          </div>
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800 mt-auto">
                          {enrollment.progressPercentage >= 100 || enrollment.isCourseCompleted ? (
                            <button onClick={() => handleClaimCertificate(enrollment.enrollmentId)} className="bg-emerald-50 dark:bg-emerald-900/30 hover:bg-emerald-100 dark:hover:bg-emerald-800 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50 transition-colors px-4 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 w-full hover:-translate-y-0.5 shadow-sm"><Award size={16} /> Sertifika Al</button>
                          ) : (
                            <Link to={`/course/${enrollment.courseId}/detail`} className="bg-slate-50 dark:bg-slate-800/50 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 border border-slate-200 dark:border-slate-700 transition-colors px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-1 w-full justify-center">Devam Et <ChevronRight size={14} /></Link>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}