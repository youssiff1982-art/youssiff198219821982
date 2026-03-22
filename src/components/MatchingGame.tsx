import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Star, Link as LinkIcon, CheckCircle, XCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

interface MatchingGameProps {
  role: 'teacher' | 'student';
  data: any;
  level: 'easy' | 'medium' | 'hard';
  scores?: Record<string, { name: string; score: number }>;
  onScoreUpdate?: (score: number) => void;
  onGameOver?: () => void;
}

export const MatchingGame: React.FC<MatchingGameProps> = ({ 
  role, 
  data, 
  level,
  scores = {}, 
  onScoreUpdate,
  onGameOver 
}) => {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(level === 'easy' ? 90 : level === 'medium' ? 60 : 45);
  const [isGameOver, setIsGameOver] = useState(false);
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [matches, setMatches] = useState<Record<string, string>>({});
  const [wrongMatch, setWrongMatch] = useState<{ left: string, right: string } | null>(null);

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

  const handleMatch = (rightId: string) => {
    if (!selectedLeft || isGameOver || matches[selectedLeft] || Object.values(matches).includes(rightId)) return;

    const leftItem = data.leftItems.find((i: any) => i.id === selectedLeft);
    if (leftItem.matchId === rightId) {
      const newMatches = { ...matches, [selectedLeft]: rightId };
      setMatches(newMatches);
      setScore(s => s + 25);
      onScoreUpdate?.(score + 25);
      setSelectedLeft(null);
      confetti({ particleCount: 30, spread: 50 });

      if (Object.keys(newMatches).length === data.leftItems.length) {
        setTimeout(() => {
          setIsGameOver(true);
          onGameOver?.();
        }, 1000);
      }
    } else {
      setWrongMatch({ left: selectedLeft, right: rightId });
      setTimeout(() => setWrongMatch(null), 1000);
      setSelectedLeft(null);
    }
  };

  if (role === 'teacher') {
    const sortedScores = Object.values(scores).sort((a, b) => b.score - a.score);
    return (
      <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 p-4 rounded-2xl">
              <LinkIcon className="text-blue-600 w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">لوحة المتصدرين - لعبة التوصيل</h2>
              <p className="text-gray-500">المستوى: {level === 'easy' ? 'سهل' : level === 'medium' ? 'متوسط' : 'صعب'}</p>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          {sortedScores.map((s, i) => (
            <motion.div layout key={s.name} className={`flex items-center justify-between p-4 rounded-2xl border-2 ${i === 0 ? 'border-blue-400 bg-blue-50' : 'border-gray-100 bg-white'}`}>
              <div className="flex items-center gap-4">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${i === 0 ? 'bg-blue-400 text-white' : 'bg-gray-100 text-gray-500'}`}>{i + 1}</span>
                <span className="font-bold text-lg text-gray-800">{s.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="text-blue-500 fill-blue-500" size={20} />
                <span className="text-2xl font-black text-blue-600">{s.score}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 p-8 rounded-[3rem] shadow-2xl max-w-5xl mx-auto text-center relative overflow-hidden min-h-[600px] flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <div className="bg-white/80 backdrop-blur-sm px-6 py-2 rounded-2xl text-blue-600 font-black text-xl shadow-sm">النقاط: {score}</div>
        <div className="bg-white/80 backdrop-blur-sm px-6 py-2 rounded-2xl text-indigo-600 font-black text-xl shadow-sm">الوقت: {timeLeft}s</div>
      </div>

      <div className="flex-1 grid grid-cols-2 gap-12 items-center px-12">
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-gray-500 mb-6">اختر من هنا</h3>
          {data.leftItems.map((item: any) => (
            <motion.button
              key={item.id}
              whileHover={!matches[item.id] ? { scale: 1.05, x: -10 } : {}}
              onClick={() => !matches[item.id] && setSelectedLeft(item.id)}
              className={`w-full p-6 rounded-2xl shadow-lg font-black text-2xl transition-all border-b-8 ${
                matches[item.id] 
                  ? 'bg-emerald-500 text-white border-emerald-700 opacity-50' 
                  : selectedLeft === item.id 
                    ? 'bg-blue-600 text-white border-blue-800 scale-105' 
                    : wrongMatch?.left === item.id
                      ? 'bg-red-500 text-white border-red-700 animate-shake'
                      : 'bg-white text-gray-800 border-gray-200 hover:border-blue-400'
              }`}
            >
              {item.content}
            </motion.button>
          ))}
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-bold text-gray-500 mb-6">وصل بالصحيح</h3>
          {data.rightItems.map((item: any) => {
            const isMatched = Object.values(matches).includes(item.id);
            return (
              <motion.button
                key={item.id}
                whileHover={!isMatched && selectedLeft ? { scale: 1.05, x: 10 } : {}}
                onClick={() => handleMatch(item.id)}
                className={`w-full p-6 rounded-2xl shadow-lg font-black text-2xl transition-all border-b-8 ${
                  isMatched 
                    ? 'bg-emerald-500 text-white border-emerald-700 opacity-50' 
                    : wrongMatch?.right === item.id
                      ? 'bg-red-500 text-white border-red-700 animate-shake'
                      : 'bg-white text-gray-800 border-gray-200 hover:border-blue-400'
                }`}
              >
                {item.content}
              </motion.button>
            );
          })}
        </div>
      </div>

      {isGameOver && (
        <div className="absolute inset-0 bg-white z-20 flex flex-col items-center justify-center p-8">
          <Trophy className="w-24 h-24 text-yellow-500 mb-6" />
          <h2 className="text-4xl font-black mb-2">عمل رائع!</h2>
          <p className="text-gray-500 mb-8">لقد قمت بتوصيل جميع الكلمات</p>
          <div className="text-6xl font-black text-blue-600 mb-8">{score}</div>
          <p className="text-gray-400">في انتظار المعلم...</p>
        </div>
      )}
    </div>
  );
};
