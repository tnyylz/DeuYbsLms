// Path: src/pages/student/LearningKanban.tsx

import { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import { kanbanApi, KanbanStatus } from '../../api/kanban.api';
import type { KanbanBoard, KanbanStatus as KanbanStatusType } from '../../api/kanban.api';
import { 
  BookOpen, 
  ChevronLeft, 
  MoreVertical, 
  PlayCircle, 
  CheckCircle2, 
  Clock, 
  RotateCcw, 
  PlusCircle,
  Layout
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getFileUrl } from '../../utils/fileUtils';
import toast from 'react-hot-toast';

const STATUS_CONFIG = {
  [KanbanStatus.Recommended]: {
    color: 'bg-slate-100 dark:bg-slate-800/50',
    borderColor: 'border-slate-200 dark:border-slate-700',
    icon: PlusCircle,
    textColor: 'text-slate-600 dark:text-slate-400',
    badge: 'bg-slate-200/50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300'
  },
  [KanbanStatus.ToDo]: {
    color: 'bg-blue-50/50 dark:bg-blue-900/10',
    borderColor: 'border-blue-100 dark:border-blue-900/30',
    icon: Clock,
    textColor: 'text-blue-600 dark:text-blue-400',
    badge: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
  },
  [KanbanStatus.InProgress]: {
    color: 'bg-amber-50/50 dark:bg-amber-900/10',
    borderColor: 'border-amber-100 dark:border-amber-900/30',
    icon: PlayCircle,
    textColor: 'text-amber-600 dark:text-amber-400',
    badge: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
  },
  [KanbanStatus.Revisit]: {
    color: 'bg-purple-50/50 dark:bg-purple-900/10',
    borderColor: 'border-purple-100 dark:border-purple-900/30',
    icon: RotateCcw,
    textColor: 'text-purple-600 dark:text-purple-400',
    badge: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
  },
  [KanbanStatus.Done]: {
    color: 'bg-emerald-50/50 dark:bg-emerald-900/10',
    borderColor: 'border-emerald-100 dark:border-emerald-900/30',
    icon: CheckCircle2,
    textColor: 'text-emerald-600 dark:text-emerald-400',
    badge: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
  }
};

export default function LearningKanban() {
  const [board, setBoard] = useState<KanbanBoard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBoard();
  }, []);

  const fetchBoard = async () => {
    try {
      const data = await kanbanApi.getBoard();
      setBoard(data);
    } catch (error) {
      toast.error('Pano yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    // Optimistic Update
    const sourceColIndex = board!.columns.findIndex(c => c.status.toString() === source.droppableId);
    const destColIndex = board!.columns.findIndex(c => c.status.toString() === destination.droppableId);
    
    const sourceCol = board!.columns[sourceColIndex];
    const destCol = board!.columns[destColIndex];
    
    const item = sourceCol.cards.find(c => c.courseId === draggableId);
    if (!item) return;

    const newSourceCards = [...sourceCol.cards];
    newSourceCards.splice(source.index, 1);
    
    const newDestCards = [...destCol.cards];
    newDestCards.splice(destination.index, 0, item);

    const newBoard = { ...board! };
    newBoard.columns[sourceColIndex] = { ...sourceCol, cards: newSourceCards };
    newBoard.columns[destColIndex] = { ...destCol, cards: newDestCards };
    
    setBoard(newBoard);

    try {
      await kanbanApi.moveCard(draggableId, destination.droppableId as KanbanStatusType);
    } catch (error) {
      toast.error('Taşıma işlemi başarısız.');
      fetchBoard(); // Rollback
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] p-6 lg:p-8 transition-colors duration-300">
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link 
            to="/student/dashboard" 
            className="inline-flex items-center text-slate-500 hover:text-indigo-600 font-medium text-sm gap-1 mb-2 transition-colors"
          >
            <ChevronLeft size={16} />
            Dashboard'a Dön
          </Link>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
            <Layout className="text-indigo-600" />
            Öğrenme Panosu
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Eğitim sürecini sürükle-bırak yöntemiyle planla ve yönet.</p>
        </div>
      </header>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide">
          {board?.columns.map((column) => {
            const config = STATUS_CONFIG[column.status];
            const StatusIcon = config.icon;

            return (
              <div key={column.status} className="flex-shrink-0 w-80">
                <div className={`mb-4 flex items-center justify-between p-3 rounded-2xl ${config.color} border ${config.borderColor} backdrop-blur-sm`}>
                  <div className="flex items-center gap-2.5">
                    <div className={`p-1.5 rounded-lg ${config.badge}`}>
                      <StatusIcon size={18} />
                    </div>
                    <h2 className="font-bold text-slate-800 dark:text-slate-200 text-sm uppercase tracking-wider">
                      {column.title}
                    </h2>
                    <span className={`ml-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${config.badge}`}>
                      {column.cards.length}
                    </span>
                  </div>
                  <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                    <MoreVertical size={18} />
                  </button>
                </div>

                <Droppable droppableId={column.status.toString()}>
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={`min-h-[calc(100vh-280px)] rounded-2xl transition-colors duration-200 p-2 ${
                        snapshot.isDraggingOver ? 'bg-slate-100/50 dark:bg-slate-800/30' : 'bg-transparent'
                      }`}
                    >
                      <AnimatePresence>
                        {column.cards.map((card, index) => (
                          <Draggable key={card.courseId} draggableId={card.courseId} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="mb-3"
                              >
                                <motion.div
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.95 }}
                                  className={`bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-all group ${
                                    snapshot.isDragging ? 'ring-2 ring-indigo-500 shadow-xl scale-105 z-50' : ''
                                  }`}
                                >
                                  <div className="flex items-start gap-4">
                                    {card.thumbnailUrl ? (
                                      <img 
                                        src={getFileUrl(card.thumbnailUrl)} 
                                        alt={card.title}
                                        className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                                      />
                                    ) : (
                                      <div className="w-12 h-12 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center text-indigo-600 flex-shrink-0">
                                        <BookOpen size={20} />
                                      </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                      <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm leading-tight truncate group-hover:text-indigo-600 transition-colors">
                                        {card.title}
                                      </h3>
                                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">
                                        {card.instructorName}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="mt-4">
                                    <div className="flex items-center justify-between text-[10px] mb-1.5">
                                      <span className="font-bold text-slate-600 dark:text-slate-400">
                                        {card.progressPercentage}% Tamamlandı
                                      </span>
                                      <span className="text-slate-400">
                                        {card.completedLessons}/{card.totalLessons} Ders
                                      </span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                      <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${card.progressPercentage}%` }}
                                        className="h-full bg-indigo-500 rounded-full"
                                      />
                                    </div>
                                  </div>

                                  <div className="mt-4 pt-3 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                                    <div className="flex items-center gap-1.5 text-slate-400">
                                      <Clock size={12} />
                                      <span className="text-[10px]">
                                        {card.lastAccessed ? 'Aktif' : 'Yeni'}
                                      </span>
                                    </div>
                                    <Link 
                                      to={`/course/${card.courseId}/detail`}
                                      className="p-1 text-slate-400 hover:text-indigo-600 transition-colors"
                                    >
                                      <PlayCircle size={18} />
                                    </Link>
                                  </div>
                                </motion.div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                      </AnimatePresence>
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
}
