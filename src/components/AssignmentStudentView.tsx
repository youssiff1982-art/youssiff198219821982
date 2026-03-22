import React, { useState } from 'react';
import { Assignment, Submission } from '../types';
import { Send, CheckCircle, FileText, Clock, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

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
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

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
  };

  if (receivedSubmission?.status === 'graded') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-8 rounded-[2.5rem] shadow-2xl border-r-8 border-emerald-500"
      >
        <div className="text-center space-y-4">
          <div className="bg-emerald-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto text-emerald-600">
            <CheckCircle size={48} />
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
        className="bg-white p-8 rounded-[2.5rem] shadow-2xl border-r-8 border-blue-500"
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-8 rounded-[2.5rem] shadow-2xl border-r-8 border-emerald-500"
    >
      <div className="flex items-center gap-4 mb-8">
        <div className={`p-4 rounded-2xl ${assignment.type === 'exercise' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
          <FileText size={32} />
        </div>
        <div>
          <h3 className="text-2xl font-black text-gray-900">{assignment.title}</h3>
          <p className="text-gray-500 font-bold">{assignment.type === 'exercise' ? 'تدريب صفي' : 'اختبار تقييمي'}</p>
        </div>
      </div>

      <div className="space-y-8">
        {assignment.questions.map((q, idx) => (
          <div key={q.id} className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="bg-emerald-100 text-emerald-700 w-8 h-8 rounded-full flex items-center justify-center font-black text-sm">
                {idx + 1}
              </span>
              <p className="font-bold text-gray-800 text-lg">{q.text}</p>
            </div>
            {q.imageUrl && (
              <div className="rounded-2xl overflow-hidden border-2 border-gray-100 mb-3 bg-gray-50">
                <img src={q.imageUrl} alt="" className="w-full h-auto max-h-[400px] object-contain mx-auto" referrerPolicy="no-referrer" />
              </div>
            )}
            <textarea
              value={answers[q.id || ''] || ''}
              onChange={(e) => setAnswers({ ...answers, [q.id || '']: e.target.value })}
              placeholder="اكتب إجابتك هنا..."
              className="w-full px-6 py-4 rounded-2xl border-2 border-gray-100 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50/50 outline-none transition-all resize-none font-bold text-lg"
              rows={3}
            />
          </div>
        ))}
      </div>

      <div className="mt-10 pt-8 border-t border-gray-100">
        <button
          onClick={handleSubmit}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-5 rounded-3xl font-black text-xl shadow-xl shadow-emerald-200 transition-all flex items-center justify-center gap-3 group"
        >
          <Send size={24} className="group-hover:translate-x-[-4px] transition-transform" />
          إرسال الحل للمعلم
        </button>
        <div className="flex items-center justify-center gap-2 mt-4 text-gray-400 text-sm font-bold">
          <AlertCircle size={16} />
          <span>تأكد من مراجعة إجاباتك قبل الإرسال</span>
        </div>
      </div>
    </motion.div>
  );
};
