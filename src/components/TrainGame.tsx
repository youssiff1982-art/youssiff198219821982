import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Star, TrainFront, CheckCircle, XCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

interface TrainGameProps {
  role: 'teacher' | 'student';
  data: any;
  level: 'easy' | 'medium' | 'hard';
  scores?: Record<string, { name: string; score: number }>;
  onScoreUpdate?: (score: number) => void;
  onGameOver?: () => void;
}

export const TrainGame: React.FC<TrainGameProps> = ({ 
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
  const [timeLeft, setTimeLeft] = useState(level === 'easy' ? 180 : level === 'medium' ? 120 : 90);
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

  const handleChoice = (madType: string) => {
    if (isGameOver || feedback || isStageTransition) return;

    const currentWord = data.words[currentIndex];
    if (currentWord.type === madType) {
      const points = 25 * stage;
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
      setTimeLeft(prev => prev + 60);
      setIsStageTransition(false);
    }, 3000);
  };

  if (role === 'teacher') {
    const sortedScores = Object.values(scores).sort((a, b) => b.score - a.score);
    return (
      <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="bg-emerald-100 p-4 rounded-2xl">
              <TrainFront className="text-emerald-600 w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">لوحة المتصدرين - قطار المدود</h2>
              <p className="text-gray-500">المستوى: {level === 'easy' ? 'سهل' : level === 'medium' ? 'متوسط' : 'صعب'}</p>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          {sortedScores.map((s, i) => (
            <motion.div layout key={s.name} className={`flex items-center justify-between p-4 rounded-2xl border-2 ${i === 0 ? 'border-emerald-400 bg-emerald-50' : 'border-gray-100 bg-white'}`}>
              <div className="flex items-center gap-4">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${i === 0 ? 'bg-emerald-400 text-white' : 'bg-gray-100 text-gray-500'}`}>{i + 1}</span>
                <span className="font-bold text-lg text-gray-800">{s.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="text-emerald-500 fill-emerald-500" size={20} />
                <span className="text-2xl font-black text-emerald-600">{s.score}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  const currentWord = data.words[currentIndex];

  return (
    <div className="bg-sky-50 p-8 rounded-[3rem] shadow-2xl max-w-4xl mx-auto text-center relative overflow-hidden min-h-[600px] flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <div className="bg-white/80 backdrop-blur-sm px-6 py-2 rounded-2xl text-emerald-600 font-black text-xl shadow-sm">النقاط: {score}</div>
        <div className="bg-yellow-50 px-6 py-2 rounded-2xl text-yellow-600 font-black text-xl shadow-sm">المرحلة: {stage}</div>
        <div className="bg-white/80 backdrop-blur-sm px-6 py-2 rounded-2xl text-blue-600 font-black text-xl shadow-sm">الوقت: {timeLeft}s</div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            className="bg-white p-8 rounded-3xl shadow-xl border-4 border-emerald-200 min-w-[250px]"
          >
            <span className="text-6xl font-black text-gray-800">{currentWord.word}</span>
          </motion.div>
        </AnimatePresence>

        <div className="flex items-end gap-4 overflow-x-auto pb-8 w-full justify-center">
          <div className="flex flex-col items-center gap-2">
            <TrainFront size={64} className="text-emerald-600" />
            <div className="h-12 w-24 bg-gray-400 rounded-t-lg" />
          </div>
          
          {[
            { type: 'alif', label: 'مد بالألف', color: 'bg-orange-500' },
            { type: 'waw', label: 'مد بالواو', color: 'bg-blue-500' },
            { type: 'ya', label: 'مد بالياء', color: 'bg-purple-500' }
          ].map((carriage) => (
            <motion.button
              key={carriage.type}
              whileHover={{ scale: 1.05, y: -10 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleChoice(carriage.type)}
              className={`${carriage.color} p-6 rounded-2xl shadow-lg text-white flex flex-col items-center gap-4 min-w-[150px] border-b-8 border-black/20`}
            >
              <div className="w-full h-2 bg-white/30 rounded-full" />
              <span className="text-2xl font-black">{carriage.label}</span>
              <div className="flex gap-4">
                <div className="w-4 h-4 bg-gray-800 rounded-full" />
                <div className="w-4 h-4 bg-gray-800 rounded-full" />
              </div>
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
            initial={{ x: 500 }}
            animate={{ x: 0 }}
            exit={{ x: -500 }}
            className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-emerald-600 text-white"
          >
            <TrainFront size={120} className="mb-6 animate-bounce" />
            <h2 className="text-6xl font-black mb-2">رائع!</h2>
            <p className="text-2xl">القطار ينتقل للمرحلة {stage + 1}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {isGameOver && (
        <div className="absolute inset-0 bg-white z-20 flex flex-col items-center justify-center p-8">
          <Trophy className="w-24 h-24 text-yellow-500 mb-6" />
          <h2 className="text-4xl font-black mb-2">انتهت الرحلة!</h2>
          <p className="text-gray-500 mb-8">لقد قمت بتصنيف الكلمات بنجاح</p>
          <div className="text-6xl font-black text-emerald-600 mb-8">{score}</div>
          <p className="text-gray-400">في انتظار المعلم...</p>
        </div>
      )}
    </div>
  );
};
