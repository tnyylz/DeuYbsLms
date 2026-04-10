// Path: src/pages/student/LearningRoom.tsx

import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BookOpen, ChevronLeft, Loader2, HelpCircle, Lock, CheckCircle } from 'lucide-react';
import VideoPlayer from '../../components/VideoPlayer';
import QuizModal from '../../components/QuizModal';
import { getCourseDetailApi, getQuizQuestionsApi } from '../../api/courses.api';
import { getCourseProgressApi, completeVideoApi, submitQuizApi } from '../../api/progress.api';
import type { CourseDetailDto, LessonDto, LessonProgressDto, QuestionDto, QuizResultDto } from '../../types';

export default function LearningRoom() {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const navigate = useNavigate();

  const [course, setCourse] = useState<CourseDetailDto | null>(null);
  const [lesson, setLesson] = useState<LessonDto | null>(null);
  const [lessonProgress, setLessonProgress] = useState<LessonProgressDto | null>(null);
  const [loading, setLoading] = useState(true);

  const [showQuiz, setShowQuiz] = useState(false);
  const [questions, setQuestions] = useState<QuestionDto[]>([]);
  const [quizLoading, setQuizLoading] = useState(false);

  const fetchAll = useCallback(async () => {
    if (!courseId || !lessonId) return;
    try {
      const [courseData, progressData] = await Promise.all([
        getCourseDetailApi(courseId),
        getCourseProgressApi(courseId),
      ]);
      setCourse(courseData);

      const currentLesson = courseData.lessons.find(l => l.id === lessonId);
      setLesson(currentLesson ?? null);

      const currentProgress = progressData.lessonProgresses.find(lp => lp.lessonId === lessonId);
      setLessonProgress(currentProgress ?? null);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [courseId, lessonId]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleVideoComplete = async () => {
    if (!lessonId) return;
    try {
      await completeVideoApi(lessonId);
      await fetchAll();
    } catch (err) { console.error(err); }
  };

  const handleOpenQuiz = async () => {
    if (!lessonId) return;
    setQuizLoading(true);
    try {
      const q = await getQuizQuestionsApi(lessonId);
      setQuestions(q);
      setShowQuiz(true);
    } catch (err) { console.error(err); }
    finally { setQuizLoading(false); }
  };

  const handleSubmitQuiz = async (answers: Record<string, string>): Promise<QuizResultDto> => {
    const payload = Object.entries(answers).map(([questionId, selectedAnswerOptionId]) => ({
      questionId,
      selectedAnswerOptionId,
    }));
    const result = await submitQuizApi(lessonId!, payload);
    await fetchAll();
    return result;
  };

  const handleNextLesson = (nextLessonId: string) => {
    setShowQuiz(false);
    navigate(`/course/${courseId}/lesson/${nextLessonId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center border border-slate-200">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!course || !lesson) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-900">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">Ders bulunamadı.</div>
      </div>
    );
  }

  const videoCompleted = lessonProgress?.isVideoCompleted ?? false;
  const quizPassed = lessonProgress?.isQuizPassed ?? false;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 px-6 py-4 shadow-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(`/course/${courseId}/skill-tree`)} className="text-slate-500 hover:text-indigo-600 transition-colors">
              <ChevronLeft size={20} />
            </button>
            <div className="bg-indigo-50 p-2 rounded-lg">
              <BookOpen className="text-indigo-600" size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold">{course.title}</p>
              <p className="font-bold text-sm text-slate-900 line-clamp-1">{lesson.title}</p>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Durum Kartları */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className={`rounded-xl border p-4 shadow-sm ${videoCompleted ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-200'}`}>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Video Durumu</p>
            <p className={`font-bold text-sm ${videoCompleted ? 'text-emerald-700' : 'text-slate-700'}`}>
              {videoCompleted ? '✓ Tamamlandı' : '○ İzlenmedi'}
            </p>
          </div>
          <div className={`rounded-xl border p-4 shadow-sm ${quizPassed ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-200'}`}>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Quiz Durumu</p>
            <p className={`font-bold text-sm ${quizPassed ? 'text-emerald-700' : 'text-slate-700'}`}>
              {!lesson.hasQuiz ? 'Bu derste quiz yok' : quizPassed ? '✓ Geçildi' : '○ Bekleniyor'}
            </p>
          </div>
        </div>

        {/* Video Player */}
        <div className="mb-8 rounded-2xl overflow-hidden shadow-lg border border-slate-200 bg-black">
          <VideoPlayer videoUrl={lesson.videoUrl} onVideoComplete={handleVideoComplete} />
        </div>

        {/* Quiz Butonu */}
        {lesson.hasQuiz && videoCompleted && !quizPassed && (
          <button
            onClick={handleOpenQuiz}
            disabled={quizLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-md disabled:opacity-50 transition-colors py-4 rounded-xl font-bold flex items-center justify-center gap-2 mb-8 cursor-pointer"
          >
            {quizLoading ? <Loader2 size={18} className="animate-spin" /> : <HelpCircle size={18} />}
            {quizLoading ? 'Quiz yükleniyor...' : 'Öğrendiklerini Sına: Quiz\'e Başla'}
          </button>
        )}

        {/* Video izlenmeden quiz uyarısı */}
        {lesson.hasQuiz && !videoCompleted && !quizPassed && (
          <div className="bg-slate-100 border border-slate-200 rounded-xl p-5 text-center text-sm font-medium text-slate-600 mb-8 shadow-sm flex flex-col items-center">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mb-2 border border-slate-200 shadow-sm">
               <Lock className="text-slate-400" size={18} />
            </div>
            <span>Quiz'e başlamak için öncelikle video dersini tamamlamalısınız.</span>
          </div>
        )}

        {/* Her şey tamamlandı */}
        {videoCompleted && (quizPassed || !lesson.hasQuiz) && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center shadow-sm">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 border border-emerald-100 shadow-sm">
              <CheckCircle className="text-emerald-500" size={24} />
            </div>
            <p className="text-emerald-800 font-bold text-lg mb-1">Tebrikler, bu dersi tamamen bitirdiniz!</p>
            <button
              onClick={() => navigate(`/course/${courseId}/skill-tree`)}
              className="mt-4 text-sm font-semibold text-indigo-600 hover:text-indigo-800 hover:underline transition-colors inline-block"
            >
              ← Diğer Derslere Dön
            </button>
          </div>
        )}
      </div>

      {/* Quiz Modal */}
      {showQuiz && questions.length > 0 && (
        <QuizModal
          questions={questions}
          onSubmit={handleSubmitQuiz}
          onClose={() => setShowQuiz(false)}
          onNextLesson={handleNextLesson}
        />
      )}
    </div>
  );
}