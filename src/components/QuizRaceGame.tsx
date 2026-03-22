import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Star, Timer, CheckCircle, XCircle, Send, HelpCircle, Rocket } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Question } from '../types';

interface QuizRaceGameProps {
  role: 'teacher' | 'student';
  questions: Question[];
  level: 'easy' | 'medium' | 'hard';
  scores?: Record<string, { name: string; score: number }>;
  onScoreUpdate?: (score: number) => void;
  onGameOver?: () => void;
}

export const QuizRaceGame: React.FC<QuizRaceGameProps> = ({ 
  role, 
  questions, 
  level,
  scores = {}, 
  onScoreUpdate,
  onGameOver 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(level === 'easy' ? 180 : level === 'medium' ? 120 : 90);
  const [isGameOver, setIsGameOver] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [studentAnswer, setStudentAnswer] = useState<string>('');

  useEffect(() => {
    if (role === 'student' && !isGameOver) {
      const interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setIsGameOver(true);
            onGameOver?.();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [role, isGameOver, onGameOver]);

  const handleSubmit = () => {
    if (isGameOver || feedback || !studentAnswer) return;

    const currentQ = questions[currentIndex];
    const isCorrect = studentAnswer.trim() === currentQ.correctAnswer?.trim();

    if (isCorrect) {
      const points = 50;
      setScore(s => s + points);
      onScoreUpdate?.(score + points);
      setFeedback('correct');
      confetti({ particleCount: 50, spread: 70 });
    } else {
      setFeedback('wrong');
    }

    setTimeout(() => {
      setFeedback(null);
      setStudentAnswer('');
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(i => i + 1);
      } else {
        setIsGameOver(true);
        onGameOver?.();
      }
    }, 1500);
  };

  if (role === 'teacher') {
    const sortedScores = Object.values(scores).sort((a, b) => b.score - a.score);
    return (
      <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="bg-indigo-100 p-4 rounded-2xl">
              <Rocket className="text-indigo-600 w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">سباق الأسئلة الذكية</h2>
              <p className="text-gray-500">من سيصل لخط النهاية أولاً؟</p>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          {sortedScores.map((s, i) => (
            <motion.div layout key={s.name} className={`flex items-center justify-between p-4 rounded-2xl border-2 ${i === 0 ? 'border-indigo-400 bg-indigo-50' : 'border-gray-100 bg-white'}`}>
              <div className="flex items-center gap-4">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${i === 0 ? 'bg-indigo-400 text-white' : 'bg-gray-100 text-gray-500'}`}>{i + 1}</span>
                <span className="font-bold text-lg text-gray-800">{s.name}</span>
              </div>
              <div className="flex-1 mx-8 bg-gray-100 h-4 rounded-full overflow-hidden relative">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (s.score / (questions.length * 50)) * 100)}%` }}
                  className="absolute inset-y-0 left-0 bg-indigo-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <Star className="text-indigo-500 fill-indigo-500" size={20} />
                <span className="text-2xl font-black text-indigo-600">{s.score}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];

  return (
    <div className="bg-indigo-50 p-8 rounded-[3rem] shadow-2xl max-w-4xl mx-auto text-center relative overflow-hidden min-h-[600px] flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <div className="bg-white/80 backdrop-blur-sm px-6 py-2 rounded-2xl text-indigo-600 font-black text-xl shadow-sm">النقاط: {score}</div>
        <div className="bg-white/80 backdrop-blur-sm px-6 py-2 rounded-2xl text-blue-600 font-black text-xl shadow-sm">الوقت: {timeLeft}s</div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-8">
        <div className="w-full bg-white/50 h-4 rounded-full overflow-hidden mb-4 border border-indigo-100">
          <motion.div 
            animate={{ width: `${(currentIndex / questions.length) * 100}%` }}
            className="h-full bg-indigo-500"
          />
        </div>

        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-10 rounded-[3rem] shadow-xl border-4 border-indigo-200 w-full max-w-2xl"
        >
          <div className="flex items-center gap-3 mb-6 justify-center">
            <HelpCircle className="text-indigo-500" size={32} />
            <h3 className="text-3xl font-black text-gray-800">{currentQ.text}</h3>
          </div>

          {currentQ.type === 'mcq' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentQ.options?.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => setStudentAnswer(opt)}
                  className={`p-5 rounded-2xl border-2 transition-all text-right font-bold text-lg ${studentAnswer === opt ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-white border-gray-100 hover:border-indigo-200'}`}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}

          {currentQ.type === 'tf' && (
            <div className="grid grid-cols-2 gap-6">
              {['صح', 'خطأ'].map(opt => (
                <button
                  key={opt}
                  onClick={() => setStudentAnswer(opt)}
                  className={`p-8 rounded-3xl border-4 transition-all font-black text-3xl ${studentAnswer === opt ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-white border-gray-100 hover:border-indigo-200'}`}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}

          {currentQ.type === 'fill' && (
            <div className="space-y-6">
              <div className="text-5xl font-black tracking-widest text-indigo-600">
                {currentQ.word?.split('').map((c, i) => i === currentQ.blankIndex ? '؟' : c).join('')}
              </div>
              <div className="flex gap-2 flex-wrap justify-center">
                {['أ', 'ب', 'ت', 'ث', 'ج', 'ح', 'خ', 'د', 'ذ', 'ر', 'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ع', 'غ', 'ف', 'ق', 'ك', 'ل', 'م', 'ن', 'هـ', 'و', 'ي'].map(char => (
                  <button
                    key={char}
                    onClick={() => setStudentAnswer(char)}
                    className={`w-12 h-12 rounded-xl border-2 font-bold text-xl transition-all ${studentAnswer === char ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-100 hover:border-indigo-400'}`}
                  >
                    {char}
                  </button>
                ))}
              </div>
            </div>
          )}

          {currentQ.type === 'open' && (
            <textarea
              value={studentAnswer}
              onChange={(e) => setStudentAnswer(e.target.value)}
              placeholder="اكتب إجابتك هنا..."
              className="w-full h-32 p-4 bg-gray-50 rounded-2xl border-none outline-none focus:ring-2 ring-indigo-200 text-right font-bold text-lg resize-none"
              dir="rtl"
            />
          )}

          <button
            onClick={handleSubmit}
            disabled={!studentAnswer}
            className="mt-8 w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold text-xl shadow-lg hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            <Send size={24} />
            إرسال الإجابة
          </button>
        </motion.div>
      </div>

      {feedback && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-10"
        >
          {feedback === 'correct' ? (
            <div className="text-emerald-500 flex flex-col items-center gap-4">
              <CheckCircle size={100} />
              <span className="text-4xl font-black">إجابة صحيحة!</span>
            </div>
          ) : (
            <div className="text-red-500 flex flex-col items-center gap-4">
              <XCircle size={100} />
              <span className="text-4xl font-black">حاول مرة أخرى</span>
            </div>
          )}
        </motion.div>
      )}

      {isGameOver && (
        <div className="absolute inset-0 bg-white z-20 flex flex-col items-center justify-center p-8">
          <Trophy className="w-24 h-24 text-yellow-500 mb-6" />
          <h2 className="text-4xl font-black mb-2">وصلت لخط النهاية!</h2>
          <p className="text-gray-500 mb-8">لقد أتممت السباق بنجاح</p>
          <div className="text-6xl font-black text-indigo-600 mb-8">{score}</div>
          <p className="text-gray-400">في انتظار المعلم...</p>
        </div>
      )}
    </div>
  );
};
