import { useEffect, useState } from 'react';
import { announcementApi, type SystemAnnouncement } from '../../api/announcement';
import { useAuthStore } from '../../store/authStore';
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function GlobalAnnouncement() {
  const { user } = useAuthStore();
  const [announcement, setAnnouncement] = useState<SystemAnnouncement | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const fetchActive = async () => {
      // User must be logged in to see announcements (per customer request)
      if (!user) return;
      
      try {
        const data = await announcementApi.getActive(user.role);
        // Check if this specific announcement has been dismissed in this session
        const dismissedId = sessionStorage.getItem('dismissed_announcement');
        if (data && data.id !== dismissedId) {
          setAnnouncement(data);
        }
      } catch (error) {
        console.error('Failed to fetch announcement');
      }
    };
    fetchActive();
  }, [user]);

  const handleDismiss = () => {
    if (announcement) {
      sessionStorage.setItem('dismissed_announcement', announcement.id);
    }
    setDismissed(true);
  };

  if (!announcement || dismissed) return null;

  const getTypeStyles = () => {
    switch (announcement.type) {
      case 'success':
        return {
          bg: 'bg-emerald-600',
          icon: <CheckCircle className="w-5 h-5" />,
          label: 'BAŞARILI'
        };
      case 'warning':
        return {
          bg: 'bg-amber-600',
          icon: <AlertTriangle className="w-5 h-5" />,
          label: 'UYARI'
        };
      case 'error':
        return {
          bg: 'bg-red-600',
          icon: <AlertCircle className="w-5 h-5" />,
          label: 'HATA'
        };
      default:
        return {
          bg: 'bg-indigo-600',
          icon: <Info className="w-5 h-5" />,
          label: 'DUYURU'
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className={`${styles.bg} text-white relative z-[100] overflow-hidden`}
      >
        <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center flex-1 min-w-0 pr-10">
            <span className="flex p-2 rounded-lg bg-white/20 mr-4">
              {styles.icon}
            </span>
            <div className="flex flex-col sm:flex-row sm:items-center">
                <span className="text-[10px] font-black tracking-widest bg-white/20 px-2 py-0.5 rounded-full mr-3 w-fit mb-1 sm:mb-0">
                    {styles.label}
                </span>
                <p className="font-bold text-sm sm:text-base leading-tight">
                    {announcement.message}
                </p>
            </div>
          </div>
          <div className="flex-shrink-0">
            <button
              onClick={handleDismiss}
              className="flex p-2 rounded-md hover:bg-white/10 transition-colors focus:outline-none"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        </div>
        {/* Animated Background Pulse */}
        <div className="absolute inset-0 bg-white/5 animate-pulse pointer-events-none"></div>
      </motion.div>
    </AnimatePresence>
  );
}
