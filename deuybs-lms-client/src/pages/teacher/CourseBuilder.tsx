import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BookOpen, ChevronLeft, PlusCircle, Trash2, Loader2, CheckCircle, HelpCircle, Image as ImageIcon, Upload, X, GripVertical, Save, Send } from 'lucide-react';
import { motion, Reorder, AnimatePresence } from 'framer-motion';
import { 
  getTeacherDashboardApi, 
  updateCourseApi, 
  uploadThumbnailApi, 
  createLessonApi, 
  updateLessonApi, 
  deleteLessonApi, 
  reorderLessonsApi, 
  createOrUpdateQuizApi 
} from '../../api/teacher.api';
import { getCourseDetailApi, createCourseApi } from '../../api/courses.api';
import { getFileUrl } from '../../utils/fileUtils';
import type { CreateLessonRequest, CreateQuestionRequest, CreateOptionRequest, CreateQuizRequest } from '../../types';

interface LessonForm extends CreateLessonRequest {
  id?: string;
  hasQuiz: boolean;
  quizMinScore: number;
  questions: QuestionForm[];
  isNew?: boolean;
}

interface QuestionForm {
  id?: string;
  questionText: string;
  options: OptionForm[];
}

interface OptionForm {
  optionText: string;
  isCorrect: boolean;
}

const emptyOption = (): OptionForm => ({ optionText: '', isCorrect: false });
const emptyQuestion = (): QuestionForm => ({ questionText: '', options: [emptyOption(), emptyOption(), emptyOption(), emptyOption()] });
const emptyLesson = (order: number): LessonForm => ({
  title: '', videoUrl: '', durationInSeconds: 300, xpReward: 50, orderIndex: order,
  hasQuiz: false, quizMinScore: 70, questions: [emptyQuestion()], isNew: true
});

