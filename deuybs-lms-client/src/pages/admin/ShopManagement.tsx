// Path: src/pages/admin/ShopManagement.tsx

import { useEffect, useState } from 'react';
import { ShoppingBag, Plus, Pencil, Trash2, Zap, X, Trophy, Sparkles } from 'lucide-react';
import { adminApi } from '../../api/admin';
import { getFileUrl } from '../../utils/fileUtils';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

export default function ShopManagement() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 100,
    type: 1, // SpecialTitle
    metadata: '',
    imageUrl: '',
    isActive: true
  });

  const fetchItems = async () => {
    try {
      const data = await adminApi.getAllShopItems();
      setItems(data);
    } catch (err) {
      toast.error('Market ürünleri yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleOpenModal = (item: any = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        description: item.description,
        price: item.price,
        type: item.type,
        metadata: item.metadata || '',
        imageUrl: item.imageUrl || '',
        isActive: item.isActive
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: '',
        description: '',
        price: 100,
        type: 1,
        metadata: '',
        imageUrl: '',
        isActive: true
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await adminApi.updateShopItem(editingItem.id, formData);
        toast.success('Ürün güncellendi.');
      } else {
        await adminApi.createShopItem(formData);
        toast.success('Yeni ürün eklendi.');
      }
      setIsModalOpen(false);
      fetchItems();
    } catch (err) {
      toast.error('İşlem başarısız.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu ürünü silmek istediğinize emin misiniz?')) return;
    try {
      await adminApi.deleteShopItem(id);
      toast.success('Ürün silindi.');
      fetchItems();
    } catch (err) {
      toast.error('Silme işlemi başarısız.');
    }
  };

  const getTypeName = (type: number) => {
    switch(type) {
      case 1: return 'Özel Unvan';
      case 2: return 'Profil Çerçevesi';
      case 3: return 'XP Çarpanı';
      case 4: return 'Seri Koruması';
      default: return 'Bilinmiyor';
    }
  };

  if (loading) return <div className="p-8 text-center animate-pulse">Yükleniyor...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase flex items-center gap-3">
            <ShoppingBag className="text-amber-500" size={32} /> XP MAĞAZA YÖNETİMİ
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">Market kataloğunu yönetin, yeni kozmetikler ve güçlendiriciler ekleyin.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg shadow-amber-200 dark:shadow-none"
        >
          <Plus size={20} /> Yeni Ürün Ekle
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence>
          {items.map((item) => (
            <motion.div 
              layout
              key={item.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden group hover:-translate-y-2 transition-all"
            >
              <div className="h-48 bg-slate-100 dark:bg-slate-800 relative flex items-center justify-center p-8">
                {item.imageUrl ? (
                  <img src={getFileUrl(item.imageUrl)} alt="" className="h-full object-contain" />
                ) : (
                  <div className="w-24 h-24 bg-white/50 dark:bg-slate-700/50 rounded-full flex items-center justify-center text-slate-300">
                    <ShoppingBag size={48} />
                  </div>
                )}
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleOpenModal(item)} className="p-3 bg-white dark:bg-slate-700 rounded-xl text-slate-600 dark:text-slate-200 shadow-xl hover:text-amber-500"><Pencil size={18} /></button>
                  <button onClick={() => handleDelete(item.id)} className="p-3 bg-white dark:bg-slate-700 rounded-xl text-slate-600 dark:text-slate-200 shadow-xl hover:text-red-500"><Trash2 size={18} /></button>
                </div>
                <div className="absolute bottom-4 left-4">
                  <span className="bg-amber-500 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                    {getTypeName(item.type)}
                  </span>
                </div>
              </div>
              <div className="p-8">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{item.name}</h3>
                  <div className="flex items-center gap-1.5 font-black text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-lg text-sm">
                    {item.price.toLocaleString()} <Zap size={14} className="fill-indigo-600" />
                  </div>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed mb-6 line-clamp-2">{item.description}</p>
                
                {item.metadata && (
                  <div className="flex items-center gap-2 mb-6">
                    <div 
                      className="w-4 h-4 rounded-full border border-slate-200" 
                      style={{ backgroundColor: item.metadata }} 
                    />
                    <code className="text-xs text-slate-400 font-bold uppercase">{item.metadata}</code>
                  </div>
                )}

                <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800">
                  <span className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest ${item.isActive ? 'text-emerald-500' : 'text-slate-400'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${item.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                    {item.isActive ? 'Satışta' : 'Pasif'}
                  </span>
                  <div className="flex -space-x-2">
                    {[1,2,3].map(i => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-800" />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* CRUD Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 text-slate-900">
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
                <h3 className="text-xl font-black uppercase tracking-tight dark:text-white">
                  {editingItem ? 'Ürünü Düzenle' : 'Yeni Ürün Ekle'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X /></button>
              </div>
              <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                <div className="p-8 space-y-5 overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="col-span-2">
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Ürün Adı</label>
                    <input 
                      required
                      className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 focus:ring-2 ring-amber-500 text-slate-900 dark:text-white"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Açıklama</label>
                    <textarea 
                      className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 focus:ring-2 ring-amber-500 min-h-[80px] text-slate-900 dark:text-white"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                    />
                  </div>
                  <div className="col-span-2 bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 mt-2">
                    <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 mb-6 uppercase tracking-widest text-center">Ürün Satış Fiyatı (XP)</label>
                    <div className="flex flex-col items-center justify-between gap-6 mb-8">
                        <div className="flex items-center gap-4">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500
                                ${formData.price >= 2500 ? 'bg-amber-100 text-amber-600 shadow-xl shadow-amber-500/20 rotate-12' : 
                                  formData.price >= 1000 ? 'bg-indigo-100 text-indigo-600 shadow-lg shadow-indigo-500/20 rotate-6' : 
                                  'bg-slate-100 text-slate-500'}`}>
                                {formData.price >= 2500 ? <Trophy size={28} /> : 
                                 formData.price >= 1000 ? <Sparkles size={28} /> : 
                                 <Zap size={28} />}
                            </div>
                            <div className="text-center sm:text-left">
                                <div className="flex items-baseline gap-1 justify-center sm:justify-start">
                                    <span className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white transition-all">{formData.price.toLocaleString()}</span>
                                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">XP</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap justify-center gap-2">
                            {[100, 500, 1000, 2500, 5000].map(val => (
                                <button
                                    key={val}
                                    type="button"
                                    onClick={() => setFormData({...formData, price: val})}
                                    className={`px-4 py-2 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all
                                        ${formData.price === val ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30' : 'bg-white dark:bg-slate-900 text-slate-500 hover:border-amber-400 border border-slate-200 dark:border-slate-800'}`}
                                >
                                    {val}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="relative pt-2 px-1">
                        <input 
                            type="range" 
                            min="50" 
                            max="10000" 
                            step="50"
                            value={formData.price} 
                            onChange={(e) => setFormData({...formData, price: parseInt(e.target.value)})} 
                            className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer accent-amber-500"
                        />
                        <div className="flex justify-between mt-2 px-1">
                            <span className="text-[10px] font-black text-slate-400">50 XP</span>
                            <span className="text-[10px] font-black text-slate-400">10,000 XP</span>
                        </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Ürün Türü</label>
                    <select 
                      className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 focus:ring-2 ring-amber-500 text-slate-900 dark:text-white"
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: parseInt(e.target.value)})}
                    >
                      <option value={1}>Özel Unvan</option>
                      <option value={2}>Profil Çerçevesi</option>
                      <option value={3}>XP Çarpanı</option>
                      <option value={4}>Seri Koruması</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Metadata (Renk Kodu vb.)</label>
                    <input 
                      placeholder="#ff0000 veya 'Efsanevi'"
                      className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 focus:ring-2 ring-amber-500 text-slate-900 dark:text-white"
                      value={formData.metadata}
                      onChange={(e) => setFormData({...formData, metadata: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Görsel URL (Opsiyonel)</label>
                    <input 
                      className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 focus:ring-2 ring-amber-500 text-slate-900 dark:text-white"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-2">
                  <input 
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                    className="w-5 h-5 rounded-lg border-none bg-slate-200 text-amber-500 focus:ring-0"
                  />
                  <label htmlFor="isActive" className="text-sm font-bold text-slate-600 dark:text-slate-400 cursor-pointer">Ürünü Hemen Satışa Çıkar</label>
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
                    className="flex-1 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest bg-amber-500 text-white hover:bg-amber-600 shadow-lg shadow-amber-100 dark:shadow-none transition-all"
                  >
                    {editingItem ? 'Değişiklikleri Kaydet' : 'Ürünü Ekle'}
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
