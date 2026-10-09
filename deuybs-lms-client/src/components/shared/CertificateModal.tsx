// Path: src/components/shared/CertificateModal.tsx

import { useState, useRef } from 'react';
import { X, Download, Award, ShieldCheck, Calendar, User, FileText, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import type { CertificateDto } from '../../types';

interface Props {
  certificate: CertificateDto;
  onClose: () => void;
}

export const CertificateModal = ({ certificate, onClose }: Props) => {
  const [downloading, setDownloading] = useState(false);
  const certRef = useRef<HTMLDivElement>(null);

  const formattedDate = new Date(certificate.issuedAt).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const handleDownload = async () => {
    if (!certRef.current) return;
    setDownloading(true);
    const loadingToast = toast.loading('PDF Sertifikanız hazırlanıyor ve indiriliyor...');

    try {
      // Wait for font loading/rendering safety
      await document.fonts.ready;

      const canvas = await html2canvas(certRef.current, {
        scale: 2.5, // High resolution scale for crisp text
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png', 1.0);
      
      // Create landscape A4 PDF
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      // A4 Landscape is 297mm x 210mm
      pdf.addImage(imgData, 'PNG', 0, 0, 297, 210, undefined, 'FAST');
      pdf.save(`sertifika-${certificate.uniqueVerificationCode.substring(0, 8)}.pdf`);
      
      toast.success('Sertifikanız başarıyla indirildi! 🎓', { id: loadingToast });
    } catch (err) {
      console.error('PDF generation error:', err);
      toast.error('PDF oluşturulurken bir hata oluştu.', { id: loadingToast });
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-[100] flex items-center justify-center p-4 font-sans overflow-y-auto">
      {/* Background glow effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[128px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[128px]" />
      </div>

      <div className="relative bg-slate-900 border border-slate-800 shadow-2xl rounded-[32px] w-full max-w-4xl max-h-[95vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300">
        
        {/* Header */}
        <div className="flex justify-between items-center px-8 py-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500/10 text-emerald-400 rounded-xl flex items-center justify-center border border-emerald-500/20">
              <Award size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Sertifika Önizleme</h2>
              <p className="text-xs text-slate-400">Başarı belgenizi görüntüleyin ve PDF olarak indirin</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Certificate Display Area (Responsive Scrollable wrapper) */}
        <div className="flex-1 overflow-auto p-6 md:p-8 bg-slate-950 flex flex-col items-center justify-center min-h-[350px]">
          
          {/* Preview Container scaled down responsively */}
          <div className="w-full overflow-x-auto custom-scrollbar flex justify-center py-4">
            <div className="shadow-2xl rounded-2xl overflow-hidden scale-90 md:scale-100 origin-center transition-all bg-white text-slate-900 select-none">
              
              {/* This is the actual certificate captured by html2canvas. 
                  Fixed dimensions of 1000px x 707px represent A4 landscape at 96 DPI aspect ratio. */}
              <div 
                ref={certRef}
                id="certificate-render-area"
                className="w-[1000px] h-[707px] relative p-12 flex flex-col justify-between overflow-hidden font-sans"
                style={{
                  backgroundColor: '#ffffff',
                  color: '#030712',
                  border: '16px double #e2e8f0',
                  backgroundImage: 'radial-gradient(circle at 2px 2px, #f1f5f9 1.5px, transparent 0)',
                  backgroundSize: '24px 24px',
                }}
              >
                {/* Gold/Navy Corner Ornaments */}
                <div className="absolute top-0 left-0 w-24 h-24 rounded-tl-lg m-4" style={{ borderTop: '8px solid #f59e0b', borderLeft: '8px solid #f59e0b' }} />
                <div className="absolute top-0 right-0 w-24 h-24 rounded-tr-lg m-4" style={{ borderTop: '8px solid #f59e0b', borderRight: '8px solid #f59e0b' }} />
                <div className="absolute bottom-0 left-0 w-24 h-24 rounded-bl-lg m-4" style={{ borderBottom: '8px solid #f59e0b', borderLeft: '8px solid #f59e0b' }} />
                <div className="absolute bottom-0 right-0 w-24 h-24 rounded-br-lg m-4" style={{ borderBottom: '8px solid #f59e0b', borderRight: '8px solid #f59e0b' }} />
                
                {/* Thin Inner Gold Border */}
                <div className="absolute inset-6 pointer-events-none" style={{ border: '1px solid rgba(245, 158, 11, 0.4)' }} />

                {/* Right Top - Verification Code */}
                <div className="absolute top-10 right-10 text-right z-10 font-sans">
                  <div className="text-[9px] font-bold tracking-widest uppercase" style={{ color: '#94a3b8' }}>BELGE DOĞRULAMA KODU</div>
                  <div className="font-mono text-xs font-black px-3 py-1 rounded-md mt-1 shadow-sm inline-block" style={{ backgroundColor: '#f8fafc', border: '1px solid #f1f5f9', color: '#1e293b' }}>
                    {certificate.uniqueVerificationCode}
                  </div>
                </div>

                {/* Certificate Center Content */}
                <div className="my-auto text-center space-y-8 px-12 pt-8">
                  {/* Header Title */}
                  <div className="space-y-2">
                    <h1 className="text-4xl font-extrabold tracking-[0.1em] uppercase font-serif" style={{ color: '#1e1b4b' }}>BAŞARI SERTİFİKASI</h1>
                    <div className="h-0.5 w-48 mx-auto" style={{ background: 'linear-gradient(to right, transparent, #f59e0b, transparent)' }} />
                  </div>

                  <p className="text-sm font-medium tracking-wide italic" style={{ color: '#94a3b8' }}>
                    Bu belge, aşağıda adı yazılı katılımcının eğitim programını başarıyla tamamladığını tescil eder:
                  </p>

                  {/* Student Name */}
                  <div className="py-2">
                    <h2 className="text-4xl font-black tracking-tight font-serif pb-2 inline-block px-12" style={{ color: '#0f172a' }}>
                      {certificate.studentName}
                    </h2>
                  </div>

                  {/* Course Title Description */}
                  <p className="text-base max-w-2xl mx-auto leading-relaxed" style={{ color: '#334155' }}>
                    <strong>"{certificate.courseTitle}"</strong> eğitim programını tüm dersleri, değerlendirmeleri ve final sınavını başarıyla tamamlayarak bu sertifikayı almaya hak kazanmıştır.
                  </p>
                </div>

                {/* Bottom Footer Section */}
                <div className="grid grid-cols-3 items-end pt-6 px-4 z-10" style={{ borderTop: '1px solid #f1f5f9' }}>
                  {/* Left - Verification Info Removed */}
                  <div />

                  {/* Center - Date */}
                  <div className="text-center space-y-1">
                    <div className="text-[8px] font-bold uppercase tracking-widest" style={{ color: '#94a3b8' }}>VERİLİŞ TARİHİ</div>
                    <div className="text-xs font-bold flex items-center justify-center gap-1.5" style={{ color: '#1e293b' }}>
                      <Calendar size={12} style={{ color: '#94a3b8' }} />
                      {formattedDate}
                    </div>
                  </div>

                  {/* Right - Signature */}
                  <div className="text-right flex flex-col items-end space-y-1">
                    <div className="font-serif italic text-base font-bold select-none tracking-wide pr-4" style={{ fontFamily: 'Dancing Script, cursive, Georgia', color: '#0f172a' }}>
                      {certificate.teacherName}
                    </div>
                    <div className="h-px w-36" style={{ backgroundColor: '#e2e8f0' }} />
                    <div className="text-[8px] font-bold uppercase tracking-widest pr-4" style={{ color: '#94a3b8' }}>EĞİTMEN</div>
                  </div>
                </div>

              </div>

            </div>
          </div>

        </div>

        {/* Action Footer */}
        <div className="px-8 py-5 border-t border-slate-800 bg-slate-900/50 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
            <span>Sertifikanız resmi doğrulama koduna sahiptir ve iş başvurularında doğrulanabilir.</span>
          </div>

          <div className="flex gap-3 w-full sm:w-auto">
            <button 
              onClick={onClose}
              className="flex-1 sm:flex-initial px-5 py-3 border border-slate-700 hover:border-slate-600 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all text-sm text-center cursor-pointer"
            >
              Kapat
            </button>
            <button 
              onClick={handleDownload}
              disabled={downloading}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-md shadow-emerald-950/20 text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5"
            >
              <Download size={18} />
              {downloading ? 'İndiriliyor...' : 'PDF Olarak İndir'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
