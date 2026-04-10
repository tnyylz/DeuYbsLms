// Path: src/pages/public/LandingPage.tsx

import { Link } from 'react-router-dom';
import { BookOpen, Trophy, Lock, ChevronRight, Zap, BarChart2 } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">

      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 px-6 py-4 shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-50 p-2 rounded-lg">
              <BookOpen className="text-indigo-600" size={24} />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900">DEÜ YBS <span className="text-indigo-600">LMS</span></span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-slate-600 hover:text-indigo-600 font-semibold transition-colors text-sm px-4 py-2">
              Giriş Yap
            </Link>
            <Link to="/register" className="bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-md hover:shadow-lg px-5 py-2.5 rounded-xl text-sm font-bold">
              Ücretsiz Kayıt Ol
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-24 md:py-32 text-center relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-2xl bg-indigo-100 blur-[100px] rounded-full opacity-60 pointer-events-none -z-10"></div>
        
        <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-full px-4 py-1.5 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-8 shadow-sm">
          <Zap size={14} fill="currentColor" /> Gamification ile Öğrenme
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6 text-slate-900 tracking-tight">
          Öğrenmeyi Bir <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">Oyuna</span> Dönüştür
        </h1>
        
        <p className="text-slate-500 text-lg md:text-xl font-medium max-w-2xl mx-auto mb-10 leading-relaxed">
          DEÜ Yönetim Bilişim Sistemleri öğrencileri için tasarlanmış, XP, rozet ve seviye sistemiyle desteklenen modern ve eğlenceli öğrenme platformu.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/register" className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-lg hover:-translate-y-1 px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2 text-lg">
            Hemen Başla <ChevronRight size={20} />
          </Link>
          <Link to="/login" className="w-full sm:w-auto bg-white border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 transition-colors px-8 py-4 rounded-xl font-bold flex items-center justify-center text-lg shadow-sm">
            Giriş Yap
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 pb-24 relative z-10">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow rounded-3xl p-8 group">
            <div className="w-14 h-14 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-colors text-indigo-600">
              <Lock size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Kilit Sistemi</h3>
            <p className="text-slate-500 font-medium leading-relaxed">
              Videoyu izle, quizi geç, sonraki dersin kilidini aç. Adım adım ilerleme garantisi ve yapılandırılmış eğitim düzeni.
            </p>
          </div>
          
          <div className="bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow rounded-3xl p-8 group">
            <div className="w-14 h-14 bg-amber-50 border border-amber-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-amber-500 group-hover:text-white transition-colors text-amber-500">
              <Trophy size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Gamification</h3>
            <p className="text-slate-500 font-medium leading-relaxed">
              XP kazan, seviye atla, liderlik tablosunda yüksel ve rozetler topla. Öğrenme serüvenin hiç bu kadar eğlenceli olmamıştı.
            </p>
          </div>
          
          <div className="bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow rounded-3xl p-8 group">
            <div className="w-14 h-14 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-emerald-500 group-hover:text-white transition-colors text-emerald-600">
              <BarChart2 size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Eğitmen Paneli</h3>
            <p className="text-slate-500 font-medium leading-relaxed">
              Öğrencilerin tüm ilerlemesini detaylı metriklerle takip et, risk altındaki öğrencileri erken tespit edip destek ol.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 px-6 py-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
           <BookOpen className="text-slate-300" size={20} />
           <span className="font-bold text-slate-400">DEÜ YBS LMS</span>
        </div>
        <p className="text-slate-500 font-medium text-sm">
          © {new Date().getFullYear()} DEÜ Yönetim Bilişim Sistemleri — Tüm hakları saklıdır.
        </p>
      </footer>
    </div>
  );
}