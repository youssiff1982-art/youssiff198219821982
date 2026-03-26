import React from 'react';
import { motion } from 'motion/react';
import { Rocket } from 'lucide-react';

interface StartPathProps {
  onSubscribe: () => void;
}

export const StartPath: React.FC<StartPathProps> = ({ onSubscribe }) => {
  return (
    <section className="relative h-[600px] flex items-center justify-center overflow-hidden font-ibm">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=1920" 
          alt="Start Path" 
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="relative z-10 bg-white p-12 rounded-[3rem] shadow-2xl max-w-2xl text-center border-8 border-white/20"
      >
        <div className="bg-blue-600 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-blue-200">
          <Rocket size={40} className="text-white" />
        </div>
        <h2 className="text-5xl font-bold mb-6 tracking-tighter">ابدأ مسارك اليوم</h2>
        <div className="w-24 h-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 mx-auto rounded-full mb-8"></div>
        <p className="text-2xl text-gray-600 font-medium mb-10">
          اشترك الآن واحصل على خطة تعلم تناسب مستواك ووقتك.
        </p>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onSubscribe}
          className="bg-blue-600 text-white px-12 py-5 rounded-2xl text-xl font-bold shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95"
        >
          اشترك الآن
        </motion.button>
      </motion.div>
    </section>
  );
};
