import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Brain, Trophy, Clock, RefreshCw, Star, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface MemoryCard {
  id: number;
  content: string;
  isFlipped: boolean;
  isMatched: boolean;
}

interface MemoryGameProps {
  data: {
    pairs: { content: string }[];
  };
  onGameOver: (score: number) => void;
  isTeacher?: boolean;
  leaderboard?: Record<string, { name: string; score: number }>;
}

export const MemoryGame: React.FC<MemoryGameProps> = ({ data, onGameOver, isTeacher, leaderboard }) => {
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isGameOver, setIsGameOver] = useState(false);
  const [stage, setStage] = useState(1);
  const [isStageTransition, setIsStageTransition] = useState(false);

  useEffect(() => {
    initGame();
  }, [data, stage]);

  const initGame = () => {
    const pairs = data.pairs.slice(0, 4 + stage * 2);
    const initialCards: MemoryCard[] = [...pairs, ...pairs]
      .sort(() => Math.random() - 0.5)
      .map((p, index) => ({
        id: index,
        content: p.content,
        isFlipped: false,
        isMatched: false,
      }));
    setCards(initialCards);
    setFlippedCards([]);
    setTimeLeft(60 + stage * 15);
    setIsGameOver(false);
    setIsStageTransition(false);
  };

  useEffect(() => {
    if (timeLeft > 0 && !isGameOver && !isTeacher && !isStageTransition) {
      const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && !isGameOver && !isTeacher) {
      setIsGameOver(true);
      onGameOver(score);
    }
  }, [timeLeft, isGameOver, isTeacher, isStageTransition]);

  const handleCardClick = (id: number) => {
    if (isTeacher || isGameOver || isStageTransition || flippedCards.length === 2 || cards[id].isFlipped || cards[id].isMatched) return;

    const newCards = [...cards];
    newCards[id].isFlipped = true;
    setCards(newCards);

    const newFlipped = [...flippedCards, id];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      const [firstId, secondId] = newFlipped;
      if (cards[firstId].content === cards[secondId].content) {
        setTimeout(() => {
          const matchedCards = [...cards];
          matchedCards[firstId].isMatched = true;
          matchedCards[secondId].isMatched = true;
          setCards(matchedCards);
          setFlippedCards([]);
          setScore(prev => prev + 50 * stage);

          if (matchedCards.every(c => c.isMatched)) {
            handleNextStage();
          }
        }, 500);
      } else {
        setTimeout(() => {
          const resetCards = [...cards];
          resetCards[firstId].isFlipped = false;
          resetCards[secondId].isFlipped = false;
          setCards(resetCards);
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  const handleNextStage = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
    setIsStageTransition(true);
    setTimeout(() => {
      setStage(prev => prev + 1);
    }, 2000);
  };

  if (isTeacher) {
    return (
      <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl border-r-8 border-purple-500 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="bg-purple-100 p-4 rounded-2xl text-purple-600">
              <Brain size={32} />
            </div>
            <div>
              <h2 className="text-3xl font-black text-gray-900">لعبة الذاكرة</h2>
              <p className="text-gray-500 font-bold">لوحة الصدارة المباشرة</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
            <h3 className="text-xl font-black text-gray-800 mb-4 flex items-center gap-2">
              <Trophy className="text-yellow-500" /> المتصدرون
            </h3>
            <div className="space-y-3">
              {Object.values(leaderboard || {}).sort((a, b) => b.score - a.score).map((s, i) => (
                <div key={i} className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex items-center gap-3">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm ${i === 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>
                      {i + 1}
                    </span>
                    <span className="font-bold text-gray-800">{s.name}</span>
                  </div>
                  <span className="font-black text-purple-600">{s.score}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-purple-50 p-6 rounded-3xl border border-purple-100 flex flex-col items-center justify-center text-center">
            <Sparkles className="text-purple-400 mb-4" size={48} />
            <h4 className="text-lg font-black text-purple-800 mb-2">اللعبة جارية الآن</h4>
            <p className="text-purple-600 font-bold">الطلاب يحاولون مطابقة البطاقات!</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border-b-8 border-purple-500">
        <div className="bg-purple-600 p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
              <Brain size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black">لعبة الذاكرة</h2>
              <div className="flex items-center gap-2 text-xs font-bold opacity-80">
                <span>المرحلة {stage}</span>
                <span>•</span>
                <span>النقاط: {score}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-black text-lg ${timeLeft < 10 ? 'bg-red-500 animate-pulse' : 'bg-white/20'}`}>
              <Clock size={20} />
              <span>{timeLeft}ث</span>
            </div>
          </div>
        </div>

        <div className="p-8 bg-gray-50">
          <AnimatePresence mode="wait">
            {isStageTransition ? (
              <motion.div
                key="transition"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.2 }}
                className="flex flex-col items-center justify-center py-20 text-center"
              >
                <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600 mb-6 animate-bounce">
                  <Star size={48} fill="currentColor" />
                </div>
                <h2 className="text-4xl font-black text-gray-900 mb-2">رائع!</h2>
                <p className="text-xl font-bold text-gray-500">استعد للمرحلة {stage + 1}</p>
              </motion.div>
            ) : isGameOver ? (
              <motion.div
                key="gameover"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12"
              >
                <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mx-auto text-purple-600 mb-6">
                  <Trophy size={48} />
                </div>
                <h2 className="text-4xl font-black text-gray-900 mb-2">انتهى الوقت!</h2>
                <p className="text-xl font-bold text-gray-500 mb-8">لقد جمعت {score} نقطة</p>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-purple-600 text-white px-10 py-4 rounded-2xl font-black text-xl shadow-xl shadow-purple-100 hover:bg-purple-700 transition-all flex items-center gap-3 mx-auto"
                >
                  <RefreshCw size={24} />
                  العودة للرئيسية
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-2 sm:grid-cols-4 gap-4"
              >
                {cards.map(card => (
                  <motion.div
                    key={card.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleCardClick(card.id)}
                    className={`aspect-square rounded-2xl cursor-pointer transition-all duration-500 preserve-3d relative ${
                      card.isFlipped || card.isMatched ? 'rotate-y-180' : ''
                    }`}
                  >
                    <div className={`absolute inset-0 w-full h-full backface-hidden rounded-2xl bg-white border-4 border-gray-100 shadow-sm flex items-center justify-center text-gray-200`}>
                      <Brain size={32} />
                    </div>
                    <div className={`absolute inset-0 w-full h-full backface-hidden rounded-2xl bg-purple-50 border-4 border-purple-200 shadow-lg flex items-center justify-center rotate-y-180 ${card.isMatched ? 'opacity-50' : ''}`}>
                      <span className="text-2xl font-black text-purple-600">{card.content}</span>
                      {card.isMatched && (
                        <div className="absolute top-2 right-2 text-emerald-500">
                          <Star size={16} fill="currentColor" />
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}} />
    </div>
  );
};
