import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, 
  Video, 
  Gamepad2, 
  Presentation, 
  Palette, 
  ChevronUp, 
  ChevronDown,
  BookOpen,
  FileSpreadsheet,
  Film,
  PlayCircle,
  Trophy,
  Eraser,
  PenTool,
  Ruler,
  Gift
} from 'lucide-react';

interface Resource {
  title: string;
  icon: React.ReactNode;
  type: string;
}

interface Room {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  items: Resource[];
}

export const ResourceLibrary: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeRoom, setActiveRoom] = useState<string | null>(null);

  const rooms: Room[] = [
    {
      id: 'papers',
      name: 'المكتبة العلمية',
      icon: <FileText size={20} />,
      color: 'bg-blue-500',
      items: [
        { title: 'الكتب الدراسية', icon: <BookOpen size={16} />, type: 'pdf' },
        { title: 'أوراق العمل', icon: <FileSpreadsheet size={16} />, type: 'doc' },
        { title: 'التدريبات والتمارين', icon: <FileText size={16} />, type: 'doc' },
        { title: 'المذكرات التعليمية', icon: <FileText size={16} />, type: 'doc' },
      ]
    },
    {
      id: 'videos',
      name: 'صالة العرض',
      icon: <Video size={20} />,
      color: 'bg-red-500',
      items: [
        { title: 'الأفلام التعليمية', icon: <Film size={16} />, type: 'video' },
        { title: 'الفيديوهات التوضيحية', icon: <PlayCircle size={16} />, type: 'video' },
      ]
    },
    {
      id: 'games',
      name: 'نادي الألعاب',
      icon: <Gamepad2 size={20} />,
      color: 'bg-purple-500',
      items: [
        { title: 'الألعاب التفاعلية', icon: <Gamepad2 size={16} />, type: 'game' },
        { title: 'مسابقات وألغاز', icon: <Trophy size={16} />, type: 'game' },
      ]
    },
    {
      id: 'presentations',
      name: 'قاعة العروض',
      icon: <Presentation size={20} />,
      color: 'bg-orange-500',
      items: [
        { title: 'العروض التقديمية', icon: <Presentation size={16} />, type: 'ppt' },
        { title: 'ملفات بوربوينت', icon: <Presentation size={16} />, type: 'ppt' },
      ]
    },
    {
      id: 'creative',
      name: 'المرسم الإبداعي',
      icon: <Palette size={20} />,
      color: 'bg-emerald-500',
      items: [
        { title: 'أوراق فارغة مسطرة', icon: <FileText size={16} />, type: 'tool' },
        { title: 'أقلام وألوان', icon: <PenTool size={16} />, type: 'tool' },
        { title: 'مساطر ومحايات', icon: <Ruler size={16} />, type: 'tool' },
        { title: 'مجموعة الحوافز', icon: <Gift size={16} />, type: 'reward' },
      ]
    }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40">
      {/* Toggle Button */}
      <div className="flex justify-center -mb-1">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-white border-t border-x border-gray-200 px-6 py-1 rounded-t-2xl shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] flex items-center gap-2 text-gray-500 hover:text-emerald-600 transition-colors"
        >
          <span className="text-xs font-bold">مكتبة المصادر</span>
          {isOpen ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
        </button>
      </div>

      {/* Library Content */}
      <motion.div
        initial={false}
        animate={{ height: isOpen ? 'auto' : 0 }}
        className="bg-white border-t border-gray-200 shadow-2xl overflow-hidden"
      >
        <div className="max-w-7xl mx-auto p-4">
          <div className="grid grid-cols-5 gap-4">
            {rooms.map((room) => (
              <div key={room.id} className="flex flex-col gap-3">
                <button
                  onClick={() => setActiveRoom(activeRoom === room.id ? null : room.id)}
                  className={`flex items-center gap-3 p-3 rounded-2xl transition-all ${
                    activeRoom === room.id 
                    ? `${room.color} text-white shadow-lg` 
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className={`p-2 rounded-xl ${activeRoom === room.id ? 'bg-white/20' : 'bg-white shadow-sm'}`}>
                    {room.icon}
                  </div>
                  <span className="font-bold text-sm">{room.name}</span>
                </button>

                <AnimatePresence>
                  {activeRoom === room.id && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="bg-gray-50 rounded-2xl p-2 flex flex-col gap-1"
                    >
                      {room.items.map((item, idx) => (
                        <button
                          key={idx}
                          className="flex items-center gap-2 p-2 rounded-xl hover:bg-white hover:shadow-sm transition-all text-right group"
                        >
                          <div className="text-gray-400 group-hover:text-emerald-500 transition-colors">
                            {item.icon}
                          </div>
                          <span className="text-xs font-medium text-gray-600 group-hover:text-gray-900">
                            {item.title}
                          </span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
