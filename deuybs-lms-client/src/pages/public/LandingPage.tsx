// Path: src/pages/public/LandingPage.tsx

import { Link } from 'react-router-dom';
import { BookOpen, Trophy, Lock, ChevronRight, Zap, BarChart2 } from 'lucide-react';
import ThemeToggle from '../../components/shared/ThemeToggle';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-sans transition-colors duration-300">

      {/* Navbar */}
      <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-6 py-4 shadow-sm sticky top-0 z-50 transition-colors">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-50 dark:bg-indigo-900/40 p-2 rounded-lg transition-colors">
              <BookOpen className="text-indigo-600 dark:text-indigo-400" size={24} />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">YBS <span className="text-indigo-600 dark:text-indigo-400">Portal</span></span>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-2 hidden sm:block" />
            <Link to="/login" className="bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-md hover:shadow-lg px-5 py-2.5 rounded-xl text-sm font-bold">
              Giriş Yap
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-24 md:py-32 text-center relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-2xl bg-indigo-100 dark:bg-indigo-900/20 blur-[120px] rounded-full opacity-60 pointer-events-none -z-10 animate-pulse transition-colors" />
        
        <div className="inline-flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 rounded-full px-4 py-1.5 text-indigo-700 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider mb-8 shadow-sm">
          <Zap size={14} fill="currentColor" /> Gamification ile Öğrenme
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6 text-slate-900 dark:text-white tracking-tight">
          Öğrenmeyi Bir <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500 dark:from-indigo-400 dark:to-blue-400">Oyuna</span> Dönüştür
        </h1>
        
        <p className="text-slate-500 dark:text-slate-400 text-lg md:text-xl font-medium max-w-2xl mx-auto mb-10 leading-relaxed">
          DEÜ Yönetim Bilişim Sistemleri öğrencileri için tasarlanmış, XP, rozet ve seviye sistemiyle desteklenen modern ve eğlenceli öğrenme platformu.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/login" className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-lg hover:-translate-y-1 px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2 text-lg">
            Giriş Yap <ChevronRight size={20} />
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 pb-24 relative z-10">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all rounded-3xl p-8 group">
            <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-colors text-indigo-600 dark:text-indigo-400">
              <Lock size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Kilit Sistemi</h3>
            <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
              Videoyu izle, quizi geç, sonraki dersin kilidini aç. Adım adım ilerleme garantisi ve yapılandırılmış eğitim düzeni.
            </p>
          </div>
          
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all rounded-3xl p-8 group">
            <div className="w-14 h-14 bg-amber-50 dark:bg-amber-900/30 border border-amber-100 dark:border-amber-800 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-amber-500 group-hover:text-white transition-colors text-amber-500 dark:text-amber-400">
              <Trophy size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Gamification</h3>
            <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
              XP kazan, seviye atla, liderlik tablosunda yüksel ve rozetler topla. Öğrenme serüvenin hiç bu kadar eğlenceli olmamıştı.
            </p>
          </div>
          
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all rounded-3xl p-8 group">
            <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-800 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-emerald-500 group-hover:text-white transition-colors text-emerald-600 dark:text-emerald-400">
              <BarChart2 size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Eğitmen Paneli</h3>
            <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
              Öğrencilerin tüm ilerlemesini detaylı metriklerle takip et, risk altındaki öğrencileri erken tespit edip destek ol.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-6 py-8 text-center transition-colors">
        <div className="flex items-center justify-center gap-2 mb-4">
           <BookOpen className="text-slate-300 dark:text-slate-700" size={20} />
           <span className="font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest text-xs">YBS PORTAL</span>
        </div>
        <p className="text-slate-500 dark:text-slate-500 font-medium text-sm">
          © {new Date().getFullYear()} DEÜ Yönetim Bilişim Sistemleri — Tüm hakları saklıdır.
        </p>
      </footer>
    </div>
  );
}