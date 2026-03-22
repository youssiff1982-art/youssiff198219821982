import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Star, Timer, CheckCircle, XCircle, Search, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface WordSearchGameProps {
  role: 'teacher' | 'student';
  data: {
    words: string[];
    gridSize: number;
  };
  level: 'easy' | 'medium' | 'hard';
  scores?: Record<string, { name: string; score: number }>;
  onScoreUpdate?: (score: number) => void;
  onGameOver?: () => void;
}

export const WordSearchGame: React.FC<WordSearchGameProps> = ({ 
  role, 
  data, 
  level,
  scores = {}, 
  onScoreUpdate,
  onGameOver 
}) => {
  const [grid, setGrid] = useState<string[][]>([]);
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [selection, setSelection] = useState<{ r: number, c: number }[]>([]);
  const [score, setScore] = useState(0);
  const [stage, setStage] = useState(1);
  const [timeLeft, setTimeLeft] = useState(level === 'easy' ? 300 : level === 'medium' ? 240 : 180);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isStageTransition, setIsStageTransition] = useState(false);

  useEffect(() => {
    generateGrid();
  }, [data, stage]);

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

  const generateGrid = () => {
    const size = data.gridSize;
    const newGrid = Array(size).fill(null).map(() => Array(size).fill(''));
    const alphabet = 'أبتثجحخدذرزسشصضطظعغفقكلمنهوي';

    // Place words
    data.words.forEach(word => {
      let placed = false;
      while (!placed) {
        const direction = Math.random() > 0.5 ? 'H' : 'V';
        const row = Math.floor(Math.random() * (direction === 'H' ? size : size - word.length));
        const col = Math.floor(Math.random() * (direction === 'V' ? size : size - word.length));

        let canPlace = true;
        for (let i = 0; i < word.length; i++) {
          const r = direction === 'V' ? row + i : row;
          const c = direction === 'H' ? col + i : col;
          if (newGrid[r][c] !== '' && newGrid[r][c] !== word[i]) {
            canPlace = false;
            break;
          }
        }

        if (canPlace) {
          for (let i = 0; i < word.length; i++) {
            const r = direction === 'V' ? row + i : row;
            const c = direction === 'H' ? col + i : col;
            newGrid[r][c] = word[i];
          }
          placed = true;
        }
      }
    });

    // Fill empty spots
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (newGrid[r][c] === '') {
          newGrid[r][c] = alphabet[Math.floor(Math.random() * alphabet.length)];
        }
      }
    }
    setGrid(newGrid);
    setFoundWords([]);
  };

  const handleCellClick = (r: number, c: number) => {
    if (isGameOver || isStageTransition) return;

    const newSelection = [...selection, { r, c }];
    setSelection(newSelection);

    const selectedWord = newSelection.map(s => grid[s.r][s.c]).join('');
    const reversedWord = selectedWord.split('').reverse().join('');

    if (data.words.includes(selectedWord) || data.words.includes(reversedWord)) {
      const word = data.words.includes(selectedWord) ? selectedWord : reversedWord;
      if (!foundWords.includes(word)) {
        const points = 100 * stage;
        setFoundWords([...foundWords, word]);
        setScore(s => s + points);
        onScoreUpdate?.(score + points);
        setSelection([]);
        confetti({ particleCount: 30, spread: 50 });

        if (foundWords.length + 1 === data.words.length) {
          if (stage < 3) {
            handleNextStage();
          } else {
            setIsGameOver(true);
            onGameOver?.();
          }
        }
      }
    } else if (newSelection.length > Math.max(...data.words.map(w => w.length))) {
      setSelection([]);
    }
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
      setTimeLeft(prev => prev + 120);
      setIsStageTransition(false);
    }, 3000);
  };

  if (role === 'teacher') {
    const sortedScores = Object.values(scores).sort((a, b) => b.score - a.score);
    return (
      <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="bg-amber-100 p-4 rounded-2xl">
              <Search className="text-amber-600 w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">صائد الكلمات الذكي</h2>
              <p className="text-gray-500">من سيجد جميع الكلمات أولاً؟</p>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          {sortedScores.map((s, i) => (
            <motion.div layout key={s.name} className={`flex items-center justify-between p-4 rounded-2xl border-2 ${i === 0 ? 'border-amber-400 bg-amber-50' : 'border-gray-100 bg-white'}`}>
              <div className="flex items-center gap-4">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${i === 0 ? 'bg-amber-400 text-white' : 'bg-gray-100 text-gray-500'}`}>{i + 1}</span>
                <span className="font-bold text-lg text-gray-800">{s.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="text-amber-500 fill-amber-500" size={20} />
                <span className="text-2xl font-black text-amber-600">{s.score}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-amber-50 p-8 rounded-[3rem] shadow-2xl max-w-5xl mx-auto text-center relative overflow-hidden min-h-[700px] flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <div className="bg-white/80 backdrop-blur-sm px-6 py-2 rounded-2xl text-amber-600 font-black text-xl shadow-sm">النقاط: {score}</div>
        <div className="bg-amber-200 px-6 py-2 rounded-2xl text-amber-800 font-black text-xl shadow-sm">المرحلة: {stage}</div>
        <div className="bg-white/80 backdrop-blur-sm px-6 py-2 rounded-2xl text-blue-600 font-black text-xl shadow-sm">الوقت: {timeLeft}s</div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-12 items-center justify-center">
        <div className="grid gap-2 p-4 bg-white rounded-[2rem] shadow-xl border-4 border-amber-200" 
             style={{ gridTemplateColumns: `repeat(${data.gridSize}, minmax(0, 1fr))` }}>
          {grid.map((row, r) => row.map((char, c) => {
            const isSelected = selection.some(s => s.r === r && s.c === c);
            return (
              <motion.button
                key={`${r}-${c}`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleCellClick(r, c)}
                className={`w-10 h-10 md:w-12 md:h-12 rounded-xl font-black text-xl flex items-center justify-center transition-all ${isSelected ? 'bg-amber-500 text-white shadow-lg' : 'bg-amber-50 text-amber-900 hover:bg-amber-100'}`}
              >
                {char}
              </motion.button>
            );
          }))}
        </div>

        <div className="bg-white p-8 rounded-[2rem] shadow-xl border-4 border-amber-100 min-w-[250px]">
          <h3 className="text-2xl font-black text-amber-600 mb-6 underline decoration-wavy">ابحث عن:</h3>
          <div className="space-y-4">
            {data.words.map(word => (
              <div key={word} className={`text-2xl font-bold transition-all flex items-center gap-3 justify-center ${foundWords.includes(word) ? 'text-emerald-500 line-through opacity-50' : 'text-gray-700'}`}>
                {foundWords.includes(word) && <CheckCircle size={24} />}
                {word}
              </div>
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isStageTransition && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 2, opacity: 0 }}
            className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-amber-500 text-white"
          >
            <Sparkles size={120} className="mb-6 animate-bounce" />
            <h2 className="text-6xl font-black mb-2">عبقري!</h2>
            <p className="text-2xl">المرحلة {stage + 1} ستكون أصعب</p>
          </motion.div>
        )}
      </AnimatePresence>

      {isGameOver && (
        <div className="absolute inset-0 bg-white z-20 flex flex-col items-center justify-center p-8">
          <Trophy className="w-24 h-24 text-yellow-500 mb-6" />
          <h2 className="text-4xl font-black mb-2">أنت صائد كلمات ماهر!</h2>
          <p className="text-gray-500 mb-8">لقد وجدت جميع الكلمات المطلوبة</p>
          <div className="text-6xl font-black text-amber-600 mb-8">{score}</div>
          <p className="text-gray-400">في انتظار المعلم...</p>
        </div>
      )}
    </div>
  );
};
