// Path: src/pages/admin/ChallengeManagement.tsx

import { useEffect, useState } from 'react';
import { Target, Plus, Pencil, Trash2,Award, Zap, CheckCircle2, X, Trophy, Sparkles } from 'lucide-react';
import { adminApi } from '../../api/admin';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

export default function ChallengeManagement() {
  const [challenges, setChallenges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 1, // XpGain
    targetValue: 100,
    xpReward: 50,
    expiryDate: '',
    isActive: true
  });

  const fetchChallenges = async () => {
    try {
      const data = await adminApi.getAllChallenges();
      setChallenges(data);
    } catch (err) {
      toast.error('Görevler yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallenges();
  }, []);

  const handleOpenModal = (challenge: any = null) => {
    if (challenge) {
      setEditingChallenge(challenge);
      setFormData({
        title: challenge.title,
        description: challenge.description,
        type: challenge.type,
        targetValue: challenge.targetValue,
        xpReward: challenge.xpReward,
        expiryDate: challenge.expiryDate ? challenge.expiryDate.split('T')[0] : '',
        isActive: challenge.isActive
      });
    } else {
      setEditingChallenge(null);
      setFormData({
        title: '',
        description: '',
        type: 1,
        targetValue: 100,
        xpReward: 50,
        expiryDate: '',
        isActive: true
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingChallenge) {
        await adminApi.updateChallenge(editingChallenge.id, formData);
        toast.success('Görev güncellendi.');
      } else {
        await adminApi.createChallenge(formData);
        toast.success('Yeni görev oluşturuldu.');
      }
      setIsModalOpen(false);
      fetchChallenges();
    } catch (err) {
      toast.error('İşlem başarısız.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu görevi silmek istediğinize emin misiniz?')) return;
    try {
      await adminApi.deleteChallenge(id);
      toast.success('Görev silindi.');
      fetchChallenges();
    } catch (err) {
      toast.error('Silme işlemi başarısız.');
    }
  };

  const getTypeName = (type: number) => {
    switch(type) {
      case 1: return 'XP Kazanma';
      case 2: return 'Ders Bitirme';
      case 3: return 'Quiz Başarısı';
      default: return 'Bilinmiyor';
    }
  };

  if (loading) return <div className="p-8 text-center animate-pulse">Yükleniyor...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase flex items-center gap-3">
            <Target className="text-indigo-600" size={32} /> HAFTALIK GÖREV YÖNETİMİ
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">Sistem genelindeki görevleri yönetin ve ödülleri belirleyin.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg shadow-indigo-200 dark:shadow-none"
        >
          <Plus size={20} /> Yeni Görev Ekle
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 uppercase text-[10px] font-black tracking-widest border-b border-slate-100 dark:border-slate-800">
              <th className="px-8 py-5">GÖREV BİLGİSİ</th>
              <th className="px-8 py-5">TÜR</th>
              <th className="px-8 py-5">HEDEF</th>
              <th className="px-8 py-5">ÖDÜL</th>
              <th className="px-8 py-5">DURUM</th>
              <th className="px-8 py-5 text-right">İŞLEMLER</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {challenges.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                      <Zap size={24} />
                    </div>
                    <div>
                      <p className="font-black text-slate-900 dark:text-white text-lg tracking-tight">{c.title}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1">{c.description}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-widest border border-slate-200 dark:border-slate-700">
                    {getTypeName(c.type)}
                  </span>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-2 font-black text-slate-700 dark:text-slate-300">
                    <CheckCircle2 size={16} className="text-emerald-500" /> {c.targetValue}
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-2 font-black text-amber-600">
                     <Award size={18} /> {c.xpReward} XP
                  </div>
                </td>
                <td className="px-8 py-6">
                  {c.isActive ? (
                    <span className="flex items-center gap-1.5 text-emerald-500 text-[10px] font-black uppercase tracking-widest">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> AKTİF
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full" /> PASİF
                    </span>
                  )}
                </td>
                <td className="px-8 py-6 text-right">
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={() => handleOpenModal(c)}
                      className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400 hover:text-indigo-600 transition-all"
                    >
                      <Pencil size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(c.id)}
                      className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl text-slate-400 hover:text-red-500 transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* CRUD Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center shrink-0">
                <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white">
                  {editingChallenge ? 'Görevi Düzenle' : 'Yeni Görev Ekle'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X /></button>
              </div>
              <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                <div className="p-8 space-y-6 overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="col-span-2">
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Görev Başlığı</label>
                    <input 
                      required
                      className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 focus:ring-2 ring-indigo-500 transition-all text-slate-900 dark:text-white"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Açıklama</label>
                    <textarea 
                      className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 focus:ring-2 ring-indigo-500 transition-all min-h-[100px] text-slate-900 dark:text-white"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Görev Türü</label>
                    <select 
                      className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 focus:ring-2 ring-indigo-500 text-slate-900 dark:text-white"
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: parseInt(e.target.value)})}
                    >
                      <option value={1}>XP Kazanma</option>
                      <option value={2}>Ders Bitirme</option>
                      <option value={3}>Quiz Başarısı</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Hedef Değer</label>
                    <input 
                      type="number"
                      className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 focus:ring-2 ring-indigo-500 text-slate-900 dark:text-white"
                      value={formData.targetValue}
                      onChange={(e) => setFormData({...formData, targetValue: parseInt(e.target.value)})}
                    />
                  </div>
                  <div className="col-span-2 bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 mt-4">
                    <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 mb-6 uppercase tracking-widest text-center">Görev Ödülü (XP)</label>
                    <div className="flex flex-col items-center justify-between gap-6 mb-8">
                        <div className="flex items-center gap-4">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500
                                ${formData.xpReward >= 500 ? 'bg-amber-100 text-amber-600 shadow-xl shadow-amber-500/20 rotate-12' : 
                                  formData.xpReward >= 250 ? 'bg-indigo-100 text-indigo-600 shadow-lg shadow-indigo-500/20 rotate-6' : 
                                  'bg-slate-100 text-slate-500'}`}>
                                {formData.xpReward >= 500 ? <Trophy size={28} /> : 
                                 formData.xpReward >= 250 ? <Sparkles size={28} /> : 
                                 <Zap size={28} />}
                            </div>
                            <div className="text-center sm:text-left">
                                <div className="flex items-baseline gap-1 justify-center sm:justify-start">
                                    <span className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white transition-all">{formData.xpReward}</span>
                                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">XP</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap justify-center gap-2">
                            {[50, 100, 250, 500].map(val => (
                                <button
                                    key={val}
                                    type="button"
                                    onClick={() => setFormData({...formData, xpReward: val})}
                                    className={`px-4 py-2 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all
                                        ${formData.xpReward === val ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'bg-white dark:bg-slate-900 text-slate-500 hover:border-indigo-400 border border-slate-200 dark:border-slate-800'}`}
                                >
                                    {val}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="relative pt-2 px-1">
                        <input 
                            type="range" 
                            min="10" 
                            max="2000" 
                            step="10"
                            value={formData.xpReward} 
                            onChange={(e) => setFormData({...formData, xpReward: parseInt(e.target.value)})} 
                            className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer accent-indigo-600"
                        />
                        <div className="flex justify-between mt-2 px-1">
                            <span className="text-[10px] font-black text-slate-400">10 XP</span>
                            <span className="text-[10px] font-black text-slate-400">2,000 XP</span>
                        </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Bitiş Tarihi</label>
                    <input 
                      type="date"
                      className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 focus:ring-2 ring-indigo-500 text-slate-900 dark:text-white"
                      value={formData.expiryDate}
                      onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-4">
                  <input 
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                    className="w-5 h-5 rounded-lg border-none bg-slate-200 text-indigo-600 focus:ring-0"
                  />
                  <label htmlFor="isActive" className="text-sm font-bold text-slate-600 dark:text-slate-400 cursor-pointer">Görevi Hemen Aktifleştir</label>
                </div>
              </div>

              <div className="p-8 border-t border-slate-100 dark:border-slate-800 flex gap-4 shrink-0 bg-white dark:bg-slate-900">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all font-bold"
                >
                  İptal
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-100 dark:shadow-none transition-all"
                >
                  {editingChallenge ? 'Değişiklikleri Kaydet' : 'Görevi Oluştur'}
                </button>
              </div>
            </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
