// Path: src/pages/student/ShopPage.tsx

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, ShieldCheck, Palette, Award, CheckCircle, Info, Loader2, Package, Sparkles, Zap } from 'lucide-react';
import { getShopItemsApi, purchaseItemApi, getInventoryApi, seedShopApi } from '../../api/shop.api';
import { equipItemApi } from '../../api/gamification.api';
import { getGamificationApi } from '../../api/gamification.api';
import type { ShopItem, UserInventoryItem, StudentGamificationDto } from '../../types';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import ThemeToggle from '../../components/shared/ThemeToggle';
import { Link } from 'react-router-dom';
import confetti from 'canvas-confetti';

export default function ShopPage() {
  const [items, setItems] = useState<ShopItem[]>([]);
  const [inventory, setInventory] = useState<UserInventoryItem[]>([]);
  const [gamification, setGamification] = useState<StudentGamificationDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [buyingId, setBuyingId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [shopItems, userInventory, gData] = await Promise.all([
        getShopItemsApi().catch(() => []),
        getInventoryApi().catch(() => []),
        getGamificationApi().catch(() => null)
      ]);
      setItems(shopItems);
      setInventory(userInventory);
      setGamification(gData);
    } catch (err) {
      toast.error('Veriler yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePurchase = async (itemId: string) => {
    setBuyingId(itemId);
    try {
      const result = await purchaseItemApi(itemId);
      if (result.success) {
        toast.success(result.message);
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#4f46e5', '#818cf8', '#ffffff']
        });
        fetchData();
      }
    } catch (err: any) {
      toast.error(err.response?.data || 'Satın alma başarısız.');
    } finally {
      setBuyingId(null);
    }
  };

  const handleEquip = async (inventoryItemId: string) => {
    try {
      const result = await equipItemApi(inventoryItemId);
      toast.success(result.message);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Kuşanma işlemi başarısız.');
    }
  };

  const handleSeed = async () => {
    try {
      await seedShopApi();
      toast.success('Mağaza ürünleri oluşturuldu!');
      fetchData();
    } catch (err) {
      toast.error('Seed işlemi başarısız.');
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white pb-20">
      {/* Header */}
      <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-6 py-4 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
           <div className="flex items-center gap-3">
              <Link to="/student/dashboard" className="bg-slate-100 dark:bg-slate-800 p-2 rounded-xl text-slate-500 hover:text-indigo-600 transition-all">
                <ShoppingBag size={20} />
              </Link>
              <h1 className="text-xl font-black uppercase tracking-tight">XP MAĞAZASI</h1>
           </div>
           
           <div className="flex items-center gap-4">
              <div className="bg-indigo-600 text-white px-4 py-2 rounded-2xl flex items-center gap-2 shadow-lg shadow-indigo-500/30">
                 <Zap size={18} fill="currentColor" />
                 <span className="font-black text-sm">{gamification?.totalXp || 0} XP</span>
              </div>
              <ThemeToggle />
           </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-12">
        
        {/* Banner */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 rounded-[3rem] p-12 text-white mb-16 relative overflow-hidden shadow-2xl shadow-indigo-500/20">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
            
            <div className="relative z-10 max-w-2xl">
                <span className="inline-block px-4 py-1.5 bg-white/20 rounded-full text-[10px] font-black tracking-widest uppercase mb-6 backdrop-blur-md">SINIRLI SÜRELİ TEKLİFLER</span>
                <h2 className="text-5xl font-black mb-4 tracking-tighter leading-tight">XP'LERİNİ <br/>GÜCE DÖNÜŞTÜR!</h2>
                <p className="text-white/80 font-bold mb-8 leading-relaxed">Kazandığın tecrübe puanlarını (XP) kullanarak profilini özelleştir, serini koru ve liderlik tablosunda fark yarat.</p>
                

            </div>
        </div>

        <div className="grid md:grid-cols-12 gap-12">
            
            {/* Store Grid */}
            <div className="md:col-span-8 space-y-8">
                <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-black tracking-tight flex items-center gap-2">
                        <Sparkles className="text-amber-500" size={24} /> MEVCUT ÜRÜNLER
                    </h3>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                    {items.map((item) => {
                        const isOwned = inventory.some(ui => ui.shopItemId === item.id && !ui.isUsed);
                        const canAfford = (gamification?.totalXp || 0) >= item.priceXp;

                        return (
                            <motion.div 
                                key={item.id}
                                whileHover={{ y: -5 }}
                                className={`bg-white dark:bg-slate-900 border-2 rounded-[2.5rem] p-8 transition-all group relative overflow-hidden 
                                    ${isOwned ? 'border-emerald-500/30' : 'border-slate-100 dark:border-slate-800 hover:border-indigo-500'}`}
                            >
                                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform">
                                    <span className="text-6xl">{item.iconEmoji}</span>
                                </div>

                                <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center text-3xl mb-6 shadow-inner border border-slate-100 dark:border-slate-800">
                                    {item.iconEmoji}
                                </div>

                                <h4 className="text-lg font-black mb-2 dark:text-white uppercase tracking-tight">{item.name}</h4>
                                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-8 leading-relaxed">
                                    {item.description}
                                </p>

                                <div className="flex items-center justify-between mt-auto">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fiyat</span>
                                        <span className={`text-xl font-black ${canAfford ? 'text-indigo-600 dark:text-indigo-400' : 'text-red-500'}`}>
                                            {item.priceXp} XP
                                        </span>
                                    </div>

                                    <button 
                                        disabled={isOwned || !canAfford || buyingId === item.id}
                                        onClick={() => handlePurchase(item.id)}
                                        className={`px-6 py-3 rounded-2xl font-black text-xs transition-all shadow-lg
                                            ${isOwned ? 'bg-emerald-500 text-white cursor-default' : 
                                              buyingId === item.id ? 'bg-indigo-100 text-indigo-400 cursor-wait' :
                                              canAfford ? 'bg-indigo-600 text-white hover:bg-slate-900 dark:hover:bg-white dark:hover:text-slate-950 shadow-indigo-500/20' : 
                                              'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed opacity-50'}`}
                                    >
                                        {isOwned ? (
                                            <span className="flex items-center gap-1.5"><CheckCircle size={14} /> SAHİPSİN</span>
                                        ) : buyingId === item.id ? (
                                            <Loader2 size={14} className="animate-spin" />
                                        ) : (
                                            'SATIN AL'
                                        )}
                                    </button>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* Sidebar: Inventory & Stats */}
            <div className="md:col-span-4 space-y-8">
                {/* Inventory Card */}
                <section className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm">
                    <h3 className="text-xl font-black mb-6 flex items-center gap-2">
                        <Package className="text-indigo-500" size={20} /> ENVANTERİN
                    </h3>

                    <div className="space-y-4">
                        {inventory.length === 0 ? (
                            <div className="py-12 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl">
                                <p className="text-sm text-slate-400 font-bold uppercase tracking-widest px-4">Henüz bir ürünün yok.</p>
                            </div>
                        ) : (
                            inventory.map((inv) => {
                                const canEquip = !inv.isUsed && (inv.itemType === 'ProfileFrame' || inv.itemType === 'SpecialTitle');
                                return (
                                <div key={inv.id} className={`p-4 rounded-2xl border flex items-center gap-4 transition-all ${inv.isUsed ? 'bg-slate-50 dark:bg-slate-800/20 border-slate-100 dark:border-slate-800 opacity-50' : 'bg-white dark:bg-slate-800 border-emerald-100 dark:border-emerald-900/40 shadow-sm'}`}>
                                    <div className="text-2xl">{inv.iconEmoji}</div>
                                    <div className="flex-1">
                                        <p className="text-sm font-black dark:text-white leading-none mb-1">{inv.itemName}</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                            {inv.isUsed ? 'Kullanıldı' : inv.isEquipped ? 'Kuşanıldı' : 'Stokta'} &bull; {new Date(inv.purchasedAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    {canEquip && (
                                        <button 
                                            onClick={() => handleEquip(inv.id)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${inv.isEquipped ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200'}`}
                                        >
                                            {inv.isEquipped ? 'Çıkar' : 'Kuşan'}
                                        </button>
                                    )}
                                    {!inv.isUsed && !canEquip && <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>}
                                </div>
                            )})
                        )}
                    </div>
                </section>

                {/* Info Card */}
                <section className="bg-indigo-50 dark:bg-indigo-950/20 border-2 border-indigo-100 dark:border-indigo-900/50 rounded-[2.5rem] p-8">
                    <h4 className="text-indigo-900 dark:text-indigo-300 font-black text-sm mb-4 uppercase flex items-center gap-2">
                        <Info size={16} /> BİLGİ KUTUSU
                    </h4>
                    <p className="text-indigo-800/60 dark:text-indigo-400/60 text-xs font-bold leading-relaxed">
                        Mağazadaki ürünler dijitaldir ve iadesi mümkün değildir. Bazı ürünler (Seri Koruma gibi) ihtiyaç duyulduğunda sistem tarafından otomatik olarak kullanılır.
                    </p>
                </section>
            </div>
        </div>
      </div>
    </div>
  );
}
