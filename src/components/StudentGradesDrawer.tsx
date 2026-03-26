import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Trophy, ChevronLeft, ChevronRight, Star, BookOpen, Calendar, ClipboardList, GraduationCap, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface StudentGrade {
  id: string;
  name: string;
  weekly: number;
  monthly: number;
  periods: number;
  written: number;
  tests: number;
}

export const StudentGradesDrawer: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [students, setStudents] = useState<StudentGrade[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudents();
  }, []);

  const generateMockData = () => {
    const mockStudents: StudentGrade[] = Array.from({ length: 30 }, (_, i) => ({
      id: `student-${i + 1}`,
      name: `طالب ${i + 1}`,
      weekly: Math.floor(Math.random() * 10) + 90,
      monthly: Math.floor(Math.random() * 10) + 90,
      periods: Math.floor(Math.random() * 10) + 90,
      written: Math.floor(Math.random() * 10) + 90,
      tests: Math.floor(Math.random() * 10) + 90,
    }));
    setStudents(mockStudents);
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      
      const isConfigured = import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY && supabase;
      
      if (!isConfigured) {
        generateMockData();
        return;
      }

      // Try to fetch from Supabase if configured
      const { data, error } = await supabase
        .from('student_grades')
        .select('*')
        .order('name');

      if (error || !data || data.length === 0) {
        generateMockData();
      } else {
        setStudents(data);
      }
    } catch (err) {
      console.error('Error fetching students:', err);
      generateMockData();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="fixed left-0 top-1/2 -translate-y-1/2 z-[9999] h-[85vh] flex items-center"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {/* Trigger Handle - Made extremely small as requested */}
      <motion.div 
        className="bg-emerald-600/60 hover:bg-emerald-600 text-white w-1 h-16 rounded-r-full shadow-sm cursor-pointer flex flex-col items-center justify-center transition-all border-r border-emerald-400/20"
        animate={{ x: isOpen ? -2 : 0 }}
      >
        <div className="opacity-0">
          <ChevronRight size={8} />
        </div>
      </motion.div>

      {/* Expanded Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: -500, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -500, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 120 }}
            className="bg-white w-[500px] h-full shadow-[30px_0_60px_rgba(0,0,0,0.2)] border-r-4 border-emerald-500 rounded-r-[3rem] overflow-hidden flex flex-col relative"
          >
            <div className="p-10 border-b-2 border-gray-100 bg-gradient-to-br from-emerald-50 to-white">
              <div className="flex items-center gap-5 mb-4">
                <div className="bg-emerald-600 p-4 rounded-[1.5rem] text-white shadow-lg shadow-emerald-200">
                  <GraduationCap size={32} />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-gray-900 leading-tight">سجل الدرجات الشامل</h2>
                  <p className="text-emerald-600 font-black text-sm tracking-wide">نظام المتابعة الأكاديمية الذكي</p>
                </div>
              </div>
              {!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY) && (
                <div className="mt-4 p-4 bg-amber-50 text-amber-800 rounded-2xl text-xs font-black flex items-center gap-3 border border-amber-200">
                  <Star size={18} className="text-amber-500 fill-amber-500" />
                  <span>وضع العرض التجريبي: يرجى ربط Supabase للمزامنة الحقيقية</span>
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-gray-50/30">
              <div className="grid grid-cols-6 gap-3 mb-6 px-6 text-[11px] font-black text-gray-400 uppercase tracking-[0.1em] text-center">
                <div className="col-span-2 text-right">اسم الطالب</div>
                <div>أسبوعي</div>
                <div>شهري</div>
                <div>فترات</div>
                <div>تحريري</div>
                <div>اختبار</div>
              </div>

              <div className="space-y-3">
                {students.length > 0 ? (
                  students.map((student, idx) => (
                    <motion.div
                      key={student.id}
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.02 }}
                      className="grid grid-cols-6 gap-3 items-center bg-white p-4 rounded-[1.5rem] border-2 border-transparent shadow-sm hover:shadow-xl hover:border-emerald-500/30 hover:-translate-y-1 transition-all group cursor-default"
                    >
                      <div className="col-span-2 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center text-white font-black text-sm shadow-md group-hover:rotate-12 transition-transform">
                          {idx + 1}
                        </div>
                        <span className="font-black text-gray-900 text-sm truncate">{student.name}</span>
                      </div>
                      
                      <div className="text-center font-black text-emerald-700 bg-emerald-50/50 py-2 rounded-xl text-xs border border-emerald-100">
                        {student.weekly}
                      </div>
                      <div className="text-center font-black text-blue-700 bg-blue-50/50 py-2 rounded-xl text-xs border border-blue-100">
                        {student.monthly}
                      </div>
                      <div className="text-center font-black text-purple-700 bg-purple-50/50 py-2 rounded-xl text-xs border border-purple-100">
                        {student.periods}
                      </div>
                      <div className="text-center font-black text-amber-700 bg-amber-50/50 py-2 rounded-xl text-xs border border-amber-100">
                        {student.written}
                      </div>
                      <div className="text-center font-black text-rose-700 bg-rose-50/50 py-2 rounded-xl text-xs border border-rose-100">
                        {student.tests}
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-20 text-gray-400 font-black">
                    <Users size={48} className="mx-auto mb-4 opacity-20" />
                    <p>جاري تحميل قائمة الطلاب...</p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-8 bg-white border-t-2 border-gray-100 flex justify-between items-center">
              <div className="flex items-center gap-3 text-gray-600 text-sm font-black">
                <div className="bg-gray-100 p-2 rounded-lg">
                  <Users size={20} />
                </div>
                <span>إجمالي المسجلين: {students.length} طالب</span>
              </div>
              <button 
                onClick={fetchStudents}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-2xl font-black text-xs shadow-lg shadow-emerald-100 transition-all flex items-center gap-2 active:scale-95"
              >
                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                تحديث السجل
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}} />
    </div>
  );
};
