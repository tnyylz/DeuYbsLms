import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6 font-sans">
          <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-[32px] p-10 shadow-2xl border border-slate-200 dark:border-slate-800 text-center">
            <div className="w-20 h-20 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg shadow-red-200 dark:shadow-none">
              <AlertCircle size={40} />
            </div>
            
            <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-4 tracking-tight uppercase">BİR ŞEYLER TERS GİTTİ</h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium mb-8 leading-relaxed">
              Uygulama çalışırken beklenmedik bir hata oluştu. Bu genellikle tarayıcı eklentileri (çeviri vb.) veya geçici bir bağlantı sorunundan kaynaklanabilir.
            </p>

            <div className="space-y-4">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-xl shadow-indigo-200 dark:shadow-none hover:-translate-y-1"
              >
                <RefreshCw size={20} />
                Sayfayı Yenile
              </button>
              
              <button
                onClick={() => window.location.href = '/'}
                className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-3"
              >
                <Home size={20} />
                Ana Sayfaya Dön
              </button>
            </div>

            {import.meta.env.DEV && this.state.error && (
              <div className="mt-8 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl text-left overflow-auto max-h-40 border border-slate-200 dark:border-slate-700">
                <p className="text-[10px] font-mono text-red-500 font-bold mb-2 uppercase">Hata Detayı (Geliştirici):</p>
                <code className="text-xs font-mono text-slate-600 dark:text-slate-400 break-words">
                  {this.state.error.toString()}
                </code>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
