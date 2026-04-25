import React, { useEffect, useState } from 'react';
import { announcementApi, type SystemAnnouncement, type CreateAnnouncementRequest } from '../../api/announcement';
import toast from 'react-hot-toast';
import { Megaphone, Trash2, Plus, Power, Clock, Info, AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AnnouncementManagement() {
  const [announcements, setAnnouncements] = useState<SystemAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState<CreateAnnouncementRequest>({
    message: '',
    type: 'info',
    targetRole: 'All'
  });

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const data = await announcementApi.getAll();
      setAnnouncements(data);
    } catch (error) {
      toast.error('Duyurular yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnouncement.message.trim()) return;

    try {
      await announcementApi.create(newAnnouncement);
      toast.success('Duyuru başarıyla oluşturuldu.');
      setIsAdding(false);
      setNewAnnouncement({ message: '', type: 'info', targetRole: 'All' });
      fetchAnnouncements();
    } catch {
      toast.error('Duyuru oluşturulamadı.');
    }
  };

  const handleToggle = async (id: string) => {
    try {
      await announcementApi.toggle(id);
      toast.success('Duyuru durumu güncellendi.');
      fetchAnnouncements();
    } catch {
      toast.error('İşlem başarısız.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bu duyuruyu kalıcı olarak silmek istediğinize emin misiniz?')) return;
    try {
      await announcementApi.delete(id);
      toast.success('Duyuru silindi.');
      fetchAnnouncements();
    } catch {
      toast.error('Silme işlemi başarısız.');
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">Global Duyurular</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Platform genelinde gösterilecek mesajları yönetin.</p>
        </div>
        {!isAdding && (
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-2xl font-bold text-sm transition-all shadow-lg shadow-purple-200 dark:shadow-none cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni Duyuru</span>
          </button>
        )}
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white dark:bg-gray-800 p-8 rounded-[2rem] shadow-sm border border-purple-100 dark:border-purple-900/30 mb-8 transition-colors">
              <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center space-x-2">
                <Megaphone className="w-5 h-5 text-purple-600" />
                <span>Yeni Duyuru Oluştur</span>
              </h4>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">Duyuru Mesajı</label>
                  <textarea 
                    required
                    value={newAnnouncement.message}
                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, message: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-3 outline-none focus:ring-2 focus:ring-purple-500 transition-all dark:text-white"
                    placeholder="Örn: Sistem bakımı pazar gecesi saat 00:00'da başlayacaktır."
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <select 
                      value={newAnnouncement.type}
                      onChange={(e) => setNewAnnouncement({ ...newAnnouncement, type: e.target.value })}
                      className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-3 outline-none focus:ring-2 focus:ring-purple-500 transition-all dark:text-white"
                    >
                      <option value="info">Bilgilendirme (Mavi)</option>
                      <option value="success">Başarı (Yeşil)</option>
                      <option value="warning">Uyarı (Turuncu)</option>
                      <option value="error">Hata (Kırmızı)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">Hedef Kitle</label>
                    <select 
                      value={newAnnouncement.targetRole}
                      onChange={(e) => setNewAnnouncement({ ...newAnnouncement, targetRole: e.target.value })}
                      className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-3 outline-none focus:ring-2 focus:ring-purple-500 transition-all dark:text-white"
                    >
                      <option value="All">Tümü (Herkes)</option>
                      <option value="Student">Öğrenciler</option>
                      <option value="Teacher">Öğretmenler</option>
                      <option value="Admin">Adminler</option>
                    </select>
                  </div>
                  <div className="flex items-end space-x-3">
                    <button 
                      type="submit"
                      className="flex-1 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold py-3.5 rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-lg cursor-pointer"
                    >
                      Duyuruyu Yayınla
                    </button>
                    <button 
                      type="button"
                      onClick={() => setIsAdding(false)}
                      className="px-6 py-3.5 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 font-bold rounded-2xl hover:bg-gray-200 transition-all cursor-pointer"
                    >
                      İptal
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="flex py-20 items-center justify-center">
            <div className="w-10 h-10 border-t-2 border-b-2 border-purple-600 rounded-full animate-spin"></div>
          </div>
        ) : (
          announcements.map((ann) => (
            <motion.div 
              layout
              key={ann.id}
              className={`bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border transition-all ${
                ann.isActive ? 'border-gray-100 dark:border-gray-700' : 'border-gray-200 dark:border-gray-800 opacity-60 bg-gray-50/50 grayscale-[0.2]'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start space-x-4 flex-1">
                  <div className={`p-3 rounded-2xl bg-gray-50 dark:bg-gray-900/50`}>
                    {getTypeIcon(ann.type)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-3 mb-1">
                      <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                        {ann.type}
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300">
                        {ann.targetRole === 'All' ? 'Herkes' : ann.targetRole}
                      </span>
                      <span className="flex items-center text-[10px] font-bold text-gray-400">
                        <Clock className="w-3 h-3 mr-1" />
                        {new Date(ann.createdAt).toLocaleDateString('tr-TR')}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white leading-relaxed">
                      {ann.message}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 self-end md:self-center">
                  <button 
                    onClick={() => handleToggle(ann.id)}
                    className={`p-2.5 rounded-xl transition-all ${
                      ann.isActive 
                        ? 'text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20' 
                        : 'text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
                    }`}
                    title={ann.isActive ? "Devre Dışı Bırak" : "Etkinleştir"}
                  >
                    <Power className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => handleDelete(ann.id)}
                    className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                    title="Sil"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
        {!loading && announcements.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-[2rem] p-16 text-center border border-gray-100 dark:border-gray-700">
             <Megaphone className="w-12 h-12 text-gray-200 mx-auto mb-4" />
             <p className="text-gray-500 dark:text-gray-400">Henüz yayınlanmış bir duyuru bulunmuyor.</p>
          </div>
        )}
      </div>
    </div>
  );
}
