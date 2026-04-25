import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ChevronLeft, 
  Save, 
  Plus, 
  Trash2, 
  GripVertical, 
  Search, 
  BookOpen, 
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Layers
} from 'lucide-react';
import { 
  createLearningPathApi, 
  updateLearningPathApi,
  getLearningPathByIdApi
} from '../../api/learningPath.api';
import { getCoursesApi } from '../../api/courses.api';
import { uploadThumbnailApi } from '../../api/teacher.api';
import { getFileUrl } from '../../utils/fileUtils';
import type { CourseDto } from '../../types';
import { Reorder } from 'framer-motion';
import toast from 'react-hot-toast';

interface SelectedCourse {
    id: string;
    title: string;
    thumbnailUrl?: string;
}

export default function LearningPathBuilderPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  
  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [isPublished, setIsPublished] = useState(false);
  const [selectedCourses, setSelectedCourses] = useState<SelectedCourse[]>([]);

  // Selection state
  const [allCourses, setAllCourses] = useState<CourseDto[]>([]);
  const [courseSearch, setCourseSearch] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const coursesData = await getCoursesApi();
        setAllCourses(coursesData);

        if (isEdit) {
          const path = await getLearningPathByIdApi(id);
          setTitle(path.title);
          setDescription(path.description);
          setDifficulty(path.difficulty);
          setThumbnailUrl(path.thumbnailUrl || null);
          setIsPublished(path.isPublished);
          
          const mapped = path.courses.map(c => ({
              id: c.courseId,
              title: c.courseTitle,
              thumbnailUrl: c.thumbnailUrl
          }));
          setSelectedCourses(mapped);
        }
      } catch (err) {
        toast.error('Veriler yüklenemedi.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, isEdit]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const url = await uploadThumbnailApi(file);
      setThumbnailUrl(url);
      toast.success('Görsel yüklendi.');
    } catch (err) {
      toast.error('Yükleme başarısız.');
    } finally {
      setUploading(false);
    }
  };

  const toggleCourse = (course: CourseDto) => {
     if (selectedCourses.some(c => c.id === course.id)) {
        setSelectedCourses(selectedCourses.filter(c => c.id !== course.id));
     } else {
        setSelectedCourses([...selectedCourses, {
            id: course.id,
            title: course.title,
            thumbnailUrl: course.thumbnailUrl
        }]);
     }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || selectedCourses.length === 0) {
        toast.error('Lütfen tüm zorunlu alanları doldurun ve en az bir kurs ekleyin.');
        return;
    }

    setSaving(true);
    const payload = {
        title,
        description,
        difficulty,
        thumbnailUrl,
        isPublished,
        courseIds: selectedCourses.map(c => c.id)
    };

    try {
        if (isEdit) {
            await updateLearningPathApi(id!, payload);
            toast.success('Yol haritası güncellendi!');
        } else {
            await createLearningPathApi(payload);
            toast.success('Yeni yol haritası oluşturuldu!');
        }
        navigate('/teacher/learning-paths');
    } catch (err) {
        toast.error('Kayıt başarısız.');
    } finally {
        setSaving(false);
    }
  };

  const filteredCatalog = allCourses.filter(c => 
    c.title.toLowerCase().includes(courseSearch.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-20">
      <nav className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl sticky top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/teacher/learning-paths')}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-500 transition-all"
            >
              <ChevronLeft size={20} />
            </button>
            <h1 className="text-xl font-black uppercase tracking-tight">
              {isEdit ? 'Yol Haritasını Düzenle' : 'Yeni Yol Haritası'}
            </h1>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white px-6 py-2.5 rounded-xl font-black text-sm flex items-center gap-2 shadow-lg shadow-indigo-600/20"
          >
            {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={18} />}
            {isEdit ? 'Değişiklikleri Kaydet' : 'Yol Haritasını Oluştur'}
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left: General Info */}
          <div className="lg:col-span-4 space-y-8">
             <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
                <h2 className="text-lg font-black mb-6 flex items-center gap-2">
                  <ImageIcon size={20} className="text-indigo-600" /> Kapak Görseli
                </h2>
                <div 
                    className="relative aspect-video bg-slate-50 dark:bg-slate-800 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 overflow-hidden group cursor-pointer"
                    onClick={() => document.getElementById('thumb-upload')?.click()}
                >
                    {uploading ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm z-10">
                            <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : thumbnailUrl ? (
                        <img src={getFileUrl(thumbnailUrl)} className="w-full h-full object-cover" />
                    ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 p-4 text-center">
                            <Plus size={32} className="mb-2 opacity-50" />
                            <p className="text-xs font-bold uppercase tracking-widest">Görsel Yükle</p>
                        </div>
                    )}
                    <input type="file" id="thumb-upload" hidden accept="image/*" onChange={handleFileUpload} />
                </div>
             </div>

             <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm space-y-6">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Başlık</label>
                  <input 
                    type="text" 
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-transparent rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
                    placeholder="Örn: Frontend Developer Patikası"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Açıklama</label>
                  <textarea 
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    rows={4}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-transparent rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-600 outline-none transition-all resize-none"
                    placeholder="Bu yolun amacını ve neler kazandıracağını anlat..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Zorluk Seviyesi</label>
                  <select 
                    value={difficulty}
                    onChange={e => setDifficulty(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-600 outline-none transition-all cursor-pointer appearance-none"
                  >
                    <option value="Beginner">Başlangıç</option>
                    <option value="Intermediate">Orta (Intermediate)</option>
                    <option value="Advanced">İleri Seviye (Advanced)</option>
                  </select>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                    <label className="flex items-center gap-3 cursor-pointer group">
                        <div 
                            onClick={() => setIsPublished(!isPublished)}
                            className={`w-12 h-6 rounded-full transition-all relative ${isPublished ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'}`}
                        >
                            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${isPublished ? 'right-1' : 'left-1'}`} />
                        </div>
                        <span className="text-sm font-bold">Yayına Al</span>
                    </label>
                </div>
             </div>
          </div>

          {/* Right: Steps & Catalog */}
          <div className="lg:col-span-8 flex flex-col md:flex-row gap-8">
             {/* Selected Courses (The Path) */}
             <div className="flex-1 space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-black flex items-center gap-2">
                        <Layers size={22} className="text-indigo-600" /> Yol Akışı
                    </h2>
                    <span className="text-xs font-bold text-slate-400">{selectedCourses.length} Kurs Seçildi</span>
                </div>

                <Reorder.Group axis="y" values={selectedCourses} onReorder={setSelectedCourses} className="space-y-3">
                    {selectedCourses.map((course) => (
                        <Reorder.Item 
                            key={course.id} 
                            value={course}
                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center gap-4 cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md transition-all group"
                        >
                            <GripVertical className="text-slate-300 group-hover:text-indigo-400" size={20} />
                            <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-lg overflow-hidden flex-shrink-0">
                                {course.thumbnailUrl ? (
                                    <img src={getFileUrl(course.thumbnailUrl)} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-300"><BookOpen size={16} /></div>
                                )}
                            </div>
                            <span className="flex-1 text-sm font-bold truncate uppercase tracking-tight">{course.title}</span>
                            <button 
                                onClick={() => toggleCourse(course as any)}
                                className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                            >
                                <Trash2 size={18} />
                            </button>
                        </Reorder.Item>
                    ))}
                    {selectedCourses.length === 0 && (
                        <div className="text-center py-20 bg-white dark:bg-slate-900 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[2rem] text-slate-400">
                             <div className="mb-4 flex justify-center"><AlertCircle size={40} className="opacity-20" /></div>
                             <p className="text-xs font-bold uppercase tracking-widest">Henüz Akışa Kurs Eklenmedi</p>
                             <p className="text-[10px] mt-1 opacity-60">Sağdaki katalogdan kurs seçerek başlayın.</p>
                        </div>
                    )}
                </Reorder.Group>
             </div>

             {/* Catalog Selection */}
             <div className="w-full md:w-80 flex-shrink-0 space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-black">Kurs Kataloğu</h2>
                </div>

                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={14} />
                    <input 
                        type="text" 
                        placeholder="Kurs ara..."
                        value={courseSearch}
                        onChange={e => setCourseSearch(e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs focus:ring-2 focus:ring-indigo-600 outline-none shadow-sm"
                    />
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] overflow-hidden max-h-[600px] overflow-y-auto scrollbar-hide shadow-sm">
                    {filteredCatalog.map((course) => {
                        const isSelected = selectedCourses.some(c => c.id === course.id);
                        return (
                            <div 
                                key={course.id}
                                onClick={() => toggleCourse(course)}
                                className={`p-4 border-b border-slate-50 dark:border-slate-800/50 flex items-center gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all ${isSelected ? 'opacity-50' : ''}`}
                            >
                                <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-lg overflow-hidden flex-shrink-0">
                                    {course.thumbnailUrl ? (
                                        <img src={getFileUrl(course.thumbnailUrl)} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-300"><BookOpen size={16} /></div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[11px] font-black uppercase tracking-tight truncate">{course.title}</p>
                                    <p className="text-[9px] text-slate-400 font-bold">{course.teacherName}</p>
                                </div>
                                {isSelected ? (
                                    <CheckCircle2 size={16} className="text-indigo-600" />
                                ) : (
                                    <Plus size={16} className="text-slate-300" />
                                )}
                            </div>
                        );
                    })}
                </div>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}
