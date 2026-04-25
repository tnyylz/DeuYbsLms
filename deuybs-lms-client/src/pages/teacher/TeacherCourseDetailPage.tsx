import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BookOpen, Zap, ChevronLeft, Clock, Target, Info, Edit3, PlusCircle, Save, X, Trash2, Image as ImageIcon } from 'lucide-react';
import { getCourseDetailApi } from '../../api/courses.api';
import { updateCourseApi } from '../../api/teacher.api';
import { getFileUrl } from '../../utils/fileUtils';
import ThemeToggle from '../../components/shared/ThemeToggle';
import type { CourseDetailDto, LessonDto } from '../../types';
import toast from 'react-hot-toast';

export default function TeacherCourseDetailPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();

  const [course, setCourse] = useState<CourseDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Inline edit states
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<CourseDetailDto>>({});

  const fetchData = async () => {
    if (!courseId) return;
    try {
      const courseData = await getCourseDetailApi(courseId);
      setCourse(courseData);
      setEditValues({
        title: courseData.title,
        description: courseData.description,
        level: courseData.level,
        totalXpReward: courseData.totalXpReward,
        tags: courseData.tags
      });
    } catch (err) {
      console.error(err);
      toast.error('Kurs bilgileri yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [courseId]);

  const handleSaveField = async (field: keyof CourseDetailDto) => {
    if (!courseId) return;
    try {
      setLoading(true);
      // Construct payload for CreateCourseRequest expected by backend
      const payload = {
        title: editValues.title || '',
        description: editValues.description || '',
        level: editValues.level || '',
        totalXpReward: editValues.totalXpReward || 500,
        tags: editValues.tags || [],
        thumbnailUrl: course?.thumbnailUrl,
        isPublished: course?.isPublished || false
      };
      
      await updateCourseApi(courseId, payload);
      toast.success('Başarıyla güncellendi.');
      setEditingField(null);
      await fetchData();
    } catch (err) {
      toast.error('Güncelleme başarısız oldu.');
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePublish = async () => {
    if (!courseId || !course) return;
    try {
      setLoading(true);
      const payload = {
        title: course.title,
        description: course.description,
        level: course.level,
        totalXpReward: course.totalXpReward,
        tags: course.tags,
        thumbnailUrl: course.thumbnailUrl,
        isPublished: !course.isPublished
      };
      await updateCourseApi(courseId, payload);
      toast.success(course.isPublished ? 'Kurs taslak moduna alındı.' : 'Kurs yayına alındı!');
      await fetchData();
    } catch {
      toast.error('Durum güncellenemedi.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !course) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center bg-white dark:bg-slate-900 p-12 rounded-[32px] shadow-xl border border-slate-200 dark:border-slate-800 max-w-md mx-6">
          <BookOpen className="text-slate-200 dark:text-slate-800 mx-auto mb-6" size={64} />
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Kurs Bulunamadı</h2>
          <button onClick={() => navigate('/teacher/dashboard')} className="mt-6 text-indigo-600 dark:text-indigo-400 font-bold hover:underline">Panele Dön</button>
        </div>
      </div>
    );
  }

  const totalDurationStr = (() => {
    const totalSec = course.lessons.reduce((acc: number, curr: LessonDto) => acc + curr.durationInSeconds, 0);
    const min = Math.ceil(totalSec / 60);
    if (min < 60) return `${min} dakika`;
    return `${Math.floor(min / 60)} saat ${min % 60} dakika`;
  })();

  const renderEditableText = (field: keyof CourseDetailDto, value: any, className: string, isMultiline = false) => {
    if (editingField === field) {
      return (
        <div className="flex items-start gap-2 w-full mt-2">
          {field === 'level' ? (
            <select
              className={`flex-1 border border-indigo-300 dark:border-indigo-600 rounded-xl p-3 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none ${className}`}
              value={editValues.level as string}
              onChange={(e) => setEditValues({ ...editValues, level: e.target.value })}
            >
              <option value="Beginner">Başlangıç</option>
              <option value="Intermediate">Orta</option>
              <option value="Advanced">İleri Seviye</option>
            </select>
          ) : field === 'totalXpReward' ? (
             <div className="flex items-center gap-3 w-full bg-white dark:bg-slate-800 border border-indigo-300 dark:border-indigo-600 rounded-xl px-4 py-2 flex-1">
                <button onClick={() => setEditValues({...editValues, totalXpReward: Math.max(10, (editValues.totalXpReward as number || 0) - 10)})} className="w-8 h-8 flex items-center justify-center bg-slate-100 dark:bg-slate-900 rounded-lg shadow-sm hover:text-indigo-600 transition-colors font-bold text-lg">-</button>
                <div className="flex-1 text-center font-black">{editValues.totalXpReward as number}</div>
                <button onClick={() => setEditValues({...editValues, totalXpReward: (editValues.totalXpReward as number || 0) + 10})} className="w-8 h-8 flex items-center justify-center bg-slate-100 dark:bg-slate-900 rounded-lg shadow-sm hover:text-indigo-600 transition-colors font-bold text-lg">+</button>
             </div>
          ) : isMultiline ? (
            <textarea
              className={`flex-1 border border-indigo-300 dark:border-indigo-600 rounded-xl p-3 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none ${className}`}
              value={editValues[field] as string}
              onChange={(e) => setEditValues({ ...editValues, [field]: e.target.value })}
              rows={4}
            />
          ) : (
            <input
              type="text"
              className={`flex-1 border border-indigo-300 dark:border-indigo-600 rounded-xl p-3 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none ${className}`}
              value={editValues[field] as any}
              onChange={(e) => setEditValues({ ...editValues, [field]: e.target.value })}
            />
          )}
          <div className="flex flex-col gap-1">
            <button onClick={() => handleSaveField(field)} className="p-2 bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-lg hover:bg-emerald-200 transition-colors"><Save size={18} /></button>
            <button onClick={() => setEditingField(null)} className="p-2 bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 rounded-lg hover:bg-slate-200 transition-colors"><X size={18} /></button>
          </div>
        </div>
      );
    }
    
    return (
      <div className={`group flex items-start justify-between cursor-pointer relative ${className}`} onClick={() => setEditingField(field)}>
        <span>{value}</span>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-md text-indigo-600 dark:text-indigo-400">
          <Edit3 size={16} />
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-sans pb-20 transition-colors duration-300">
      <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-6 py-4 shadow-sm sticky top-0 z-50 transition-colors">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/teacher/dashboard')} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all cursor-pointer">
              <ChevronLeft size={20} />
            </button>
            <div className="flex items-center gap-2">
              <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none">
                <BookOpen className="text-white" size={20} />
              </div>
              <span className="font-bold tracking-tight text-slate-900 dark:text-white text-xl">
                ÖĞRETMEN <span className="text-indigo-600 dark:text-indigo-400">PANELİ</span>
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(`/teacher/course-builder/${courseId}`)} className="text-sm font-bold text-slate-500 hover:text-indigo-600 flex items-center gap-2">
              <Edit3 size={16} /> Temel Ayarlara Git
            </button>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 pt-12">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <div className="space-y-6">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center">
                   {renderEditableText('level', course.level, 'px-3 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded-lg uppercase tracking-wider border border-indigo-100/50')}
                </div>
                <div className="flex items-center">
                  {renderEditableText('totalXpReward', `${course.totalXpReward} XP`, 'px-3 py-1 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[10px] font-bold rounded-lg uppercase tracking-wider border border-amber-100/50 dark:border-amber-800/50 flex items-center gap-1')}
                </div>
              </div>
              
              <div className="w-full">
                {renderEditableText('title', course.title, 'text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight')}
              </div>

              <div className="flex flex-wrap items-center gap-8 py-2 border-y border-slate-200/60 dark:border-slate-800/60">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-100 dark:border-indigo-800">
                    {course.teacherName.charAt(0)}
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold italic">Eğitmen (Siz)</p>
                    <p className="font-bold text-slate-900 dark:text-white">{course.teacherName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-sm font-bold text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-2"><BookOpen size={18} className="text-indigo-500 dark:text-indigo-400"/> {course.lessons.length} Ders</span>
                  <span className="flex items-center gap-2"><Clock size={18} className="text-indigo-500 dark:text-indigo-400"/> {totalDurationStr}</span>
                </div>
              </div>
            </div>

            {course.thumbnailUrl ? (
              <div className="w-full h-80 rounded-[40px] overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl transition-colors relative group">
                 <img src={getFileUrl(course.thumbnailUrl)} alt={course.title} className="w-full h-full object-cover" />
                 <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button onClick={() => navigate(`/teacher/course-builder/${courseId}`)} className="bg-white text-slate-900 px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-xl hover:scale-105 transition-transform"><ImageIcon size={20}/> Kapağı Değiştir (Temel Ayarlar)</button>
                 </div>
              </div>
            ) : null}

            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400">
                  <Info size={20} />
                </div>
                Kurs Hakkında
              </h2>
              <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 md:p-10 border border-slate-200 dark:border-slate-800 shadow-sm leading-relaxed text-lg text-slate-600 dark:text-slate-400 whitespace-pre-wrap transition-colors">
                {renderEditableText('description', course.description, 'w-full', true)}
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                  <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400">
                    <Target size={20} />
                  </div>
                  Müfredat Yönetimi
                </h2>
              </div>
              <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
                {course.lessons.map((lesson: LessonDto) => {
                   return (
                    <div 
                      key={lesson.id} 
                      className={`p-6 flex items-center gap-5 transition-all outline-none border-b border-slate-100 dark:border-slate-800`}
                    >
                        <div className={`w-10 h-10 rounded-2xl border font-bold flex items-center justify-center shrink-0 transition-colors bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500`}>
                          {lesson.orderIndex}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className={`font-bold transition-colors text-slate-800 dark:text-slate-200`}>{lesson.title}</h3>
                          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 flex items-center gap-3 font-semibold">
                            <span className="flex items-center gap-1"><Clock size={12}/> {Math.ceil(lesson.durationInSeconds / 60)} dk</span>
                            {lesson.hasQuiz && <span className="text-indigo-500 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/40 px-1.5 rounded-md">Quiz</span>}
                            <span className="text-amber-500 dark:text-amber-400">+{lesson.xpReward} XP</span>
                          </p>
                        </div>
                        <div className="flex gap-2">
                           <button onClick={() => navigate(`/teacher/course/${courseId}/lesson/${lesson.id}`)} className="p-2 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-xl transition-colors">
                              <Edit3 size={18} />
                           </button>
                           <button className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-colors">
                              <Trash2 size={18} />
                           </button>
                        </div>
                    </div>
                  );
                })}
                {course.lessons.length === 0 && (
                   <div className="p-10 text-center text-slate-400 font-medium">Henüz ders eklenmemiş.</div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="sticky top-28 bg-white dark:bg-slate-900 rounded-[40px] p-8 border border-slate-200 dark:border-slate-800 shadow-2xl shadow-indigo-100/50 dark:shadow-none space-y-8 overflow-hidden relative transition-colors">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 dark:bg-indigo-600/10 rounded-full blur-3xl -mr-16 -mt-16 opacity-50"></div>
              
              <div className="relative text-center space-y-2">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 dark:text-indigo-300">İçerik Stüdyosu</p>
                <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Eğitim Yönetimi</h3>
                <p className="text-slate-400 dark:text-slate-500 text-sm font-medium pt-2">
                  Kursunuza yeni dersler, videolar veya makaleler ekleyin.
                </p>
              </div>

              <div className="relative space-y-4 text-center">
                  <button 
                    onClick={() => navigate(`/teacher/course/${courseId}/lesson/new`)}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-5 px-6 rounded-[24px] transition-all flex items-center justify-center gap-3 shadow-xl shadow-indigo-200 dark:shadow-none hover:-translate-y-1 relative group"
                  >
                    <PlusCircle size={20} />
                    <span>Yeni Ders Ekle</span>
                  </button>
                  
                  <button 
                    onClick={handleTogglePublish}
                    className={`w-full font-bold py-4 px-6 rounded-[24px] transition-all flex items-center justify-center gap-3 ${course.isPublished ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-800' : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-800'}`}
                  >
                    {course.isPublished ? 'Taslağa Çevir' : 'Yayına Al'}
                  </button>
              </div>

              <div className="relative pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center gap-8">
                 <div className="text-center">
                    <p className="text-xl font-bold text-slate-800 dark:text-white">{course.lessons.length}</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">Ders</p>
                 </div>
                 <div className="w-px h-8 bg-slate-100 dark:bg-slate-800"></div>
                 <div className="text-center">
                    <p className="text-xl font-bold text-slate-800 dark:text-white">{Math.ceil(course.lessons.reduce((acc: number, c: LessonDto) => acc + c.durationInSeconds, 0) / 3600)}</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">Saat</p>
                 </div>
                 <div className="w-px h-8 bg-slate-100 dark:bg-slate-800"></div>
                 <div className="text-center">
                    <p className="text-xl font-bold text-slate-800 dark:text-white">{course.totalXpReward}</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">XP</p>
                 </div>
              </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-[32px] p-6 border border-amber-100/50 dark:border-amber-800/50 flex items-start gap-4 transition-colors">
               <div className="bg-white dark:bg-slate-800 p-2 rounded-xl text-amber-500 dark:text-amber-400 shadow-sm shrink-0 transition-colors">
                  <Zap size={20} fill="currentColor" />
               </div>
               <div>
                  <p className="font-bold text-amber-900 dark:text-amber-200 text-sm">Zengin İçerik Sunun</p>
                  <p className="text-xs text-amber-700 dark:text-amber-400 mt-1 leading-relaxed">Öğrencileriniz için videoların yanı sıra PDF dokümanları veya makaleler de ekleyebilirsiniz.</p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
