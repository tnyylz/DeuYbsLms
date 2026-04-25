import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Layers, PlusCircle, Trash2, Edit3, Search, BookOpen } from 'lucide-react';
import { getTeacherPathsApi, deleteLearningPathApi } from '../../api/learningPath.api';
import { getFileUrl } from '../../utils/fileUtils';
import type { LearningPathDto } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import ThemeToggle from '../../components/shared/ThemeToggle';
import NotificationCenter from '../../components/shared/NotificationCenter';

export default function TeacherLearningPathsPage() {
  const [paths, setPaths] = useState<LearningPathDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchPaths = async () => {
    try {
      const data = await getTeacherPathsApi();
      setPaths(data);
    } catch (err) {
      toast.error('Yol haritaları yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaths();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bu yol haritasını silmek istediğinize emin misiniz?')) return;

    try {
      await deleteLearningPathApi(id);
      toast.success('Yol haritası silindi.');
      setPaths(paths.filter(p => p.id !== id));
    } catch (err) {
      toast.error('Silme işlemi başarısız.');
    }
  };

  const filteredPaths = paths.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <nav className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl sticky top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/teacher/dashboard" className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
              <BookOpen className="text-white" size={22} />
            </Link>
            <div>
              <span className="font-bold text-lg tracking-tight block">Yol Haritaları</span>
              <span className="text-[10px] uppercase tracking-widest text-indigo-500 font-bold">Eğitmen Yönetimi</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <NotificationCenter />
            <ThemeToggle />
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-3xl font-black mb-2">Öğrenme Yollarını Yönet</h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium">Öğrencilerinin gelişimini yönlendirmek için stratejik eğitim paketleri oluştur.</p>
          </div>
          
          <Link 
            to="/teacher/learning-path-builder"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-black text-sm flex items-center gap-2 shadow-xl shadow-indigo-600/20 active:scale-95 transition-all"
          >
            <PlusCircle size={20} /> Yeni Yol Haritası Ekle
          </Link>
        </div>

        {/* Search */}
        <div className="relative mb-10 group max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Yol haritalarında ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all shadow-sm"
          />
        </div>

        {filteredPaths.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence>
              {filteredPaths.map((path, idx) => (
                <motion.div
                  key={path.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] overflow-hidden hover:shadow-2xl hover:shadow-indigo-500/5 transition-all relative"
                >
                  <div className="h-40 relative overflow-hidden bg-slate-100 dark:bg-slate-800">
                    {path.thumbnailUrl ? (
                      <img 
                        src={getFileUrl(path.thumbnailUrl)} 
                        alt={path.title} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-slate-700">
                        <Layers size={48} />
                      </div>
                    )}
                    <div className="absolute top-4 right-4">
                       <span className={`text-[10px] font-black px-3 py-1.5 rounded-full border shadow-sm ${path.isPublished ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'}`}>
                         {path.isPublished ? 'YAYINDA' : 'TASLAK'}
                       </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest bg-indigo-50 dark:bg-indigo-950/30 px-2 py-1 rounded-lg">
                        {path.difficulty}
                      </span>
                    </div>
                    <h3 className="text-xl font-black mb-3 line-clamp-1 uppercase tracking-tight">{path.title}</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-xs font-medium mb-6 line-clamp-2 leading-relaxed">
                      {path.description}
                    </p>

                    <div className="flex items-center gap-6 mb-8 pt-4 border-t border-slate-50 dark:border-slate-800">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Kurslar</span>
                        <span className="font-black text-sm">{path.totalCourses} Eğitim</span>
                      </div>
                      <div className="w-px h-6 bg-slate-100 dark:bg-slate-800" />
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Kayıt</span>
                        <span className="font-black text-sm">0 Öğrenci</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                       <Link 
                        to={`/teacher/learning-path-builder/${path.id}`}
                        className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 py-3 rounded-xl text-[10px] font-black flex items-center justify-center gap-2 transition-all"
                       >
                         <Edit3 size={14} /> DÜZENLE
                       </Link>
                       <button 
                        onClick={() => handleDelete(path.id)}
                        className="w-12 bg-red-50 dark:bg-red-950/20 text-red-500 hover:bg-red-500 hover:text-white transition-all rounded-xl flex items-center justify-center"
                       >
                         <Trash2 size={14} />
                       </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-center py-20 bg-white dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[3rem]">
            <Layers className="mx-auto text-slate-200 dark:text-slate-800 mb-6" size={64} />
            <h2 className="text-2xl font-black mb-2">Yol Haritası Bulunamadı</h2>
            <p className="text-slate-500 mb-8 max-w-sm mx-auto">Henüz bir yol haritası oluşturmamışsınız veya aramanızla eşleşen sonuç yok.</p>
            <Link 
              to="/teacher/learning-path-builder"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-2xl font-black text-sm inline-flex items-center gap-2"
            >
              <PlusCircle size={20} /> İlk Yol Haritanı Oluştur
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
