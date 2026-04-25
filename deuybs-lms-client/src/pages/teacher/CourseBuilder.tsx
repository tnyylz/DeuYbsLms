import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BookOpen, ChevronLeft, Loader2, Image as ImageIcon, Upload, X, Save, Zap, Trophy, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeToggle from '../../components/shared/ThemeToggle';
import { updateCourseApi, uploadThumbnailApi } from '../../api/teacher.api';
import { createCourseApi, getCourseDetailApi } from '../../api/courses.api';
import { getFileUrl } from '../../utils/fileUtils';
import toast from 'react-hot-toast';

export default function CourseBuilder() {
  const { courseId: existingCourseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Course State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [level, setLevel] = useState('Beginner');
  const [totalXpReward, setTotalXpReward] = useState(500);
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isPublished, setIsPublished] = useState(false);

  useEffect(() => {
    if (existingCourseId) {
      loadCourseData(existingCourseId);
    }
  }, [existingCourseId]);

  const loadCourseData = async (id: string) => {
    setLoading(true);
    try {
      const course = await getCourseDetailApi(id);
      setTitle(course.title);
      setDescription(course.description);
      setLevel(course.level);
      setTotalXpReward(course.totalXpReward);
      setThumbnailUrl(course.thumbnailUrl || '');
      setTags(course.tags || []);
      // We don't load published status from getCourseDetailApi as it might not be included, but usually it is. 
      // Assuming draft/published handled in detail page later.
    } catch (err) {
      setError('Kurs bilgileri yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError('');
    try {
      const url = await uploadThumbnailApi(file);
      setThumbnailUrl(url);
      toast.success('Görsel başarıyla yüklendi.');
    } catch (err: any) {
      setError(err.response?.data || 'Görsel yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  const handleSaveCourse = async () => {
    if (!title) { setError('Lütfen kurs adı giriniz.'); return; }
    
    setLoading(true);
    setError('');
    try {
      const courseData = { title, description, level, totalXpReward, thumbnailUrl, tags, isPublished };
      if (existingCourseId) {
        await updateCourseApi(existingCourseId, courseData);
        toast.success('Kurs güncellendi.');
        navigate(`/teacher/course/${existingCourseId}`);
      } else {
        const newId = await createCourseApi(courseData);
        toast.success('Kurs başarıyla oluşturuldu! Şimdi detayları düzenleyebilirsiniz.');
        navigate(`/teacher/course/${newId}`);
      }
    } catch (err: any) {
      console.error('Course save error:', err);
      const serverMsg = err.response?.data?.errorMessage || err.response?.data?.message || err.response?.data;
      setError(typeof serverMsg === 'string' ? serverMsg : 'Kurs kaydedilemedi.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-indigo-100">
      <nav className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl px-6 py-4 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/teacher/dashboard')} className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-300 hover:border-indigo-100 dark:hover:border-indigo-900 transition-all">
              <ChevronLeft size={20} />
            </button>
            <div className="flex items-center gap-2">
              <BookOpen className="text-indigo-600 dark:text-indigo-400" size={20} />
              <span className="font-black tracking-tight text-lg uppercase">{existingCourseId ? 'Kursu Düzenle' : 'Yeni Kurs Oluştur'}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50 text-red-600 dark:text-red-400 px-6 py-4 rounded-3xl mb-8 flex items-center gap-3 font-bold shadow-sm">
              <X size={18} /> {error}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-10 rounded-[2.5rem] shadow-sm">
              <h2 className="text-2xl font-black mb-8 flex items-center gap-3 text-slate-900 dark:text-slate-100">
                <span className="w-2 h-8 bg-indigo-600 rounded-full" />
                TEMEL BİLGİLER
              </h2>
              <div className="space-y-8">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 mb-2 uppercase tracking-widest">Kurs Başlığı</label>
                  <input 
                    type="text" 
                    value={title} 
                    onChange={e => setTitle(e.target.value)} 
                    placeholder="Örn: Modern İşletme Yönetimi" 
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-6 py-4 text-slate-900 dark:text-slate-100 font-bold focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-600 transition-all outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 mb-2 uppercase tracking-widest">Açıklama</label>
                  <textarea 
                    value={description} 
                    onChange={e => setDescription(e.target.value)} 
                    rows={5} 
                    placeholder="Öğrenciler bu kursta neler öğrenecek?" 
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-6 py-4 text-slate-900 dark:text-slate-100 font-bold focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-600 transition-all outline-none resize-none" 
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 mb-2 uppercase tracking-widest">Zorluk Seviyesi</label>
                    <select 
                      value={level} 
                      onChange={e => setLevel(e.target.value)} 
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-6 py-4 text-slate-900 dark:text-slate-100 font-bold focus:border-indigo-600 transition-all outline-none appearance-none cursor-pointer"
                    >
                      <option value="Beginner">Başlangıç</option>
                      <option value="Intermediate">Orta</option>
                      <option value="Advanced">İleri Seviye</option>
                    </select>
                  </div>
                  <div className="md:col-span-2 bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-8">
                        <div className="flex items-center gap-4">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500
                                ${totalXpReward >= 2500 ? 'bg-amber-100 text-amber-600 shadow-xl shadow-amber-500/20 rotate-12' : 
                                  totalXpReward >= 1000 ? 'bg-indigo-100 text-indigo-600 shadow-lg shadow-indigo-500/20 rotate-6' : 
                                  'bg-slate-100 text-slate-500'}`}>
                                {totalXpReward >= 2500 ? <Trophy size={28} /> : 
                                 totalXpReward >= 1000 ? <Sparkles size={28} /> : 
                                 <Zap size={28} />}
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 mb-1 uppercase tracking-widest">Kurs Bitirme Ödülü</label>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white transition-all">{totalXpReward}</span>
                                    <span className="text-xs font-black text-slate-400">XP</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            {[500, 1000, 2500, 5000].map(val => (
                                <button
                                    key={val}
                                    onClick={() => setTotalXpReward(val)}
                                    className={`px-4 py-2 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all
                                        ${totalXpReward === val ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'bg-white dark:bg-slate-900 text-slate-500 hover:border-indigo-400 border border-slate-200 dark:border-slate-800'}`}
                                >
                                    {val}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="relative pt-2 px-1">
                        <input 
                            type="range" 
                            min="100" 
                            max="10000" 
                            step="100"
                            value={totalXpReward} 
                            onChange={e => setTotalXpReward(+e.target.value)} 
                            className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer accent-indigo-600"
                        />
                        <div className="flex justify-between mt-2 px-1">
                            <span className="text-[10px] font-black text-slate-400">100 XP</span>
                            <span className="text-[10px] font-black text-slate-400">10,000 XP</span>
                        </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-10 rounded-[2.5rem] shadow-sm">
              <h2 className="text-2xl font-black mb-8 flex items-center gap-3 text-slate-900 dark:text-slate-100">
                <span className="w-2 h-8 bg-indigo-600 rounded-full" />
                ETİKETLER
              </h2>
              <div className="flex flex-wrap gap-2 mb-6">
                {tags.map((tag, i) => (
                  <span key={i} className="bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 text-indigo-600 dark:text-indigo-400 px-4 py-2 rounded-xl text-sm font-black flex items-center gap-2 group">
                    {tag}
                    <button onClick={() => removeTag(i)} className="text-indigo-300 dark:text-indigo-700 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors"><X size={14} /></button>
                  </span>
                ))}
              </div>
              <div className="flex gap-3">
                <input 
                  type="text" 
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addTag()}
                  placeholder="Etiket ekle (Örn: Finans, Java...)" 
                  className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-6 py-4 text-slate-900 dark:text-slate-100 font-bold focus:border-indigo-600 outline-none transition-all" 
                />
                <button onClick={addTag} className="bg-slate-900 dark:bg-indigo-600 text-white hover:bg-black dark:hover:bg-indigo-700 transition-all px-8 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-slate-900/10 dark:shadow-indigo-600/10">Ekle</button>
              </div>
            </section>
          </div>

          <div className="space-y-8">
            <section className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-10 rounded-[2.5rem] text-center shadow-sm overflow-hidden">
              <h2 className="text-2xl font-black mb-8 text-left flex items-center gap-3 uppercase tracking-tighter text-slate-900 dark:text-slate-100">
                <span className="w-2 h-8 bg-indigo-600 rounded-full" />
                Kapak
              </h2>
              
              <div className="relative group">
                <label className="aspect-video bg-slate-50 dark:bg-slate-800 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center overflow-hidden transition-all hover:border-indigo-400 cursor-pointer block relative">
                  {thumbnailUrl ? (
                    <>
                      <img src={getFileUrl(thumbnailUrl)} alt="Thumbnail" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                      <div className="absolute inset-0 bg-indigo-600/20 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white font-black uppercase tracking-widest text-xs gap-3">
                         <div className="bg-white/20 p-4 rounded-full backdrop-blur-md">
                            <Upload size={32} />
                         </div>
                         Görseli Değiştir
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center mb-6 text-slate-300 dark:text-slate-700 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors shadow-sm">
                        <ImageIcon size={32} />
                      </div>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest mb-4">Min 1280x720 • .JPG, .PNG</p>
                      <span className="bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 border-2 border-indigo-600 dark:border-indigo-500 px-8 py-3.5 rounded-2xl text-sm font-black shadow-lg shadow-indigo-600/5 dark:shadow-indigo-600/10 uppercase tracking-widest">Görsel Seç</span>
                    </>
                  )}
                  <input ref={fileInputRef} type="file" hidden accept="image/*" onChange={handleFileChange} />
                </label>

                {thumbnailUrl && (
                  <button 
                    type="button"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setThumbnailUrl(''); }}
                    className="absolute -top-3 -right-3 w-10 h-10 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all z-20"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>

              {loading && (
                 <div className="absolute inset-0 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm flex flex-col items-center justify-center z-50 rounded-[2.5rem] pointer-events-none">
                    <Loader2 size={32} className="text-indigo-600 animate-spin mb-2" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Yükleniyor...</span>
                 </div>
              )}
            </section>

            <button onClick={handleSaveCourse} disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white transition-all py-6 rounded-[2.5rem] font-black text-xl flex items-center justify-center gap-3 shadow-2xl shadow-indigo-600/30 uppercase tracking-widest">
              {loading ? <Loader2 size={24} className="animate-spin" /> : <><Save size={24} /> Devam Et</>}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}