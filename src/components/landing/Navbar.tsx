import React from 'react';
import { motion } from 'motion/react';
import { User, Phone, Mail, Share2, ChevronDown, GraduationCap } from 'lucide-react';

interface NavbarProps {
  onNavigate: (sectionId: string) => void;
  onRegister: () => void;
  onEnterBoard: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate, onRegister, onEnterBoard }) => {
  return (
    <nav className="sticky top-0 z-[100] bg-white/80 backdrop-blur-xl border-b border-gray-100 font-ibm">
      <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
        <div className="flex items-center gap-12">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => window.location.href = 'http://69b8a72297f51.site123.me/'}>
            <div className="bg-blue-600 p-3 rounded-2xl text-white shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform">
              <GraduationCap size={28} />
            </div>
            <span className="text-2xl font-bold text-gray-900 tracking-tighter">المنصة <span className="text-blue-600">التعليمية</span></span>
          </div>
          
          <div className="hidden lg:flex items-center gap-10 font-medium text-gray-500">
            <button onClick={() => window.location.href = 'http://69b8a72297f51.site123.me/'} className="hover:text-blue-600 transition-colors uppercase tracking-widest text-sm">الرئيسية</button>
            <button onClick={onEnterBoard} className="text-blue-600 hover:text-blue-700 transition-colors uppercase tracking-widest text-sm font-bold border-b-2 border-blue-600 pb-1">السبورة الذكية</button>
            <button onClick={() => onNavigate('services')} className="hover:text-blue-600 transition-colors uppercase tracking-widest text-sm">خدماتنا</button>
            <button onClick={() => onNavigate('about')} className="hover:text-blue-600 transition-colors uppercase tracking-widest text-sm">من نحن</button>
            <button onClick={() => onNavigate('testimonials')} className="hover:text-blue-600 transition-colors uppercase tracking-widest text-sm">آراء العملاء</button>
            <button onClick={() => onNavigate('contact')} className="hover:text-blue-600 transition-colors uppercase tracking-widest text-sm">اتصل بنا</button>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-4">
            <button className="p-3 hover:bg-gray-100 rounded-2xl transition-colors text-gray-400 hover:text-gray-900"><Share2 size={22} /></button>
            <button className="p-3 hover:bg-gray-100 rounded-2xl transition-colors text-gray-400 hover:text-gray-900"><Mail size={22} /></button>
            <button className="p-3 hover:bg-gray-100 rounded-2xl transition-colors text-gray-400 hover:text-gray-900"><Phone size={22} /></button>
          </div>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onRegister}
            className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all flex items-center gap-3"
          >
            <User size={20} />
            <span>اشترك الآن</span>
          </motion.button>
        </div>
      </div>
    </nav>
  );
};
