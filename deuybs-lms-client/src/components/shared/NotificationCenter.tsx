// Path: src/components/shared/NotificationCenter.tsx

import { useState, useEffect, useRef } from 'react';
import { Bell, Trophy, Target, Zap, Info, Flame } from 'lucide-react';
import { getNotificationsApi, getUnreadCountApi, markAsReadApi, markAllAsReadApi } from '../../api/notification.api';
import type { NotificationDto } from '../../types';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const [data, count] = await Promise.all([
        getNotificationsApi(),
        getUnreadCountApi()
      ]);
      setNotifications(data);
      setUnreadCount(count);
    } catch (err) {
      console.error('Bildirimler yüklenemedi:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll every 60 seconds (conservative but effective)
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      fetchNotifications();
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsReadApi(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setLoading(true);
      await markAllAsReadApi();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'Achievement': return <Trophy className="text-amber-500" size={18} />;
      case 'Challenge': return <Target className="text-indigo-500" size={18} />;
      case 'LevelUp': return <Zap className="text-emerald-500" size={18} />;
      case 'LeagueUpdate': return <Flame className="text-orange-500" size={18} />;
      default: return <Info className="text-slate-400" size={18} />;
    }
  };

  const getBg = (type: string) => {
    switch (type) {
      case 'Achievement': return 'bg-amber-50 dark:bg-amber-900/10';
      case 'Challenge': return 'bg-indigo-50 dark:bg-indigo-900/10';
      case 'LevelUp': return 'bg-emerald-50 dark:bg-emerald-900/10';
      case 'LeagueUpdate': return 'bg-orange-50 dark:bg-orange-900/10';
      default: return 'bg-slate-50 dark:bg-slate-800/50';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={handleToggle}
        className={`relative p-2.5 rounded-xl transition-all ${isOpen ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400' : 'text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800'}`}
      >
        <Bell size={22} />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 w-4 h-4 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center ring-2 ring-white dark:ring-slate-900 animate-in zoom-in-50 duration-300">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 md:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl shadow-slate-200/50 dark:shadow-none z-[100] overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h3 className="font-black text-xs uppercase tracking-widest text-slate-400">Bildirimler</h3>
            {unreadCount > 0 && (
              <button 
                onClick={handleMarkAllAsRead}
                disabled={loading}
                className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 hover:underline disabled:opacity-50"
              >
                TÜMÜNÜ OKUNDU İŞARETLE
              </button>
            )}
          </div>

          <div className="max-h-[70vh] overflow-y-auto">
            {notifications.length > 0 ? (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {notifications.map((n) => (
                  <div 
                    key={n.id} 
                    className={`p-4 flex gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group ${!n.isRead ? 'border-l-4 border-indigo-600' : 'border-l-4 border-transparent'}`}
                    onClick={() => !n.isRead && handleMarkAsRead(n.id)}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${getBg(n.type)}`}>
                      {getIcon(n.type)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between items-start">
                        <p className={`text-sm font-bold leading-tight ${!n.isRead ? 'text-slate-900 dark:text-slate-100' : 'text-slate-600 dark:text-slate-400'}`}>
                          {n.title}
                        </p>
                        <span className="text-[10px] text-slate-400 whitespace-nowrap ml-2">
                          {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: tr })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                        {n.message}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                  <Bell size={24} />
                </div>
                <p className="text-sm font-bold text-slate-400">Henüz bildirim yok</p>
              </div>
            )}
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 text-center">
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">En yeni etkinlikler</span>
          </div>
        </div>
      )}
    </div>
  );
}
