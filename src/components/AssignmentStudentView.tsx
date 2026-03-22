import React, { useState, useEffect } from 'react';
import { Assignment, Submission, Question } from '../types';
import { Send, CheckCircle, FileText, Clock, AlertCircle, ChevronLeft, ChevronRight, HelpCircle, Trophy, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';

interface AssignmentStudentViewProps {
  assignment: Assignment;
  studentId: string;
  studentName: string;
  onSubmit: (submission: Submission) => void;
  receivedSubmission?: Submission | null;
}

export const AssignmentStudentView: React.FC<AssignmentStudentViewProps> = ({
  assignment,
  studentId,
  studentName,
  onSubmit,
  receivedSubmission
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(assignment.questions.length * 60); // 1 minute per question
  const [isStageTransition, setIsStageTransition] = useState(false);

  useEffect(() => {
    if (!isSubmitted && !receivedSubmission && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isSubmitted, receivedSubmission, timeLeft]);

  const handleSubmit = () => {
    const submission: Submission = {
      id: Math.random().toString(36).substring(7),
      assignmentId: assignment.id,
      studentId,
      studentName,
      answers,
      status: 'submitted',
      submittedAt: new Date().toISOString(),
    };

    onSubmit(submission);
    setIsSubmitted(true);
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < assignment.questions.length - 1) {
      setIsStageTransition(true);
      setTimeout(() => {
        setCurrentQuestionIndex(prev => prev + 1);
        setIsStageTransition(false);
      }, 600);
    } else {
      handleSubmit();
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (receivedSubmission?.status === 'graded') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-8 rounded-[2.5rem] shadow-2xl border-r-8 border-emerald-500 max-w-3xl mx-auto"
      >
        <div className="text-center space-y-4">
          <div className="bg-emerald-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto text-emerald-600">
            <Trophy size={48} />
          </div>
          <h3 className="text-2xl font-black text-gray-900">تم تصحيح {assignment.type === 'exercise' ? 'التدريب' : 'الاختبار'}!</h3>
          <div className="bg-emerald-50 p-6 rounded-3xl inline-block">
            <p className="text-sm text-emerald-600 font-bold mb-1">الدرجة النهائية</p>
            <p className="text-5xl font-black text-emerald-700">{receivedSubmission.score}/100</p>
          </div>
          {receivedSubmission.feedback && (
            <div className="bg-gray-50 p-6 rounded-3xl text-right">
              <p className="text-xs text-gray-400 font-bold mb-2">ملاحظات المعلم:</p>
              <p className="text-gray-700 font-bold italic">"{receivedSubmission.feedback}"</p>
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-8 rounded-[2.5rem] shadow-2xl border-r-8 border-blue-500 max-w-3xl mx-auto"
      >
        <div className="text-center space-y-4">
          <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto text-blue-600">
            <Clock size={48} />
          </div>
          <h3 className="text-2xl font-black text-gray-900">تم إرسال الحل بنجاح!</h3>
          <p className="text-gray-500 font-bold">انتظر حتى يقوم المعلم بتصحيح عملك وإعادته إليك.</p>
        </div>
      </motion.div>
    );
  }

  const currentQ = assignment.questions[currentQuestionIndex];

  const renderQuestionInput = (q: Question) => {
    const qId = q.id || '';
    switch (q.type) {
      case 'mcq':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            {q.options?.map((opt, i) => (
              <button
                key={i}
                onClick={() => setAnswers({ ...answers, [qId]: opt })}
                className={`p-5 rounded-2xl border-2 transition-all text-right font-bold text-lg ${answers[qId] === opt ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-white border-gray-100 hover:border-emerald-200'}`}
              >
                {opt}
              </button>
            ))}
          </div>
        );
      case 'tf':
        return (
          <div className="grid grid-cols-2 gap-6 mt-6">
            {['صح', 'خطأ'].map(opt => (
              <button
                key={opt}
                onClick={() => setAnswers({ ...answers, [qId]: opt })}
                className={`p-8 rounded-3xl border-4 transition-all font-black text-3xl ${answers[qId] === opt ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-white border-gray-100 hover:border-emerald-200'}`}
              >
                {opt}
              </button>
            ))}
          </div>
        );
      case 'fill':
        return (
          <div className="space-y-6 mt-6">
            <div className="text-5xl font-black tracking-widest text-emerald-600 text-center bg-emerald-50 p-8 rounded-3xl">
              {q.word?.split('').map((c, i) => i === q.blankIndex ? '؟' : c).join('')}
            </div>
            <div className="flex gap-2 flex-wrap justify-center">
              {['أ', 'ب', 'ت', 'ث', 'ج', 'ح', 'خ', 'د', 'ذ', 'ر', 'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ع', 'غ', 'ف', 'ق', 'ك', 'ل', 'م', 'ن', 'هـ', 'و', 'ي'].map(char => (
                <button
                  key={char}
                  onClick={() => setAnswers({ ...answers, [qId]: char })}
                  className={`w-12 h-12 rounded-xl border-2 font-bold text-xl transition-all ${answers[qId] === char ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-gray-700 border-gray-100 hover:border-emerald-400'}`}
                >
                  {char}
                </button>
              ))}
            </div>
          </div>
        );
      case 'match':
        return (
          <div className="grid grid-cols-1 gap-4 mt-6">
            {q.matchPairs?.map((pair, i) => (
              <div key={i} className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl border-2 border-gray-100">
                <div className="w-24 h-24 bg-white rounded-xl overflow-hidden border border-gray-200 flex items-center justify-center">
                  {pair.image.startsWith('http') ? (
                    <img src={pair.image} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <span className="text-gray-400 text-xs text-center p-2">{pair.image}</span>
                  )}
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="اكتب الحرف أو الكلمة المقابلة..."
                    value={answers[qId]?.[i] || ''}
                    onChange={(e) => {
                      const currentAnswers = answers[qId] || {};
                      setAnswers({ ...answers, [qId]: { ...currentAnswers, [i]: e.target.value } });
                    }}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 outline-none font-bold text-center"
                    dir="rtl"
                  />
                </div>
              </div>
            ))}
          </div>
        );
      case 'arrange':
        return (
          <div className="space-y-4 mt-6">
            <p className="text-sm font-bold text-gray-500 text-center">رتب العناصر التالية (اكتب الترتيب مفصولاً بفاصلة أو مسافة):</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {q.items?.map((item, idx) => (
                <div key={idx} className="px-4 py-2 bg-white rounded-xl border-2 border-dashed border-gray-200 font-bold text-emerald-600">
                  {item}
                </div>
              ))}
            </div>
            <input
              type="text"
              placeholder="اكتب الترتيب الصحيح هنا..."
              className="w-full px-6 py-4 rounded-2xl border-2 border-gray-200 focus:border-emerald-500 outline-none font-bold text-center text-lg"
              value={answers[qId] || ''}
              onChange={(e) => setAnswers({ ...answers, [qId]: e.target.value })}
              dir="rtl"
            />
          </div>
        );
      case 'analysis':
        return (
          <div className="space-y-4 text-center mt-6">
            <div className="text-4xl font-black text-emerald-600 mb-4 tracking-widest">{q.word}</div>
            <p className="text-sm font-bold text-gray-500">حلل الكلمة إلى مقاطع (افصل بينها بمسافة):</p>
            <input
              type="text"
              placeholder="مثال: مـ ر حـ بـ ا"
              className="w-full px-6 py-4 rounded-2xl border-2 border-gray-200 focus:border-emerald-500 outline-none font-bold text-center text-lg"
              value={answers[qId] || ''}
              onChange={(e) => setAnswers({ ...answers, [qId]: e.target.value })}
              dir="rtl"
            />
          </div>
        );
      case 'formation':
        return (
          <div className="space-y-4 text-center mt-6">
            <div className="flex gap-3 justify-center mb-4">
              {q.syllables?.map((s, idx) => (
                <div key={idx} className="w-14 h-14 flex items-center justify-center bg-emerald-50 rounded-2xl border-2 border-emerald-100 font-black text-emerald-600 text-2xl shadow-sm">
                  {s}
                </div>
              ))}
            </div>
            <p className="text-sm font-bold text-gray-500">كون الكلمة من المقاطع أعلاه:</p>
            <input
              type="text"
              placeholder="اكتب الكلمة هنا..."
              className="w-full px-6 py-4 rounded-2xl border-2 border-gray-200 focus:border-emerald-500 outline-none font-bold text-center text-lg"
              value={answers[qId] || ''}
              onChange={(e) => setAnswers({ ...answers, [qId]: e.target.value })}
              dir="rtl"
            />
          </div>
        );
      case 'math':
        return (
          <div className="space-y-8 text-center mt-6">
            <div className="text-5xl font-black flex items-center justify-center gap-10 text-gray-800">
              <span className="bg-gray-50 px-6 py-4 rounded-3xl border-2 border-gray-100">{q.text.split('[؟]')[0]}</span>
              <div className="w-24 h-24 rounded-3xl border-4 border-dashed border-emerald-300 flex items-center justify-center text-emerald-600 bg-emerald-50 shadow-inner">
                {answers[qId] || '؟'}
              </div>
              <span className="bg-gray-50 px-6 py-4 rounded-3xl border-2 border-gray-100">{q.text.split('[؟]')[1]}</span>
            </div>
            <div className="flex gap-6 justify-center">
              {['>', '<', '='].map((op) => (
                <button
                  key={op}
                  onClick={() => setAnswers({ ...answers, [qId]: op })}
                  className={`w-20 h-20 rounded-3xl font-black text-3xl transition-all duration-300 transform hover:scale-110 ${
                    answers[qId] === op 
                    ? 'bg-emerald-500 text-white shadow-xl -translate-y-2' 
                    : 'bg-white border-2 border-gray-100 text-gray-400 hover:border-emerald-300 hover:bg-emerald-50'
                  }`}
                >
                  {op}
                </button>
              ))}
            </div>
          </div>
        );
      default:
        return (
          <textarea
            value={answers[qId] || ''}
            onChange={(e) => setAnswers({ ...answers, [qId]: e.target.value })}
            placeholder="اكتب إجابتك هنا..."
            className="w-full px-6 py-4 rounded-2xl border-2 border-gray-100 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50/50 outline-none transition-all resize-none font-bold text-lg mt-6"
            rows={4}
            dir="rtl"
          />
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-8 rounded-[2.5rem] shadow-2xl border-r-8 border-emerald-500 max-w-3xl mx-auto relative overflow-hidden"
    >
      {/* Header with Progress and Timer */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl ${assignment.type === 'exercise' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
            <FileText size={24} />
          </div>
          <div>
            <h3 className="text-xl font-black text-gray-900">{assignment.title}</h3>
            <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
              <span>{assignment.type === 'exercise' ? 'تدريب' : 'اختبار'}</span>
              <span>•</span>
              <span>السؤال {currentQuestionIndex + 1} من {assignment.questions.length}</span>
            </div>
          </div>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-black text-lg shadow-sm ${timeLeft < 30 ? 'bg-red-50 text-red-600 animate-pulse' : 'bg-blue-50 text-blue-600'}`}>
          <Clock size={20} />
          <span>{formatTime(timeLeft)}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-100 h-2 rounded-full mb-10 overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${((currentQuestionIndex + 1) / assignment.questions.length) * 100}%` }}
          className="h-full bg-emerald-500"
        />
      </div>

      {/* Question Content */}
      <AnimatePresence mode="wait">
        {!isStageTransition && (
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="min-h-[300px]"
          >
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <span className="bg-emerald-600 text-white w-10 h-10 rounded-2xl flex items-center justify-center font-black text-lg shrink-0 shadow-lg shadow-emerald-100">
                  {currentQuestionIndex + 1}
                </span>
                <div className="space-y-2 w-full">
                  {currentQ.skill && (
                    <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-wider mb-1">
                      {currentQ.skill}
                    </span>
                  )}
                  <p className="font-black text-gray-800 text-2xl leading-relaxed">{currentQ.text}</p>
                  {currentQ.imageUrl && (
                    <div className="rounded-[2rem] overflow-hidden border-4 border-gray-50 shadow-lg bg-gray-50">
                      <img src={currentQ.imageUrl} alt="" className="w-full h-auto max-h-[300px] object-contain mx-auto" referrerPolicy="no-referrer" />
                    </div>
                  )}
                </div>
              </div>

              {renderQuestionInput(currentQ)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation Footer */}
      <div className="mt-12 pt-8 border-t border-gray-100 flex items-center justify-between gap-4">
        <button
          onClick={prevQuestion}
          disabled={currentQuestionIndex === 0}
          className="flex items-center gap-2 px-6 py-4 rounded-2xl font-bold text-gray-500 hover:bg-gray-50 disabled:opacity-30 transition-all"
        >
          <ChevronRight size={20} />
          السابق
        </button>

        <div className="flex-1 flex justify-center">
          {currentQuestionIndex === assignment.questions.length - 1 ? (
            <button
              onClick={handleSubmit}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-10 py-4 rounded-2xl font-black text-xl shadow-xl shadow-emerald-100 transition-all flex items-center gap-3 group"
            >
              <Send size={24} className="group-hover:translate-x-[-4px] transition-transform" />
              إنهاء وإرسال
            </button>
          ) : (
            <button
              onClick={nextQuestion}
              className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-2xl font-black text-xl shadow-xl shadow-blue-100 transition-all flex items-center gap-3 group"
            >
              التالي
              <ChevronLeft size={24} className="group-hover:translate-x-[-4px] transition-transform" />
            </button>
          )}
        </div>
      </div>

      {/* Stage Transition Overlay */}
      <AnimatePresence>
        {isStageTransition && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-emerald-600 flex flex-col items-center justify-center text-white"
          >
            <Sparkles size={80} className="mb-4 animate-bounce" />
            <h2 className="text-4xl font-black">أحسنت!</h2>
            <p className="text-xl font-bold opacity-80">ننتقل للسؤال التالي...</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
