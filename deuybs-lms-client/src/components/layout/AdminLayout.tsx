import { Navigate, Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { LayoutDashboard, Users, BookOpen, LogOut, Megaphone, Target, ShoppingBag } from 'lucide-react';
import ThemeToggle from '../shared/ThemeToggle';
import NotificationCenter from '../shared/NotificationCenter';
import GlobalAnnouncement from '../shared/GlobalAnnouncement';

export default function AdminLayout() {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  // Protect route
  if (!user || user.role !== 'Admin') {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { path: '/admin/dashboard', icon: <LayoutDashboard className="w-5 h-5" />, label: 'Kontrol Paneli' },
    { path: '/admin/users', icon: <Users className="w-5 h-5" />, label: 'Kullanıcı Yönetimi' },
    { path: '/admin/courses', icon: <BookOpen className="w-5 h-5" />, label: 'Kurs Yönetimi' },
    { path: '/admin/announcements', icon: <Megaphone className="w-5 h-5" />, label: 'Duyurular' },
    { path: '/admin/challenges', icon: <Target className="w-5 h-5" />, label: 'Görev Yönetimi' },
    { path: '/admin/shop', icon: <ShoppingBag className="w-5 h-5" />, label: 'Mağaza Yönetimi' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex text-gray-900 dark:text-gray-100 transition-colors duration-200">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-colors duration-200">
        <div className="p-6">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Yönetici Paneli
          </h1>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {menuItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 font-medium'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-100'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3 mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold">
              {user.fullName[0]}
            </div>
            <div>
              <p className="text-sm font-medium">{user.fullName}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Sistem Yöneticisi</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Çıkış Yap</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <GlobalAnnouncement />
        <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center px-8 justify-end transition-colors duration-200">
          {/* Dashboard Actions */}
          <div className="flex items-center gap-2">
            <NotificationCenter />
            <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-2" />
            <ThemeToggle />
          </div>
        </header>

        <div className="flex-1 overflow-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
