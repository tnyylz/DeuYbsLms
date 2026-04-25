// Path: src/components/QuizModal.tsx

import { useState } from 'react';
import { X, XCircle, Loader2, Trophy, ArrowRight } from 'lucide-react';
import type { QuestionDto, QuizResultDto } from '../types';
import { CourseCompletionModal } from './shared/CourseCompletionModal';

interface Props {
  questions: QuestionDto[];
  onSubmit: (answers: Record<string, string>) => Promise<QuizResultDto>;
  onClose: () => void;
  onNextLesson?: (lessonId: string) => void;
}

export default function QuizModal({ questions, onSubmit, onClose, onNextLesson }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<QuizResultDto | null>(null);

  const current = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;
  const allAnswered = questions.every(q => answers[q.id]);

  const selectAnswer = (questionId: string, optionId: string) => {
    if (result) return;
    setAnswers({ ...answers, [questionId]: optionId });
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
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
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans">
      <div className="bg-white border border-slate-200 shadow-xl rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h3 className="font-bold text-slate-900">
            {result ? 'Quiz Sonucu' : `Soru ${currentIndex + 1} / ${questions.length}`}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 transition-colors bg-slate-50 hover:bg-slate-100 p-1.5 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {!result ? (
            <>
              {/* Soru */}
              <p className="text-slate-800 font-bold text-lg mb-6 leading-relaxed">{current.questionText}</p>

              {/* Seçenekler */}
              <div className="space-y-3 mb-8">
                {current.options.map(option => (
                  <button
                    key={option.id}
                    onClick={() => selectAnswer(current.id, option.id)}
                    className={`w-full text-left px-5 py-4 rounded-xl border-2 transition-all font-medium ${
                      answers[current.id] === option.id
                        ? 'bg-indigo-50 border-indigo-600 text-indigo-700 shadow-sm'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {option.optionText}
                  </button>
                ))}
              </div>

              {/* Progress dots */}
              <div className="flex justify-center gap-2 mb-6">
                {questions.map((q, i) => (
                  <div
                    key={q.id}
                    className={`w-2.5 h-2.5 rounded-full transition-colors ${
                      i === currentIndex ? 'bg-indigo-600 ring-2 ring-indigo-200 ring-offset-1' :
                      answers[q.id] ? 'bg-indigo-300' : 'bg-slate-200'
                    }`}
                  />
                ))}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <button
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                  className="px-5 py-2.5 text-sm font-semibold text-slate-500 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 rounded-lg disabled:opacity-40 disabled:hover:bg-slate-50 transition-colors"
                >
                  ← Önceki
                </button>

                {isLastQuestion && allAnswered ? (
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 shadow-md transition-colors"
                  >
                    {loading && <Loader2 size={16} className="animate-spin" />}
                    {loading ? 'Gönderiliyor...' : 'Tümünü Gönder'}
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    disabled={!answers[current.id]}
                    className="px-5 py-2.5 text-sm font-semibold text-indigo-700 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 rounded-lg disabled:opacity-40 disabled:hover:bg-indigo-50 transition-colors"
                  >
                    Sonraki →
                  </button>
                )}
              </div>
            </>
          ) : (
            /* Sonuç Ekranı */
            <div className="text-center py-4">
              {result.isPassed ? (
                <>
                  <div className="w-20 h-20 bg-emerald-50 border border-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <Trophy className="text-emerald-500" size={36} />
                  </div>
                  <h4 className="text-2xl font-bold text-slate-900 mb-2">Tebrikler! 🎉</h4>
                  <p className="text-emerald-600 font-semibold mb-4">Mükemmel, bu quiz'i geçtin!</p>
                </>
              ) : (
                <>
                  <div className="w-20 h-20 bg-red-50 border border-red-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <XCircle className="text-red-500" size={36} />
                  </div>
                  <h4 className="text-2xl font-bold text-slate-900 mb-2">Maalesef :(</h4>
                  <p className="text-red-500 font-semibold mb-4">Biraz daha çalışıp tekrar dene!</p>
                </>
              )}

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 mt-6 space-y-3 text-sm">
                <div className="flex justify-between items-center text-slate-600">
                  <span className="font-medium">Senin Puanın</span>
                  <span className="font-bold text-lg text-slate-900">{result.score}</span>
                </div>
                <div className="w-full h-px bg-slate-200"></div>
                <div className="flex justify-between items-center text-slate-600">
                  <span className="font-medium">Doğru Cevap</span>
                  <span className="font-bold text-slate-900 bg-white px-2 py-1 rounded shadow-sm border border-slate-200">{result.correctAnswers} / {result.totalQuestions}</span>
                </div>
                <div className="w-full h-px bg-slate-200"></div>
                <div className="flex justify-between items-center text-slate-600">
                  <span className="font-medium">Geçme Puanı</span>
                  <span className="font-bold text-slate-900">{result.minimumPassingScore}</span>
                </div>
                {result.xpResult && result.xpResult.xpAwarded > 0 && (
                  <>
                    <div className="w-full h-px bg-slate-200"></div>
                    <div className="flex justify-between items-center text-amber-600">
                      <span className="font-semibold">Kazanılan XP</span>
                      <span className="font-bold bg-amber-50 px-2 py-1 rounded border border-amber-200">+{result.xpResult.xpAwarded} XP</span>
                    </div>
                  </>
                )}
              </div>

              <div className="flex gap-4 mt-8">
                {result.isPassed && result.nextLessonId && onNextLesson ? (
                  <button
                    onClick={() => onNextLesson(result.nextLessonId!)}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white shadow-md py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    Hemen Sonraki Ders <ArrowRight size={16} />
                  </button>
                ) : (
                  <button
                    onClick={onClose}
                    className="flex-1 bg-white border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 py-3.5 rounded-xl font-bold transition-colors cursor-pointer"
                  >
                    {result.isPassed ? 'Dersi Bitir' : 'Tekrar Dene'}
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