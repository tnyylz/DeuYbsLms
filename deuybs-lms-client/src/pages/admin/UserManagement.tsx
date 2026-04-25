import { useEffect, useState } from 'react';
import { Search, Ban, RefreshCcw, X, Award, Book, Shield, Mail, Calendar, TrendingUp } from 'lucide-react';
import { adminApi, type AdminUser, type AdminUserDetail } from '../../api/admin';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

export default function UserManagement() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUserDetail, setSelectedUserDetail] = useState<AdminUserDetail | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Pagination & Filtering state
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  const fetchUsers = async () => {
    try {
        setLoading(true);
        const data = await adminApi.getAllUsers();
        setUsers(data);
    } catch (error) {
        toast.error('Kullanıcılar yüklenirken hata oluştu');
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (user: AdminUser) => {
    const actionName = user.isActive ? 'Banlamak' : 'Banı kaldırmak';
    if (!window.confirm(`Bu kullanıcının ${actionName.toLowerCase()} istediğinize emin misiniz?`)) return;

    try {
        await adminApi.toggleUserStatus(user.id);
        toast.success(`Kullanıcı durumu güncellendi.`);
        fetchUsers();
    } catch {
        toast.error('Durum değiştirilemedi.');
    }
  };

  const handleShowDetail = async (userId: string) => {
    try {
      setIsDetailLoading(true);
      setIsModalOpen(true);
      const data = await adminApi.getUserDetail(userId);
      setSelectedUserDetail(data);
    } catch (error) {
      toast.error('Kullanıcı detayları alınamadı.');
      setIsModalOpen(false);
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handleChangeRole = async (userId: string, newRole: number) => {
    try {
        await adminApi.updateUserRole(userId, newRole);
        toast.success('Rol güncellendi.');
        fetchUsers();
    } catch {
        toast.error('Rol güncellenemedi.');
    }
  };

  const getRoleId = (role: string | number) => {
    if (typeof role === 'number') return role;
    if (role === 'Student') return 1;
    if (role === 'Teacher') return 2;
    if (role === 'Admin') return 3;
    return 1;
  };

  const filteredUsers = users.filter(u => 
      u.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination calculations
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">Kullanıcı Yönetimi</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Platformdaki tüm kullanıcıları inceleyip rollerini yönetin.</p>
            </div>
            
            <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input 
                    type="text" 
                    placeholder="İsim veya E-posta ara..." 
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all dark:text-white"
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                />
            </div>
        </div>

        {loading ? (
            <div className="flex py-20 items-center justify-center">
                <div className="w-10 h-10 border-t-2 border-b-2 border-purple-600 rounded-full animate-spin"></div>
            </div>
        ) : (
            <>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-200 dark:border-gray-700 text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                <th className="pb-4 font-medium pl-2">Ad Soyad</th>
                                <th className="pb-4 font-medium">E-Posta</th>
                                <th className="pb-4 font-medium">Rol</th>
                                <th className="pb-4 font-medium">Durum</th>
                                <th className="pb-4 font-medium text-right pr-2">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {currentUsers.map((user) => (
                                <tr 
                                  key={user.id} 
                                  className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                                  onClick={() => handleShowDetail(user.id)}
                                >
                                    <td className="py-4 pl-2 font-medium text-gray-900 dark:text-gray-100 flex items-center space-x-3">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/50 dark:to-blue-900/50 flex items-center justify-center text-purple-700 dark:text-purple-300 font-bold text-xs uppercase">
                                            {user.firstName[0]}{user.lastName[0]}
                                        </div>
                                        <span>{user.firstName} {user.lastName}</span>
                                    </td>
                                    <td className="py-4 text-gray-500 dark:text-gray-400">{user.email}</td>
                                    <td className="py-4">
                                        <select 
                                            value={getRoleId(user.role)}  
                                            onChange={(e) => handleChangeRole(user.id, parseInt(e.target.value))}
                                            className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg px-2 py-1 outline-none focus:ring-1 focus:ring-purple-500 text-xs cursor-pointer"
                                        >
                                            <option value={1}>Öğrenci</option>
                                            <option value={2}>Öğretmen</option>
                                            <option value={3}>Admin</option>
                                        </select>
                                    </td>
                                    <td className="py-4">
                                        {user.isActive ? (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                                                Aktif
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                                                Banlı
                                            </span>
                                        )}
                                    </td>
                                    <td className="py-4 text-right pr-2">
                                        <button 
                                            onClick={() => handleToggleStatus(user)}
                                            className={`p-2 rounded-xl transition-colors ${user.isActive ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20' : 'text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'}`}
                                            title={user.isActive ? "Kullanıcıyı Banla" : "Banı Kaldır"}
                                        >
                                            {user.isActive ? <Ban className="w-4 h-4" /> : <RefreshCcw className="w-4 h-4" />}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {currentUsers.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="py-8 text-center text-gray-500">Gösterilecek kayıt bulunamadı.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="flex justify-center items-center space-x-2 mt-8">
                        <button 
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(p => p - 1)}
                            className="px-3 py-1 rounded-lg border border-gray-200 dark:border-gray-700 text-sm disabled:opacity-50 dark:text-gray-300"
                        >
                            Önceki
                        </button>
                        <span className="text-sm font-medium dark:text-gray-300">
                            Sayfa {currentPage} / {totalPages}
                        </span>
                        <button 
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(p => p + 1)}
                            className="px-3 py-1 rounded-lg border border-gray-200 dark:border-gray-700 text-sm disabled:opacity-50 dark:text-gray-300"
                        >
                            Sonraki
                        </button>
                    </div>
                )}
            </>
        )}
      </div>

      {/* User Detail Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-gray-800 w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-gray-700 flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-purple-200 dark:shadow-none">
                    {selectedUserDetail ? (selectedUserDetail.firstName[0] + selectedUserDetail.lastName[0]) : '?'}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Kullanıcı Özeti</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Platform Katılım Detayları</p>
                  </div>
                </div>
                <button 
                  onClick={() => { setIsModalOpen(false); setSelectedUserDetail(null); }}
                  className="p-2 hover:bg-white dark:hover:bg-gray-700 rounded-xl transition-colors cursor-pointer"
                >
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-8 space-y-8">
                {isDetailLoading ? (
                  <div className="flex py-20 items-center justify-center flex-col space-y-4">
                    <div className="w-10 h-10 border-t-2 border-b-2 border-purple-600 rounded-full animate-spin"></div>
                    <p className="text-sm text-gray-500 animate-pulse">Veriler hazırlanıyor...</p>
                  </div>
                ) : selectedUserDetail ? (
                  <>
                    {/* Identification */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-3 p-4 rounded-3xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700/50">
                        <Mail className="w-5 h-5 text-purple-500" />
                        <div>
                          <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">E-Posta</p>
                          <p className="text-sm font-semibold dark:text-white">{selectedUserDetail.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-4 rounded-3xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700/50">
                        <Shield className="w-5 h-5 text-blue-500" />
                        <div>
                          <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Rol</p>
                          <p className="text-sm font-semibold dark:text-white">{getRoleId(selectedUserDetail.role) === 3 ? 'Admin' : getRoleId(selectedUserDetail.role) === 2 ? 'Öğretmen' : 'Öğrenci'}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-4 rounded-3xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700/50">
                        <Calendar className="w-5 h-5 text-emerald-500" />
                        <div>
                          <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Kayıt Tarihi</p>
                          <p className="text-sm font-semibold dark:text-white">{new Date(selectedUserDetail.createdAt).toLocaleDateString('tr-TR')}</p>
                        </div>
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-4 rounded-[2rem] bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-900/20 text-center">
                        <Award className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                        <p className="text-2xl font-black text-purple-700 dark:text-purple-400">{selectedUserDetail.totalXp}</p>
                        <p className="text-[10px] uppercase font-bold text-purple-500">Toplam XP</p>
                      </div>
                      <div className="p-4 rounded-[2rem] bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 text-center">
                        <TrendingUp className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                        <p className="text-2xl font-black text-blue-700 dark:text-blue-400">{selectedUserDetail.currentLevel}</p>
                        <p className="text-[10px] uppercase font-bold text-blue-500">Seviye</p>
                      </div>
                      <div className="p-4 rounded-[2rem] bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/20 text-center">
                        <Book className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
                        <p className="text-2xl font-black text-indigo-700 dark:text-indigo-400">{selectedUserDetail.enrolledCoursesCount}</p>
                        <p className="text-[10px] uppercase font-bold text-indigo-500">Kurs</p>
                      </div>
                      <div className="p-4 rounded-[2rem] bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20 text-center">
                        <Shield className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
                        <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400">{selectedUserDetail.completedCoursesCount}</p>
                        <p className="text-[10px] uppercase font-bold text-emerald-500">Biten</p>
                      </div>
                    </div>

                    {/* Courses List */}
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                        <div className="w-1.5 h-4 bg-purple-600 rounded-full"></div>
                        <span>Kayıtlı Olduğu Kurslar</span>
                      </h4>
                      <div className="space-y-3">
                        {selectedUserDetail.enrollments.map((enroll, idx) => (
                          <div key={idx} className="flex items-center justify-between p-4 rounded-3xl bg-gray-50 dark:bg-gray-900/30 border border-gray-100 dark:border-gray-700/50">
                            <div className="flex-1 min-w-0 pr-4">
                              <p className="text-sm font-bold truncate dark:text-white">{enroll.courseTitle}</p>
                              <div className="flex items-center space-x-2 mt-1">
                                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${enroll.isCompleted ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                                  {enroll.isCompleted ? 'TAMAMLANDI' : 'DEVAM EDİYOR'}
                                </span>
                                <span className="text-[10px] text-gray-400 font-medium">Kayıt: {new Date(enroll.enrolledAt).toLocaleDateString('tr-TR')}</span>
                              </div>
                            </div>
                            <div className="w-16 text-right">
                              <p className="text-xs font-black text-gray-900 dark:text-white">%{enroll.progressPercentage}</p>
                              <div className="w-full bg-gray-200 dark:bg-gray-700 h-1 rounded-full mt-1 overflow-hidden">
                                <div className="bg-purple-600 h-full" style={{ width: `${enroll.progressPercentage}%` }}></div>
                              </div>
                            </div>
                          </div>
                        ))}
                        {selectedUserDetail.enrollments.length === 0 && (
                          <p className="text-xs text-center text-gray-500 py-4 italic">Kullanıcı henüz hiçbir kursa kayıt olmamış.</p>
                        )}
                      </div>
                    </div>
                  </>
                ) : null}
              </div>
              
              {/* Modal Footer */}
              <div className="p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-right">
                <button 
                  onClick={() => { setIsModalOpen(false); setSelectedUserDetail(null); }}
                  className="px-6 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-bold text-sm hover:scale-105 transition-all shadow-lg active:scale-95 cursor-pointer"
                >
                  Kapat
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

