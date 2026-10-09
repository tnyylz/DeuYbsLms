// Path: src/components/shared/CourseCompletionModal.tsx

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { Award, CheckCircle, ExternalLink, X } from 'lucide-react';
import type { QuizResultDto } from '../../types';
import { generateCertificateApi } from '../../api/certificate.api';
import toast from 'react-hot-toast';

interface Props {
  result: QuizResultDto;
  onClose: () => void;
}

export const CourseCompletionModal = ({ result, onClose }: Props) => {
  const navigate = useNavigate();

  useEffect(() => {
    // Fire confetti when modal opens
    const duration = 3 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#26ccff', '#a25afd', '#ff5e7e', '#88ff5a', '#fcff42', '#ffa62d', '#ff36ff']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#26ccff', '#a25afd', '#ff5e7e', '#88ff5a', '#fcff42', '#ffa62d', '#ff36ff']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
    
    return () => { confetti.reset(); };
  }, []);

  const handleViewCertificates = async () => {
    if (result.enrollmentId) {
      const loadingToast = toast.loading('Sertifikanız hazırlanıyor...');
      try {
        await generateCertificateApi(result.enrollmentId);
        toast.success('Sertifikanız başarıyla oluşturuldu! ✅', { id: loadingToast });
      } catch (err: any) {
        toast.dismiss(loadingToast);
        const errorMsg = err.response?.data?.message || err.response?.data || err.message || 'Başarısız.';
        if (errorMsg.toString().toLowerCase().includes('zaten var')) {
          toast.success('Bu kursa ait sertifikanız halihazırda mevcut.', { id: loadingToast });
        } else {
          toast.error(`Hata: ${errorMsg}`);
          return;
        }
      }
    }
    
    onClose();
    navigate('/student/certificates'); // Fix the routing from /dashboard/certificates to /student/certificates
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 font-sans">
      <div 
        className="bg-white border border-slate-200 rounded-3xl p-8 max-w-md w-full shadow-2xl relative overflow-hidden animate-in fade-in zoom-in duration-300"
      >
        {/* Background glow */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-100 rounded-full blur-3xl opacity-60" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-100 rounded-full blur-3xl opacity-60" />

        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all z-10 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="relative text-center space-y-6">
          <div className="mx-auto w-24 h-24 bg-gradient-to-tr from-emerald-400 to-emerald-500 rounded-full flex items-center justify-center ring-8 ring-emerald-50 shadow-md">
            <Award className="w-12 h-12 text-white" />
          </div>

          <div>
            <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-teal-500 mb-2">
              Kurs Başarıyla Tamamlandı!
            </h2>
            <p className="text-slate-500 font-medium leading-relaxed">
              Mükemmel bir iş çıkardınız. Kursu tamamlayarak sertifika almaya hak kazandınız.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 py-6 border-y border-slate-200 border-dashed">
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 shadow-sm">
              <div className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-1">Kazanılan XP</div>
              <div className="text-2xl font-bold text-amber-500">+{result.xpResult?.xpAwarded || 0}</div>
            </div>
            
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 shadow-sm">
              <div className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-1">Yeni Rozet</div>
              <div className="text-lg font-bold text-indigo-600 flex flex-col items-center justify-center gap-1">
                {result.earnedBadge ? result.earnedBadge : '🏆 Başarı Rozeti'}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button 
              onClick={handleViewCertificates}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold py-4 px-6 rounded-2xl transition-all shadow-md hover:shadow-lg cursor-pointer"
            >
              <CheckCircle className="w-5 h-5" />
              Sertifikalarımı Görüntüle
            </button>
            
            <button 
              onClick={onClose}
              className="w-full flex items-center justify-center gap-2 text-slate-500 hover:text-slate-800 font-bold py-3 px-6 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer border-2 border-transparent hover:border-slate-200"
            >
              Panoya Dön
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
