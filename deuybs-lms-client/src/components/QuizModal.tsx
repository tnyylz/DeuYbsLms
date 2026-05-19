// Path: src/components/QuizModal.tsx

import { useState, useEffect } from 'react';
import { X, Loader2, Trophy, ArrowRight, ChevronLeft, ChevronRight, Send, RotateCcw, Sparkles, XCircle, CheckCircle, Zap, Target } from 'lucide-react';
import type { QuestionDto, QuizResultDto } from '../types';
import { CourseCompletionModal } from './shared/CourseCompletionModal';

interface Props {
  questions: QuestionDto[];
  onSubmit: (answers: Record<string, string>) => Promise<QuizResultDto>;
  onClose: () => void;
  onNextLesson?: (lessonId: string) => void;
}

const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

export default function QuizModal({ questions, onSubmit, onClose, onNextLesson }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<QuizResultDto | null>(null);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null);
  const [showContent, setShowContent] = useState(true);

  const current = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;
  const allAnswered = questions.every(q => answers[q.id]);
  const answeredCount = questions.filter(q => answers[q.id]).length;
  const progressPercent = (answeredCount / questions.length) * 100;

  // Slide animation
  useEffect(() => {
    if (slideDirection) {
      setShowContent(false);
      const timer = setTimeout(() => {
        setShowContent(true);
        setSlideDirection(null);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [slideDirection]);

  const selectAnswer = (questionId: string, optionId: string) => {
    if (result) return;
    setAnswers({ ...answers, [questionId]: optionId });
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setSlideDirection('left');
      setTimeout(() => setCurrentIndex(currentIndex + 1), 100);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setSlideDirection('right');
      setTimeout(() => setCurrentIndex(currentIndex - 1), 100);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await onSubmit(answers);
      setResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (result?.isCourseCompleted) {
    return <CourseCompletionModal result={result} onClose={onClose} />;
  }

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md flex items-center justify-center z-50 p-4 font-sans">
      {/* Ambient background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[128px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-[128px]" />
      </div>

      <div className="relative bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700/50 shadow-2xl shadow-indigo-500/10 rounded-[28px] w-full max-w-xl max-h-[90vh] overflow-hidden">
        
        {/* Decorative top gradient bar */}
        <div className="h-1.5 bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500" />

        {/* Header */}
        <div className="px-7 pt-6 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <Target className="text-white" size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-lg tracking-tight">
                {result ? 'Quiz Sonucu' : 'Quiz Zamanı'}
              </h3>
              {!result && (
                <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold mt-0.5">
                  Soru {currentIndex + 1} / {questions.length}
                </p>
              )}
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-all bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 p-2 rounded-xl hover:rotate-90 duration-300"
          >
            <X size={18} />
          </button>
        </div>

        {/* Progress Bar */}
        {!result && (
          <div className="px-7 pb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500">İlerleme</span>
              <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/40 px-2 py-0.5 rounded-full">
                {answeredCount}/{questions.length} Cevaplandı
              </span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-indigo-500 to-violet-500 h-full rounded-full transition-all duration-700 ease-out shadow-sm shadow-indigo-500/50"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        <div className="px-7 pb-7">
          {!result ? (
            <>
              {/* Question Card */}
              <div 
                className={`transition-all duration-200 ${showContent ? 'opacity-100 translate-x-0' : slideDirection === 'left' ? 'opacity-0 -translate-x-4' : 'opacity-0 translate-x-4'}`}
              >
                {/* Question Text */}
                <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-800 dark:to-slate-800/50 rounded-2xl p-5 mb-5 border border-slate-200/60 dark:border-slate-700/40">
                  <p className="text-slate-800 dark:text-slate-100 font-bold text-base leading-relaxed">
                    {current.questionText}
                  </p>
                </div>

                {/* Options */}
                <div className="space-y-2.5 mb-6">
                  {current.options.map((option, idx) => {
                    const isSelected = answers[current.id] === option.id;
                    const letter = OPTION_LETTERS[idx] || String.fromCharCode(65 + idx);
                    
                    return (
                      <button
                        key={`${current.id}-${option.id}`}
                        onClick={() => selectAnswer(current.id, option.id)}
                        className={`w-full text-left px-4 py-3.5 rounded-2xl border-2 transition-all duration-200 font-medium flex items-center gap-4 group ${
                          isSelected
                            ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-500 dark:border-indigo-400 text-indigo-700 dark:text-indigo-300 shadow-lg shadow-indigo-500/10 scale-[1.01]'
                            : 'bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50 text-slate-600 dark:text-slate-300 hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 hover:shadow-md'
                        }`}
                      >
                        <span className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black shrink-0 transition-all duration-200 ${
                          isSelected 
                            ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/30' 
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-800 group-hover:text-indigo-600 dark:group-hover:text-indigo-300'
                        }`}>
                          {letter}
                        </span>
                        <span className="text-sm font-semibold leading-snug">{option.optionText}</span>
                        {isSelected && (
                          <CheckCircle size={18} className="ml-auto text-indigo-500 dark:text-indigo-400 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Question Navigator Dots */}
                <div className="flex justify-center gap-1.5 mb-5">
                  {questions.map((q, i) => (
                    <button
                      key={`dot-${i}`}
                      onClick={() => {
                        setSlideDirection(i > currentIndex ? 'left' : 'right');
                        setTimeout(() => setCurrentIndex(i), 100);
                      }}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        i === currentIndex 
                          ? 'w-8 bg-gradient-to-r from-indigo-500 to-violet-500 shadow-sm shadow-indigo-500/30' 
                          : answers[q.id] 
                            ? 'w-2 bg-indigo-300 dark:bg-indigo-600 hover:bg-indigo-400' 
                            : 'w-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between gap-3">
                <button
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl disabled:opacity-30 disabled:hover:bg-slate-100 transition-all"
                >
                  <ChevronLeft size={16} />
                  Önceki
                </button>

                {isLastQuestion && allAnswered ? (
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex-1 max-w-[200px] bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl text-sm font-black flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 transition-all hover:-translate-y-0.5 active:translate-y-0"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Gönderiliyor...</span>
                      </>
                    ) : (
                      <>
                        <Send size={14} />
                        <span>Gönder</span>
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    disabled={!answers[current.id]}
                    className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-xl disabled:opacity-30 transition-all"
                  >
                    Sonraki
                    <ChevronRight size={16} />
                  </button>
                )}
              </div>
            </>
          ) : (
            /* ============ RESULT SCREEN ============ */
            <div className="text-center py-2">
              {result.isPassed ? (
                <>
                  {/* Success - Celebration */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-32 h-32 bg-emerald-400/20 rounded-full blur-2xl animate-pulse" />
                    </div>
                    <div className="relative w-24 h-24 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-[28px] flex items-center justify-center mx-auto mb-5 shadow-2xl shadow-emerald-500/30 rotate-3 hover:rotate-0 transition-transform duration-500">
                      <Trophy className="text-white drop-shadow-lg" size={40} />
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Sparkles size={18} className="text-amber-400" />
                    <h4 className="text-2xl font-black text-slate-900 dark:text-white">Tebrikler!</h4>
                    <Sparkles size={18} className="text-amber-400" />
                  </div>
                  <p className="text-emerald-600 dark:text-emerald-400 font-bold text-sm">Mükemmel, bu quiz'i başarıyla geçtin!</p>
                </>
              ) : (
                <>
                  {/* Fail */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-32 h-32 bg-red-400/20 rounded-full blur-2xl" />
                    </div>
                    <div className="relative w-24 h-24 bg-gradient-to-br from-red-400 to-red-600 rounded-[28px] flex items-center justify-center mx-auto mb-5 shadow-2xl shadow-red-500/30 -rotate-3 hover:rotate-0 transition-transform duration-500">
                      <XCircle className="text-white drop-shadow-lg" size={40} />
                    </div>
                  </div>
                  <h4 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Başarısız</h4>
                  <p className="text-red-500 dark:text-red-400 font-bold text-sm">Biraz daha çalışıp tekrar dene!</p>
                </>
              )}

              {/* Score Card */}
              <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-800 dark:to-slate-800/30 border border-slate-200/60 dark:border-slate-700/40 rounded-2xl p-5 mt-6 space-y-0">
                <div className="flex justify-between items-center py-3">
                  <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Senin Puanın</span>
                  <span className={`text-2xl font-black ${result.isPassed ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
                    {result.score}
                  </span>
                </div>
                <div className="w-full h-px bg-slate-200 dark:bg-slate-700" />
                <div className="flex justify-between items-center py-3">
                  <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Doğru Cevap</span>
                  <span className="font-black text-slate-900 dark:text-white bg-white dark:bg-slate-700 px-3 py-1 rounded-lg shadow-sm border border-slate-200 dark:border-slate-600 text-sm">
                    {result.correctAnswers} / {result.totalQuestions}
                  </span>
                </div>
                <div className="w-full h-px bg-slate-200 dark:bg-slate-700" />
                <div className="flex justify-between items-center py-3">
                  <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Geçme Puanı</span>
                  <span className="font-black text-slate-900 dark:text-white text-sm">{result.minimumPassingScore}</span>
                </div>
                {result.xpResult && result.xpResult.xpAwarded > 0 && (
                  <>
                    <div className="w-full h-px bg-slate-200 dark:bg-slate-700" />
                    <div className="flex justify-between items-center py-3">
                      <span className="text-sm font-bold text-amber-600 dark:text-amber-400 flex items-center gap-2">
                        <Zap size={14} fill="currentColor" />
                        Kazanılan XP
                      </span>
                      <span className="font-black text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-3 py-1 rounded-lg border border-amber-200 dark:border-amber-700 text-sm">
                        +{result.xpResult.xpAwarded} XP
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-7">
                {result.isPassed && result.nextLessonId && onNextLesson ? (
                  <button
                    onClick={() => onNextLesson(result.nextLessonId!)}
                    className="flex-1 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-lg shadow-indigo-500/25 py-3.5 rounded-2xl font-black flex items-center justify-center gap-2.5 transition-all hover:-translate-y-0.5 active:translate-y-0 text-sm"
                  >
                    Sonraki Ders <ArrowRight size={16} />
                  </button>
                ) : (
                  <button
                    onClick={onClose}
                    className={`flex-1 py-3.5 rounded-2xl font-black flex items-center justify-center gap-2.5 transition-all hover:-translate-y-0.5 active:translate-y-0 text-sm ${
                      result.isPassed 
                        ? 'bg-emerald-50 dark:bg-emerald-900/30 border-2 border-emerald-200 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50' 
                        : 'bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {result.isPassed ? (
                      <>
                        <CheckCircle size={16} />
                        Dersi Bitir
                      </>
                    ) : (
                      <>
                        <RotateCcw size={16} />
                        Tekrar Dene
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}