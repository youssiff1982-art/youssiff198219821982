import { Question } from "../types";

export const ARABIC_QUESTION_BANK: Question[] = [
  // Beginner - Short Vowels
  {
    id: 'b1',
    type: 'mcq',
    level: 'beginner',
    text: 'ما هي الحركة على حرف الألف في كلمة (أَسَد)؟',
    options: ['فتحة', 'ضمة', 'كسرة', 'سكون'],
    correctAnswer: 'فتحة',
    imageUrl: 'https://picsum.photos/seed/lion/200/200'
  },
  {
    id: 'b2',
    type: 'fill',
    level: 'beginner',
    text: 'أكمل الحرف الناقص في كلمة (بَـ_ـة):',
    word: 'بَطَّة',
    blankIndex: 1,
    imageUrl: 'https://picsum.photos/seed/duck/200/200'
  },
  {
    id: 'b3',
    type: 'match',
    level: 'beginner',
    text: 'طابق الصورة بالحرف الأول المناسب:',
    matchPairs: [
      { image: 'https://picsum.photos/seed/apple/100/100', letter: 'أ' },
      { image: 'https://picsum.photos/seed/ball/100/100', letter: 'ب' },
      { image: 'https://picsum.photos/seed/crown/100/100', letter: 'ت' }
    ]
  },
  {
    id: 'b4',
    type: 'mcq',
    level: 'beginner',
    text: 'أي حرف يبدأ به اسم (تِمْسَاح)؟',
    options: ['ت', 'ث', 'ب', 'ج'],
    correctAnswer: 'ت',
    imageUrl: 'https://picsum.photos/seed/crocodile/200/200'
  },
  {
    id: 'b5',
    type: 'fill',
    level: 'beginner',
    text: 'أكمل الحرف الأول في كلمة (_ـمَل):',
    word: 'جَمَل',
    blankIndex: 0,
    imageUrl: 'https://picsum.photos/seed/camel/200/200'
  },

  // Intermediate - Long Vowels (Madood)
  {
    id: 'i1',
    type: 'mcq',
    level: 'intermediate',
    text: 'ما هو حرف المد في كلمة (كِتَاب)؟',
    options: ['ألف', 'واو', 'ياء', 'لا يوجد'],
    correctAnswer: 'ألف'
  },
  {
    id: 'i2',
    type: 'fill',
    level: 'intermediate',
    text: 'أكمل حرف المد الناقص في كلمة (عُـ_ـفور):',
    word: 'عُصْفُور',
    blankIndex: 1,
    imageUrl: 'https://picsum.photos/seed/bird/200/200'
  },
  {
    id: 'i3',
    type: 'mcq',
    level: 'intermediate',
    text: 'كلمة (سَعِيد) تحتوي على مد بـ:',
    options: ['الألف', 'الواو', 'الياء'],
    correctAnswer: 'الياء'
  },
  {
    id: 'i4',
    type: 'match',
    level: 'intermediate',
    text: 'طابق الكلمة بنوع المد فيها:',
    matchPairs: [
      { image: 'حُوت', letter: 'مد بالواو' },
      { image: 'فِيل', letter: 'مد بالياء' },
      { image: 'نَار', letter: 'مد بالألف' }
    ]
  },
  {
    id: 'i5',
    type: 'mcq',
    level: 'intermediate',
    text: 'كلمة (طُيُور) بها مد بـ:',
    options: ['الألف', 'الواو', 'الياء'],
    correctAnswer: 'الالواو'
  },

  // Advanced - Complex Words and Grammar
  {
    id: 'a1',
    type: 'fill',
    level: 'advanced',
    text: 'أكمل الحرف الناقص في كلمة (مُهَنْـ_ـس):',
    word: 'مُهَنْدِس',
    blankIndex: 3,
    imageUrl: 'https://picsum.photos/seed/engineer/200/200'
  },
  {
    id: 'a2',
    type: 'mcq',
    level: 'advanced',
    text: 'أي من الكلمات التالية تحتوي على مد طويل بالواو؟',
    options: ['وَلَد', 'نُور', 'وَجْه', 'وَرْدَة'],
    correctAnswer: 'نُور'
  },
  {
    id: 'a3',
    type: 'match',
    level: 'advanced',
    text: 'طابق الكلمة بنوع المد فيها:',
    matchPairs: [
      { image: 'بَاب', letter: 'مد بالألف' },
      { image: 'تُوت', letter: 'مد بالواو' },
      { image: 'تِين', letter: 'مد بالياء' }
    ]
  },
  {
    id: 'a4',
    type: 'fill',
    level: 'advanced',
    text: 'أكمل الحرف الناقص في كلمة (إِسْـ_ـيَا):',
    word: 'إِسْيَا',
    blankIndex: 2,
    imageUrl: 'https://picsum.photos/seed/asia/200/200'
  },
  {
    id: 'a5',
    type: 'mcq',
    level: 'advanced',
    text: 'ما هو نوع المد في كلمة (مَصَابِيح)؟',
    options: ['ألف فقط', 'ياء فقط', 'ألف وياء', 'واو'],
    correctAnswer: 'ألف وياء'
  }
];
