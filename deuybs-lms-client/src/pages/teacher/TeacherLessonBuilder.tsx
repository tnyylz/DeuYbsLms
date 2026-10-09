import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BookOpen, ChevronLeft, Save, Video, FileDown, Loader2, CheckCircle, HelpCircle, Plus, Trash2, Check, Zap, Trophy, Sparkles } from 'lucide-react';
import ThemeToggle from '../../components/shared/ThemeToggle';
import { 
  createLessonApi, updateLessonApi, uploadDocumentApi, 
  createOrUpdateQuizApi, getQuizByLessonApi, uploadVideoToYouTubeApi,
  getLessonByIdApi
} from '../../api/teacher.api';
import type { CreateQuestionRequest } from '../../types';
import toast from 'react-hot-toast';

export default function TeacherLessonBuilder() {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId?: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'video' | 'document' | 'quiz'>('video');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [durationInSeconds, setDurationInSeconds] = useState(300);
  const [xpReward, setXpReward] = useState(50);

  // Quiz State
  const [questions, setQuestions] = useState<CreateQuestionRequest[]>([]);
  const [minPassingScore, setMinPassingScore] = useState(70);

  // Content sources
  const [videoUrl, setVideoUrl] = useState('');
  const [resourceUrl, setResourceUrl] = useState('');
  
  // For file uploads in document tab
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoFileInputRef = useRef<HTMLInputElement>(null);

  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (lessonId && courseId) {
      setLoading(true);
      
      // Doğrudan Lesson API'si ile ders bilgilerini çek
      getLessonByIdApi(lessonId)
        .then(lesson => {
          if (lesson) {
            setTitle(lesson.title || '');
            setDescription(lesson.description || '');
            setDurationInSeconds(lesson.durationInSeconds || 300);
            setXpReward(lesson.xpReward || 50);
            setVideoUrl(lesson.videoUrl || '');
            setResourceUrl(lesson.resourceUrl || '');
            
            if (lesson.videoUrl) {
              setActiveTab('video');
            } else if (lesson.resourceUrl) {
              setActiveTab('document');
            } else {
              setActiveTab('video');
            }
          }
        })
        .catch(() => toast.error('Ders bilgisi yüklenemedi.'))
        .finally(() => setLoading(false));

      // Fetch existing quiz if any
      getQuizByLessonApi(lessonId)
        .then(quiz => {
          if (quiz && quiz.questions && quiz.questions.length > 0) {
            setQuestions(quiz.questions);
            setMinPassingScore(quiz.minimumPassingScore || 70);
          }
        })
        .catch(err => console.error('Quiz yüklenirken hata:', err));
    }
  }, [lessonId, courseId]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
  
      setLoading(true);
      try {
        const url = await uploadDocumentApi(file);
        setResourceUrl(url);
        toast.success(`Dosya yüklendi: ${file.name}`);
      } catch (err: any) {
        toast.error('Görsel yüklenirken bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    };

    // Handle Video Upload to YouTube
    const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (!title) {
        toast.error('Önce bir ders başlığı girmelisiniz.');
        return;
      }

      setIsUploading(true);
      setUploadProgress(0);
      const loadingToast = toast.loading('Video YouTube\'a yükleniyor...');
      
      try {
        const result = await uploadVideoToYouTubeApi(
          file, 
          title, 
          description || `${title} ders videosu`,
          (percent) => setUploadProgress(percent)
        );
        
        setVideoUrl(result.videoUrl);
        toast.success('Video başarıyla yüklendi! ✅', { id: loadingToast });
      } catch (err: any) {
        console.error(err);
        const msg = err.response?.data || 'Video yüklenirken bir hata oluştu.';
        toast.error(`Yükleme hatası: ${msg}`, { id: loadingToast, duration: 6000 });
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
      }
    };

  const handleSave = async () => {
    if (!title) { toast.error('Lütfen ders adı giriniz.'); return; }
    if (!courseId) return;

    setLoading(true);
    try {
      const payload = {
        title,
        description,
        videoUrl: videoUrl || null,
        resourceUrl: resourceUrl || null,
        durationInSeconds,
        xpReward,
        courseId
      };

      if (lessonId) {
        await updateLessonApi(lessonId, payload);
        
        // Save quiz if exists
        if (questions.length > 0) {
            await createOrUpdateQuizApi({
                title: 'Ders Quizi',
                lessonId,
                minimumPassingScore: minPassingScore,
                questions
            });
        }
        
        toast.success('Ders ve Quiz güncellendi.');
      } else {
        const newLessonId = await createLessonApi(payload as any);
        
        // Save quiz if exists
        if (questions.length > 0) {
            await createOrUpdateQuizApi({
                title: 'Ders Quizi',
                lessonId: newLessonId,
                minimumPassingScore: minPassingScore,
                questions
            });
        }
        
        toast.success('Ders ve Quiz eklendi.');
      }
      navigate(`/teacher/course/${courseId}`);
    } catch (err: any) {
      toast.error('Ders kaydedilemedi.');
    } finally { setLoading(false); }
  };

  const addQuestion = () => {
    setQuestions([...questions, {
      questionText: '',
      options: [
        { optionText: '', isCorrect: true },
        { optionText: '', isCorrect: false }
      ]
    }]);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateQuestionText = (index: number, text: string) => {
    const newQuestions = [...questions];
    newQuestions[index].questionText = text;
    setQuestions(newQuestions);
  };

  const addOption = (qIndex: number) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options.push({ optionText: '', isCorrect: false });
    setQuestions(newQuestions);
  };

  const updateOptionText = (qIndex: number, oIndex: number, text: string) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options[oIndex].optionText = text;
    setQuestions(newQuestions);
  };

  const setCorrectOption = (qIndex: number, oIndex: number) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options.forEach((opt, i) => {
      opt.isCorrect = i === oIndex;
    });
    setQuestions(newQuestions);
  };

  const removeOption = (qIndex: number, oIndex: number) => {
    if (questions[qIndex].options.length <= 2) {
        toast.error('En az 2 seçenek olmalıdır.');
        return;
    }
    const newQuestions = [...questions];
    newQuestions[qIndex].options = newQuestions[qIndex].options.filter((_, i) => i !== oIndex);
    // Ensure at least one is correct if we removed the correct one
    if (!newQuestions[qIndex].options.some(o => o.isCorrect)) {
        newQuestions[qIndex].options[0].isCorrect = true;
    }
    setQuestions(newQuestions);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-indigo-100">
      <nav className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl px-4 sm:px-6 py-4 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
             <button onClick={() => navigate(`/teacher/course/${courseId}`)} className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-300 hover:border-indigo-100 dark:hover:border-indigo-900 transition-all">
                <ChevronLeft size={20} />
             </button>
             <div className="flex items-center gap-2">
                <BookOpen className="text-indigo-600 dark:text-indigo-400" size={20} />
                <span className="font-black tracking-tight text-base sm:text-lg uppercase">{lessonId ? 'Dersi Düzenle' : 'Yeni Ders Ekle'}</span>
             </div>
          </div>
          <div className="flex items-center gap-4">
             <ThemeToggle />
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] shadow-sm">
               <h2 className="text-2xl font-black mb-8 flex items-center gap-3 text-slate-900 dark:text-slate-100">
                  <span className="w-2 h-8 bg-indigo-600 rounded-full" />
                  TEMEL BİLGİLER
               </h2>
               <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 mb-2 uppercase tracking-widest">Ders Başlığı</label>
                    <input 
                      type="text" 
                      value={title} 
                      onChange={e => setTitle(e.target.value)} 
                      placeholder="Dersin Adı..." 
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-6 py-4 text-slate-900 dark:text-slate-100 font-bold focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-600 transition-all outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 mb-2 uppercase tracking-widest">Açıklama (Opsiyonel)</label>
                    <textarea 
                      value={description} 
                      onChange={e => setDescription(e.target.value)} 
                      rows={3} 
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-6 py-4 text-slate-900 dark:text-slate-100 font-bold focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-600 transition-all outline-none resize-none" 
                    />
                  </div>
               </div>
            </section>

            <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] shadow-sm">
               <div className="flex items-center justify-between mb-8">
                 <h2 className="text-2xl font-black flex items-center gap-3 text-slate-900 dark:text-slate-100">
                    <span className="w-2 h-8 bg-indigo-600 rounded-full" />
                    İÇERİK TÜRÜ
                 </h2>
               </div>
               
               {/* Custom Tab Switcher */}
               <div className="flex bg-slate-50 dark:bg-slate-800 p-2 rounded-3xl border border-slate-200 dark:border-slate-700 mb-8">
                  <button 
                     onClick={() => setActiveTab('video')}
                     className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl text-sm font-black transition-all ${activeTab === 'video' ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xl border border-slate-200 dark:border-slate-800' : 'text-slate-400 hover:text-slate-600'}`}
                  ><Video size={18} /> Video</button>
                  <button 
                     onClick={() => setActiveTab('document')}
                     className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl text-sm font-black transition-all ${activeTab === 'document' ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xl border border-slate-200 dark:border-slate-800' : 'text-slate-400 hover:text-slate-600'}`}
                  ><FileDown size={18} /> Doküman/ZIP</button>
                  <button 
                     onClick={() => setActiveTab('quiz')}
                     className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl text-sm font-black transition-all ${activeTab === 'quiz' ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xl border border-slate-200 dark:border-slate-800' : 'text-slate-400 hover:text-slate-600'}`}
                  ><HelpCircle size={18} /> Quiz Builder</button>
               </div>

               <div className="mt-6">
                  {activeTab === 'video' && (
                     <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div className="space-y-2">
                              <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Video URL (Manuel)</label>
                              <input 
                                 type="text" 
                                 value={videoUrl} 
                                 onChange={e => setVideoUrl(e.target.value)} 
                                 placeholder="Örn: https://youtube.com/watch?v=..." 
                                 className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-6 py-4 text-slate-900 dark:text-slate-100 font-bold focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-600 transition-all outline-none" 
                              />
                           </div>
                           
                           <div className="space-y-2">
                              <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Veya Dosya Yükle (YouTube)</label>
                              <button 
                                 type="button"
                                 disabled={isUploading || loading}
                                 onClick={() => videoFileInputRef.current?.click()}
                                 className={`w-full h-[58px] border-2 border-dashed rounded-2xl flex items-center justify-center gap-3 transition-all font-bold ${isUploading ? 'border-indigo-400 bg-indigo-50 text-indigo-600' : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50 text-slate-500'}`}
                              >
                                 {isUploading ? (
                                   <Loader2 key="video-upload-loader" size={20} className="animate-spin" />
                                 ) : (
                                   <Video key="video-icon" size={20} />
                                 )}
                                 <span>{isUploading ? `Yükleniyor %${uploadProgress}` : 'Video Dosyası Seç (.mp4)'}</span>
                              </button>
                              <input 
                                 ref={videoFileInputRef}
                                 type="file" 
                                 hidden 
                                 accept="video/mp4,video/x-m4v,video/*" 
                                 onChange={handleVideoUpload} 
                              />
                           </div>
                        </div>

                        {isUploading && (
                           <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-200 dark:border-slate-700">
                              <div 
                                 className="h-full bg-indigo-600 transition-all duration-300"
                                 style={{ width: `${uploadProgress}%` }}
                              />
                           </div>
                        )}
                        
                        {videoUrl && (
                           <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/40 rounded-2xl flex items-center gap-3">
                              <CheckCircle size={18} className="text-emerald-500" />
                              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 truncate">Video Bağlantısı Hazır: {videoUrl}</span>
                           </div>
                        )}
                     </div>
                  )}

                  {activeTab === 'document' && (
                     <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col items-center justify-center p-12 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-[2rem] bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                        <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-indigo-100/50 dark:shadow-none">
                           <FileDown size={32} />
                        </div>
                        <h3 className="font-black text-xl mb-2">Dosya Yükle</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-bold text-center">PDF, DOCX veya ZIP formatındaki eğitici materyallerinizi buraya yükleyebilirsiniz.</p>
                        {resourceUrl && <div className="mt-6 px-4 py-2 bg-emerald-100 text-emerald-700 font-bold rounded-xl flex items-center gap-2"><CheckCircle size={16} /> Dosya Seçildi</div>}
                        <input ref={fileInputRef} type="file" hidden accept=".pdf,.doc,.docx,.zip,.rar" onChange={handleFileUpload} />
                     </div>
                  )}

                  {activeTab === 'quiz' && (
                      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
                         <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0 bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-3xl border border-indigo-100 dark:border-indigo-800/50">
                            <div className="text-center sm:text-left">
                                <h3 className="font-black text-indigo-900 dark:text-indigo-100 uppercase tracking-tight">Baraj Puanı Ayarı</h3>
                                <p className="text-xs text-indigo-600/60 dark:text-indigo-400/60 font-bold uppercase tracking-widest mt-1">Dersi geçmek için gereken minimum puan (%)</p>
                            </div>
                            <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-indigo-100 dark:border-indigo-900">
                                <button onClick={() => setMinPassingScore(Math.max(0, minPassingScore - 5))} className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center font-black">-</button>
                                <span className="w-12 text-center font-black text-indigo-600 dark:text-indigo-400">%{minPassingScore}</span>
                                <button onClick={() => setMinPassingScore(Math.min(100, minPassingScore + 5))} className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center font-black">+</button>
                            </div>
                         </div>

                         <div className="space-y-6">
                            {questions.map((q, qIndex) => (
                                <div key={qIndex} className="p-8 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] border border-slate-200 dark:border-slate-800 relative group/q">
                                    <button 
                                        onClick={() => removeQuestion(qIndex)}
                                        className="absolute -top-3 -right-3 w-8 h-8 bg-white dark:bg-slate-900 border border-red-100 dark:border-red-900 text-red-500 rounded-full flex items-center justify-center shadow-lg hover:bg-red-50 transition-all opacity-0 group-hover/q:opacity-100"
                                    >
                                        <Trash2 size={14} />
                                    </button>

                                    <div className="mb-6">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Soru {qIndex + 1}</label>
                                        <input 
                                            type="text" 
                                            value={q.questionText} 
                                            onChange={e => updateQuestionText(qIndex, e.target.value)}
                                            placeholder="Sorunuzu yazın..."
                                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-6 py-4 font-bold outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Seçenekler (Doğru cevabı yuvarlaktan seçin)</label>
                                        {q.options.map((opt, oIndex) => (
                                            <div key={oIndex} className="flex items-center gap-3 group/opt">
                                                <button 
                                                    onClick={() => setCorrectOption(qIndex, oIndex)}
                                                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${opt.isCorrect ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-300'}`}
                                                >
                                                    <Check size={18} strokeWidth={3} />
                                                </button>
                                                <input 
                                                    type="text" 
                                                    value={opt.optionText} 
                                                    onChange={e => updateOptionText(qIndex, oIndex, e.target.value)}
                                                    placeholder={`Seçenek ${oIndex + 1}...`}
                                                    className={`flex-1 bg-white dark:bg-slate-900 border rounded-2xl px-5 py-3 text-sm font-bold outline-none transition-all ${opt.isCorrect ? 'border-emerald-500/50 ring-2 ring-emerald-500/5' : 'border-slate-200 dark:border-slate-800 focus:border-indigo-500'}`}
                                                />
                                                <button 
                                                    onClick={() => removeOption(qIndex, oIndex)}
                                                    className="w-10 h-10 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all opacity-0 group-hover/opt:opacity-100"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ))}
                                        <button 
                                            onClick={() => addOption(qIndex)}
                                            className="w-full py-3 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl text-[10px] font-black text-slate-400 hover:border-indigo-400 hover:text-indigo-400 transition-all flex items-center justify-center gap-2"
                                        >
                                            <Plus size={14} /> ŞIK EKLE
                                        </button>
                                    </div>
                                </div>
                            ))}

                            <button 
                                onClick={addQuestion}
                                className="w-full py-10 border-2 border-dashed border-indigo-200 dark:border-indigo-900/50 rounded-[2.5rem] bg-indigo-50/30 dark:bg-indigo-900/10 text-indigo-600 dark:text-indigo-400 font-black flex flex-col items-center justify-center gap-4 hover:bg-indigo-50 transition-all group"
                            >
                                <div className="w-14 h-14 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                    <Plus size={24} />
                                </div>
                                <span>YENİ SORU EKLE</span>
                            </button>
                         </div>
                      </div>
                   )}
               </div>
            </section>
          </div>

          <div className="space-y-6 sm:space-y-8">
            <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] shadow-sm space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 mb-4 uppercase tracking-widest text-center">XP Ödülü Ayarla</label>
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] border border-slate-100 dark:border-slate-800">
                    <div className="flex flex-col xl:flex-row items-center justify-between gap-4 sm:gap-6 mb-8">
                        <div className="flex items-center gap-4">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500
                                ${xpReward >= 500 ? 'bg-amber-100 text-amber-600 shadow-xl shadow-amber-500/20 rotate-12' : 
                                  xpReward >= 250 ? 'bg-indigo-100 text-indigo-600 shadow-lg shadow-indigo-500/20 rotate-6' : 
                                  'bg-slate-100 text-slate-500'}`}>
                                {xpReward >= 500 ? <Trophy size={28} /> : 
                                 xpReward >= 250 ? <Sparkles size={28} /> : 
                                 <Zap size={28} />}
                            </div>
                            <div className="text-center sm:text-left">
                                <div className="flex items-baseline gap-1 justify-center sm:justify-start">
                                    <span className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white transition-all">{xpReward}</span>
                                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">XP</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap justify-center gap-2">
                            {[50, 100, 250, 500].map(val => (
                                <button
                                    key={val}
                                    onClick={() => setXpReward(val)}
                                    className={`px-4 py-2 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all
                                        ${xpReward === val ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'bg-white dark:bg-slate-900 text-slate-500 hover:border-indigo-400 border border-slate-200 dark:border-slate-800'}`}
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
                            max="1000" 
                            step="10"
                            value={xpReward} 
                            onChange={e => setXpReward(+e.target.value)} 
                            className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer accent-indigo-600"
                        />
                        <div className="flex justify-between mt-2 px-1">
                            <span className="text-[10px] font-black text-slate-400">10 XP</span>
                            <span className="text-[10px] font-black text-slate-400">1,000 XP</span>
                        </div>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 mb-2 uppercase tracking-widest">Tahmini Süre (Sn)</label>
                  <input type="number" value={durationInSeconds} onChange={e => setDurationInSeconds(+e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-6 py-4 text-slate-900 dark:text-slate-100 font-bold focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-600 transition-all outline-none" />
                </div>
            </section>
            
            <button onClick={handleSave} disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white transition-all py-4 sm:py-6 rounded-[2rem] sm:rounded-[2.5rem] font-black text-lg sm:text-xl flex items-center justify-center gap-3 shadow-2xl shadow-indigo-600/30 uppercase tracking-widest hover:-translate-y-1">
               {loading ? (
                 <Loader2 key="save-loader" size={24} className="animate-spin" />
               ) : (
                 <span key="save-btn-content" className="flex items-center gap-3">
                   <Save size={24} /> Kaydet
                 </span>
               )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
