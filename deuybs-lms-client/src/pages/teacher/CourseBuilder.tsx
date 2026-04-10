// Path: src/pages/teacher/CourseBuilder.tsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ChevronLeft, PlusCircle, Trash2, Loader2, CheckCircle, HelpCircle } from 'lucide-react';
import { createCourseApi, createLessonApi, createQuizApi } from '../../api/courses.api';
import type { CreateLessonRequest } from '../../types';

interface LessonForm extends CreateLessonRequest {
  hasQuiz: boolean;
  quizMinScore: number;
  questions: QuestionForm[];
}

interface QuestionForm {
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
  title: '', videoUrl: '', durationInSeconds: 0, xpReward: 50, orderIndex: order,
  hasQuiz: true, quizMinScore: 60, questions: [emptyQuestion()],
});

export default function CourseBuilder() {
  const navigate = useNavigate();

  const [step, setStep] = useState<'course' | 'lessons' | 'done'>('course');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Course
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [level, setLevel] = useState('Beginner');
  const [courseId, setCourseId] = useState('');

  // Lessons
  const [lessons, setLessons] = useState<LessonForm[]>([emptyLesson(0)]);

  const handleCreateCourse = async () => {
    setLoading(true);
    setError('');
    try {
      const id = await createCourseApi({ title, description, level });
      setCourseId(id);
      setStep('lessons');
    } catch (err: any) {
      setError(err.response?.data?.errorMessage || 'Kurs oluşturulamadı.');
    } finally { setLoading(false); }
  };

  const updateLesson = (index: number, updates: Partial<LessonForm>) => {
    const copy = [...lessons];
    copy[index] = { ...copy[index], ...updates };
    setLessons(copy);
  };

  const addLesson = () => setLessons([...lessons, emptyLesson(lessons.length)]);

  const removeLesson = (index: number) => {
    if (lessons.length <= 1) return;
    setLessons(lessons.filter((_, i) => i !== index).map((l, i) => ({ ...l, orderIndex: i })));
  };

  const updateQuestion = (li: number, qi: number, updates: Partial<QuestionForm>) => {
    const copy = [...lessons];
    copy[li].questions[qi] = { ...copy[li].questions[qi], ...updates };
    setLessons(copy);
  };

  const addQuestion = (li: number) => {
    const copy = [...lessons];
    copy[li].questions.push(emptyQuestion());
    setLessons(copy);
  };

  const updateOption = (li: number, qi: number, oi: number, updates: Partial<OptionForm>) => {
    const copy = [...lessons];
    copy[li].questions[qi].options[oi] = { ...copy[li].questions[qi].options[oi], ...updates };
    setLessons(copy);
  };

  const setCorrectOption = (li: number, qi: number, oi: number) => {
    const copy = [...lessons];
    copy[li].questions[qi].options = copy[li].questions[qi].options.map((o, i) => ({ ...o, isCorrect: i === oi }));
    setLessons(copy);
  };

  const handleSaveLessons = async () => {
    setLoading(true);
    setError('');
    try {
      for (const lesson of lessons) {
        const lessonId = await createLessonApi(courseId, {
          title: lesson.title,
          videoUrl: lesson.videoUrl,
          durationInSeconds: lesson.durationInSeconds,
          xpReward: lesson.xpReward,
          orderIndex: lesson.orderIndex,
        });

        if (lesson.hasQuiz && lesson.questions.length > 0) {
          await createQuizApi({
            lessonId,
            minimumPassingScore: lesson.quizMinScore,
            questions: lesson.questions.map(q => ({
              questionText: q.questionText,
              options: q.options.map(o => ({ optionText: o.optionText, isCorrect: o.isCorrect })),
            })),
          });
        }
      }
      setStep('done');
    } catch (err: any) {
      setError(err.response?.data?.errorMessage || 'Dersler kaydedilemedi.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <nav className="border-b border-slate-800 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <button onClick={() => navigate('/teacher/dashboard')} className="text-slate-400 hover:text-white transition-colors"><ChevronLeft size={20} /></button>
          <BookOpen className="text-indigo-400" size={20} />
          <span className="font-bold tracking-tight">Kurs Oluşturucu</span>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10">
        {error && <div className="bg-red-950 border border-red-800 text-red-300 text-sm px-4 py-3 rounded-lg mb-6">{error}</div>}

        {/* STEP 1: Kurs Bilgileri */}
        {step === 'course' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
            <h2 className="text-lg font-semibold mb-6">Kurs Bilgileri</h2>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Kurs Adı</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Örn: Veritabanı Yönetimi" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Açıklama</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="Kurs hakkında kısa açıklama..." className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors text-sm resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Seviye</label>
                <select value={level} onChange={e => setLevel(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition-colors text-sm">
                  <option value="Beginner">Başlangıç</option>
                  <option value="Intermediate">Orta</option>
                  <option value="Advanced">İleri</option>
                </select>
              </div>
              <button onClick={handleCreateCourse} disabled={loading || !title} className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 transition-colors px-6 py-2.5 rounded-lg font-medium text-sm flex items-center gap-2">
                {loading && <Loader2 size={14} className="animate-spin" />}
                Devam Et →
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Dersler & Quizler */}
        {step === 'lessons' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Dersler & Quizler</h2>
              <button onClick={addLesson} className="bg-slate-800 hover:bg-slate-700 transition-colors px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5">
                <PlusCircle size={13} /> Ders Ekle
              </button>
            </div>

            {lessons.map((lesson, li) => (
              <div key={li} className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-sm text-indigo-400">Ders {li + 1}</h3>
                  {lessons.length > 1 && (
                    <button onClick={() => removeLesson(li)} className="text-red-400 hover:text-red-300 transition-colors"><Trash2 size={15} /></button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="col-span-2">
                    <input type="text" placeholder="Ders başlığı" value={lesson.title} onChange={e => updateLesson(li, { title: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm" />
                  </div>
                  <div className="col-span-2">
                    <input type="text" placeholder="Video URL (YouTube veya direkt link)" value={lesson.videoUrl} onChange={e => updateLesson(li, { videoUrl: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Süre (saniye)</label>
                    <input type="number" value={lesson.durationInSeconds} onChange={e => updateLesson(li, { durationInSeconds: +e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">XP Ödülü</label>
                    <input type="number" value={lesson.xpReward} onChange={e => updateLesson(li, { xpReward: +e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white text-sm" />
                  </div>
                </div>

                {/* Quiz Toggle */}
                <div className="flex items-center gap-3 mb-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={lesson.hasQuiz} onChange={e => updateLesson(li, { hasQuiz: e.target.checked })} className="accent-indigo-500" />
                    <span className="text-sm text-slate-300">Quiz ekle</span>
                  </label>
                  {lesson.hasQuiz && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">Geçme puanı:</span>
                      <input type="number" value={lesson.quizMinScore} onChange={e => updateLesson(li, { quizMinScore: +e.target.value })} className="w-16 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white text-xs" />
                    </div>
                  )}
                </div>

                {/* Questions */}
                {lesson.hasQuiz && (
                  <div className="space-y-4 pl-4 border-l-2 border-indigo-900">
                    {lesson.questions.map((q, qi) => (
                      <div key={qi} className="bg-slate-800 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <HelpCircle className="text-indigo-400" size={14} />
                          <span className="text-xs text-indigo-400 font-medium">Soru {qi + 1}</span>
                        </div>
                        <input type="text" placeholder="Soru metni" value={q.questionText} onChange={e => updateQuestion(li, qi, { questionText: e.target.value })} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 text-sm mb-3" />
                        <div className="space-y-2">
                          {q.options.map((opt, oi) => (
                            <div key={oi} className="flex items-center gap-2">
                              <button onClick={() => setCorrectOption(li, qi, oi)} className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${opt.isCorrect ? 'border-green-500 bg-green-500' : 'border-slate-600 hover:border-slate-500'}`}>
                                {opt.isCorrect && <CheckCircle size={12} className="text-white" />}
                              </button>
                              <input type="text" placeholder={`Seçenek ${oi + 1}`} value={opt.optionText} onChange={e => updateOption(li, qi, oi, { optionText: e.target.value })} className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-3 py-1.5 text-white placeholder-slate-400 text-sm" />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                    <button onClick={() => addQuestion(li)} className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1">
                      <PlusCircle size={12} /> Soru Ekle
                    </button>
                  </div>
                )}
              </div>
            ))}

            <button onClick={handleSaveLessons} disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 transition-colors py-3 rounded-xl font-medium flex items-center justify-center gap-2">
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? 'Kaydediliyor...' : 'Kursu Kaydet & Yayınla'}
            </button>
          </div>
        )}

        {/* STEP 3: Tamamlandı */}
        {step === 'done' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center">
            <div className="w-16 h-16 bg-green-950 border border-green-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="text-green-400" size={28} />
            </div>
            <h2 className="text-xl font-bold mb-2">Kurs Oluşturuldu! 🎉</h2>
            <p className="text-slate-400 text-sm mb-6">Kursun başarıyla yayınlandı. Öğrenciler artık kayıt olabilir.</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => navigate('/teacher/dashboard')} className="bg-slate-800 hover:bg-slate-700 transition-colors px-5 py-2.5 rounded-lg text-sm font-medium">Dashboard'a Dön</button>
              <button onClick={() => { setStep('course'); setTitle(''); setDescription(''); setLevel('Beginner'); setLessons([emptyLesson(0)]); setCourseId(''); }} className="bg-indigo-600 hover:bg-indigo-500 transition-colors px-5 py-2.5 rounded-lg text-sm font-medium">Yeni Kurs Oluştur</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}