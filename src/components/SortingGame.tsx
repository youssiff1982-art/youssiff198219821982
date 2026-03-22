import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Star, MousePointer2, CheckCircle, XCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

interface SortingGameProps {
  role: 'teacher' | 'student';
  data: any;
  level: 'easy' | 'medium' | 'hard';
  scores?: Record<string, { name: string; score: number }>;
  onScoreUpdate?: (score: number) => void;
  onGameOver?: () => void;
}

export const SortingGame: React.FC<SortingGameProps> = ({ 
  role, 
  data, 
  level,
  scores = {}, 
  onScoreUpdate,
  onGameOver 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [stage, setStage] = useState(1);
  const [timeLeft, setTimeLeft] = useState(level === 'easy' ? 120 : level === 'medium' ? 90 : 60);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isStageTransition, setIsStageTransition] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  useEffect(() => {
    if (role === 'student' && !isGameOver && !isStageTransition) {
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
  }, [role, isGameOver, isStageTransition, onGameOver]);

  const handleSort = (type: 'shamsiya' | 'qamariya') => {
    if (isGameOver || feedback || isStageTransition) return;

    const currentWord = data.words[currentIndex];
    if (currentWord.type === type) {
      const points = 20 * stage;
      setScore(s => s + points);
      onScoreUpdate?.(score + points);
      setFeedback('correct');
      confetti({ particleCount: 40, spread: 60 });
    } else {
      setFeedback('wrong');
    }

    setTimeout(() => {
      setFeedback(null);
      if (currentIndex < data.words.length - 1) {
        setCurrentIndex(i => i + 1);
      } else {
        if (stage < 3) {
          handleNextStage();
        } else {
          setIsGameOver(true);
          onGameOver?.();
        }
      }
    }, 1000);
  };

  const handleNextStage = () => {
    setIsStageTransition(true);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
    setTimeout(() => {
      setStage(prev => prev + 1);
      setCurrentIndex(0);
      setTimeLeft(prev => prev + 60); // Add 60 seconds for next stage
      setIsStageTransition(false);
    }, 3000);
  };

  if (role === 'teacher') {
    const sortedScores = Object.values(scores).sort((a, b) => b.score - a.score);
    return (
      <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="bg-orange-100 p-4 rounded-2xl">
              <Trophy className="text-orange-600 w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">لوحة المتصدرين - فرز اللام</h2>
              <p className="text-gray-500">المستوى: {level === 'easy' ? 'سهل' : level === 'medium' ? 'متوسط' : 'صعب'}</p>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          {sortedScores.map((s, i) => (
            <motion.div layout key={s.name} className={`flex items-center justify-between p-4 rounded-2xl border-2 ${i === 0 ? 'border-orange-400 bg-orange-50' : 'border-gray-100 bg-white'}`}>
              <div className="flex items-center gap-4">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${i === 0 ? 'bg-orange-400 text-white' : 'bg-gray-100 text-gray-500'}`}>{i + 1}</span>
                <span className="font-bold text-lg text-gray-800">{s.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="text-orange-500 fill-orange-500" size={20} />
                <span className="text-2xl font-black text-orange-600">{s.score}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  const currentWord = data.words[currentIndex];

  return (
    <div className="bg-white p-8 rounded-[3rem] shadow-2xl max-w-2xl mx-auto text-center relative overflow-hidden">
      <div className="flex justify-between items-center mb-12">
        <div className="bg-orange-50 px-6 py-2 rounded-2xl text-orange-600 font-black text-xl">النقاط: {score}</div>
        <div className="bg-yellow-50 px-6 py-2 rounded-2xl text-yellow-600 font-black text-xl">المرحلة: {stage}</div>
        <div className="bg-blue-50 px-6 py-2 rounded-2xl text-blue-600 font-black text-xl">الوقت: {timeLeft}s</div>
      </div>

      <h3 className="text-gray-500 mb-4 font-bold">صنف الكلمة التالية:</h3>
      
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 1.2, opacity: 0 }}
          className="text-7xl font-black text-gray-900 mb-16 py-12 bg-gray-50 rounded-[2rem] border-4 border-dashed border-gray-200"
        >
          {currentWord.word}
        </motion.div>
      </AnimatePresence>

      <div className="grid grid-cols-2 gap-6">
        <button
          onClick={() => handleSort('shamsiya')}
          className="bg-sky-500 hover:bg-sky-600 text-white p-8 rounded-3xl text-3xl font-black shadow-xl shadow-sky-100 transition-all active:scale-95"
        >
          لام شمسية
        </button>
        <button
          onClick={() => handleSort('qamariya')}
          className="bg-emerald-500 hover:bg-emerald-600 text-white p-8 rounded-3xl text-3xl font-black shadow-xl shadow-emerald-100 transition-all active:scale-95"
        >
          لام قمرية
        </button>
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
              <span className="text-4xl font-black">حاول مرة أخرى!</span>
            </div>
          )}
        </motion.div>
      )}

      <AnimatePresence>
        {isStageTransition && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -100 }}
            className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-orange-500 text-white"
          >
            <Trophy size={120} className="mb-6" />
            <h2 className="text-6xl font-black mb-2">رائع!</h2>
            <p className="text-2xl">استعد للمرحلة {stage + 1}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {isGameOver && (
        <div className="absolute inset-0 bg-white z-20 flex flex-col items-center justify-center p-8">
          <Trophy className="w-24 h-24 text-yellow-500 mb-6" />
          <h2 className="text-4xl font-black mb-2">أحسنت!</h2>
          <p className="text-gray-500 mb-8">لقد أنهيت جميع الكلمات بنجاح</p>
          <div className="text-6xl font-black text-emerald-600 mb-8">{score}</div>
          <p className="text-gray-400">في انتظار المعلم...</p>
        </div>
      )}
    </div>
  );
};
