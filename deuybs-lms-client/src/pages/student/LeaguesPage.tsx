// Path: src/pages/student/LeaguesPage.tsx

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, ChevronLeft, Shield, Timer, ArrowUp, ArrowDown, Info, Flame, Star, Award, Search, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getMyLeagueLeaderboardApi } from '../../api/league.api';
import { getFileUrl } from '../../utils/fileUtils';
import type { LeagueLeaderboardDto } from '../../types';
import toast from 'react-hot-toast';

export default function LeaguesPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<LeagueLeaderboardDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getMyLeagueLeaderboardApi();
        setData(result);
      } catch (err) {
        console.error(err);
        toast.error('Lig bilgileri yüklenemedi.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!data?.endDate) return;
    
    const interval = setInterval(() => {
      const end = new Date(data.endDate).getTime();
      const now = new Date().getTime();
      const diff = end - now;
      
      if (diff <= 0) {
        setTimeLeft('Sıfırlanıyor...');
        clearInterval(interval);
        return;
      }
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      setTimeLeft(`${days}g ${hours}s ${mins}d`);
    }, 60000);
    
    return () => clearInterval(interval);
  }, [data]);

  const getTierColor = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'demir': case 'iron': return 'from-slate-400 to-slate-600';
      case 'bronz': case 'bronze': return 'from-orange-500 to-orange-800';
      case 'gümüş': case 'silver': return 'from-gray-300 to-gray-500';
      case 'altın': case 'gold': return 'from-yellow-400 to-yellow-600';
      case 'platin': case 'platinum': return 'from-teal-400 to-teal-700';
      case 'zümrüt': case 'emerald': return 'from-emerald-400 to-emerald-700';
      case 'elmas': case 'diamond': return 'from-blue-400 to-blue-700';
      case 'ustalık': case 'master': return 'from-purple-500 to-purple-800';
      case 'üstatlık': case 'grandmaster': return 'from-red-500 to-red-800';
      case 'şampiyonluk': case 'challenger': return 'from-amber-400 to-sky-500';
      default: return 'from-indigo-500 to-purple-600';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 dark:text-slate-400 font-bold animate-pulse uppercase tracking-widest text-xs">Lig Arenasına Giriliyor...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors">
      {/* Header */}
      <div className={`bg-gradient-to-br ${getTierColor(data?.tier || 'Demir')} pt-12 pb-24 px-6 relative overflow-hidden shadow-2xl`}>
        {/* Animated Background Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-black/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        
        <div className="max-w-4xl mx-auto relative z-10">
          <button 
            onClick={() => navigate(-1)} 
            className="mb-8 flex items-center gap-2 text-white/80 hover:text-white transition-colors bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20 text-sm font-bold"
          >
            <ChevronLeft size={20} /> Geri Dön
          </button>
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-6 text-center md:text-left">
              <div className="w-24 h-24 md:w-32 md:h-32 bg-white/20 backdrop-blur-xl rounded-[2.5rem] flex items-center justify-center shadow-2xl border border-white/30 rotate-3 transition-transform hover:rotate-0">
                <Shield size={64} className="text-white drop-shadow-lg" />
              </div>
              <div>
                <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase mb-2">
                  {data?.tier} LİGİ
                </h1>
                <div className="flex items-center justify-center md:justify-start gap-3">
                  <span className="bg-black/20 text-white px-4 py-1.5 rounded-full text-xs font-black tracking-widest uppercase backdrop-blur-md border border-white/10">
                    SEZON #{data?.seasonNumber}
                  </span>
                  <div className="flex items-center gap-2 text-white/90 font-bold bg-white/10 px-4 py-1.5 rounded-full backdrop-blur-md border border-white/10">
                    <Timer size={16} />
                    <span className="text-sm tracking-tight">{timeLeft || 'Yükleniyor...'} kaldı</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="hidden lg:block bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-[2rem] max-w-xs text-center">
               <Info className="mx-auto mb-3 text-white" />
               <p className="text-white/80 text-xs font-medium leading-relaxed">
                  Lig periyodu sonunda ilk 5 oyuncu bir üst lige yükselirken, son 5 oyuncu alt lige düşer. En iyi 3 oyuncu ekstra XP kazanır!
               </p>
            </div>
          </div>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="max-w-4xl mx-auto -mt-12 px-6 pb-24 relative z-20">
        <div className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl shadow-indigo-500/10 border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3 tracking-tighter uppercase">
              <Trophy className="text-yellow-500" /> ARENA SIRALAMASI
            </h2>
            <div className="flex items-center gap-2 text-xs font-black text-slate-400 tracking-widest uppercase">
              <Search size={16} /> ARAMA
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 text-[10px] uppercase font-black tracking-widest border-b border-slate-100 dark:border-slate-800">
                  <th className="px-8 py-4 text-left w-20">#</th>
                  <th className="px-8 py-4 text-left">OYUNCU</th>
                  <th className="px-8 py-4 text-right">LİG PUANI</th>
                  <th className="px-8 py-4 text-center w-32">DURUM</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                <AnimatePresence>
                  {data?.rankings.map((player, index) => (
                    <motion.tr 
                      key={player.studentId}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className={`group hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-all ${player.rank <= 3 ? 'bg-yellow-50/30 dark:bg-yellow-900/5' : ''}`}
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center justify-center">
                          {player.rank === 1 ? (
                            <div className="w-10 h-10 bg-yellow-400 rounded-2xl flex items-center justify-center shadow-lg shadow-yellow-200 dark:shadow-none text-white font-black rotate-12">1</div>
                          ) : player.rank === 2 ? (
                            <div className="w-10 h-10 bg-slate-300 rounded-2xl flex items-center justify-center shadow-lg shadow-slate-200 dark:shadow-none text-slate-700 font-black">2</div>
                          ) : player.rank === 3 ? (
                            <div className="w-10 h-10 bg-orange-300 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-100 dark:shadow-none text-orange-800 font-black -rotate-6">3</div>
                          ) : (
                            <span className="text-slate-400 dark:text-slate-500 font-bold text-lg tabular-nums">{player.rank}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-2xl overflow-hidden border-2 p-0.5 ${player.rank <= 3 ? 'border-yellow-400 shadow-md' : 'border-slate-200 dark:border-slate-700'}`}>
                            <img 
                              src={getFileUrl(player.profilePictureUrl) || `https://api.dicebear.com/7.x/avataaars/svg?seed=${player.studentId}`} 
                              alt="" 
                              className="w-full h-full object-cover rounded-xl" 
                            />
                          </div>
                          <div>
                            <p className="font-black text-slate-900 dark:text-white tracking-tight leading-none mb-1">{player.fullName}</p>
                            <div className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Çevrimiçi</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex flex-col items-end">
                          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-black text-xl tracking-tight">
                            {player.points.toLocaleString()}
                            <Flame size={20} className="fill-indigo-600 dark:fill-indigo-400 animate-pulse" />
                          </div>
                          <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Puan</p>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex justify-center">
                          {player.isPromotionZone ? (
                            <div className="flex items-center gap-1.5 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest animate-bounce">
                              <ArrowUp size={12} strokeWidth={4} /> Yükselme
                            </div>
                          ) : player.isRelegationZone ? (
                            <div className="flex items-center gap-1.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest">
                              <ArrowDown size={12} strokeWidth={4} /> Düşme
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest">
                              <Shield size={12} /> Sabit
                            </div>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
          
          <div className="bg-slate-50 dark:bg-slate-800/50 p-6 text-center">
             <button className="text-indigo-600 dark:text-indigo-400 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 mx-auto hover:gap-4 transition-all">
                Daha Fazla Göster <ChevronLeft size={16} className="rotate-180" />
             </button>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl group hover:-translate-y-2 transition-transform">
             <div className="w-14 h-14 bg-yellow-400 rounded-2xl flex items-center justify-center shadow-lg shadow-yellow-200 dark:shadow-none text-white mb-6 group-hover:rotate-12 transition-transform">
                <Star size={28} />
             </div>
             <h3 className="font-black text-lg mb-2 tracking-tight">Sıralama Ödülleri</h3>
             <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed">İlk 3'te kalarak haftanın sonunda bonus XP ve özel profil rozetleri kazanabilirsin.</p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl group hover:-translate-y-2 transition-transform">
             <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200 dark:shadow-none text-white mb-6 group-hover:-rotate-12 transition-transform">
                <Award size={28} />
             </div>
             <h3 className="font-black text-lg mb-2 tracking-tight">Strateji Kur</h3>
             <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed">Lig periyodu sona ermeden puanlarını topla, yerini garantile!</p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl group hover:-translate-y-2 transition-transform">
             <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-100 dark:shadow-none text-white mb-6 group-hover:scale-110 transition-transform">
                <HelpCircle size={28} />
             </div>
             <h3 className="font-black text-lg mb-2 tracking-tight">Yardım</h3>
             <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed">Lig sistemi hakkında merak ettiklerini rehber sayfamızdan öğrenebilirsin.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
