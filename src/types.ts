export type Tool = 'pen' | 'calligraphy' | 'chiseled' | 'gold' | 'laser' | 'eraser' | 'image' | 'text' | 'ruler' | 'rect' | 'circle' | 'triangle';

export interface Point {
  x: number;
  y: number;
}

export interface LineData {
  tool: Tool;
  color: string;
  points: number[];
  width: number;
}

export interface ImageData {
  url: string;
  x: number;
  y: number;
  width: number;
  height: number;
  locked?: boolean;
}

export interface TextData {
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  fontFamily?: string;
  id: string;
}

export interface ShapeData {
  type: 'rect' | 'circle' | 'triangle';
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  strokeWidth: number;
  id: string;
}

export interface Question {
  id?: string;
  type: 'open' | 'mcq' | 'tf' | 'fill' | 'match' | 'snippet' | 'arrange' | 'math' | 'analysis' | 'formation';
  skill?: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  text: string;
  imageUrl?: string;
  options?: string[];
  correctAnswer?: string;
  word?: string; // For fill-in-the-blank or analysis
  blankIndex?: number; // For fill-in-the-blank
  matchPairs?: { image: string; letter: string }[]; // For matching questions
  items?: string[]; // For arrangement questions
  syllables?: string[]; // For word analysis/formation
}

export interface StudentAnswer {
  studentName: string;
  answer: any;
  score?: number;
  feedback?: string;
  rating?: 'مقبول' | 'جيد' | 'متميز';
}

export interface BalloonGameData {
  target: string;
  words: { word: string; isCorrect: boolean; id: string }[];
  skill: 'mad' | 'vowels' | 'tanween';
}

export interface GameState {
  type: 'balloons' | 'sorting' | 'train' | 'matching' | 'formation' | 'quiz-race' | 'word-search' | 'memory';
  level: 'easy' | 'medium' | 'hard';
  active: boolean;
  data: any;
  scores: Record<string, { name: string; score: number }>;
}

export interface Assignment {
  id: string;
  type: 'exercise' | 'test';
  title: string;
  questions: Question[];
  createdAt: string;
}

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  answers: Record<string, any>;
  status: 'submitted' | 'graded';
  score?: number;
  feedback?: string;
  submittedAt: string;
  gradedAt?: string;
}
