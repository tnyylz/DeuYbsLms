import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, ChevronRight, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  newLevel: number;
}

export function LevelUpModal({ isOpen, onClose, newLevel }: Props) {
  useEffect(() => {
    if (isOpen) {
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.5, opacity: 0, y: 20 }}
            className="relative bg-white dark:bg-slate-900 rounded-[3rem] p-10 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 text-center overflow-hidden"
          >
            {/* Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-indigo-500/20 blur-[80px] -z-10 rounded-full" />
            
            <div className="relative mb-8">
              <motion.div
                initial={{ rotate: -20, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: "spring", damping: 12, delay: 0.2 }}
                className="w-24 h-24 bg-gradient-to-br from-amber-400 to-orange-500 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-orange-500/40"
              >
                <Trophy size={48} className="text-white" />
              </motion.div>
              
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{ repeat: Infinity, duration: 4 }}
                className="absolute -top-4 -right-4 bg-indigo-600 text-white w-12 h-12 rounded-full flex items-center justify-center border-4 border-white dark:border-slate-900 shadow-lg font-black"
              >
                <Star size={20} fill="currentColor" />
              </motion.div>
            </div>

            <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight uppercase">YENİ SEVİYE!</h2>
            <p className="text-slate-500 dark:text-slate-400 font-bold mb-8 uppercase tracking-widest text-sm">Tebrikler, bir üst lige yükseldin!</p>
            
            <div className="flex items-center justify-center gap-6 mb-10">
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-black text-slate-400 mb-1 uppercase tracking-tighter">Eski</span>
                <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-2xl font-black text-slate-400">
                  {newLevel - 1}
                </div>
              </div>
              
              <div className="text-indigo-600 dark:text-indigo-400 mt-4">
                <ChevronRight size={32} strokeWidth={3} />
              </div>

              <div className="flex flex-col items-center">
                <span className="text-[10px] font-black text-indigo-500 mb-1 uppercase tracking-tighter">YENİ</span>
                <motion.div 
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1.1 }}
                    transition={{ repeat: Infinity, repeatType: "reverse", duration: 1 }}
                    className="w-20 h-20 rounded-2xl bg-indigo-600 flex items-center justify-center text-3xl font-black text-white shadow-xl shadow-indigo-600/40"
                >
                  {newLevel}
                </motion.div>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 mb-8 border border-slate-100 dark:border-slate-800">
               <div className="flex items-center gap-4 text-left">
                  <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center shrink-0">
                     <Zap size={24} fill="currentColor" />
                  </div>
                  <div>
                     <h4 className="font-black text-slate-800 dark:text-slate-200 text-sm">GÜÇLENDİN!</h4>
                     <p className="text-xs text-slate-500 dark:text-slate-400 font-medium tracking-tight">Artık daha zorlu kurslara hazırsın ve liderlik tablosunda daha yukarılardasın.</p>
                  </div>
               </div>
            </div>

            <button
              onClick={onClose}
              className="w-full bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-700 text-white py-5 rounded-2xl font-black text-lg transition-all shadow-xl hover:-translate-y-1 active:scale-95 uppercase tracking-widest"
            >
              Macera Devam Ediyor
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
