import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Star, Timer, Heart } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Balloon {
  id: string;
  word: string;
  isCorrect: boolean;
  x: number;
  y: number;
  color: string;
  speed: number;
}

interface BalloonsGameProps {
  role: 'teacher' | 'student';
  data: any;
  level: 'easy' | 'medium' | 'hard';
  scores?: Record<string, { name: string; score: number }>;
  onScoreUpdate?: (score: number) => void;
  onGameOver?: () => void;
}

const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F'];

export const BalloonsGame: React.FC<BalloonsGameProps> = ({ 
  role, 
  data, 
  level,
  scores = {}, 
  onScoreUpdate,
  onGameOver 
}) => {
  const [balloons, setBalloons] = useState<Balloon[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(level === 'easy' ? 60 : level === 'medium' ? 45 : 30);
  const [lives, setLives] = useState(level === 'easy' ? 5 : level === 'medium' ? 3 : 2);
  const [isGameOver, setIsGameOver] = useState(false);
  const gameLoopRef = useRef<number | null>(null);

  const speedMultiplier = level === 'easy' ? 0.7 : level === 'medium' ? 1.0 : 1.3;

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

      const spawnInterval = setInterval(() => {
        if (balloons.length < (level === 'easy' ? 8 : level === 'medium' ? 12 : 15)) {
          const wordObj = data.words[Math.floor(Math.random() * data.words.length)];
          const newBalloon: Balloon = {
            id: Math.random().toString(36).substring(7),
            word: wordObj.word,
            isCorrect: wordObj.isCorrect,
            x: Math.random() * 80 + 10,
            y: 110,
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
            speed: (Math.random() * 0.5 + 0.2) * speedMultiplier
          };
          setBalloons(prev => [...prev, newBalloon]);
        }
      }, level === 'easy' ? 1500 : level === 'medium' ? 1000 : 700);

      const updateBalloons = () => {
        setBalloons(prev => {
          const next = prev.map(b => ({ ...b, y: b.y - b.speed }));
          // Remove balloons that went off screen
          return next.filter(b => {
            if (b.y < -10) {
              if (b.isCorrect) setLives(l => Math.max(0, l - 1));
              return false;
            }
            return true;
          });
        });
        gameLoopRef.current = requestAnimationFrame(updateBalloons);
      };
      gameLoopRef.current = requestAnimationFrame(updateBalloons);

      return () => {
        clearInterval(interval);
        clearInterval(spawnInterval);
        if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
      };
    }
  }, [role, isGameOver, data]);

  useEffect(() => {
    if (lives === 0 && !isGameOver) {
      setIsGameOver(true);
      onGameOver?.();
    }
  }, [lives, isGameOver, onGameOver]);

  const handlePop = (balloon: Balloon) => {
    if (isGameOver) return;

    setBalloons(prev => prev.filter(b => b.id !== balloon.id));
    
    if (balloon.isCorrect) {
      const newScore = score + 10;
      setScore(newScore);
      onScoreUpdate?.(newScore);
      confetti({
        particleCount: 30,
        spread: 50,
        origin: { x: balloon.x / 100, y: balloon.y / 100 }
      });
    } else {
      setLives(l => Math.max(0, l - 1));
    }
  };

  if (role === 'teacher') {
    const sortedScores = Object.values(scores).sort((a, b) => b.score - a.score);

    return (
      <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="bg-yellow-100 p-4 rounded-2xl">
              <Trophy className="text-yellow-600 w-8 h-8" />
            </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">لوحة المتصدرين - لعبة بالونات {data.skill === 'mad' ? 'المدود' : data.skill === 'vowels' ? 'الحركات' : 'التنوين'}</h2>
          <p className="text-gray-500">الهدف: فرقع بالونات ({data.target})</p>
        </div>
          </div>
        </div>

        <div className="space-y-4">
          {sortedScores.length === 0 ? (
            <div className="text-center py-12 text-gray-400">في انتظار انضمام الطلاب للعبة...</div>
          ) : (
            sortedScores.map((s, i) => (
              <motion.div 
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                key={s.name}
                className={`flex items-center justify-between p-4 rounded-2xl border-2 ${i === 0 ? 'border-yellow-400 bg-yellow-50' : 'border-gray-100 bg-white'}`}
              >
                <div className="flex items-center gap-4">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${i === 0 ? 'bg-yellow-400 text-white' : 'bg-gray-100 text-gray-500'}`}>
                    {i + 1}
                  </span>
                  <span className="font-bold text-lg text-gray-800">{s.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="text-yellow-500 fill-yellow-500" size={20} />
                  <span className="text-2xl font-black text-emerald-600">{s.score}</span>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-[600px] w-full bg-sky-50 rounded-3xl overflow-hidden border-4 border-white shadow-2xl cursor-crosshair">
      {/* Game HUD */}
      <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-20">
        <div className="bg-white/90 backdrop-blur px-6 py-3 rounded-2xl shadow-lg flex items-center gap-3 border border-white">
          <Star className="text-yellow-500 fill-yellow-500" />
          <span className="text-2xl font-black text-emerald-600">{score}</span>
        </div>
        
        <div className="bg-white/90 backdrop-blur px-6 py-3 rounded-2xl shadow-lg flex items-center gap-3 border border-white">
          <Timer className="text-blue-500" />
          <span className="text-2xl font-black text-blue-600">{timeLeft}s</span>
        </div>

        <div className="bg-white/90 backdrop-blur px-6 py-3 rounded-2xl shadow-lg flex items-center gap-3 border border-white">
          {[...Array(3)].map((_, i) => (
            <Heart key={i} className={`${i < lives ? 'text-red-500 fill-red-500' : 'text-gray-300'} transition-all`} />
          ))}
        </div>
      </div>

      <div className="absolute top-24 left-0 right-0 text-center z-10">
        <h3 className="text-xl font-bold text-sky-800 bg-sky-100/50 inline-block px-6 py-2 rounded-full backdrop-blur-sm">
          فرقع بالونات: <span className="text-2xl text-emerald-600 font-black">{data.target}</span>
        </h3>
      </div>

      {/* Balloons */}
      <AnimatePresence>
        {balloons.map((b) => (
          <motion.div
            key={b.id}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 1.5, opacity: 0 }}
            style={{ 
              left: `${b.x}%`, 
              top: `${b.y}%`,
              backgroundColor: b.color,
              boxShadow: `inset -10px -10px 20px rgba(0,0,0,0.1), 0 10px 20px rgba(0,0,0,0.1)`
            }}
            onClick={() => handlePop(b)}
            className="absolute w-20 h-24 rounded-[50%_50%_50%_50%/40%_40%_60%_60%] flex items-center justify-center cursor-pointer select-none group"
          >
            <span className="text-white font-bold text-lg drop-shadow-md">{b.word}</span>
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-0.5 h-8 bg-white/50" />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Game Over Overlay */}
      {isGameOver && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-6 text-center"
        >
          <div className="bg-white p-12 rounded-[3rem] shadow-2xl max-w-md w-full">
            <Trophy className="w-20 h-20 text-yellow-500 mx-auto mb-6" />
            <h2 className="text-4xl font-black text-gray-900 mb-2">انتهت اللعبة!</h2>
            <p className="text-gray-500 mb-8 text-lg">لقد جمعت {score} نقطة</p>
            <div className="bg-emerald-50 p-6 rounded-3xl border-2 border-emerald-100 mb-8">
              <span className="text-gray-600 block mb-1">نتيجتك النهائية</span>
              <span className="text-5xl font-black text-emerald-600">{score}</span>
            </div>
            <p className="text-gray-400">في انتظار المعلم لإنهاء اللعبة...</p>
          </div>
        </motion.div>
      )}
    </div>
  );
};
