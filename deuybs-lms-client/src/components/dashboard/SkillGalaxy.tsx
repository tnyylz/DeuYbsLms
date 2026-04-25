import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import type { EnrollmentDto, CourseDto } from '../../types';
import { getFileUrl } from '../../utils/fileUtils';
import { BookOpen, CheckCircle, Lock, Play } from 'lucide-react';

interface SkillGalaxyProps {
  enrollments: EnrollmentDto[];
  allCourses: CourseDto[];
}

export default function SkillGalaxy({ enrollments, allCourses }: SkillGalaxyProps) {
  const navigate = useNavigate();

  // Organize courses into levels
  const levels = {
    Beginner: allCourses.filter(c => c.level === 'Beginner'),
    Intermediate: allCourses.filter(c => c.level === 'Intermediate'),
    Advanced: allCourses.filter(c => c.level === 'Advanced'),
  };

  const getEnrollment = (courseId: string) => enrollments.find(e => e.courseId === courseId);

  const renderPlanet = (course: CourseDto, x: number, y: number, index: number) => {
    const enrollment = getEnrollment(course.id);
    const isCompleted = enrollment?.isCourseCompleted || enrollment?.progressPercentage === 100;
    const isEnrolled = !!enrollment;
    
    // Status colors/effects
    const status = isCompleted ? 'completed' : isEnrolled ? 'in-progress' : 'locked';
    
    return (
      <motion.div
        key={course.id}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: index * 0.1, type: 'spring', stiffness: 100 }}
        style={{ position: 'absolute', left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}
        className="group z-10"
      >
        <div className="relative cursor-pointer" onClick={() => navigate(`/course/${course.id}/detail`)}>
          {/* Planet Visual */}
          <motion.div
            animate={status === 'in-progress' ? { rotate: 360 } : {}}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className={`w-20 h-20 rounded-full flex items-center justify-center relative transition-all duration-500
              ${status === 'completed' ? 'bg-indigo-600 shadow-[0_0_30px_rgba(79,70,229,0.5)] border-2 border-indigo-300' : 
                status === 'in-progress' ? 'bg-indigo-500 shadow-[0_0_20px_rgba(79,70,229,0.3)] border-2 border-dashed border-white/50 animate-pulse' : 
                'bg-slate-200 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 opacity-60 grayscale'}`}
          >
            {course.thumbnailUrl ? (
              <img src={getFileUrl(course.thumbnailUrl)} className="w-full h-full rounded-full object-cover p-1" alt="" />
            ) : (
              <BookOpen size={24} className={status === 'locked' ? 'text-slate-400' : 'text-white'} />
            )}

            {/* Status Badge */}
            <div className="absolute -top-1 -right-1 bg-white dark:bg-slate-900 rounded-full p-1 shadow-lg border border-slate-100 dark:border-slate-800">
              {status === 'completed' ? <CheckCircle className="text-emerald-500 w-4 h-4" /> : 
               status === 'in-progress' ? <Play className="text-indigo-600 w-3 h-3 translate-x-0.5" fill="currentColor" /> : 
               <Lock className="text-slate-400 w-4 h-4" />}
            </div>

            {/* ORBIT RING for in-progress */}
            {status === 'in-progress' && (
                <div className="absolute -inset-2 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin"></div>
            )}
          </motion.div>

          {/* Label */}
          <div className="absolute top-24 left-1/2 -translate-x-1/2 w-40 text-center pointer-events-none transition-all duration-300 group-hover:scale-110">
            <h4 className={`text-xs font-black uppercase tracking-tighter mb-1 transition-colors
              ${status === 'locked' ? 'text-slate-400' : 'text-slate-900 dark:text-white'}`}>
              {course.title}
            </h4>
            {isEnrolled && (
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-1 rounded-full overflow-hidden mx-auto max-w-[60px]">
                    <div className="h-full bg-indigo-500" style={{ width: `${enrollment.progressPercentage}%` }}></div>
                </div>
            )}
          </div>
          
          {/* Tooltip on Hover */}
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-2xl opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 transition-all pointer-events-none w-56 z-50">
             <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1">{course.level}</p>
             <p className="text-sm font-bold text-slate-800 dark:text-white mb-2 leading-tight">{course.title}</p>
             <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                    {course.tags.slice(0, 2).map((tag, i) => (
                        <span key={i} className="text-[9px] font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full border border-white dark:border-slate-900">{tag}</span>
                    ))}
                </div>
                <span className="text-[10px] text-slate-400 ml-auto font-bold">{course.totalXpReward} XP</span>
             </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="relative w-full h-[700px] bg-slate-950 rounded-[3rem] overflow-hidden border-4 border-slate-900 shadow-2xl group/galaxy">
      {/* Background Stars/Galaxy effect */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-40"></div>
      <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/5 rounded-full blur-[120px]"></div>
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-600/10 rounded-full blur-[80px] animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] animate-pulse duration-5000"></div>
      </div>

      {/* SVG Connections Layer */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30">
        <defs>
          <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#4f46e5" stopOpacity="0" />
            <stop offset="50%" stopColor="#4f46e5" stopOpacity="1" />
            <stop offset="100%" stopColor="#4f46e5" stopOpacity="0" />
          </linearGradient>
        </defs>
        
        {/* Simple connecting path logic: Draw lines between levels */}
        {/* We'll draw them loosely to look organic */}
        <path 
            d="M 10,350 Q 250,50 500,350 T 990,350" 
            fill="none" 
            stroke="url(#lineGrad)" 
            strokeWidth="2" 
            strokeDasharray="8,8"
            className="animate-[dash_60s_linear_infinite]"
        />
      </svg>

      <style>{`
        @keyframes dash {
          to { stroke-dashoffset: -1000; }
        }
      `}</style>

      {/* Level Labels */}
      <div className="absolute bottom-10 left-0 w-full flex justify-around px-20">
         <div className="text-center">
            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest px-4 py-1 bg-indigo-950/50 border border-indigo-900/50 rounded-full">BAŞLANGIÇ</span>
         </div>
         <div className="text-center">
            <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest px-4 py-1 bg-purple-950/50 border border-purple-900/50 rounded-full">ORTA SEVİYE</span>
         </div>
         <div className="text-center">
            <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest px-4 py-1 bg-amber-950/50 border border-amber-900/50 rounded-full">İLERİ SEVİYE</span>
         </div>
      </div>

      {/* Planet Layer */}
      <div className="absolute inset-0 p-20">
        {/* Beginner Row */}
        {levels.Beginner.map((c, i) => renderPlanet(c, 10 + (i * 5), 30 + (i * 20), i))}
        
        {/* Intermediate Row */}
        {levels.Intermediate.map((c, i) => renderPlanet(c, 40 + (i * 10), 20 + (i * 25), i + 5))}
        
        {/* Advanced Row */}
        {levels.Advanced.map((c, i) => renderPlanet(c, 80 + (i * 5), 30 + (i * 20), i + 10))}
      </div>

      {/* Instruction */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 text-white/40 text-[9px] font-bold tracking-widest uppercase pointer-events-none">
          Skill Galaxy &bull; İlerlemek İçin Bir Gezegene Tıkla
      </div>
    </div>
  );
}
