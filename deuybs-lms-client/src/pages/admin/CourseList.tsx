import React, { useEffect, useState } from 'react';
import { Trash2, Search, BookOpen, Clock, X, Layout, PlayCircle, Star, GraduationCap } from 'lucide-react';
import { adminApi, type AdminCourse } from '../../api/admin';
import { getCourseDetailApi } from '../../api/courses.api';
import type { CourseDetailDto } from '../../types';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

export default function CourseList() {
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourseDetail, setSelectedCourseDetail] = useState<CourseDetailDto | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Pagination & Filtering state
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const coursesPerPage = 6;

  const fetchCourses = async () => {
    try {
        setLoading(true);
        const data = await adminApi.getAllCourses();
        setCourses(data);
    } catch (error) {
        toast.error('Kurslar yüklenirken hata oluştu');
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleShowDetail = async (courseId: string) => {
    try {
      setIsDetailLoading(true);
      setIsModalOpen(true);
      const data = await getCourseDetailApi(courseId);
      setSelectedCourseDetail(data);
    } catch (error) {
      toast.error('Kurs detayları alınamadı.');
      setIsModalOpen(false);
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handleDelete = async (courseId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent modal from opening when deleting
    if (!window.confirm("Bu kursu kalıcı olarak silmek istediğinize emin misiniz? Bu işlem geri alınamaz!")) return;

    try {
        await adminApi.deleteCourse(courseId);
        toast.success('Kurs başarıyla silindi.');
        fetchCourses();
    } catch {
        toast.error('Kurs silinirken hata oluştu.');
    }
  };

  const getLevelLabel = (level: number) => {
      switch(level) {
          case 1: return { text: 'Başlangıç', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' };
          case 2: return { text: 'Orta', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' };
          case 3: return { text: 'İleri', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' };
          default: return { text: 'Bilinmiyor', color: 'bg-gray-100 text-gray-800' };
      }
  };

  const filteredCourses = courses.filter(c => 
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.teacherName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastCourse = currentPage * coursesPerPage;
  const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
  const currentCourses = filteredCourses.slice(indexOfFirstCourse, indexOfLastCourse);
  const totalPages = Math.ceil(filteredCourses.length / coursesPerPage);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">Tüm Kurslar</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Platformdaki eğitim içeriklerini görüntüleyin ve denetleyin.</p>
        </div>
        
        <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
                type="text" 
                placeholder="Kurs veya Eğitmen ara..." 
                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all shadow-sm dark:text-white"
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentCourses.map(course => {
                    const levelData = getLevelLabel(course.level);
                    return (
                        <div 
                          key={course.id} 
                          onClick={() => handleShowDetail(course.id)}
                          className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col transition-all group cursor-pointer hover:shadow-xl hover:border-purple-200 dark:hover:border-purple-900/30"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${levelData.color}`}>
                                    {levelData.text}
                                </span>
                                <button 
                                    onClick={(e) => handleDelete(course.id, e)}
                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                    title="Kursu Sil"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                            
                            <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">{course.title}</h4>
                            
                            <div className="flex-1"></div>
                            
                            <div className="space-y-3 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700/50 text-sm text-gray-500 dark:text-gray-400">
                                <div className="flex items-center space-x-2">
                                    <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300 flex items-center justify-center text-xs font-bold">
                                        {course.teacherName[0]}
                                    </div>
                                    <span>Eğitmen: {course.teacherName}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <BookOpen className="w-4 h-4" />
                                    <span>{course.enrollmentCount} Öğrenci Kayıtlı</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Clock className="w-4 h-4" />
                                    <span>{new Date(course.createdAt).toLocaleDateString('tr-TR')}</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
            
            {currentCourses.length === 0 && (
                <div className="bg-white dark:bg-gray-800 p-12 text-center rounded-3xl border border-gray-100 dark:border-gray-700">
                    <p className="text-gray-500 dark:text-gray-400">Kurs bulunamadı.</p>
                </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center space-x-2 mt-8">
                    <button 
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(p => p - 1)}
                        className="px-4 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-medium disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm dark:text-gray-300"
                    >
                        Önceki
                    </button>
                    <span className="text-sm font-medium px-4 dark:text-gray-300">
                        Sayfa {currentPage} / {totalPages}
                    </span>
                    <button 
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(p => p + 1)}
                        className="px-4 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-medium disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm dark:text-gray-300"
                    >
                        Sonraki
                    </button>
                </div>
            )}
        </>
      )}

      {/* Course Detail Preview Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-gray-800 w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-gray-700 flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-bold text-xl">
                    <Layout className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Kurs Müfredat Önizleme</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Yönetici Denetim Paneli</p>
                  </div>
                </div>
                <button 
                  onClick={() => { setIsModalOpen(false); setSelectedCourseDetail(null); }}
                  className="p-2 hover:bg-white dark:hover:bg-gray-700 rounded-xl transition-colors cursor-pointer"
                >
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-8">
                {isDetailLoading ? (
                  <div className="flex py-20 items-center justify-center flex-col space-y-4">
                    <div className="w-10 h-10 border-t-2 border-b-2 border-purple-600 rounded-full animate-spin"></div>
                    <p className="text-sm text-gray-500 animate-pulse">Kurs detayları yükleniyor...</p>
                  </div>
                ) : selectedCourseDetail ? (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: General Info */}
                    <div className="space-y-6">
                      <div className="aspect-video rounded-3xl overflow-hidden bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 relative group">
                        {selectedCourseDetail.thumbnailUrl ? (
                          <img 
                            src={selectedCourseDetail.thumbnailUrl} 
                            alt={selectedCourseDetail.title} 
                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <BookOpen className="w-12 h-12 text-gray-400" />
                          </div>
                        )}
                        <div className="absolute top-4 left-4">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            selectedCourseDetail.isPublished 
                              ? 'bg-emerald-500 text-white shadow-emerald-500/50' 
                              : 'bg-amber-500 text-white shadow-amber-500/50'
                          } shadow-lg`}>
                            {selectedCourseDetail.isPublished ? 'YAYINDA' : 'TASLAK'}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white leading-tight">
                          {selectedCourseDetail.title}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                          {selectedCourseDetail.description}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700/50">
                          <GraduationCap className="w-4 h-4 text-purple-600 mb-2" />
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Eğitmen</p>
                          <p className="text-xs font-bold dark:text-white">{selectedCourseDetail.teacherName}</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700/50">
                          <Star className="w-4 h-4 text-yellow-500 mb-2" />
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">XP Ödülü</p>
                          <p className="text-xs font-bold dark:text-white">{selectedCourseDetail.totalXpReward} XP</p>
                        </div>
                      </div>
                    </div>

                    {/* Right: Lesson List */}
                    <div className="lg:col-span-2 space-y-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-lg font-bold text-gray-900 dark:text-white flex items-center space-x-2">
                           <Layout className="w-5 h-5 text-indigo-500" />
                           <span>Ders İçeriği ({selectedCourseDetail.lessons.length})</span>
                        </h4>
                      </div>
                      
                      <div className="space-y-3">
                        {selectedCourseDetail.lessons.map((lesson, idx) => (
                           <div key={lesson.id} className="flex items-center space-x-4 p-4 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700/50 shadow-sm">
                              <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                                {idx + 1}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">{lesson.title}</p>
                                <div className="flex items-center space-x-3 mt-1">
                                  <span className="flex items-center text-[10px] text-gray-500 font-medium">
                                    <PlayCircle className="w-3 h-3 mr-1" />
                                    {Math.floor(lesson.durationInSeconds / 60)} dk
                                  </span>
                                  <span className="flex items-center text-[10px] text-gray-500 font-medium">
                                    <Star className="w-3 h-3 mr-1 text-yellow-500" />
                                    {lesson.xpReward} XP
                                  </span>
                                  {lesson.hasQuiz && (
                                    <span className="text-[10px] bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 font-black px-2 py-0.5 rounded-full">
                                      QUIZ
                                    </span>
                                  )}
                                </div>
                              </div>
                           </div>
                        ))}
                        {selectedCourseDetail.lessons.length === 0 && (
                          <div className="text-center py-12 bg-gray-50 dark:bg-gray-900/30 rounded-[2rem] border-2 border-dashed border-gray-200 dark:border-gray-700">
                             <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                             <p className="text-sm text-gray-500">Müfredata henüz ders eklenmemiş.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
              
              {/* Modal Footer */}
              <div className="p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex justify-between items-center">
                <span className="text-xs text-gray-500 font-medium">
                  Son Güncelleme: {selectedCourseDetail ? new Date().toLocaleDateString('tr-TR') : '-'}
                </span>
                <button 
                  onClick={() => { setIsModalOpen(false); setSelectedCourseDetail(null); }}
                  className="px-8 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-[1.25rem] font-black text-sm hover:scale-105 transition-all shadow-xl active:scale-95 cursor-pointer"
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

