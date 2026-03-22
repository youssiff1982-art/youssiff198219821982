import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Star, Sparkles, CheckCircle, XCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

interface FormationGameProps {
  role: 'teacher' | 'student';
  data: any;
  level: 'easy' | 'medium' | 'hard';
  scores?: Record<string, { name: string; score: number }>;
  onScoreUpdate?: (score: number) => void;
  onGameOver?: () => void;
}

export const FormationGame: React.FC<FormationGameProps> = ({ 
  role, 
  data, 
  level,
  scores = {}, 
  onScoreUpdate,
  onGameOver 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(level === 'easy' ? 60 : level === 'medium' ? 45 : 30);
  const [isGameOver, setIsGameOver] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

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

  const handleChoice = (vowel: string) => {
    if (isGameOver || feedback) return;

    const currentItem = data.items[currentIndex];
    if (currentItem.correctVowel === vowel) {
      setScore(s => s + 25);
      onScoreUpdate?.(score + 25);
      setFeedback('correct');
      confetti({ particleCount: 40, spread: 60 });
    } else {
      setFeedback('wrong');
    }

    setTimeout(() => {
      setFeedback(null);
      if (currentIndex < data.items.length - 1) {
        setCurrentIndex(i => i + 1);
      } else {
        setIsGameOver(true);
        onGameOver?.();
      }
    }, 1000);
  };

  if (role === 'teacher') {
    const sortedScores = Object.values(scores).sort((a, b) => b.score - a.score);
    return (
      <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="bg-purple-100 p-4 rounded-2xl">
              <Sparkles className="text-purple-600 w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">لوحة المتصدرين - لعبة التشكيل</h2>
              <p className="text-gray-500">المستوى: {level === 'easy' ? 'سهل' : level === 'medium' ? 'متوسط' : 'صعب'}</p>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          {sortedScores.map((s, i) => (
            <motion.div layout key={s.name} className={`flex items-center justify-between p-4 rounded-2xl border-2 ${i === 0 ? 'border-purple-400 bg-purple-50' : 'border-gray-100 bg-white'}`}>
              <div className="flex items-center gap-4">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${i === 0 ? 'bg-purple-400 text-white' : 'bg-gray-100 text-gray-500'}`}>{i + 1}</span>
                <span className="font-bold text-lg text-gray-800">{s.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="text-purple-500 fill-purple-500" size={20} />
                <span className="text-2xl font-black text-purple-600">{s.score}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  const currentItem = data.items[currentIndex];

  return (
    <div className="bg-purple-50 p-8 rounded-[3rem] shadow-2xl max-w-4xl mx-auto text-center relative overflow-hidden min-h-[500px] flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <div className="bg-white/80 backdrop-blur-sm px-6 py-2 rounded-2xl text-purple-600 font-black text-xl shadow-sm">النقاط: {score}</div>
        <div className="bg-white/80 backdrop-blur-sm px-6 py-2 rounded-2xl text-blue-600 font-black text-xl shadow-sm">الوقت: {timeLeft}s</div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-12">
        <div className="text-gray-600 text-xl font-bold mb-4">ما هو التشكيل الصحيح للحرف الملون؟</div>
        
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.2, opacity: 0 }}
            className="bg-white p-12 rounded-[3rem] shadow-xl border-4 border-purple-200"
          >
            <div className="text-8xl font-black tracking-widest" dir="rtl">
              {currentItem.word.split('').map((char: string, i: number) => (
                <span key={i} className={i === currentItem.targetIndex ? 'text-purple-600 underline decoration-wavy' : 'text-gray-800'}>
                  {char}
                </span>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="flex gap-6 justify-center">
          {[
            { vowel: 'َ', label: 'فتحة', color: 'bg-orange-500' },
            { vowel: 'ُ', label: 'ضمة', color: 'bg-blue-500' },
            { vowel: 'ِ', label: 'كسرة', color: 'bg-emerald-500' },
            { vowel: 'ْ', label: 'سكون', color: 'bg-gray-500' }
          ].map((v) => (
            <motion.button
              key={v.label}
              whileHover={{ scale: 1.1, y: -5 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleChoice(v.vowel)}
              className={`${v.color} w-24 h-24 rounded-3xl shadow-lg text-white flex flex-col items-center justify-center gap-2 border-b-8 border-black/20`}
            >
              <span className="text-4xl font-black">{v.vowel}</span>
              <span className="text-xs font-bold">{v.label}</span>
            </motion.button>
          ))}
        </div>
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
              <span className="text-4xl font-black">رائع!</span>
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
          <h2 className="text-4xl font-black mb-2">أحسنت يا بطل!</h2>
          <p className="text-gray-500 mb-8">لقد أتقنت مهارة التشكيل</p>
          <div className="text-6xl font-black text-purple-600 mb-8">{score}</div>
          <p className="text-gray-400">في انتظار المعلم...</p>
        </div>
      )}
    </div>
  );
};
