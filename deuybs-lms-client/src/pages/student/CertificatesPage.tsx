import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, ChevronLeft, Calendar, FileCheck, ExternalLink } from 'lucide-react';
import { getMyCertificatesApi } from '../../api/certificate.api';
import ThemeToggle from '../../components/shared/ThemeToggle';
import type { CertificateDto } from '../../types';
import { CertificateModal } from '../../components/shared/CertificateModal';

export default function CertificatesPage() {
  const navigate = useNavigate();
  const [certificates, setCertificates] = useState<CertificateDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCertificate, setSelectedCertificate] = useState<CertificateDto | null>(null);

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
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white relative overflow-hidden font-sans transition-colors duration-300">
      {/* Background glow effects */}
      <div className="absolute top-0 inset-x-0 w-full h-96 bg-gradient-to-b from-indigo-100 dark:from-indigo-900/20 to-transparent pointer-events-none" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-100 dark:bg-emerald-900/10 rounded-full blur-3xl pointer-events-none" />

      <nav className="bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 backdrop-blur-md px-6 py-4 sticky top-0 z-50 shadow-sm transition-colors">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/student/dashboard')} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all cursor-pointer">
              <ChevronLeft size={20} />
            </button>
            <div className="flex items-center gap-2">
              <Award className="text-emerald-500 dark:text-emerald-400" size={20} />
              <span className="font-bold tracking-tight text-slate-900 dark:text-white">Sertifikalarım</span>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-10 relative z-10">
        <div className="mb-10 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-cyan-600 dark:from-emerald-400 dark:to-cyan-400 mb-3">
            Başarı Belgesi Koleksiyonunuz
          </h1>
          <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
            Tamamladığınız kurslardan kazandığınız tüm sertifikalar burada listelenir. İstediğiniz zaman görüntüleyebilir ve doğrulama kodlarını kullanabilirsiniz.
          </p>
        </div>

        {certificates.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm animate-in fade-in duration-700 transition-colors">
            <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-100 dark:border-slate-700">
              <Award className="text-slate-400 dark:text-slate-600" size={48} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Henüz Sertifikanız Yok</h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-8">
              Sertifika kazanmak için kurslara katılın ve tüm dersleri başarıyla tamamlayın.
            </p>
            <button 
              onClick={() => navigate('/student/courses')}
              className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-medium px-6 py-3 rounded-full transition-colors shadow-sm cursor-pointer"
            >
              Kurslara Göz At
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8">
            {certificates.map((cert) => (
              <div 
                key={cert.id} 
                className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-3xl overflow-hidden shadow-sm hover:shadow-lg dark:hover:border-emerald-500 transition-all duration-500"
              >
                {/* Certificate Background Pattern */}
                <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none" 
                     style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, black 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
                
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-100/50 to-cyan-50/50 dark:from-emerald-900/20 dark:to-cyan-900/20 blur-2xl rounded-full group-hover:scale-150 transition-transform duration-700"></div>

                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-8 border-b border-slate-100 dark:border-slate-800 pb-6">
                    <div>
                      <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                        <FileCheck size={14} />
                        Resmi Başarı Belgesi
                      </div>
                      <h3 className="text-2xl font-bold text-slate-900 dark:text-white leading-tight">{cert.courseTitle}</h3>
                    </div>
                    <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/40 rounded-full flex items-center justify-center border border-emerald-100 dark:border-emerald-800 flex-shrink-0">
                      <Award className="text-emerald-500 dark:text-emerald-400" size={24} />
                    </div>
                  </div>

                  <div className="space-y-4 mb-8">
                    <div>
                      <div className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Verilen Kişi</div>
                      <div className="text-lg font-bold text-slate-800 dark:text-slate-200">{cert.studentName}</div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1.5">
                          <Calendar size={14} /> Veriliş Tarihi
                        </div>
                        <div className="font-semibold text-slate-700 dark:text-slate-300">
                          {new Date(cert.issuedAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1.5">
                          <ExternalLink size={14} /> Doğrulama Kodu
                        </div>
                        <div className="font-mono text-sm font-semibold text-cyan-600 dark:text-cyan-400" title={cert.uniqueVerificationCode}>
                          {cert.uniqueVerificationCode.substring(0, 8)}...
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button 
                      onClick={() => setSelectedCertificate(cert)}
                      className="flex-1 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold py-3 px-4 rounded-xl transition-colors text-sm text-center cursor-pointer"
                    >
                      Detayları Görüntüle
                    </button>
                    <button 
                      onClick={() => setSelectedCertificate(cert)}
                      className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 dark:from-emerald-600 dark:to-teal-600 text-white font-semibold py-3 px-4 rounded-xl transition-colors shadow-sm text-sm text-center cursor-pointer"
                    >
                      PDF İndir
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedCertificate && (
        <CertificateModal 
          certificate={selectedCertificate} 
          onClose={() => setSelectedCertificate(null)} 
        />
      )}
    </div>
  );
}
