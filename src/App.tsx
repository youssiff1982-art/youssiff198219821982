/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { 
  Lock, Unlock, Pen, Eraser, Image as ImageIcon, 
  Type as TextIcon, Send, Users, Plus, Layout, 
  HelpCircle, CheckCircle, XCircle, MousePointer2,
  Sparkles, Trash2, ChevronRight, ChevronLeft,
  TrainFront, BookOpen, Link as LinkIcon,
  Square, Circle as CircleIcon, Triangle, Ruler,
  Video, Maximize2, Rows, Maximize, Minimize, Check, X, Star, Smile, Frown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Board } from './components/Board';
import { ResourceLibrary } from './components/ResourceLibrary';
import { BalloonsGame } from './components/BalloonsGame';
import { SortingGame } from './components/SortingGame';
import { TrainGame } from './components/TrainGame';
import { FormationGame } from './components/FormationGame';
import { MatchingGame } from './components/MatchingGame';
import { AssignmentManager } from './components/AssignmentManager';
import { AssignmentStudentView } from './components/AssignmentStudentView';
import { Tool, LineData, ImageData, TextData, ShapeData, Question, StudentAnswer, GameState, Assignment, Submission } from './types';
import { correctFillInTheBlank } from './services/geminiService';
import confetti from 'canvas-confetti';

const socket: Socket = io();

const getArabicClusters = (word: string) => {
  // Matches a base character followed by any number of combining marks (diacritics)
  return word.match(/[\u0600-\u06FF][\u064B-\u065F\u0670\u06D6-\u06ED]*/g) || [];
};

import { ARABIC_QUESTION_BANK } from './constants/questionBank';

