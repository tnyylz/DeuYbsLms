// Path: src/components/dashboard/ChallengesPanel.tsx

import { useState } from 'react';
import { Target, Zap, CheckCircle2, Clock, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ChallengeDto } from '../../types';
import { claimChallengeRewardApi } from '../../api/challenge.api';
import toast from 'react-hot-toast';

interface Props {
  challenges: ChallengeDto[];
  onRewardClaimed: (xpGain: number) => void;
}

export default function ChallengesPanel({ challenges, onRewardClaimed }: Props) {
  const [claimingId, setClaimingId] = useState<string | null>(null);

  const handleClaim = async (challengeId: string) => {
    setClaimingId(challengeId);
    try {
      const result = await claimChallengeRewardApi(challengeId);
      toast.success(`Tebrikler! ${result.xpAwarded} XP kazandın! 🏆`, {
         icon: '🎉',
         duration: 5000,
         style: {
            borderRadius: '1.5rem',
            background: '#4f46e5',
            color: '#fff',
            fontWeight: '900',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            fontSize: '0.75rem'
         }
      });
      onRewardClaimed(result.xpAwarded);
    } catch (err) {
      console.error(err);
      toast.error('Ödül alınamadı.');
    } finally {
      setClaimingId(null);
    }
  };

  if (challenges.length === 0) return null;

  return (
    <section className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-xl shadow-indigo-500/5 p-8 overflow-hidden relative group">
      {/* Decorative Blur */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-indigo-500/20 transition-colors" />
      
      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className="flex items-center gap-4">
          <div className="bg-indigo-600 p-3 rounded-2xl shadow-lg shadow-indigo-200 dark:shadow-none rotate-3">
            <Target className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white uppercase leading-none">
              GÖREVLER
            </h2>
            <p className="text-[10px] text-slate-400 font-black tracking-widest uppercase mt-1">Limitli Süreli Hedefler</p>
          </div>
        </div>
        <div className="bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-2xl border border-slate-100 dark:border-slate-700 flex items-center gap-2">
           <Clock size={16} className="text-indigo-600 dark:text-indigo-400" />
           <span className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Haftalık</span>
        </div>
      </div>

      <div className="space-y-4 relative z-10">
        <AnimatePresence>
          {challenges.map((challenge, index) => (
            <motion.div
              key={challenge.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-6 rounded-[2rem] border-2 transition-all group/card ${
                challenge.isCompleted 
                ? 'bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-800/50' 
                : 'bg-slate-50 dark:bg-slate-800/30 border-slate-100 dark:border-slate-700/50 hover:border-indigo-400 dark:hover:border-indigo-600'
              }`}
            >
              <div className="flex items-center justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {challenge.isCompleted ? (
                      <CheckCircle2 className="text-emerald-500" size={18} />
                    ) : (
                      <Zap className="text-amber-500" size={18} />
                    )}
                    <h3 className="font-black text-slate-900 dark:text-white tracking-tight leading-none">
                      {challenge.title}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-4 line-clamp-1">
                    {challenge.description}
                  </p>
                  
                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                       <span className="text-slate-400">{challenge.isCompleted ? 'TAMAMLANDI' : 'İLERLEME'}</span>
                       <span className={challenge.isCompleted ? 'text-emerald-500' : 'text-indigo-600 dark:text-indigo-400'}>
                          {challenge.currentValue} / {challenge.targetValue}
                       </span>
                    </div>
                    <div className="h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${challenge.progressPercent}%` }}
                        className={`h-full rounded-full ${challenge.isCompleted ? 'bg-emerald-500 shadow-sm shadow-emerald-200' : 'bg-indigo-600 shadow-lg shadow-indigo-200 dark:shadow-none'}`}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-3">
                  <div className={`p-4 rounded-2xl flex flex-col items-center justify-center min-w-[80px] shadow-sm ${challenge.isCompleted ? 'bg-emerald-500 text-white shadow-emerald-200' : 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white border border-slate-100 dark:border-slate-600'}`}>
                    <span className="text-xs font-black tracking-widest">+{challenge.xpReward}</span>
                    <span className="text-[10px] font-bold opacity-75 uppercase">XP</span>
                  </div>
                  
                  {challenge.isCompleted && (
                    <button
                      onClick={() => handleClaim(challenge.id)}
                      disabled={claimingId === challenge.id}
                      className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                    >
                      {claimingId === challenge.id ? '...' : 'AL'}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 text-center">
         <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest flex items-center justify-center gap-2">
            <Flame size={12} className="text-orange-500" /> Yeni görevler yakında geliyor
         </p>
      </div>
    </section>
  );
}
