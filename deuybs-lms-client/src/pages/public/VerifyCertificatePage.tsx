// Path: src/pages/public/VerifyCertificatePage.tsx

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Award, ShieldCheck, ShieldAlert, Calendar, User, FileText, CheckCircle2, Home, Download, Eye } from 'lucide-react';
import { verifyCertificateApi } from '../../api/certificate.api';
import type { CertificateDto } from '../../types';
import { CertificateModal } from '../../components/shared/CertificateModal';

export default function VerifyCertificatePage() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  
  const [certificate, setCertificate] = useState<CertificateDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const verify = async () => {
      if (!code) {
        setError('Doğrulama kodu bulunamadı.');
        setLoading(false);
        return;
      }

      try {
        const data = await verifyCertificateApi(code);
        setCertificate(data);
      } catch (err: any) {
        console.error(err);
        setError('Geçersiz veya süresi dolmuş sertifika doğrulama kodu.');
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [code]);

  const formattedDate = certificate
    ? new Date(certificate.issuedAt).toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '';

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center font-sans p-6">
        <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-400 font-medium">Sertifika doğrulanıyor, lütfen bekleyin...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden font-sans flex flex-col justify-between">
      {/* Background glow effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[160px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[160px]" />
      </div>

      {/* Header Logo */}
      <header className="w-full max-w-5xl mx-auto px-6 py-6 flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-900 rounded-xl flex items-center justify-center border border-indigo-800 shadow-lg shadow-indigo-950/50">
            <Award className="text-white" size={20} />
          </div>
          <div>
            <div className="font-black text-white tracking-tight text-sm leading-none">YBS <span className="text-indigo-400">Portal</span></div>
            <div className="text-[7px] font-extrabold tracking-widest text-slate-500 mt-0.5 uppercase">ONLINE EĞİTİM PLATFORMU</div>
          </div>
        </div>
        <button 
          onClick={() => navigate('/')} 
          className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white rounded-xl transition-all text-xs font-bold cursor-pointer"
        >
          <Home size={14} />
          Ana Sayfa
        </button>
      </header>

      {/* Main Verification Card Area */}
      <main className="flex-1 w-full max-w-2xl mx-auto px-6 py-8 flex flex-col justify-center z-10 animate-in fade-in zoom-in duration-500">
        {error || !certificate ? (
          /* Error State - Invalid Certificate */
          <div className="bg-slate-900/60 border border-red-500/20 backdrop-blur-xl p-10 rounded-[32px] text-center shadow-2xl relative overflow-hidden">
            {/* Red glow element */}
            <div className="absolute -top-10 -right-10 w-24 h-24 bg-red-500/10 rounded-full blur-xl" />
            
            <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center border border-red-500/25 mx-auto mb-6 shadow-lg shadow-red-950/20">
              <ShieldAlert size={40} />
            </div>

            <h1 className="text-2xl font-black text-white mb-3">Sertifika Doğrulanamadı</h1>
            <p className="text-slate-400 text-sm max-w-md mx-auto mb-8 leading-relaxed">
              Girdiğiniz doğrulama kodu sistemimizde kayıtlı bir sertifika ile eşleşmedi. Kodun doğruluğunu kontrol edip tekrar deneyiniz.
            </p>

            <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl px-6 py-4 mb-8 text-left font-mono text-xs text-red-400 break-all flex items-center justify-between">
              <span>Kod: {code || 'Bilinmiyor'}</span>
              <span className="text-[10px] font-sans font-bold text-red-500/70 bg-red-500/10 border border-red-500/25 px-2 py-0.5 rounded uppercase shrink-0">Geçersiz</span>
            </div>

            <button 
              onClick={() => navigate('/')} 
              className="px-6 py-3.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 text-white font-bold rounded-2xl transition-all text-sm w-full cursor-pointer shadow-lg hover:-translate-y-0.5"
            >
              Platforma Geri Dön
            </button>
          </div>
        ) : (
          /* Success State - Verified Certificate */
          <div className="bg-slate-900/60 border border-emerald-500/20 backdrop-blur-xl p-8 md:p-10 rounded-[32px] shadow-2xl relative overflow-hidden">
            {/* Gold ornament inside card */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
            
            <div className="w-20 h-20 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center border border-emerald-500/25 mx-auto mb-6 shadow-lg shadow-emerald-950/20 relative">
              <ShieldCheck size={40} />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 text-slate-950 rounded-full flex items-center justify-center border-4 border-slate-900">
                <CheckCircle2 size={12} className="stroke-[3]" />
              </div>
            </div>

            <div className="text-center mb-8">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 font-extrabold text-[10px] tracking-widest uppercase rounded-full mb-3">
                RESMİ DOĞRULANMIŞ BELGE
              </span>
              <h1 className="text-2xl md:text-3xl font-black text-white leading-tight">Sertifika Doğrulandı</h1>
              <p className="text-slate-400 text-xs mt-2 max-w-sm mx-auto leading-relaxed">
                Bu belge YBS Portal veritabanında kayıtlıdır ve doğruluğu onaylanmıştır.
              </p>
            </div>

            {/* Certificate Details */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-6 space-y-4 mb-8">
              {/* Recipient */}
              <div className="flex gap-4 items-start border-b border-slate-900 pb-3.5">
                <div className="w-10 h-10 bg-slate-900 text-slate-400 rounded-xl flex items-center justify-center border border-slate-800 shrink-0">
                  <User size={18} />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">SERTİFİKA SAHİBİ</div>
                  <div className="text-base font-extrabold text-white mt-0.5">{certificate.studentName}</div>
                </div>
              </div>

              {/* Course */}
              <div className="flex gap-4 items-start border-b border-slate-900 pb-3.5">
                <div className="w-10 h-10 bg-slate-900 text-slate-400 rounded-xl flex items-center justify-center border border-slate-800 shrink-0">
                  <Award size={18} />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">EĞİTİM PROGRAMI</div>
                  <div className="text-base font-extrabold text-indigo-300 mt-0.5">{certificate.courseTitle}</div>
                </div>
              </div>

              {/* Instructor */}
              <div className="flex gap-4 items-start border-b border-slate-900 pb-3.5">
                <div className="w-10 h-10 bg-slate-900 text-slate-400 rounded-xl flex items-center justify-center border border-slate-800 shrink-0">
                  <User size={18} className="text-amber-500/70" />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">EĞİTMEN / KOORDİNATÖR</div>
                  <div className="text-base font-bold text-slate-255 mt-0.5">{certificate.teacherName}</div>
                </div>
              </div>

              {/* Verification and Date Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div className="flex gap-3 items-start">
                  <div className="w-9 h-9 bg-slate-900 text-slate-400 rounded-lg flex items-center justify-center border border-slate-800 shrink-0">
                    <Calendar size={16} />
                  </div>
                  <div>
                    <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">VERİLİŞ TARİHİ</div>
                    <div className="text-xs font-bold text-slate-300 mt-0.5">{formattedDate}</div>
                  </div>
                </div>

                <div className="flex gap-3 items-start">
                  <div className="w-9 h-9 bg-slate-900 text-slate-400 rounded-lg flex items-center justify-center border border-slate-800 shrink-0">
                    <FileText size={16} />
                  </div>
                  <div>
                    <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">DOĞRULAMA KODU</div>
                    <div className="text-xs font-mono font-bold text-emerald-400 mt-0.5 break-all">
                      {certificate.uniqueVerificationCode}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button 
                onClick={() => setShowModal(true)}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-black py-4 px-6 rounded-2xl transition-all shadow-lg shadow-emerald-950/20 text-sm hover:-translate-y-0.5 cursor-pointer"
              >
                <Eye size={18} />
                Sertifikayı Görüntüle & İndir
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full text-center py-6 text-[10px] text-slate-500 tracking-wider uppercase font-bold z-10 border-t border-slate-900 bg-slate-950">
        © {new Date().getFullYear()} YBS PORTAL • TÜM HAKLARI SAKLIDIR
      </footer>

      {showModal && certificate && (
        <CertificateModal 
          certificate={certificate} 
          onClose={() => setShowModal(false)} 
        />
      )}
    </div>
  );
}
