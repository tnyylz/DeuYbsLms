import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Target, ChevronLeft, Plus, Trash2, Save, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axiosInstance from '../../api/axiosInstance';
import ThemeToggle from '../../components/shared/ThemeToggle';

interface QuestionDraft {
  id?: string;
  questionText: string;
  options: {
    id?: string;
    optionText: string;
    isCorrect: boolean;
  }[];
}

export default function TeacherFinalExamBuilder() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [minPassingScore, setMinPassingScore] = useState(70);
  const [questions, setQuestions] = useState<QuestionDraft[]>([]);

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const response = await axiosInstance.get(`/Quiz/course/${courseId}`);
        const exam = response.data.data ?? response.data;
        setMinPassingScore(exam.minimumPassingScore);
        if (exam.questions && exam.questions.length > 0) {
           setQuestions(exam.questions.map((q: any) => ({
             id: q.id,
             questionText: q.questionText,
             options: (q.options || q.answerOptions || []).map((o: any) => ({
               id: o.id,
               optionText: o.optionText,
               isCorrect: o.isCorrect
             }))
           })));
        } else {
           addQuestion();
        }
      } catch (err: any) {
        if (err.response?.status === 404) {
           addQuestion(); // No final exam yet, create initial empty question
        } else {
           toast.error('Final sınavı yüklenirken hata oluştu.');
        }
      } finally {
        setLoading(false);
      }
    };
    if (courseId) fetchExam();
  }, [courseId]);

  const handleSave = async () => {
    if (questions.length === 0) {
      toast.error('En az bir soru eklemelisiniz.');
      return;
    }
    
    // Validate
    for (let i = 0; i < questions.length; i++) {
        if (!questions[i].questionText.trim()) {
            toast.error(`Soru ${i+1} metni boş olamaz.`);
            return;
        }
        for (let j = 0; j < questions[i].options.length; j++) {
            if (!questions[i].options[j].optionText.trim()) {
                toast.error(`Soru ${i+1}, Seçenek ${j+1} boş olamaz.`);
                return;
            }
        }
    }

    setLoading(true);
    try {
      await axiosInstance.post('/Quiz', {
          title: 'Final Sınavı',
          courseId,
          minimumPassingScore: minPassingScore,
          questions: questions.map((q, i) => ({
             questionText: q.questionText,
             orderIndex: i + 1,
             options: q.options.map(o => ({
                 optionText: o.optionText,
                 isCorrect: o.isCorrect
             }))
          }))
      });
      toast.success('Final sınavı kaydedildi.');
      navigate(`/teacher/course/${courseId}`);
    } catch (err: any) {
      const msg = err.response?.data?.error || err.response?.data?.innerError || err.message || 'Bilinmeyen hata';
      console.error('Quiz kaydetme hatası:', err.response?.data || err);
      toast.error(`Sınav kaydedilemedi: ${msg}`);
    } finally {
      setLoading(false);
    }
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
    if (!newQuestions[qIndex].options.some(o => o.isCorrect)) {
        newQuestions[qIndex].options[0].isCorrect = true;
    }
    setQuestions(newQuestions);
  };

  if (loading) {
     return <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-slate-500">Yükleniyor...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <nav className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl px-4 sm:px-6 py-4 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
             <button onClick={() => navigate(`/teacher/course/${courseId}`)} className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:text-indigo-600 transition-all">
                <ChevronLeft size={20} />
             </button>
             <div className="flex items-center gap-2">
                <Target className="text-violet-600 dark:text-violet-400" size={20} />
                <span className="font-black tracking-tight text-lg uppercase">Final Sınavı Oluştur</span>
             </div>
          </div>
          <ThemeToggle />
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-2xl p-4 flex gap-3 text-amber-800 dark:text-amber-300">
            <AlertCircle className="shrink-0 mt-0.5" size={20}/>
            <p className="text-sm font-medium">Bu sınav tüm dersleri tamamlayan öğrenciler tarafından çözülebilir. Geçer notu alan öğrenciler, başarı sertifikasını almaya hak kazanırlar.</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-[32px] p-6 sm:p-8 shadow-sm border border-slate-200 dark:border-slate-800 space-y-8">
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Geçme Notu (%)</label>
            <input 
              type="number" 
              min="0" 
              max="100" 
              value={minPassingScore} 
              onChange={e => setMinPassingScore(Number(e.target.value))} 
              className="w-full sm:w-32 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-violet-500 font-bold"
            />
          </div>

          <div className="space-y-6">
            <h3 className="font-black text-xl text-slate-800 dark:text-slate-100 flex items-center gap-2">
                Sorular <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 text-sm px-2 py-0.5 rounded-full">{questions.length}</span>
            </h3>
            
            {questions.map((q, qIndex) => (
              <div key={qIndex} className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-700/50 relative group">
                <button 
                  onClick={() => removeQuestion(qIndex)}
                  className="absolute top-4 right-4 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                >
                  <Trash2 size={18} />
                </button>
                
                <div className="mb-4 pr-10">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Soru {qIndex + 1}</label>
                  <textarea 
                    rows={2}
                    placeholder="Soru metnini girin..."
                    value={q.questionText}
                    onChange={(e) => updateQuestionText(qIndex, e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-violet-500 font-medium"
                  />
                </div>
                
                <div className="space-y-3">
                  {q.options.map((opt, oIndex) => (
                    <div key={oIndex} className="flex items-center gap-3">
                      <button 
                        onClick={() => setCorrectOption(qIndex, oIndex)}
                        className={`w-6 h-6 rounded-full shrink-0 border-2 flex items-center justify-center transition-colors ${opt.isCorrect ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300 dark:border-slate-600'}`}
                      >
                         {opt.isCorrect && <div className="w-2 h-2 bg-white rounded-full"></div>}
                      </button>
                      <input 
                        type="text"
                        placeholder={`Seçenek ${oIndex + 1}`}
                        value={opt.optionText}
                        onChange={e => updateOptionText(qIndex, oIndex, e.target.value)}
                        className={`flex-1 bg-white dark:bg-slate-900 border-2 rounded-xl px-4 py-2 focus:outline-none ${opt.isCorrect ? 'border-emerald-500/50 focus:border-emerald-500' : 'border-slate-200 dark:border-slate-700 focus:border-violet-500'}`}
                      />
                      <button onClick={() => removeOption(qIndex, oIndex)} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                        <Trash2 size={16}/>
                      </button>
                    </div>
                  ))}
                  
                  <button onClick={() => addOption(qIndex)} className="text-sm font-bold text-violet-600 dark:text-violet-400 flex items-center gap-1 hover:text-violet-700 transition-colors mt-2 ml-9">
                    <Plus size={16}/> Seçenek Ekle
                  </button>
                </div>
              </div>
            ))}
            
            <button 
              onClick={addQuestion}
              className="w-full py-4 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl text-slate-500 dark:text-slate-400 font-bold flex items-center justify-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
            >
              <Plus size={20} /> Yeni Soru Ekle
            </button>
          </div>
        </div>

        <div className="flex justify-end gap-4 pb-12">
            <button onClick={() => navigate(`/teacher/course/${courseId}`)} className="px-6 py-3 font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors">İptal</button>
            <button onClick={handleSave} className="bg-violet-600 hover:bg-violet-700 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-violet-200 dark:shadow-none transition-all hover:-translate-y-0.5">
                <Save size={20} /> Kaydet
            </button>
        </div>
      </div>
    </div>
  );
}
