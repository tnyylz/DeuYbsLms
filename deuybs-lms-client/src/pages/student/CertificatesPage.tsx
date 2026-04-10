import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, ChevronLeft, Calendar, FileCheck, ExternalLink } from 'lucide-react';
import { getMyCertificatesApi } from '../../api/certificate.api';
import type { CertificateDto } from '../../types';

export default function CertificatesPage() {
  const navigate = useNavigate();
  const [certificates, setCertificates] = useState<CertificateDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const data = await getMyCertificatesApi();
        setCertificates(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCertificates();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 relative overflow-hidden font-sans">
      {/* Background glow effects */}
      <div className="absolute top-0 inset-x-0 w-full h-96 bg-gradient-to-b from-indigo-100 to-transparent pointer-events-none" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-100 rounded-full blur-3xl pointer-events-none" />

      <nav className="bg-white/80 border-b border-slate-200 backdrop-blur-md px-6 py-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <button onClick={() => navigate('/student/dashboard')} className="text-slate-500 hover:text-indigo-600 transition-colors">
            <ChevronLeft size={20} />
          </button>
          <div className="flex items-center gap-2">
            <Award className="text-emerald-500" size={20} />
            <span className="font-bold tracking-tight text-slate-900">Sertifikalarım</span>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-10 relative z-10">
        <div className="mb-10 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-cyan-600 mb-3">
            Başarı Belgesi Koleksiyonunuz
          </h1>
          <p className="text-slate-500 max-w-2xl mx-auto">
            Tamamladığınız kurslardan kazandığınız tüm sertifikalar burada listelenir. İstediğiniz zaman görüntüleyebilir ve doğrulama kodlarını kullanabilirsiniz.
          </p>
        </div>

        {certificates.length === 0 ? (
          <div className="text-center py-20 bg-white border border-slate-200 rounded-3xl shadow-sm animate-in fade-in duration-700">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-100">
              <Award className="text-slate-400" size={48} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Henüz Sertifikanız Yok</h2>
            <p className="text-slate-500 max-w-md mx-auto mb-8">
              Sertifika kazanmak için kurslara katılın ve tüm dersleri başarıyla tamamlayın.
            </p>
            <button 
              onClick={() => navigate('/student/courses')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-3 rounded-full transition-colors shadow-sm cursor-pointer"
            >
              Kurslara Göz At
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8">
            {certificates.map((cert) => (
              <div 
                key={cert.id} 
                className="group relative bg-white border border-slate-200 p-8 rounded-3xl overflow-hidden shadow-sm hover:shadow-lg hover:border-emerald-200 transition-all duration-500"
              >
                {/* Certificate Background Pattern */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                     style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, black 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
                
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-100 to-cyan-50 blur-2xl rounded-full group-hover:scale-150 transition-transform duration-700"></div>

                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-8 border-b border-slate-100 pb-6">
                    <div>
                      <div className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                        <FileCheck size={14} />
                        Resmi Başarı Belgesi
                      </div>
                      <h3 className="text-2xl font-bold text-slate-900 leading-tight">{cert.courseTitle}</h3>
                    </div>
                    <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center border border-emerald-100 flex-shrink-0">
                      <Award className="text-emerald-500" size={24} />
                    </div>
                  </div>

                  <div className="space-y-4 mb-8">
                    <div>
                      <div className="text-sm font-medium text-slate-500 mb-1">Verilen Kişi</div>
                      <div className="text-lg font-bold text-slate-800">{cert.studentName}</div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm font-medium text-slate-500 mb-1 flex items-center gap-1.5">
                          <Calendar size={14} /> Veriliş Tarihi
                        </div>
                        <div className="font-semibold text-slate-700">
                          {new Date(cert.issuedAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-slate-500 mb-1 flex items-center gap-1.5">
                          <ExternalLink size={14} /> Doğrulama Kodu
                        </div>
                        <div className="font-mono text-sm font-semibold text-cyan-600" title={cert.uniqueVerificationCode}>
                          {cert.uniqueVerificationCode.substring(0, 8)}...
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button className="flex-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold py-3 px-4 rounded-xl transition-colors text-sm text-center">
                      Detayları Görüntüle
                    </button>
                    {cert.pdfStoragePath && (
                      <button className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold py-3 px-4 rounded-xl transition-colors shadow-sm text-sm text-center">
                        PDF İndir
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