export default function App() {
  const [role, setRole] = useState<'teacher' | 'student' | null>(null);
  const [sessionCode, setSessionCode] = useState('');
  const [studentName, setStudentName] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  
  // Board State
  const [lines, setLines] = useState<LineData[]>([]);
  const [images, setImages] = useState<ImageData[]>([]);
  const [texts, setTexts] = useState<TextData[]>([]);
  const [shapes, setShapes] = useState<ShapeData[]>([]);
  const [tool, setTool] = useState<Tool>('pen');
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(10);
  const [isLocked, setIsLocked] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [gridSpacing, setGridSpacing] = useState(40);
  
  // Teacher State
  const [activeTab, setActiveTab] = useState<'explain' | 'questions' | 'games' | 'exercises' | 'tests' | 'pricing'>('explain');
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [questionLevel, setQuestionLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [students, setStudents] = useState<Record<string, any>>({});
  const [answers, setAnswers] = useState<Record<string, StudentAnswer>>({});
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  
  // Game State
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [selectedGameLevel, setSelectedGameLevel] = useState<'easy' | 'medium' | 'hard'>('easy');

  // Student State
  const [receivedQuestion, setReceivedQuestion] = useState<Question | null>(null);
  const [receivedAssignment, setReceivedAssignment] = useState<Assignment | null>(null);
  const [receivedSubmission, setReceivedSubmission] = useState<Submission | null>(null);
  const [studentAnswer, setStudentAnswer] = useState<any>(null);
  const [matchSelections, setMatchSelections] = useState<Record<number, string>>({});
  const [feedback, setFeedback] = useState<{ score?: number; feedback?: string; rating?: string } | null>(null);
  const [isLargeFont, setIsLargeFont] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  const STICKERS = {
    check: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%2310b981' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='20 6 9 17 4 12'%3E%3C/polyline%3E%3C/svg%3E",
    cross: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23ef4444' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cline x1='18' y1='6' x2='6' y2='18'%3E%3C/line%3E%3Cline x1='6' y1='6' x2='18' y2='18'%3E%3C/line%3E%3C/svg%3E",
    star: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='%23f59e0b' stroke='%23f59e0b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolygon points='12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2'%3E%3C/polygon%3E%3C/svg%3E",
    smile: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%2310b981' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='10'%3E%3C/circle%3E%3Cpath d='M8 14s1.5 2 4 2 4-2 4-2'%3E%3C/path%3E%3Cline x1='9' y1='9' x2='9.01' y2='9'%3E%3C/line%3E%3Cline x1='15' y1='9' x2='15.01' y2='9'%3E%3C/line%3E%3C/svg%3E",
    frown: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23f97316' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='10'%3E%3C/circle%3E%3Cpath d='M16 16s-1.5-2-4-2-4 2-4 2'%3E%3C/path%3E%3Cline x1='9' y1='9' x2='9.01' y2='9'%3E%3C/line%3E%3Cline x1='15' y1='9' x2='15.01' y2='9'%3E%3C/line%3E%3C/svg%3E"
  };

  const addSticker = (type: keyof typeof STICKERS) => {
    const newImg: ImageData = {
      url: STICKERS[type],
      x: 100,
      y: 100,
      width: 60,
      height: 60,
      locked: false
    };
    const newImages = [...images, newImg];
    setImages(newImages);
    syncBoard(lines, newImages, texts, shapes);
  };

  const underlineScreen = () => {
    const newLines: LineData[] = [];
    const spacing = 80;
    const width = 3000; 
    const height = 3000;
    
    for (let y = spacing; y < height; y += spacing) {
      newLines.push({
        points: [0, y, width, y],
        color: '#E5E7EB',
        width: 1,
        tool: 'pen'
      });
    }
    const updatedLines = [...lines, ...newLines];
    setLines(updatedLines);
    syncBoard(updatedLines, images, texts, shapes);
  };

  const toggleLargeFont = () => {
    const newState = !isLargeFont;
    setIsLargeFont(newState);
    setBrushSize(newState ? 20 : 10);
  };

  const [isRecording, setIsRecording] = useState(false);
  const [showRecordingHelp, setShowRecordingHelp] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const toggleRecording = async () => {
    console.log('Toggle recording clicked');
    if (isRecording) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      setIsRecording(false);
    } else {
      try {
        // Check if we are in an iframe
        if (window.self !== window.top) {
          console.log('In iframe, showing help modal');
          setShowRecordingHelp(true);
          return;
        }

        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: { 
            displaySurface: 'monitor',
            frameRate: { ideal: 30 } 
          },
          audio: true
        });
        
        const recorder = new MediaRecorder(stream, {
          mimeType: 'video/webm;codecs=vp9'
        });
        
        mediaRecorderRef.current = recorder;
        chunksRef.current = [];

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            chunksRef.current.push(e.data);
          }
        };

        recorder.onstop = () => {
          const blob = new Blob(chunksRef.current, { type: 'video/webm' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `smart-board-record-${new Date().toISOString().split('T')[0]}.webm`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          stream.getTracks().forEach(track => track.stop());
          setIsRecording(false);
        };

        recorder.start(1000); // Collect data every second
        setIsRecording(true);
      } catch (err) {
        console.error("Error starting screen recording:", err);
        setShowRecordingHelp(true);
      }
    }
  };

  useEffect(() => {
    socket.on('session-created', (code) => {
      setSessionCode(code);
      setIsJoined(true);
    });

    socket.on('joined-success', ({ isLocked, boardData, currentQuestion }) => {
      setIsJoined(true);
      setIsLocked(isLocked);
      if (boardData) {
        setLines(boardData.lines || []);
        setImages(boardData.images || []);
        setTexts(boardData.texts || []);
        setShapes(boardData.shapes || []);
        setShowGrid(boardData.showGrid || false);
        setGridSpacing(boardData.gridSpacing || 40);
      }
      setReceivedQuestion(currentQuestion);
    });

    socket.on('student-joined', (updatedStudents) => {
      setStudents(updatedStudents);
    });

    socket.on('sync-board', (data) => {
      if (data) {
        setLines(data.lines || []);
        setImages(data.images || []);
        setTexts(data.texts || []);
        setShapes(data.shapes || []);
        if (data.showGrid !== undefined) setShowGrid(data.showGrid);
        if (data.gridSpacing !== undefined) setGridSpacing(data.gridSpacing);
      }
    });

    socket.on('lock-status', ({ isLocked, boardData }) => {
      setIsLocked(isLocked);
      if (isLocked && boardData) {
        setLines(boardData.lines || []);
        setImages(boardData.images || []);
        setTexts(boardData.texts || []);
        setShapes(boardData.shapes || []);
      }
    });

    socket.on('new-question', (question) => {
      setReceivedQuestion(question);
      setStudentAnswer(null);
      setMatchSelections({});
      setLines([]); // Clear student board for new question
      setGameState(null); // Clear game if question is sent
      setFeedback(null); // Clear previous feedback

      if (question.type === 'snippet' && question.imageUrl) {
        setImages([{
          url: question.imageUrl,
          x: 50,
          y: 50,
          width: 400,
          height: 300,
          locked: false
        }]);
      } else {
        setImages([]);
      }
    });

    socket.on('game-started', (state) => {
      setGameState(state);
      setReceivedQuestion(null); // Clear question if game is started
    });

    socket.on('game-scores', (scores) => {
      setGameState(prev => prev ? { ...prev, scores } : null);
    });

    socket.on('game-stopped', () => {
      setGameState(null);
    });

    socket.on('clear-board', () => {
      setLines([]);
      setShowGrid(false);
      setGridSpacing(40);
    });

    socket.on('new-assignment', (assignment) => {
      setReceivedAssignment(assignment);
      setReceivedQuestion(null);
      setGameState(null);
      setReceivedSubmission(null);
    });

    socket.on('assignment-submitted', (submission) => {
      setSubmissions(prev => {
        const index = prev.findIndex(s => s.id === submission.id);
        if (index >= 0) {
          const updated = [...prev];
          updated[index] = submission;
          return updated;
        }
        return [...prev, submission];
      });
    });

    socket.on('assignment-graded', (submission) => {
      setReceivedSubmission(submission);
      // Don't clear assignment immediately so student can see the result with context
    });

    socket.on('answer-received', (updatedAnswers) => {
      setAnswers(updatedAnswers);
    });

    socket.on('feedback-received', (fb) => {
      setFeedback(fb);
      if (fb.score === 100) {
        confetti();
      }
    });

    return () => {
      socket.off('session-created');
      socket.off('joined-success');
      socket.off('student-joined');
      socket.off('sync-board');
      socket.off('lock-status');
      socket.off('new-question');
      socket.off('answer-received');
      socket.off('feedback-received');
      socket.off('game-started');
      socket.off('game-scores');
      socket.off('game-stopped');
    };
  }, []);

  const handleCreateSession = () => {
    setRole('teacher');
    socket.emit('create-session');
  };

  const handleJoinSession = () => {
    if (sessionCode && studentName) {
      setRole('student');
      socket.emit('join-session', { code: sessionCode, name: studentName });
    }
  };

  const handleDraw = useCallback((newLines: LineData[]) => {
    setLines(newLines);
    if (sessionCode) {
      socket.emit('draw', { code: sessionCode, data: { lines: newLines, images, texts, shapes } });
    }
  }, [sessionCode, images, texts, shapes]);

  const syncBoard = useCallback((newLines: LineData[], newImages: ImageData[], newTexts: TextData[], newShapes: ShapeData[], newShowGrid?: boolean, newGridSpacing?: number) => {
    if (sessionCode) {
      socket.emit('draw', { 
        code: sessionCode, 
        data: { 
          lines: newLines, 
          images: newImages, 
          texts: newTexts, 
          shapes: newShapes,
          showGrid: newShowGrid !== undefined ? newShowGrid : showGrid,
          gridSpacing: newGridSpacing !== undefined ? newGridSpacing : gridSpacing
        } 
      });
    }
  }, [sessionCode, showGrid, gridSpacing]);

  const toggleLock = useCallback(() => {
    const newLock = !isLocked;
    setIsLocked(newLock);
    if (sessionCode) {
      socket.emit('toggle-lock', { code: sessionCode, isLocked: newLock });
    }
  }, [sessionCode, isLocked]);

  const sendQuestion = useCallback((q: Question) => {
    setCurrentQuestion(q);
    if (sessionCode) {
      socket.emit('send-question', { code: sessionCode, question: q });
      setActiveTab('explain');
    } else {
      // alert('يرجى إنشاء حصة أولاً');
    }
  }, [sessionCode]);

  const sendAssignment = useCallback((a: Assignment) => {
    if (sessionCode) {
      socket.emit('send-assignment', { code: sessionCode, assignment: a });
      setActiveTab('explain');
    }
  }, [sessionCode]);

  const submitAssignment = useCallback((s: Submission) => {
    if (sessionCode) {
      socket.emit('submit-assignment', { code: sessionCode, submission: s });
    }
  }, [sessionCode]);

  const gradeAssignment = useCallback((s: Submission) => {
    if (sessionCode) {
      socket.emit('grade-assignment', { code: sessionCode, submission: s });
    }
  }, [sessionCode]);

  const submitAnswer = useCallback(() => {
    const finalAnswer = receivedQuestion?.type === 'match' ? matchSelections : studentAnswer;
    if (sessionCode) {
      socket.emit('submit-answer', { code: sessionCode, answer: finalAnswer });
      confetti();
    } else {
      alert('يرجى الانضمام للحصة أولاً');
    }
  }, [sessionCode, receivedQuestion, matchSelections, studentAnswer]);

  const startBalloonsGame = (skill: 'mad' | 'vowels' | 'tanween') => {
    let target = '';
    let words: { word: string; isCorrect: boolean; id: string }[] = [];

    if (skill === 'mad') {
      const mads: ('ألف' | 'واو' | 'ياء')[] = ['ألف', 'واو', 'ياء'];
      target = mads[Math.floor(Math.random() * mads.length)];
      words = [
        { word: 'كِتَاب', isCorrect: target === 'ألف', id: 'w1' },
        { word: 'نَار', isCorrect: target === 'ألف', id: 'w2' },
        { word: 'بَاب', isCorrect: target === 'ألف', id: 'w3' },
        { word: 'حُوت', isCorrect: target === 'واو', id: 'w4' },
        { word: 'نُور', isCorrect: target === 'واو', id: 'w5' },
        { word: 'تُوت', isCorrect: target === 'واو', id: 'w6' },
        { word: 'فِيل', isCorrect: target === 'ياء', id: 'w7' },
        { word: 'سَعِيد', isCorrect: target === 'ياء', id: 'w8' },
        { word: 'تِين', isCorrect: target === 'ياء', id: 'w9' },
        { word: 'أَسَد', isCorrect: false, id: 'w10' },
        { word: 'بَطَّة', isCorrect: false, id: 'w11' },
        { word: 'جَمَل', isCorrect: false, id: 'w12' },
      ];
    } else if (skill === 'vowels') {
      const vowels = ['فتحة', 'ضمة', 'كسرة'];
      target = vowels[Math.floor(Math.random() * vowels.length)];
      words = [
        { word: 'أَسَد', isCorrect: target === 'فتحة', id: 'v1' },
        { word: 'بَطَّة', isCorrect: target === 'فتحة', id: 'v2' },
        { word: 'جَمَل', isCorrect: target === 'فتحة', id: 'v3' },
        { word: 'أُذُن', isCorrect: target === 'ضمة', id: 'v4' },
        { word: 'عُصْفُور', isCorrect: target === 'ضمة', id: 'v5' },
        { word: 'حُوت', isCorrect: target === 'ضمة', id: 'v6' },
        { word: 'إِبِل', isCorrect: target === 'كسرة', id: 'v7' },
        { word: 'تِمْسَاح', isCorrect: target === 'كسرة', id: 'v8' },
        { word: 'فِيل', isCorrect: target === 'كسرة', id: 'v9' },
      ];
    } else if (skill === 'tanween') {
      const tanweens = ['فتح', 'ضم', 'كسر'];
      target = tanweens[Math.floor(Math.random() * tanweens.length)];
      words = [
        { word: 'كِتَاباً', isCorrect: target === 'فتح', id: 't1' },
        { word: 'وَلَداً', isCorrect: target === 'فتح', id: 't2' },
        { word: 'كِتَابٌ', isCorrect: target === 'ضم', id: 't3' },
        { word: 'وَلَدٌ', isCorrect: target === 'ضم', id: 't4' },
        { word: 'كِتَابٍ', isCorrect: target === 'كسر', id: 't5' },
        { word: 'وَلَدٍ', isCorrect: target === 'كسر', id: 't6' },
      ];
    }

    const gameData = { target, words, skill };
    socket.emit('start-game', { code: sessionCode, type: 'balloons', level: selectedGameLevel, data: gameData });
  };

  const startSortingGame = () => {
    const target = 'اللام الشمسية والقمرية';
    const words = [
      { word: 'الشَّمْس', type: 'shamsiya', id: 's1' },
      { word: 'التُّفَّاح', type: 'shamsiya', id: 's2' },
      { word: 'الدَّار', type: 'shamsiya', id: 's3' },
      { word: 'الثَّوْب', type: 'shamsiya', id: 's4' },
      { word: 'الزَّرَافَة', type: 'shamsiya', id: 's5' },
      { word: 'السَّمَك', type: 'shamsiya', id: 's6' },
      { word: 'القَمَر', type: 'qamariya', id: 's7' },
      { word: 'البَاب', type: 'qamariya', id: 's8' },
      { word: 'الجَمَل', type: 'qamariya', id: 's9' },
      { word: 'الحِصَان', type: 'qamariya', id: 's10' },
      { word: 'العَيْن', type: 'qamariya', id: 's11' },
      { word: 'الفَرَاشَة', type: 'qamariya', id: 's12' },
    ].sort(() => Math.random() - 0.5);
    const gameData = { target, words };
    socket.emit('start-game', { code: sessionCode, type: 'sorting', level: selectedGameLevel, data: gameData });
  };

  const startTrainGame = () => {
    const words = [
      { word: 'كِتَاب', type: 'alif', id: 't1' },
      { word: 'بَاب', type: 'alif', id: 't2' },
      { word: 'نَار', type: 'alif', id: 't3' },
      { word: 'حُوت', type: 'waw', id: 't4' },
      { word: 'نُور', type: 'waw', id: 't5' },
      { word: 'تُوت', type: 'waw', id: 't6' },
      { word: 'فِيل', type: 'ya', id: 't7' },
      { word: 'سَعِيد', type: 'ya', id: 't8' },
      { word: 'تِين', type: 'ya', id: 't9' },
    ].sort(() => Math.random() - 0.5);
    const gameData = { words };
    socket.emit('start-game', { code: sessionCode, type: 'train', level: selectedGameLevel, data: gameData });
  };

  const startFormationGame = () => {
    const items = [
      { word: 'كَتَبَ', targetIndex: 0, correctVowel: 'َ', id: 'f1' },
      { word: 'كُتِبَ', targetIndex: 0, correctVowel: 'ُ', id: 'f2' },
      { word: 'شَرِبَ', targetIndex: 1, correctVowel: 'ِ', id: 'f3' },
      { word: 'يَلْعَبُ', targetIndex: 1, correctVowel: 'ْ', id: 'f4' },
      { word: 'قَرَأَ', targetIndex: 2, correctVowel: 'َ', id: 'f5' },
    ].sort(() => Math.random() - 0.5);
    const gameData = { items };
    socket.emit('start-game', { code: sessionCode, type: 'formation', level: selectedGameLevel, data: gameData });
  };

  const startMatchingGame = () => {
    const leftItems = [
      { content: 'أَسَد', matchId: 'r1', id: 'l1' },
      { content: 'بَطَّة', matchId: 'r2', id: 'l2' },
      { content: 'جَمَل', matchId: 'r3', id: 'l3' },
      { content: 'دِيك', matchId: 'r4', id: 'l4' },
    ];
    const rightItems = [
      { content: '🦁', id: 'r1' },
      { content: '🦆', id: 'r2' },
      { content: '🐫', id: 'r3' },
      { content: '🐓', id: 'r4' },
    ].sort(() => Math.random() - 0.5);
    const gameData = { leftItems, rightItems };
    socket.emit('start-game', { code: sessionCode, type: 'matching', level: selectedGameLevel, data: gameData });
  };

  const stopGame = () => {
    socket.emit('stop-game', { code: sessionCode });
  };

  const giveFeedback = (studentId: string, fb: { score?: number; feedback?: string; rating?: 'مقبول' | 'جيد' | 'متميز' }) => {
    if (sessionCode) {
      socket.emit('give-feedback', { code: sessionCode, studentId, feedback: fb });
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        if (activeTab === 'questions') {
          sendQuestion({
            type: 'snippet',
            level: 'beginner',
            text: 'أجب عن السؤال في القصاصة التالية:',
            imageUrl: url
          });
        } else {
          const newImg: ImageData = {
            url,
            x: 100,
            y: 100,
            width: 200,
            height: 200
          };
          const newImages = [...images, newImg];
          setImages(newImages);
          syncBoard(lines, newImages, texts, shapes);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  if (!role) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] font-sans" dir="rtl">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-emerald-900 text-white py-20 px-6">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-400 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500 rounded-full blur-[120px]"></div>
          </div>
          
          <div className="max-w-6xl mx-auto relative z-10 flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 text-center lg:text-right space-y-6">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <span className="inline-block px-4 py-1 rounded-full bg-emerald-800 text-emerald-300 text-sm font-bold mb-4">
                  الجيل القادم من التعليم الذكي
                </span>
                <h1 className="text-5xl lg:text-7xl font-black leading-tight mb-6">
                  حوّل حصتك إلى <span className="text-emerald-400">تجربة تفاعلية</span> لا تُنسى
                </h1>
                <p className="text-xl text-emerald-100/80 max-w-2xl">
                  المنصة المتكاملة للمعلمين والطلاب: سبورة ذكية، ألعاب تعليمية، اختبارات فورية، وتصحيح آلي مدعوم بالذكاء الاصطناعي.
                </p>
              </motion.div>
              
              {/* Added Portrait Image */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="hidden lg:block relative w-64 h-80 rounded-[3rem] overflow-hidden border-4 border-emerald-500/30 shadow-2xl"
              >
                <img 
                  src="https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=1000" 
                  alt="Teacher Portrait" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/60 to-transparent"></div>
              </motion.div>
            </div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-md bg-white p-8 rounded-[2.5rem] shadow-2xl text-gray-900"
            >
              <div className="text-center mb-8">
                <div className="bg-emerald-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="text-emerald-600 w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">ابدأ الآن مجاناً</h2>
              </div>

              <div className="space-y-4">
                <button 
                  onClick={handleCreateSession}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-200"
                >
                  <Plus size={20} />
                  بدء حصة جديدة (معلم)
                </button>
                
                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-100"></span></div>
                  <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-4 text-gray-400 font-bold">أو انضم كطالب</span></div>
                </div>

                <div className="space-y-3">
                  <input 
                    type="text" 
                    placeholder="كود الحصة" 
                    className="w-full px-4 py-4 rounded-2xl border-2 border-gray-100 focus:border-emerald-500 outline-none text-center font-mono text-2xl uppercase tracking-widest"
                    value={sessionCode}
                    onChange={(e) => setSessionCode(e.target.value.toUpperCase())}
                  />
                  <input 
                    type="text" 
                    placeholder="اسم الطالب" 
                    className="w-full px-4 py-4 rounded-2xl border-2 border-gray-100 focus:border-emerald-500 outline-none text-right font-bold"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                  />
                  <button 
                    onClick={handleJoinSession}
                    className="w-full bg-gray-900 text-white hover:bg-black py-4 rounded-2xl font-bold transition-all shadow-xl"
                  >
                    انضمام للحصة
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Promotional Banner */}
        <div className="bg-yellow-400 py-4 overflow-hidden relative">
          <motion.div 
            animate={{ x: [0, -1000] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="flex whitespace-nowrap gap-12 items-center"
          >
            {[1,2,3,4,5].map(i => (
              <span key={i} className="text-black font-black text-xl uppercase italic">
                🔥 عرض خاص: خصم 30% على الخطط السنوية لفترة محدودة! • انضم لأكثر من 10,000 معلم متميز • جرب النسخة الاحترافية الآن 🔥
              </span>
            ))}
          </motion.div>
        </div>

        {/* Founder & Management Section */}
        <div className="bg-white py-24 border-t border-gray-100">
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-emerald-500 rounded-[4rem] rotate-6 group-hover:rotate-3 transition-transform duration-500"></div>
                <div className="relative w-80 h-[28rem] rounded-[4rem] overflow-hidden border-8 border-white shadow-2xl">
                  <img 
                    src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=1000" 
                    alt="Platform Manager" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="absolute -bottom-6 -right-6 bg-gray-900 text-white p-6 rounded-3xl shadow-xl">
                  <p className="font-black text-xl">أ. عمر النجدي</p>
                  <p className="text-emerald-400 text-sm font-bold">المؤسس والمدير التنفيذي</p>
                </div>
              </motion.div>

              <div className="flex-1 space-y-8 text-center lg:text-right">
                <div className="space-y-4">
                  <h2 className="text-4xl font-black text-gray-900 leading-tight">رؤيتنا لمستقبل <span className="text-emerald-600">التعليم الرقمي</span></h2>
                  <div className="w-20 h-2 bg-emerald-500 rounded-full mx-auto lg:mr-0 lg:ml-auto"></div>
                </div>
                
                <p className="text-xl text-gray-600 leading-relaxed font-medium italic">
                  "نحن نؤمن بأن كل معلم يستحق الأدوات التي تمكنه من الإبداع، وكل طالب يستحق تجربة تعليمية مشوقة. مهمتنا هي سد الفجوة بين التكنولوجيا والتعليم بلمسة إنسانية وذكاء اصطناعي يخدم المعلم لا يستبدله."
                </p>

                <div className="grid grid-cols-2 gap-6 pt-4">
                  <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                    <p className="text-3xl font-black text-emerald-600 mb-1">+30 سنة</p>
                    <p className="text-gray-500 text-sm font-bold">خبرة في تكنولوجيا التعليم</p>
                  </div>
                  <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                    <p className="text-3xl font-black text-emerald-600 mb-1">100%</p>
                    <p className="text-gray-500 text-sm font-bold">التزام بجودة المحتوى</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Section */}
        <div className="max-w-6xl mx-auto py-24 px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-gray-900 mb-4">خطط تناسب طموحك</h2>
            <p className="text-gray-500 text-lg">اختر الخطة التي تساعدك على تقديم أفضل تجربة تعليمية لطلابك</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Annual Plan */}
            <motion.div 
              whileHover={{ y: -10 }}
              className="bg-white p-8 rounded-[3rem] shadow-xl border border-gray-100 flex flex-col"
            >
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-2">الخطة السنوية</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-emerald-600">50$</span>
                  <span className="text-gray-400">/ سنة</span>
                </div>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                {['وصول كامل لجميع الألعاب', 'مساحة تخزين غير محدودة', 'دعم فني متميز', 'تقارير أداء الطلاب'].map((feat, i) => (
                  <li key={i} className="flex items-center gap-2 text-gray-600">
                    <CheckCircle size={18} className="text-emerald-500" />
                    {feat}
                  </li>
                ))}
              </ul>
              <button className="w-full py-4 rounded-2xl bg-emerald-50 text-emerald-600 font-bold hover:bg-emerald-100 transition-all">
                اشترك الآن
              </button>
            </motion.div>

            {/* 2 Years Plan - Featured */}
            <motion.div 
              whileHover={{ y: -10 }}
              className="bg-gray-900 p-8 rounded-[3rem] shadow-2xl border-4 border-emerald-500 flex flex-col relative"
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-emerald-500 text-white px-6 py-1 rounded-full text-sm font-bold">
                الأكثر طلباً
              </div>
              <div className="mb-8">
                <h3 className="text-xl font-bold text-white mb-2">خطة السنتين</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-emerald-400">70$</span>
                  <span className="text-gray-400">/ سنتين</span>
                </div>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                {['كل مميزات الخطة السنوية', 'أولوية في الميزات الجديدة', 'تدريب مباشر للمعلم', 'شهادة اعتماد المنصة'].map((feat, i) => (
                  <li key={i} className="flex items-center gap-2 text-gray-300">
                    <CheckCircle size={18} className="text-emerald-400" />
                    {feat}
                  </li>
                ))}
              </ul>
              <button className="w-full py-4 rounded-2xl bg-emerald-500 text-white font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20">
                اشترك الآن
              </button>
            </motion.div>

            {/* 3 Years Plan */}
            <motion.div 
              whileHover={{ y: -10 }}
              className="bg-white p-8 rounded-[3rem] shadow-xl border border-gray-100 flex flex-col"
            >
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-2">الخطة الذهبية (3 سنوات)</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-emerald-600">100$</span>
                  <span className="text-gray-400">/ 3 سنوات</span>
                </div>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                {['توفير هائل للمدارس', 'دعم فني VIP على مدار الساعة', 'تخصيص كامل للواجهة', 'تكامل مع أنظمة المدرسة'].map((feat, i) => (
                  <li key={i} className="flex items-center gap-2 text-gray-600">
                    <CheckCircle size={18} className="text-emerald-500" />
                    {feat}
                  </li>
                ))}
              </ul>
              <button className="w-full py-4 rounded-2xl bg-gray-900 text-white font-bold hover:bg-black transition-all">
                اشترك الآن
              </button>
            </motion.div>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-gray-50 py-12 border-t border-gray-100">
          <div className="max-w-6xl mx-auto px-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="text-emerald-600" />
              <span className="font-black text-xl">سبورة الصف الذكية</span>
            </div>
            <p className="text-gray-400 text-sm">© 2026 جميع الحقوق محفوظة. صُنع بكل حب للمعلمين العرب.</p>
          </div>
        </footer>
      </div>
    );
  }

  const handleCollectAnswers = async () => {
    if (currentQuestion?.type === 'fill') {
      const updatedAnswers = { ...answers };
      for (const id in updatedAnswers) {
        const ans = updatedAnswers[id];
        if (ans.answer && currentQuestion.word && currentQuestion.blankIndex !== undefined) {
          const result = await correctFillInTheBlank(
            currentQuestion.word,
            currentQuestion.blankIndex,
            ans.answer
          );
          updatedAnswers[id] = {
            ...ans,
            score: result.isCorrect ? 100 : 0,
            feedback: result.feedback
          };
        }
      }
      setAnswers(updatedAnswers);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col font-sans pb-12" dir="rtl">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="bg-emerald-600 text-white p-2 rounded-lg">
            <Layout size={20} />
          </div>
          <div>
            <h2 className="font-bold text-gray-900">سبورة الصف الذكية</h2>
            <p className="text-xs text-gray-500">كود الحصة: <span className="font-mono font-bold text-emerald-600">{sessionCode}</span></p>
          </div>
        </div>

        {role === 'teacher' && (
          <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-xl">
            <button 
              onClick={() => setActiveTab('explain')}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'explain' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500'}`}
            >
              شاشة الشرح
            </button>
            <button 
              onClick={() => setActiveTab('questions')}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'questions' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500'}`}
            >
              إدارة الأسئلة
            </button>
            <button 
              onClick={() => setActiveTab('games')}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'games' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500'}`}
            >
              الألعاب التعليمية
            </button>
            <button 
              onClick={() => setActiveTab('exercises')}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'exercises' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500'}`}
            >
              التدريبات
            </button>
            <button 
              onClick={() => setActiveTab('tests')}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'tests' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500'}`}
            >
              الاختبارات
            </button>
            <button 
              onClick={() => setActiveTab('pricing')}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'pricing' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500'}`}
            >
              الاشتراكات
            </button>
          </div>
        )}

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
            <button onClick={() => addSticker('check')} className="p-2 hover:bg-white rounded-lg text-emerald-600 transition-all" title="صح"><Check size={20} /></button>
            <button onClick={() => addSticker('cross')} className="p-2 hover:bg-white rounded-lg text-red-600 transition-all" title="خطأ"><X size={20} /></button>
            <button onClick={() => addSticker('star')} className="p-2 hover:bg-white rounded-lg text-amber-500 transition-all" title="نجمة"><Star size={20} /></button>
            <button onClick={() => addSticker('smile')} className="p-2 hover:bg-white rounded-lg text-emerald-500 transition-all" title="وجه مبتسم"><Smile size={20} /></button>
            <button onClick={() => addSticker('frown')} className="p-2 hover:bg-white rounded-lg text-orange-500 transition-all" title="وجه غاضب"><Frown size={20} /></button>
          </div>

          <button 
            onClick={toggleFullscreen}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-600 transition-all"
            title="توسيع الشاشة"
          >
            {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
          </button>

          {role === 'teacher' && (
            <button 
              onClick={toggleLock}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all ${isLocked ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}
            >
              {isLocked ? <Lock size={18} /> : <Unlock size={18} />}
              {isLocked ? 'قفل شاشة الطلاب' : 'فتح شاشة الطلاب'}
            </button>
          )}
          <div className="flex items-center gap-2 text-gray-600">
            <Users size={18} />
            <span className="font-bold">{Object.keys(students).length}</span>
          </div>
          
          <div className="flex items-center gap-2 border-r border-gray-200 pr-4 mr-2">
            <button 
              onClick={() => {
                console.log('Red button clicked');
                toggleRecording();
              }}
              className={`h-10 px-3 rounded-xl flex items-center gap-2 transition-all shadow-md ${isRecording ? 'bg-red-600 animate-pulse' : 'bg-red-500 hover:bg-red-600'} text-white`}
              title={isRecording ? 'إيقاف التسجيل الداخلي' : 'بدء تسجيل الشاشة (داخلي)'}
            >
              {isRecording ? <div className="w-3 h-3 bg-white rounded-sm" /> : <Video size={18} />}
              <span className="text-xs font-bold hidden sm:inline">تسجيل داخلي</span>
            </button>
            
            <button 
              onClick={() => {
                console.log('Green button clicked');
                setShowRecordingHelp(true);
              }}
              className="h-10 px-3 rounded-xl flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white transition-all shadow-md"
              title="تعليمات التسجيل الخارجي (Free Cam 8)"
            >
              <Video size={18} className="text-white" />
              <span className="text-xs font-bold hidden sm:inline">تسجيل خارجي</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* Sidebar Tools */}
        <aside className="w-20 bg-white border-l border-gray-200 flex flex-col items-center py-4 gap-4 shadow-sm overflow-y-auto">
          <div className="flex flex-col gap-2">
            {(['pen', 'calligraphy', 'chiseled', 'text', 'gold', 'laser', 'eraser', 'ruler', 'rect', 'circle', 'triangle'] as Tool[]).map((t) => (
              <button
                key={t}
                onPointerDown={(e) => {
                  e.preventDefault();
                  setTool(t);
                }}
                className={`p-3 rounded-2xl transition-all ${tool === t ? 'bg-emerald-600 text-white shadow-lg scale-110' : 'text-gray-400 hover:bg-gray-100 hover:text-emerald-600'} cursor-pointer active:scale-95`}
                title={
                  t === 'pen' ? 'قلم عادي' :
                  t === 'calligraphy' ? 'قلم خط' :
                  t === 'chiseled' ? 'قلم مشطوف' :
                  t === 'text' ? 'كتابة نص' :
                  t === 'gold' ? 'قلم ذهبي' :
                  t === 'laser' ? 'مؤشر ليزر' :
                  t === 'eraser' ? 'ممحاة' :
                  t === 'ruler' ? 'مسطرة' :
                  t === 'rect' ? 'مستطيل' :
                  t === 'circle' ? 'دائرة' :
                  t === 'triangle' ? 'مثلث' : t
                }
              >
                {t === 'pen' && <Pen size={20} />}
                {t === 'calligraphy' && <Pen size={20} className="rotate-45" />}
                {t === 'chiseled' && <Pen size={20} className="-rotate-12" />}
                {t === 'text' && <TextIcon size={20} />}
                {t === 'gold' && <Sparkles size={20} />}
                {t === 'laser' && <MousePointer2 size={20} />}
                {t === 'eraser' && <Eraser size={20} />}
                {t === 'ruler' && <Ruler size={20} />}
                {t === 'rect' && <Square size={20} />}
                {t === 'circle' && <CircleIcon size={20} />}
                {t === 'triangle' && <Triangle size={20} />}
              </button>
            ))}
          </div>

          <div className="w-10 h-px bg-gray-200" />

          <div className="flex flex-col gap-2">
            <button
              onClick={underlineScreen}
              className="p-3 rounded-2xl text-gray-400 hover:bg-gray-100 hover:text-emerald-600 transition-all"
              title="تسطير الشاشة"
            >
              <Rows size={20} />
            </button>
            <button
              onClick={toggleLargeFont}
              className={`p-3 rounded-2xl transition-all ${isLargeFont ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-100 hover:text-purple-600'}`}
              title="تكبير الخطوط"
            >
              <Maximize2 size={20} />
            </button>
          </div>

          <div className="w-10 h-px bg-gray-200" />

          {/* Brush Size Control */}
          <div className="flex flex-col items-center gap-2 px-2">
            <span className="text-[10px] font-bold text-gray-400">الحجم</span>
            <input 
              type="range" 
              min="2" 
              max="50" 
              value={brushSize} 
              onChange={(e) => setBrushSize(parseInt(e.target.value))}
              className="w-12 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
            <span className="text-[10px] font-mono text-emerald-600">{brushSize}</span>
          </div>

          <div className="w-10 h-px bg-gray-200" />

          {/* Grid Controls */}
          <div className="flex flex-col items-center gap-3">
            <span className="text-[10px] font-bold text-gray-400">التسطير</span>
            <div className="flex flex-col gap-2">
              <button 
                onClick={() => {
                  const newShowGrid = !showGrid;
                  setShowGrid(newShowGrid);
                  syncBoard(lines, images, texts, shapes, newShowGrid, gridSpacing);
                }} 
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-sm ${showGrid ? 'bg-red-600 text-white scale-110' : 'bg-red-500 text-white hover:bg-red-600'}`}
                title="تسطير الصفحة"
              >
                <Layout size={16} />
              </button>
              <button 
                onClick={() => {
                  const newSpacing = gridSpacing >= 100 ? 20 : gridSpacing + 20;
                  setGridSpacing(newSpacing);
                  syncBoard(lines, images, texts, shapes, showGrid, newSpacing);
                }} 
                className="w-8 h-8 rounded-full bg-emerald-500 text-white hover:bg-emerald-600 flex items-center justify-center transition-all active:scale-95 shadow-sm"
                title="توسيع/تقريب الأسطر"
              >
                <Ruler size={16} />
              </button>
            </div>
          </div>

          <div className="w-10 h-px bg-gray-200" />

          <div className="grid grid-cols-2 gap-2 p-2">
            {['#000000', '#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'].map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`w-6 h-6 rounded-full border-2 ${color === c ? 'border-gray-900 scale-110' : 'border-transparent'}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>

          <div className="mt-auto flex flex-col gap-2">
            <label className="p-3 rounded-2xl text-gray-400 hover:bg-gray-100 cursor-pointer">
              <ImageIcon size={20} />
              <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
            </label>
            <button 
              onClick={() => {
                setLines([]);
                setShowGrid(false);
                setGridSpacing(40);
                socket.emit('clear-board', { code: sessionCode });
              }}
              className="p-3 rounded-2xl text-red-400 hover:bg-red-50"
            >
              <Trash2 size={20} />
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 p-6 overflow-auto bg-[#F0F2F5]">
          {role === 'teacher' ? (
            <div className="h-full">
              {activeTab === 'explain' && (
                <div className="h-full flex flex-col gap-4">
                  <div className="flex-1 relative">
                    <Board 
                      lines={lines} 
                      images={images}
                      texts={texts}
                      shapes={shapes}
                      onDraw={handleDraw}
                      onImagesUpdate={(newImages) => {
                        setImages(newImages);
                        syncBoard(lines, newImages, texts, shapes);
                      }}
                      onTextsUpdate={(newTexts) => {
                        setTexts(newTexts);
                        syncBoard(lines, images, newTexts, shapes);
                      }}
                      onShapesUpdate={(newShapes) => {
                        setShapes(newShapes);
                        syncBoard(lines, images, texts, newShapes);
                      }}
                      tool={tool}
                      color={color}
                      brushSize={brushSize}
                      isReadOnly={false}
                      showGrid={showGrid}
                      gridSpacing={gridSpacing}
                    />
                  </div>
                </div>
              )}

              {activeTab === 'questions' && (
                <div className="max-w-5xl mx-auto space-y-8">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold text-gray-800">بنك الأسئلة التفاعلي</h3>
                    <div className="flex gap-4">
                      <label className="bg-emerald-600 text-white px-6 py-2 rounded-xl font-bold shadow-lg shadow-emerald-100 flex items-center gap-2 cursor-pointer hover:bg-emerald-700 transition-all">
                        <BookOpen size={18} />
                        إرسال قصاصة كتاب
                        <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                      </label>
                      <div className="flex gap-2 bg-white p-1 rounded-xl shadow-sm border border-gray-100">
                        {(['beginner', 'intermediate', 'advanced'] as const).map((l) => (
                          <button
                            key={l}
                            onClick={() => setQuestionLevel(l)}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${questionLevel === l ? 'bg-emerald-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
                          >
                            {l === 'beginner' ? 'مبتدئ' : l === 'intermediate' ? 'متوسط' : 'متقدم'}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {ARABIC_QUESTION_BANK.filter(q => q.level === questionLevel).map((q) => (
                      <motion.button
                        whileHover={{ y: -5 }}
                        key={q.id}
                        onClick={() => sendQuestion(q)}
                        className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all text-right flex flex-col gap-4 relative overflow-hidden group"
                      >
                        <div className="absolute top-0 right-0 w-2 h-full bg-emerald-500 opacity-0 group-hover:opacity-100 transition-all" />
                        <div className="flex items-center justify-between">
                          <div className="bg-emerald-50 text-emerald-600 p-3 rounded-2xl">
                            {q.type === 'mcq' && <HelpCircle size={24} />}
                            {q.type === 'fill' && <Layout size={24} />}
                            {q.type === 'match' && <ImageIcon size={24} />}
                          </div>
                          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                            {q.type === 'mcq' ? 'اختيار' : q.type === 'fill' ? 'تكملة' : 'مطابقة'}
                          </span>
                        </div>
                        <p className="font-bold text-gray-900 line-clamp-2">{q.text}</p>
                        {q.imageUrl && (
                          <img src={q.imageUrl} alt="" className="w-full h-24 object-cover rounded-xl" referrerPolicy="no-referrer" />
                        )}
                      </motion.button>
                    ))}
                  </div>

                  <div className="w-full h-px bg-gray-200 my-8" />

                  {/* Answers Grid */}
                  <div className="mt-12">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-gray-800">إجابات الطلاب الحالية</h3>
                      <button 
                        onClick={handleCollectAnswers}
                        className="bg-emerald-600 text-white px-6 py-2 rounded-xl font-bold shadow-lg shadow-emerald-100 flex items-center gap-2"
                      >
                        <Sparkles size={18} />
                        تصحيح الإجابات بالذكاء الاصطناعي
                      </button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {Object.entries(answers).map(([id, ans]) => (
                        <div key={id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-3">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-sm">{ans.studentName}</span>
                            <div className="flex gap-1">
                              {ans.score !== undefined && (
                                <span className={`text-[10px] px-2 py-0.5 rounded-full ${ans.score > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                  {ans.score}%
                                </span>
                              )}
                              {ans.rating && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-600">
                                  {ans.rating}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="h-32 bg-gray-50 rounded-lg flex items-center justify-center text-2xl font-black text-emerald-700 border-2 border-emerald-100 relative group">
                            {typeof ans.answer === 'string' ? ans.answer : (typeof ans.answer === 'object' ? 'إجابة مطابقة' : 'إجابة مرسومة')}
                          </div>

                          {/* Feedback Controls */}
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between gap-2">
                              <button 
                                onClick={() => giveFeedback(id, { score: 100 })}
                                className={`flex-1 p-2 rounded-lg border-2 transition-all flex items-center justify-center ${ans.score === 100 ? 'bg-green-500 border-green-500 text-white' : 'border-green-100 text-green-500 hover:bg-green-50'}`}
                                title="إجابة صحيحة"
                              >
                                <CheckCircle size={18} />
                              </button>
                              <button 
                                onClick={() => giveFeedback(id, { score: 0 })}
                                className={`flex-1 p-2 rounded-lg border-2 transition-all flex items-center justify-center ${ans.score === 0 ? 'bg-red-500 border-red-500 text-white' : 'border-red-100 text-red-500 hover:bg-red-50'}`}
                                title="إجابة خاطئة"
                              >
                                <XCircle size={18} />
                              </button>
                            </div>
                            
                            <div className="relative group/rating">
                              <button className="w-full py-1 px-2 rounded-lg text-[10px] font-bold border border-blue-100 text-blue-600 bg-blue-50 flex items-center justify-center gap-1 hover:bg-blue-100 transition-all">
                                <Star size={12} className={ans.rating ? 'fill-blue-600' : ''} />
                                {ans.rating || 'إضافة تقدير'}
                              </button>
                              
                              <div className="absolute bottom-full left-0 right-0 mb-1 bg-white border border-gray-100 shadow-xl rounded-xl p-1 hidden group-hover/rating:flex flex-col gap-1 z-10">
                                {(['مقبول', 'جيد', 'متميز'] as const).map((r) => (
                                  <button
                                    key={r}
                                    onClick={() => giveFeedback(id, { rating: r })}
                                    className={`w-full py-1.5 px-2 rounded-lg text-[10px] font-bold transition-all text-right ${ans.rating === r ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-blue-50'}`}
                                  >
                                    {r}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'games' && (
                <div className="max-w-5xl mx-auto space-y-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800">الألعاب التعليمية التفاعلية</h3>
                      <p className="text-gray-500">اختر اللعبة والمستوى المناسب لطلابك</p>
                    </div>
                    <div className="flex gap-2 bg-white p-1 rounded-xl shadow-sm border border-gray-100">
                      {(['easy', 'medium', 'hard'] as const).map((l) => (
                        <button
                          key={l}
                          onClick={() => setSelectedGameLevel(l)}
                          className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${selectedGameLevel === l ? 'bg-sky-600 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}
                        >
                          {l === 'easy' ? 'سهل' : l === 'medium' ? 'متوسط' : 'صعب'}
                        </button>
                      ))}
                    </div>
                    {gameState?.active && (
                      <button 
                        onClick={stopGame}
                        className="bg-red-500 text-white px-6 py-2 rounded-xl font-bold hover:bg-red-600 transition-colors"
                      >
                        إنهاء اللعبة
                      </button>
                    )}
                  </div>
                  
                  {!gameState?.active ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        onClick={() => startBalloonsGame('mad')}
                        className="bg-white p-6 rounded-[2rem] shadow-xl border-b-8 border-sky-500 text-right flex flex-col gap-4"
                      >
                        <div className="bg-sky-100 w-12 h-12 rounded-2xl flex items-center justify-center">
                          <Star className="text-sky-600 w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="text-xl font-black text-gray-900">بالونات المدود</h4>
                          <p className="text-sm text-gray-500">تمييز أنواع المد (أ، و، ي)</p>
                        </div>
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        onClick={() => startBalloonsGame('vowels')}
                        className="bg-white p-6 rounded-[2rem] shadow-xl border-b-8 border-emerald-500 text-right flex flex-col gap-4"
                      >
                        <div className="bg-emerald-100 w-12 h-12 rounded-2xl flex items-center justify-center">
                          <Layout className="text-emerald-600 w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="text-xl font-black text-gray-900">بالونات الحركات</h4>
                          <p className="text-sm text-gray-500">تمييز الفتحة والضمة والكسرة</p>
                        </div>
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        onClick={() => startBalloonsGame('tanween')}
                        className="bg-white p-6 rounded-[2rem] shadow-xl border-b-8 border-purple-500 text-right flex flex-col gap-4"
                      >
                        <div className="bg-purple-100 w-12 h-12 rounded-2xl flex items-center justify-center">
                          <Sparkles className="text-purple-600 w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="text-xl font-black text-gray-900">بالونات التنوين</h4>
                          <p className="text-sm text-gray-500">تمييز أنواع التنوين الثلاثة</p>
                        </div>
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        onClick={startSortingGame}
                        className="bg-white p-6 rounded-[2rem] shadow-xl border-b-8 border-orange-500 text-right flex flex-col gap-4"
                      >
                        <div className="bg-orange-100 w-12 h-12 rounded-2xl flex items-center justify-center">
                          <MousePointer2 className="text-orange-600 w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="text-xl font-black text-gray-900">فرز اللام</h4>
                          <p className="text-sm text-gray-500">اللام الشمسية واللام القمرية</p>
                        </div>
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        onClick={startTrainGame}
                        className="bg-white p-6 rounded-[2rem] shadow-xl border-b-8 border-emerald-500 text-right flex flex-col gap-4"
                      >
                        <div className="bg-emerald-100 w-12 h-12 rounded-2xl flex items-center justify-center">
                          <TrainFront className="text-emerald-600 w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="text-xl font-black text-gray-900">قطار المدود</h4>
                          <p className="text-sm text-gray-500">صنف الكلمات في عربات القطار</p>
                        </div>
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        onClick={startFormationGame}
                        className="bg-white p-6 rounded-[2rem] shadow-xl border-b-8 border-purple-500 text-right flex flex-col gap-4"
                      >
                        <div className="bg-purple-100 w-12 h-12 rounded-2xl flex items-center justify-center">
                          <Sparkles className="text-purple-600 w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="text-xl font-black text-gray-900">لعبة التشكيل</h4>
                          <p className="text-sm text-gray-500">ضع الحركة الصحيحة على الحرف</p>
                        </div>
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        onClick={startMatchingGame}
                        className="bg-white p-6 rounded-[2rem] shadow-xl border-b-8 border-blue-500 text-right flex flex-col gap-4"
                      >
                        <div className="bg-blue-100 w-12 h-12 rounded-2xl flex items-center justify-center">
                          <LinkIcon className="text-blue-600 w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="text-xl font-black text-gray-900">لعبة التوصيل</h4>
                          <p className="text-sm text-gray-500">صل الكلمة بالصورة المناسبة</p>
                        </div>
                      </motion.button>
                    </div>
                  ) : (
                    <div className="w-full">
                      {gameState.type === 'balloons' ? (
                        <BalloonsGame 
                          role="teacher" 
                          data={gameState.data} 
                          level={gameState.level}
                          scores={gameState.scores} 
                        />
                      ) : gameState.type === 'sorting' ? (
                        <SortingGame 
                          role="teacher" 
                          data={gameState.data} 
                          level={gameState.level}
                          scores={gameState.scores} 
                        />
                      ) : gameState.type === 'train' ? (
                        <TrainGame
                          role="teacher"
                          data={gameState.data}
                          level={gameState.level}
                          scores={gameState.scores}
                        />
                      ) : gameState.type === 'formation' ? (
                        <FormationGame
                          role="teacher"
                          data={gameState.data}
                          level={gameState.level}
                          scores={gameState.scores}
                        />
                      ) : (
                        <MatchingGame
                          role="teacher"
                          data={gameState.data}
                          level={gameState.level}
                          scores={gameState.scores}
                        />
                      )}
                    </div>
                  )}
                </div>
              )}

              {(activeTab === 'exercises' || activeTab === 'tests') && (
                <div className="max-w-5xl mx-auto">
                  <AssignmentManager
                    type={activeTab === 'exercises' ? 'exercise' : 'test'}
                    assignments={assignments}
                    submissions={submissions}
                    onSend={(a) => {
                      setAssignments(prev => [...prev, a]);
                      sendAssignment(a);
                    }}
                    onGrade={gradeAssignment}
                  />
                </div>
              )}

              {activeTab === 'pricing' && (
                <div className="max-w-6xl mx-auto py-12">
                  <div className="text-center mb-12">
                    <h3 className="text-3xl font-black text-gray-900 mb-2">إدارة اشتراكك</h3>
                    <p className="text-gray-500">اختر الخطة المناسبة لفتح جميع المميزات الاحترافية</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                      { title: 'الخطة السنوية', price: '50$', period: 'سنة', color: 'emerald' },
                      { title: 'خطة السنتين', price: '70$', period: 'سنتين', color: 'emerald', featured: true },
                      { title: 'الخطة الذهبية', price: '100$', period: '3 سنوات', color: 'gray' }
                    ].map((plan, i) => (
                      <div key={i} className={`bg-white p-8 rounded-[3rem] shadow-xl border-2 ${plan.featured ? 'border-emerald-500 scale-105 z-10' : 'border-gray-50'} flex flex-col`}>
                        <h4 className="text-xl font-bold mb-4">{plan.title}</h4>
                        <div className="text-4xl font-black text-emerald-600 mb-6">{plan.price}</div>
                        <ul className="space-y-3 mb-8 flex-1 text-sm text-gray-600">
                          <li className="flex items-center gap-2"><CheckCircle size={16} className="text-emerald-500" /> وصول كامل للمنصة</li>
                          <li className="flex items-center gap-2"><CheckCircle size={16} className="text-emerald-500" /> دعم فني مباشر</li>
                          <li className="flex items-center gap-2"><CheckCircle size={16} className="text-emerald-500" /> تحديثات مستمرة</li>
                        </ul>
                        <button className={`w-full py-4 rounded-2xl font-bold transition-all ${plan.featured ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                          تفعيل الخطة
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex flex-col gap-4">
              {/* Game View for Student */}
              {gameState?.active && (
                <div className="w-full">
                  {gameState.type === 'balloons' ? (
                    <BalloonsGame 
                      role="student" 
                      data={gameState.data} 
                      level={gameState.level}
                      onScoreUpdate={(score) => socket.emit('update-score', { code: sessionCode, score })}
                    />
                  ) : gameState.type === 'sorting' ? (
                    <SortingGame 
                      role="student" 
                      data={gameState.data} 
                      level={gameState.level}
                      onScoreUpdate={(score) => socket.emit('update-score', { code: sessionCode, score })}
                    />
                  ) : gameState.type === 'train' ? (
                    <TrainGame
                      role="student"
                      data={gameState.data}
                      level={gameState.level}
                      onScoreUpdate={(score) => socket.emit('update-score', { code: sessionCode, score })}
                    />
                  ) : gameState.type === 'formation' ? (
                    <FormationGame
                      role="student"
                      data={gameState.data}
                      level={gameState.level}
                      onScoreUpdate={(score) => socket.emit('update-score', { code: sessionCode, score })}
                    />
                  ) : (
                    <MatchingGame
                      role="student"
                      data={gameState.data}
                      level={gameState.level}
                      onScoreUpdate={(score) => socket.emit('update-score', { code: sessionCode, score })}
                    />
                  )}
                </div>
              )}

              {/* Question Banner for Student */}
              {receivedQuestion && (
                <motion.div 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white p-6 rounded-3xl shadow-xl border-r-8 border-emerald-500 relative"
                >
                  {/* Student Feedback Display */}
                  <AnimatePresence>
                    {feedback && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8, x: 20 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.8, x: 20 }}
                        className="absolute -left-4 top-4 z-20 flex flex-col gap-2"
                      >
                        {feedback.score !== undefined && (
                          <div className={`p-3 rounded-2xl shadow-xl flex items-center gap-2 border-2 ${feedback.score > 0 ? 'bg-green-50 border-green-200 text-green-600' : 'bg-red-50 border-red-200 text-red-600'}`}>
                            {feedback.score > 0 ? <CheckCircle size={24} /> : <XCircle size={24} />}
                            <span className="font-black text-xl">{feedback.score > 0 ? 'أحسنت!' : 'حاول مجدداً'}</span>
                          </div>
                        )}
                        {feedback.rating && (
                          <div className="bg-blue-600 text-white p-3 rounded-2xl shadow-xl flex items-center gap-2 animate-bounce">
                            <Star size={20} className="fill-white" />
                            <span className="font-black text-lg">تقديرك: {feedback.rating}</span>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="bg-emerald-100 text-emerald-600 p-3 rounded-2xl">
                      <HelpCircle size={28} />
                    </div>
                    <h4 className="font-black text-3xl text-gray-900 leading-tight">{receivedQuestion.text}</h4>
                  </div>
                  
                  {receivedQuestion.imageUrl && receivedQuestion.type !== 'snippet' && (
                    <div className="mb-8 flex justify-center">
                      <img src={receivedQuestion.imageUrl} alt="" className="max-h-64 rounded-3xl shadow-lg border-4 border-white" referrerPolicy="no-referrer" />
                    </div>
                  )}

                  {receivedQuestion.type === 'snippet' && (
                    <div className="mt-6 h-[500px] border-4 border-dashed border-emerald-200 rounded-[2rem] overflow-hidden">
                      <Board
                        lines={lines}
                        images={images}
                        texts={texts}
                        shapes={shapes}
                        onDraw={handleDraw}
                        onImagesUpdate={(imgs) => {
                          setImages(imgs);
                          syncBoard(lines, imgs, texts, shapes);
                        }}
                        onTextsUpdate={(txts) => {
                          setTexts(txts);
                          syncBoard(lines, images, txts, shapes);
                        }}
                        onShapesUpdate={(shps) => {
                          setShapes(shps);
                          syncBoard(lines, images, texts, shps);
                        }}
                        tool={tool}
                        color={color}
                        brushSize={brushSize}
                        isReadOnly={false}
                      />
                    </div>
                  )}

                  {receivedQuestion.type === 'fill' && (
                    <div className="mt-6 flex flex-col items-center gap-12">
                      <div className="text-7xl font-black tracking-[0.5em] flex gap-6" dir="rtl">
                        {getArabicClusters(receivedQuestion.word || '').map((cluster, i) => {
                          const isBlank = i === receivedQuestion.blankIndex;
                          const baseLetter = cluster[0];
                          const marks = cluster.slice(1);
                          return (
                            <span 
                              key={i} 
                              className={`w-24 h-32 flex items-center justify-center border-4 rounded-3xl relative ${isBlank ? 'border-dashed border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-200 text-gray-900'}`}
                            >
                              <span className="relative">
                                {isBlank ? (studentAnswer || '؟') : baseLetter}
                                <span className="absolute inset-0 pointer-events-none flex items-center justify-center">
                                  {marks}
                                </span>
                              </span>
                            </span>
                          );
                        })}
                      </div>
                      <div className="flex gap-3 flex-wrap justify-center max-w-3xl">
                        {['أ', 'ب', 'ت', 'ث', 'ج', 'ح', 'خ', 'د', 'ذ', 'ر', 'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ع', 'غ', 'ف', 'ق', 'ك', 'ل', 'م', 'ن', 'هـ', 'و', 'ي'].map(char => (
                          <button
                            key={char}
                            onClick={() => setStudentAnswer(char)}
                            className={`w-14 h-14 rounded-2xl border-2 font-black text-2xl transition-all ${studentAnswer === char ? 'bg-emerald-600 text-white border-emerald-600 scale-125 shadow-2xl' : 'bg-white text-gray-800 border-gray-200 hover:border-emerald-500 hover:scale-110'}`}
                          >
                            {char}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {receivedQuestion.type === 'mcq' && (
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      {receivedQuestion.options?.map((opt, idx) => (
                        <button
                          key={idx}
                          onClick={() => setStudentAnswer(opt)}
                          className={`p-4 rounded-2xl border-2 transition-all text-right flex items-center justify-between ${studentAnswer === opt ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-inner' : 'bg-white border-gray-100 hover:border-emerald-200'}`}
                        >
                          <span className="font-bold text-lg">{opt}</span>
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${studentAnswer === opt ? 'border-emerald-500 bg-emerald-500' : 'border-gray-200'}`}>
                            {studentAnswer === opt && <CheckCircle size={14} className="text-white" />}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {receivedQuestion.type === 'match' && (
                    <div className="mt-6 space-y-4">
                      {receivedQuestion.matchPairs?.map((pair, idx) => (
                        <div key={idx} className="flex items-center gap-6 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                          <div className="w-24 h-24 bg-white rounded-xl overflow-hidden shadow-sm flex items-center justify-center">
                            {pair.image.startsWith('http') ? (
                              <img src={pair.image} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            ) : (
                              <span className="text-2xl font-bold text-emerald-600">{pair.image}</span>
                            )}
                          </div>
                          <div className="flex-1 flex gap-2 flex-wrap">
                            {receivedQuestion.matchPairs?.map(p => p.letter).sort().map(letter => (
                              <button
                                key={letter}
                                onClick={() => setMatchSelections({ ...matchSelections, [idx]: letter })}
                                className={`px-6 py-3 rounded-xl border-2 font-bold transition-all ${matchSelections[idx] === letter ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-gray-700 border-gray-100 hover:border-emerald-400'}`}
                              >
                                {letter}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <button 
                    onClick={submitAnswer}
                    className="mt-8 w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold shadow-xl shadow-emerald-100 flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all"
                  >
                    <Send size={20} />
                    إرسال الإجابة النهائية
                  </button>
                </motion.div>
              )}

              {/* Assignment View for Student */}
              {(receivedAssignment || receivedSubmission) && (
                <div className="max-w-3xl mx-auto mb-8">
                  <div className="flex justify-end mb-4">
                    <button 
                      onClick={() => {
                        setReceivedAssignment(null);
                        setReceivedSubmission(null);
                      }}
                      className="bg-white text-gray-500 px-4 py-2 rounded-xl font-bold shadow-sm hover:bg-gray-50 transition-all"
                    >
                      إغلاق العرض
                    </button>
                  </div>
                  <AssignmentStudentView
                    assignment={receivedAssignment || { id: receivedSubmission?.assignmentId || '', type: 'exercise', title: 'عمل مصحح', questions: [], createdAt: '' }}
                    studentId={socket.id || ''}
                    studentName={studentName}
                    onSubmit={submitAssignment}
                    receivedSubmission={receivedSubmission}
                  />
                </div>
              )}

              {/* Board Area for Student */}
              {!gameState?.active && !receivedQuestion && !receivedAssignment && !receivedSubmission && (
                <div className="flex-1 relative">
                  {isLocked && (
                    <div className="absolute inset-0 z-10 bg-black/5 backdrop-blur-[1px] flex items-center justify-center pointer-events-none">
                      <div className="bg-white/90 px-8 py-4 rounded-3xl shadow-2xl flex items-center gap-4 border border-gray-200">
                        <div className="bg-red-100 p-2 rounded-full">
                          <Lock className="text-red-500" size={24} />
                        </div>
                        <div>
                          <span className="font-bold text-gray-800 block text-lg">الشاشة مقفولة</span>
                          <span className="text-sm text-gray-500">تابع شرح المعلم الآن</span>
                        </div>
                      </div>
                    </div>
                  )}
                  <Board 
                    lines={lines} 
                    images={images}
                    texts={texts}
                    shapes={shapes}
                    onDraw={handleDraw}
                    onImagesUpdate={(newImages) => {
                      setImages(newImages);
                      syncBoard(lines, newImages, texts, shapes);
                    }}
                    onTextsUpdate={(newTexts) => {
                      setTexts(newTexts);
                      syncBoard(lines, images, newTexts, shapes);
                    }}
                    onShapesUpdate={(newShapes) => {
                      setShapes(newShapes);
                      syncBoard(lines, images, texts, newShapes);
                    }}
                    tool={tool}
                    color={color}
                    brushSize={brushSize}
                    isReadOnly={isLocked}
                    showGrid={showGrid}
                    gridSpacing={gridSpacing}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Student Status Sidebar (Teacher Only) */}
        {role === 'teacher' && (
          <aside className="w-64 bg-white border-r border-gray-200 p-4 shadow-sm hidden lg:block">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Users size={18} className="text-emerald-600" />
              حالة الطلاب
            </h3>
            <div className="space-y-2">
              {Object.values(students).map((s: any) => (
                <div key={s.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-sm font-medium text-gray-700">{s.name}</span>
                  </div>
                  {answers[s.id] ? (
                    <CheckCircle size={16} className="text-emerald-500" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-gray-200" />
                  )}
                </div>
              ))}
              {Object.keys(students).length === 0 && (
                <div className="text-center py-8 text-gray-400 text-sm">
                  لا يوجد طلاب متصلين حالياً
                </div>
              )}
            </div>
          </aside>
        )}
      </main>
      <ResourceLibrary />

      {/* Recording Help Modal */}
      <AnimatePresence>
        {showRecordingHelp && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-[9999] flex items-center justify-center p-4 overflow-y-auto"
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowRecordingHelp(false);
            }}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-[2.5rem] p-8 max-w-lg w-full shadow-2xl relative my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setShowRecordingHelp(false)}
                className="absolute top-6 left-6 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XCircle size={32} />
              </button>

              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-emerald-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
                  <Video size={40} className="text-emerald-600" />
                </div>
                <h2 className="text-3xl font-black text-gray-900 mb-2">خيارات تسجيل الحصة</h2>
                <p className="text-gray-500">اختر الطريقة المناسبة لك لتسجيل الشرح</p>
              </div>

              <div className="space-y-6 text-right" dir="rtl">
                <div className="bg-red-50 p-6 rounded-3xl border border-red-100">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                    <h3 className="font-bold text-red-900 text-lg">الخيار الأول: التسجيل الداخلي (الزر الأحمر)</h3>
                  </div>
                  <p className="text-red-700 text-sm leading-relaxed">
                    هذا الخيار مدمج في البرنامج. 
                    <br />
                    <strong className="block mt-2 font-black">⚠️ تنبيه هام:</strong>
                    لأنك تستخدم المعاينة الآن، يجب عليك فتح البرنامج في 
                    <span className="font-bold underline mx-1">نافذة جديدة</span> 
                    (عبر أيقونة السهم في أعلى المتصفح) ليعمل هذا الزر بنجاح.
                  </p>
                </div>

                <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full" />
                    <h3 className="font-bold text-emerald-900 text-lg">الخيار الثاني: برنامج Free Cam 8 (الزر الأخضر)</h3>
                  </div>
                  <p className="text-emerald-700 text-sm leading-relaxed">
                    نوصي باستخدام برنامج <strong>Free Cam 8</strong> الخارجي للحصول على أفضل جودة تسجيل وأكثر استقراراً.
                  </p>
                  <ol className="mt-3 space-y-2 text-emerald-800 text-sm list-decimal list-inside">
                    <li>قم بتشغيل برنامج Free Cam 8 على جهازك.</li>
                    <li>اختر منطقة التسجيل (نافذة المتصفح الحالية).</li>
                    <li>ابدأ التسجيل من داخل البرنامج الخارجي.</li>
                  </ol>
                </div>
              </div>

              <button 
                onClick={() => setShowRecordingHelp(false)}
                className="w-full mt-8 bg-gray-900 text-white py-4 rounded-2xl font-bold text-lg hover:bg-gray-800 transition-all shadow-lg"
              >
                فهمت، شكراً لك
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
