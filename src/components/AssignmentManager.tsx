import React, { useState } from 'react';
import { Assignment, Question, Submission } from '../types';
import { Plus, Send, CheckCircle, Clock, User, FileText, Trash2, ChevronRight, ChevronLeft, Upload, Image as ImageIcon, Sparkles, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { generateQuestions } from '../services/geminiService';

interface AssignmentManagerProps {
  type: 'exercise' | 'test';
  assignments: Assignment[];
  submissions: Submission[];
  onSend: (assignment: Assignment) => void;
  onGrade: (submission: Submission) => void;
}

export const AssignmentManager: React.FC<AssignmentManagerProps> = ({
  type,
  assignments,
  submissions,
  onSend,
  onGrade
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleAIGenerate = async () => {
    if (!title.trim()) {
      alert('يرجى كتابة عنوان أو موضوع أولاً ليقوم الذكاء الاصطناعي بإنشاء أسئلة حوله');
      return;
    }
    setIsGenerating(true);
    try {
      const aiQuestions = await generateQuestions(title, type, 'intermediate');
      setQuestions([...questions, ...aiQuestions]);
    } catch (error) {
      console.error("AI Generation Error:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddQuestion = (type: Question['type'] = 'open') => {
    const newQuestion: Question = {
      id: Math.random().toString(36).substring(7),
      type,
      level: 'intermediate',
      text: '',
      options: type === 'mcq' ? ['', '', '', ''] : undefined,
    };
    setQuestions([...questions, newQuestion]);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
        const newQuestion: Question = {
          id: Math.random().toString(36).substring(7),
          type: 'open',
          level: 'intermediate',
          text: file.name.split('.')[0] || 'سؤال من ملف مرفق',
          imageUrl,
        };
        setQuestions(prev => [...prev, newQuestion]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSaveAssignment = () => {
    if (!title.trim() || questions.length === 0) return;
    
    const newAssignment: Assignment = {
      id: Math.random().toString(36).substring(7),
      type,
      title,
      questions,
      createdAt: new Date().toISOString(),
    };
    
    // In a real app, we'd save this to a list. For now, we'll just send it.
    onSend(newAssignment);
    setIsCreating(false);
    setTitle('');
    setQuestions([]);
  };

  const getSubmissionsForAssignment = (assignmentId: string) => {
    return submissions.filter(s => s.assignmentId === assignmentId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-gray-800">
            {type === 'exercise' ? 'إدارة التدريبات' : 'إدارة الاختبارات'}
          </h3>
          <p className="text-gray-500">قم بإنشاء وإرسال {type === 'exercise' ? 'التدريبات' : 'الاختبارات'} لطلابك</p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="bg-emerald-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-emerald-700 transition-all shadow-lg"
        >
          <Plus size={20} />
          {type === 'exercise' ? 'تدريب جديد' : 'اختبار جديد'}
        </button>
      </div>

      {isCreating ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100"
        >
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">عنوان {type === 'exercise' ? 'التدريب' : 'الاختبار'}</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="مثلاً: تدريب على المدود"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-gray-800">الأسئلة</h4>
                  <div className="flex gap-4 flex-wrap justify-end">
                    <label className="text-emerald-600 text-sm font-bold flex items-center gap-1 hover:underline cursor-pointer">
                      <Upload size={16} />
                      رفع صور
                      <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*" multiple />
                    </label>
                    <button
                      onClick={handleAIGenerate}
                      disabled={isGenerating}
                      className="text-purple-600 text-sm font-bold flex items-center gap-1 hover:underline disabled:opacity-50"
                    >
                      {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                      توليد بالذكاء الاصطناعي
                    </button>
                    <div className="relative group">
                      <button className="text-emerald-600 text-sm font-bold flex items-center gap-1 hover:underline">
                        <Plus size={16} />
                        إضافة سؤال
                      </button>
                      <div className="absolute left-0 top-full mt-2 bg-white shadow-2xl rounded-2xl p-4 border border-gray-100 hidden group-hover:grid grid-cols-2 gap-2 z-50 w-80 max-h-96 overflow-y-auto">
                        <button onClick={() => handleAddQuestion('mcq')} className="text-xs font-bold p-2 hover:bg-emerald-50 rounded-xl text-right">اختيار من متعدد</button>
                        <button onClick={() => handleAddQuestion('tf')} className="text-xs font-bold p-2 hover:bg-emerald-50 rounded-xl text-right">صح وخطأ</button>
                        <button onClick={() => handleAddQuestion('fill')} className="text-xs font-bold p-2 hover:bg-emerald-50 rounded-xl text-right">إكمال الحرف</button>
                        <button onClick={() => handleAddQuestion('open')} className="text-xs font-bold p-2 hover:bg-emerald-50 rounded-xl text-right">سؤال مقالي</button>
                        <button onClick={() => handleAddQuestion('match')} className="text-xs font-bold p-2 hover:bg-emerald-50 rounded-xl text-right">توصيل/مطابقة</button>
                        <button onClick={() => handleAddQuestion('arrange')} className="text-xs font-bold p-2 hover:bg-emerald-50 rounded-xl text-right">ترتيب</button>
                        <button onClick={() => handleAddQuestion('analysis')} className="text-xs font-bold p-2 hover:bg-emerald-50 rounded-xl text-right">تحليل كلمات</button>
                        <button onClick={() => handleAddQuestion('formation')} className="text-xs font-bold p-2 hover:bg-emerald-50 rounded-xl text-right">تكوين كلمات</button>
                        <button onClick={() => handleAddQuestion('math')} className="text-xs font-bold p-2 hover:bg-emerald-50 rounded-xl text-right">أكبر وأصغر</button>
                      </div>
                    </div>
                  </div>
                </div>

                {questions.map((q, idx) => (
                  <div key={q.id} className="p-6 bg-gray-50 rounded-[2rem] border border-gray-100 space-y-4 relative group">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="bg-emerald-600 text-white w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs">
                          {idx + 1}
                        </span>
                        <span className="text-xs font-bold text-gray-400">
                          {q.type === 'mcq' ? 'اختيار من متعدد' : 
                           q.type === 'tf' ? 'صح وخطأ' : 
                           q.type === 'fill' ? 'إكمال الحرف' : 
                           q.type === 'match' ? 'توصيل' : 
                           q.type === 'arrange' ? 'ترتيب' :
                           q.type === 'analysis' ? 'تحليل' :
                           q.type === 'formation' ? 'تكوين' :
                           q.type === 'math' ? 'مقارنة' : 'سؤال مقالي'}
                        </span>
                      </div>
                      <button
                        onClick={() => setQuestions(questions.filter((_, i) => i !== idx))}
                        className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <textarea
                        value={q.text}
                        onChange={(e) => {
                          const updated = [...questions];
                          updated[idx].text = e.target.value;
                          setQuestions(updated);
                        }}
                        placeholder="اكتب السؤال هنا..."
                        className="w-full px-5 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none resize-none font-bold"
                        rows={2}
                      />

                      {q.type === 'arrange' && (
                        <div className="space-y-2">
                          <p className="text-xs font-bold text-gray-400">العناصر المراد ترتيبها:</p>
                          {(q.items || ['', '']).map((item, iIdx) => (
                            <input
                              key={iIdx}
                              type="text"
                              value={item}
                              onChange={(e) => {
                                const updated = [...questions];
                                const items = [...(updated[idx].items || ['', ''])];
                                items[iIdx] = e.target.value;
                                updated[idx].items = items;
                                setQuestions(updated);
                              }}
                              placeholder={`عنصر ${iIdx + 1}`}
                              className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm font-bold outline-none"
                            />
                          ))}
                          <button
                            onClick={() => {
                              const updated = [...questions];
                              updated[idx].items = [...(updated[idx].items || []), ''];
                              setQuestions(updated);
                            }}
                            className="text-emerald-600 text-xs font-bold flex items-center gap-1"
                          >
                            <Plus size={14} /> إضافة عنصر
                          </button>
                        </div>
                      )}

                      {(q.type === 'analysis' || q.type === 'formation') && (
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={q.word || ''}
                            onChange={(e) => {
                              const updated = [...questions];
                              updated[idx].word = e.target.value;
                              setQuestions(updated);
                            }}
                            placeholder="الكلمة الكاملة"
                            className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm font-bold outline-none"
                          />
                          <p className="text-xs font-bold text-gray-400">المقاطع:</p>
                          <div className="flex gap-2 flex-wrap">
                            {(q.syllables || ['', '']).map((s, sIdx) => (
                              <input
                                key={sIdx}
                                type="text"
                                value={s}
                                onChange={(e) => {
                                  const updated = [...questions];
                                  const syllables = [...(updated[idx].syllables || ['', ''])];
                                  syllables[sIdx] = e.target.value;
                                  updated[idx].syllables = syllables;
                                  setQuestions(updated);
                                }}
                                className="w-16 px-2 py-2 rounded-xl border border-gray-200 text-sm font-bold text-center outline-none"
                              />
                            ))}
                            <button
                              onClick={() => {
                                const updated = [...questions];
                                updated[idx].syllables = [...(updated[idx].syllables || []), ''];
                                setQuestions(updated);
                              }}
                              className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>
                      )}

                      {q.type === 'mcq' && (
                        <div className="grid grid-cols-2 gap-3">
                          {q.options?.map((opt, optIdx) => (
                            <input
                              key={optIdx}
                              type="text"
                              value={opt}
                              onChange={(e) => {
                                const updated = [...questions];
                                if (updated[idx].options) {
                                  updated[idx].options![optIdx] = e.target.value;
                                  setQuestions(updated);
                                }
                              }}
                              placeholder={`خيار ${optIdx + 1}`}
                              className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                          ))}
                        </div>
                      )}

                      {q.type === 'fill' && (
                        <div className="flex gap-4 items-center bg-white p-4 rounded-2xl border border-gray-100">
                          <input
                            type="text"
                            value={q.word || ''}
                            onChange={(e) => {
                              const updated = [...questions];
                              updated[idx].word = e.target.value;
                              setQuestions(updated);
                            }}
                            placeholder="الكلمة (مثلاً: كتاب)"
                            className="flex-1 px-4 py-2 rounded-xl border border-gray-200 text-sm font-bold outline-none"
                          />
                          <input
                            type="number"
                            value={q.blankIndex || 0}
                            onChange={(e) => {
                              const updated = [...questions];
                              updated[idx].blankIndex = parseInt(e.target.value);
                              setQuestions(updated);
                            }}
                            placeholder="مكان الفراغ (0, 1...)"
                            className="w-24 px-4 py-2 rounded-xl border border-gray-200 text-sm font-bold outline-none"
                          />
                        </div>
                      )}

                      {q.type === 'match' && (
                        <div className="space-y-3 bg-white p-4 rounded-2xl border border-gray-100">
                          <p className="text-xs font-bold text-gray-400 mb-2">أزواج المطابقة (صورة + حرف/كلمة):</p>
                          {(q.matchPairs || [{ image: '', letter: '' }]).map((pair, pIdx) => (
                            <div key={pIdx} className="flex gap-2 items-center">
                              <input
                                type="text"
                                value={pair.image}
                                onChange={(e) => {
                                  const updated = [...questions];
                                  const pairs = [...(updated[idx].matchPairs || [{ image: '', letter: '' }])];
                                  pairs[pIdx].image = e.target.value;
                                  updated[idx].matchPairs = pairs;
                                  setQuestions(updated);
                                }}
                                placeholder="رابط الصورة أو وصفها"
                                className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold outline-none"
                              />
                              <input
                                type="text"
                                value={pair.letter}
                                onChange={(e) => {
                                  const updated = [...questions];
                                  const pairs = [...(updated[idx].matchPairs || [{ image: '', letter: '' }])];
                                  pairs[pIdx].letter = e.target.value;
                                  updated[idx].matchPairs = pairs;
                                  setQuestions(updated);
                                }}
                                placeholder="الحرف/الكلمة"
                                className="w-24 px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold outline-none"
                              />
                              <button 
                                onClick={() => {
                                  const updated = [...questions];
                                  const pairs = (updated[idx].matchPairs || []).filter((_, i) => i !== pIdx);
                                  updated[idx].matchPairs = pairs;
                                  setQuestions(updated);
                                }}
                                className="text-red-400 hover:text-red-600"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          ))}
                          <button
                            onClick={() => {
                              const updated = [...questions];
                              const pairs = [...(updated[idx].matchPairs || []), { image: '', letter: '' }];
                              updated[idx].matchPairs = pairs;
                              setQuestions(updated);
                            }}
                            className="text-emerald-600 text-xs font-bold flex items-center gap-1 hover:underline"
                          >
                            <Plus size={14} />
                            إضافة زوج جديد
                          </button>
                        </div>
                      )}

                      {q.imageUrl && (
                        <div className="relative w-full h-48 rounded-2xl overflow-hidden border-2 border-white shadow-sm bg-white">
                          <img src={q.imageUrl} alt="" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                          <button 
                            onClick={() => {
                              const updated = [...questions];
                              delete updated[idx].imageUrl;
                              setQuestions(updated);
                            }}
                            className="absolute top-2 left-2 bg-red-500 text-white p-1 rounded-lg hover:bg-red-600 shadow-lg"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={handleSaveAssignment}
                className="flex-1 bg-emerald-600 text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-emerald-700 transition-all"
              >
                حفظ وإرسال للطلاب
              </button>
              <button
                onClick={() => setIsCreating(false)}
                className="px-8 py-4 rounded-2xl font-bold text-gray-500 hover:bg-gray-100 transition-all"
              >
                إلغاء
              </button>
            </div>
          </div>
        </motion.div>
      ) : selectedAssignment ? (
        <div className="space-y-6">
          <button
            onClick={() => setSelectedAssignment(null)}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-800 font-bold"
          >
            <ChevronRight size={20} />
            العودة للقائمة
          </button>

          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100">
            <h4 className="text-xl font-bold text-gray-800 mb-6">تسليمات الطلاب: {selectedAssignment.title}</h4>
            
            <div className="space-y-4">
              {getSubmissionsForAssignment(selectedAssignment.id).length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Clock size={48} className="mx-auto mb-4 opacity-20" />
                  <p>لا توجد تسليمات بعد</p>
                </div>
              ) : (
                getSubmissionsForAssignment(selectedAssignment.id).map(sub => (
                  <div key={sub.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="flex items-center gap-4">
                      <div className="bg-emerald-100 p-3 rounded-xl text-emerald-600">
                        <User size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-gray-800">{sub.studentName}</p>
                        <p className="text-xs text-gray-500">
                          {sub.status === 'submitted' ? 'بانتظار التصحيح' : `تم التصحيح: ${sub.score}/100`}
                        </p>
                        {sub.status === 'submitted' && (
                          <div className="mt-2 space-y-3">
                            <p className="font-bold text-xs mb-1">الإجابات:</p>
                            {selectedAssignment.questions.map((q) => (
                              <div key={q.id} className="p-3 bg-white rounded-xl border border-gray-100 text-xs space-y-2">
                                <div className="flex items-center gap-2 text-gray-400 font-bold">
                                  <span>س: {q.text}</span>
                                </div>
                                {q.imageUrl && (
                                  <img src={q.imageUrl} alt="" className="w-20 h-20 object-contain rounded-lg border border-gray-100" referrerPolicy="no-referrer" />
                                )}
                                <div className="bg-emerald-50 p-2 rounded-lg text-emerald-700 font-bold">
                                  ج: {sub.answers[q.id || ''] || 'لم يتم الإجابة'}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {sub.status === 'submitted' ? (
                      <div className="flex flex-col gap-2">
                        <div className="flex gap-2">
                          <input
                            type="number"
                            placeholder="الدرجة / 100"
                            className="w-24 px-3 py-2 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                            id={`score-${sub.id}`}
                          />
                          <button
                            onClick={() => {
                              const scoreInput = document.getElementById(`score-${sub.id}`) as HTMLInputElement;
                              const feedbackInput = document.getElementById(`feedback-${sub.id}`) as HTMLInputElement;
                              const score = parseInt(scoreInput?.value || '0');
                              const feedback = feedbackInput?.value || '';
                              
                              onGrade({
                                ...sub,
                                status: 'graded',
                                score,
                                feedback,
                                gradedAt: new Date().toISOString()
                              });
                            }}
                            className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-emerald-700 transition-all"
                          >
                            رصد الدرجة
                          </button>
                        </div>
                        <input
                          type="text"
                          placeholder="أضف ملاحظاتك هنا..."
                          className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                          id={`feedback-${sub.id}`}
                        />
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-emerald-600 font-bold">
                        <CheckCircle size={18} />
                        تم الإرسال
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assignments.filter(a => a.type === type).map(a => (
            <motion.div
              key={a.id}
              whileHover={{ y: -5 }}
              className="bg-white p-6 rounded-[2rem] shadow-xl border border-gray-100 flex flex-col gap-4"
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${type === 'exercise' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
                <FileText size={24} />
              </div>
              <div>
                <h4 className="text-xl font-bold text-gray-900">{a.title}</h4>
                <p className="text-sm text-gray-500">{a.questions.length} أسئلة</p>
              </div>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <Clock size={14} />
                  {new Date(a.createdAt).toLocaleDateString('ar-EG')}
                </div>
                <button
                  onClick={() => setSelectedAssignment(a)}
                  className="text-emerald-600 font-bold text-sm flex items-center gap-1 hover:underline"
                >
                  عرض التسليمات
                  <ChevronLeft size={16} />
                </button>
              </div>
            </motion.div>
          ))}
          
          {assignments.filter(a => a.type === type).length === 0 && (
            <div className="col-span-full py-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-gray-100">
              <FileText size={64} className="mx-auto mb-4 text-gray-200" />
              <p className="text-gray-400 font-bold">لا توجد {type === 'exercise' ? 'تدريبات' : 'اختبارات'} حالياً</p>
              <button
                onClick={() => setIsCreating(true)}
                className="mt-4 text-emerald-600 font-bold hover:underline"
              >
                ابدأ بإنشاء أول {type === 'exercise' ? 'تدريب' : 'اختبار'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