export default function CourseBuilder() {
  const { courseId: existingCourseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<'course' | 'lessons' | 'done'>(existingCourseId ? 'lessons' : 'course');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Course State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [level, setLevel] = useState('Beginner');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  const [courseId, setCourseId] = useState(existingCourseId || '');

  // Lessons State
  const [lessons, setLessons] = useState<LessonForm[]>([]);

  useEffect(() => {
    if (existingCourseId) {
      loadCourseData(existingCourseId);
    } else {
      setLessons([emptyLesson(0)]);
    }
  }, [existingCourseId]);

  const loadCourseData = async (id: string) => {
    setLoading(true);
    try {
      const course = await getCourseDetailApi(id);
      setTitle(course.title);
      setDescription(course.description);
      setLevel(course.level);
      setThumbnailUrl(course.thumbnailUrl || '');
      
      const lessonForms: LessonForm[] = course.lessons.map((l: any) => ({
        id: l.id,
        title: l.title,
        videoUrl: l.videoUrl,
        durationInSeconds: l.durationInSeconds,
        xpReward: l.xpReward,
        orderIndex: l.orderIndex,
        hasQuiz: l.hasQuiz,
        quizMinScore: l.quizMinPassingScore || 70,
        questions: [emptyQuestion()] 
      }));
      setLessons(lessonForms.sort((a, b) => a.orderIndex - b.orderIndex));
    } catch (err) {
      setError('Kurs bilgileri yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  // Thumbnail Upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError('');
    try {
      const url = await uploadThumbnailApi(file);
      setThumbnailUrl(url);
      setSuccess('Görsel başarıyla yüklendi.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data || 'Görsel yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  // Tag Helpers
  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  // Step 1: Create/Update Course
  const handleSaveCourse = async () => {
    if (!title) { setError('Lütfen kurs adı giriniz.'); return; }
    
    setLoading(true);
    setError('');
    try {
      const courseData = { title, description, level, thumbnailUrl, tags, isPublished };
      if (courseId) {
        await updateCourseApi(courseId, courseData);
        setStep('lessons');
      } else {
        const newId = await createCourseApi(courseData);
        setCourseId(newId);
        setStep('lessons');
      }
    } catch (err: any) {
      console.error('Course save error:', err);
      const serverMsg = err.response?.data?.errorMessage || err.response?.data?.message || err.response?.data;
      setError(typeof serverMsg === 'string' ? serverMsg : 'Kurs kaydedilemedi. Lütfen tüm alanları kontrol edin.');
    } finally { setLoading(false); }
  };

  // Step 2: Lessons Management
  const updateLesson = (index: number, updates: Partial<LessonForm>) => {
    const copy = [...lessons];
    copy[index] = { ...copy[index], ...updates };
    setLessons(copy);
  };

  const deleteLesson = async (index: number) => {
    const lesson = lessons[index];
    if (!lesson.isNew && lesson.id) {
      if (!window.confirm('Bu dersi silmek istediğinize emin misiniz?')) return;
      try {
        await deleteLessonApi(lesson.id);
      } catch (err) {
        setError('Ders silinemedi.');
        return;
      }
    }
    setLessons(lessons.filter((_, i) => i !== index));
  };

  const handleReorder = (newOrder: LessonForm[]) => {
    const updated = newOrder.map((l, i) => ({ ...l, orderIndex: i }));
    setLessons(updated);
  };

  const handleSaveAll = async () => {
    setLoading(true);
    setError('');
    try {
      // 1. Reorder if needed
      const reorderData = lessons.filter(l => !l.isNew && l.id).map(l => ({ id: l.id!, orderIndex: l.orderIndex }));
      if (reorderData.length > 0) {
        await reorderLessonsApi(reorderData);
      }

      // 2. Save/Update each lesson
      for (const lesson of lessons) {
        let lId = lesson.id;
        const lessonPayload = {
          courseId,
          title: lesson.title,
          videoUrl: lesson.videoUrl,
          durationInSeconds: lesson.durationInSeconds,
          xpReward: lesson.xpReward,
          orderIndex: lesson.orderIndex
        };

        if (lesson.isNew) {
          lId = await createLessonApi(lessonPayload);
        } else if (lId) {
          await updateLessonApi(lId, lessonPayload);
        }

        if (lesson.hasQuiz && lId) {
          await createOrUpdateQuizApi({
            lessonId: lId,
            minimumPassingScore: lesson.quizMinScore,
            questions: lesson.questions.map(q => ({
              questionText: q.questionText,
              options: q.options.map(o => ({ optionText: o.optionText, isCorrect: o.isCorrect })),
            }))
          });
        }
      }
      setStep('done');
    } catch (err: any) {
      console.error('Lessons save error:', err);
      const serverMsg = err.response?.data?.errorMessage || err.response?.data?.message || err.response?.data;
      setError(typeof serverMsg === 'string' ? serverMsg : 'Bazı dersler kaydedilemedi. Lütfen zorunlu alanları (Video ID, Başlık vb.) kontrol edin.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-indigo-100">
      <nav className="border-b border-slate-200 bg-white/80 backdrop-blur-xl px-6 py-4 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/teacher/dashboard')} className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:border-indigo-100 transition-all">
              <ChevronLeft size={20} />
            </button>
            <div className="flex items-center gap-2">
              <BookOpen className="text-indigo-600" size={20} />
              <span className="font-black tracking-tight text-lg uppercase">{courseId ? 'Kursu Düzenle' : 'Yeni Kurs'}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
             <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mr-2">Aşamalar:</div>
            <div className={`w-3 h-3 rounded-full ${step === 'course' ? 'bg-indigo-600 scale-125 shadow-lg shadow-indigo-600/20' : 'bg-slate-200'}`} />
            <div className={`w-3 h-3 rounded-full ${step === 'lessons' ? 'bg-indigo-600 scale-125 shadow-lg shadow-indigo-600/20' : 'bg-slate-200'}`} />
            <div className={`w-3 h-3 rounded-full ${step === 'done' ? 'bg-indigo-600 scale-125 shadow-lg shadow-indigo-600/20' : 'bg-slate-200'}`} />
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="bg-red-50 border border-red-100 text-red-600 px-6 py-4 rounded-3xl mb-8 flex items-center gap-3 font-bold shadow-sm">
              <X size={18} /> {error}
            </motion.div>
          )}
          {success && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="bg-emerald-50 border border-emerald-100 text-emerald-600 px-6 py-4 rounded-3xl mb-8 flex items-center gap-3 font-bold shadow-sm">
              <CheckCircle size={18} /> {success}
            </motion.div>
          )}
        </AnimatePresence>

        {step === 'course' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <section className="bg-white border border-slate-200 p-10 rounded-[2.5rem] shadow-sm">
                <h2 className="text-2xl font-black mb-8 flex items-center gap-3">
                  <span className="w-2 h-8 bg-indigo-600 rounded-full" />
                  TEMEL BİLGİLER
                </h2>
                <div className="space-y-8">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">Kurs Başlığı</label>
                    <input 
                      type="text" 
                      value={title} 
                      onChange={e => setTitle(e.target.value)} 
                      placeholder="Örn: Modern İşletme Yönetimi" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 font-bold focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-600 transition-all outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">Açıklama</label>
                    <textarea 
                      value={description} 
                      onChange={e => setDescription(e.target.value)} 
                      rows={5} 
                      placeholder="Öğrenciler bu kursta neler öğrenecek?" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 font-bold focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-600 transition-all outline-none resize-none" 
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">Zorluk Seviyesi</label>
                      <select 
                        value={level} 
                        onChange={e => setLevel(e.target.value)} 
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 font-bold focus:border-indigo-600 transition-all outline-none appearance-none cursor-pointer"
                      >
                        <option value="Beginner">Başlangıç</option>
                        <option value="Intermediate">Orta</option>
                        <option value="Advanced">İleri Seviye</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">Durum</label>
                      <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-200">
                        <button 
                          onClick={() => setIsPublished(false)}
                          className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${!isPublished ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                          TASLAK
                        </button>
                        <button 
                          onClick={() => setIsPublished(true)}
                          className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${isPublished ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                          YAYINLA
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section className="bg-white border border-slate-200 p-10 rounded-[2.5rem] shadow-sm">
                <h2 className="text-2xl font-black mb-8 flex items-center gap-3">
                  <span className="w-2 h-8 bg-indigo-600 rounded-full" />
                  ETİKETLER
                </h2>
                <div className="flex flex-wrap gap-2 mb-6">
                  {tags.map((tag, i) => (
                    <span key={i} className="bg-indigo-50 border border-indigo-100 text-indigo-600 px-4 py-2 rounded-xl text-sm font-black flex items-center gap-2 group">
                      {tag}
                      <button onClick={() => removeTag(i)} className="text-indigo-300 group-hover:text-indigo-600 transition-colors"><X size={14} /></button>
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
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 font-bold focus:border-indigo-600 outline-none transition-all" 
                  />
                  <button onClick={addTag} className="bg-slate-900 text-white hover:bg-black transition-all px-8 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-slate-900/10">Ekle</button>
                </div>
              </section>
            </div>

            <div className="space-y-8">
              <section className="bg-white border border-slate-200 p-10 rounded-[2.5rem] text-center shadow-sm">
                <h2 className="text-2xl font-black mb-8 text-left flex items-center gap-3 uppercase tracking-tighter">
                  <span className="w-2 h-8 bg-indigo-600 rounded-full" />
                  Kapak
                </h2>
                <div className="aspect-video bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center overflow-hidden group relative transition-all hover:border-indigo-400">
                  {thumbnailUrl ? (
                    <>
                      <img src={getFileUrl(thumbnailUrl)} alt="Thumbnail" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                      <div className="absolute inset-0 bg-white/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                        <button onClick={() => fileInputRef.current?.click()} className="p-4 bg-white rounded-2xl shadow-xl text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all"><Upload size={24} /></button>
                        <button onClick={() => setThumbnailUrl('')} className="p-4 bg-white rounded-2xl shadow-xl text-red-600 hover:bg-red-600 hover:text-white transition-all"><Trash2 size={24} /></button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-6 text-slate-300 group-hover:text-indigo-600 transition-colors shadow-sm">
                        <ImageIcon size={32} />
                      </div>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-6">Min 1280x720 • .JPG, .PNG</p>
                      <button onClick={() => fileInputRef.current?.click()} className="bg-white text-indigo-600 border-2 border-indigo-600 hover:bg-indigo-600 hover:text-white transition-all px-8 py-3.5 rounded-2xl text-sm font-black shadow-lg shadow-indigo-600/5 uppercase tracking-widest">Seç</button>
                    </>
                  )}
                  <input ref={fileInputRef} type="file" hidden accept="image/*" onChange={handleFileChange} />
                </div>
              </section>

              <button onClick={handleSaveCourse} disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white transition-all py-6 rounded-[2.5rem] font-black text-xl flex items-center justify-center gap-3 shadow-2xl shadow-indigo-600/30 uppercase tracking-widest">
                {loading ? <Loader2 size={24} className="animate-spin" /> : <><Save size={24} /> Devam Et</>}
              </button>
            </div>
          </motion.div>
        )}

        {step === 'lessons' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
              <div>
                <h2 className="text-4xl font-black tracking-tight text-slate-900 uppercase">{title}</h2>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-sm mt-2">Müfredatı Düzenle & Dersleri Ekle</p>
              </div>
              <button 
                onClick={() => setLessons([...lessons, emptyLesson(lessons.length)])}
                className="bg-indigo-600 hover:bg-indigo-700 text-white transition-all px-8 py-4 rounded-2xl font-black flex items-center gap-3 shadow-xl shadow-indigo-600/20 uppercase tracking-widest text-sm"
              >
                <PlusCircle size={20} /> Yeni Ders
              </button>
            </div>

            <Reorder.Group axis="y" values={lessons} onReorder={handleReorder} className="space-y-8 mb-16">
              {lessons.map((lesson, index) => (
                <Reorder.Item 
                  key={index} 
                  value={lesson}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white border border-slate-200 rounded-[3rem] p-10 group relative shadow-sm hover:shadow-xl hover:shadow-indigo-600/5 transition-all"
                >
                  <div className="flex flex-col lg:flex-row gap-10 relative z-10">
                    <div className="flex-shrink-0 flex items-center gap-6 text-slate-200 group-hover:text-indigo-100 transition-colors">
                      <GripVertical size={32} className="cursor-grab active:cursor-grabbing hover:text-indigo-600 transition-colors" />
                      <div className="text-6xl font-black italic opacity-50">0{index + 1}</div>
                    </div>

                    <div className="flex-1 space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="md:col-span-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Ders Başlığı</label>
                          <input 
                            type="text" 
                            value={lesson.title} 
                            onChange={e => updateLesson(index, { title: e.target.value })} 
                            placeholder="Dersin adı..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-5 text-slate-900 font-bold focus:border-indigo-600 outline-none transition-all" 
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Video ID</label>
                          <input 
                            type="text" 
                            value={lesson.videoUrl} 
                            onChange={e => updateLesson(index, { videoUrl: e.target.value })} 
                            placeholder="Örn: YouTube ID"
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-5 text-slate-900 font-bold focus:border-indigo-600 outline-none transition-all" 
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                          <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">XP Ödülü</label>
                            <input type="number" value={lesson.xpReward} onChange={e => updateLesson(index, { xpReward: +e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-5 text-slate-900 font-bold focus:border-indigo-600 outline-none" />
                          </div>
                          <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Süre (sn)</label>
                            <input type="number" value={lesson.durationInSeconds} onChange={e => updateLesson(index, { durationInSeconds: +e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-5 text-slate-900 font-bold focus:border-indigo-600 outline-none" />
                          </div>
                        </div>
                      </div>

                      <div className="pt-8 border-t border-slate-100">
                        <div className="flex items-center justify-between mb-6">
                          <label className="flex items-center gap-4 cursor-pointer group/quiz">
                            <div className={`w-12 h-7 rounded-full transition-all relative ${lesson.hasQuiz ? 'bg-indigo-600' : 'bg-slate-200'}`}>
                              <input type="checkbox" hidden checked={lesson.hasQuiz} onChange={e => updateLesson(index, { hasQuiz: e.target.checked })} />
                              <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all shadow-md ${lesson.hasQuiz ? 'left-6' : 'left-1'}`} />
                            </div>
                            <span className="text-sm font-black text-slate-500 group-hover/quiz:text-indigo-600 transition-colors uppercase tracking-widest">Quiz Dahil Et</span>
                          </label>
                          {lesson.hasQuiz && (
                            <div className="flex items-center gap-3 bg-indigo-50 px-4 py-2 rounded-2xl border border-indigo-100">
                              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Başarı Notu:</span>
                              <input type="number" value={lesson.quizMinScore} onChange={e => updateLesson(index, { quizMinScore: +e.target.value })} className="bg-transparent w-8 text-center text-sm font-black text-indigo-600 focus:outline-none" />
                            </div>
                          )}
                        </div>
                        
                        {lesson.hasQuiz && (
                          <div className="bg-indigo-50/50 border border-dashed border-indigo-100 rounded-[2rem] p-8 text-center">
                             <HelpCircle size={24} className="text-indigo-300 mx-auto mb-4" />
                             <p className="text-indigo-600 font-black text-xs uppercase tracking-widest leading-loose">Quiz Soruları Otomatik Kaydedilecektir.<br/>Dersi kaydettiğinde temel bir set oluşur.</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex lg:flex-col gap-3">
                       <button onClick={() => deleteLesson(index)} className="w-14 h-14 bg-red-50 hover:bg-red-600 text-red-500 hover:text-white border border-red-100 rounded-2xl flex items-center justify-center transition-all shadow-sm">
                         <Trash2 size={24} />
                       </button>
                    </div>
                  </div>
                </Reorder.Item>
              ))}
            </Reorder.Group>

            <div className="sticky bottom-8 z-40 flex items-center justify-between bg-white/90 backdrop-blur-2xl border border-slate-200 p-8 rounded-[3rem] shadow-2xl shadow-indigo-600/10">
              <div className="hidden md:block">
                <p className="font-black text-2xl text-slate-900 tracking-tight">{lessons.length} DERS</p>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">Müfredat Hazır</p>
              </div>
              <div className="flex items-center gap-4 w-full md:w-auto">
                 <button onClick={() => setStep('course')} className="flex-1 md:flex-none px-10 py-5 rounded-[1.5rem] font-black text-slate-500 hover:text-indigo-600 transition-all uppercase tracking-widest text-sm">Geri Git</button>
                 <button 
                  onClick={handleSaveAll}
                  disabled={loading}
                  className="flex-[2] md:flex-none bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white transition-all px-12 py-5 rounded-[1.5rem] font-black text-lg flex items-center justify-center gap-3 shadow-xl shadow-indigo-600/20 uppercase tracking-widest"
                 >
                   {loading ? <Loader2 size={24} className="animate-spin" /> : <><Send size={24} /> KAYDET & BİTİR</>}
                 </button>
              </div>
            </div>
          </motion.div>
        )}

        {step === 'done' && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-xl mx-auto text-center py-24 bg-white border border-slate-200 rounded-[4rem] p-16 shadow-2xl shadow-indigo-600/5">
            <div className="w-28 h-28 bg-emerald-50 border-4 border-emerald-100 rounded-full flex items-center justify-center mx-auto mb-10 shadow-lg shadow-emerald-500/10">
              <CheckCircle className="text-emerald-500" size={56} />
            </div>
            <h2 className="text-5xl font-black mb-6 text-slate-900 tracking-tighter">HARİKA İŞ! 🎉</h2>
            <p className="text-slate-500 text-xl mb-12 font-medium leading-relaxed">Kursun başarıyla {isPublished ? 'yayınlandı' : 'kaydedildi'}. Öğrencilerin bu yeni bilgileri keşfetmesi için sabırsızlanıyoruz.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={() => navigate('/teacher/dashboard')} className="flex-1 bg-slate-900 text-white hover:bg-black transition-all py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-slate-900/10">Panele Git</button>
              <button onClick={() => navigate(`/teacher/analytics/${courseId}`)} className="flex-1 bg-indigo-600 text-white hover:bg-indigo-700 transition-all py-5 rounded-2xl font-black shadow-xl shadow-indigo-600/10 uppercase tracking-widest">Analitiğe Bak</button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}