import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, Mail, Camera, Save, Award, TrendingUp, BookOpen, 
  Trophy, ChevronLeft, Loader2, CheckCircle, Zap, ShieldCheck
} from 'lucide-react';
import { getProfileApi, updateProfileApi } from '../../api/profile.api';
import { uploadThumbnailApi } from '../../api/teacher.api';
import { getFileUrl } from '../../utils/fileUtils';
import { useAuthStore } from '../../store/authStore';
import ThemeToggle from '../../components/shared/ThemeToggle';
import { changePasswordApi } from '../../api/profile.api';
import type { StudentProfileDto } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';
import EvolvingBadge from '../../components/dashboard/EvolvingBadge';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user: authUser, setAuth } = useAuthStore();
  const [profile, setProfile] = useState<StudentProfileDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  
  // ... (existing state)
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [studentNumber, setStudentNumber] = useState('');
  const [profilePic, setProfilePic] = useState('');
  
  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getProfileApi();
        setProfile(data);
        setFirstName(data.firstName);
        setLastName(data.lastName);
        setStudentNumber(data.studentNumber || '');
        setProfilePic(data.profilePictureUrl || '');
      } catch (err) {
        console.error('Profile load error:', err);
        setError('Profil bilgileri yüklenemedi.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSaving(true);
    try {
      const url = await uploadThumbnailApi(file);
      setProfilePic(url);
      setSuccess('Fotoğraf yüklendi. Değişiklikleri kaydetmeyi unutmayın!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Fotoğraf yüklenemedi.');
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      await updateProfileApi({
        firstName,
        lastName,
        studentNumber,
        profilePictureUrl: profilePic
      });
      
      if (authUser) {
        setAuth({
          ...authUser,
          fullName: `${firstName} ${lastName}`
        }, localStorage.getItem('token') || '');
      }

      setSuccess('Profil başarıyla güncellendi.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Profil güncellenirken bir hata oluştu.');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      setError('Yeni şifreler eşleşmiyor!');
      return;
    }

    if (newPassword === currentPassword) {
      setError('Yeni şifre eskisinden farklı olmalı!');
      return;
    }

    setChangingPassword(true);
    setError('');
    try {
      await changePasswordApi({
        currentPassword,
        newPassword,
        confirmNewPassword
      });
      setSuccess('Şifreniz başarıyla değiştirildi.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data || 'Şifre değiştirilirken bir hata oluştu.');
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white pb-20 font-sans transition-colors duration-300">
      {/* Navigation Header */}
      <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-6 py-4 sticky top-0 z-50 shadow-sm transition-colors">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <button 
            onClick={() => navigate('/student/dashboard')} 
            className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 font-bold transition-all group"
          >
            <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span>Dashboard'a Dön</span>
          </button>
          
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div className="w-px h-5 bg-slate-200 dark:bg-slate-800 hidden sm:block"></div>
            <div className="flex items-center gap-2">
               <ShieldCheck className="text-indigo-600 dark:text-indigo-400" size={20} />
               <span className="font-bold text-slate-800 dark:text-slate-200">Hesap Ayarları</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 mt-12 grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Side: Photo & Quick Info */}
        <div className="lg:col-span-4 space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none text-center relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-indigo-600 to-blue-500 opacity-90" />
            
            <div className="relative z-10">
              <div className="relative inline-block mt-4">
                <div className="w-32 h-32 rounded-3xl overflow-hidden border-4 border-white dark:border-slate-800 shadow-2xl bg-white dark:bg-slate-800">
                  {profilePic ? (
                    <img src={getFileUrl(profilePic)} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-300 dark:text-slate-600">
                      <User size={64} />
                    </div>
                  )}
                </div>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-2 -right-2 p-3 bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 rounded-2xl shadow-xl hover:scale-110 active:scale-95 transition-all border border-slate-100 dark:border-slate-700"
                >
                  <Camera size={18} />
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handlePhotoUpload} 
                  className="hidden" 
                  accept="image/*"
                />
              </div>

              <h2 className="text-2xl font-black mt-6 tracking-tight text-slate-900 dark:text-white">{profile?.firstName} {profile?.lastName}</h2>
              <p className="text-slate-400 dark:text-slate-500 font-bold text-sm uppercase tracking-widest mt-1 mb-6">{profile?.email}</p>
 
              <div className="flex flex-wrap items-center justify-center gap-3">
                <span className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-xl text-xs font-black border border-indigo-100 dark:border-indigo-800 uppercase tracking-wider">
                  SEVİYE {profile?.currentLevel}
                </span>
                <span className="px-4 py-2 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-xl text-xs font-black border border-purple-100 dark:border-purple-800 uppercase tracking-wider">
                  {profile?.gradeLevel}. SINIF
                </span>
                <span className="px-4 py-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-black border border-emerald-100 dark:border-emerald-800 uppercase tracking-wider">
                  AKTİF ÖĞRENCİ
                </span>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-indigo-600 rounded-[2.5rem] p-8 text-white shadow-xl shadow-indigo-600/30 overflow-hidden relative"
          >
            <Zap className="absolute -right-6 -bottom-6 w-32 h-32 opacity-20 rotate-12" />
            <p className="text-indigo-200 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Sıradaki Seviye</p>
            <div className="space-y-4 relative z-10">
              <div className="flex justify-between items-end">
                <p className="text-3xl font-black">{profile?.totalXp} <span className="text-base font-normal opacity-60">XP</span></p>
                <p className="text-sm font-bold opacity-80">{profile && (100 - profile.xpToNextLevel)} / 100</p>
              </div>
              <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${profile ? (100 - profile.xpToNextLevel) : 0}%` }}
                  className="h-full bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.5)]"
                />
              </div>
              <p className="text-sm font-medium opacity-80">Yeni seviyeye ulaşmak için {profile?.xpToNextLevel} XP daha kazan!</p>
            </div>
          </motion.div>
        </div>

        {/* Right Side: Form & Academic Success */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Personal Info Form */}
          <section className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
            <h3 className="text-2xl font-black mb-10 flex items-center gap-4 text-slate-900 dark:text-white">
              <div className="p-3 bg-indigo-50 dark:bg-indigo-900/40 rounded-2xl text-indigo-600 dark:text-indigo-400">
                <User size={24} />
              </div>
              Kişisel Bilgiler
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Adınız</label>
                <input 
                  type="text" 
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl px-6 py-4 font-bold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-100/50 dark:focus:ring-indigo-900/30 transition-all border-l-4 border-l-indigo-500"
                />
              </div>
              <div className="space-y-3">
                <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Soyadınız</label>
                <input 
                  type="text" 
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl px-6 py-4 font-bold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-100/50 dark:focus:ring-indigo-900/30 transition-all border-l-4 border-l-indigo-500"
                />
              </div>
              <div className="space-y-3">
                <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Öğrenci Numaranız</label>
                <input 
                  type="text" 
                  value={studentNumber}
                  onChange={(e) => setStudentNumber(e.target.value)}
                  placeholder="Örn: 2023501001"
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl px-6 py-4 font-bold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-100/50 dark:focus:ring-indigo-900/30 transition-all border-l-4 border-l-indigo-500"
                />
              </div>
            </div>
 
            <div className="mt-8 p-6 bg-slate-50 dark:bg-slate-800/40 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 flex items-center gap-4 group">
              <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl text-slate-400 dark:text-slate-500 group-hover:text-indigo-500 transition-colors shadow-sm">
                <Mail size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">E-posta Adresi (Değiştirilemez)</p>
                <p className="font-bold text-slate-600 dark:text-slate-300">{profile?.email}</p>
              </div>
            </div>

            {/* Notifications */}
            <AnimatePresence>
              {success && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-8 p-4 bg-emerald-50 text-emerald-700 rounded-2xl flex items-center gap-3 font-bold border border-emerald-100">
                  <CheckCircle size={20} /> {success}
                </motion.div>
              )}
              {error && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-8 p-4 bg-red-50 text-red-700 rounded-2xl flex items-center gap-3 font-bold border border-red-100">
                  <Save size={20} /> {error}
                </motion.div>
              )}
            </AnimatePresence>

            <button 
              onClick={handleSave}
              disabled={saving}
              className="mt-10 bg-indigo-600 hover:bg-slate-900 text-white font-black px-10 py-5 rounded-[2rem] flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl shadow-indigo-600/20 disabled:opacity-50"
            >
              {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
              Değişiklikleri Kaydet
            </button>
          </section>

          {/* Password Change Form */}
          <section className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
            <h3 className="text-2xl font-black mb-10 flex items-center gap-4 text-slate-900 dark:text-white">
              <div className="p-3 bg-indigo-50 dark:bg-indigo-900/40 rounded-2xl text-indigo-600 dark:text-indigo-400">
                <ShieldCheck size={24} />
              </div>
              Şifre Değiştir
            </h3>

            <form onSubmit={handleChangePassword} className="space-y-6">
              <div className="space-y-3">
                <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Mevcut Şifre</label>
                <input 
                  type="password" 
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl px-6 py-4 font-bold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-100/50 dark:focus:ring-indigo-900/30 transition-all"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Yeni Şifre</label>
                  <input 
                    type="password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl px-6 py-4 font-bold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-100/50 dark:focus:ring-indigo-900/30 transition-all"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Yeni Şifre (Tekrar)</label>
                  <input 
                    type="password" 
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl px-6 py-4 font-bold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-100/50 dark:focus:ring-indigo-900/30 transition-all"
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={changingPassword}
                className="bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-700 text-white font-black px-10 py-5 rounded-[2rem] flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl disabled:opacity-50"
              >
                {changingPassword ? <Loader2 className="animate-spin" size={20} /> : <Zap size={20} />}
                Şifreyi Güncelle
              </button>
            </form>
          </section>

          {/* Academic Success Dashboard */}
          <section className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 dark:bg-indigo-900/10 rounded-full blur-[100px] opacity-60 -mr-32 -mt-32"></div>
             
             <h3 className="text-2xl font-black mb-10 flex items-center gap-4 relative z-10 text-slate-900 dark:text-white">
              <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl text-indigo-600 dark:text-indigo-400">
                <TrendingUp size={24} />
              </div>
              Akademik Başarı Analizi
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 relative z-10">
              {[
                { label: 'Başarı Puanı', value: `${profile?.averageQuizScore}%`, icon: Trophy, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/30', border: 'border-amber-100 dark:border-amber-900/30' },
                { label: 'Tamamlanan', value: profile?.coursesCompletedCount, icon: BookOpen, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/30', border: 'border-blue-100 dark:border-blue-900/30' },
                { label: 'Sertifika', value: profile?.totalCertificatesCount, icon: Award, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/30', border: 'border-purple-100 dark:border-purple-900/30' },
                { label: 'Sıralama', value: `#${profile?.rank || '1'}`, icon: StarIcon, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/30', border: 'border-emerald-100 dark:border-emerald-900/30' },
              ].map((stat, i) => (
                <div key={i} className={`bg-white dark:bg-slate-800/50 border ${stat.border} rounded-3xl p-6 hover:shadow-lg dark:hover:border-indigo-500 hover:-translate-y-1 transition-all group`}>
                  <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <stat.icon size={24} />
                  </div>
                  <p className="text-3xl font-black mb-1 text-slate-900 dark:text-white">{stat.value}</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">{stat.label}</p>
                </div>
              ))}
            </div>
 
            {/* Badges Section */}
            {profile?.badges && profile.badges.length > 0 && (
              <div className="mt-12 pt-10 border-t border-slate-100 dark:border-slate-800 relative z-10">
                <p className="text-xs font-black uppercase tracking-[0.2em] mb-6 text-slate-400 dark:text-slate-500">Son Kazanılan Rozetler</p>
                <div className="flex flex-wrap gap-8">
                  {profile.badges.map((badge, i) => (
                    <EvolvingBadge key={i} badge={badge} />
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function StarIcon({ size, className }: { size: number, className?: string }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}
