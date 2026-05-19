// Path: src/pages/public/LoginPage.tsx

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { loginApi } from '../../api/auth.api';
import ThemeToggle from '../../components/shared/ThemeToggle';

export default function LoginPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await loginApi(form);
      setAuth(
        { userId: data.userId, email: data.email, fullName: data.fullName, role: data.role as any },
        data.token
      );
      if (data.role === 'Admin') {
        navigate('/admin/dashboard');
      } else if (data.role === 'Teacher') {
        navigate('/teacher/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (err: any) {
      const msg = err.response?.data?.errorMessage || 
                  (typeof err.response?.data === 'string' ? err.response.data : null) || 
                  'Giriş başarısız. Bilgilerinizi kontrol edin.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center px-4 font-sans relative transition-colors duration-300">
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>
      {/* Decorative background shape */}
      <div className="absolute top-0 left-0 w-full h-96 bg-indigo-600 rounded-b-[4rem] mix-blend-multiply opacity-5 max-w-[100vw] overflow-hidden -z-10" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-slate-900 dark:text-white bg-white dark:bg-slate-900 px-5 py-2.5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-md transition-all">
            <BookOpen className="text-indigo-600 dark:text-indigo-400" size={24} />
            <span className="font-bold text-xl">DEÜ YBS <span className="text-indigo-600 dark:text-indigo-400">LMS</span></span>
          </Link>
          <p className="text-slate-500 dark:text-slate-400 mt-4 text-base font-medium">Hesabınıza giriş yapın</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-sm font-semibold px-4 py-3 rounded-xl">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">E-posta Adresi</label>
              <input 
                type="email" 
                required 
                value={form.email} 
                onChange={e => setForm({ ...form, email: e.target.value })} 
                placeholder="ornek@deu.edu.tr" 
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-indigo-500/10 dark:focus:ring-indigo-500/5 transition-all text-sm font-medium" 
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Şifre</label>
              <div className="relative">
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  required 
                  value={form.password} 
                  onChange={e => setForm({ ...form, password: e.target.value })} 
                  placeholder="••••••••" 
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-indigo-500/10 dark:focus:ring-indigo-500/5 transition-all text-sm font-medium pr-10" 
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors p-1">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            
            <div className="pt-2">
              <button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg cursor-pointer">
                {loading && <Loader2 key="login-loader" size={18} className="animate-spin" />}
                <span>{loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}</span>
              </button>
            </div>
          </form>
        </div>

        <p className="text-center text-slate-500 dark:text-slate-400 text-sm mt-8 font-medium">
          Hesabınız yoksa yöneticinizle iletişime geçin.
        </p>
      </div>
    </div>
  );
}