import React from 'react';
import { motion } from 'motion/react';
import { Star, Quote, Sparkles } from 'lucide-react';

export const Testimonials: React.FC = () => {
  return (
    <section id="testimonials" className="py-32 bg-white font-ibm overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-24">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-sm font-bold mb-6 uppercase tracking-widest"
          >
            <Sparkles size={16} /> آراء طلابنا
          </motion.div>
          <h2 className="text-6xl font-bold text-gray-900 tracking-tighter">قصص <span className="text-blue-600">نجاح</span> ملهمة</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-slate-50 rounded-[4rem] overflow-hidden shadow-2xl flex flex-col md:flex-row items-stretch border-8 border-white group hover:shadow-blue-100 transition-all duration-500"
          >
            <div className="flex-1 p-12 text-right relative">
              <div className="absolute top-10 right-10 text-blue-100/50">
                <Quote size={80} />
              </div>
              <div className="relative z-10">
                <div className="mb-8">
                  <p className="text-lg text-blue-600 font-bold mb-2">موظفة وباحثة عن تطوير مهارات</p>
                  <h3 className="text-4xl font-bold mb-4 text-gray-900 tracking-tighter">سارة الخالدي</h3>
                </div>
                <p className="text-xl text-gray-600 leading-relaxed font-medium mb-10">
                  "أحببت المرونة في التعلم، أدرس بعد الدوام وأتابع تقدمي بسهولة. الدروس قصيرة ومركزة وفيها تطبيقات عملية ساعدتني كثيراً في مسيرتي المهنية."
                </p>
                <div className="flex items-center gap-1 justify-end">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={24} className="fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              </div>
            </div>

            <div className="w-full md:w-48 lg:w-64 relative overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=1000" 
                alt="Sara Al-Khalidi" 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-50 via-transparent to-transparent hidden md:block"></div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-slate-50 rounded-[4rem] overflow-hidden shadow-2xl flex flex-col md:flex-row items-stretch border-8 border-white group hover:shadow-blue-100 transition-all duration-500"
          >
            <div className="flex-1 p-12 text-right relative">
              <div className="absolute top-10 right-10 text-blue-100/50">
                <Quote size={80} />
              </div>
              <div className="relative z-10">
                <div className="mb-8">
                  <p className="text-lg text-blue-600 font-bold mb-2">طالب في المرحلة الثانوية</p>
                  <h3 className="text-4xl font-bold mb-4 text-gray-900 tracking-tighter">أحمد المنصور</h3>
                </div>
                <p className="text-xl text-gray-600 leading-relaxed font-medium mb-10">
                  "المنصة غيرت طريقتي في الدراسة تماماً. الشرح مبسط والمحتوى تفاعلي جداً. بفضل الله ثم المنصة، حصلت على درجات ممتازة في جميع المواد."
                </p>
                <div className="flex items-center gap-1 justify-end">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={24} className="fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              </div>
            </div>

            <div className="w-full md:w-48 lg:w-64 relative overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=1000" 
                alt="Ahmed Al-Mansour" 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-50 via-transparent to-transparent hidden md:block"></div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
